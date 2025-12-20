// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import axios from "axios";
import { BiX } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
import { DispatchFormSchema } from "../../../Validation/DispatchFormValidation";
import { colors } from "../../../theme/colors";

interface AddDispatchProps {
  show: boolean;
  setShow: (show: boolean) => void;
  fetchDispatch?: () => void;
  editDispatch?: any;
}

const AddDispatch: React.FC<AddDispatchProps> = ({
  show,
  setShow,
  fetchDispatch,
  editDispatch,
}) => {
  const [cookies] = useCookies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingSalesOrders, setIsLoadingSalesOrders] = useState(false);
  const [productStocks, setProductStocks] = useState({});
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);

  const fetchSalesOrders = async () => {
    try {
      setIsLoadingSalesOrders(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}sale/getAll?page=1&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      const completedOrders =
        response?.data?.data?.filter((order) =>
          order?.assinedto?.every(
            (item) => item?.isCompleted?.toLowerCase() === "completed"
          )
        ) || [];

      setSalesOrders(completedOrders);
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      toast.error("Failed to fetch sales orders");
    } finally {
      setIsLoadingSalesOrders(false);
    }
  };

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useFormik({
    initialValues: editDispatch
      ? {
          ...editDispatch,
          dispatch_qty: "", // only additional qty in edit mode
        }
      : {
          sales_order_id: "",
          tracking_id: "",
          tracking_web: "",
          dispatch_date: new Date().toISOString().split("T")[0],
          courier_service: "",
          remarks: "",
          dispatch_qty: "",
        },
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (isSubmitting) return;

      const addQty = parseInt(values.dispatch_qty) || 0;
      const prevQty = parseInt(editDispatch?.dispatch_qty) || 0;
      const totalQty = editDispatch ? prevQty + addQty : addQty;

      // Get order quantity for validation
      const orderQuantity =
        selectedOrder?.product_qty || editDispatch?.quantity || 0;

      // Get product ID
      const firstProductId =
        selectedOrder?.product_id?.[0]?._id ||
        selectedOrder?.product_id?.[0]?.product_id ||
        editDispatch?.product_id;

      const stockData = productStocks[firstProductId];
      const currentStock =
        stockData?.current_stock ||
        stockData?.stock ||
        stockData?.product?.current_stock ||
        stockData?.quantity_changed ||
        0;

      // Validate order quantity first
      if (totalQty > orderQuantity) {
        toast.error(
          `Total dispatch quantity (${totalQty}) cannot exceed order quantity (${orderQuantity} units)`
        );
        return;
      }

      // Then validate stock
      if (addQty > currentStock) {
        toast.error(
          `Dispatch quantity (${addQty}) cannot exceed available stock (${currentStock} units)`
        );
        return;
      }
      if (addQty <= 0) {
        toast.error("Please enter a valid dispatch quantity");
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = {
          ...values,
          dispatch_qty: totalQty, // ✅ cumulative
          merchant_name:
            selectedOrder?.party?.consignee_name?.[0] ||
            selectedOrder?.party?.company_name ||
            editDispatch?.merchant_name,
          item_name:
            selectedOrder?.product_id?.[0]?.name || editDispatch?.item_name,
          product_id:
            selectedOrder?.product_id?.[0]?._id ||
            selectedOrder?.product_id?.[0]?.product_id ||
            editDispatch?.product_id,
          quantity: selectedOrder?.product_qty || editDispatch?.quantity,
          total_amount:
            selectedOrder?.total_price || editDispatch?.total_amount,
          order_id: selectedOrder?.order_id || editDispatch?.order_id,
        };

        if (editDispatch) {
          const response = await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}dispatch/update/${editDispatch._id}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );

          // Check if quantity was changed and show appropriate message
          const prevQty = parseInt(editDispatch?.dispatch_qty) || 0;
          const newQty = parseInt(payload.dispatch_qty) || 0;
          const message =
            prevQty !== newQty
              ? response?.data?.message ||
                "Dispatch updated successfully, status changed to Dispatch Pending"
              : "Dispatch updated successfully";

          toast.success(message);
        } else {
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}dispatch/create`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          toast.success("Dispatch created successfully");
        }

        resetForm();
        setSelectedOrder(null);
        setShow(false);
        fetchDispatch?.();
      } catch (error) {
        console.error("Error processing dispatch:", error);
        toast.error(
          error?.response?.data?.message ||
            `Failed to ${editDispatch ? "update" : "create"} dispatch`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const fetchProductStocks = async (productIds) => {
    try {
      setIsLoadingStocks(true);
      const stockPromises = productIds.map(async (productId) => {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}product/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );
        return { id: productId, data: response.data.data || response.data };
      });

      const stockResults = await Promise.all(stockPromises);
      const stockMap = {};
      stockResults.forEach((result) => {
        stockMap[result.id] = result.data;
      });
      setProductStocks(stockMap);
    } catch (error) {
      console.error("Error fetching product stocks:", error);
      toast.error("Failed to fetch product stock information");
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const handleOrderSelection = (orderId) => {
    const order = salesOrders.find((o) => o._id === orderId);
    setSelectedOrder(order);
    setFieldValue("sales_order_id", orderId);
    if (order?.product_id?.length > 0) {
      const productIds = order.product_id.map(
        (product) => product._id || product.product_id
      );
      fetchProductStocks(productIds);
    }
  };

  useEffect(() => {
    if (show) {
      fetchSalesOrders();
      if (editDispatch?.product_id) {
        fetchProductStocks([editDispatch.product_id]);
      }
    }
  }, [show, editDispatch]);

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[50vw] md:w-[40vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                <TbTruckDelivery className="text-white" size={20} />
              </div>
              <h2
                className="text-xl font-semibold"
                style={{ color: colors.text.primary }}
              >
                {editDispatch ? "Edit Dispatch" : "Add New Dispatch"}
              </h2>
            </div>
            <button
              onClick={() => setShow(false)}
              className="p-2 rounded-lg border transition-colors"
              style={{ borderColor: colors.border.medium }}
            >
              <BiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Sales Order *
                </label>
                <select
                  name="sales_order_id"
                  value={values.sales_order_id}
                  onChange={(e) => handleOrderSelection(e.target.value)}
                  onBlur={handleBlur}
                  disabled={isLoadingSalesOrders || editDispatch}
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: editDispatch
                      ? colors.gray[100]
                      : colors.input.background,
                    borderColor:
                      errors.sales_order_id && touched.sales_order_id
                        ? colors.error[500]
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">
                    {isLoadingSalesOrders ? "Loading..." : "Select Sales Order"}
                  </option>
                  {salesOrders.map((order) => (
                    <option key={order._id} value={order._id}>
                      {order.order_id} -{" "}
                      {order?.party?.consignee_name?.[0] ||
                        order?.party?.company_name}
                    </option>
                  ))}
                </select>
                {errors.sales_order_id && touched.sales_order_id && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: colors.error[500] }}
                  >
                    {errors.sales_order_id}
                  </p>
                )}
              </div>

              {editDispatch && (
                <div className="bg-yellow-50 p-4 rounded-lg space-y-3 border border-yellow-200">
                  <h3 className="font-medium text-yellow-900">
                    Current Dispatch Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700">
                        Merchant Name
                      </label>
                      <p className="text-sm text-yellow-900">
                        {editDispatch?.merchant_name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-yellow-700">
                        Product
                      </label>
                      <p className="text-sm text-yellow-900">
                        {editDispatch?.item_name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-yellow-700">
                        Order Quantity
                      </label>
                      <p className="text-sm text-yellow-900">
                        {editDispatch?.quantity || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-yellow-700">
                        Total Dispatch Quantity
                      </label>
                      <p className="text-sm text-yellow-900">
                        {parseInt(editDispatch.dispatch_qty || 0) +
                          parseInt(values.dispatch_qty || 0)}
                      </p>
                    </div>

                    {/* {editDispatch && (
                      <div className="bg-yellow-50 p-4 rounded-lg space-y-3 border border-yellow-200">
                        <h3 className="font-medium text-yellow-900">
                          Current Dispatch Information
                        </h3>
                        <p>
                          Total Dispatch Quantity:{" "}
                          <strong>
                            {parseInt(editDispatch.dispatch_qty || 0) +
                              parseInt(values.dispatch_qty || 0)} 
                          </strong>
                        </p>
                        <p>
                          Remaining Quantity:{" "}
                          {(editDispatch?.quantity || 0) -
                            (parseInt(editDispatch.dispatch_qty || 0) +
                              parseInt(values.dispatch_qty || 0))}
                        </p>
                      </div>
                    )} */}

                    <div>
                      <label className="block text-sm font-medium text-yellow-700">
                        Total Amount
                      </label>
                      <p className="text-sm text-yellow-900">
                        ₹{editDispatch?.total_amount || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-yellow-700">
                        Sales Order
                      </label>
                      <p className="text-sm text-yellow-900">
                        {editDispatch?.order_id ||
                          editDispatch?.sales_order_id ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium text-gray-900">Order Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Merchant Name
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedOrder?.party?.consignee_name?.[0] ||
                          selectedOrder?.party?.company_name ||
                          "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Product
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedOrder?.product_id?.[0]?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Quantity
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedOrder?.product_qty || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Total Amount
                      </label>
                      <p className="text-sm text-gray-900">
                        ₹
                        {selectedOrder?.total_price ||
                          selectedOrder?.price ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Tracking ID
                </label>
                <input
                  type="text"
                  name="tracking_id"
                  value={values.tracking_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter tracking ID"
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      errors.tracking_id && touched.tracking_id
                        ? colors.error[500]
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                />
                {errors.tracking_id && touched.tracking_id && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: colors.error[500] }}
                  >
                    {errors.tracking_id}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Tracking Website
                </label>
                <input
                  type="url"
                  name="tracking_web"
                  value={values.tracking_web}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://tracking-website.com"
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      errors.tracking_web && touched.tracking_web
                        ? colors.error[500]
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                />
                {errors.tracking_web && touched.tracking_web && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: colors.error[500] }}
                  >
                    {errors.tracking_web}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Dispatch Quantity *
                </label>

                {/* Order Quantity Information */}
                {/* {(selectedOrder || editDispatch) && (
                  <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-indigo-800 mb-2">
                      Order Quantity Information:
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-indigo-700">
                          Total Order Quantity:
                        </span>
                        <span className="text-indigo-900 font-semibold">
                          {selectedOrder?.product_qty ||
                            editDispatch?.quantity ||
                            0}{" "}
                          units
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-indigo-700">
                          Already Dispatched:
                        </span>
                        <span className="text-indigo-900">
                          {parseInt(editDispatch?.dispatch_qty) || 0} units
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-semibold border-t border-indigo-200 pt-1">
                        <span className="text-indigo-800">
                          Remaining to Dispatch:
                        </span>
                        <span className="text-indigo-900">
                          {(selectedOrder?.product_qty ||
                            editDispatch?.quantity ||
                            0) -
                            (parseInt(editDispatch?.dispatch_qty) || 0)}{" "}
                          units
                        </span>
                      </div>
                    </div>
                  </div>
                )} */}

                {editDispatch && editDispatch.product_id && (
                  <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      Current Stock Status (Edit Mode):
                    </h4>
                    {isLoadingStocks ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-green-600 text-sm">
                          Loading stock information...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(() => {
                          const stockData =
                            productStocks[editDispatch.product_id];
                          const currentStock =
                            stockData?.current_stock ||
                            stockData?.stock ||
                            stockData?.product?.current_stock ||
                            stockData?.quantity_changed ||
                            0;

                          return (
                            <div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-green-700 font-medium">
                                  {editDispatch.item_name}:
                                </span>
                                <span className="text-green-900 font-semibold">
                                  {currentStock} units
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-green-700">
                                  Remaining Quantity:
                                </span>
                                <span className="text-green-900">
                                  {editDispatch?.quantity -
                                    (parseInt(editDispatch.dispatch_qty || 0) +
                                      parseInt(values.dispatch_qty || 0))}{" "}
                                  units
                                </span>
                              </div>
                              {/* <div className="flex justify-between items-center text-sm">
                                <span className="text-green-700">
                                  Current dispatch:
                                </span>
                                <span className="text-green-900">
                                  {editDispatch.dispatch_qty} units
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-green-800">
                                  Available stock:
                                </span>
                                <span className="text-green-900">
                                  {currentStock} units
                                </span>
                              </div> */}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {selectedOrder && selectedOrder?.product_id && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Available Stock:
                    </h4>
                    {isLoadingStocks ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-blue-600 text-sm">
                          Loading stock information...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {selectedOrder.product_id.map((product, index) => {
                          const productId = product._id || product.product_id;
                          const stockData = productStocks[productId];

                          // Try multiple possible locations for current stock
                          const currentStock =
                            stockData?.current_stock ||
                            stockData?.stock ||
                            stockData?.product?.current_stock ||
                            stockData?.quantity_changed ||
                            0;

                          console.log("Stock Debug:", {
                            productId,
                            stockData,
                            currentStock,
                            rawCurrentStock: stockData?.current_stock,
                            productStocks,
                          });

                          return (
                            <div
                              key={productId || index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-blue-700 font-medium">
                                {product.name ||
                                  stockData?.name ||
                                  stockData?.product_name ||
                                  "N/A"}
                                :
                              </span>
                              <span className="text-blue-900 font-semibold">
                                {currentStock} units available
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="number"
                  name="dispatch_qty"
                  value={values.dispatch_qty}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;

                    // Get product ID - either from selected order or edit dispatch
                    const firstProductId =
                      selectedOrder?.product_id?.[0]?._id ||
                      selectedOrder?.product_id?.[0]?.product_id ||
                      editDispatch?.product_id;

                    const stockData = productStocks[firstProductId];
                    const currentStock =
                      stockData?.current_stock ||
                      stockData?.stock ||
                      stockData?.product?.current_stock ||
                      stockData?.quantity_changed ||
                      0;

                    // Get order quantity for validation
                    const orderQuantity =
                      selectedOrder?.product_qty || editDispatch?.quantity || 0;
                    const currentDispatchQty =
                      parseInt(editDispatch?.dispatch_qty) || 0;
                    const totalDispatchQty = editDispatch
                      ? currentDispatchQty + value
                      : value;

                    // Check against order quantity first
                    if (totalDispatchQty > orderQuantity) {
                      toast.warning(
                        `Total dispatch quantity (${totalDispatchQty}) cannot exceed order quantity (${orderQuantity} units)`
                      );
                    }
                    // Then check against stock
                    else if (value > currentStock) {
                      toast.warning(
                        `Dispatch quantity cannot exceed available stock (${currentStock} units)`
                      );
                    }

                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="Enter Dispatch Quantity"
                  min="1"
                  max={(() => {
                    // Get order quantity
                    const orderQuantity =
                      selectedOrder?.product_qty || editDispatch?.quantity || 0;
                    const currentDispatchQty =
                      parseInt(editDispatch?.dispatch_qty) || 0;
                    const remainingOrderQty =
                      orderQuantity - currentDispatchQty;

                    // Get stock quantity
                    const firstProductId =
                      selectedOrder?.product_id?.[0]?._id ||
                      selectedOrder?.product_id?.[0]?.product_id ||
                      editDispatch?.product_id;

                    const stockData = productStocks[firstProductId];
                    const currentStock =
                      stockData?.current_stock ||
                      stockData?.stock ||
                      stockData?.product?.current_stock ||
                      stockData?.quantity_changed ||
                      0;

                    // Return the minimum of remaining order quantity and available stock
                    return Math.min(remainingOrderQty, currentStock) || 1;
                  })()}
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      errors.dispatch_qty && touched.dispatch_qty
                        ? colors.error[500]
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                />

                {(selectedOrder || editDispatch) && values.dispatch_qty && (
                  <div className="mt-1">
                    {(() => {
                      const firstProductId =
                        selectedOrder?.product_id?.[0]?._id ||
                        selectedOrder?.product_id?.[0]?.product_id ||
                        editDispatch?.product_id;

                      const stockData = productStocks[firstProductId];
                      const currentStock =
                        stockData?.current_stock ||
                        stockData?.stock ||
                        stockData?.product?.current_stock ||
                        stockData?.quantity_changed ||
                        0;

                      const orderQuantity =
                        selectedOrder?.product_qty ||
                        editDispatch?.quantity ||
                        0;
                      const currentDispatchQty =
                        parseInt(editDispatch?.dispatch_qty) || 0;
                      const enteredQty = parseInt(values.dispatch_qty) || 0;
                      const totalDispatchQty = editDispatch
                        ? currentDispatchQty + enteredQty
                        : enteredQty;

                      // Check order quantity validation first
                      if (totalDispatchQty > orderQuantity) {
                        return (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span>⚠️</span>
                            Exceeds order quantity! Maximum allowed:{" "}
                            {orderQuantity - currentDispatchQty} units
                          </p>
                        );
                      }

                      // Then check stock validation
                      if (enteredQty > currentStock) {
                        return (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            {/* <span>⚠️</span> */}
                            Exceeds available stock! Maximum stock:{" "}
                            {currentStock} units
                          </p>
                        );
                      }

                      // Show success message if both validations pass
                      if (enteredQty > 0) {
                        return (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            {/* <span>✅</span> */}
                            Valid quantity - {orderQuantity -
                              totalDispatchQty}{" "}
                            units remaining in order,{" "}
                            {currentStock - enteredQty} units remaining in stock
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {/* Commented out Stock Error Message - reverting to toast warnings */}
                {/* {stockError && (
                  <p
                    className="mt-1 text-sm flex items-center gap-1"
                    style={{ color: colors.error[500] }}
                  >
                    <span>⚠️</span>
                    {stockError}
                  </p>
                )} */}

                {errors.dispatch_qty && touched.dispatch_qty && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: colors.error[500] }}
                  >
                    {errors.dispatch_qty}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Dispatch Date
                </label>
                <input
                  type="date"
                  name="dispatch_date"
                  value={values.dispatch_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={values.remarks}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  placeholder="Additional notes or remarks"
                  className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                />
              </div>
            </form>
          </div>

          <div className="border-t p-6 bg-gray-50">
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="px-4 py-2 border rounded-lg font-medium transition-colors"
                style={{
                  borderColor: colors.border.medium,
                  color: colors.text.secondary,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (!editDispatch && !selectedOrder) || // Only require selectedOrder for new dispatches
                  !values.dispatch_qty ||
                  // stockError || // Commented out - reverting to toast warnings
                  (() => {
                    // Get product ID from either selected order or edit dispatch
                    const firstProductId =
                      selectedOrder?.product_id?.[0]?._id ||
                      selectedOrder?.product_id?.[0]?.product_id ||
                      editDispatch?.product_id;

                    const stockData = productStocks[firstProductId];
                    const currentStock =
                      stockData?.current_stock ||
                      stockData?.stock ||
                      stockData?.product?.current_stock ||
                      stockData?.quantity_changed ||
                      0;

                    // Use current stock directly
                    const availableStock = currentStock;

                    return (
                      parseInt(values.dispatch_qty) > availableStock ||
                      parseInt(values.dispatch_qty) <= 0
                    );
                  })()
                }
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-100 "
                style={{
                  backgroundColor:
                    isSubmitting ||
                    (!editDispatch && !selectedOrder) || // Only require selectedOrder for new dispatches
                    !values.dispatch_qty ||
                    // stockError || // Commented out - reverting to toast warnings
                    (() => {
                      // Get product ID from either selected order or edit dispatch
                      const firstProductId =
                        selectedOrder?.product_id?.[0]?._id ||
                        selectedOrder?.product_id?.[0]?.product_id ||
                        editDispatch?.product_id;

                      const stockData = productStocks[firstProductId];
                      const currentStock =
                        stockData?.current_stock ||
                        stockData?.stock ||
                        stockData?.product?.current_stock ||
                        stockData?.quantity_changed ||
                        0;

                      // Use current stock directly
                      const availableStock = currentStock;

                      return (
                        parseInt(values.dispatch_qty) > availableStock ||
                        parseInt(values.dispatch_qty) <= 0
                      );
                    })()
                      ? colors.gray[400]
                      : colors.button.primary,
                }}
              >
                {isSubmitting
                  ? editDispatch
                    ? "Updating..."
                    : "Creating..."
                  : editDispatch
                  ? "Update Dispatch"
                  : "Create Dispatch"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDispatch;
