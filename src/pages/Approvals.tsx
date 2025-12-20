// @ts-nocheck

import { toast } from "react-toastify";
import {
  useDeleteAgentMutation,
  useDeleteBomMutation,
  useDeleteProductMutation,
  useDeleteStoresMutation,
  useUpdateAgentMutation,
  useUpdateBOMMutation,
  useUpdateProductMutation,
  useUpdateStoreMutation,
} from "../redux/api/api";
import { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { Button } from "@chakra-ui/react";
import { MdOutlineRefresh } from "react-icons/md";
import ProductTable from "../components/Table/ProductTable";
import AgentTable from "../components/Table/AgentTable";
import BOMTable from "../components/Table/BOMTable";
import BOMRawMaterialTable from "../components/Table/BOMRawMaterialTable";
import { useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { colors } from "../theme/colors";
import StoreTable from "../components/Table/StoreTable";

const Approvals: React.FC = () => {
  const [cookies] = useCookies();
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const canAccessControlPanel = isSuper || allowedroutes.includes("approval");
  const canApproveSales = canAccessControlPanel || allowedroutes.includes("sales");
  const [activeSection, setActiveSection] = useState(
    canAccessControlPanel ? "products" : "sales"
  );
  //  Products
  const [productSearchKey, setProductSearchKey] = useState<
    string | undefined
  >();
  const [products, setProducts] = useState<any>([]);
  const [filteredProducts, setFilteredProducts] = useState<any>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  //  Stores
  const [storeSearchKey, setStoreSearchKey] = useState<string | undefined>();
  const [stores, setStores] = useState<any>([]);
  const [filteredStores, setFilteredStores] = useState<any>([]);
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(false);
  //  Buyer
  const [buyerSearchKey, setBuyerSearchKey] = useState<string | undefined>();
  const [buyers, setBuyers] = useState<any>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<any>([]);
  const [isLoadingBuyers, setIsLoadingBuyers] = useState<boolean>(false);
  //  Supplier
  const [sellerSearchKey, setSellerSearchKey] = useState<string | undefined>();
  const [sellers, setSellers] = useState<any>([]);
  const [filteredSellers, setFilteredSellers] = useState<any>([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState<boolean>(false);
  //  BOM
  const [bomSearchKey, setBomSearchKey] = useState<string | undefined>();
  const [boms, setBoms] = useState<any>([]);
  const [filteredBoms, setFilteredBoms] = useState<any>([]);
  const [isLoadingBoms, setIsLoadingBoms] = useState<boolean>(false);
  //  BOM Raw Materials
  const [bomRMSearchKey, setBomRMSearchKey] = useState<string | undefined>();
  const [bomRMs, setBomRMs] = useState<any>([]);
  const [filteredBomRMs, setFilteredBomRMs] = useState<any>([]);
  const [isLoadingBomRMs, setIsLoadingBomRMs] = useState<boolean>(false);
   const [currentStock,setCurrentStock] = useState(null)
  //  Sales (Unapproved)
  const [salesSearchKey, setSalesSearchKey] = useState<string | undefined>();
  const [sales, setSales] = useState<any>([]);
  const [filteredSales, setFilteredSales] = useState<any>([]);
  const [isLoadingSales, setIsLoadingSales] = useState<boolean>(false);
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState(false)
  const [modalInput, setModalInput] = useState("")
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteStore] = useDeleteStoresMutation();
  const [updateStore] = useUpdateStoreMutation();
  const [deleteAgent] = useDeleteAgentMutation();
  const [updateAgent] = useUpdateAgentMutation();
  const [deleteBom] = useDeleteBomMutation();
  const [updateBom] = useUpdateBOMMutation();
  console.log("Modal",openModal)
  // For Unapproved Products
  const fetchUnapprovedProductsHandler = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "product/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setProducts(data.unapproved);
      setFilteredProducts(data.unapproved);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const approveProductHandler = async (id: string) => {
    try {
      const response: any = await updateProduct({
        _id: id,
        approved: true,
      }).unwrap();
      toast.success(response.message);
      fetchUnapprovedProductsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const bulkApproveProductsHandler = async (ids: string[]) => {
    try {
      await Promise.all(
        (ids || []).map((id) =>
          updateProduct({ _id: id, approved: true }).unwrap()
        )
      );
      toast.success(`Approved ${ids?.length || 0} product(s)`);
      fetchUnapprovedProductsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  const deleteProductHandler = async (id: string) => {
    try {
      const response: any = await deleteProduct({ _id: id }).unwrap();
      toast.success(response.message);
      fetchUnapprovedProductsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  // For Unapproved Stores
  const fetchUnapprovedStoresHandler = async () => {
    try {
      setIsLoadingStores(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "store/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setStores(data.unapproved);
      setFilteredStores(data.unapproved);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingStores(false);
    }
  };

  const approveStoreHandler = async (id: string) => {
    try {
      const response = await updateStore({ _id: id, approved: true }).unwrap();
      toast.success(response.message);
      fetchUnapprovedStoresHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const bulkApproveStoresHandler = async (ids: string[]) => {
    try {
      await Promise.all(
        (ids || []).map((id) => updateStore({ _id: id, approved: true }).unwrap())
      );
      toast.success(`Approved ${ids?.length || 0} store(s)`);
      fetchUnapprovedStoresHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  const deleteStoreHandler = async (id: string) => {
    try {
      const response: any = await deleteStore(id).unwrap();
      toast.success(response.message);
      fetchUnapprovedStoresHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  // For Unapproved Buyers And Sellers
  const fetchUnapprovedBuyersHandler = async () => {
    try {
      setIsLoadingBuyers(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "parties/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      const rows = Array.isArray(data?.data) ? data.data : [];
      const buyersList = rows.filter((r: any) => r.parties_type === "Buyer").map((r: any) => ({
        _id: r._id,
        name: r.contact_person_name || (Array.isArray(r.consignee_name) ? r.consignee_name[0] : r.consignee_name) || "",
        email: Array.isArray(r.email_id) ? r.email_id[0] : r.email_id || "",
        phone: Array.isArray(r.contact_number) ? r.contact_number[0] : r.contact_number || "",
        gst_number: r.bill_gst_to || r.shipped_gst_to || "",
        company_name: r.company_name || "",
        company_email: Array.isArray(r.email_id) ? r.email_id[0] : r.email_id || "",
        company_phone: Array.isArray(r.contact_number) ? r.contact_number[0] : r.contact_number || "",
        address_line1: r.bill_to || r.shipped_to || "",
        address_line2: "",
        pincode: "",
        city: "",
        state: "",
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        approved: r.approved,
      }));
      setBuyers(buyersList);
      setFilteredBuyers(buyersList);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingBuyers(false);
    }
  };

  const fetchUnapprovedSellersHandler = async () => {
    try {
      setIsLoadingBuyers(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "parties/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      const rows = Array.isArray(data?.data) ? data.data : [];
      const sellersList = rows.filter((r: any) => r.parties_type === "Seller").map((r: any) => ({
        _id: r._id,
        name: r.contact_person_name || (Array.isArray(r.consignee_name) ? r.consignee_name[0] : r.consignee_name) || "",
        email: Array.isArray(r.email_id) ? r.email_id[0] : r.email_id || "",
        phone: Array.isArray(r.contact_number) ? r.contact_number[0] : r.contact_number || "",
        gst_number: r.bill_gst_to || r.shipped_gst_to || "",
        company_name: r.company_name || "",
        company_email: Array.isArray(r.email_id) ? r.email_id[0] : r.email_id || "",
        company_phone: Array.isArray(r.contact_number) ? r.contact_number[0] : r.contact_number || "",
        address_line1: r.bill_to || r.shipped_to || "",
        address_line2: "",
        pincode: "",
        city: "",
        state: "",
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        approved: r.approved,
      }));
      setSellers(sellersList);
      setFilteredSellers(sellersList);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingBuyers(false);
    }
  };

  const approveAgentHandler = async (id: string) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `parties/put/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approved: true }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Approval failed");
      }
      toast.success(data?.message || "Approved successfully");
      fetchUnapprovedBuyersHandler();
      fetchUnapprovedSellersHandler();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  const bulkApproveAgentsHandler = async (ids: string[]) => {
    try {
      await Promise.all(
        (ids || []).map(async (id) => {
          const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `parties/put/${id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ approved: true }),
            }
          );
          const data = await response.json();
          if (!response.ok) throw new Error(data?.message || "Approval failed");
        })
      );
      toast.success(`Approved ${ids?.length || 0} agent(s)`);
      fetchUnapprovedBuyersHandler();
      fetchUnapprovedSellersHandler();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  const deleteAgentHandler = async (id: string) => {
    try {
      const response: any = await deleteAgent(id).unwrap();
      toast.success(response.message);
      fetchUnapprovedBuyersHandler();
      fetchUnapprovedSellersHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };


  // For Unapproved BOMs
  const fetchUnapprovedBomsHandler = async () => {
    try {
      setIsLoadingBoms(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "bom/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setBoms(data.boms);
      setFilteredBoms(data.boms);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingBoms(false);
    }
  };

  const approveBomHandler = async (id: string) => {
    try {
      const response = await updateBom({ _id: id, approved: true }).unwrap();
      toast.success(response.message);
      fetchUnapprovedBomsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const bulkApproveBomsHandler = async (ids: string[]) => {
    try {
      await Promise.all(
        (ids || []).map((id) => updateBom({ _id: id, approved: true }).unwrap())
      );
      toast.success(`Approved ${ids?.length || 0} BOM(s)`);
      fetchUnapprovedBomsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  const deleteBomHandler = async (id: string) => {
    try {
      const response: any = await deleteBom(id).unwrap();
      toast.success(response.message);
      fetchUnapprovedBomsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  // For Unapproved BOM Raw Materials
  const fetchUnapprovedBomRMsHandler = async () => {
    try {
      setIsLoadingBomRMs(true);
      const endpoint = "bom/all/inventory/raw-materials";
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + endpoint,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      const raw = Array.isArray(data.unapproved)
        ? data.unapproved.map((i: any) => ({ ...i, status: i.bom_status || "raw material approval pending" }))
        : [];
      const uniq = Array.from(new Map(raw.map((r: any) => [r._id, r])).values());
      setBomRMs(uniq);
      setFilteredBomRMs(uniq);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingBomRMs(false);
    }
  };

  const approveBomRMHandler = async (id: string) => {
    try {
      const endpoint = (isSuper
        ? "bom/approve/raw-materials"
        : "bom/approve/inventory/raw-materials");
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + endpoint,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ _id: id }),
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      toast.success(data.message);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const bulkApproveBomRMHandler = async (ids: string[]) => {
    try {
      const endpoint = isSuper ? "bom/approve/raw-materials" : "bom/approve/inventory/raw-materials";
      await Promise.all(
        (ids || []).map(async (id) => {
          const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + endpoint,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
                "content-type": "application/json",
              },
              body: JSON.stringify({ _id: id }),
            }
          );
          const data = await response.json();
          if (!data.success) throw new Error(data.message || "Failed");
        })
      );
      toast.success(`Approved ${ids?.length || 0} raw material(s)`);
      fetchUnapprovedBomRMsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  // For Unapproved Sales
  const fetchUnapprovedSalesHandler = async () => {
    try {
      setIsLoadingSales(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "sale/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      const rows = Array.isArray(data?.data) ? data.data : [];
      setSales(rows);
      setFilteredSales(rows);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingSales(false);
    }
  };

  const approveSaleHandler = async (id: string) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `sale/approve/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data?.message || "Failed");
      toast.success(data?.message || "Sale approved");
      fetchUnapprovedSalesHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  const bulkApproveSalesHandler = async (ids: string[]) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `sale/bulk-approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data?.message || "Failed");
      toast.success(data?.message || `Approved ${ids.length} sale(s)`);
      setSelectedSales([]);
      fetchUnapprovedSalesHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (!canAccessControlPanel) return;
    fetchUnapprovedProductsHandler();
    fetchUnapprovedStoresHandler();
    fetchUnapprovedBuyersHandler();
    fetchUnapprovedSellersHandler();
    fetchUnapprovedBomsHandler();
    fetchUnapprovedBomRMsHandler();
    fetchUnapprovedSalesHandler();
  }, [canAccessControlPanel]);

  useEffect(() => {
    if (!canApproveSales || canAccessControlPanel) return;
    fetchUnapprovedSalesHandler();
  }, [canApproveSales, canAccessControlPanel]);

  const handleModalSubmit = async (input: string) => {
    try {
      if (!selectedSaleId) return;
      const res = await fetch(
        process.env.REACT_APP_BACKEND_URL + `sale/update/${selectedSaleId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ terms_of_delivery: input }),
        }
      );
      if (!res.ok) throw new Error("Failed to update sale");
      await approveSaleHandler(selectedSaleId);
      setModalInput("");
      setSelectedSaleId(null);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };


  // Product Search
  useEffect(() => {
    const searchTxt = productSearchKey?.toLowerCase();
    const results = products.filter(
      (prod: any) =>
        prod.name?.toLowerCase()?.includes(searchTxt) ||
        prod.product_id?.toLowerCase()?.includes(searchTxt) ||
        prod.category?.toLowerCase()?.includes(searchTxt) ||
        prod.price?.toString()?.toLowerCase()?.toString().includes(searchTxt) ||
        prod.uom?.toLowerCase()?.includes(searchTxt) ||
        prod.current_stock?.toString().toString().includes(searchTxt) ||
        prod?.min_stock?.toString()?.includes(searchTxt) ||
        prod?.max_stock?.toString()?.includes(searchTxt) ||
        prod?.hsn?.includes(searchTxt) ||
        (prod?.createdAt &&
          new Date(prod?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (prod?.updatedAt &&
          new Date(prod?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredProducts(results);
  }, [productSearchKey]);

  // Store Search
  useEffect(() => {
    const searchTxt = storeSearchKey?.toLowerCase();
    const results = stores.filter(
      (st: any) =>
        st.name?.toLowerCase()?.includes(searchTxt) ||
        st.gst_number?.toLowerCase()?.includes(searchTxt) ||
        st.address_line1
          ?.toString()
          ?.toLowerCase()
          ?.toString()
          .includes(searchTxt) ||
        st.address_line2?.toLowerCase()?.includes(searchTxt) ||
        st.pincode?.toString().toString().includes(searchTxt) ||
        st?.city?.toString()?.includes(searchTxt) ||
        st?.state?.toString()?.includes(searchTxt) ||
        (st?.createdAt &&
          new Date(st?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (st?.updatedAt &&
          new Date(st?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredStores(results);
  }, [storeSearchKey]);

  // Buyer Search
  useEffect(() => {
    const searchTxt = buyerSearchKey?.toLowerCase();
    const results = buyers.filter(
      (buyer: any) =>
        buyer.name?.toLowerCase()?.includes(searchTxt) ||
        buyer.email?.toLowerCase()?.includes(searchTxt) ||
        buyer.phone?.toLowerCase()?.includes(searchTxt) ||
        buyer?.gst_number?.toLowerCase()?.includes(searchTxt) ||
        buyer.company_name.toLowerCase().includes(searchTxt) ||
        buyer.company_email.toLowerCase().includes(searchTxt) ||
        buyer.company_phone.toLowerCase().includes(searchTxt) ||
        buyer.address_line1.toLowerCase().includes(searchTxt) ||
        buyer?.address_line2?.toLowerCase()?.includes(searchTxt) ||
        buyer?.pincode?.toLowerCase()?.includes(searchTxt) ||
        buyer.city.toLowerCase().includes(searchTxt) ||
        buyer.state.toLowerCase().includes(searchTxt) ||
        (buyer?.createdAt &&
          new Date(buyer?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (buyer?.updatedAt &&
          new Date(buyer?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredBuyers(results);
  }, [buyerSearchKey]);

  // Seller Search
  useEffect(() => {
    const searchTxt = sellerSearchKey?.toLowerCase();
    const results = sellers.filter(
      (seller: any) =>
        seller.name?.toLowerCase()?.includes(searchTxt) ||
        seller.email?.toLowerCase()?.includes(searchTxt) ||
        seller.phone?.toLowerCase()?.includes(searchTxt) ||
        seller?.gst_number?.toLowerCase()?.includes(searchTxt) ||
        seller.company_name.toLowerCase().includes(searchTxt) ||
        seller.company_email.toLowerCase().includes(searchTxt) ||
        seller.company_phone.toLowerCase().includes(searchTxt) ||
        seller.address_line1.toLowerCase().includes(searchTxt) ||
        seller?.address_line2?.toLowerCase()?.includes(searchTxt) ||
        seller?.pincode?.toLowerCase()?.includes(searchTxt) ||
        seller.city.toLowerCase().includes(searchTxt) ||
        seller.state.toLowerCase().includes(searchTxt) ||
        (seller?.createdAt &&
          new Date(seller?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (seller?.updatedAt &&
          new Date(seller?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredSellers(results);
  }, [sellerSearchKey]);



  // BOM Search
  useEffect(() => {
    const searchTxt = bomSearchKey?.toLowerCase();
    const results = boms.filter(
      (bom: any) =>
        bom.bom_name?.toLowerCase()?.includes(searchTxt) ||
        bom.parts_count?.toString()?.toLowerCase()?.includes(searchTxt) ||
        bom.total_cost?.toString()?.toLowerCase()?.includes(searchTxt) ||
        (bom?.approved_by?.first_name + " " + bom?.approved_by?.last_name)
          ?.toString()
          ?.toLowerCase()
          ?.includes(searchTxt || "") ||
        (bom?.createdAt &&
          new Date(bom?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (bom?.updatedAt &&
          new Date(bom?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredBoms(results);
  }, [bomSearchKey]);

  // Sales Search
  useEffect(() => {
    const searchTxt = salesSearchKey?.toLowerCase();
    const results = sales.filter((s: any) =>
      (s?.order_id?.toLowerCase()?.includes(searchTxt)) ||
      (s?.party?.company_name?.toLowerCase()?.includes(searchTxt)) ||
      (Array.isArray(s?.product_id) && s?.product_id[0]?.name?.toLowerCase()?.includes(searchTxt)) ||
      (s?.product_qty?.toString()?.includes(searchTxt)) ||
      (s?.price?.toString()?.includes(searchTxt)) ||
      (s?.GST?.toString()?.includes(searchTxt)) ||
      (s?.createdAt && new Date(s?.createdAt)?.toISOString()?.substring(0, 10)?.split("-")?.reverse()?.join("")?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredSales(results);
  }, [salesSearchKey]);

  const sections = useMemo(
    () =>
      [
        { id: "products", label: "Products" },
        { id: "stores", label: "Stores" },
        { id: "buyers", label: "Buyers" },
        { id: "sellers", label: "Suppliers" },
        { id: "boms", label: "BOMs" },
        { id: "bomRMs", label: "BOM Raw Materials" },
        { id: "sales", label: "Sales" },
      ].filter((section) =>
        section.id === "sales" ? canApproveSales : canAccessControlPanel
      ),
    [canAccessControlPanel, canApproveSales]
  );

  useEffect(() => {
    if (sections.length === 0) return;
    if (!sections.some((section) => section.id === activeSection)) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection]);

  if (!canApproveSales) {
    return (
      <div className="text-center text-red-500">
        You are not allowed to access this route.
      </div>
    );
  }
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.page }}>
      <div className="p-2 lg:p-3">

        <div
          className="rounded-xl shadow-sm border p-6 mb-6"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: colors.text.primary }}>
              Control Panel
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              Review and approve pending products, stores, buyers, sellers, and BOMs
            </p>
          </div>
        </div>


        <div className="flex flex-wrap gap-3 mb-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors ${activeSection === section.id ? "bg-blue-500 text-white" : ""
                }`}
              style={{
                borderColor: colors.border.medium,
                backgroundColor: activeSection === section.id ? colors.button.primary : colors.background.card,
                color: activeSection === section.id ? "#fff" : colors.text.primary,
              }}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Conditionally Render Sections */}
        {activeSection === "products" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Products for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending products
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search products..."
                      value={productSearchKey || ""}
                      onChange={(e) => setProductSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedProductsHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <ProductTable
                isLoadingProducts={isLoadingProducts}
                products={filteredProducts}
                deleteProductHandler={deleteProductHandler}
                approveProductHandler={approveProductHandler}
                bulkApproveProductsHandler={bulkApproveProductsHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "stores" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Stores for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending stores
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search stores..."
                      value={storeSearchKey || ""}
                      onChange={(e) => setStoreSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedStoresHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <StoreTable
                isLoadingStores={isLoadingStores}
                stores={filteredStores}
                deleteStoreHandler={deleteStoreHandler}
                approveStoreHandler={approveStoreHandler}
                bulkApproveStoresHandler={bulkApproveStoresHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "buyers" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Buyers for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending buyers
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded" style={{ backgroundColor: colors.success[100], color: colors.success[800] }}>
                      Pending: {buyers?.length || 0}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search buyers..."
                      value={buyerSearchKey || ""}
                      onChange={(e) => setBuyerSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedBuyersHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <AgentTable
                isLoadingAgents={isLoadingBuyers}
                agents={filteredBuyers}
                approveAgentHandler={approveAgentHandler}
                bulkApproveAgentsHandler={bulkApproveAgentsHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "sellers" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Suppliers for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending suppliers
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded" style={{ backgroundColor: colors.success[100], color: colors.success[800] }}>
                      Pending: {sellers?.length || 0}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search suppliers..."
                      value={sellerSearchKey || ""}
                      onChange={(e) => setSellerSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedSellersHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <AgentTable
                isLoadingAgents={isLoadingSellers}
                agents={filteredSellers}
                approveAgentHandler={approveAgentHandler}
                bulkApproveAgentsHandler={bulkApproveAgentsHandler}
              />
            </div>
          </div>
        )}


        {activeSection === "boms" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    BOMs for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending Bill of Materials
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search BOMs..."
                      value={bomSearchKey || ""}
                      onChange={(e) => setBomSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedBomsHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <BOMTable
                isLoadingBoms={isLoadingBoms}
                boms={filteredBoms}
                deleteBomHandler={deleteBomHandler}
                approveBomHandler={approveBomHandler}
                bulkApproveBomsHandler={bulkApproveBomsHandler}
                refreshBoms={fetchUnapprovedBomsHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "bomRMs" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    BOM Raw Materials for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending BOM raw materials
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search raw materials..."
                      value={bomRMSearchKey || ""}
                      onChange={(e) => setBomRMSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedBomRMsHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <BOMRawMaterialTable
                isLoadingProducts={isLoadingBomRMs}
                products={filteredBomRMs}
                approveProductHandler={approveBomRMHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "sales" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: colors.border.light }}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                    Sales for Approval
                  </h2>
                  <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                    Review and approve pending sales orders
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search sales..."
                      value={salesSearchKey || ""}
                      onChange={(e) => setSalesSearchKey(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={fetchUnapprovedSalesHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {selectedSales.length > 0 && (
              <div className="flex items-center gap-3 px-6 pt-4">
                <Button
                  size="sm"
                  style={{ backgroundColor: colors.success[600], color: colors.text.inverse }}
                  _hover={{ bg: colors.success[700] }}
                  onClick={() => bulkApproveSalesHandler(selectedSales)}
                >
                  Approve Selected ({selectedSales.length})
                </Button>
                <Button size="sm" onClick={() => setSelectedSales([])}>Clear Selection</Button>
              </div>
            )}

            <div className="overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: colors.table.header }}>
                    <tr>
                      <th className="px-4 py-3" style={{ color: colors.table.headerText }}>
                        <input
                          type="checkbox"
                          checked={filteredSales.length > 0 && selectedSales.length === filteredSales.length}
                          ref={(el) => {
                            if (el) (el as any).indeterminate = selectedSales.length > 0 && selectedSales.length < filteredSales.length;
                          }}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSales(filteredSales.map((s: any) => s._id));
                            else setSelectedSales([]);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3" style={{ color: colors.table.headerText }}>Order ID</th>
                      <th className="px-4 py-3" style={{ color: colors.table.headerText }}>Party</th>
                      <th className="px-4 py-3" style={{ color: colors.table.headerText }}>Product</th>
                      <th className="px-4 py-3" style={{ color: colors.table.headerText }}>Qty</th>
                      <th className="px-4 py-3" style={{ color: colors.table.headerText }}>Price</th>
                      <th className="px-4 py-3" style={{ color: colors.table.headerText }}>GST</th>
                      <th className="px-4 py-3" style={{ color: colors.table.headerText }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingSales ? (
                      <tr><td className="px-4 py-4" colSpan={8}>Loading...</td></tr>
                    ) : filteredSales.length === 0 ? (
                      <tr><td className="px-4 py-4" colSpan={8}>No pending sales</td></tr>
                    ) : (
                      filteredSales.map((row: any, index: number) => (
                        <tr
                          key={row._id}
                          style={{
                            backgroundColor:
                              index % 2 === 0
                                ? colors.background.card
                                : colors.table.stripe,
                          }}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedSales.includes(row._id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedSales((prev) => [...prev, row._id]);
                                else setSelectedSales((prev) => prev.filter((x) => x !== row._id));
                              }}
                            />
                          </td>
                          <td className="px-4 py-3">{row.order_id}</td>
                          <td className="px-4 py-3">{row?.party?.company_name || row?.party?.consignee_name[0]}</td>
                          <td className="px-4 py-3">{Array.isArray(row?.product_id) ? row?.product_id[0]?.name : "-"}</td>
                          <td className="px-4 py-3">{row.product_qty}</td>
                          <td className="px-4 py-3">{row.price}</td>
                          <td className="px-4 py-3">{row.GST}</td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              onClick={() => {
                                const currentStock = row?.product_id[0]?.current_stock;
                                const qty = row?.product_qty;

                                if (currentStock > qty) {
                                  setOpenModal(true)
                                  setCurrentStock({currentStock:row?.product_id[0]?.current_stock,
                                    item_name: row?.product_id[0]?.name 
                                  })
                                  setSelectedSaleId(row?._id)
                                } else {
                                  approveSaleHandler(row?._id);
                                }
                              }}
                            >
                              Approve
                            </Button>
                          </td>

                        </tr>
                      ))

                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {
        openModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[350px] shadow-lg">

              <h2 className="text-lg font-semibold mb-3">Enter Value</h2>
              <label>Current Stock  Available: {currentStock?.item_name} ( {currentStock?.currentStock})</label>
              <input  
                type="text"
                className="border w-full px-3 py-2 rounded mb-4"
                placeholder="Type something..."
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
              />     
                             
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setOpenModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => {
                    handleModalSubmit(modalInput);
                    setOpenModal(false);
                  }}
                >
                  Submit
                </button>
              </div>

            </div>
          </div>
        )
      }

    </div>
  );
};

export default Approvals;
