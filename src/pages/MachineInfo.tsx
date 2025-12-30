// @ts-nocheck

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import Pagination from "../pagination/Pagination";
import {
  Select,
  Spinner,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import {
  Calendar,
  RefreshCw,
  AlertTriangle,
  Filter,
  Cpu,
} from "lucide-react";
import { toast } from "react-toastify";
import { colors } from "../theme/colors";

interface PlcDataItem {
  _id: string;
  timestamp: string;
  plc_brand: string;
  plc_model: string;
  plc_protocol: string;
  plc_running: boolean;
  motor_status: number;
  production_active: number;
  temperature: number;
  pressure: number;
  rpm: number;
  production_count: number;
}

interface MachineInfo {
  machineKey: string;
  plcBrand: string;
  plcModel: string;
  plcProtocol: string;
  timestamp: string;
  rawTimestamp: string;
  temperature: number;
  pressure: number;
  rpm: number;
  productionCount: number;
  motorStatus: number;
  productionActive: number;
  plcRunning: boolean;
  status: string;
}

const MachineInfo: React.FC = () => {
  const [cookies] = useCookies();
  const auth = useSelector((state: any) => state?.auth);
  const [period, setPeriod] = useState<string>("weekly");
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [plcData, setPlcData] = useState<PlcDataItem[]>([]);
  const [availableMachines, setAvailableMachines] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [assignmentsMap, setAssignmentsMap] = useState<any>({});
  const [productsByResource, setProductsByResource] = useState<any>({});
  const [resourceIdToName, setResourceIdToName] = useState<any>({});
  const [supervisorResources, setSupervisorResources] = useState<string[]>([]);
  const LIMIT = 10;
  
  const norm = (s: any) => String(s || "").trim().toLowerCase();

  // Fetch available machines (brands)
  const fetchMachines = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}plc/brands`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAvailableMachines(result.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch machines:", error);
    }
  };

  // Fetch PLC data
  const fetchPlcData = async () => {
    setIsLoading(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}plc/all?period=${period}`;
      
      if (selectedMachine !== "all") {
        // Note: Backend expects machine filter by brand
        // We'll filter on frontend if needed
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      if (result.success) {
        setPlcData(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch machine data");
      setPlcData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
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
    } catch (_) {}
  };

  // Fetch resources
  const fetchResources = async () => {
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
  };

  // Fetch products
  const fetchProductsAll = async () => {
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
  };

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

  useEffect(() => {
    fetchMachines();
    fetchAssignments();
    fetchResources();
    if (auth?.isSupervisor) {
      fetchSupervisorResources();
    } else {
      setSupervisorResources([]);
    }
  }, [auth?.isSupervisor, auth?.id]);

  useEffect(() => {
    if (Object.keys(resourceIdToName || {}).length > 0) {
      fetchProductsAll();
    }
  }, [resourceIdToName]);

  useEffect(() => {
    fetchPlcData();
  }, [period, selectedMachine]);

  useEffect(() => {
    setPage(1);
  }, [period, selectedMachine]);

  // Filter PLC data based on supervisor resources
  const filteredPlcData = useMemo(() => {
    if (auth?.isSupervisor && supervisorResources.length > 0) {
      return plcData.filter((item) => {
        const itemBrand = norm(item.plc_brand);
        return supervisorResources.includes(itemBrand);
      });
    }
    return plcData;
  }, [plcData, auth?.isSupervisor, supervisorResources]);

  // Transform PLC data - Group by machine and get latest data per machine
  const machineInfoList = useMemo(() => {
    const machineMap = new Map<string, MachineInfo>();

    filteredPlcData.forEach((item) => {
      const machineKey = item.plc_brand;
      const ts = item.timestamp ? new Date(item.timestamp) : new Date();

      // Only keep the latest data for each machine (brand)
      const existing = machineMap.get(machineKey);
      if (
        !existing ||
        new Date(item.timestamp) > new Date(existing.rawTimestamp)
      ) {
        const running =
          Boolean(item.plc_running) ||
          item.motor_status === 1 ||
          item.production_active === 1;
        const idleBase =
          Boolean(item.plc_running) &&
          item.production_active === 0 &&
          item.motor_status === 0;
        const tsTime = ts.getTime();
        const ageSec = (Date.now() - tsTime) / 1000;
        
        let status = running ? "running" : idleBase ? "idle" : "stopped";
        if (ageSec > 30) status = "stopped";
        else if (ageSec > 20) status = "idle";

        machineMap.set(machineKey, {
          machineKey,
          plcBrand: item.plc_brand || "Unknown",
          plcModel: item.plc_model || "Unknown",
          plcProtocol: item.plc_protocol || "Unknown",
          timestamp: ts.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          rawTimestamp: item.timestamp,
          temperature: item.temperature ?? 0,
          pressure: item.pressure ?? 0,
          rpm: item.rpm ?? 0,
          productionCount: item.production_count ?? 0,
          motorStatus: item.motor_status ?? 0,
          productionActive: item.production_active ?? 0,
          plcRunning: item.plc_running ?? false,
          status,
        });
      }
    });

    // Add missing machines (filter by supervisor resources if supervisor)
    let machinesToCheck = availableMachines;
    if (auth?.isSupervisor && supervisorResources.length > 0) {
      machinesToCheck = availableMachines.filter((b) => 
        supervisorResources.includes(norm(b))
      );
    }
    const missing = machinesToCheck.filter((b) => !machineMap.has(b));
    missing.forEach((b) => {
      machineMap.set(b, {
        machineKey: b,
        plcBrand: b,
        plcModel: "Unknown",
        plcProtocol: "Unknown",
        timestamp: "No data",
        rawTimestamp: "",
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

    return Array.from(machineMap.values()).sort((a, b) =>
      a.plcBrand.localeCompare(b.plcBrand)
    );
  }, [filteredPlcData, availableMachines, auth?.isSupervisor, supervisorResources]);

  // Filter machines based on selection
  const displayedMachines = useMemo(() => {
    if (selectedMachine === "all") {
      return machineInfoList;
    }
    return machineInfoList.filter((m) => m.plcBrand === selectedMachine);
  }, [machineInfoList, selectedMachine]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;
    return displayedMachines.slice(startIndex, endIndex);
  }, [displayedMachines, page]);

  const hasNextPage = page * LIMIT < displayedMachines.length;

  const periodOptions = [
    { value: "daily", label: "Today" },
    { value: "weekly", label: "Last 7 Days" },
    { value: "monthly", label: "Last 30 Days" },
  ];

  return (
    <div
      className="min-h-screen p-4 lg:p-6"
      style={{ backgroundColor: colors.background.page }}
    >
      {/* Header Section */}
      <div
        className="rounded-xl shadow-sm border p-6 mb-6"
        style={{
          backgroundColor: colors.background.card,
          borderColor: colors.border.light,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Cpu className="text-white" size={28} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Machine Information
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.secondary }}
              >
                View detailed information about your machines
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} style={{ color: colors.text.secondary }} />
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                size="sm"
                borderRadius="lg"
                borderColor={colors.border.light}
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
                minW="140px"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} style={{ color: colors.text.secondary }} />
              <Select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                size="sm"
                borderRadius="lg"
                borderColor={colors.border.light}
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
                minW="150px"
              >
                <option value="all">All Machines</option>
                {availableMachines.map((machine) => (
                  <option key={machine} value={machine}>
                    {machine}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              leftIcon={<RefreshCw size={16} />}
              onClick={fetchPlcData}
              isLoading={isLoading}
              size="sm"
              variant="outline"
              borderColor={colors.border.medium}
              _hover={{ bg: colors.gray[50] }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Machine Info Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="xl" color="blue.500" mb={4} />
            <p style={{ color: colors.text.secondary }}>
              Loading machine data...
            </p>
          </div>
        </div>
      ) : displayedMachines.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <AlertTriangle
            size={48}
            className="mx-auto mb-4"
            style={{ color: colors.warning[500] }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No Data Available 
          </h3>
          <p style={{ color: colors.text.secondary }}>
            No machine information found for the selected period. Try changing the time
            range.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div
            className="p-5 border-b"
            style={{ borderColor: colors.border.light }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              Machine Information
            </h3>
          </div>
          <TableContainer maxH="400px" overflowY="auto">
            <Table variant="simple" size="sm">
              <Thead
                position="sticky"
                top={0}
                bg={colors.table.header}
                zIndex={1}
              >
                <Tr>
                  <Th></Th>
                  <Th color={colors.table.headerText}>Brand</Th>
                  <Th color={colors.table.headerText}>Model</Th>
                  <Th color={colors.table.headerText}>Protocol</Th>
                  <Th color={colors.table.headerText}>Status</Th>
                  <Th color={colors.table.headerText}>PLC Status</Th>
                  <Th color={colors.table.headerText}>Motor</Th>
                  <Th color={colors.table.headerText}>Assigned</Th>
                  <Th color={colors.table.headerText}>Product</Th>
                  <Th color={colors.table.headerText} isNumeric>
                    Temp (°C)
                  </Th>
                  <Th color={colors.table.headerText} isNumeric>
                    Pressure
                  </Th>
                  <Th color={colors.table.headerText} isNumeric>
                    RPM
                  </Th>
                  <Th color={colors.table.headerText} isNumeric>
                    Production
                  </Th>
                  <Th color={colors.table.headerText}>Last Updated</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedData.map((machine, index) => {
                  // Check if data is older than 10 seconds
                  const isDataStale = machine.rawTimestamp
                    ? (Date.now() - new Date(machine.rawTimestamp).getTime()) / 1000 > 10
                    : true;
                  
                  // Override status if data is stale
                  const displayPlcRunning = isDataStale ? false : machine.plcRunning;
                  const displayMotorStatus = isDataStale ? 0 : machine.motorStatus;

                  return (
                    <Tr
                      key={machine.machineKey || index}
                      _hover={{ bg: colors.table.hover }}
                    >
                      <Td></Td>
                      <Td>
                        <p fontSize="xs">{machine.plcBrand}</p>
                      </Td>
                      <Td fontSize="sm">{machine.plcModel}</Td>
                      <Td fontSize="xs" style={{ color: colors.text.secondary }}>
                        {machine.plcProtocol}
                      </Td>
                      <Td>
                        <p fontSize="xs">
                          {machine.status === "running"
                            ? "Running"
                            : machine.status === "idle"
                            ? "Idle"
                            : "Stopped"}
                        </p>
                      </Td>
                      <Td>
                        <p
                          fontSize="xs"
                          
                        >
                          {displayPlcRunning ? "Running" : "Stopped"}
                        </p>
                      </Td>
                      <Td>
                        <p
                          fontSize="xs"
                          
                        >
                          {displayMotorStatus === 1 ? "Active" : "Inactive"}
                        </p>
                      </Td>
                      <Td fontSize="xs">
                        {Array.isArray(assignmentsMap[machine.plcBrand]) &&
                        assignmentsMap[machine.plcBrand].length > 0
                          ? assignmentsMap[machine.plcBrand].join(", ")
                          : "-"}
                      </Td>
                      <Td fontSize="xs">
                        {Array.isArray(productsByResource[norm(machine.plcBrand)]) &&
                        productsByResource[norm(machine.plcBrand)].length > 0
                          ? productsByResource[norm(machine.plcBrand)].join(", ")
                          : "-"}
                      </Td>
                      <Td isNumeric fontSize="sm">
                        {machine.temperature?.toFixed(1) || "-"}
                      </Td>
                      <Td isNumeric fontSize="sm">
                        {machine.pressure?.toFixed(1) || "-"}
                      </Td>
                      <Td isNumeric fontSize="sm">
                        {machine.rpm || "-"}
                      </Td>
                      <Td isNumeric fontSize="sm" fontWeight="medium">
                        {machine.productionCount?.toLocaleString() || "-"}
                      </Td>
                      <Td fontSize="xs" style={{ color: colors.text.secondary }}>
                        {machine.timestamp}
                      </Td>
                      <Td></Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          <Pagination
            page={page}
            setPage={setPage}
            hasNextpage={hasNextPage}
          />
        </div>
      )}
    </div>
  );
};

export default MachineInfo;