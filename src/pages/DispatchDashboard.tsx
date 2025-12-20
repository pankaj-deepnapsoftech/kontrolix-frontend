// @ts-nocheck

import { Box, Icon } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { TbTruckDelivery, TbPackage, TbClock, TbCheck } from "react-icons/tb";
import { useLazyFetchDispatchStatsQuery } from "../redux/api/api";
import { toast } from "react-toastify";
import { colors } from "../theme/colors";
import { useCookies } from "react-cookie";
import axios from "axios";

interface DispatchStats {
  totalDispatches: number;
  deliveredCount: number;
  dispatchedCount: number;
  pendingCount: number;
}


const DispatchDashboard = () => {
  const [dispatchStats, setDispatchStats] = useState<DispatchStats | null>(
    null
  );
  const [dispatchData, setDispatchData] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [fetchDispatchStats, { isLoading }] = useLazyFetchDispatchStatsQuery();
  const [cookies] = useCookies();

  useEffect(() => {
    fetchStats();
    fetchDispatchData();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await fetchDispatchStats({}).unwrap();
      setDispatchStats(result.data);
    } catch (error) {
      console.error("Error fetching dispatch stats:", error);
      toast.error("Failed to fetch dispatch statistics");
    }
  };

  const fetchDispatchData = async () => {
    try {
      setIsLoadingTable(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}dispatch/getAll?page=1&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${cookies.access_token}`,
          },
        }
      );

      let dispatchData = response?.data?.data || [];

      // Fetch sales data and invoice data to enrich dispatch data (same as Dispatch.tsx)
      try {
        const salesResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}sale/getAll?page=1&limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${cookies.access_token}`,
            },
          }
        );

        const salesData = salesResponse?.data?.data || [];

        // Fetch invoice data to get payment information
        const invoiceResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}invoice/all`,
          {
            headers: {
              Authorization: `Bearer ${cookies.access_token}`,
            },
          }
        );

        const invoiceData = invoiceResponse?.data?.invoices || [];

        // Enrich dispatch data with sales price information and invoice data
        dispatchData = dispatchData.map((dispatch) => {
          // Find matching sales order by order_id or sales_order_id
          const matchingSale = salesData.find(
            (sale) =>
              sale.order_id === dispatch.order_id ||
              sale.order_id === dispatch.sales_order_id ||
              sale._id === dispatch.sale_id
          );

          // Find matching invoice by order_id or sales data
          const matchingInvoice = invoiceData.find(
            (invoice) =>
              invoice.invoice_no === dispatch.order_id ||
              (matchingSale &&
                (invoice.buyer?._id === matchingSale.party?._id ||
                  invoice.supplier?._id === matchingSale.party?._id))
          );

          let enrichedDispatch = { ...dispatch };

          if (matchingSale) {
            enrichedDispatch = {
              ...enrichedDispatch,
              // Override with sales price data
              total_amount: matchingSale.total_price || dispatch.total_amount,
              sales_price: matchingSale.price || 0,
              sales_quantity: matchingSale.product_qty || dispatch.quantity,
              sales_gst: matchingSale.GST || 0,
              sales_subtotal:
                matchingSale.price && matchingSale.product_qty
                  ? matchingSale.price * matchingSale.product_qty
                  : 0,
              sales_data: matchingSale, // Store full sales data for reference
            };
          }

          if (matchingInvoice) {
            enrichedDispatch = {
              ...enrichedDispatch,
              invoice: {
                ...matchingInvoice,
                total: matchingInvoice.total,
                balance: matchingInvoice.balance,
                invoice_no: matchingInvoice.invoice_no,
              },
            };
          }

          return enrichedDispatch;
        });
      } catch (salesError) {
        console.error("Error fetching sales or invoice data:", salesError);
        // Continue with original dispatch data if fetch fails
      }

      setDispatchData(dispatchData);
    } catch (error) {
      console.error("Error fetching dispatch data:", error);
      toast.error("Failed to fetch dispatch data");
    } finally {
      setIsLoadingTable(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "partial paid":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDispatchStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "dispatch":
        return "bg-blue-100 text-blue-800";
      case "dispatch pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculatePaymentStatus = (dispatch: any) => {
    // Debug logging - let's see the complete dispatch object structure
    // console.log(`=== COMPLETE DISPATCH OBJECT ===`);
    // console.log(dispatch);
    // console.log(`=== SALES DATA ===`);
    // console.log(dispatch.sales_data);
    // console.log(`=== INVOICE FIELD ===`);
    // console.log(dispatch.invoice);

    // Check if we have invoice data in the dispatch object or sales_data
    if (
      !dispatch?.invoice ||
      typeof dispatch.invoice !== "object" ||
      !dispatch.invoice.total
    ) {
      console.log("No valid invoice data found - returning Unpaid");
      return "Unpaid";
    }

    // Get total and balance from invoice data
    const invoiceTotal = parseFloat(dispatch.invoice.total) || 0;
    const invoiceBalance = parseFloat(dispatch.invoice.balance) || 0;

    console.log(
      `Final values - Total: ${invoiceTotal}, Balance: ${invoiceBalance}`
    );

    let status;
    if (invoiceBalance === 0) {
      status = "Paid";
      console.log(`Status: Paid (balance === 0)`);
    } else if (invoiceTotal === invoiceBalance) {
      status = "Unpaid";
      console.log(`Status: Unpaid (total === balance)`);
    } else if (invoiceTotal > invoiceBalance && invoiceBalance > 0) {
      status = "Partial Paid";
      console.log(`Status: Partial Paid (total > balance > 0)`);
    } else {
      status = "Unpaid";
      console.log(`Status: Unpaid (fallback)`);
    }

    console.log(`Final status:`, status);
    console.log(`=== End Debug ===`);

    return status;
  };

  const stats = [
    {
      title: "Total Dispatches",
      value: dispatchStats?.totalDispatches || 0,
      change: "All time dispatches",
      positive: true,
      icon: TbTruckDelivery,
      bgColor: "#07daf1",
      iconColor: "white",
    },
    {
      title: "Delivered Orders",
      value: dispatchStats?.deliveredCount || 0,
      change: "Successfully delivered",
      positive: true,
      icon: TbCheck,
      bgColor: "#7ED185",
      iconColor: "white",
    },
    {
      title: "In Dispatch",
      value: dispatchStats?.dispatchedCount || 0,
      change: "Currently dispatched",
      positive: true,
      icon: TbPackage,
      bgColor: "#FFA500",
      iconColor: "white",
    },
    {
      title: "Pending Dispatch",
      value: dispatchStats?.pendingCount || 0,
      change: "Awaiting dispatch",
      positive: false,
      icon: TbClock,
      bgColor: "#FA4F4F",
      iconColor: "white",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="bg-white p-6 flex flex-col gap-2 animate-pulse"
              style={{
                borderColor: colors.border.light,
              }}
            >
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-base ml-2">Dashboard/ Dispatcher</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 flex flex-col rounded-md"
            style={{
              borderColor: colors.border.light,
            }}
          >
            <div className="flex justify-between items-center">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-600 font-medium">{item.title}</h4>
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  {item.value}
                </div>
                <div
                  className={`flex items-center text-sm ${
                    item.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.positive ? (
                    <FaArrowUp className="mr-1" />
                  ) : (
                    <FaArrowDown className="mr-1" />
                  )}
                  {item.change}
                </div>
              </div>
              <Box
                bg={item.bgColor}
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={item.icon} size={20} color={item.iconColor} />
              </Box>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Orders Table */}
      <div className="bg-white overflow-hidden rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3
                className="text-lg font-medium"
                style={{ color: colors.text.primary }}
              >
                Dispatch Orders
              </h3>
              <div className="text-sm" style={{ color: colors.text.secondary }}>
                {dispatchData.length} orders
              </div>
            </div>
            <button
              onClick={() => (window.location.href = "/dispatch")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all
            </button>
          </div>
        </div>

        <div className="px-2">
          {isLoadingTable ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispatch Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispatch Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dispatchData.length > 0 ? (
                    dispatchData.slice(0, 10).map((dispatch: any, index) => (
                      <tr
                        key={dispatch._id || index}
                        className="hover:bg-gray-50"
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          {dispatch.order_id ||
                            dispatch.sales_order_id ||
                            "N/A"}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {dispatch.merchant_name ||
                            dispatch.party_name ||
                            "N/A"}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {dispatch.item_name || dispatch.product_name || "N/A"}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {dispatch.order_qty || dispatch.quantity || 0}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {dispatch.dispatch_qty || 0}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {(dispatch.order_qty || dispatch.quantity || 0) -
                            (dispatch.dispatch_qty || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap rounded-md">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium ${getDispatchStatusColor(
                              dispatch.dispatch_status || "pending"
                            )}`}
                          >
                            {dispatch.dispatch_status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap rounded-md">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium ${getPaymentStatusColor(
                              dispatch.payment_status ||
                                calculatePaymentStatus(dispatch)
                            )}`}
                          >
                            {dispatch.payment_status ||
                              calculatePaymentStatus(dispatch)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        No dispatch orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchDashboard;
