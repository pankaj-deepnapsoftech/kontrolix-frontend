import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Select,
  Icon,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  List,
  Check,
  Users,
  ArrowDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import RoleModals from '../components/RoleModals';

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [salesPeriod, setSalesPeriod] = useState('Yearly');
  const [salesYear, setSalesYear] = useState(new Date().getFullYear());
  const [salesData, setSalesData] = useState([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [apiDispatchData, setApiDispatchData] = useState([]);
  const [isLoadingDispatch, setIsLoadingDispatch] = useState(false);
  const [merchantChartData, setMerchantChartData] = useState<any>(null);
  const [isLoadingMerchant, setIsLoadingMerchant] = useState(false);
  const [productionChartData, setProductionChartData] = useState<any>(null);
  const [isLoadingProduction, setIsLoadingProduction] = useState(false);
  const [inventoryChartData, setInventoryChartData] = useState<any>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [apiResourcesData, setApiResourcesData] = useState<any[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [apiRolesData, setApiRolesData] = useState<any[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [apiApprovalData, setApiApprovalData] = useState<any[]>([]);
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
    const [financeData, setFinanceData] = useState<any>(null);
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);
  const [accountsYear, setAccountsYear] = useState(new Date().getFullYear());
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [cookies] = useCookies();
  const [inventoryPeriod, setInventoryPeriod] = useState('Weekly');
  const [productionPeriod, setProductionPeriod] = useState('Weekly');
  const [dispatchPeriod, setDispatchPeriod] = useState('Yearly');
  const [accountsPeriod, setAccountsPeriod] = useState('Weekly');
  const [merchantPeriod, setMerchantPeriod] = useState('Weekly');
  const toast = useToast();
  const navigate = useNavigate();

  // Modal states
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Selected role state
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    role: '',
    description: '',
    createdOn: '',
    lastUpdated: ''
  });

  // User Roles Action Handlers
  const handleViewRole = (role: any) => {
    // Format dates for modal display
    const formattedRole = {
      ...role,
      createdOn: role.createdAt ? new Date(role.createdAt).toLocaleDateString('en-GB') : role.createdOn || 'N/A',
      lastUpdated: role.updatedAt ? new Date(role.updatedAt).toLocaleDateString('en-GB') : role.lastUpdated || 'N/A'
    };
    setSelectedRole(formattedRole);
    onViewOpen();
  };

  const handleEditRole = (role: any) => {
    // Format dates for modal display
    const formattedRole = {
      ...role,
      createdOn: role.createdAt ? new Date(role.createdAt).toLocaleDateString('en-GB') : role.createdOn || 'N/A',
      lastUpdated: role.updatedAt ? new Date(role.updatedAt).toLocaleDateString('en-GB') : role.lastUpdated || 'N/A'
    };
    setSelectedRole(formattedRole);
    setEditForm({
      role: role.role,
      description: role.description,
      createdOn: formattedRole.createdOn,
      lastUpdated: formattedRole.lastUpdated
    });
    onEditOpen();
  };
          
  const handleDeleteRole = (role: any) => {
    setSelectedRole(role);
    onDeleteOpen();
  };

  // Fetch sales data from API
  const fetchSalesData = async () => {
    setIsLoadingSales(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}dashboard/sales?view=${salesPeriod.toLowerCase()}&year=${salesYear}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies?.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform API data to chart format
          const transformedData = data.labels.map((label: string, index: number) => ({
            month: label,
            value1: data.datasets[0]?.data[index] || 0,
            value2: data.datasets[1]?.data[index] || 0
          }));
          setSalesData(transformedData);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch sales data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        throw new Error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingSales(false);
    }
  };

  // Fetch sales data when period or year changes
  useEffect(() => {
    fetchSalesData();
  }, [salesPeriod, salesYear]);

  // Fetch dispatch data from API
  const fetchDispatchData = async () => {
    setIsLoadingDispatch(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}dashboard/dispatch?view=${dispatchPeriod.toLowerCase()}&year=${new Date().getFullYear()}`;
      
      // Add month parameter for monthly view
      if (dispatchPeriod.toLowerCase() === 'monthly') {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        url += `&month=${currentMonth}`;
      }
      
      console.log('Dispatch API URL:', url); // Debug log
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform API data to chart format
          const transformedData = data.labels.map((label: string, index: number) => ({
            day: label,
            dispatch: data.datasets[0]?.data[index] || 0,
            deliver: data.datasets[1]?.data[index] || 0
          }));
          setApiDispatchData(transformedData);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch dispatch data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        throw new Error('Failed to fetch dispatch data');
      }
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dispatch data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingDispatch(false);
    }
  };

  // Fetch dispatch data when period changes
  useEffect(() => {
    console.log('Dispatch period changed to:', dispatchPeriod); // Debug log
    fetchDispatchData();
  }, [dispatchPeriod]);

     // Fetch inventory chart data from API
   const fetchInventoryData = async () => {
     setIsLoadingInventory(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}dashboard?filter=${inventoryPeriod.toLowerCase()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies?.access_token}`
          }
        }
      );

      if (response.ok) {
         const data = await response.json();
         if (data.success) {
           setInventoryChartData(data.inventory_chart);
         } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch inventory data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        throw new Error('Failed to fetch inventory data');
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
       setIsLoadingInventory(false);
     }
  };

  // Fetch production chart data from API
   const fetchProductionData = async () => {
     setIsLoadingProduction(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}dashboard?filter=${productionPeriod.toLowerCase()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies?.access_token}`
          }
        }
      );

      if (response.ok) {
         const data = await response.json();
         if (data.success) {
           setProductionChartData(data.production_chart);
         } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch production data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        throw new Error('Failed to fetch production data');
      }
    } catch (error) {
      console.error('Error fetching production data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch production data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
       setIsLoadingProduction(false);
     }
  };

     // Fetch merchant chart data from API
   const fetchMerchantData = async () => {
     setIsLoadingMerchant(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}dashboard?filter=${merchantPeriod.toLowerCase()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies?.access_token}`
          }
        }
      );

             if (response.ok) {
         const data = await response.json();
         if (data.success) {
           setMerchantChartData(data.merchant_chart);
         } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch merchant data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        throw new Error('Failed to fetch merchant data');
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch merchant data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
         } finally {
       setIsLoadingMerchant(false);
     }
  };

     // Fetch data when periods change
   useEffect(() => {
     fetchInventoryData();
   }, [inventoryPeriod]);

   useEffect(() => {
     fetchProductionData();
   }, [productionPeriod]);

   useEffect(() => {
     fetchMerchantData();
   }, [merchantPeriod]);

   // Fetch resources data from API
   const fetchResourcesData = async () => {
     setIsLoadingResources(true);
     try {
       const response = await fetch(
         `${process.env.REACT_APP_BACKEND_URL}resources`,
         {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${cookies?.access_token}`
           }
         }
       );

       if (response.ok) {
         const data = await response.json();
         if (data.success) {
           setApiResourcesData(data.resources || []);
         } else {
           toast({
             title: "Error",
             description: data.message || "Failed to fetch resources data",
             status: "error",
             duration: 3000,
             isClosable: true,
           });
         }
       } else {
         throw new Error('Failed to fetch resources data');
       }
     } catch (error) {
       console.error('Error fetching resources data:', error);
       toast({
         title: "Error",
         description: "Failed to fetch resources data",
         status: "error",
         duration: 3000,
         isClosable: true,
       });
     } finally {
       setIsLoadingResources(false);
     }
   };

   // Fetch resources data on component mount
   useEffect(() => {
     fetchResourcesData();
   }, []);

   // Fetch roles data from API
   const fetchRolesData = async () => {
     setIsLoadingRoles(true);
     try {
       const response = await fetch(
         `${process.env.REACT_APP_BACKEND_URL}role/`,
         {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${cookies?.access_token}`
           }
         }
       );

       if (response.ok) {
         const data = await response.json();
         if (data.success) {
           setApiRolesData(data.roles || []);
         } else {
           toast({
             title: "Error",
             description: data.message || "Failed to fetch roles data",
             status: "error",
             duration: 3000,
             isClosable: true,
           });
         }
       } else {
         throw new Error('Failed to fetch roles data');
       }
     } catch (error) {
       console.error('Error fetching roles data:', error);
       toast({
         title: "Error",
         description: "Failed to fetch roles data",
         status: "error",
         duration: 3000,
         isClosable: true,
       });
     } finally {
       setIsLoadingRoles(false);
     }
   };

   // Fetch roles data on component mount
   useEffect(() => {
     fetchRolesData();
   }, []);

       // Fetch approval data from API
    const fetchApprovalData = async () => {
      setIsLoadingApproval(true);
      try {
        // Fetch inventory data (BOM API)
        const inventoryResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}bom/all/inventory/raw-materials`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cookies?.access_token}`
            }
          }
        );

        // Fetch production data
        const productionResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}production-process/all`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cookies?.access_token}`
            }
          }
        );

        let inventoryData = [];
        let productionData = [];

        if (inventoryResponse.ok) {
          const inventoryResult = await inventoryResponse.json();
          if (inventoryResult.success) {
            inventoryData = inventoryResult.unapproved || [];
          }
        }

        if (productionResponse.ok) {
          const productionResult = await productionResponse.json();
          if (productionResult.success) {
            productionData = productionResult.production_processes || [];
          }
        }

        // Combine data: top 1 inventory + top 1 production
        const combinedData = [];
        
        // Add top 1 inventory data
        if (inventoryData.length > 0) {
          combinedData.push({
            ...inventoryData[0],
            source: 'inventory'
          });
        }
        
        // Add top 1 production data
        if (productionData.length > 0) {
          combinedData.push({
            ...productionData[0],
            source: 'production'
          });
        }

        setApiApprovalData(combinedData);
      } catch (error) {
        console.error('Error fetching approval data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch approval data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingApproval(false);
      }
    };

   // Fetch approval data on component mount
   useEffect(() => {
     fetchApprovalData();
   }, []);

   // Fetch finance data from API
   const fetchFinanceData = async () => {
     setIsLoadingFinance(true);
     try {
      let url = `${process.env.REACT_APP_BACKEND_URL}dashboard/finance?view=${accountsPeriod.toLowerCase()}&year=${accountsYear}`;
      
      // Add month parameter for monthly view
      if (accountsPeriod.toLowerCase() === 'monthly') {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        url += `&mon=${currentMonth}`;
      }
      
      console.log('Finance API URL:', url); // Debug log
      
      const response = await fetch(url, {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${cookies?.access_token}`
           }
      });

       if (response.ok) {
         const data = await response.json();
         if (data.success) {
           setFinanceData(data);
         } else {
           toast({
             title: "Error",
             description: data.message || "Failed to fetch finance data",
             status: "error",
             duration: 3000,
             isClosable: true,
           });
         }
       } else {
         throw new Error('Failed to fetch finance data');
       }
     } catch (error) {
       console.error('Error fetching finance data:', error);
       toast({
         title: "Error",
         description: "Failed to fetch finance data",
         status: "error",
         duration: 3000,
         isClosable: true,
       });
     } finally {
       setIsLoadingFinance(false);
     }
   };

   // Fetch finance data when period or year changes
   useEffect(() => {
     fetchFinanceData();
   }, [accountsPeriod, accountsYear]);

   // Fetch stats data from API
   const fetchStatsData = async () => {
     setIsLoadingStats(true);
     try {
       const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}dashboard/stats`, {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${cookies?.access_token}`
         }
       });

       if (response.ok) {
         const data = await response.json();
         console.log('Stats API Response:', data); // Debug log
         if (data.success) {
           setStatsData(data);
         } else {
           toast({
             title: "Error",
             description: data.message || "Failed to fetch stats data",
             status: "error",
             duration: 3000,
             isClosable: true,
           });
         }
       } else {
         console.error('Stats API Error:', response.status, response.statusText);
       }
     } catch (error) {
       console.error('Error fetching stats data:', error);
       toast({
         title: "Error",
         description: "Failed to fetch stats data",
         status: "error",
         duration: 3000,
         isClosable: true,
       });
     } finally {
       setIsLoadingStats(false);
     }
   };

   // Fetch stats data on component mount
   useEffect(() => {
     fetchStatsData();
   }, []);

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies?.access_token}`
        },
        body: JSON.stringify({
          _id: selectedRole?._id,
          role: editForm.role,
          description: editForm.description,
          permissions: selectedRole?.permissions || []
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      toast({
        title: "Role Updated",
        description: `${editForm.role} has been updated successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh roles data
      fetchRolesData();
      onEditClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}role`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies?.access_token}`
        },
        body: JSON.stringify({
          _id: selectedRole?._id
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      toast({
        title: "Role Deleted",
        description: `${selectedRole?.role} has been deleted successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh roles data
      fetchRolesData();
      onDeleteClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Sales Overview Data (fallback data)
  const fallbackSalesData = [
    { month: 'Jan', value1: 8, value2: 12 },
    { month: 'Feb', value1: 12, value2: 18 },
    { month: 'Mar', value1: 6, value2: 15 },
    { month: 'Apr', value1: 16, value2: 22 },
    { month: 'May', value1: 14, value2: 20 },
    { month: 'Jun', value1: 10, value2: 28 },
    { month: 'Jul', value1: 18, value2: 25 },
    { month: 'Aug', value1: 22, value2: 30 },
    { month: 'Sep', value1: 20, value2: 28 },
    { month: 'Oct', value1: 24, value2: 32 },
    { month: 'Nov', value1: 26, value2: 35 },
    { month: 'Dec', value1: 28, value2: 38 },
  ];

     // Inventory Data (fallback data)
   const fallbackInventoryData = [
     { name: 'Raw materials', value: 30, color: '#6AC6FF' },
     { name: 'Work in progress', value: 25, color: '#78A5F7' },
     { name: 'Finished goods', value: 20, color: '#FF86E1' },
     { name: 'Indirect inventory', value: 25, color: '#FFC680' },
   ];

       // Transform API inventory data to chart format
    const inventoryData = inventoryChartData ? [
      { 
        name: 'Raw materials', 
        value: inventoryChartData.raw_materials || 0, 
        color: '#6AC6FF' 
      },
      { 
        name: 'Work in progress', 
        value: inventoryChartData.work_in_progress || 0, 
        color: '#78A5F7' 
      },
      { 
        name: 'Finished goods', 
        value: inventoryChartData.finished_goods || 0, 
        color: '#FF86E1' 
      },
      { 
        name: 'Indirect inventory', 
        value: inventoryChartData.indirect_inventory || 0, 
        color: '#FFC680' 
      },
    ] : fallbackInventoryData;

    // Console log for debugging
    console.log('Inventory Chart Data:', inventoryChartData);
    console.log('Inventory Data Array:', inventoryData);
    console.log('Inventory Data Length:', inventoryData.length);

     // Production Data (fallback data)
   const fallbackProductionData = [
     { name: 'Completed', value: 124, color: '#51B6F5' },
     { name: 'Progress', value: 85, color: '#F778D7' },
     { name: 'Pre Production', value: 65, color: '#80ADFF' },
   ];

       // Transform API production data to chart format
    const productionData = productionChartData ? [
      { 
        name: 'Completed', 
        value: productionChartData.completed || 0, 
        color: '#51B6F5' 
      },
      { 
        name: 'Progress', 
        value: productionChartData.progress || 0, 
        color: '#F778D7' 
      },
      { 
        name: 'Pre Production', 
        value: productionChartData.pre_production || 0, 
        color: '#80ADFF' 
      },
    ] : fallbackProductionData;

    // Console log for debugging
    console.log('Production Chart Data:', productionChartData);
    console.log('Production Data Array:', productionData);
    console.log('Production Data Length:', productionData.length);

  // Dispatch Data (fallback data)
  const fallbackDispatchData = [
    { day: 'Mon', dispatch: 15, deliver: 12 },
    { day: 'Tue', dispatch: 22, deliver: 18 },
    { day: 'Wed', dispatch: 18, deliver: 15 },
    { day: 'Thu', dispatch: 25, deliver: 22 },
    { day: 'Fri', dispatch: 30, deliver: 28 },
    { day: 'Sat', dispatch: 12, deliver: 10 },
    { day: 'Sun', dispatch: 8, deliver: 6 },
  ];

     // Resources Data (fallback data)
   const fallbackResourcesData = [
     { name: 'CNC', type: 'Machine', color: '#FA4F4F' },
     { name: 'Packing assembl...', type: 'Assembly line', color: '#5D94F5' },
     { name: 'Oil machine', type: 'Machine', color: '#FA4F4F' },
     { name: 'Motor manufact...', type: 'Assembly line', color: '#5D94F5' },
   ];

  // Transform API finance data to chart format
  const accountsData = financeData ? [
    { 
      name: 'Proforma Invoice', 
      value: financeData.proforma_invoices?.total_count || 0, 
      color: '#78A5F7' 
    },
    { 
      name: 'Tax Invoice', 
      value: financeData.invoices?.total_count || 0, 
      color: '#FFC680' 
    },
    { 
      name: 'Payments', 
      value: financeData.payments?.total_count || 0, 
      color: '#F778D7' 
    },
  ] : [
    { name: 'Proforma Invoice', value: 0, color: '#78A5F7' },
    { name: 'Tax Invoice', value: 0, color: '#FFC680' },
    { name: 'Payments', value: 0, color: '#F778D7' },
  ];

           // Merchant Data - Pie Chart (fallback data)
    const fallbackMerchantData = [
      { name: 'Individual', value: 60, color: '#6AC6FF' },
      { name: 'Company', value: 40, color: '#FF86E1' },
    ];

    // Transform API merchant data to chart format
    const merchantData = merchantChartData ? [
      { 
        name: 'Individual', 
        value: merchantChartData.totals?.total_individual || 0, 
        color: '#6AC6FF' 
      },
      { 
        name: 'Company', 
        value: merchantChartData.totals?.total_company || 0, 
        color: '#FF86E1' 
      },
    ] : fallbackMerchantData;

     // User Roles Data (fallback data)
   const fallbackUserRolesData = [
     { role: 'Inventory', description: 'Manage raw materials s...', createdOn: '14/07/25', lastUpdated: '19/08/25' },
     { role: 'Production', description: 'Overseas manufacturi...', createdOn: '14/07/25', lastUpdated: '19/08/25' },
     { role: 'Accountant', description: 'Overseas manufacturi...', createdOn: '14/06/25', lastUpdated: '19/08/25' },
   ];

       // Approval Data (fallback data)
    const fallbackApprovalData = [
      { bom_name: 'Sample BOM', name: 'Sample Material', status: 'raw material approval pending', createdAt: '30/08/25', source: 'inventory' },
      { bom: { bom_name: 'Test BOM' }, item: { name: 'Test Material' }, status: 'completed', createdAt: '29/08/25', source: 'production' },
    ];

  const kpiCards = [
    {
      title: 'Sales Order',
      value: '24',
      change: '5',
      trend: 'up',
      icon: List,
      bgColor: '#FA4F4F',
      iconColor: 'white'
    },
    {
      title: 'Completed Orders',
      value: '15',
      change: '2',
      trend: 'down',
      icon: Check,
      bgColor: '#7ED185',
      iconColor: 'white'
    },
    {
      title: 'Total BOM',
      value: isLoadingStats ? '...' : (statsData?.bom?.total?.toString() || '0'),
      change: isLoadingStats ? '...' : (statsData?.bom?.lastMonth?.toString() || '0'),
      trend: 'up',
      icon: List,
      bgColor: '#EAA250',
      iconColor: 'white'
    },
    {
      title: 'Verified Employes',
      value: isLoadingStats ? '...' : (statsData?.verified_employees?.total?.toString() || '0'),
      change: isLoadingStats ? '...' : (statsData?.verified_employees?.lastMonth?.toString() || '0'),
      trend: 'up',
      icon: Users,
      bgColor: '#00D6EE',
      iconColor: 'white'
    }
  ];

  return (
    <Box 
      p={{ base: 4, md: 6, lg: 8 }} 
      bg="gray.50" 
      minH="100vh"
      maxW="100vw"
      overflowX="hidden"
    >
      {/* Header */}
      <Flex 
        direction={{ base: 'column', md: 'row' }}
        justify="space-between" 
        align={{ base: 'start', md: 'center' }}
        mb={6}
        gap={{ base: 4, md: 0 }}
      >
        <VStack align={{ base: 'start', md: 'start' }} spacing={2}>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="gray.800">
            Analytics Dashboard
          </Text>
          <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
            Monitor your business performance and insights
          </Text>
        </VStack>
        {/* <HStack spacing={3}>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            size={{ base: 'sm', md: 'md' }}
            bg="white"
            w={{ base: '32', md: '40' }}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </HStack> */}
      </Flex>

      {/* KPI Cards */}
      <Flex 
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 4, lg: 6 }} 
        mb={6}
        flexWrap="wrap"
      >
        {kpiCards.map((kpi, index) => (
          <Box 
            key={index} 
            bg="white" 
            p={{ base: 4, md: 6 }} 
            borderRadius="lg" 
            flex={{ base: '1', lg: '1' }}
            minW={{ base: '100%', lg: 'auto' }}
            boxShadow="sm"
          >
            <Flex 
              direction={{ base: 'column', sm: 'row' }}
              justify="space-between" 
              align={{ base: 'start', sm: 'center' }}
              gap={{ base: 3, sm: 0 }}
            >
              <Box flex="1">
                <Text fontSize="sm" color="gray.600" mb={1}>{kpi.title}</Text>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="gray.800" mb={2}>{kpi.value}</Text>
                                 <Flex align="center" gap={1} flexWrap="wrap">
                   <Text 
                     fontSize="sm" 
                     color={kpi.trend === 'up' ? 'green.500' : kpi.change === '0' ? 'gray.500' : 'red.500'}
                   >
                     {kpi.change} {kpi.trend === 'up' ? '▲' : '▼'}
                   </Text>
                   <Text 
                     fontSize="sm" 
                     color="gray.500"
                   >
                     v/s last month
                   </Text>
                 </Flex>
              </Box>
              <Box 
                bg={kpi.bgColor} 
                p={3} 
                borderRadius={kpi.icon === List ? 'md' : 'full'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={kpi.icon} size={20} color={kpi.iconColor} />
              </Box>
            </Flex>
          </Box>
        ))}
      </Flex>

      {/* Middle Row - Sales Overview and Inventory */}
      <Flex 
        direction={{ base: 'column', xl: 'row' }}
        gap={{ base: 4, xl: 6 }} 
        mb={6}
      >
        {/* Sales Overview */}
                 <Box 
           bg="white" 
           p={{ base: 4, md: 6 }} 
           borderRadius="lg" 
           flex={{ base: '1', xl: '2.5' }}
           boxShadow="sm"
         >
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between" 
            align={{ base: 'start', sm: 'center' }}
            mb={4}
            gap={{ base: 3, sm: 0 }}
          >
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Sales Overview</Text>
            <HStack spacing={2} flexWrap="wrap">
              {['Weekly', 'Monthly', 'Yearly'].map((period) => (
                <Box
                  key={period}
                  px={3}
                  py={1}
                  borderRadius="md"
                  bg={period === salesPeriod ? 'blue.500' : 'gray.100'}
                  color={period === salesPeriod ? 'white' : 'gray.600'}
                  fontSize="sm"
                  cursor="pointer"
                  onClick={() => setSalesPeriod(period)}
                  _hover={{
                    bg: period === salesPeriod ? 'blue.600' : 'gray.200'
                  }}
                  transition="all 0.2s"
                  flexShrink={0}
                >
                  {period}
                </Box>
              ))}
              {salesPeriod === 'Yearly' && (
                <Select
                  value={salesYear}
                  onChange={(e) => setSalesYear(Number(e.target.value))}
                  size="sm"
                  bg="white"
                  w="20"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              )}
            </HStack>
          </Flex>
          <Box height={{ base: '250px', md: '300px' }}>
            {isLoadingSales ? (
              <Flex justify="center" align="center" height="100%">
                <Text color="gray.500">Loading sales data...</Text>
              </Flex>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData.length > 0 ? salesData : fallbackSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="value1" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="value2" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Box>
          {/* Sales Overview Legend */}
          <HStack spacing={4} mt={4} justify="center" flexWrap="wrap">
            <Flex align="center" gap={2}>
              <Box w={3} h={3} borderRadius="full" bg="#3B82F6" />
              <Text fontSize="sm" color="gray.600">Before  </Text>
            </Flex>
            <Flex align="center" gap={2}>
              <Box w={3} h={3} borderRadius="full" bg="#F59E0B" />
              <Text fontSize="sm" color="gray.600">Current </Text>
            </Flex>
          </HStack>
        </Box>

        {/* Inventory */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex={{ base: '1', xl: '1' }}
          boxShadow="sm"
        >
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between" 
            align={{ base: 'start', sm: 'center' }}
            mb={4}
            gap={{ base: 3, sm: 0 }}
          >
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Inventory</Text>
            <HStack spacing={1}>
              <Select
                value={inventoryPeriod}
                onChange={(e) => setInventoryPeriod(e.target.value)}
                size="sm"
                bg="white"
                w={{ base: '28', md: '32' }}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Select>
            </HStack>
          </Flex>
                     <Box height={{ base: '200px', md: '200px' }}>
             {isLoadingInventory ? (
               <Flex justify="center" align="center" height="100%">
                 <Text color="gray.500">Loading inventory data...</Text>
               </Flex>
             ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={inventoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={40}
                     outerRadius={80}
                     dataKey="value"
                   >
                     {inventoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: 'white', 
                       border: '1px solid #E5E7EB',
                       borderRadius: '8px'
                     }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             )}
           </Box>
                                           <VStack spacing={2} mt={4} align="start">
              {inventoryData.map((item, index) => (
                <Flex key={index} align="center" gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg={item.color} />
                  <Text fontSize="sm" color="gray.600">{item.name}</Text>
                </Flex>
              ))}
            </VStack>
        </Box>
      </Flex>

      {/* Bottom Row - Production, Dispatch, and Resources */}
      <Flex 
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 4, lg: 6 }} 
        mb={6}
      >
        {/* Production */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex={{ base: '1', lg: '0.8' }}
          boxShadow="sm"
        >
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between" 
            align={{ base: 'start', sm: 'center' }}
            mb={4}
            gap={{ base: 3, sm: 0 }}
          >
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Production</Text>
            <HStack spacing={1}>
              <Select
                value={productionPeriod}
                onChange={(e) => setProductionPeriod(e.target.value)}
                size="sm"
                bg="white"
                w={{ base: '28', md: '32' }}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Select>
            </HStack>
          </Flex>
                     <Box height={{ base: '200px', md: '200px' }}>
             {isLoadingProduction ? (
               <Flex justify="center" align="center" height="100%">
                 <Text color="gray.500">Loading production data...</Text>
               </Flex>
             ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={productionData}
                     cx="50%"
                     cy="50%"
                     outerRadius={80}
                     dataKey="value"
                   >
                     {productionData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: 'white', 
                       border: '1px solid #E5E7EB',
                       borderRadius: '8px'
                     }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             )}
           </Box>
                     <Box textAlign="center" mt={2}>
             <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Completed</Text>
             <Text fontSize="sm" color="gray.600">
               {isLoadingProduction ? 'Loading...' : `${productionChartData?.completed || 0} orders`}
             </Text>
           </Box>
                                           <VStack spacing={2} mt={4} align="start">
              {productionData.map((item, index) => (
                <Flex key={index} align="center" gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg={item.color} />
                  <Text fontSize="sm" color="gray.600">{item.name}</Text>
                </Flex>
              ))}
            </VStack>
        </Box>

        {/* Dispatch */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex={{ base: '1', lg: '1' }}
          boxShadow="sm"
        >
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between" 
            align={{ base: 'start', sm: 'center' }}
            mb={4}
            gap={{ base: 3, sm: 0 }}
          >
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Dispatch</Text>
            <HStack spacing={1}>
              <Select
                value={dispatchPeriod}
                onChange={(e) => setDispatchPeriod(e.target.value)}
                size="sm"
                bg="white"
                w={{ base: '28', md: '32' }}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Select>
            </HStack>
          </Flex>
                     <Box height={{ base: '200px', md: '200px' }}>
             {isLoadingDispatch ? (
               <Flex justify="center" align="center" height="100%">
                 <Text color="gray.500">Loading dispatch data...</Text>
               </Flex>
             ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={apiDispatchData.length > 0 ? apiDispatchData : fallbackDispatchData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                   <XAxis dataKey="day" stroke="#6B7280" />
                   <YAxis stroke="#6B7280" />
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: 'white', 
                       border: '1px solid #E5E7EB',
                       borderRadius: '8px'
                     }}
                   />
                   <Bar dataKey="dispatch" fill="#F778D7" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="deliver" fill="#78A5F7" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             )}
           </Box>                     <HStack spacing={4} mt={4} justify="center" flexWrap="wrap">
             <Flex align="center" gap={2}>
               <Box w={3} h={3} borderRadius="full" bg="#F778D7" />
               <Text fontSize="sm" color="gray.600">Dispatch</Text>
             </Flex>
             <Flex align="center" gap={2}>
               <Box w={3} h={3} borderRadius="full" bg="#78A5F7" />
               <Text fontSize="sm" color="gray.600">Deliver</Text>
             </Flex>
           </HStack>
        </Box>

        {/* Resources */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex={{ base: '1', lg: '1.2' }}
          boxShadow="sm"
        >
                     <Flex 
             direction={{ base: 'column', sm: 'row' }}
             justify="space-between" 
             align={{ base: 'start', sm: 'center' }}
             mb={4}
             gap={{ base: 3, sm: 0 }}
           >
             <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Resources</Text>
             <Text 
               fontSize="sm" 
               color="blue.500" 
               cursor="pointer"
               onClick={() => navigate('/resources')}
               _hover={{ color: 'blue.600' }}
               transition="color 0.2s"
             >
               View all
             </Text>
           </Flex>
                     <Text fontSize="sm" color="gray.600" mb={4}>
             {isLoadingResources ? 'Loading...' : `${apiResourcesData.length || 0} resources found`}
           </Text>
          <VStack spacing={3} align="stretch">
                         {(apiResourcesData.length > 0 ? apiResourcesData : fallbackResourcesData).map((resource, index) => (
                             <Flex 
                 key={index} 
                 justify="space-between" 
                 align="center" 
                 p={3} 
                 bg="gray.50" 
                 borderRadius="full"
                 flexWrap="wrap"
                 gap={2}
               >
                                                                  <Text fontSize="sm" color="gray.800" fontWeight="normal">{resource.name}</Text>
                  <Badge 
                    colorScheme={resource.type === 'Machine' ? 'red' : 'blue'} 
                    variant="subtle"
                    fontSize="xs"
                    borderRadius="80px"
                    fontWeight="normal"
                  >
                    {resource.type}
                  </Badge>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Flex>

      {/* Additional Sections - Side by Side */}
      <Flex 
        direction="row"
        gap={{ base: 4, lg: 6 }} 
        mb={6}
        flexWrap="wrap"
      >
        {/* User Roles */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex="1"
          minW="0"
          boxShadow="sm"
        >
                     <Flex 
             direction={{ base: 'column', sm: 'row' }}
             justify="space-between" 
             align={{ base: 'start', sm: 'center' }}
             mb={4}
             gap={{ base: 3, sm: 0 }}
           >
             <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">User roles</Text>
             <Text 
               fontSize="sm" 
               color="blue.500" 
               cursor="pointer"
               onClick={() => navigate('/role')}
               _hover={{ color: 'blue.600' }}
               transition="color 0.2s"
             >
               View all
             </Text>
           </Flex>
                                <Text fontSize="sm" color="gray.600" mb={4}>
             {isLoadingRoles ? 'Loading...' : `${apiRolesData.length || 0} Roles found`}
           </Text>
           <Box overflowX="auto">
             <Table size="sm">
               <Thead>
                 <Tr>
                   <Th fontSize="xs">Role</Th>
                   <Th fontSize="xs">Description</Th>
                   <Th fontSize="xs">Created on</Th>
                   <Th fontSize="xs">Last updated</Th>
                   <Th fontSize="xs">Actions</Th>
                 </Tr>
               </Thead>
               <Tbody>
                 {(apiRolesData.length > 0 ? apiRolesData.slice(0, 3) : fallbackUserRolesData.slice(0, 3)).map((role, index) => {
                  // Format dates for API data
                  const createdOn = role.createdAt ? new Date(role.createdAt).toLocaleDateString('en-GB') : role.createdOn || '';
                  const lastUpdated = role.updatedAt ? new Date(role.updatedAt).toLocaleDateString('en-GB') : role.lastUpdated || '';
                  
                  return (
                    <Tr key={index}>
                      <Td fontSize="xs">{role.role}</Td>
                      <Td fontSize="xs">{role.description}</Td>
                      <Td fontSize="xs">{createdOn}</Td>
                      <Td fontSize="xs">{lastUpdated}</Td>
                      <Td>
                        <HStack spacing={1}>
                          <Icon 
                            as={Eye} 
                            size={14} 
                            color="blue.500" 
                            cursor="pointer" 
                            onClick={() => handleViewRole(role)}
                            _hover={{ color: "blue.600" }}
                          />
                          <Icon 
                            as={Edit} 
                            size={14} 
                            color="green.500" 
                            cursor="pointer" 
                            onClick={() => handleEditRole(role)}
                            _hover={{ color: "green.600" }}
                          />
                          <Icon 
                            as={Trash2} 
                            size={14} 
                            color="red.500" 
                            cursor="pointer" 
                            onClick={() => handleDeleteRole(role)}
                            _hover={{ color: "red.600" }}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Accounts */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex="1"
          minW="0"
          boxShadow="sm"
        >
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between" 
            align={{ base: 'start', sm: 'center' }}
            mb={4}
            gap={{ base: 3, sm: 0 }}
          >
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Accounts</Text>
            <HStack spacing={2}>
              <Select
                value={accountsPeriod}
                onChange={(e) => setAccountsPeriod(e.target.value)}
                size="sm"
                bg="white"
                w={{ base: '28', md: '32' }}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Select>
              {accountsPeriod === 'Yearly' && (
                <Select
                  value={accountsYear}
                  onChange={(e) => setAccountsYear(Number(e.target.value))}
                  size="sm"
                  bg="white"
                  w="20"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              )}
            </HStack>
          </Flex>
          <Box textAlign="center" mb={4}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">
              {isLoadingFinance ? 'Loading...' : `${financeData?.invoices?.total_count || 0} Invoice${financeData?.invoices?.total_count !== 1 ? 's' : ''}`}
            </Text>
          </Box>
          <Box 
            height={{ base: '180px', md: '180px' }}
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexShrink={0}
          >
             {isLoadingFinance ? (
               <Flex justify="center" align="center" height="100%">
                 <Text color="gray.500">Loading finance data...</Text>
               </Flex>
             ) : (
               <Box width="300px" height="180px">
                 <ResponsiveContainer width={300} height={180}>
                   <PieChart width={300} height={180}>
                     <Pie
                       data={accountsData}
                       cx="50%"
                       cy="50%"
                       innerRadius={45}
                       outerRadius={65}
                       startAngle={180}
                       endAngle={0}
                       dataKey="value"
                     >
                   {accountsData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: 'white', 
                     border: '1px solid #E5E7EB',
                     borderRadius: '8px'
                   }}
                   formatter={(value, name) => {
                     return [name, value];
                   }}
                 />
                   </PieChart>
                 </ResponsiveContainer>
               </Box>
             )}
          </Box>
          <VStack spacing={2} mt={4} align="start">
            {accountsData.map((item, index) => (
              <Flex key={index} align="center" gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg={item.color} />
                  <Text fontSize="sm" color="gray.600">{item.name}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Flex>

      {/* Stats Section - BOM and Employees */}
      <Flex 
        direction="row"
        gap={{ base: 4, lg: 6 }} 
        mb={6}
        flexWrap="wrap"
      >
        {/* Total BOM */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex="1"
          minW="0"
          boxShadow="sm"
        >
          <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800" mb={4}>
            BOM Statistics
          </Text>
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" color="blue.500">
              {isLoadingStats ? '...' : statsData?.bom?.total || 0}
            </Text>
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <Text fontSize="xs" color="gray.400">
                Debug: {JSON.stringify(statsData?.bom)}
              </Text>
            )}
            <Text fontSize="sm" color="gray.600" mb={2}>Total BOMs</Text>
            <Flex justify="space-between" mt={4}>
              <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="green.500">
                  {isLoadingStats ? '...' : statsData?.bom?.thisMonth || 0}
                </Text>
                <Text fontSize="xs" color="gray.500">This Month</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="orange.500">
                  {isLoadingStats ? '...' : statsData?.bom?.lastMonth || 0}
                </Text>
                <Text fontSize="xs" color="gray.500">Last Month</Text>
              </Box>
            </Flex>
          </Box>
        </Box>

        {/* Verified Employees */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex="1"
          minW="0"
          boxShadow="sm"
        >
          <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800" mb={4}>
            Employee Statistics
          </Text>
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" color="purple.500">
              {isLoadingStats ? '...' : statsData?.verified_employees?.total || 0}
            </Text>
            <Text fontSize="sm" color="gray.600" mb={2}>Verified Employees</Text>
            <Flex justify="space-between" mt={4}>
              <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="green.500">
                  {isLoadingStats ? '...' : statsData?.verified_employees?.thisMonth || 0}
                </Text>
                <Text fontSize="xs" color="gray.500">This Month</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="orange.500">
                  {isLoadingStats ? '...' : statsData?.verified_employees?.lastMonth || 0}
                </Text>
                <Text fontSize="xs" color="gray.500">Last Month</Text>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Flex>

      <Flex 
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 4, lg: 6 }}
        mb={6}
      >
        {/* Merchant */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex={{ base: '1', lg: '1' }}
          boxShadow="sm"
        >
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between" 
            align={{ base: 'start', sm: 'center' }}
            mb={4}
            gap={{ base: 3, sm: 0 }}
          >
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Merchant</Text>
            <HStack spacing={1}>
              <Select
                value={merchantPeriod}
                onChange={(e) => setMerchantPeriod(e.target.value)}
                size="sm"
                bg="white"
                w={{ base: '28', md: '32' }}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Select>
            </HStack>
          </Flex>
                                           <Box textAlign="center" mb={4}>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">
                {isLoadingMerchant ? 'Loading...' : `${merchantChartData?.totals?.total_merchant || 0} Parties`}
              </Text>
            </Box>
                                               {isLoadingMerchant ? (
                          <Flex justify="center" align="center" height="150px">
                            <Text color="gray.500">Loading merchant data...</Text>
                          </Flex>
                        ) : (
                          <ResponsiveContainer width="100%" height={150}>
                            <PieChart>
                              <Pie
                                data={merchantData}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                dataKey="value"
                              >
                                {merchantData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'white', 
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value, name) => {
                                  if (name === 'Individual') {
                                    const individual = merchantChartData?.individual;
                                    return ['Individual', `${individual?.buyer || 0} Buyer, ${individual?.seller || 0} Seller`];
                                  }
                                  if (name === 'Company') {
                                    const company = merchantChartData?.company;
                                    return ['Company', `${company?.buyer || 0} Buyer, ${company?.seller || 0} Seller`];
                                  }
                                  return [name, value];
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                     <VStack spacing={2} mt={4} align="start">
             <Flex align="center" gap={2}>
               <Box w={3} h={3} borderRadius="full" bg="#6AC6FF" />
               <Text fontSize="sm" color="gray.600">Individual</Text>
             </Flex>
             <Flex align="center" gap={2}>
               <Box w={3} h={3} borderRadius="full" bg="#FF86E1" />
               <Text fontSize="sm" color="gray.600">Company</Text>
             </Flex>
           </VStack>
        </Box>

        {/* Approval */}
        <Box 
          bg="white" 
          p={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          flex={{ base: '1', lg: '1' }}
          boxShadow="sm"
        >
                     <Flex 
             direction={{ base: 'column', sm: 'row' }}
             justify="space-between" 
             align={{ base: 'start', sm: 'center' }}
             mb={4}
             gap={{ base: 3, sm: 0 }}
           >
             <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.800">Approval</Text>
             <Text 
               fontSize="sm" 
               color="blue.500" 
               cursor="pointer"
               onClick={() => navigate('/inventory/approval')}
               _hover={{ color: 'blue.600' }}
               transition="color 0.2s"
             >
               View all
             </Text>
           </Flex>
          <Text fontSize="sm" color="gray.600" mb={4}>
            {isLoadingApproval ? 'Loading...' : `${apiApprovalData.length || 0} Approval found`}
          </Text>
          <Box overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th fontSize="xs">Role</Th>
                  <Th fontSize="xs">BOM Name</Th>
                  <Th fontSize="xs">Material</Th>
                  <Th fontSize="xs">Status</Th>
                  <Th fontSize="xs">Created on</Th>
                  {/* <Th fontSize="xs">Actions</Th> */}
                </Tr>
              </Thead>
                             <Tbody>
                 {(apiApprovalData.length > 0 ? apiApprovalData : fallbackApprovalData).map((item, index) => {
                   // Format dates for API data
                   const createdOn = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : item.createdOn || '';
                   
                   // Determine role based on source
                   const getRole = (source: string) => {
                     return source === 'inventory' ? 'Inventory' : 'Production';
                   };
                   
                   // Get BOM name and material name based on source
                   const getBomName = (item: any) => {
                     if (item.source === 'inventory') {
                       return item.bom_name || 'N/A';
                     } else {
                       return item.bom?.bom_name || 'N/A';
                     }
                   };
                   
                   const getMaterialName = (item: any) => {
                     if (item.source === 'inventory') {
                       return item.name || 'N/A';
                     } else {
                       return item.item?.name || 'N/A';
                     }
                   };
                   
                   // Get status based on source
                   const getStatus = (item: any) => {
                     if (item.source === 'inventory') {
                       return item.bom_status || 'N/A';
                     } else {
                       return item.status || 'N/A';
                     }
                   };
                   
                   return (
                     <Tr key={index}>
                       <Td fontSize="xs">{getRole(item.source)}</Td>
                       <Td fontSize="xs">{getBomName(item)}</Td>
                       <Td fontSize="xs">{getMaterialName(item)}</Td>
                       <Td fontSize="xs">
                         <Badge 
                           colorScheme={getStatus(item) === 'raw material approval pending' ? 'orange' : getStatus(item) === 'completed' ? 'green' : 'blue'} 
                           variant="subtle"
                           fontSize="xs"
                         >
                           {getStatus(item) === 'raw material approval pending' ? 'Pending' : 
                            getStatus(item) === 'completed' ? 'Completed' : 
                            getStatus(item) === 'production in progress' ? 'In Progress' : 
                            getStatus(item) === 'Inventory Allocated' ? 'Allocated' : getStatus(item)}
                         </Badge>
                       </Td>
                       <Td fontSize="xs">{createdOn}</Td>
                         {/* <Td>
                         <HStack spacing={1}>
                           <Icon 
                             as={Eye} 
                             size={14} 
                             color="blue.500" 
                             cursor="pointer" 
                             onClick={() => handleViewRole(item)}
                             _hover={{ color: "blue.600" }}
                           />
                           <Icon 
                             as={Edit} 
                             size={14} 
                             color="green.500" 
                             cursor="pointer" 
                             onClick={() => handleEditRole(item)}
                             _hover={{ color: "green.600" }}
                           />
                           <Icon 
                             as={Trash2} 
                             size={14} 
                             color="red.500" 
                             cursor="pointer" 
                             onClick={() => handleDeleteRole(item)}
                             _hover={{ color: "red.600" }}
                           />
                         </HStack>
                       </Td> */}
                     </Tr>
                   );
                 })}
               </Tbody>
            </Table>
          </Box>
        </Box>
      </Flex>

      {/* Role Modals Component */}
      <RoleModals
        isViewOpen={isViewOpen}
        isEditOpen={isEditOpen}
        isDeleteOpen={isDeleteOpen}
        onViewClose={onViewClose}
        onEditClose={onEditClose}
        onDeleteClose={onDeleteClose}
        selectedRole={selectedRole}
        editForm={editForm}
        setEditForm={setEditForm}
        onSaveEdit={handleSaveEdit}
        onConfirmDelete={handleConfirmDelete}
      />
    </Box>
  );
};

export default Analytics;
      