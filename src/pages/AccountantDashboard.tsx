import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { FileText, Receipt, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  proformaInvoice: {
    total: number;
    lastMonth: number;
  };
  taxInvoice: {
    total: number;
    lastMonth: number;
  };
  payments: {
    total: number;
    lastMonth: number;
  };
}

interface AccountantDashboardAPI {
  status: number;
  success: boolean;
  message: string;
  date_ranges: {
    current_month: {
      from: string;
      to: string;
    };
    previous_month: {
      from: string;
      to: string;
    };
  };
  current_month: {
    proforma_invoices: {
      total_count: number;
      total_amount: number;
      status_wise: any;
    };
    invoices: {
      total_count: number;
      total_amount: number;
      status_wise: any;
    };
    payments: {
      total_count: number;
      total_amount: number;
      status_wise: any;
    };
  };
  previous_month: {
    proforma_invoices: {
      total_count: number;
      total_amount: number;
    };
    invoices: {
      total_count: number;
      total_amount: number;
    };
    payments: {
      total_count: number;
      total_amount: number;
    };
  };
}

interface InvoiceData {
  _id: string;
  proforma_invoice_no?: string;
  invoice_no?: string;
  creator: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  buyer: {
    _id: string;
    cust_id: string;
    consignee_name: string[];
    contact_number: string[];
    email_id: string[];
  };
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface PaymentData {
  _id: string;
  creator: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  invoice: {
    _id: string;
    invoice_no: string;
    buyer: {
      _id: string;
      cust_id: string;
      consignee_name: string[];
      contact_number: string[];
      email_id: string[];
    };
    total: number;
  };
  amount: number;
  mode: string;
  createdAt: string;
  updatedAt: string;
}

const AccountantDashboard: React.FC = () => {
  const [cookies] = useCookies(['access_token']);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [apiData, setApiData] = useState<AccountantDashboardAPI | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData[]>([]);
  const [taxInvoiceData, setTaxInvoiceData] = useState<InvoiceData[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'proforma' | 'tax' | 'payments'>('proforma');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const token = cookies?.access_token;
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
        
        // Fetch proforma invoices, tax invoices, and payments
        const [proformaResponse, taxResponse, paymentResponse] = await Promise.all([
          fetch(`${backendUrl}proforma-invoice/all`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`${backendUrl}invoice/all`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`${backendUrl}payment/all`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          })
        ]);

        if (!proformaResponse.ok || !taxResponse.ok || !paymentResponse.ok) {
          if (proformaResponse.status === 401 || taxResponse.status === 401 || paymentResponse.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else if (proformaResponse.status >= 500 || taxResponse.status >= 500 || paymentResponse.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(`HTTP error! status: ${proformaResponse.status || taxResponse.status || paymentResponse.status}`);
          }
        }

        const [proformaData, taxData, paymentData] = await Promise.all([
          proformaResponse.json(),
          taxResponse.json(),
          paymentResponse.json()
        ]);

        if (proformaData.success && taxData.success && paymentData.success) {
          setInvoiceData(proformaData.proforma_invoices || []);
          setTaxInvoiceData(taxData.invoices || []);
          setPaymentData(paymentData.payments || []);
          
          // Calculate dashboard stats from the data
          const totalProformaInvoices = proformaData.proforma_invoices?.length || 0;
          const totalTaxInvoices = taxData.invoices?.length || 0;
          const totalPayments = paymentData.payments?.length || 0;
          
          const dashboardStats: DashboardData = {
            proformaInvoice: { total: totalProformaInvoices, lastMonth: Math.max(0, totalProformaInvoices - 5) },
            taxInvoice: { total: totalTaxInvoices, lastMonth: Math.max(0, totalTaxInvoices - 2) },
            payments: { total: totalPayments, lastMonth: Math.max(0, totalPayments - 3) }
          };
          
          setDashboardData(dashboardStats);
        } else {
          throw new Error('Failed to fetch data');
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

  // Fetch API data for KPI cards
  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const token = cookies?.access_token;
        if (!token) {
          return;
        }

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';
        
        const response = await fetch(`${backendUrl}dashboard/accountant-dashboard`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: AccountantDashboardAPI = await response.json();
          if (data.success) {
            setApiData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching KPI data:', error);
      }
    };

    fetchKPIData();
  }, [cookies?.access_token]);

  const [error, setError] = useState<string | null>(null);

  // Tab switch only updates local state (no navigation)
  // Navigation occurs only via handleViewAllClick

  const handleViewAllClick = () => {
    switch (activeTab) {
      case 'proforma':
        navigate('/accounts/proforma-invoice');
        break;
      case 'tax':
        navigate('/accounts/taxInvoice');
        break;
      case 'payments':
        navigate('/accounts/payment');
        break;
    }
  };

  const getChangeText = (current: number, lastMonth: number) => {
    const difference = current - lastMonth;
    if (difference > 0) return `${difference} ▲ v/s last month`;
    if (difference < 0) return `${Math.abs(difference)} ▼ v/s last month`;
    return `0 ▲ v/s last month`;
  };

  const getChangeColor = (current: number, lastMonth: number) => {
    const difference = current - lastMonth;
    if (difference > 0) return 'text-green-600';
    if (difference < 0) return 'text-red-600';
    return 'text-gray-600';
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
            <h1 className="text-3xl font-bold text-gray-800">Accountant Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your accounting tasks and financial overview</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Proforma Invoice */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Proforma Invoice</p>
                <p className="text-3xl font-bold text-gray-900">
                  {apiData?.current_month?.proforma_invoices?.total_count || 0}
                </p>
                <p className={`text-sm ${getChangeColor(apiData?.current_month?.proforma_invoices?.total_count || 0, apiData?.previous_month?.proforma_invoices?.total_count || 0)}`}>
                  {getChangeText(apiData?.current_month?.proforma_invoices?.total_count || 0, apiData?.previous_month?.proforma_invoices?.total_count || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Tax Invoice */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tax Invoice</p>
                <p className="text-3xl font-bold text-gray-900">
                  {apiData?.current_month?.invoices?.total_count || 0}
                </p>
                <p className={`text-sm ${getChangeColor(apiData?.current_month?.invoices?.total_count || 0, apiData?.previous_month?.invoices?.total_count || 0)}`}>
                  {getChangeText(apiData?.current_month?.invoices?.total_count || 0, apiData?.previous_month?.invoices?.total_count || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {apiData?.current_month?.payments?.total_count || 0}
                </p>
                <p className={`text-sm ${getChangeColor(apiData?.current_month?.payments?.total_count || 0, apiData?.previous_month?.payments?.total_count || 0)}`}>
                  {getChangeText(apiData?.current_month?.payments?.total_count || 0, apiData?.previous_month?.payments?.total_count || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Accounts</h2>
                <p className="text-sm text-gray-600">
                  {activeTab === 'proforma' 
                    ? `${invoiceData.length} invoices Found`
                    : activeTab === 'tax'
                    ? `${taxInvoiceData.length} invoices Found`
                    : `${paymentData.length} payments Found`
                  }
                </p>
              </div>
              <button 
                onClick={handleViewAllClick}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('proforma')}
                className={`pb-2 text-sm font-medium border-b-2 ${
                  activeTab === 'proforma'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Proforma Invoice
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`pb-2 text-sm font-medium border-b-2 ${
                  activeTab === 'tax'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Tax Invoice
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`pb-2 text-sm font-medium border-b-2 ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Payments
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'proforma' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PI Number
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'payments' ? 'Invoice Total' : 'Sub Total'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'payments' ? 'Payment Amount' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'payments' ? (
                  paymentData.map((payment, index) => (
                    <tr key={payment._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.creator ? `${payment.creator.first_name} ${payment.creator.last_name}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.updatedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.invoice?.buyer?.consignee_name?.[0] || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payment.invoice?.total || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payment.amount}
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'tax' ? (
                  taxInvoiceData.map((invoice, index) => (
                    <tr key={invoice._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.creator ? `${invoice.creator.first_name} ${invoice.creator.last_name}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.updatedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.buyer?.consignee_name?.[0] || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.subtotal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.total}
                      </td>
                    </tr>
                  ))
                ) : (
                  invoiceData.map((invoice, index) => (
                    <tr key={invoice._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.proforma_invoice_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.creator ? `${invoice.creator.first_name} ${invoice.creator.last_name}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.updatedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.buyer?.consignee_name?.[0] || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.subtotal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.total}
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

export default AccountantDashboard;
  