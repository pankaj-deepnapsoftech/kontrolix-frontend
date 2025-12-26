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
  Clock,
  TrendingDown,
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
}

const StoppageInfo: React.FC = () => {
  const [cookies] = useCookies();
  const [period, setPeriod] = useState<string>("weekly");
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [availableMachines, setAvailableMachines] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

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

  // Fetch status logs
  const fetchStatusLogs = async () => {
    setIsLoading(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}plc/status-logs?period=${period}&limit=2000`;
      
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

  useEffect(() => {
    fetchMachines();
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

  // Process status logs to calculate stoppage events and durations
  const stoppageEvents = useMemo(() => {
    const stoppages: StoppageEvent[] = [];
    const machineStoppageMap = new Map<string, { startLog: StatusLog; startTime: Date }>();

    // Sort logs by timestamp (oldest first) to process chronologically
    const sortedLogs = [...statusLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedLogs.forEach((log) => {
      // Process both "status" (calculated status including data age) and "plc_running" (legacy) status changes
      // Prioritize "status" type as it includes data age-based stoppages (10s idle, 20s stopped)
      if (log.status_type !== "status" && log.status_type !== "plc_running") return;

      const machineKey = log.machine_key || `${log.plc_brand}_${log.plc_model}`;
      const logTime = new Date(log.timestamp);

      if (log.event_type === "stopped") {
        // Machine stopped - record the start of stoppage
        machineStoppageMap.set(machineKey, {
          startLog: log,
          startTime: logTime,
        });
      } else if (log.event_type === "started") {
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
    return stoppages.sort(
      (a, b) => new Date(b.stoppage_start).getTime() - new Date(a.stoppage_start).getTime()
    );
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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStoppages = filteredStoppages.length;
    const ongoingStoppages = filteredStoppages.filter((s) => s.is_ongoing).length;
    const totalDowntime = filteredStoppages.reduce(
      (sum, s) => sum + (s.duration_seconds || 0),
      0
    );
    const avgDuration =
      totalStoppages > 0 ? Math.floor(totalDowntime / totalStoppages) : 0;

    return {
      totalStoppages,
      ongoingStoppages,
      totalDowntime: formatDuration(totalDowntime),
      avgDuration: formatDuration(avgDuration),
    };
  }, [filteredStoppages]);

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
              onClick={fetchStatusLogs}
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className="p-5 rounded-xl border"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Total Stoppages
            </p>
            <TrendingDown size={18} style={{ color: colors.error[500] }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {stats.totalStoppages}
          </p>
        </div>

        <div
          className="p-5 rounded-xl border"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Ongoing
            </p>
            <AlertTriangle size={18} style={{ color: colors.warning[500] }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.warning[600] }}
          >
            {stats.ongoingStoppages}
          </p>
        </div>

        <div
          className="p-5 rounded-xl border"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Total Downtime
            </p>
            <Clock size={18} style={{ color: colors.error[500] }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.error[600] }}
          >
            {stats.totalDowntime}
          </p>
        </div>

        <div
          className="p-5 rounded-xl border"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Avg Duration
            </p>
            <Clock size={18} style={{ color: colors.text.secondary }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {stats.avgDuration}
          </p>
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
            No machine stoppages found for the selected period. All machines are running smoothly.
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
                  <Th color={colors.table.headerText}>Stopped At</Th>
                  <Th color={colors.table.headerText}>Started At</Th>
                  <Th color={colors.table.headerText}>Duration</Th>
                  <Th color={colors.table.headerText}>Status</Th>
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
                        <p className="font-medium text-sm" style={{ color: colors.text.primary }}>
                          {stoppage.plc_brand}
                        </p>
                        <p className="text-xs" style={{ color: colors.text.muted }}>
                          {stoppage.plc_model}
                        </p>
                      </div>
                    </Td>
                    <Td fontSize="xs">
                      {new Date(stoppage.stoppage_start).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </Td>
                    <Td fontSize="xs">
                      {stoppage.stoppage_end
                        ? new Date(stoppage.stoppage_end).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "-"}
                    </Td>
                    <Td>
                      <p
                        fontSize="sm"
                        className="font-medium"
                        style={{
                          color: stoppage.is_ongoing
                            ? colors.warning[600]
                            : colors.text.primary,
                        }}
                      >
                        {stoppage.duration_display || "-"}
                      </p>
                    </Td>
                    <Td>
                      <p
                        fontSize="xs"
                        className="px-2 py-1 rounded inline-block"
                        style={{
                          backgroundColor: stoppage.is_ongoing
                            ? colors.warning[50]
                            : colors.gray[50],
                          color: stoppage.is_ongoing
                            ? colors.warning[700]
                            : colors.text.secondary,
                        }}
                      >
                        {stoppage.is_ongoing ? "Ongoing" : "Resolved"}
                      </p>
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

export default StoppageInfo;