// @ts-nocheck

import React, { useState, useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
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
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { colors } from "../theme/colors";

interface StatusLog {
  _id?: string;
  machine_key: string;
  machine_name: string;
  plc_brand: string;
  plc_model: string;
  timestamp: string;
  event_type: string;
  status_type: string;
  previous_status: string;
  current_status: string;
  temperature?: number;
  pressure?: number;
  rpm?: number;
  production_count?: number;
}

interface StoppageEvent {
  machine_key: string;
  machine_name: string;
  plc_brand: string;
  plc_model: string;
  stoppage_start: string;
  stoppage_end?: string;
  duration_seconds?: number;
  duration_display?: string;
  is_ongoing: boolean;
  temperature?: number;
  pressure?: number;
  rpm?: number;
  production_count?: number;
  current_status?: string;
  stopped_at?: string;
  timestamp?: string;
}

const StoppageInfo: React.FC = () => {
  const [cookies] = useCookies();
  const [period, setPeriod] = useState<string>("weekly");
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [availableMachines, setAvailableMachines] = useState<string[]>([]);
  const [currentMachineStatus, setCurrentMachineStatus] = useState<Record<string, { status: string; stopped_at: string | null; timestamp: string }>>({});
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  // Fetch available machines (brands)
  const fetchMachines = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:9023/api/";
      const response = await fetch(
        `${baseUrl}plc/brands`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch machines: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setAvailableMachines(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch machines");
      }
    } catch (error: any) {
      console.error("Failed to fetch machines:", error);
      toast.error(error.message || "Failed to fetch machines. Please check your connection.");
    }
  };

  // Fetch status logs
  const fetchStatusLogs = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:9023/api/";
      let url = `${baseUrl}plc/status-logs?period=${period}&limit=5000`;
      
      if (selectedMachine !== "all") {
        url += `&machine=${selectedMachine}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch status logs");
      }

      const result = await response.json();
      if (result.success) {
        console.log(`Fetched ${result.data?.length || 0} status logs (total_changes: ${result.total_changes || 0})`);
        setStatusLogs(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch status logs");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch stoppage data");
      setStatusLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current machine status from /api/plc/all
  const fetchCurrentMachineStatus = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:9023/api/";
      const response = await fetch(
        `${baseUrl}plc/all?limit=1000`,
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
        if (result.success && Array.isArray(result.data)) {
          // Create a map of machine_key -> { status, stopped_at, timestamp }
          const statusMap: Record<string, { status: string; stopped_at: string | null; timestamp: string }> = {};
          result.data.forEach((item: any) => {
            const machineKey = `${item.plc_brand}_${item.plc_model}`;
            statusMap[machineKey] = {
              status: item.status || "unknown",
              stopped_at: item.stopped_at || null,
              timestamp: item.timestamp || "",
            };
          });
          setCurrentMachineStatus(statusMap);
        }
      }
    } catch (error) {
      console.error("Failed to fetch current machine status:", error);
    }
  };

  useEffect(() => {
    fetchMachines();
    fetchCurrentMachineStatus();
  }, []);

  useEffect(() => {
    fetchStatusLogs();
  }, [period, selectedMachine]);

  useEffect(() => {
    setPage(1);
  }, [period, selectedMachine]);

  // Format duration in human-readable format
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

  // Format date to UTC timezone (12-hour format)
  const formatToIST = (dateString: string | Date): string => {
    if (!dateString) return "-";
    
    // Parse date - new Date() correctly handles UTC strings ending with Z
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }
    
    // Convert to UTC and format (12-hour format)
    return date.toLocaleString("en-IN", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Process status logs to calculate stoppage events and durations
  const stoppageEvents = useMemo(() => {
    const stoppages: StoppageEvent[] = [];
    const machineStoppageMap = new Map<string, { startLog: StatusLog; startTime: Date }>();

    // Sort logs by timestamp (oldest first) to process chronologically
    const sortedLogs = [...statusLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedLogs.forEach((log) => {
      const machineKey = log.machine_key || `${log.plc_brand}_${log.plc_model}`;
      const logTime = new Date(log.timestamp);

      // Determine if this log represents a stoppage start or end
      // Check both event_type and status changes to catch all stoppage events
      const eventType = (log.event_type || "").toLowerCase();
      const currentStatus = (log.current_status || "").toLowerCase();
      const previousStatus = (log.previous_status || "").toLowerCase();
      const statusType = log.status_type || "";

      let isStoppageStart = false;
      let isStoppageEnd = false;

      // Stoppage start: machine transitions to stopped state
      if (
        eventType === "stopped" ||
        eventType === "motor_stopped" ||
        (statusType === "initial" && currentStatus === "stopped") ||
        (statusType === "status" && currentStatus === "stopped" && previousStatus !== "stopped" && previousStatus !== "unknown")
      ) {
        isStoppageStart = true;
      }

      // Stoppage end: machine transitions from stopped to running/idle
      // Skip initial "started" events as they don't end existing stoppages
      if (
        (eventType === "started" && statusType !== "initial") ||
        eventType === "motor_started" ||
        (statusType === "status" && currentStatus !== "stopped" && previousStatus === "stopped")
      ) {
        isStoppageEnd = true;
      }

      if (isStoppageStart) {
        // Machine stopped - record the start of stoppage
        // If there's already an ongoing stoppage, close it first (edge case: multiple stop events)
        const existingStoppage = machineStoppageMap.get(machineKey);
        if (existingStoppage) {
          // Close the previous stoppage if a new one starts immediately
          const durationMs = logTime.getTime() - existingStoppage.startTime.getTime();
          const durationSec = Math.floor(durationMs / 1000);
          
          // Only add if duration is meaningful (more than 0 seconds)
          if (durationSec > 0) {
            stoppages.push({
              machine_key: machineKey,
              machine_name: existingStoppage.startLog.machine_name || `${existingStoppage.startLog.plc_brand} ${existingStoppage.startLog.plc_model}`,
              plc_brand: existingStoppage.startLog.plc_brand,
              plc_model: existingStoppage.startLog.plc_model,
              stoppage_start: existingStoppage.startLog.timestamp,
              stoppage_end: log.timestamp,
              duration_seconds: durationSec,
              duration_display: formatDuration(durationSec),
              is_ongoing: false,
              temperature: existingStoppage.startLog.temperature,
              pressure: existingStoppage.startLog.pressure,
              rpm: existingStoppage.startLog.rpm,
              production_count: existingStoppage.startLog.production_count,
            });
          }
        }
        
        // Record the new stoppage start
        machineStoppageMap.set(machineKey, {
          startLog: log,
          startTime: logTime,
        });
      } else if (isStoppageEnd) {
        // Machine started - check if there was an ongoing stoppage
        const ongoingStoppage = machineStoppageMap.get(machineKey);
        if (ongoingStoppage) {
          const durationMs = logTime.getTime() - ongoingStoppage.startTime.getTime();
          const durationSec = Math.floor(durationMs / 1000);

          stoppages.push({
            machine_key: machineKey,
            machine_name: log.machine_name || `${log.plc_brand} ${log.plc_model}`,
            plc_brand: log.plc_brand,
            plc_model: log.plc_model,
            stoppage_start: ongoingStoppage.startLog.timestamp,
            stoppage_end: log.timestamp,
            duration_seconds: durationSec,
            duration_display: formatDuration(durationSec),
            is_ongoing: false,
            temperature: ongoingStoppage.startLog.temperature,
            pressure: ongoingStoppage.startLog.pressure,
            rpm: ongoingStoppage.startLog.rpm,
            production_count: ongoingStoppage.startLog.production_count,
          });

          machineStoppageMap.delete(machineKey);
        }
      }
    });

    // Add ongoing stoppages (machines that stopped but haven't started again)
    machineStoppageMap.forEach((stoppage, machineKey) => {
      const durationMs = Date.now() - stoppage.startTime.getTime();
      const durationSec = Math.floor(durationMs / 1000);

      stoppages.push({
        machine_key: machineKey,
        machine_name: stoppage.startLog.machine_name || `${stoppage.startLog.plc_brand} ${stoppage.startLog.plc_model}`,
        plc_brand: stoppage.startLog.plc_brand,
        plc_model: stoppage.startLog.plc_model,
        stoppage_start: stoppage.startLog.timestamp,
        stoppage_end: undefined,
        duration_seconds: durationSec,
        duration_display: formatDuration(durationSec),
        is_ongoing: true,
        temperature: stoppage.startLog.temperature,
        pressure: stoppage.startLog.pressure,
        rpm: stoppage.startLog.rpm,
        production_count: stoppage.startLog.production_count,
      });
    });

    // Sort by stoppage start time (most recent first)
    const sortedStoppages = stoppages.sort(
      (a, b) => new Date(b.stoppage_start).getTime() - new Date(a.stoppage_start).getTime()
    );
    
    console.log(`Processed ${statusLogs.length} status logs into ${sortedStoppages.length} stoppage events`);
    
    return sortedStoppages;
  }, [statusLogs]);

  // Filter stoppages by machine
  const filteredStoppages = useMemo(() => {
    if (selectedMachine === "all") {
      return stoppageEvents;
    }
    return stoppageEvents.filter((s) => s.plc_brand === selectedMachine);
  }, [stoppageEvents, selectedMachine]);

  // Pagination
  const paginatedStoppages = useMemo(() => {
    const startIndex = (page - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;
    return filteredStoppages.slice(startIndex, endIndex);
  }, [filteredStoppages, page]);

  const hasNextPage = page * LIMIT < filteredStoppages.length;

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
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <AlertCircle className="text-white" size={28} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Machine Stoppage Information
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.secondary }}
              >
                Track machine stoppages, durations, and downtime analysis
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
              onClick={() => {
                fetchStatusLogs();
                fetchCurrentMachineStatus();
              }}
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

      {/* Stoppage Events Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="xl" color="blue.500" mb={4} />
            <p style={{ color: colors.text.secondary }}>
              Loading stoppage data...
            </p>
          </div>
        </div>
      ) : filteredStoppages.length === 0 ? (
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
            No Stoppages Found
          </h3>
          <p style={{ color: colors.text.secondary }}>
            No machine stoppages found for the selected period. All machines are
            running smoothly.
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
              Stoppage Events ({filteredStoppages.length} total)
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
                  <Th color={colors.table.headerText}>Machine</Th>
                  <Th color={colors.table.headerText}>Started At</Th>
                  <Th color={colors.table.headerText}>Stopped At</Th>
                  <Th color={colors.table.headerText} isNumeric>Duration</Th>
                  <Th color={colors.table.headerText} isNumeric>
                    Temp (°C)
                  </Th>
                  <Th color={colors.table.headerText} isNumeric>
                    Pressure
                  </Th>
                  <Th color={colors.table.headerText} isNumeric>
                    Production Count
                  </Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedStoppages.map((stoppage, index) => (
                  <Tr
                    key={`${stoppage.machine_key}_${stoppage.stoppage_start}_${index}`}
                    _hover={{ bg: colors.table.hover }}
                  >
                    <Td></Td>
                    <Td>
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {stoppage.plc_brand}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.text.muted }}
                        >
                          {stoppage.plc_model}
                        </p>
                      </div>
                    </Td>

                    <Td fontSize="xs">
                      {(() => {
                        const machineKey = stoppage.machine_key;
                        const currentStatus = currentMachineStatus[machineKey];

                        // If machine is currently running, show timestamp from current status
                        if (
                          currentStatus &&
                          currentStatus.status === "running"
                        ) {
                          return currentStatus.timestamp
                            ? formatToIST(currentStatus.timestamp)
                            : "-";
                        }

                        // Otherwise show stoppage_end (when stoppage ended)
                        return stoppage.stoppage_end
                          ? formatToIST(stoppage.stoppage_end)
                          : "-";
                      })()}
                    </Td>
                    <Td fontSize="xs">
                      {formatToIST(stoppage.stoppage_start)}
                    </Td>
                    <Td isNumeric fontSize="sm" fontWeight="medium">
                      {(() => {
                        const machineKey = stoppage.machine_key;
                        const currentStatus = currentMachineStatus[machineKey];
                        
                        // Get started_at (same as "Started At" column)
                        let started_at: string | null = null;
                        if (currentStatus && currentStatus.status === "running") {
                          started_at = currentStatus.timestamp || null;
                        } else {
                          started_at = stoppage.stoppage_end || null;
                        }
                        
                        // Get stopped_at (same as "Stopped At" column)
                        let stopped_at: string | null = null;
                        if (currentStatus && currentStatus.status === "stopped" && currentStatus.stopped_at) {
                          stopped_at = currentStatus.stopped_at;
                        } else {
                          stopped_at = stoppage.stoppage_start;
                        }
                        
                        // Calculate duration: stopped_at - started_at
                        if (started_at && stopped_at) {
                          const startTime = new Date(started_at).getTime();
                          const stopTime = new Date(stopped_at).getTime();
                          // Duration = stopped_at - started_at
                          const durationMs = stopTime - startTime;
                          const durationSec = Math.floor(durationMs / 1000);
                          
                          if (durationSec > 0) {
                            return formatDuration(durationSec);
                          } else if (durationSec < 0) {
                            // If negative, calculate absolute value
                            return formatDuration(Math.abs(durationSec));
                          }
                        }
                        
                        // For ongoing stoppages, use calculated duration
                        if (stoppage.is_ongoing && stoppage.duration_display) {
                          return stoppage.duration_display;
                        }
                        
                        // Use existing duration if available
                        if (stoppage.duration_display) {
                          return stoppage.duration_display;
                        }
                        
                        return "-";
                      })()}
                    </Td>
                    <Td isNumeric fontSize="sm">
                      {stoppage.temperature?.toFixed(1) || "-"}
                    </Td>
                    <Td isNumeric fontSize="sm">
                      {stoppage.pressure?.toFixed(1) || "-"}
                    </Td>
                    <Td isNumeric fontSize="sm" fontWeight="medium">
                      {stoppage.production_count?.toLocaleString() || "-"}
                    </Td>
                    <Td></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Pagination page={page} setPage={setPage} hasNextpage={hasNextPage} />
        </div>
      )}
    </div>
  );
};

export default StoppageInfo;