// @ts-nocheck

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import {
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Select,
  useToast,
  Button,
  Card,
  CardBody,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { Activity } from "lucide-react";
import { io } from "socket.io-client";

const MachineStatus: React.FC = () => {
  const toast = useToast();
  const [machineData, setMachineData] = useState<any[]>([]);
  const [rawPlcRows, setRawPlcRows] = useState<any[]>([]);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedProtocol, setSelectedProtocol] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
    const [assignmentsMap, setAssignmentsMap] = useState<any>({});
  const [productsByResource, setProductsByResource] = useState<any>({});
  const [resourceIdToName, setResourceIdToName] = useState<any>({});
  const [supervisorResources, setSupervisorResources] = useState<string[]>([]); // Resource names assigned to supervisor
  const norm = (s: any) => String(s || "").trim().toLowerCase();
  const [cookies] = useCookies();
  const auth = useSelector((state: any) => state?.auth);

  const API_BASE_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://krishnalabels.rtpas.in/api || http://localhost:9023/api";

  const SOCKET_BASE_URL =
    process.env.REACT_APP_SOCKET_URL ||
    "https://kontrolix.rtpas.in|| https://krishnalabels.rtpas.in || http://localhost:9023";

  const BACKEND_API_BASE = API_BASE_URL.endsWith("/") ? API_BASE_URL : API_BASE_URL + "/";
  const machineApiUrl = BACKEND_API_BASE + "plc/all";
  const socketUrl = SOCKET_BASE_URL;

  // Store API summary data for statistics cards
  const [apiSummaryData, setApiSummaryData] = useState<any>(null);

  // Format duration in human-readable format (same as StoppageInfo)
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Helper function to calculate machine status based on data age and machine state
  const calculateMachineStatus = (item: any): string => {
    const timestamp = item.timestamp ? new Date(item.timestamp) : null;
    
    if (!timestamp) {
      return "stopped";
    }
    
    // Calculate age of data in seconds
    const ageSec = (Date.now() - timestamp.getTime()) / 1000;
    
    // If data is older than 30 seconds, status is stopped
    if (ageSec > 30) {
      return "stopped";
    }
    
    // If data is older than 20 seconds, status is idle
    if (ageSec > 20) {
      return "idle";
    }
    
    // Otherwise, calculate based on machine state
    const running = Boolean(item.plc_running) || item.motor_status === 1 || item.production_active === 1;
    const idleBase = Boolean(item.plc_running) && item.production_active === 0 && item.motor_status === 0;
    
    if (running) {
      return "running";
    } else if (idleBase) {
      return "idle";
    } else {
      return "stopped";
    }
  };

  // Transform PLC API array - Group by machine and get latest data per machine
  const transformMachineData = (rows: any[]) => {
    // Group by plc_brand only - one card per brand with latest data
    const machineMap = new Map<string, any>();

    rows.forEach((item: any) => {
      const machineKey = item.plc_brand; // Group by brand only
      const ts = item.timestamp ? new Date(item.timestamp) : new Date();

      // Only keep the latest data for each machine (brand)
      const existing = machineMap.get(machineKey);
      if (
        !existing ||
        new Date(item.timestamp) > new Date(existing.rawTimestamp)
      ) {
        // Calculate status based on current time (for real-time updates)
        const status = item.status || calculateMachineStatus(item);
        
        machineMap.set(machineKey, {
          machineKey,
          deviceId: item.plc_brand,
          plcBrand: item.plc_brand || "Unknown",
          plcModel: item.plc_model || "Unknown",
          plcProtocol: item.plc_protocol || "Unknown",
          timestamp: ts.toLocaleString(),
          rawTimestamp: item.timestamp,
          temperature: item.temperature ?? 0,
          pressure: item.pressure ?? 0,
          rpm: item.rpm ?? 0,
          productionCount: item.production_count ?? 0,
          motorStatus: item.motor_status ?? 0,
          productionActive: item.production_active ?? 0,
          plcRunning: item.plc_running ?? false,
          status: status,
          stopped_at: item.stopped_at || null,
          started_at: item.timestamp || null, // started_at is the timestamp when machine was running
        });
      }
    });

    // Convert to array and sort by latest timestamp (most recent first)
    let machinesArray = Array.from(machineMap.values()).sort(
      (a, b) =>
        new Date(b.rawTimestamp).getTime() - new Date(a.rawTimestamp).getTime()
    );

    // Recalculate status for all machines based on current time (for real-time updates)
    machinesArray = machinesArray.map((machine) => ({
      ...machine,
      status: calculateMachineStatus({
        timestamp: machine.rawTimestamp,
        plc_running: machine.plcRunning,
        motor_status: machine.motorStatus,
        production_active: machine.productionActive,
      }),
    }));

    const missing = (allBrands || []).filter((b) => !machineMap.has(b));
    missing.forEach((b) => {
      machinesArray.push({
        machineKey: b,
        deviceId: b,
        plcBrand: b,
        plcModel: "Unknown",
        plcProtocol: "Unknown",
        timestamp: "",
        rawTimestamp: 0,
        temperature: 0,
        pressure: 0,
        rpm: 0,
        productionCount: 0,
        motorStatus: 0,
        productionActive: 0,
        plcRunning: false,
        status: "stopped",
      });
    });

    return machinesArray;
  };

  // Build lightweight summary stats for the top cards
  const buildSummary = (data: any[]) => {
    const total_production = data.reduce(
      (sum, d) => sum + (d.productionCount || 0),
      0
    );
    const avg_temperature =
      data.length === 0
        ? 0
        : data.reduce((sum, d) => sum + (Number(d.temperature) || 0), 0) /
          data.length;
    const avg_pressure =
      data.length === 0
        ? 0
        : data.reduce((sum, d) => sum + (Number(d.pressure) || 0), 0) /
          data.length;
    const avg_rpm =
      data.length === 0
        ? 0
        : data.reduce((sum, d) => sum + (Number(d.rpm) || 0), 0) / data.length;
    const running_count = data.filter((d) => d.status === "running").length;
    const idle_count = data.filter((d) => d.status === "idle").length;
    const stopped_count = data.filter((d) => d.status === "stopped").length;
    const brands = Array.from(new Set(data.map((d) => d.plcBrand)));
    const protocols = Array.from(new Set(data.map((d) => d.plcProtocol)));

    return {
      total_production,
      avg_temperature,
      avg_pressure,
      avg_rpm,
      status_summary: {
        total_machines: data.length,
        running: running_count,
        idle: idle_count,
        stopped: stopped_count,
      },
      brands,
      protocols,
    };
  };

  const fetchMachineData = useCallback(
    async (machineKey: string = "all") => {
      setIsLoading(true);
      try {
        const response = await fetch(machineApiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch PLC data (status ${response.status})`);
        }

        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Unexpected response from PLC API");
        }

        setRawPlcRows(result.data);
        const transformedData = transformMachineData(result.data);
        setMachineData(transformedData);
        setApiSummaryData(buildSummary(transformedData));
        setLastUpdated(new Date());
      } catch (error: any) {
        console.error("Error fetching PLC data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch PLC data.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, machineApiUrl, cookies]
  );

  const fetchPlcBrands = useCallback(async () => {
    try {
      const resp = await fetch(BACKEND_API_BASE + "plc/brands", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });
      const json = await resp.json();
      const arr = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      setAllBrands(arr.filter((x) => typeof x === "string"));
    } catch (_) {}
  }, [BACKEND_API_BASE, cookies]);

  const fetchAssignments = useCallback(async () => {
    try {
      const resp = await fetch(
        (process.env.REACT_APP_BACKEND_URL || "http://localhost:9023/api/") +
          "resources/assignments/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const json = await resp.json();
      if (!json.success) return;
      const map: any = {};
      (json.assignments || []).forEach((a: any) => {
        const key = a?.resource?.name;
        const names = (a?.employees || []).map(
          (e: any) =>
            [e?.first_name, e?.last_name].filter(Boolean).join(" ") ||
            e?.email ||
            ""
        );
        if (key) map[key] = names;
      });
      setAssignmentsMap(map);
    } catch (_) {
    }
  }, [cookies]);

  const fetchResources = useCallback(async () => {
    try {
      const resp = await fetch(
        (process.env.REACT_APP_BACKEND_URL || "http://localhost:9023/api/") +
          "resources",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const json = await resp.json();
      const list = Array.isArray(json?.resources)
        ? json.resources
        : Array.isArray(json)
        ? json
        : [];
      const idMap: any = {};
      list.forEach((r: any) => {
        if (r?._id && r?.name) {
          idMap[r._id] = norm(r.name);
        }
      });
      setResourceIdToName(idMap);
    } catch (_) {}
  }, [cookies]);

  const fetchProductsAll = useCallback(async () => {
    try {
      if (!resourceIdToName || Object.keys(resourceIdToName).length === 0)
        return;
      const resp = await fetch(
        (process.env.REACT_APP_BACKEND_URL || "http://localhost:9023/api/") +
          "product/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const json = await resp.json();
      if (!json.success) return;
      const grouped: any = {};
      (json.products || []).forEach((p: any) => {
        let key;
        // Handle both populated resource object and ID string
        if (p?.resource && typeof p.resource === "object" && p.resource.name) {
          key = norm(p.resource.name);
        } else {
          const resId = p?.resource;
          key = resourceIdToName[resId];
        }

        if (!key) return;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p?.name);
      });
      setProductsByResource(grouped);
    } catch (_) {}
  }, [cookies, resourceIdToName]);

  // Fetch supervisor's assigned resources
  const fetchSupervisorResources = useCallback(async () => {
    try {
      if (!auth?.isSupervisor || !auth?.id) {
        setSupervisorResources([]);
        return;
      }
      
      const resp = await fetch(
        (process.env.REACT_APP_BACKEND_URL || "http://localhost:9023/api/") +
          `supervisor/${auth.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const json = await resp.json();
      if (json.success && json.supervisor?.role) {
        // Extract resource names from supervisor's role
        const resourceNames = (json.supervisor.role || []).map((r: any) => 
          norm(typeof r === 'object' && r.name ? r.name : r)
        ).filter(Boolean);
        setSupervisorResources(resourceNames);
      } else {
        setSupervisorResources([]);
      }
    } catch (error) {
      console.error("Error fetching supervisor resources:", error);
      setSupervisorResources([]);
    }
  }, [cookies, auth?.isSupervisor, auth?.id]);

  // Fetch supervisor resources only once when auth changes
  useEffect(() => {
    if (auth?.isSupervisor) {
      fetchSupervisorResources();
    } else {
      setSupervisorResources([]);
    }
  }, [auth?.isSupervisor, auth?.id, fetchSupervisorResources]);

  // Fetch machine data and other initial data
  useEffect(() => {
    fetchMachineData(selectedMachine);
    fetchAssignments();
    fetchResources();
    fetchPlcBrands();
  }, [selectedMachine, fetchMachineData, fetchAssignments, fetchResources, fetchPlcBrands]);
  
  useEffect(() => {
    if (Object.keys(resourceIdToName || {}).length > 0) {
      fetchProductsAll();
    }
  }, [resourceIdToName, fetchProductsAll]);

  const socketRef = useRef<any>(null);
  useEffect(() => {
    if (socketRef.current) return;
    const s = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: Infinity,
      withCredentials: true,
    });
    socketRef.current = s;
    s.on("connect", () => {
      setIsLive(true);
      setAutoRefresh(false);
      s.emit("subscribePlcData");
    });
    s.on("connect_error", () => {
      setIsLive(false);
      setAutoRefresh(true);
    });
    s.on("disconnect", () => {
      setIsLive(false);
    });
    s.on("plcDataUpdate", (doc: any) => {
      console.log("📨 Socket received plcDataUpdate:", doc);
      if (!doc || !doc.timestamp) {
        console.warn("⚠️ Invalid data received from socket:", doc);
        return;
      }
      
      setRawPlcRows((prev) => {
        // Remove old entries for the same machine (brand + model) to keep only latest
        const machineKey = `${doc.plc_brand}_${doc.plc_model}`;
        const filtered = prev.filter((item: any) => {
          if (!item || !item.plc_brand || !item.plc_model) return true;
          const itemMachineKey = `${item.plc_brand}_${item.plc_model}`;
          // Keep items from different machines, or if same machine but different timestamp
          return itemMachineKey !== machineKey || item.timestamp !== doc.timestamp;
        });
        
        // Add new data at the beginning
        const updated = [doc, ...filtered].slice(0, 5000);
        
        // Transform and update immediately
        const transformed = transformMachineData(updated);
        setMachineData(transformed);
        setApiSummaryData(buildSummary(transformed));
        setLastUpdated(new Date());
        
        console.log("✅ Updated machine data. Total machines:", transformed.length);
        return updated;
      });
    });
    return () => {
      setIsLive(false);
      if (socketRef.current) {
        socketRef.current.off("plcDataUpdate");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [socketUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      const transformed = transformMachineData(rawPlcRows);
      setMachineData(transformed);
      setApiSummaryData(buildSummary(transformed));
    }, 1000);
    return () => clearInterval(interval);
  }, [rawPlcRows]);
  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMachineData(selectedMachine);
      setLastUpdated(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedMachine, fetchMachineData]);

  // Filter data based on selections (memoized to prevent unnecessary recalculations)
  const filteredData = useMemo(() => {
    return machineData.filter((item) => {
      // If supervisor, only show machines matching their assigned resources
      if (auth?.isSupervisor && supervisorResources.length > 0) {
        const itemBrand = norm(item.plcBrand);
        if (!supervisorResources.includes(itemBrand)) {
          return false;
        }
      }
      
      if (selectedMachine !== "all" && item.machineKey !== selectedMachine)
        return false;
      if (selectedBrand !== "all" && item.plcBrand !== selectedBrand)
        return false;
      // Filter by production status
      if (selectedProtocol === "active" && item.productionActive !== 1)
        return false;
      if (selectedProtocol === "inactive" && item.productionActive !== 0)
        return false;
      if (selectedStatus !== "all" && item.status !== selectedStatus)
        return false;
      return true;
    });
  }, [machineData, auth?.isSupervisor, supervisorResources, selectedMachine, selectedBrand, selectedProtocol, selectedStatus]);

  // Prepare chart data
  const chartData = filteredData.map((item: any) => ({
    machine: item.deviceId,
    temperature: item.temperature,
    pressure: item.pressure,
    rpm: item.rpm,
    production: item.productionCount,
  }));

  // Chart data for started_at and stopped_at timeline
  const timelineChartData = React.useMemo(() => {
    const data = filteredData
      .filter((item: any) => item.rawTimestamp || item.stopped_at)
      .map((item: any) => {
        // started_at is the timestamp when machine was running
        const startedAt = item.rawTimestamp ? new Date(item.rawTimestamp).getTime() : null;
        const stoppedAt = item.stopped_at ? new Date(item.stopped_at).getTime() : null;
        
        // Format time for display (IST)
        const formatTime = (timestamp: number | null) => {
          if (!timestamp) return null;
          return new Date(timestamp).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
        };

        // Format time for display (UTC)
        const formatTimeUTC = (timestamp: number | null) => {
          if (!timestamp) return null;
          return new Date(timestamp).toLocaleString("en-US", {
            timeZone: "UTC",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }) + " UTC";
        };

        // Calculate relative time (minutes from now) for better visualization
        const now = Date.now();
        const startedAtRelative = startedAt ? Math.floor((now - startedAt) / (1000 * 60)) : null; // minutes ago
        const stoppedAtRelative = stoppedAt ? Math.floor((now - stoppedAt) / (1000 * 60)) : null; // minutes ago

        // Calculate duration: stopped_at - started_at (same logic as StoppageInfo)
        let started_at: string | null = null;
        let stopped_at: string | null = null;
        
        // Get started_at (when machine was running)
        if (item.status === "running") {
          started_at = item.rawTimestamp || null;
        } else {
          // For stopped machines, started_at would be when it was last running
          // We'll use rawTimestamp as started_at
          started_at = item.rawTimestamp || null;
        }
        
        // Get stopped_at (when machine stopped)
        if (item.status === "stopped" && item.stopped_at) {
          stopped_at = item.stopped_at;
        } else if (item.stopped_at) {
          stopped_at = item.stopped_at;
        }
        
        // Calculate duration in seconds (same as StoppageInfo)
        let durationSeconds: number | null = null;
        let durationDisplay: string = "-";
        
        if (started_at && stopped_at) {
          const startTime = new Date(started_at).getTime();
          const stopTime = new Date(stopped_at).getTime();
          // Duration = stopped_at - started_at
          const durationMs = stopTime - startTime;
          durationSeconds = Math.floor(durationMs / 1000); // duration in seconds
          
          if (durationSeconds > 0) {
            durationDisplay = formatDuration(durationSeconds);
          } else if (durationSeconds < 0) {
            // If negative, calculate absolute value
            durationDisplay = formatDuration(Math.abs(durationSeconds));
          }
        } else if (stopped_at && item.status === "stopped") {
          // If machine is currently stopped and we have stopped_at, calculate from stopped_at to now
          const stopTime = new Date(stopped_at).getTime();
          const durationMs = now - stopTime;
          durationSeconds = Math.floor(durationMs / 1000);
          if (durationSeconds > 0) {
            durationDisplay = formatDuration(durationSeconds);
          }
        }
        
        // Convert to minutes for chart display
        const durationMinutes = durationSeconds ? Math.floor(durationSeconds / 60) : null;

        return {
          machine: item.deviceId,
          started_at: startedAt,
          stopped_at: stoppedAt,
          started_at_display: formatTime(startedAt),
          stopped_at_display: formatTime(stoppedAt),
          started_at_utc: formatTimeUTC(startedAt),
          stopped_at_utc: formatTimeUTC(stoppedAt),
          started_at_minutes_ago: startedAtRelative,
          stopped_at_minutes_ago: stoppedAtRelative,
          duration_seconds: durationSeconds,
          duration_minutes: durationMinutes,
          duration_display: durationDisplay,
          status: item.status,
        };
      })
      .sort((a: any, b: any) => {
        // Sort by machine name
        return a.machine.localeCompare(b.machine);
      });

    return data;
  }, [filteredData]);

  // Get unique values for filters
  const brands =
    (allBrands && allBrands.length > 0
      ? allBrands
      : apiSummaryData?.brands ||
        Array.from(new Set(machineData.map((item: any) => item.plcBrand))));
  const protocols =
    apiSummaryData?.protocols ||
    Array.from(new Set(machineData.map((item: any) => item.plcProtocol)));
  const availableMachines = machineData.map((item: any) => ({
    key: item.machineKey,
    label: item.deviceId,
  }));

  // Get status color scheme
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "green";
      case "idle":
        return "yellow";
      case "stopped":
        return "red";
      case "maintenance":
        return "orange";
      default:
        return "gray";
    }
  };

  // Get status border color
  const getStatusBorderColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "green.400";
      case "idle":
        return "yellow.400";
      case "stopped":
        return "red.400";
      case "maintenance":
        return "orange.400";
      default:
        return "gray.400";
    }
  };

  // Get status gradient
  const getStatusGradient = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "linear(to-tr, white, green.50)";
      case "idle":
        return "linear(to-tr, white, yellow.50)";
      case "stopped":
        return "linear(to-tr, white, red.50)";
      case "maintenance":
        return "linear(to-tr, white, orange.50)";
      default:
        return "linear(to-tr, white, gray.50)";
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" color="gray.800" mb={2}>
              Machine Dashboard
            </Heading>
            <Text color="gray.600">
              Monitor real-time machine performance and status
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          </Box>
          <HStack spacing={3}>
            <HStack spacing={2}>
              <Badge colorScheme={isLive ? "green" : "red"} variant="solid">
                {isLive ? "LIVE" : "OFFLINE"}
              </Badge>
            </HStack>
          </HStack>
        </Flex>

        {/* Statistics Cards */}
        <HStack spacing={6} wrap="wrap">
          <Card
            flex="1"
            minW="200px"
            bgGradient="linear(to-br, blue.50, white)"
            borderColor="blue.100"
            variant="outline"
            _hover={{ transform: "translateY(-4px)" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Total Production</StatLabel>
                <StatNumber color="blue.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.total_production?.toLocaleString() || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {isLoading ? "Loading..." : "All Records"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            flex="1"
            minW="200px"
            bgGradient="linear(to-br, green.50, white)"
            borderColor="green.100"
            variant="outline"
          
            _hover={{ transform: "translateY(-4px)" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Avg Temperature</StatLabel>
                <StatNumber color="green.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.avg_temperature
                    ? parseFloat(apiSummaryData.avg_temperature).toFixed(1) +
                      "°C"
                    : "0°C"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {isLoading ? "Loading..." : "Overall Average"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            flex="1"
            minW="200px"
            bgGradient="linear(to-br, cyan.50, white)"
            borderColor="cyan.100"
            variant="outline"
            _hover={{ transform: "translateY(-4px)"}}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Avg Pressure</StatLabel>
                <StatNumber color="cyan.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.avg_pressure
                    ? parseFloat(apiSummaryData.avg_pressure).toFixed(1) +
                      " bar"
                    : "0 bar"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {isLoading ? "Loading..." : "Overall Average"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            flex="1"
            minW="200px"
            bgGradient="linear(to-br, purple.50, white)"
            borderColor="purple.100"
            variant="outline"
            _hover={{ transform: "translateY(-4px)"}}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Total Machines</StatLabel>
                <StatNumber color="purple.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.status_summary?.total_machines || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {isLoading ? "Loading..." : "Active Devices"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </HStack>

        {/* Additional Statistics Row */}
        <HStack spacing={6} wrap="wrap" mt={4}>
          <Card
            flex="1"
            minW="200px"
            bgGradient="linear(to-br, orange.50, white)"
            borderColor="orange.100"
            variant="outline"
            _hover={{ transform: "translateY(-4px)" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Avg RPM</StatLabel>
                <StatNumber color="orange.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.avg_rpm?.toFixed(0) || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {isLoading ? "Loading..." : "Overall Average"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            flex="1"
            minW="200px"
            bgGradient="linear(to-br, green.50, white)"
            borderColor="green.100"
            variant="outline"
            _hover={{ transform: "translateY(-4px)" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Running</StatLabel>
                <StatNumber color="green.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.status_summary?.running || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {isLoading ? "Loading..." : "Active Machines"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            flex="1"
            minW="200px"
            bgGradient="linear(to-br, yellow.50, white)"
            borderColor="yellow.100"
            variant="outline"
            _hover={{ transform: "translateY(-4px)" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Idle</StatLabel>
                <StatNumber color="yellow.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.status_summary?.idle || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {isLoading ? "Loading..." : "Idle Machines"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            flex="1"
            minW="200px"
            bgGradient="linear(to-br, red.50, white)"
            borderColor="red.100"
            variant="outline"
            _hover={{ transform: "translateY(-4px)" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Stopped</StatLabel>
                <StatNumber color="red.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.status_summary?.stopped || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {isLoading ? "Loading..." : "Stopped Machines"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </HStack>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              {/* <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Machine
                </Text>
                <Select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  size="sm"
                  w="180px"
                >
                  <option value="all">All Machines</option>
                  {availableMachines.map((machine: any) => (
                    <option key={machine.key} value={machine.key}>
                      {machine.label}
                    </option>
                  ))}
                </Select>
              </Box> */}

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Machine
                </Text>
                <Select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  size="sm"
                  w="150px"
                >
                  <option value="all">All Brands</option>
                  {brands.map((brand: string) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Production Status
                </Text>
                <Select
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value)}
                  size="sm"
                  w="150px"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Running Status
                </Text>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  size="sm"
                  w="150px"
                >
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="idle">Idle</option>
                  <option value="stopped">Stopped</option>
                </Select>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Charts */}
        <HStack spacing={6} align="stretch">
          {/* Production & Temperature Chart */}
          <Card flex="2">
            <CardBody>
              <Heading size="md" mb={4}>
                Machine Metrics
              </Heading>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="machine"
                      stroke="#718096"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#718096" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="production"
                      fill="#3182CE"
                      name="Production Count"
                    />
                    <Bar
                      dataKey="temperature"
                      fill="#E53E3E"
                      name="Temperature (°C)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          {/* RPM & Pressure Chart */}
          <Card flex="1">
            <CardBody>
              <Heading size="md" mb={4}>
                RPM & Pressure
              </Heading>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="machine" stroke="#718096" fontSize={12} />
                    <YAxis stroke="#718096" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rpm" fill="#38A169" name="RPM" />
                    <Bar
                      dataKey="pressure"
                      fill="#805AD5"
                      name="Pressure (bar)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </HStack>

        {/* Started At & Stopped At Timeline Chart */}
        {/* <Card mt={6}>
          <CardBody>
            <Heading size="md" mb={4}>
              Machine Start/Stop Timeline
            </Heading>
            <Box height="400px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="machine"
                    stroke="#718096"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#718096"
                    fontSize={12}
                    label={{ value: "Minutes Ago", angle: -90, position: "insideLeft" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#805AD5"
                    fontSize={12}
                    label={{ value: "Duration (Minutes)", angle: 90, position: "insideRight" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Box p={2} bg="white" borderRadius="md" boxShadow="md">
                            <Text fontWeight="bold" mb={2} fontSize="sm">
                              {data.machine}
                            </Text>
                            {data.started_at_utc && (
                              <Box mb={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                  Started At:
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                  {data.started_at_utc}
                                </Text>
                              </Box>
                            )}
                            {data.stopped_at_utc && (
                              <Box mb={1}>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                  Stopped At:
                                </Text>
                                <Text fontSize="xs" color="red.600">
                                  {data.stopped_at_utc}
                                </Text>
                              </Box>
                            )}
                            {data.duration_display && (
                              <Box>
                                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                  Duration:
                                </Text>
                                <Text fontSize="xs" color="purple.600">
                                  {data.duration_display}
                                </Text>
                              </Box>
                            )}
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="started_at_minutes_ago"
                    stroke="#38A169"
                    strokeWidth={3}
                    dot={{ fill: "#38A169", r: 5 }}
                    activeDot={{ r: 8 }}
                    name="Started At"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="stopped_at_minutes_ago"
                    stroke="#E53E3E"
                    strokeWidth={3}
                    dot={{ fill: "#E53E3E", r: 5 }}
                    activeDot={{ r: 8 }}
                    name="Stopped At"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="duration_minutes"
                    stroke="#805AD5"
                    strokeWidth={3}
                    dot={{ fill: "#805AD5", r: 5 }}
                    activeDot={{ r: 8 }}
                    name="Duration"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card> */}

        {/* Machine Performance Data Cards */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              PLC Machine Data (Latest per Machine)
            </Heading>
            {isLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {[1, 2, 3].map((i) => (
                  <Card key={i} variant="outline" size="sm">
                    <CardBody p={4}>
                      <Box>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="gray.300"
                          mb={3}
                        >
                          Loading...
                        </Text>
                        <SimpleGrid columns={2} spacing={3} mb={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.300" mb={1}>
                              Temperature
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="gray.300"
                            >
                              Loading...
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="gray.300" mb={1}>
                              Pressure
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="gray.300"
                            >
                              Loading...
                            </Text>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {filteredData.map((item: any, index: number) => {
                  // Check if data is older than 10 seconds
                  const ts = item.rawTimestamp ? new Date(item.rawTimestamp).getTime() : 0;
                  const ageSec = ts > 0 ? (Date.now() - ts) / 1000 : Infinity;
                  const isDataStale = ageSec > 10;
                  
                  // Override status if data is stale
                  const displayPlcRunning = isDataStale ? false : item.plcRunning;
                  const displayMotorStatus = isDataStale ? 0 : item.motorStatus;

                  return (
                  <Card
                    key={index}
                    variant="elevated"
                    size="sm"
                    borderLeftWidth="6px"
                    borderLeftColor={getStatusBorderColor(item.status)}
                  
                    _hover={{ transform: "translateY(-3px)" }}
                    transition="all 0.2s ease-in-out"
                  >
                    <CardBody p={4} bgGradient={getStatusGradient(item.status)}>
                      {/* Header with Device ID and Status */}
                      {/* Header with Device ID, PLC info and Status */}
                      <Flex justify="space-between" align="flex-start" mb={3}>
                        {/* Left: Device + PLC Info */}
                        <VStack align="start" spacing={0.5}>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="blue.700"
                          >
                            {item.deviceId}
                          </Text>

                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.600"
                          >
                            {item.plcModel}
                          </Text>
                          {Array.isArray(assignmentsMap[item.plcBrand]) &&
                            assignmentsMap[item.plcBrand].length > 0 && (
                              <HStack spacing={2} mt={1}>
                                <Badge colorScheme="blue" variant="subtle" size="sm">
                                  Assigned:
                                </Badge>
                                <Text fontSize="sm" color="gray.700">
                                  {assignmentsMap[item.plcBrand].join(", ")}
                                </Text>
                              </HStack>
                            )}
                          {Array.isArray(productsByResource[norm(item.plcBrand)]) &&
                            productsByResource[norm(item.plcBrand)].length > 0 && (
                              <HStack spacing={2} mt={1}>
                                <Badge colorScheme="purple" variant="subtle" size="sm">
                                  Product:
                                </Badge>
                                <Text fontSize="sm" color="gray.700">
                                  {productsByResource[norm(item.plcBrand)].join(", ")}
                                </Text>
                              </HStack>
                            )}
                        </VStack>

                        {/* Right: Status & Protocol */}
                        <VStack spacing={1} align="end">
                          <HStack spacing={2}>
                            <Box
                              w={2}
                              h={2}
                              borderRadius="full"
                              bg={getStatusBorderColor(item.status)}
                              animation={
                                item.status === "running"
                                  ? "pulse 2s infinite"
                                  : "none"
                              }
                            />
                            <Badge
                              colorScheme={getStatusColor(item.status)}
                              variant="solid"
                              size="sm"
                              borderRadius="full"
                              px={2}
                              textTransform="capitalize"
                            >
                              {item.status}
                            </Badge>
                          </HStack>

                          <Badge
                            colorScheme="purple"
                            variant="subtle"
                            size="sm"
                          >
                            {item.plcProtocol}
                          </Badge>
                        </VStack>
                      </Flex>

                      {/* Timestamp */}
                      <Box mb={3}>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Last Updated
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {item.timestamp}
                        </Text>
                      </Box>

                      {/* PLC Info */}
                      {/* <Box mb={3}>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          PLC Model
                        </Text>
                        <Badge
                          colorScheme="cyan"
                          variant="subtle"
                          fontSize="sm"
                        >
                          {item.plcBrand} {item.plcModel}
                        </Badge>
                      </Box> */}

                      {/* Performance Metrics */}
                      <SimpleGrid columns={2} spacing={3} mb={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Production Count
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="teal.600"
                          >
                            {item.productionCount}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            RPM
                          </Text>
                          <Badge
                            colorScheme="blue"
                            variant="solid"
                            fontSize="sm"
                            px={2}
                          >
                            {item.rpm}
                          </Badge>
                        </Box>
                      </SimpleGrid>

                      {/* Temperature & Pressure */}
                      <SimpleGrid columns={2} spacing={3} mb={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Temperature
                          </Text>
                          <Badge
                            colorScheme={
                              item.temperature >= 60
                                ? "red"
                                : item.temperature >= 45
                                ? "yellow"
                                : "green"
                            }
                            variant="solid"
                            fontSize="sm"
                            px={2}
                          >
                            {parseFloat(item.temperature || 0).toFixed(1)}°C
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Pressure
                          </Text>
                          <Badge
                            colorScheme="purple"
                            variant="solid"
                            fontSize="sm"
                            px={2}
                          >
                            {item.pressure} bar
                          </Badge>
                        </Box>
                      </SimpleGrid>

                      {/* Motor & Production Status */}
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={2}>
                          System Status
                        </Text>
                        <HStack spacing={4}>
                          <Box textAlign="center">
                            <Text fontSize="xs" color="gray.500">
                              Motor
                            </Text>
                            <Badge
                              colorScheme={
                                displayMotorStatus === 1 ? "green" : "red"
                              }
                              variant="solid"
                              size="sm"
                            >
                              {displayMotorStatus === 1 ? "ON" : "OFF"}
                            </Badge>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="xs" color="gray.500">
                              Production
                            </Text>
                            <Badge
                              colorScheme={
                                item.productionActive === 1 ? "green" : "red"
                              }
                              variant="solid"
                              size="sm"
                            >
                              {item.productionActive === 1
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="xs" color="gray.500">
                              PLC
                            </Text>
                            <Badge
                              colorScheme={displayPlcRunning ? "green" : "red"}
                              variant="solid"
                              size="sm"
                            >
                              {displayPlcRunning ? "Running" : "Stopped"}
                            </Badge>
                          </Box>
                        </HStack>
                      </Box>
                    </CardBody>
                  </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default MachineStatus;
