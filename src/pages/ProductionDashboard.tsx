import React, { useMemo, useState, useEffect } from 'react';
    
    import {
  FileText,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Edit,
  Copy,
  Trash2,
  Users,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { parseCookies } from 'nookies';
import { useNavigate } from 'react-router-dom';

type ChangeType = 'increase' | 'decrease' | 'no-change';

interface MetricCard {
  title: string;
  value: number;
  change: number;
  changeType: ChangeType;
  iconBg: string; // tailwind color bg-*
  icon: React.ReactNode;
}

interface BomRow {
  bomId: string;
  bomName: string;
  bomOwner: string;
  partsCount: number;
  totalCost: number;
  createdOn: string;
  lastUpdated: string;
}

interface ProductionDashboardData {
  success: boolean;
  bom: {
    total: number;
    lastMonth: number;
    thisMonth: number;
  };
  total_production_completed: number;
  production_chart: {
    _id: null;
    completed: number;
    progress: number;
    pre_production: number;
  };
}

interface BomData {
  _id: string;
  bom_id: string;
  bom_name: string;
  parts_count: number;
  total_cost: number;
  createdAt: string;
  updatedAt: string;
  is_production_started: boolean;
  finished_good: {
    item: {
      name: string;
    };
    quantity: number;
  };
}

interface BomApiResponse {
  status: number;
  success: boolean;
  message: string;
  count: number;
  page: number;
  limit: number;
  boms: BomData[];
}

interface ProductionProcessData {
  _id: string;
  finished_good: {
    item: string;
    estimated_quantity: number;
    produced_quantity: number;
    remaining_quantity: number;
  };
  item: {
    _id: string;
    name: string;
    product_id: string;
    uom: string;
    current_stock: number;
    price: number;
  };
  bom: {
    _id: string;
    bom_id: string;
    bom_name: string;
    parts_count: number;
    total_cost: number;
  } | null;
  quantity: number;
  status: string;
  approved: boolean;
  processes: Array<{
    process: string;
    start: boolean;
    done: boolean;
    _id: string;
    work_done?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ProductionProcessApiResponse {
  status: number;
  success: boolean;
  production_processes: ProductionProcessData[];
}

interface BomDetailData {
  other_charges: {
    labour_charges: number;
    machinery_charges: number;
    electricity_charges: number;
    other_charges: number;
  };
  _id: string;
  bom_id: string;
  creator: string;
  is_production_started: boolean;
  raw_materials: Array<{
    _id: string;
    bom: string;
    item: {
      _id: string;
      inventory_category: string;
      name: string;
      product_id: string;
      uom: string;
      uom_used_quantity: string;
      category: string;
      current_stock: number;
      updated_stock: number | null;
      price: number;
      updated_price: number | null;
      approved: boolean;
      item_type: string;
      product_or_service: string;
      store: string;
      price_history: any[];
      createdAt: string;
      updatedAt: string;
      __v: number;
      change_type: string;
      quantity_changed: number;
    };
    description: string;
    quantity: number;
    supporting_doc: string;
    comments: string;
    total_part_cost: number;
    in_production: boolean;
    approvedByAdmin: boolean;
    uom_used_quantity: string;
    approvedByInventoryPersonnel: boolean;
    isInventoryApprovalClicked: boolean;
    isOutForInventoryClicked: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  scrap_materials: Array<{
    _id: string;
    bom: string;
    item: {
      _id: string;
      inventory_category: string;
      name: string;
      product_id: string;
      uom: string;
      uom_used_quantity: string;
      category: string;
      current_stock: number;
      updated_stock: number | null;
      price: number;
      updated_price: number | null;
      approved: boolean;
      item_type: string;
      product_or_service: string;
      store: string;
      price_history: any[];
      createdAt: string;
      updatedAt: string;
      __v: number;
      change_type: string;
      quantity_changed: number;
    };
    description: string;
    quantity: number;
    total_part_cost: number;
    uom_used_quantity: string;
    uom?: string;
    unit_cost?: number;
    scrap_id?: string;
    scrap_name?: string;
    is_production_started: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  resources: Array<{
    resource_id: {
      _id: string;
      name: string;
      type: string;
      specification: string;
      customId: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    type: string;
    specification: string;
    comment: string;
    customId: string;
    _id: string;
  }>;
  manpower: Array<{
    number: string;
    _id: string;
  }>;
  processes: string[];
  finished_good: {
    _id: string;
    item: {
      _id: string;
      inventory_category: string;
      name: string;
      product_id: string;
      uom: string;
      uom_used_quantity: string;
      category: string;
      current_stock: number;
      updated_stock: number | null;
      price: number;
      updated_price: number | null;
      approved: boolean;
      item_type: string;
      product_or_service: string;
      store: string;
      price_history: any[];
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    quantity: number;
    cost: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  approved: boolean;
  bom_name: string;
  parts_count: number;
  total_cost: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  production_process: string;
}

interface BomDetailApiResponse {
  status: number;
  success: boolean;
  bom: BomDetailData;
}

interface ProductionProcessEditData {
  finished_good: {
    item: {
      _id: string;
      inventory_category: string;
      name: string;
      product_id: string;
      uom: string;
      uom_used_quantity: string;
      category: string;
      current_stock: number;
      updated_stock: number | null;
      price: number;
      updated_price: number | null;
      approved: boolean;
      color_name: string;
      item_type: string;
      product_or_service: string;
      store: string;
      price_history: any[];
      createdAt: string;
      updatedAt: string;
      __v: number;
      change_type: string;
      quantity_changed: number;
      latest_price: number;
    };
    estimated_quantity: number;
    produced_quantity: number;
    remaining_quantity: number;
  };
  _id: string;
  creator: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    isSuper: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    address: string;
    cpny_name: string;
    GSTIN: string;
    Account_No: string;
    Bank_Name: string;
    IFSC_Code: string;
  };
  item: {
    _id: string;
    inventory_category: string;
    name: string;
    product_id: string;
    uom: string;
    uom_used_quantity: string;
    category: string;
    current_stock: number;
    updated_stock: number | null;
    price: number;
    updated_price: number | null;
    approved: boolean;
    color_name: string;
    item_type: string;
    product_or_service: string;
    store: string;
    price_history: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    change_type: string;
    quantity_changed: number;
    latest_price: number;
  };
  bom: {
    other_charges: {
      labour_charges: number;
      machinery_charges: number;
      electricity_charges: number;
      other_charges: number;
    };
    _id: string;
    bom_id: string;
    creator: any;
    is_production_started: boolean;
    raw_materials: any[];
    scrap_materials: any[];
    resources: any[];
    manpower: any[];
    processes: string[];
    finished_good: any;
    approved: boolean;
    bom_name: string;
    parts_count: number;
    total_cost: number;
    remarks: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    production_process: string;
  };
  quantity: number;
  rm_store: {
    _id: string;
    name: string;
    address_line1: string;
    address_line2: string;
    pincode: number;
    city: string;
    state: string;
    approved: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  fg_store: {
    _id: string;
    name: string;
    address_line1: string;
    address_line2: string;
    pincode: number;
    city: string;
    state: string;
    approved: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  scrap_store: {
    _id: string;
    name: string;
    address_line1: string;
    address_line2: string;
    pincode: number;
    city: string;
    state: string;
    approved: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  status: string;
  approved: boolean;
  processes: Array<{
    process: string;
    start: boolean;
    done: boolean;
    _id: string;
  }>;
  raw_materials: Array<{
    item: {
      _id: string;
      inventory_category: string;
      name: string;
      product_id: string;
      uom: string;
      uom_used_quantity: string;
      category: string;
      current_stock: number;
      updated_stock: number | null;
      price: number;
      updated_price: number | null;
      approved: boolean;
      color_name: string;
      item_type: string;
      product_or_service: string;
      store: any;
      price_history: any[];
      createdAt: string;
      updatedAt: string;
      __v: number;
      change_type: string;
      quantity_changed: number;
      latest_price: number;
    };
    estimated_quantity: number;
    used_quantity: number;
    remaining_quantity: number;
    _id: string;
  }>;
  scrap_materials: Array<{
    item: string;
    estimated_quantity: number;
    produced_quantity: number;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProductionProcessEditApiResponse {
  status: number;
  success: boolean;
  production_process: ProductionProcessEditData;
}

const mockBoms: BomRow[] = [
  { bomId: 'BOM009', bomName: 'Testing', bomOwner: 'John', partsCount: 3, totalCost: 15, createdOn: '28/08/2025', lastUpdated: '27/08/2025' },
  { bomId: 'BOM008', bomName: 'John', bomOwner: 'Direct', partsCount: 3, totalCost: 3, createdOn: '27/08/2025', lastUpdated: '27/08/2025' },
  { bomId: 'BOM009', bomName: 'Testing', bomOwner: 'Direct', partsCount: 3, totalCost: 15, createdOn: '28/08/2025', lastUpdated: '27/08/2025' },
  { bomId: 'BOM008', bomName: 'John', bomOwner: 'Direct', partsCount: 3, totalCost: 3, createdOn: '27/08/2025', lastUpdated: '27/08/2025' },
  { bomId: 'BOM009', bomName: 'Testing', bomOwner: 'Direct', partsCount: 3, totalCost: 15, createdOn: '28/08/2025', lastUpdated: '27/08/2025' },
];

const ProductionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bom' | 'pre' | 'status'>('bom');
  const [dashboardData, setDashboardData] = useState<ProductionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bomData, setBomData] = useState<BomData[]>([]);
  const [bomLoading, setBomLoading] = useState(false);
  const [bomError, setBomError] = useState<string | null>(null);
  const [allProductionProcessData, setAllProductionProcessData] = useState<ProductionProcessData[]>([]);
  const [productionProcessLoading, setProductionProcessLoading] = useState(false);
  const [productionProcessError, setProductionProcessError] = useState<string | null>(null);
  const [bomDetailData, setBomDetailData] = useState<BomDetailData | null>(null);
  const [bomDetailLoading, setBomDetailLoading] = useState(false);
  const [bomDetailError, setBomDetailError] = useState<string | null>(null);
  const [showBomDetailModal, setShowBomDetailModal] = useState(false);
  const [bomEditData, setBomEditData] = useState<BomDetailData | null>(null);
  const [bomEditLoading, setBomEditLoading] = useState(false);
  const [bomEditError, setBomEditError] = useState<string | null>(null);
  const [showBomEditModal, setShowBomEditModal] = useState(false);
  const [bomEditFormData, setBomEditFormData] = useState<Partial<BomDetailData>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBomId, setDeletingBomId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productionProcessEditData, setProductionProcessEditData] = useState<ProductionProcessEditData | null>(null);
  const [productionProcessEditLoading, setProductionProcessEditLoading] = useState(false);
  const [productionProcessEditError, setProductionProcessEditError] = useState<string | null>(null);
  const [showProductionProcessEditModal, setShowProductionProcessEditModal] = useState(false);
  const [productionProcessEditFormData, setProductionProcessEditFormData] = useState<Partial<ProductionProcessEditData>>({});
  const [showProductionProcessDeleteModal, setShowProductionProcessDeleteModal] = useState(false);
  const [deletingProductionProcessId, setDeletingProductionProcessId] = useState<string | null>(null);
  const [productionProcessDeleteLoading, setProductionProcessDeleteLoading] = useState(false);
  const [pausingProcessId, setPausingProcessId] = useState<string | null>(null);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [scrapCatalog, setScrapCatalog] = useState<any[]>([]);
  const [scrapLoading, setScrapLoading] = useState(false);

  const fetchScrapCatalog = async () => {
    try {
      setScrapLoading(true);
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (!token) return;
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}scrap/get?limit=${500}&page=${1}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data?.data)) setScrapCatalog(data.data);
    } catch (_) {
    } finally {
      setScrapLoading(false);
    }
  };

  // Fetch production dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the access token from cookies
        const cookies = parseCookies();
        const token = cookies?.access_token;

        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
        const response = await fetch(`${backendUrl}dashboard/production-dashboard`, {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else if (response.status === 403) {
            throw new Error('Access denied. You do not have permission to view this data.');
          } else if (response.status === 404) {
            throw new Error('API endpoint not found. Please check the backend configuration.');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const data: ProductionDashboardData = await response.json();
        
        if (data.success) {
          setDashboardData(data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
        toast.error(`Error loading dashboard: ${errorMessage}`);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch data when component mounts based on active tab
  useEffect(() => {
    if (activeTab === 'bom') {
      fetchBomData();
    } else if (activeTab === 'pre' || activeTab === 'status') {
      if (allProductionProcessData.length === 0) {
        fetchProductionProcessData();
      }
    }
  }, [activeTab, allProductionProcessData.length]);

  const metrics: MetricCard[] = useMemo(() => {
    if (!dashboardData) {
      // Return default values while loading
      return [
    {
      title: 'Total BOM',
          value: 0,
          change: 0,
          changeType: 'no-change',
      iconBg: 'bg-rose-500',
      icon: <FileText className="text-white" size={20} />,
    },
    {
      title: 'Completed',
          value: 0,
          change: 0,
          changeType: 'no-change',
      iconBg: 'bg-amber-500',
      icon: <CheckCircle className="text-white" size={20} />,
    },
    {
      title: 'Progress',
          value: 0,
          change: 0,
          changeType: 'no-change',
      iconBg: 'bg-emerald-500',
      icon: <Users className="text-white" size={20} />,
    },
    {
      title: 'Pre production',
          value: 0,
      change: 0,
      changeType: 'no-change',
      iconBg: 'bg-cyan-500',
      icon: <Users className="text-white" size={20} />,
    },
      ];
    }

    // Calculate change for BOM (this month vs last month)
    const bomChange = dashboardData.bom.thisMonth - dashboardData.bom.lastMonth;
    const bomChangeType: ChangeType = bomChange > 0 ? 'increase' : bomChange < 0 ? 'decrease' : 'no-change';

    return [
      {
        title: 'Total BOM',
        value: dashboardData.bom.total,
        change: Math.abs(bomChange),
        changeType: bomChangeType,
        iconBg: 'bg-rose-500',
        icon: <FileText className="text-white" size={20} />,
      },
      {
        title: 'Completed',
        value: dashboardData.production_chart.completed,
        change: 0, // No change data available for completed
        changeType: 'no-change',
        iconBg: 'bg-amber-500',
        icon: <CheckCircle className="text-white" size={20} />,
      },
      {
        title: 'Progress',
        value: dashboardData.production_chart.progress,
        change: 0, // No change data available for progress
        changeType: 'no-change',
        iconBg: 'bg-emerald-500',
        icon: <Users className="text-white" size={20} />,
      },
      {
        title: 'Pre production',
        value: dashboardData.production_chart.pre_production,
        change: 0, // No change data available for pre-production
        changeType: 'no-change',
        iconBg: 'bg-cyan-500',
        icon: <Users className="text-white" size={20} />,
      },
    ];
  }, [dashboardData]);

  const getChangeIcon = (type: ChangeType, title: string) => {
    // Only show change icon for Total BOM card
    if (title === 'Total BOM') {
    if (type === 'increase') return <TrendingUp className="text-green-500" size={16} />;
    if (type === 'decrease') return <TrendingDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-400" size={16} />;
    }
    // For other cards, return null to hide the icon
    return null;
  };

  const getChangeText = (type: ChangeType, value: number, title: string) => {
    // Only show change text for Total BOM card
    if (title === 'Total BOM') {
    if (type === 'increase') return `${value} ▲ v/s last month`;
    if (type === 'decrease') return `${value} ▾ v/s last month`;
    return `${value} ▲ v/s last month`;
    }
    // For other cards, return empty string to hide the change text
    return '';
  };

  const getTabDisplayName = (tab: 'bom' | 'pre' | 'status') => {
    switch (tab) {
      case 'bom': return 'BOM';
      case 'pre': return 'Pre-production';
      case 'status': return 'Production status';
      default: return 'BOM';
    }
  };

  const handleTabChange = (tab: 'bom' | 'pre' | 'status') => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
    
    // Fetch data based on selected tab
    if (tab === 'bom') {
      fetchBomData();
    } else if (tab === 'pre' || tab === 'status') {
      // Both pre-production and production status use the same API
      if (allProductionProcessData.length === 0) {
        fetchProductionProcessData();
      }
    }
  };

  // Filter functions for different tabs
  const getPreProductionData = () => {
    const preProductionStatuses = [
      'raw material approval pending',
      'inventory allocated', 
      'request for allow inventory',
      'inventory in transit'
    ];
    return allProductionProcessData.filter(process => 
      preProductionStatuses.includes(process.status.toLowerCase())
    );
  };
      
  const getProductionStatusData = () => {
    const preProductionStatuses = [
      'raw material approval pending',
      'inventory allocated', 
      'request for allow inventory',
      'inventory in transit'
    ];
    return allProductionProcessData.filter(process => 
      !preProductionStatuses.includes(process.status.toLowerCase())
    );
  };

  // Fetch BOM data
  const fetchBomData = async () => {
    try {
      setBomLoading(true);
      setBomError(null);
      
      // Get the access token from cookies
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}bom/all`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this data.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check the backend configuration.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: BomApiResponse = await response.json();
      
      if (data.success) {
        setBomData(data.boms);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch BOM data';
      setBomError(errorMessage);
      toast.error(`Error loading BOM data: ${errorMessage}`);
      console.error('Error fetching BOM data:', err);
    } finally {
      setBomLoading(false);
    }
  };

  // Fetch BOM detail data
  const fetchBomDetail = async (bomId: string) => {
    try {
      setBomDetailLoading(true);
      setBomDetailError(null);
      
      // Get the access token from cookies
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}bom/${bomId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this data.');
        } else if (response.status === 404) {
          throw new Error('BOM not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: BomDetailApiResponse = await response.json();
      
      if (data.success) {
        setBomDetailData(data.bom);
        setShowBomDetailModal(true);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch BOM detail';
      setBomDetailError(errorMessage);
      toast.error(`Error loading BOM detail: ${errorMessage}`);
      console.error('Error fetching BOM detail:', err);
    } finally {
      setBomDetailLoading(false);
    }
  };

  // Fetch BOM edit data
  const fetchBomEdit = async (bomId: string) => {
    try {
      setBomEditLoading(true);
      setBomEditError(null);
      
      // Get the access token from cookies
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}bom/${bomId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this data.');
        } else if (response.status === 404) {
          throw new Error('BOM not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: BomDetailApiResponse = await response.json();
      
      if (data.success) {
        setBomEditData(data.bom);
        setBomEditFormData(data.bom);
        setShowBomEditModal(true);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch BOM edit data';
      setBomEditError(errorMessage);
      toast.error(`Error loading BOM edit data: ${errorMessage}`);
      console.error('Error fetching BOM edit data:', err);
    } finally {
      setBomEditLoading(false);
    }
  };

  // Handle BOM edit form submission
  const handleBomEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bomEditData) return;

    try {
      setBomEditLoading(true);
      setBomEditError(null);
      
      // Get the access token from cookies
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}bom/${bomEditData._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bomEditFormData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to edit this BOM.');
        } else if (response.status === 404) {
          throw new Error('BOM not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('BOM updated successfully!');
        setShowBomEditModal(false);
        // Refresh BOM data
        fetchBomData();
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update BOM';
      setBomEditError(errorMessage);
      toast.error(`Error updating BOM: ${errorMessage}`);
      console.error('Error updating BOM:', err);
    } finally {
      setBomEditLoading(false);
    }
  };

  // Handle form input changes
  const handleBomEditInputChange = (field: string, value: any) => {
    setBomEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch Production Process edit data
  const fetchProductionProcessEdit = async (processId: string) => {
    try {
      setProductionProcessEditLoading(true);
      setProductionProcessEditError(null);
      
      // Get the access token from cookies
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}production-process/${processId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this data.');
        } else if (response.status === 404) {
          throw new Error('Production process not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: ProductionProcessEditApiResponse = await response.json();
      
      if (data.success) {
        setProductionProcessEditData(data.production_process);
        setProductionProcessEditFormData(data.production_process);
        setShowProductionProcessEditModal(true);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch production process edit data';
      setProductionProcessEditError(errorMessage);
      toast.error(`Error loading production process edit data: ${errorMessage}`);
      console.error('Error fetching production process edit data:', err);
    } finally {
      setProductionProcessEditLoading(false);
    }
  };

  // Handle Production Process edit form submission
  const handleProductionProcessEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productionProcessEditData) return;

    try {
      setProductionProcessEditLoading(true);
      setProductionProcessEditError(null);
      
      // Get the access token from cookies
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}production-process/${productionProcessEditData._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productionProcessEditFormData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to edit this production process.');
        } else if (response.status === 404) {
          throw new Error('Production process not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Production process updated successfully!');
        setShowProductionProcessEditModal(false);
        // Refresh production process data
        fetchProductionProcessData();
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update production process';
      setProductionProcessEditError(errorMessage);
      toast.error(`Error updating production process: ${errorMessage}`);
      console.error('Error updating production process:', err);
    } finally {
      setProductionProcessEditLoading(false);
    }
  };

  // Handle Production Process form input changes
  const handleProductionProcessEditInputChange = (field: string, value: any) => {
    setProductionProcessEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch Production Process data
  const fetchProductionProcessData = async () => {
    try {
      setProductionProcessLoading(true);
      setProductionProcessError(null);
      
      // Get the access token from cookies
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}production-process/all`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this data.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check the backend configuration.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: ProductionProcessApiResponse = await response.json();
      
      if (data.success) {
        setAllProductionProcessData(data.production_processes);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch production process data';
      setProductionProcessError(errorMessage);
      toast.error(`Error loading production process data: ${errorMessage}`);
      console.error('Error fetching production process data:', err);
    } finally {
      setProductionProcessLoading(false);
    }
  };

  const handleViewAll = () => {
    // Navigate to appropriate page based on selected tab
    switch (activeTab) {
      case 'bom':
        navigate('/production/bom');
        break;
      case 'pre':
        navigate('/production/pre-production');
        break;
      case 'status':
        navigate('/production/production-status');
        break;
      default:
        navigate('/production/bom');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    fetchScrapCatalog();
  }, []);

  // Open delete confirmation for a BOM id
  const confirmDeleteBom = (bomId: string) => {
    setDeletingBomId(bomId);
    setShowDeleteModal(true);
  };

  // Perform delete
  const handleDeleteBom = async () => {
    if (!deletingBomId) return;
    try {
      setDeleteLoading(true);
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}bom/${deletingBomId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to delete this BOM.');
        } else if (response.status === 404) {
          throw new Error('BOM not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data = await response.json();
      if (data.success) {
        toast.success('BOM has been deleted successfully');
        setShowDeleteModal(false);
        setDeletingBomId(null);
        // Refresh list
        fetchBomData();
      } else {
        throw new Error('Failed to delete BOM');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete BOM';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open delete confirmation for a Production Process id
  const confirmDeleteProductionProcess = (processId: string) => {
    setDeletingProductionProcessId(processId);
    setShowProductionProcessDeleteModal(true);
  };

  // Perform Production Process delete
  const handleDeleteProductionProcess = async () => {
    if (!deletingProductionProcessId) return;
    try {
      setProductionProcessDeleteLoading(true);
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}production-process/${deletingProductionProcessId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to delete this production process.');
        } else if (response.status === 404) {
          throw new Error('Production process not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data = await response.json();
      if (data.success) {
        toast.success('Production process has been deleted successfully');
        setShowProductionProcessDeleteModal(false);
        setDeletingProductionProcessId(null);
        // Refresh list
        fetchProductionProcessData();
      } else {
        throw new Error('Failed to delete production process');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete production process';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setProductionProcessDeleteLoading(false);
    }
  };

  // Handle pause production process
  const handlePauseProductionProcess = async (processId: string) => {
    try {
      setPauseLoading(true);
      setPausingProcessId(processId);
      
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}production-process/pause`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ _id: processId }),
      });
      
      console.log('Pause API Response Status:', response.status);
      console.log('Pause API Response:', response);
      
      if (!response.ok) {
        // Try to get the error message from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If we can't parse the error response, use the default message
        }
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to pause this production process.');
        } else if (response.status === 404) {
          throw new Error('Production process not found.');
        } else if (response.status === 400) {
          throw new Error(`Bad Request: ${errorMessage}`);
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(errorMessage);
        }
      }
      
      const data = await response.json();
      if (data.success) {
        toast.success('Production process paused successfully');
        // Refresh the production process data to show updated status
        fetchProductionProcessData();
      } else {
        throw new Error('Failed to pause production process');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause production process';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setPauseLoading(false);
      setPausingProcessId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="px-6 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Production Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your production processes and manufacturing progress</p>
          </div>
        </div>

        {/* Top metric cards */}
        {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">{m.title}</h3>
                <div className={`w-12 h-12 ${m.iconBg} rounded-lg flex items-center justify-center`}>
                  {m.icon}
                </div>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-800">{m.value}</span>
              </div>
                {m.title === 'Total BOM' && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                    {getChangeIcon(m.changeType, m.title)}
                    {getChangeText(m.changeType, m.change, m.title) && (
                <span className={m.changeType === 'increase' ? 'text-green-600' : m.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'}>
                        {getChangeText(m.changeType, m.change, m.title)}
                </span>
                    )}
              </div>
                )}
            </div>
          ))}
        </div>
        )}

        {/* Production Section */}
        {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Production</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative dropdown-container">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span>{getTabDisplayName(activeTab)}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleTabChange('bom')}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            activeTab === 'bom' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                        >
                          BOM
                        </button>
                        <button
                          onClick={() => handleTabChange('pre')}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            activeTab === 'pre' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                        >
                          Pre-production
                        </button>
                        <button
                          onClick={() => handleTabChange('status')}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            activeTab === 'status' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                        >
                          Production status
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                  <button 
                    onClick={handleViewAll}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    View All
                  </button>
                </div>
            </div>
              <p className="text-gray-600">
                {activeTab === 'bom' 
                  ? `${bomData.length} BOMs Found` 
                  : activeTab === 'pre'
                  ? `${getPreProductionData().length} Pre-production Items Found`
                  : activeTab === 'status'
                  ? `${getProductionStatusData().length} Production Status Items Found`
                  : `${mockBoms.length} Products Found`
                }
              </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    {activeTab === 'pre' || activeTab === 'status' ? (
                      <>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOM ID</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    ) : (
                      <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOM Id</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOM Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parts Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === 'bom' ? (
                    // Show BOM data
                    bomLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading BOM data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : bomError ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                          Error loading BOM data: {bomError}
                        </td>
                      </tr>
                    ) : bomData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No BOM data found
                        </td>
                      </tr>
                    ) : (
                      bomData.slice(0, 5).map((bom, idx) => (
                        <tr key={bom._id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bom.bom_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bom.bom_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bom.parts_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{bom.total_cost}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(bom.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3 text-gray-500">
                              <Eye size={16} className="hover:text-blue-600 cursor-pointer" onClick={() => fetchBomDetail(bom._id)} />
                              <Edit size={16} className="hover:text-amber-600 cursor-pointer" onClick={() => fetchBomEdit(bom._id)} />
                              <Trash2 size={16} className="hover:text-red-600 cursor-pointer" onClick={() => confirmDeleteBom(bom._id)} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  ) : activeTab === 'pre' ? (
                    // Show Pre-production data (filtered)
                    productionProcessLoading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading pre-production data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : productionProcessError ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-red-600">
                          Error loading pre-production data: {productionProcessError}
                        </td>
                      </tr>
                    ) : getPreProductionData().length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No pre-production data found
                        </td>
                      </tr>
                    ) : (
                      getPreProductionData().slice(0, 5).map((process, idx) => {
                        
                        return (
                          <tr key={process._id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{process.item?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {process.bom ? process.bom.bom_id : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                process.status === 'completed' 
                                  ? 'bg-green-50 text-green-700'
                                  : process.status === 'production in progress'
                                  ? 'bg-blue-50 text-blue-700'
                                  : process.status === 'production started'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : process.status === 'production paused'
                                  ? 'bg-orange-50 text-orange-700'
                                  : 'bg-gray-50 text-gray-700'
                              }`}>
                                {process.status.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(process.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {/* Edit Button */}
                                <button
                                  onClick={() => navigate('/production/pre-production')}
                                  className="px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 hover:shadow-sm"
                                  style={{
                                    color: '#2563eb',
                                    backgroundColor: '#eff6ff',
                                    borderColor: '#bfdbfe',
                                  }}
                                  title="Edit process"
                                >
                                  Edit
                                </button>
                                
                                {/* Delete Button */}
                                <button
                                  onClick={() => confirmDeleteProductionProcess(process._id)}
                                  className="px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 hover:shadow-sm"
                                  style={{
                                    color: '#dc2626',
                                    backgroundColor: '#fef2f2',
                                    borderColor: '#fecaca',
                                  }}
                                  title="Delete process"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )
                  ) : activeTab === 'status' ? (
                    // Show Production Status data (filtered)
                    productionProcessLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading production status data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : productionProcessError ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                          Error loading production status data: {productionProcessError}
                        </td>
                      </tr>
                    ) : getProductionStatusData().length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No production status data found
                        </td>
                      </tr>
                    ) : (
                      getProductionStatusData().slice(0, 5).map((process, idx) => {
                        
                        return (
                          <tr key={process._id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{process.item?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {process.bom ? process.bom.bom_id : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                process.status === 'completed' 
                                  ? 'bg-green-50 text-green-700'
                                  : process.status === 'production in progress'
                                  ? 'bg-blue-50 text-blue-700'
                                  : process.status === 'production started'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : process.status === 'production paused'
                                  ? 'bg-orange-50 text-orange-700'
                                  : process.status === 'received'
                                  ? 'bg-purple-50 text-purple-700'
                                  : process.status === 'moved to inventory'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-50 text-gray-700'
                              }`}>
                                {process.status.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(process.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {/* Start Button */}
                                {process.status !== 'completed' && (
                                  <button
                                    onClick={() => navigate('/production/production-status')}
                                    className="px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 hover:shadow-sm"
                                    style={{
                                      color: '#2563eb',
                                      backgroundColor: '#eff6ff',
                                      borderColor: '#bfdbfe',
                                    }}
                                    title="Start process"
                                  >
                                    Start
                                  </button>
                                )}
                                
                                {/* Pause Button */}
                                {process.status !== 'completed' && process.status !== 'production paused' && (
                                  <button
                                    onClick={() => handlePauseProductionProcess(process._id)}
                                    disabled={pauseLoading && pausingProcessId === process._id}
                                    className="px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                      color: '#dc2626',
                                      backgroundColor: '#fef2f2',
                                      borderColor: '#fecaca',
                                    }}
                                    title="Pause process"
                                  >
                                    {pauseLoading && pausingProcessId === process._id ? 'Pausing...' : 'Pause'}
                                  </button>
                                )}
                                
                                {/* Delete Button */}
                                <button
                                  onClick={() => confirmDeleteProductionProcess(process._id)}
                                  className="px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 hover:shadow-sm"
                                  style={{
                                    color: '#dc2626',
                                    backgroundColor: '#fef2f2',
                                    borderColor: '#fecaca',
                                  }}
                                  title="Delete process"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )
                  ) : (
                    // Show mock data for other tabs
                    mockBoms.map((row, idx) => (
                  <tr key={row.bomId} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.bomId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.bomName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">Direct</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{row.totalCost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.createdOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.lastUpdated}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3 text-gray-500">
                        <Eye size={16} className="hover:text-blue-600 cursor-pointer" />
                        <Edit size={16} className="hover:text-amber-600 cursor-pointer" />
                        <Trash2 size={16} className="hover:text-red-600 cursor-pointer" onClick={() => confirmDeleteBom(row.bomId)} />
                      </div>
                    </td>
                  </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* BOM Detail Modal */}
  {showBomDetailModal && bomDetailData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">BOM Details - {bomDetailData.bom_name}</h2>
                <button
                  onClick={() => setShowBomDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {bomDetailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading BOM details...</span>
                </div>
              ) : bomDetailError ? (
                <div className="text-center py-8 text-red-600">
                  Error: {bomDetailError}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">BOM ID:</span> {bomDetailData.bom_id}
                      </div>
                      <div>
                        <span className="font-medium">BOM Name:</span> {bomDetailData.bom_name}
                      </div>
                      <div>
                        <span className="font-medium">Parts Count:</span> {bomDetailData.parts_count}
                      </div>
                      <div>
                        <span className="font-medium">Total Cost:</span> ₹{bomDetailData.total_cost}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          bomDetailData.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bomDetailData.approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Production Started:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          bomDetailData.is_production_started ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bomDetailData.is_production_started ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Finished Good */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Finished Good</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Product:</span> {bomDetailData.finished_good.item.name}
                      </div>
                      <div>
                        <span className="font-medium">Product ID:</span> {bomDetailData.finished_good.item.product_id}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span> {bomDetailData.finished_good.quantity} {bomDetailData.finished_good.item.uom}
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> ₹{bomDetailData.finished_good.cost}
                      </div>
                    </div>
                  </div>

                  {/* Raw Materials */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Raw Materials</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bomDetailData.raw_materials.map((material, idx) => (
                            <tr key={material._id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{material.item.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{material.item.product_id}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{material.quantity}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{material.item.uom}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">₹{material.item.price}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">₹{material.total_part_cost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Scrap Materials */}
                  {bomDetailData.scrap_materials.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Scrap Materials</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item ID</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bomDetailData.scrap_materials.map((material, idx) => (
                              <tr key={material._id}>
                                <td className="px-4 py-2 text-sm text-gray-900">{material.item?.name || material.scrap_name || (scrapCatalog.find((s:any) => s._id === (material.item?._id || material.item))?.Scrap_name) || "N/A"}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{material.item?.product_id || material.scrap_id || (scrapCatalog.find((s:any) => s._id === (material.item?._id || material.item))?.Scrap_id) || "N/A"}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{material.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{material.item?.uom || material.uom || (scrapCatalog.find((s:any) => s._id === (material.item?._id || material.item))?.uom) || "N/A"}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">₹{material.total_part_cost}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {bomDetailData.resources.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Resources</h3>
                      <div className="space-y-2">
                        {bomDetailData.resources.map((resource, idx) => (
                          <div key={resource._id} className="bg-white p-3 rounded border">
                            <div className="grid grid-cols-2 gap-2">
                              <div><span className="font-medium">Name:</span> {resource.resource_id.name}</div>
                              <div><span className="font-medium">Type:</span> {resource.type}</div>
                              <div><span className="font-medium">Specification:</span> {resource.specification}</div>
                              <div><span className="font-medium">Custom ID:</span> {resource.customId}</div>
                            </div>
                            {resource.comment && (
                              <div className="mt-2">
                                <span className="font-medium">Comment:</span> {resource.comment}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manpower */}
                  {bomDetailData.manpower.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Manpower</h3>
                      <div className="space-y-2">
                        {bomDetailData.manpower.map((person, idx) => (
                          <div key={person._id} className="bg-white p-3 rounded border">
                            <span className="font-medium">Number of People:</span> {person.number}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Processes */}
                  {bomDetailData.processes.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Processes</h3>
                      <div className="flex flex-wrap gap-2">
                        {bomDetailData.processes.map((process, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {process}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Charges */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Other Charges</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><span className="font-medium">Labour Charges:</span> ₹{bomDetailData.other_charges.labour_charges}</div>
                      <div><span className="font-medium">Machinery Charges:</span> ₹{bomDetailData.other_charges.machinery_charges}</div>
                      <div><span className="font-medium">Electricity Charges:</span> ₹{bomDetailData.other_charges.electricity_charges}</div>
                      <div><span className="font-medium">Other Charges:</span> ₹{bomDetailData.other_charges.other_charges}</div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {bomDetailData.remarks && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Remarks</h3>
                      <p className="text-gray-700">{bomDetailData.remarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOM Edit Modal */}
      {showBomEditModal && bomEditData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit BOM - {bomEditData.bom_name}</h2>
                <button
                  onClick={() => setShowBomEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {bomEditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading BOM data...</span>
                </div>
              ) : bomEditError ? (
                <div className="text-center py-8 text-red-600">
                  Error: {bomEditError}
                </div>
              ) : (
                <form onSubmit={handleBomEditSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BOM Name</label>
                        <input
                          type="text"
                          value={bomEditFormData.bom_name || ''}
                          onChange={(e) => handleBomEditInputChange('bom_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parts Count</label>
                        <input
                          type="number"
                          value={bomEditFormData.parts_count || 0}
                          onChange={(e) => handleBomEditInputChange('parts_count', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                        <input
                          type="number"
                          value={bomEditFormData.total_cost || 0}
                          onChange={(e) => handleBomEditInputChange('total_cost', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={bomEditFormData.approved ? 'approved' : 'pending'}
                          onChange={(e) => handleBomEditInputChange('approved', e.target.value === 'approved')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Finished Good */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Finished Good</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={bomEditFormData.finished_good?.item?.name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                        <input
                          type="text"
                          value={bomEditFormData.finished_good?.item?.product_id || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={bomEditFormData.finished_good?.quantity || 0}
                          onChange={(e) => handleBomEditInputChange('finished_good', {
                            ...bomEditFormData.finished_good,
                            quantity: parseInt(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                        <input
                          type="number"
                          value={bomEditFormData.finished_good?.cost || 0}
                          onChange={(e) => handleBomEditInputChange('finished_good', {
                            ...bomEditFormData.finished_good,
                            cost: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Raw Materials */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Raw Materials</h3>
                    <div className="space-y-4">
                      {bomEditFormData.raw_materials?.map((material, idx) => (
                        <div key={material._id} className="bg-white p-4 rounded border">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                              <input
                                type="text"
                                value={material.item.name}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                              <input
                                type="text"
                                value={material.item.product_id}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                              <input
                                type="number"
                                value={material.quantity}
                                onChange={(e) => {
                                  const newMaterials = [...(bomEditFormData.raw_materials || [])];
                                  newMaterials[idx] = { ...newMaterials[idx], quantity: parseInt(e.target.value) };
                                  handleBomEditInputChange('raw_materials', newMaterials);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                              <input
                                type="text"
                                value={material.item.uom}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                              <input
                                type="number"
                                value={material.item.price}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                              <input
                                type="number"
                                value={material.total_part_cost}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Other Charges */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Other Charges</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Labour Charges</label>
                        <input
                          type="number"
                          value={bomEditFormData.other_charges?.labour_charges || 0}
                          onChange={(e) => handleBomEditInputChange('other_charges', {
                            ...bomEditFormData.other_charges,
                            labour_charges: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Machinery Charges</label>
                        <input
                          type="number"
                          value={bomEditFormData.other_charges?.machinery_charges || 0}
                          onChange={(e) => handleBomEditInputChange('other_charges', {
                            ...bomEditFormData.other_charges,
                            machinery_charges: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Electricity Charges</label>
                        <input
                          type="number"
                          value={bomEditFormData.other_charges?.electricity_charges || 0}
                          onChange={(e) => handleBomEditInputChange('other_charges', {
                            ...bomEditFormData.other_charges,
                            electricity_charges: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Other Charges</label>
                        <input
                          type="number"
                          value={bomEditFormData.other_charges?.other_charges || 0}
                          onChange={(e) => handleBomEditInputChange('other_charges', {
                            ...bomEditFormData.other_charges,
                            other_charges: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Remarks</h3>
                    <textarea
                      value={bomEditFormData.remarks || ''}
                      onChange={(e) => handleBomEditInputChange('remarks', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter remarks..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowBomEditModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bomEditLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bomEditLoading ? 'Updating...' : 'Update BOM'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Delete BOM?</h3>
              <p className="mt-2 text-sm text-gray-600">This action cannot be undone. Are you sure you want to delete this BOM?</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeletingBomId(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBom}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Process Edit Modal */}
      {showProductionProcessEditModal && productionProcessEditData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Production Process - {productionProcessEditData.item.name}</h2>
                <button
                  onClick={() => setShowProductionProcessEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {productionProcessEditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading production process data...</span>
                </div>
              ) : productionProcessEditError ? (
                <div className="text-center py-8 text-red-600">
                  Error: {productionProcessEditError}
                </div>
              ) : (
                <form onSubmit={handleProductionProcessEditSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={productionProcessEditFormData.item?.name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                        <input
                          type="text"
                          value={productionProcessEditFormData.item?.product_id || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={productionProcessEditFormData.quantity || 0}
                          onChange={(e) => handleProductionProcessEditInputChange('quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={productionProcessEditFormData.status || ''}
                          onChange={(e) => handleProductionProcessEditInputChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="raw material approval pending">Raw Material Approval Pending</option>
                          <option value="inventory allocated">Inventory Allocated</option>
                          <option value="request for allow inventory">Request for Allow Inventory</option>
                          <option value="inventory in transit">Inventory in Transit</option>
                          <option value="production started">Production Started</option>
                          <option value="production in progress">Production in Progress</option>
                          <option value="completed">Completed</option>
                          <option value="received">Received</option>
                          <option value="moved to inventory">Moved to Inventory</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* BOM Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">BOM Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BOM ID</label>
                        <input
                          type="text"
                          value={productionProcessEditFormData.bom?.bom_id || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BOM Name</label>
                        <input
                          type="text"
                          value={productionProcessEditFormData.bom?.bom_name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Raw Materials */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Raw Materials</h3>
                    <div className="space-y-4">
                      {productionProcessEditFormData.raw_materials?.map((material, idx) => (
                        <div key={material._id} className="bg-white p-4 rounded border">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                              <input
                                type="text"
                                value={material.item.name}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                              <input
                                type="text"
                                value={material.item.product_id}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Quantity</label>
                              <input
                                type="number"
                                value={material.estimated_quantity}
                                onChange={(e) => {
                                  const newMaterials = [...(productionProcessEditFormData.raw_materials || [])];
                                  newMaterials[idx] = { ...newMaterials[idx], estimated_quantity: parseInt(e.target.value) };
                                  handleProductionProcessEditInputChange('raw_materials', newMaterials);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Used Quantity</label>
                              <input
                                type="number"
                                value={material.used_quantity}
                                onChange={(e) => {
                                  const newMaterials = [...(productionProcessEditFormData.raw_materials || [])];
                                  newMaterials[idx] = { ...newMaterials[idx], used_quantity: parseInt(e.target.value) };
                                  handleProductionProcessEditInputChange('raw_materials', newMaterials);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Quantity</label>
                              <input
                                type="number"
                                value={material.remaining_quantity}
                                onChange={(e) => {
                                  const newMaterials = [...(productionProcessEditFormData.raw_materials || [])];
                                  newMaterials[idx] = { ...newMaterials[idx], remaining_quantity: parseInt(e.target.value) };
                                  handleProductionProcessEditInputChange('raw_materials', newMaterials);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                              <input
                                type="text"
                                value={material.item.uom}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processes */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Processes</h3>
                    <div className="space-y-4">
                      {productionProcessEditFormData.processes?.map((process, idx) => (
                        <div key={process._id} className="bg-white p-4 rounded border">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Process Name</label>
                              <input
                                type="text"
                                value={process.process}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Started</label>
                              <select
                                value={process.start ? 'true' : 'false'}
                                onChange={(e) => {
                                  const newProcesses = [...(productionProcessEditFormData.processes || [])];
                                  newProcesses[idx] = { ...newProcesses[idx], start: e.target.value === 'true' };
                                  handleProductionProcessEditInputChange('processes', newProcesses);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Done</label>
                              <select
                                value={process.done ? 'true' : 'false'}
                                onChange={(e) => {
                                  const newProcesses = [...(productionProcessEditFormData.processes || [])];
                                  newProcesses[idx] = { ...newProcesses[idx], done: e.target.value === 'true' };
                                  handleProductionProcessEditInputChange('processes', newProcesses);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowProductionProcessEditModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={productionProcessEditLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {productionProcessEditLoading ? 'Updating...' : 'Update Production Process'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Production Process Delete Confirmation Modal */}
      {showProductionProcessDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Delete Production Process?</h3>
              <p className="mt-2 text-sm text-gray-600">This action cannot be undone. Are you sure you want to delete this production process?</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowProductionProcessDeleteModal(false); setDeletingProductionProcessId(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProductionProcess}
                  disabled={productionProcessDeleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {productionProcessDeleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionDashboard;


  
