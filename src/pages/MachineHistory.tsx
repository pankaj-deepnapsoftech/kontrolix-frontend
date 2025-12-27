// @ts-nocheck

import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import Pagination from "../pagination/Pagination";
import {
  Box,
  Select,
  Spinner,
  Badge,
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Thermometer,
  Gauge,
  RotateCw,
  Package,
  Cpu,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color,
  bgColor,
}) => (
  <div
    className="p-5 rounded-xl border transition-all duration-300 hover:shadow-lg"
    style={{
      backgroundColor: colors.background.card,
      borderColor: colors.border.light,
    }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: colors.text.secondary }}
        >
          {title}
        </p>
        <h3
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          {value}
        </h3>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {trend >= 0 ? (
              <TrendingUp size={14} className="text-green-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? "+" : ""}
              {trend}%
            </span>
            {trendLabel && (
              <span className="text-xs" style={{ color: colors.text.muted }}>
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: bgColor }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
  </div>
);

const MachineHistory: React.FC = () => {
  const [cookies] = useCookies();
  const [period, setPeriod] = useState<string>("weekly");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [plcData, setPlcData] = useState<PlcDataItem[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [assignmentsMap, setAssignmentsMap] = useState<any>({});
  const [productsByResource, setProductsByResource] = useState<any>({});
  const [resourceIdToName, setResourceIdToName] = useState<any>({});
  const LIMIT = 10;
  
  const norm = (s: any) => String(s || "").trim().toLowerCase();


  const fetchPlcData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}plc/all?period=${period}&page=${page}&limit=${LIMIT}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      if (result.success) {
        setPlcData(result.data || []);
        setTotalCount(result.total || 0);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch machine data");
      setPlcData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Export data
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}plc/download?period=${period}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      // Check if response is OK
      if (!response.ok) {
        // Try to parse error message from JSON response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Export failed");
        }
        throw new Error("Export failed");
      }

      console.log("======",response)
      // Check if response is actually a file (Excel)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("spreadsheet")) {
        // If not a file, try to parse as JSON error
        const errorData = await response.json();
        throw new Error(errorData.message || "No data available to download");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `machine_data_${period}_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (error: any) {
      toast.error(error.message || "Export failed");
    } finally {
      setIsExporting(false);
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

  useEffect(() => {
    fetchAssignments();
    fetchResources();
  }, []);

  useEffect(() => {
    if (Object.keys(resourceIdToName || {}).length > 0) {
      fetchProductsAll();
    }
  }, [resourceIdToName]);

  useEffect(() => {
    fetchPlcData();
  }, [period, page]);

  // Use data directly from API (already paginated)
  const paginatedData = plcData;

  // Calculate hasNextPage based on total count from server
  const hasNextPage = page * LIMIT < totalCount;

  useEffect(() => {
    setPage(1);
  }, [period]);


  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!plcData.length) {
      return {
        totalRecords: 0,
        avgTemperature: 0,
        avgPressure: 0,
        avgRpm: 0,
        totalProduction: 0,
        runningPercentage: 0,
        motorActivePercentage: 0,
        uniqueBrands: 0,
      };
    }

    const totalRecords = plcData.length;
    const avgTemperature =
      plcData.reduce((sum, item) => sum + (item.temperature || 0), 0) /
      totalRecords;
    const avgPressure =
      plcData.reduce((sum, item) => sum + (item.pressure || 0), 0) /
      totalRecords;
    const avgRpm =
      plcData.reduce((sum, item) => sum + (item.rpm || 0), 0) / totalRecords;
    const totalProduction = plcData.reduce(
      (sum, item) => sum + (item.production_count || 0),
      0
    );
    const runningCount = plcData.filter((item) => item.plc_running).length;
    const motorActiveCount = plcData.filter(
      (item) => item.motor_status === 1
    ).length;
    const runningPercentage = (runningCount / totalRecords) * 100;
    const motorActivePercentage = (motorActiveCount / totalRecords) * 100;
    const uniqueBrands = new Set(plcData.map((item) => item.plc_brand)).size;

    return {
      totalRecords,
      avgTemperature: avgTemperature.toFixed(1),
      avgPressure: avgPressure.toFixed(1),
      avgRpm: avgRpm.toFixed(0),
      totalProduction,
      runningPercentage: runningPercentage.toFixed(1),
      motorActivePercentage: motorActivePercentage.toFixed(1),
      uniqueBrands,
    };
  }, [plcData]);

  // Prepare chart data - Temperature & Pressure over time
  const timeSeriesData = React.useMemo(() => {
    return plcData
      .slice()
      .reverse()
      .map((item) => ({
        time: new Date(item.timestamp).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: item.temperature || 0,
        pressure: item.pressure || 0,
        rpm: item.rpm || 0,
        production: item.production_count || 0,
      }));
  }, [plcData]);

  // Brand distribution data for pie chart
  const brandDistribution = React.useMemo(() => {
    const brandCounts: Record<string, number> = {};
    plcData.forEach((item) => {
      brandCounts[item.plc_brand] = (brandCounts[item.plc_brand] || 0) + 1;
    });
    return Object.entries(brandCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [plcData]);

  // Status distribution for pie chart
  const statusDistribution = React.useMemo(() => {
    const running = plcData.filter((item) => item.plc_running).length;
    const stopped = plcData.length - running;
    return [
      { name: "Running", value: running, color: colors.success[500] },
      { name: "Stopped", value: stopped, color: colors.error[500] },
    ];
  }, [plcData]);

  const COLORS = [
    colors.primary[500],
    colors.success[500],
    colors.warning[500],
    colors.error[500],
    colors.secondary[500],
    "#8884d8",
    "#82ca9d",
    "#ffc658",
  ];

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
                Machine History
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.secondary }}
              >
                Monitor PLC performance and production metrics
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

            <Button
              leftIcon={<Download size={16} />}
              onClick={handleExport}
              isLoading={isExporting}
              size="sm"
              colorScheme="blue"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="xl" color="blue.500" mb={4} />
            <p style={{ color: colors.text.secondary }}>
              Loading machine data...
            </p>
          </div>
        </div>
      ) : plcData.length === 0 ? (
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
            No machine data found for the selected period. Try changing the time
            range.
          </p>
        </div>
      ) : (
        <>
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
                Recent Machine Data
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
                  <Th color={colors.table.headerText}>Timestamp</Th>
                  <Th color={colors.table.headerText}>Brand</Th>
                  <Th color={colors.table.headerText}>Model</Th>
                  {/* <Th color={colors.table.headerText}>Status</Th> */}
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
                  <Th></Th>
                </Tr>
                </Thead>
                <Tbody>
                  {paginatedData.map((item, index) => (
                    <Tr
                      key={item._id || index}
                      _hover={{ bg: colors.table.hover }}
                    >
                      <Td></Td>
                      <Td fontSize="xs">
                        {new Date(item.timestamp).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Td>
                      <Td>
                        <p fontSize="xs">{item.plc_brand}</p>
                      </Td>
                      <Td fontSize="sm">{item.plc_model}</Td>
                      {/* <Td>
                        <p fontSize="xs">
                          {item.plc_running ? "Running" : "Stopped"}
                        </p>
                      </Td> */}
                      <Td>
                        <p fontSize="xs">
                          {item.motor_status === 1 ? "Active" : "Inactive"}
                        </p>
                      </Td>
                      <Td fontSize="xs">
                        {Array.isArray(assignmentsMap[item.plc_brand]) &&
                        assignmentsMap[item.plc_brand].length > 0
                          ? assignmentsMap[item.plc_brand].join(", ")
                          : "-"}
                      </Td>
                      <Td fontSize="xs">
                        {Array.isArray(productsByResource[norm(item.plc_brand)]) &&
                        productsByResource[norm(item.plc_brand)].length > 0
                          ? productsByResource[norm(item.plc_brand)].join(", ")
                          : "-"}
                      </Td>
                      <Td isNumeric fontSize="sm">
                        {item.temperature?.toFixed(1) || "-"}
                      </Td>
                      <Td isNumeric fontSize="sm">
                        {item.pressure?.toFixed(1) || "-"}
                      </Td>
                      <Td isNumeric fontSize="sm">
                        {item.rpm || "-"}
                      </Td>
                      <Td isNumeric fontSize="sm" fontWeight="medium">
                        {item.production_count?.toLocaleString() || "-"}
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
        </>
      )}
    </div>
  );
};

export default MachineHistory;
