//@ts-nocheck
import { useState, useRef, useEffect } from "react";
import { TbTruckDelivery } from "react-icons/tb";
import { HiOutlinePaperClip } from "react-icons/hi";
import { FiEye } from "react-icons/fi";
import { RefreshCw, Filter, Search, Pencil, Download } from "lucide-react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { DispatchFormSchema } from "../Validation/DispatchFormValidation";
import { useFormik } from "formik";
import Loading from "../ui/Loading";
import EmptyData from "../ui/emptyData";
import Pagination from "./Pagination";
import { colors } from "../theme/colors";
import { MdAdd, MdOutlineRefresh } from "react-icons/md";
import AddDispatch from "../components/Drawers/Dispatch/AddDispatch";

const Dispatch = () => {
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [productFilter, setProductFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showAddDispatch, setShowAddDispatch] = useState(false);
  const [siteLink, setSiteLink] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [editDispatch, setEditDispatch] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeliveryProof, setShowDeliveryProof] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDispatchId, setSelectedDispatchId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState(""); // "delivery" or "invoice"

  const role = cookies?.role;

  const calculatePaymentStatus = (dispatch) => {
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
  const getPaymentBreakdown = (dispatch) => {
    if (!dispatch?.invoice) return null;

    const invoiceTotal = parseFloat(dispatch.invoice.total) || 0;
    const invoiceBalance = parseFloat(dispatch.invoice.balance) || 0;

    // Calculate total paid amount: total - balance
    const totalPaid = Math.max(0, invoiceTotal - invoiceBalance);

    return {
      total: invoiceTotal,
      paid: totalPaid,
      remaining: invoiceBalance,
      paymentsCount: dispatch.invoice.payments
        ? dispatch.invoice.payments.length
        : 0,
    };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedDispatchId) {
      toast.error("Please select a file and dispatch");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (uploadType === "delivery") {
        formData.append("delivery_proof", selectedFile);
      } else {
        formData.append("invoice", selectedFile);
      }

      const endpoint =
        uploadType === "delivery"
          ? `upload-delivery-proof/${selectedDispatchId}`
          : `upload-invoice/${selectedDispatchId}`;

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}dispatch/${endpoint}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      toast.success(
        `${
          uploadType === "delivery"
            ? "Delivery proof uploaded successfully! Status changed to Delivered."
            : "Invoice uploaded successfully"
        }`
      );

      setSelectedFile(null);
      setFileName("");
      setPreview(null);
      setSelectedDispatchId(null);
      setShowDeliveryProof(false);
      setShowInvoice(false);

      GetDispatch();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Failed to upload ${
          uploadType === "delivery" ? "delivery proof" : "invoice"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
    values,
    errors,
    touched,
  } = useFormik({
    initialValues: {
      tracking_id: "",
      tracking_web: "",
    },
    validationSchema: DispatchFormSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}dispatch/update/${trackingId}`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );

        toast.success("Tracking information updated successfully");
        resetForm();
        setShowModal(false);
        GetDispatch();
      } catch (error) {
        console.log(error);
        toast.error("Failed to update tracking information");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const GetDispatch = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (productFilter !== "All") {
        params.append("dispatch_status", productFilter);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axios.get(
        `${
          process.env.REACT_APP_BACKEND_URL
        }dispatch/getAll?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${cookies.access_token}`,
          },
        }
      );

      let dispatchData = response?.data?.data || [];

      // Fetch sales data to get price information
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

      if (paymentFilter !== "All") {
        dispatchData = dispatchData.filter((dispatch) => {
          const calculatedStatus = calculatePaymentStatus(dispatch);
          return calculatedStatus === paymentFilter;
        });
      }

      setData(dispatchData);
    } catch (error) {
      console.error("Error fetching dispatch data:", error);
      toast.error("Failed to fetch dispatch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetDispatch();
  }, [page, productFilter, paymentFilter, searchTerm]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: colors.background.page }}
      >
        <div className="p-2 lg:p-3">
          <Loading />
        </div>
      </div>
    );
  }

  // if (!data || data.length === 0) {
  //   return (
  //     <div
  //       className="min-h-screen"
  //       style={{ backgroundColor: colors.background.page }}
  //     >
  //       <div className="p-2 lg:p-3">
  //         {/* Header Section */}
  //         <div
  //           className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
  //           style={{
  //             backgroundColor: colors.background.card,
  //             borderColor: colors.border.light,
  //           }}
  //         >
  //           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
  //             <div className="flex items-center gap-4">
  //               <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
  //                 <TbTruckDelivery className="text-white" size={24} />
  //               </div>
  //               <div>
  //                 <h1
  //                   className="text-2xl lg:text-3xl font-bold"
  //                   style={{ color: colors.text.primary }}
  //                 >
  //                   Dispatch Management
  //                 </h1>
  //                 <p
  //                   className="text-sm mt-1"
  //                   style={{ color: colors.text.secondary }}
  //                 >
  //                   Manage dispatch operations and track deliveries
  //                 </p>
  //               </div>
  //             </div>

  //             {/* Action Buttons */}
  //             <div className="flex flex-col sm:flex-row gap-3">
  //               <button
  //                 onClick={() => setShowAddDispatch(true)}
  //                 className="inline-flex items-center gap-1.5 px-3 py-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors"
  //                 style={{
  //                   backgroundColor: colors.button.primary,
  //                   color: colors.text.inverse,
  //                 }}
  //                 onMouseEnter={(e) => {
  //                   e.currentTarget.style.backgroundColor =
  //                     colors.button.primaryHover;
  //                 }}
  //                 onMouseLeave={(e) => {
  //                   e.currentTarget.style.backgroundColor =
  //                     colors.button.primary;
  //                 }}
  //               >
  //                 <MdAdd size="16px" />
  //                 Add Dispatch
  //               </button>

  //               <button
  //                 onClick={() => {
  //                   setPaymentFilter("All");
  //                   setProductFilter("All");
  //                   setSearchTerm("");
  //                   GetDispatch();
  //                 }}
  //                 className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors"
  //                 style={{
  //                   borderColor: colors.border.medium,
  //                   color: colors.text.primary,
  //                   backgroundColor: colors.background.card,
  //                 }}
  //                 onMouseEnter={(e) => {
  //                   e.currentTarget.style.backgroundColor = colors.gray[50];
  //                 }}
  //                 onMouseLeave={(e) => {
  //                   e.currentTarget.style.backgroundColor =
  //                     colors.background.card;
  //                 }}
  //               >
  //                 <MdOutlineRefresh size="16px" />
  //                 Refresh
  //               </button>
  //             </div>
  //           </div>

  //           {/* Search and Filters Row */}
  //           <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
  //             {/* Search Input */}
  //             <div className="flex-1 max-w-md">
  //               <label
  //                 className="block text-sm font-medium mb-2"
  //                 style={{ color: colors.text.primary }}
  //               >
  //                 Search Dispatch
  //               </label>
  //               <div className="relative">
  //                 <Search
  //                   className="absolute left-3 top-1/2 transform -translate-y-1/2"
  //                   style={{ color: colors.text.secondary }}
  //                 />
  //                 <input
  //                   className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
  //                   style={{
  //                     backgroundColor: colors.input.background,
  //                     borderColor: colors.input.border,
  //                     color: colors.text.primary,
  //                   }}
  //                   onFocus={(e) => {
  //                     e.currentTarget.style.borderColor =
  //                       colors.input.borderFocus;
  //                     e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
  //                   }}
  //                   onBlur={(e) => {
  //                     e.currentTarget.style.borderColor = colors.input.border;
  //                     e.currentTarget.style.boxShadow = "none";
  //                   }}
  //                   placeholder="Search by party name, product..."
  //                   value={searchTerm}
  //                   onChange={(e) => setSearchTerm(e.target.value)}
  //                 />
  //               </div>
  //             </div>

  //             {/* Payment Filter */}
  //             <div className="w-full lg:w-48">
  //               <label
  //                 className="block text-sm font-medium mb-2"
  //                 style={{ color: colors.text.primary }}
  //               >
  //                 Payment Status
  //               </label>
  //               <select
  //                 className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
  //                 style={{
  //                   backgroundColor: colors.input.background,
  //                   borderColor: colors.input.border,
  //                   color: colors.text.primary,
  //                 }}
  //                 onFocus={(e) => {
  //                   e.currentTarget.style.borderColor = colors.input.borderFocus;
  //                   e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
  //                 }}
  //                 onBlur={(e) => {
  //                   e.currentTarget.style.borderColor = colors.input.border;
  //                   e.currentTarget.style.boxShadow = "none";
  //                 }}
  //                 value={paymentFilter}
  //                 onChange={(e) => setPaymentFilter(e.target.value)}
  //               >
  //                 <option value="All">All Payment Status</option>
  //                 <option value="Paid">Paid</option>
  //                 <option value="Unpaid">Unpaid</option>
  //               </select>
  //             </div>

  //             {/* Product Filter */}
  //             <div className="w-full lg:w-48">
  //               <label
  //                 className="block text-sm font-medium mb-2"
  //                 style={{ color: colors.text.primary }}
  //               >
  //                 Product Status
  //               </label>
  //               <select
  //                 className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
  //                 style={{
  //                   backgroundColor: colors.input.background,
  //                   borderColor: colors.input.border,
  //                   color: colors.text.primary,
  //                 }}
  //                 onFocus={(e) => {
  //                   e.currentTarget.style.borderColor = colors.input.borderFocus;
  //                   e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
  //                 }}
  //                 onBlur={(e) => {
  //                   e.currentTarget.style.borderColor = colors.input.border;
  //                   e.currentTarget.style.boxShadow = "none";
  //                 }}
  //                 value={productFilter}
  //                 onChange={(e) => setProductFilter(e.target.value)}
  //               >
  //                 <option value="All">All Product Status</option>
  //                 <option value="Dispatch">Dispatch</option>
  //                 <option value="Delivered">Delivered</option>
  //               </select>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Empty State */}
  //         <div
  //           className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
  //           style={{
  //             backgroundColor: colors.background.card,
  //             borderColor: colors.border.light,
  //           }}
  //         >
  //           <EmptyData />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  console.log("daaaaata", data);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      <div className="p-2 lg:p-3">
        <div
          className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <TbTruckDelivery className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Dispatch Management
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Manage dispatch operations and track deliveries
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowAddDispatch(true);
                  setEditDispatch(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.button.primary,
                  color: colors.text.inverse,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.button.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.button.primary;
                }}
              >
                <MdAdd size="16px" />
                Add Dispatch
              </button>

              <button
                onClick={() => {
                  setPaymentFilter("All");
                  setProductFilter("All");
                  setSearchTerm("");
                  GetDispatch();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors"
                style={{
                  borderColor: colors.border.medium,
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.background.card;
                }}
              >
                <MdOutlineRefresh size="16px" />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 max-w-md">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Search Dispatch
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: colors.text.secondary }}
                />
                <input
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      colors.input.borderFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.input.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Search by party name, product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Payment Status
              </label>
              <select
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.input.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.input.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="All">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div> */}

            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Product Status
              </label>
              <select
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.input.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.input.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              >
                <option value="All">All Product Status</option>
                <option value="Dispatch">Dispatch</option>
                <option value="Dispatch Pending">Dispatch Pending</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Payment Status
              </label>
              <select
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.input.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.input.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="All">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Partial Paid">Partial Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="p-6">
            <div className="space-y-6">
              {!data || data.length === 0 ? (
                <EmptyData />
              ) : (
                data?.map((dispatch: any) => (
                  <div
                    key={dispatch?._id}
                    className="border rounded-xl border-l-4 transition-all duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: colors.background.card,
                      borderLeftColor: colors.success[500],
                      borderColor: colors.border.light,
                    }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: colors.primary[100],
                                color: colors.primary[800],
                              }}
                            >
                              Dispatch #{dispatch?._id?.slice(-6).toUpperCase()}
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: colors.text.secondary }}
                            >
                              {new Date(
                                dispatch?.createdAt
                              ).toLocaleDateString()}
                            </span>
                            {/* Dispatch Status Badge */}
                            {/* {(() => {
                              const orderQty =
                                parseInt(dispatch?.quantity) || 0;
                              const dispatchQty =
                                parseInt(dispatch?.dispatch_qty) || 0;
                              const percentage =
                                orderQty > 0
                                  ? Math.round((dispatchQty / orderQty) * 100)
                                  : 0;
                              const isComplete = percentage >= 100;

                              return (
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: isComplete
                                      ? colors.success[100]
                                      : colors.warning[100],
                                    color: isComplete
                                      ? colors.success[800]
                                      : colors.warning[800],
                                  }}
                                >
                                  {isComplete
                                    ? "Complete"
                                    : `${percentage}% Dispatched`}
                                </span>
                              );
                            })()} */}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-medium"
                                    style={{ color: colors.text.primary }}
                                  >
                                    Party:
                                  </span>
                                  <span
                                    style={{ color: colors.text.secondary }}
                                  >
                                    {dispatch?.merchant_name || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-medium"
                                    style={{ color: colors.text.primary }}
                                  >
                                    Product:
                                  </span>
                                  <span
                                    style={{ color: colors.text.secondary }}
                                  >
                                    {dispatch?.item_name || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-medium"
                                    style={{ color: colors.text.primary }}
                                  >
                                    Order Qty:
                                  </span>
                                  <span
                                    style={{ color: colors.text.secondary }}
                                  >
                                    {dispatch?.quantity || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-medium"
                                    style={{ color: colors.text.primary }}
                                  >
                                    Dispatch Qty:
                                  </span>
                                  <span
                                    style={{ color: colors.text.secondary }}
                                  >
                                    {dispatch?.dispatch_qty || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-medium"
                                    style={{ color: colors.text.primary }}
                                  >
                                    Remaining Qty:
                                  </span>
                                  <span
                                    style={{
                                      color: (() => {
                                        const orderQty =
                                          parseInt(dispatch?.quantity) || 0;
                                        const dispatchQty =
                                          parseInt(dispatch?.dispatch_qty) || 0;
                                        const remaining =
                                          orderQty - dispatchQty;
                                        return remaining > 0
                                          ? colors.text.secondary
                                          : colors.text.secondary;
                                      })(),
                                    }}
                                  >
                                    {(() => {
                                      const orderQty =
                                        parseInt(dispatch?.quantity) || 0;
                                      const dispatchQty =
                                        parseInt(dispatch?.dispatch_qty) || 0;
                                      const remaining = orderQty - dispatchQty;
                                      return remaining >= 0 ? remaining : "N/A";
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {(role === "Accountant" ||
                                role === "Sales" ||
                                role === "admin") && (
                                <>
                                  <div className="flex items-center whitespace-nowrap gap-2">
                                    <span
                                      className="font-medium"
                                      style={{ color: colors.text.primary }}
                                    >
                                      Sales Order:
                                    </span>
                                    <span
                                      style={{ color: colors.text.secondary }}
                                    >
                                      {dispatch?.order_id ||
                                        dispatch?.sales_order_id ||
                                        "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-medium"
                                      style={{ color: colors.text.primary }}
                                    >
                                      Sales Amount:
                                    </span>
                                    <span
                                      style={{ color: colors.text.secondary }}
                                    >
                                      {dispatch?.sales_data ? (
                                        <span className="flex items-center gap-1">
                                          ₹{dispatch?.total_amount || "N/A"}
                                        </span>
                                      ) : (
                                        `₹${dispatch?.total_amount || "N/A"}`
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-medium"
                                      style={{ color: colors.text.primary }}
                                    >
                                      Dispatch Amount:
                                    </span>
                                    <span
                                      style={{ color: colors.text.secondary }}
                                    >
                                      {(() => {
                                        const orderQty =
                                          parseInt(dispatch?.quantity) ||
                                          parseInt(dispatch?.sales_quantity) ||
                                          0;
                                        const dispatchQty =
                                          parseInt(dispatch?.dispatch_qty) || 0;
                                        const totalAmount =
                                          parseFloat(dispatch?.total_amount) ||
                                          0;
                                        const dispatchAmount =
                                          orderQty > 0
                                            ? (dispatchQty / orderQty) *
                                              totalAmount
                                            : 0;

                                        return dispatchAmount > 0 ? (
                                          <span className="flex items-center gap-1">
                                            ₹{Math.round(dispatchAmount)}
                                          </span>
                                        ) : (
                                          "N/A"
                                        );
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-medium"
                                      style={{ color: colors.text.primary }}
                                    >
                                      Remaining Amount:
                                    </span>
                                    <span
                                      style={{
                                        color: (() => {
                                          const orderQty =
                                            parseInt(dispatch?.quantity) ||
                                            parseInt(
                                              dispatch?.sales_quantity
                                            ) ||
                                            0;
                                          const dispatchQty =
                                            parseInt(dispatch?.dispatch_qty) ||
                                            0;
                                          const totalAmount =
                                            parseFloat(
                                              dispatch?.total_amount
                                            ) || 0;
                                          const dispatchAmount =
                                            orderQty > 0
                                              ? (dispatchQty / orderQty) *
                                                totalAmount
                                              : 0;
                                          const remainingAmount =
                                            totalAmount - dispatchAmount;
                                          return remainingAmount > 0
                                            ? colors.text.secondary
                                            : colors.text.secondary;
                                        })(),
                                      }}
                                    >
                                      {(() => {
                                        const orderQty =
                                          parseInt(dispatch?.quantity) ||
                                          parseInt(dispatch?.sales_quantity) ||
                                          0;
                                        const dispatchQty =
                                          parseInt(dispatch?.dispatch_qty) || 0;
                                        const totalAmount =
                                          parseFloat(dispatch?.total_amount) ||
                                          0;
                                        const dispatchAmount =
                                          orderQty > 0
                                            ? (dispatchQty / orderQty) *
                                              totalAmount
                                            : 0;
                                        const remainingAmount =
                                          totalAmount - dispatchAmount;

                                        return remainingAmount >= 0 ? (
                                          <span className="flex items-center gap-1">
                                            ₹{Math.round(remainingAmount)}
                                          </span>
                                        ) : (
                                          "N/A"
                                        );
                                      })()}
                                    </span>
                                  </div>
                                </>
                              )}

                              <div className="flex items-center gap-2">
                                <span
                                  className="font-medium"
                                  style={{ color: colors.text.primary }}
                                >
                                  Payment Status:
                                </span>
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: (() => {
                                      const calculatedStatus =
                                        calculatePaymentStatus(dispatch);
                                      if (calculatedStatus === "Paid")
                                        return colors.success[100];
                                      if (calculatedStatus === "Partial Paid")
                                        return colors.warning[100];
                                      return colors.error[100];
                                    })(),
                                    color: (() => {
                                      const calculatedStatus =
                                        calculatePaymentStatus(dispatch);
                                      if (calculatedStatus === "Paid")
                                        return colors.success[800];
                                      if (calculatedStatus === "Partial Paid")
                                        return colors.warning[800];
                                      return colors.error[800];
                                    })(),
                                  }}
                                >
                                  {calculatePaymentStatus(dispatch)}
                                </span>
                              </div>

                              {/* TODO: Payment Breakdown */}
                              {/* {(() => {
                                const breakdown = getPaymentBreakdown(dispatch);
                                if (!breakdown || breakdown.total === 0)
                                  return null;

                                return (
                                  <div
                                    className="text-xs space-y-1 mt-2 p-2 rounded-lg"
                                    style={{ backgroundColor: colors.gray[50] }}
                                  >
                                    <div className="flex justify-between">
                                      <span
                                        style={{ color: colors.text.secondary }}
                                      >
                                        Invoice Total:
                                      </span>
                                      <span
                                        style={{ color: colors.text.primary }}
                                      >
                                        ₹{breakdown.total.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        style={{ color: colors.text.secondary }}
                                      >
                                        Amount Paid:
                                      </span>
                                      <span
                                        style={{ color: colors.success[600] }}
                                      >
                                        ₹{breakdown.paid.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        style={{ color: colors.text.secondary }}
                                      >
                                        Remaining:
                                      </span>
                                      <span
                                        style={{
                                          color:
                                            breakdown.remaining > 0
                                              ? colors.error[600]
                                              : colors.success[600],
                                        }}
                                      >
                                        ₹{breakdown.remaining.toFixed(2)}
                                      </span>
                                    </div>
                                    {breakdown.paymentsCount > 0 && (
                                      <div className="flex justify-between text-xs">
                                        <span
                                          style={{
                                            color: colors.text.secondary,
                                          }}
                                        >
                                          Payments Made:
                                        </span>
                                        <span
                                          style={{ color: colors.text.primary }}
                                        >
                                          {breakdown.paymentsCount}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()} */}

                              <div className="flex items-center gap-2">
                                <span
                                  className="font-medium"
                                  style={{ color: colors.text.primary }}
                                >
                                  Dispatch Status:
                                </span>
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: (() => {
                                      switch (dispatch?.dispatch_status) {
                                        case "Delivered":
                                          return colors.success[100];
                                        case "Dispatch Pending":
                                          return colors.warning[100];
                                        default:
                                          return colors.primary[100];
                                      }
                                    })(),
                                    color: (() => {
                                      switch (dispatch?.dispatch_status) {
                                        case "Delivered":
                                          return colors.success[800];
                                        case "Dispatch Pending":
                                          return colors.warning[800];
                                        default:
                                          return colors.primary[800];
                                      }
                                    })(),
                                  }}
                                >
                                  {dispatch?.dispatch_status || "Dispatch"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex gap-3 justify-end pt-4 border-t"
                        style={{ borderColor: colors.border.light }}
                      >
                        <button
                          onClick={() => {
                            setShowAddDispatch(true);
                            setEditDispatch(dispatch);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            backgroundColor: colors.background.card,
                            borderColor: colors.border.medium,
                            color: colors.text.secondary,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.gray[50];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.background.card;
                          }}
                        >
                          <Pencil size={16} />
                          Update Dispatch
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDispatchId(dispatch._id);
                            setUploadType("delivery");
                            setShowDeliveryProof(true);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            dispatch?.dispatch_status === "Delivered"
                              ? "border-green-500 bg-green-50"
                              : ""
                          }`}
                          style={{
                            backgroundColor:
                              dispatch?.dispatch_status === "Delivered"
                                ? colors.success[50]
                                : colors.background.card,
                            borderColor:
                              dispatch?.dispatch_status === "Delivered"
                                ? colors.success[500]
                                : colors.border.medium,
                            color:
                              dispatch?.dispatch_status === "Delivered"
                                ? colors.success[700]
                                : colors.text.secondary,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              dispatch?.dispatch_status === "Delivered"
                                ? colors.success[100]
                                : colors.gray[50];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              dispatch?.dispatch_status === "Delivered"
                                ? colors.success[50]
                                : colors.background.card;
                          }}
                        >
                          <HiOutlinePaperClip size={16} />
                          {dispatch?.delivery_proof?.filename
                            ? "Update Delivery Proof"
                            : "Upload Delivery Proof"}
                        </button>

                        {dispatch?.dispatch_status === "Delivered" &&
                          dispatch?.delivery_proof?.filename && (
                            <button
                              onClick={async () => {
                                try {
                                  const response = await axios.get(
                                    `${process.env.REACT_APP_BACKEND_URL}dispatch/download/${dispatch._id}/delivery-proof`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${cookies?.access_token}`,
                                      },
                                      responseType: "blob",
                                    }
                                  );

                                  // Create a blob URL and trigger download
                                  const blob = new Blob([response.data]);
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download =
                                    dispatch.delivery_proof.originalName ||
                                    "delivery-proof.pdf";
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);

                                  toast.success(
                                    "Latest delivery proof downloaded successfully"
                                  );
                                } catch (error) {
                                  console.error("Download error:", error);
                                  toast.error("Failed to download file");
                                }
                              }}
                              title="Download latest delivery proof"
                              className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                              style={{
                                backgroundColor: colors.success[100],
                                borderColor: colors.success[300],
                                color: colors.success[700],
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  colors.success[200];
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  colors.success[100];
                              }}
                            >
                              <Download size={14} />
                              Latest Delivery Proof
                            </button>
                          )}

                        <button
                          onClick={() => {
                            if (dispatch?.invoice?.filename) {
                              toast.info(
                                "Invoice already uploaded. You can only upload once."
                              );
                              return;
                            }
                            setSelectedDispatchId(dispatch._id);
                            setUploadType("invoice");
                            setShowInvoice(true);
                          }}
                          disabled={dispatch?.invoice?.filename}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            dispatch?.invoice?.filename
                              ? "border-green-500 bg-green-50 cursor-not-allowed opacity-60"
                              : ""
                          }`}
                          style={{
                            backgroundColor: dispatch?.invoice?.filename
                              ? colors.success[50]
                              : colors.background.card,
                            borderColor: dispatch?.invoice?.filename
                              ? colors.success[500]
                              : colors.border.medium,
                            color: dispatch?.invoice?.filename
                              ? colors.success[700]
                              : colors.text.secondary,
                          }}
                          onMouseEnter={(e) => {
                            if (!dispatch?.invoice?.filename) {
                              e.currentTarget.style.backgroundColor =
                                colors.gray[50];
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = dispatch
                              ?.invoice?.filename
                              ? colors.success[50]
                              : colors.background.card;
                          }}
                        >
                          <HiOutlinePaperClip size={16} />
                          {dispatch?.invoice?.filename
                            ? "Invoice Uploaded"
                            : "Upload Invoice"}
                        </button>

                        {dispatch?.invoice?.filename && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await axios.get(
                                  `${process.env.REACT_APP_BACKEND_URL}dispatch/download/${dispatch._id}/invoice`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${cookies?.access_token}`,
                                    },
                                    responseType: "blob",
                                  }
                                );

                                // Create a blob URL and trigger download
                                const blob = new Blob([response.data]);
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download =
                                  dispatch.invoice.originalName ||
                                  "invoice.pdf";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error("Download error:", error);
                                toast.error("Failed to download file");
                              }
                            }}
                            title="Download invoice (uploaded once)"
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              backgroundColor: colors.success[100],
                              borderColor: colors.success[300],
                              color: colors.success[700],
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.success[200];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.success[100];
                            }}
                          >
                            <Download size={14} />
                            Download Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Pagination
            page={page}
            setPage={setPage}
            hasNextPage={data.length === 10}
          />
        </div>
      </div>

      {/* {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.text.primary }}
                >
                  Update Tracking Details
                </h3>

                <div className="space-y-4">
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
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Enter tracking ID"
                    />
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
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Enter tracking website URL"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: colors.primary[600],
                      color: colors.text.inverse,
                    }}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200"
                    style={{
                      backgroundColor: colors.background.card,
                      borderColor: colors.border.medium,
                      color: colors.text.secondary,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )} */}

      {showDeliveryProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Upload Delivery Proof
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowDeliveryProof(false);
                    setSelectedFile(null);
                    setFileName("");
                    setPreview(null);
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.text.secondary }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Select File (Image or PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                />
                {fileName && (
                  <p
                    className="mt-2 text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Selected: {fileName}
                  </p>
                )}
                {preview && (
                  <div className="mt-3">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      selectedFile && !isSubmitting
                        ? colors.primary[600]
                        : colors.gray[400],
                    color: colors.text.inverse,
                  }}
                >
                  {isSubmitting ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => {
                    setShowDeliveryProof(false);
                    setSelectedFile(null);
                    setFileName("");
                    setPreview(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: colors.background.card,
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Upload Invoice
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowInvoice(false);
                    setSelectedFile(null);
                    setFileName("");
                    setPreview(null);
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.text.secondary }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Select File (Image or PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                />
                {fileName && (
                  <p
                    className="mt-2 text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Selected: {fileName}
                  </p>
                )}
                {preview && (
                  <div className="mt-3">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      selectedFile && !isSubmitting
                        ? colors.primary[600]
                        : colors.gray[400],
                    color: colors.text.inverse,
                  }}
                >
                  {isSubmitting ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => {
                    setShowInvoice(false);
                    setSelectedFile(null);
                    setFileName("");
                    setPreview(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: colors.background.card,
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddDispatch
        show={showAddDispatch}
        setShow={(show) => {
          setShowAddDispatch(show);
          if (!show) {
            setEditDispatch(null);
          }
        }}
        fetchDispatch={GetDispatch}
        editDispatch={editDispatch}
      />
    </div>
  );
};

export default Dispatch;
