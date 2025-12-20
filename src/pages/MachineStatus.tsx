import React, { useState, useEffect, useCallback } from "react";
import { useCookies } from "react-cookie";
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
} from "recharts";
import { Activity } from "lucide-react";

const MachineStatus: React.FC = () => {
  const toast = useToast();
  const [machineData, setMachineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [selectedShift, setSelectedShift] = useState<string>("all");
  const [selectedDesign, setSelectedDesign] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds

  // Machine data API endpoint
  const machineApiUrl = `${process.env.REACT_APP_BACKEND_URL}machine/machine-data`;

  // Store API summary data for statistics cards
  const [apiSummaryData, setApiSummaryData] = useState<any>(null);

  // Transform Machine API array into the card/chart structure
  const transformMachineData = (rows: any[]) => {
    return rows.map((item: any) => {
      const ts = item.timestamp ? new Date(item.timestamp) : new Date();
      return {
        deviceId: item.device_id || "Unknown",
        timestamp: ts.toLocaleString(),
        shift: item.shift || "-",
        design: item.design || "-",
        count: item.count ?? 0,
        efficiency: item.efficiency ?? 0,
        error1: item.error1 ?? 0,
        error2: item.error2 ?? 0,
        status: item.status || "unknown",
      };
    });
  };

  // Build lightweight summary stats for the top cards
  const buildSummary = (data: any[]) => {
    const total_production = data.reduce((sum, d) => sum + (d.count || 0), 0);
    const avg_efficiency =
      data.length === 0
        ? 0
        : data.reduce((sum, d) => sum + (Number(d.efficiency) || 0), 0) /
          data.length;
    const total_errors = data.reduce(
      (sum, d) => sum + (d.error1 || 0) + (d.error2 || 0),
      0
    );
    const error1_count = data.reduce((sum, d) => sum + (d.error1 || 0), 0);
    const error2_count = data.reduce((sum, d) => sum + (d.error2 || 0), 0);
    const running_count = data.filter((d) => d.status === "running").length;
    const idle_count = data.filter((d) => d.status === "idle").length;
    const stopped_count = data.filter((d) => d.status === "stopped").length;
    const maintenance_count = data.filter(
      (d) => d.status === "maintenance"
    ).length;
    const designs = Array.from(new Set(data.map((d) => d.design)));

    return {
      total_production,
      avg_efficiency,
      total_errors,
      error1_count,
      error2_count,
      status_summary: {
        total_machines: data.length,
        running: running_count,
        idle: idle_count,
        stopped: stopped_count,
        maintenance: maintenance_count,
      },
      designs,
    };
  };

  const fetchMachineData = useCallback(
    async (deviceId: string = "all") => {
      setIsLoading(true);
      try {
        const url =
          deviceId === "all"
            ? machineApiUrl
            : `${machineApiUrl}?device_id=${encodeURIComponent(deviceId)}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch machine data");
        }

        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(
            result.message || "Unexpected response from Machine API"
          );
        }

        const transformedData = transformMachineData(result.data);
        setMachineData(transformedData);
        setApiSummaryData(buildSummary(transformedData));
        setLastUpdated(new Date());
      } catch (error: any) {
        console.error("Error fetching machine data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch machine data.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, machineApiUrl]
  );

  useEffect(() => {
    // Load machine data from API
    fetchMachineData(selectedMachine);
  }, [selectedMachine, fetchMachineData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMachineData(selectedMachine);
      setLastUpdated(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedMachine, fetchMachineData]);

  // Filter data based on selections
  const filteredData = machineData.filter((item) => {
    if (selectedMachine !== "all" && item.deviceId !== selectedMachine)
      return false;
    if (selectedShift !== "all" && item.shift !== selectedShift) return false;
    if (selectedDesign !== "all" && item.design !== selectedDesign)
      return false;
    if (selectedStatus !== "all" && item.status !== selectedStatus)
      return false;
    return true;
  });

  // Prepare chart data
  const chartData = filteredData.map((item: any) => ({
    time: item.timestamp,
    count: item.count,
    efficiency: item.efficiency,
    errors: item.error1 + item.error2,
  }));

  // Get unique values for filters
  const shifts = Array.from(
    new Set(machineData.map((item: any) => item.shift))
  );
  const designs =
    apiSummaryData?.designs ||
    Array.from(new Set(machineData.map((item: any) => item.design)));
  const availableDevices = Array.from(
    new Set(machineData.map((item: any) => item.deviceId))
  );

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
              <Text fontSize="sm" color="gray.600">
                Auto Refresh:
              </Text>
              <Badge
                colorScheme={autoRefresh ? "green" : "gray"}
                variant="subtle"
                cursor="pointer"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "ON" : "OFF"}
              </Badge>
            </HStack>
            <Select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              size="sm"
              w="100px"
              isDisabled={!autoRefresh}
            >
               <option value={3}>3s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </Select>
            <Button
              leftIcon={<Activity />}
              colorScheme="blue"
              onClick={() => {
                fetchMachineData(selectedMachine);
                setLastUpdated(new Date());
              }}
              isLoading={isLoading}
              size="sm"
            >
              Refresh Now
            </Button>
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
            rounded="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
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
            rounded="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Avg Efficiency</StatLabel>
                <StatNumber color="green.600">
                  {isLoading
                    ? "..."
                    : apiSummaryData?.avg_efficiency
                    ? parseFloat(apiSummaryData.avg_efficiency).toFixed(2) + "%"
                    : "0%"}
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
            bgGradient="linear(to-br, red.50, white)"
            borderColor="red.100"
            variant="outline"
            rounded="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Total Errors</StatLabel>
                <StatNumber color="red.600">
                  {isLoading ? "..." : apiSummaryData?.total_errors || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {isLoading ? "Loading..." : "Error1 + Error2"}
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
            rounded="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
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
            rounded="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Error 1 Count</StatLabel>
                <StatNumber color="orange.600">
                  {isLoading ? "..." : apiSummaryData?.error1_count || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {isLoading ? "Loading..." : "Type 1 Errors"}
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
            rounded="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Error 2 Count</StatLabel>
                <StatNumber color="red.600">
                  {isLoading ? "..." : apiSummaryData?.error2_count || "0"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {isLoading ? "Loading..." : "Type 2 Errors"}
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
            rounded="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
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
            bgGradient="linear(to-br, gray.50, white)"
            borderColor="gray.200"
            variant="outline"
            rounded="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
            transition="all 0.2s ease-in-out"
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Stopped/Idle</StatLabel>
                <StatNumber color="gray.600">
                  {isLoading
                    ? "..."
                    : (apiSummaryData?.status_summary?.stopped || 0) +
                      (apiSummaryData?.status_summary?.idle || 0)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {isLoading ? "Loading..." : "Inactive Machines"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </HStack>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Device ID
                </Text>
                <Select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  size="sm"
                  w="150px"
                >
                  <option value="all">All Devices</option>
                  {availableDevices.map((device: string) => (
                    <option key={device} value={device}>
                      {device}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Shift
                </Text>
                <Select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  size="sm"
                  w="150px"
                >
                  <option value="all">All Shifts</option>
                  {shifts.map((shift: string) => (
                    <option key={shift} value={shift}>
                      Shift {shift}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Design
                </Text>
                <Select
                  value={selectedDesign}
                  onChange={(e) => setSelectedDesign(e.target.value)}
                  size="sm"
                  w="150px"
                >
                  <option value="all">All Designs</option>
                  {designs.map((design: string) => (
                    <option key={design} value={design}>
                      {design}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Status
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
                  <option value="maintenance">Maintenance</option>
                </Select>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Charts */}
        <HStack spacing={6} align="stretch">
          {/* Count Chart */}
          <Card flex="2">
            <CardBody>
              <Heading size="md" mb={4}>
                Count Over Time
              </Heading>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="time"
                      stroke="#718096"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#718096"
                      fontSize={12}
                      label={{
                        value: "Count",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3182CE"
                      strokeWidth={2}
                      dot={{ fill: "#3182CE", strokeWidth: 2, r: 4 }}
                      name="Count"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          {/* Efficiency Chart */}
          <Card flex="1">
            <CardBody>
              <Heading size="md" mb={4}>
                Efficiency vs Errors
              </Heading>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#718096" fontSize={12} />
                    <YAxis stroke="#718096" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="efficiency"
                      fill="#38A169"
                      name="Efficiency %"
                    />
                    <Bar dataKey="errors" fill="#E53E3E" name="Errors" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </HStack>

        {/* Machine Performance Data Cards */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Machine Performance Data
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
                        <Box mb={3}>
                          <Text fontSize="xs" color="gray.300" mb={1}>
                            Timestamp
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.300"
                          >
                            Loading...
                          </Text>
                        </Box>
                        <Box mb={3}>
                          <Text fontSize="xs" color="gray.300" mb={1}>
                            Design
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.300"
                          >
                            Loading...
                          </Text>
                        </Box>
                        <SimpleGrid columns={2} spacing={3} mb={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.300" mb={1}>
                              Count
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
                              Efficiency
                            </Text>
                            <Badge
                              colorScheme="gray"
                              variant="subtle"
                              fontSize="sm"
                            >
                              Loading...
                            </Badge>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {filteredData.map((item: any, index: number) => (
                  <Card
                    key={index}
                    variant="elevated"
                    size="sm"
                    borderLeftWidth="6px"
                    borderLeftColor={getStatusBorderColor(item.status)}
                    rounded="md"
                    boxShadow="md"
                    _hover={{ boxShadow: "xl", transform: "translateY(-3px)" }}
                    transition="all 0.2s ease-in-out"
                  >
                    <CardBody p={4} bgGradient={getStatusGradient(item.status)}>
                      {/* Header with Device ID, Status, and Shift */}
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontSize="lg" fontWeight="bold" color="blue.700">
                          {item.deviceId}
                        </Text>
                        <VStack spacing={1} align="end">
                          {/* Machine Status with real-time indicator */}
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
                          {/* Shift Badge */}
                          <Badge
                            colorScheme={
                              item.shift === "A"
                                ? "green"
                                : item.shift === "B"
                                ? "blue"
                                : item.shift === "C"
                                ? "purple"
                                : "gray"
                            }
                            variant="subtle"
                            size="sm"
                          >
                            Shift {item.shift}
                          </Badge>
                        </VStack>
                      </Flex>

                      {/* Timestamp */}
                      <Box mb={3}>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Timestamp
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {item.timestamp}
                        </Text>
                      </Box>

                      {/* Design */}
                      <Box mb={3}>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Design
                        </Text>
                        <Badge
                          colorScheme="cyan"
                          variant="subtle"
                          fontSize="sm"
                        >
                          {item.design}
                        </Badge>
                      </Box>

                      {/* Performance Metrics */}
                      <SimpleGrid columns={2} spacing={3} mb={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Count
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="teal.600"
                          >
                            {item.count}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Efficiency
                          </Text>
                          <Badge
                            colorScheme={
                              item.efficiency >= 90
                                ? "green"
                                : item.efficiency >= 80
                                ? "yellow"
                                : "red"
                            }
                            variant="solid"
                            fontSize="sm"
                            rounded="full"
                            px={2}
                          >
                            {parseFloat(item.efficiency || 0).toFixed(1)}%
                          </Badge>
                        </Box>
                      </SimpleGrid>

                      {/* Error Metrics */}
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={2}>
                          Error Status
                        </Text>
                        <HStack spacing={4}>
                          <Box textAlign="center">
                            <Text fontSize="xs" color="gray.500">
                              Error 1
                            </Text>
                            <Badge
                              colorScheme={item.error1 === 0 ? "green" : "red"}
                              variant="solid"
                              size="sm"
                            >
                              {item.error1}
                            </Badge>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="xs" color="gray.500">
                              Error 2
                            </Text>
                            <Badge
                              colorScheme={item.error2 === 0 ? "green" : "red"}
                              variant="solid"
                              size="sm"
                            >
                              {item.error2}
                            </Badge>
                          </Box>
                        </HStack>
                      </Box>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default MachineStatus;
