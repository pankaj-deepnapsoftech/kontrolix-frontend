import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  FileText,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

interface InventoryStats {
  direct_inventory: {
    total: number;
    lastMonth: number;
    thisMonth: number;
  };
  indirect_inventory: {
    total: number;
    lastMonth: number;
    thisMonth: number;
  };
  work_in_progress: {
    total: number;
    lastMonth: number;
    thisMonth: number;
  };
  inventory_approval: {
    total: number;
    lastMonth: number;
    thisMonth: number;
  };
}

interface Product {
  _id: string;
  inventory_category: string;
  name: string;
  product_id: string;
  uom: string;
  category: string;
  current_stock: number;
  price: number;
  approved: boolean;
  color_name?: string;
  item_type: string;
  product_or_service: string;
  change_type?: string;
  quantity_changed?: number;
  createdAt: string;
  updatedAt: string;
}

interface WIPProduct {
  _id: string;
  estimated_quantity: number;
  used_quantity: number;
  remaining_quantity: number;
  bom: {
    _id: string;
    bom_id: string;
    bom_name: string;
    is_production_started: boolean;
    finished_good: {
      item: Product;
      quantity: number;
      cost: number;
    };
    approved: boolean;
    total_cost: number;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface InventoryApprovalItem {
  _id: string;
  bom_id: string;
  bom_name: string;
  bom_status: string;
  production_process_id: string;
  product_id: string;
  name: string;
  inventory_category: string;
  uom: string;
  category: string;
  current_stock: number;
  price: number;
  approved: boolean;
  item_type: string;
  product_or_service: string;
  store: string;
  createdAt: string;
  updatedAt: string;
  isInventoryApprovalClicked: boolean;
  isOutForInventoryClicked: boolean;
}

const InventoryDashboard: React.FC = () => {
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cookies] = useCookies(['access_token']);
  const navigate = useNavigate();
  
  // New state for products and dropdown
  const [products, setProducts] = useState<Product[]>([]);
  const [wipProducts, setWipProducts] = useState<WIPProduct[]>([]);
  const [approvalItems, setApprovalItems] = useState<InventoryApprovalItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('direct');
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Get current page data for WIP
  const getCurrentWIPData = (): WIPProduct[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return wipProducts.slice(startIndex, endIndex);
  };

  // Get current page data for Inventory Approvals
  const getCurrentApprovalData = (): InventoryApprovalItem[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return approvalItems.slice(startIndex, endIndex);
  };

  // Get current page data for Products
  const getCurrentProductData = (): Product[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };


  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Handle View All button click
  const handleViewAll = () => {
    const routes = {
      'direct': '/inventory/direct',
      'indirect': '/inventory/indirect', 
      'work_in_progress': '/inventory/wip',
      'inventory_approval': '/inventory/approval'
    };
    
    const route = routes[selectedCategory as keyof typeof routes];
    if (route) {
      navigate(route);
    }
  };
                      
  // Fetch inventory stats from API
  useEffect(() => {
    const fetchInventoryStats = async () => {
      try {
        // Check if access token exists in cookies
        if (!cookies.access_token) {
          setError('Please login to view inventory statistics');
          toast.error('Please login to view inventory statistics');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}dashboard/inventory-stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies.access_token}`,
          },
          credentials: 'include', // This ensures cookies are sent with the request
        });

        if (response.status === 401) {
          // Session expired or invalid
          setError('Session expired. Please login again.');
          toast.error('Session expired. Please login again.');
          // Optionally redirect to login page
          // window.location.href = '/login';
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch inventory stats');
        }

        const data = await response.json();
        setInventoryStats(data);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load inventory statistics';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryStats();
  }, [cookies.access_token]);

  // Fetch products by category
  const fetchProductsByCategory = useCallback(async (category: string) => {
    try {
      setProductsLoading(true);
      setProductsError(null);

      // Use different endpoint based on category
      let endpoint: string;
      if (category === 'work_in_progress') {
        endpoint = `${process.env.REACT_APP_BACKEND_URL}product/wip`;
      } else if (category === 'inventory_approval') {
        endpoint = `${process.env.REACT_APP_BACKEND_URL}bom/all/inventory/raw-materials`;
      } else {
        endpoint = `${process.env.REACT_APP_BACKEND_URL}product/all?category=${category}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.access_token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        setProductsError('Session expired. Please login again.');
        toast.error('Session expired. Please login again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }

      const data = await response.json();
      
      if (category === 'work_in_progress') {
        setWipProducts(data.products || []);
        setProducts([]); // Clear regular products
        setApprovalItems([]); // Clear approval items
      } else if (category === 'inventory_approval') {
        setApprovalItems(data.unapproved || []);
        setProducts([]); // Clear regular products
        setWipProducts([]); // Clear WIP products
      } else {
        setProducts(data.products || []);
        setWipProducts([]); // Clear WIP products
        setApprovalItems([]); // Clear approval items
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      setProductsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProductsLoading(false);
    }
  }, [cookies.access_token]);

  // Fetch products when category changes
  useEffect(() => {
    if (cookies.access_token) {
      fetchProductsByCategory(selectedCategory);
    }
  }, [selectedCategory, cookies.access_token, fetchProductsByCategory]);

  // Retry function
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect by updating a dependency
    window.location.reload();
  };

  // Calculate metrics from API data
  const getMetrics = () => {
    if (!inventoryStats) return [];

    const calculateChange = (thisMonth: number, lastMonth: number) => {
      const change = thisMonth - lastMonth;
      if (change > 0) return { change: change.toString(), changeType: 'increase' };
      if (change < 0) return { change: Math.abs(change).toString(), changeType: 'decrease' };
      return { change: '0', changeType: 'no-change' };
    };

    return [
    {
      title: "Direct inventory",
        value: inventoryStats.direct_inventory.total.toString(),
        ...calculateChange(inventoryStats.direct_inventory.thisMonth, inventoryStats.direct_inventory.lastMonth),
      icon: <FileText className="text-white" size={20} />,
      bgColor: "bg-red-500"
    },
    {
      title: "Work in progress",
        value: inventoryStats.work_in_progress.total.toString(),
        ...calculateChange(inventoryStats.work_in_progress.thisMonth, inventoryStats.work_in_progress.lastMonth),
      icon: <FileText className="text-white" size={20} />,
      bgColor: "bg-yellow-500"
    },
    {
      title: "Indirect inventory",
        value: inventoryStats.indirect_inventory.total.toString(),
        ...calculateChange(inventoryStats.indirect_inventory.thisMonth, inventoryStats.indirect_inventory.lastMonth),
      icon: <CheckCircle className="text-white" size={20} />,
      bgColor: "bg-green-500"
    },
    {
      title: "Inventory approval",
        value: inventoryStats.inventory_approval.total.toString(),
        ...calculateChange(inventoryStats.inventory_approval.thisMonth, inventoryStats.inventory_approval.lastMonth),
      icon: <Users className="text-white" size={20} />,
      bgColor: "bg-blue-400"
    }
  ];
  };

  const metrics = getMetrics();

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'decrease':
        return <TrendingDown className="text-red-500" size={16} />;
      default:
        return <Minus className="text-gray-500" size={16} />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">!</span>
                </div>
                <div>
                  <h3 className="text-red-800 font-medium">Unable to load inventory statistics</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  {error?.includes('Session expired') && (
                    <p className="text-red-500 text-xs mt-1">Please refresh the page or login again.</p>
                  )}
                </div>
              </div>
              <button
                onClick={retryFetch}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your inventory levels and stock management</p>
          </div>
        </div>

        {/* Dashboard/Inventory Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="mb-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))
          ) : !error && metrics.length > 0 ? (
            metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">{metric.title}</h3>
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  {metric.icon}
                </div>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-800">{metric.value}</span>
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                {getChangeIcon(metric.changeType)}
                <span className="text-sm font-medium">
                  {metric.change} {metric.changeType === 'increase' ? '▲' : metric.changeType === 'decrease' ? '▾' : '▲'} v/s last month
                </span>
              </div>
            </div>
            ))
          ) : !error ? (
            // Fallback when no data is available
            <div className="col-span-full bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <div className="text-gray-400 mb-4">
                <FileText size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No inventory data available</h3>
              <p className="text-gray-500">Unable to load inventory statistics at this time.</p>
            </div>
          ) : null}
        </div>

        {/* Inventory Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-800">Inventory</h2>
                <ChevronDown className="text-gray-400" size={20} />
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="direct">Direct</option>
                  <option value="indirect">Indirect</option>
                  <option value="work_in_progress">Work in Progress</option>
                  <option value="inventory_approval">Inventory Approvals</option>
                </select>
                <button 
                  onClick={handleViewAll}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {selectedCategory === 'direct' ? 'Direct inventory' :
                 selectedCategory === 'indirect' ? 'Indirect inventory' :
                 selectedCategory === 'work_in_progress' ? 'Work in progress' :
                 'Inventory approvals'}
              </h3>
              <p className="text-gray-600">
                {productsLoading ? 'Loading...' : 
                 selectedCategory === 'work_in_progress' 
                   ? `${wipProducts.length} WIP Items Found`
                   : selectedCategory === 'inventory_approval'
                   ? `${approvalItems.length} Approval Items Found`
                   : `${products.length} Products Found`}
              </p>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {selectedCategory === 'work_in_progress' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOM ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOM Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </>
                  ) : selectedCategory === 'inventory_approval' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOM Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                  ) : (
                    <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Id</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Price</span>
                      <TrendingUp className="text-purple-500" size={16} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last change</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productsLoading ? (
                  // Loading skeleton for table rows
                  Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : productsError ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-red-600">
                        <p className="text-lg font-medium">Failed to load products</p>
                        <p className="text-sm mt-1">{productsError}</p>
                        <button
                          onClick={() => fetchProductsByCategory(selectedCategory)}
                          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : selectedCategory === 'work_in_progress' ? (
                  wipProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <FileText size={48} className="mx-auto mb-4" />
                          <p className="text-lg font-medium">No WIP items found</p>
                          <p className="text-sm mt-1">No work in progress items available</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getCurrentWIPData().map((wipItem, index) => (
                      <tr key={wipItem._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {wipItem.bom.bom_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {wipItem.bom.bom_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {wipItem.bom.finished_good.item.name} ({wipItem.bom.finished_good.item.product_id})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            wipItem.bom.is_production_started 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {wipItem.bom.is_production_started ? 'In Progress' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {wipItem.estimated_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {wipItem.used_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {wipItem.remaining_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{wipItem.bom.total_cost}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(wipItem.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )
                ) : selectedCategory === 'inventory_approval' ? (
                  approvalItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <FileText size={48} className="mx-auto mb-4" />
                          <p className="text-lg font-medium">No approval items found</p>
                          <p className="text-sm mt-1">No inventory approval items available</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getCurrentApprovalData().map((item, index) => (
                      <tr key={item._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.bom_name}
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.bom_status === 'raw material approval pending'
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.bom_status === 'raw material approval pending' ? 'Pending Approval' : 'Approved'}
                      </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.uom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.current_stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{item.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                              Approve
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-xs font-medium">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <FileText size={48} className="mx-auto mb-4" />
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm mt-1">No products available for this category</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getCurrentProductData().map((product, index) => (
                    <tr key={product._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.product_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.inventory_category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.item_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.uom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.current_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.change_type && product.quantity_changed ? (
                          <span className={`flex items-center space-x-1 ${getChangeColor(product.change_type)}`}>
                            {getChangeIcon(product.change_type)}
                            <span className="text-sm font-medium">
                              {product.change_type === 'increase' ? '↑' : '↓'}{product.quantity_changed}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No change</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
