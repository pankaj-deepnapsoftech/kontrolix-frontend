// @ts-nocheck

import {
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { useEffect } from "react";
import moment from "moment";
import { useMemo, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import { FcApproval } from "react-icons/fc";
import { FaArrowUpLong, FaArrowDownLong } from "react-icons/fa6";
import { usePagination, useSortBy, useTable, Column } from "react-table";
import { toast } from "react-toastify";
import Loading from "../../ui/Loading";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import { useCookies } from "react-cookie";

const capitalizeWords = (str: string | undefined | null): string => {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

interface ProductTableProps {
  products: Array<any>;
  isLoadingProducts: boolean;
  openUpdateProductDrawerHandler?: (id: string) => void;
  openProductDetailsDrawerHandler?: (id: string) => void;
  deleteProductHandler?: (id: string) => void;
  bulkDeleteProductsHandler?: (productIds: string[]) => void;
  approveProductHandler?: (id: string) => void;
  bulkApproveProductsHandler?: (ids: string[]) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoadingProducts,
  openUpdateProductDrawerHandler,
  openProductDetailsDrawerHandler,
  deleteProductHandler,
  bulkDeleteProductsHandler,
  approveProductHandler,
  bulkApproveProductsHandler,
}) => {
  const dataProducts = Array.isArray(products) ? products : [];
  const memoData = useMemo(() => dataProducts, [products]);
  const columns: Column<any>[] = useMemo(
    () => [
      { Header: "ID", accessor: "product_id" },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ value }: { value: string }) => capitalizeWords(value),
      },
      {
        Header: "Resource",
        accessor: "resource",
        Cell: ({ value }: { value: any }) =>
          capitalizeWords(value?.name) || "N/A",
      },
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ value }: { value: string }) => capitalizeWords(value),
      },
      {
        Header: "Sub Category",
        accessor: "sub_category",
        Cell: ({ value }: { value: string }) => capitalizeWords(value) || "N/A",
      },
      { Header: "Product/Service", accessor: "product_or_service" },
      { Header: "UOM", accessor: "uom" },

      { Header: "Last Change", accessor: "change" },
      { Header: "Min stock", accessor: "min_stock" },
      { Header: "Max stock", accessor: "max_stock" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
    ],
    []
  );
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");

  // Bulk selection states
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const inventoryCategoryStyles = {
    indirect: { text: "#e70000" },
    direct: { text: "#25d98b" },
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex, pageSize },
    pageCount,
    setPageSize,
  } = useTable(
    { columns, data: memoData, initialState: { pageIndex: 0 } },
    useSortBy,
    usePagination
  );

  const [cookies] = useCookies();
  // Bulk selection functions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(page.map((row) => row.original._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleBulkDelete = async () => {
    if (
      isBulkDeleting ||
      selectedProducts.length === 0 ||
      !bulkDeleteProductsHandler
    )
      return;
    setIsBulkDeleting(true);

    try {
      await bulkDeleteProductsHandler(selectedProducts);
      setSelectedProducts([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      toast.error("Failed to delete products. Please try again.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsLatestPriceModalOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isAllSelected =
    page.length > 0 && selectedProducts.length === page.length;
  const isIndeterminate =
    selectedProducts.length > 0 && selectedProducts.length < page.length;

  return (
    <div>
      {isLoadingProducts && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="xl" color="blue.500" mb={4} />
            <p style={{ color: colors.text.secondary }}>Loading products...</p>
          </div>
        </div>
      )}

      {!isLoadingProducts && dataProducts.length === 0 && (
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <svg
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: colors.warning[500] }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No Products Found
          </h3>
          <p style={{ color: colors.text.secondary }}>
            Get started by adding your first product to manage your inventory.
          </p>
        </div>
      )}

      {!isLoadingProducts && dataProducts.length > 0 && (
        <>
          {/* Table Container - MachineSummary Style */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            {/* Table Header Section */}
            <div
              className="p-5 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              style={{ borderColor: colors.border.light }}
            >
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Product Directory
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Showing {Math.min(dataProducts.length, pageSize)} of{" "}
                  {dataProducts.length} product
                  {dataProducts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Show:
                  </span>
                  <Select
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    value={pageSize}
                    size="sm"
                    width="auto"
                    borderRadius="lg"
                    borderColor={colors.border.light}
                    _focus={{
                      borderColor: colors.primary[500],
                      boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                    }}
                  >
                    {[5, 10, 20, 50, 100, 100000].map((size) => (
                      <option key={size} value={size}>
                        {size === 100000 ? "All" : size}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <TableContainer maxH="400px" overflowY="auto">
              <Table variant="simple" size="sm">
                <Thead
                  position="sticky"
                  top={0}
                  bg={colors.table.header}
                  zIndex={1}
                >
                  <Tr>
                    <Th
                      color={colors.table.headerText}
                      style={{ width: "40px" }}
                    >
                      
                    </Th>
                    <Th color={colors.table.headerText}>Product ID</Th>
                    <Th color={colors.table.headerText}>Name</Th>
                    <Th color={colors.table.headerText}>Resource</Th>
                    <Th color={colors.table.headerText}>Created On</Th>
                    <Th color={colors.table.headerText}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {page.map((row, index) => {
                    prepareRow(row);
                    return (
                      <Tr key={row.id} _hover={{ bg: colors.table.hover }}>
                        <Td fontSize="xs" style={{ width: "40px" }}>
                          
                        </Td>
                        <Td fontSize="sm" fontFamily="mono">
                          {row.original.product_id || "N/A"}
                        </Td>
                        <Td fontSize="sm" fontWeight="medium">
                          {capitalizeWords(row.original.name) || "N/A"}
                        </Td>
                        <Td>
                          <p  fontSize="xs">
                            {row.original.resource?.name
                              ? capitalizeWords(row.original.resource.name)
                              : "N/A"}
                          </p>
                        </Td>
                        <Td fontSize="xs">
                          {row.original.createdAt
                            ? moment(row.original.createdAt).format(
                                "DD MMM YYYY"
                              )
                            : "N/A"}
                        </Td>
                        <Td fontSize="sm">
                          <div className="flex items-center gap-1">
                            {openProductDetailsDrawerHandler && (
                              <button
                                onClick={() =>
                                  openProductDetailsDrawerHandler(
                                    row.original._id
                                  )
                                }
                                className="p-1.5 rounded-md transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.secondary[600],
                                  backgroundColor: colors.secondary[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.secondary[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.secondary[50];
                                }}
                                title="View Details"
                              >
                                <MdOutlineVisibility size={14} />
                              </button>
                            )}
                            {openUpdateProductDrawerHandler && (
                              <button
                                onClick={() =>
                                  openUpdateProductDrawerHandler(
                                    row.original._id
                                  )
                                }
                                className="p-1.5 rounded-md transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.primary[600],
                                  backgroundColor: colors.primary[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.primary[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.primary[50];
                                }}
                                title="Edit"
                              >
                                <MdEdit size={14} />
                              </button>
                            )}
                            {deleteProductHandler &&
                              cookies?.role === "admin" && (
                                <button
                                  onClick={() => {
                                    setdeleteId(row.original._id);
                                    setshowDeletePage(true);
                                  }}
                                  className="p-1.5 rounded-md transition-all duration-200 hover:shadow-md"
                                  style={{
                                    color: colors.error[600],
                                    backgroundColor: colors.error[50],
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      colors.error[100];
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      colors.error[50];
                                  }}
                                  title="Delete"
                                >
                                  <MdDeleteOutline size={14} />
                                </button>
                              )}
                            {approveProductHandler && (
                              <button
                                onClick={() =>
                                  approveProductHandler(row.original._id)
                                }
                                className="p-1.5 rounded-md transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.success[600],
                                  backgroundColor: colors.success[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.success[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.success[50];
                                }}
                                title="Approve"
                              >
                                <FcApproval size={14} />
                              </button>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div
              className="flex items-center justify-between p-4 mt-4 rounded-lg"
              style={{ backgroundColor: colors.gray[50] }}
            >
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Page {pageIndex + 1} of {pageCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={!canPreviousPage}
                  onClick={previousPage}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    color: colors.text.primary,
                    backgroundColor: colors.background.card,
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  Previous
                </button>
                <button
                  disabled={!canNextPage}
                  onClick={nextPage}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    color: colors.text.primary,
                    backgroundColor: colors.background.card,
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showDeletePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Confirm Deletion
                </h2>
              </div>

              <div className="mb-6">
                <div
                  className="p-4 mb-4"
                  style={{ backgroundColor: colors.error[50] }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      style={{ color: colors.error[500] }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p
                        className="font-medium text-center"
                        style={{ color: colors.error[800] }}
                      >
                        Delete Product
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All Product data will be
                        permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setshowDeletePage(false)}
                  className="flex-1 px-4 py-2 border transition-all duration-200"
                  style={{
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                    backgroundColor: colors.background.card,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteProductHandler(deleteId);
                    setshowDeletePage(false);
                  }}
                  className="flex-1 px-4 py-2 transition-all duration-200"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Confirm Bulk Deletion
                </h2>
                {!isBulkDeleting && (
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="p-1 transition-colors hover:bg-gray-100"
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: colors.text.secondary }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="mb-6">
                <div
                  className="p-4 mb-4"
                  style={{ backgroundColor: colors.error[50] }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      style={{ color: colors.error[500] }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p
                        className="font-medium text-center"
                        style={{ color: colors.error[800] }}
                      >
                        Delete {selectedProducts.length} Product
                        {selectedProducts.length > 1 ? "s" : ""}
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All selected product data
                        will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="flex-1 px-4 py-2 border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                    backgroundColor: colors.background.card,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex-1 px-4 py-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                  }}
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-b-transparent border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    `Delete ${selectedProducts.length} Product${
                      selectedProducts.length > 1 ? "s" : ""
                    }`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
