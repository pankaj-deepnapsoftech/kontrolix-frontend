//@ts-nocheck

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdOutlineRefresh } from "react-icons/md";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { colors } from "../theme/colors";
import Pagination from "./Pagination";
import axios from "axios";

const UpcomingSales: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("production");
  const [cookies] = useCookies();
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [sales, setSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const {
    isOpen: isConfirmOpen,
    onOpen: openConfirmModal,
    onClose: closeConfirmModal,
  } = useDisclosure();

  const fetchUpcomingSales = async (currentPage = page) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}sale/upcoming-sales?page=${currentPage}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch sales");
      }

      setSales(response.data.data || []);
      setFilteredSales(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch upcoming sales"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAllowed) {
      fetchUpcomingSales(page);
    }
  }, [page, isAllowed]);

  useEffect(() => {
    const searchText = searchKey?.toLowerCase() || "";
    const results = sales.filter(
      (sale: any) =>
        sale.order_id?.toLowerCase()?.includes(searchText) ||
        sale.party?.company_name?.toLowerCase()?.includes(searchText) ||
        sale.party?.consignee_name?.toLowerCase()?.includes(searchText) ||
        sale.product_id?.name?.toLowerCase()?.includes(searchText) ||
        sale.product_qty?.toString()?.includes(searchText) ||
        sale.price?.toString()?.includes(searchText) ||
        sale.terms_of_delivery?.toLowerCase()?.includes(searchText) ||
        sale.mode_of_payment?.toLowerCase()?.includes(searchText) ||
        (sale.createdAt &&
          new Date(sale.createdAt)
            ?.toISOString()
            ?.substring(0, 10)  
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchText.replaceAll("/", "") || ""))
    );
    setFilteredSales(results);
  }, [searchKey, sales]);

  const handleComplete = async (saleId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}sale/mark-completed/${saleId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove from both sales and filteredSales
        const updatedSales = sales.filter((sale: any) => sale._id !== saleId);
        const updatedFilteredSales = filteredSales.filter((sale: any) => sale._id !== saleId);
        
        setSales(updatedSales);
        setFilteredSales(updatedFilteredSales);
        
        toast.success("Order marked as completed and removed from list");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to mark order as completed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const promptCompletion = (saleId: string, orderId: string) => {
    setSelectedSaleId(saleId);
    setSelectedOrderId(orderId);
    openConfirmModal();
  };

  const confirmCompletion = async () => {
    if (!selectedSaleId) return;
    await handleComplete(selectedSaleId);
    setSelectedSaleId(null);
    setSelectedOrderId(null);
    closeConfirmModal();
  };

  if (!isAllowed) {
    return (
      <div className="text-center text-red-500 p-6">
        You are not allowed to access this page.
      </div>
    );
  }

  return (
    <>
    <div
      className="min-h-screen p-4 lg:p-6"
      style={{ backgroundColor: colors.background.page }}
    >
      <div
        className="rounded-xl shadow-sm border p-6 mb-6"
        style={{
          backgroundColor: colors.background.card,
          borderColor: colors.border.light,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Coming Production
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: colors.text.secondary }}
            >
              View approved sales orders ready for production
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: colors.text.secondary }}
              />
              <input
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                placeholder="Search sales orders..."
                value={searchKey || ""}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>

            <button
              onClick={() => fetchUpcomingSales(page)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
              style={{
                borderColor: colors.border.medium,
                color: colors.text.primary,
                backgroundColor: colors.background.card,
              }}
              disabled={isLoading}
            >
              <MdOutlineRefresh
                size="16px"
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto"> 
          <table className="min-w-full">
            <thead style={{ backgroundColor: colors.table.header }}>
              <tr>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Order ID
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Party/Company
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Product
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Quantity
                </th>
                {/* <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                Quantity
                </th> */}
                {/*
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Unit Price
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  GST (%)
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Total Price
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Payment Mode
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  BOM Status
                </th>
                */}
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Created At
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold"
                  style={{ color: colors.table.headerText }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center"
                    colSpan={7}
                    style={{ color: colors.text.secondary }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center"
                    colSpan={7}
                    style={{ color: colors.text.secondary }}
                  >
                    No upcoming sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale: any, index: number) => (
                  <tr
                    key={sale._id}
                    style={{
                      backgroundColor:
                        index % 2 === 0
                          ? colors.background.card
                          : colors.table.stripe,
                    }}
                  >
                    <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      {sale.order_id || "-"}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      {sale.party?.company_name || sale.party?.consignee_name || "-"}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      {sale.product_id?.name || "-"}
                    </td>
                    {/* <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      {sale.product_qty} {sale.uom || ""}
                    </td> */}
                    <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      {sale.terms_of_delivery || sale.product_qty || "-"}
                    </td>
                    {/*
                    <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      ₹{sale.price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      {sale.GST || 0}%
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      ₹{sale.total_price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text.primary }}>
                      {sale.mode_of_payment || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {sale.has_bom ? (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: colors.success[100],
                            color: colors.success[800],
                          }}
                        >
                          Created
                        </span>
                      ) : (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: colors.warning[100],
                            color: colors.warning[800],
                          }}
                        >
                          Pending
                        </span>
                      )}
                    </td>
                    */}
                    <td className="px-4 py-3" style={{ color: colors.text.secondary }}>
                      {sale.createdAt
                        ? new Date(sale.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() =>
                          promptCompletion(sale._id, sale.order_id || "")
                        }
                        size="sm"
                        style={{
                          backgroundColor: colors.success[500],
                          color: "white",
                        }}
                        _hover={{
                          backgroundColor: colors.success[600],
                        }}
                      >
                        Completed
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!searchKey && totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>

    <Modal isOpen={isConfirmOpen} onClose={closeConfirmModal} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Mark as Completed?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to mark{" "}
          <strong>{selectedOrderId || "this order"}</strong> as completed? This
          will remove it from the Coming Production list.
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={closeConfirmModal}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={confirmCompletion}
            isLoading={isLoading}
          >
            Yes, Complete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
};

export default UpcomingSales;

