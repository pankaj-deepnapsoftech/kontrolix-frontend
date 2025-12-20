import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Trash2, FileText, Clock, CheckCircle, Users } from 'lucide-react';

interface DesignerDashboardData {
  message: string;
  thisMonth: {
    total: number;
    Pending: number;
    UnderProcessing: number;
    Completed: number;
  };
  lastMonth: {
    total: number;
    Pending: number;
    UnderProcessing: number;
    Completed: number;
  };
}

interface AssignedTaskData {
  _id: string;
  sale_id: Array<{
    _id: string;
    product_id: Array<{
      _id: string;
      name: string;
      quantity?: number;
    }>;
    party_id: Array<{
      _id: string;
      name: string;
    }>;
    user_id: Array<{
      _id: string;
      first_name: string;
    }>;
    bom?: Array<any>;
  }>;
  assined_to: string;
  assined_by: Array<{
    _id: string;
    first_name: string;
    role: Array<{
      _id: string;
      name: string;
    }>;
  }>;
  assined_process: string;
  isCompleted: 'Pending' | 'UnderProcessing' | 'Complete';
  assinedby_comment?: string;
  assinedto_comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignedTasksResponse {
  message: string;
  data: AssignedTaskData[];
  totalData: number;
}

const DesignerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies(['access_token']);
  const [dashboardData, setDashboardData] = useState<DesignerDashboardData | null>(null);
  const [assignedTasksData, setAssignedTasksData] = useState<AssignedTaskData[]>([]);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [designsLoading, setDesignsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = cookies?.access_token;

        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
        const response = await fetch(`${backendUrl}assined/dashboard-stats`, {
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
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const data = await response.json();
        if (data.message) {
          setDashboardData(data);
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
        toast.error(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [cookies?.access_token]);

  // Fetch assigned tasks data
  useEffect(() => {
    const fetchAssignedTasksData = async () => {
      try {
        setDesignsLoading(true);
        
        const token = cookies?.access_token;

        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
        const response = await fetch(`${backendUrl}assined/get-assined`, {
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
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const data: AssignedTasksResponse = await response.json();
        if (data.message) {
          setAssignedTasksData(data.data || []);
          setTotalTasks(data.totalData || 0);
        } else {
          throw new Error('Failed to fetch assigned tasks data');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assigned tasks data';
        toast.error(`Error: ${errorMessage}`);
      } finally {
        setDesignsLoading(false);
      }
    };

    fetchAssignedTasksData();
  }, [cookies?.access_token]);

  const getChangeText = (current: number, lastMonth: number) => {
    const difference = current - lastMonth;
    if (difference > 0) return `${difference} ▲ v/s last month`;
    if (difference < 0) return `${Math.abs(difference)} ▾ v/s last month`;
    return `0 ▲ v/s last month`;
  };

  const getChangeColor = (current: number, lastMonth: number) => {
    const difference = current - lastMonth;
    if (difference > 0) return 'text-green-600';
    if (difference < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'UnderProcessing':
        return 'bg-orange-100 text-orange-800';
      case 'Pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'Completed';
      case 'UnderProcessing':
        return 'Under Processing';
      case 'Pending':
        return 'Pending';
      default:
        return status;
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // Confirm and delete assigned task function
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const token = cookies?.access_token;

      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
      const response = await fetch(`${backendUrl}assined/delete/${taskToDelete}`, {
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
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      toast.success(data.message || 'Task deleted successfully');
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      
      // Refresh the assigned tasks data
      const fetchAssignedTasksData = async () => {
        try {
          setDesignsLoading(true);
          
          const response = await fetch(`${backendUrl}assined/get-assined`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: AssignedTasksResponse = await response.json();
          if (data.message) {
            setAssignedTasksData(data.data || []);
            setTotalTasks(data.totalData || 0);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to refresh tasks data';
          toast.error(`Error: ${errorMessage}`);
        } finally {
          setDesignsLoading(false);
        }
      };

      fetchAssignedTasksData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(`Error: ${errorMessage}`);
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Designer Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your design tasks and progress</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tasks */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.thisMonth?.total || 0}
                </p>
                <p className={`text-sm ${getChangeColor(dashboardData?.thisMonth?.total || 0, dashboardData?.lastMonth?.total || 0)}`}>
                  {getChangeText(dashboardData?.thisMonth?.total || 0, dashboardData?.lastMonth?.total || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.thisMonth?.Pending || 0}
                </p>
                <p className={`text-sm ${getChangeColor(dashboardData?.thisMonth?.Pending || 0, dashboardData?.lastMonth?.Pending || 0)}`}>
                  {getChangeText(dashboardData?.thisMonth?.Pending || 0, dashboardData?.lastMonth?.Pending || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Under Processing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Processing</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.thisMonth?.UnderProcessing || 0}
                </p>
                <p className={`text-sm ${getChangeColor(dashboardData?.thisMonth?.UnderProcessing || 0, dashboardData?.lastMonth?.UnderProcessing || 0)}`}>
                  {getChangeText(dashboardData?.thisMonth?.UnderProcessing || 0, dashboardData?.lastMonth?.UnderProcessing || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.thisMonth?.Completed || 0}
                </p>
                <p className={`text-sm ${getChangeColor(dashboardData?.thisMonth?.Completed || 0, dashboardData?.lastMonth?.Completed || 0)}`}>
                  {getChangeText(dashboardData?.thisMonth?.Completed || 0, dashboardData?.lastMonth?.Completed || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Assigned Tasks</h2>
                <p className="text-sm text-gray-600">
                  {designsLoading ? 'Loading...' : `${assignedTasksData.length} of ${totalTasks} tasks`}
                </p>
              </div>
              <button 
                onClick={() => navigate('/task')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Process
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {designsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : assignedTasksData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No assigned tasks found
                    </td>
                  </tr>
                ) : (
                  assignedTasksData.slice(0, 5).map((task, index) => (
                    <tr key={task._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {task.sale_id?.[0]?.product_id?.[0]?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {task.assined_process}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.assined_by?.[0]?.first_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.isCompleted)}`}>
                          {getStatusText(task.isCompleted)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          {/* <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button> */}
                          <button 
                            onClick={() => showDeleteConfirmation(task._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerDashboard;
