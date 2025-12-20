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
  Button,
  Toast,
} from "@chakra-ui/react";
import moment from "moment";
import { useMemo } from "react";
import {
  FaCaretDown,
  FaCaretUp,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";
import {
  usePagination,
  useSortBy,
  useTable,
  Column,
  TableInstance,
  HeaderGroup,
  Cell,
} from "react-table";
import Loading from "../../ui/Loading";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import { FaArrowDownLong, FaArrowUpLong } from "react-icons/fa6";
import { toast } from "react-toastify";
import axios from "axios";
import { useCookies } from "react-cookie";

const statusColorMap = {
  "production started": "bg-green-100 text-green-800",
  "request for allow inventory": "bg-yellow-100 text-yellow-800",
  "raw material approval pending": "bg-red-100 text-red-800",
  "inventory in transit": "bg-orange-100 text-orange-800",
  "Inventory Allocated": "bg-purple-100 text-purple-800",
};

const statusDisplayMap: Record<string, string> = {
  "raw material approval pending": "raw material request pending",
};

interface BOMRawMaterialTableProps {
  products: Array<{
    name: string;
    product_id: string;
    uom: string;
    category: string;
    sub_category?: string;
    item_type: string;
    product_or_service: string;
    current_stock: number;
    price: number;
    quantity?: number;
    min_stock?: number;
    max_stock?: number;
    hsn_code?: number;
    inventory_category?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingProducts: boolean;
  openUpdateProductDrawerHandler?: (id: string) => void;
  openProductDetailsDrawerHandler?: (id: string) => void;
  deleteProductHandler?: (id: string) => void;
  approveProductHandler?: (id: string) => void;
  onRefresh?: () => void;
  isApproved: boolean;
}
//newwww
const updateProcessStatus = async (id, status) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}production-process/update-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`, // optional
        },
        body: JSON.stringify({ _id: id, status }),
      }
    );

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }

    toast.success(data.message || "Status updated");
    // Trigger a re-fetch instead of full page reload
    if (typeof window !== "undefined") {
      // Force a re-render by updating a state or calling a refresh function
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }
  } catch (err) {
    toast.error(err.message || "Failed to update status");
  }
};

const BOMRawMaterialTable: React.FC<BOMRawMaterialTableProps> = ({
  products = [],
  isLoadingProducts,
  openUpdateProductDrawerHandler,
  openProductDetailsDrawerHandler,
  deleteProductHandler,
  approveProductHandler,
  onRefresh,
  isApproved,
}) => {
  const columns: Column<{
    name: string;
    product_id: string;
    uom: string;
    category: string;
    sub_category?: string;
    item_type: string;
    product_or_service: string;
    current_stock: number;
    price: number;
    quantity?: number;
    min_stock?: number;
    max_stock?: number;
    hsn_code?: number;
    inventory_category?: string;
    createdAt: string;
    updatedAt: string;
  }>[] = useMemo(
    () => [
      {
        Header: "BOM",
        accessor: "bom_name",
      },
      {
        Header: "ID",
        accessor: "product_id",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Inventory Category",
        accessor: "inventory_category",
      },
      {
        Header: "Category",
        accessor: "category",
      },

      {
        Header: "Sub Category",
        accessor: "sub_category",
      },
      {
        Header: "Type",
        accessor: "item_type",
      },
      {
        Header: "Product/Service",
        accessor: "product_or_service",
      },
      {
        Header: "Quantity",
        accessor: "quantity",
      },
      {
        Header: "UOM",
        accessor: "uom",
      },
      {
        Header: "Price",
        accessor: "price",
      },
      {
        Header: "Current stock",
        accessor: "current_stock",
      },
      {
        Header: "Last Change",
        accessor: "change",
      },
      {
        Header: "Min stock",
        accessor: "min_stock",
      },
      {
        Header: "Max stock",
        accessor: "max_stock",
      },
      {
        Header: "Created On",
        accessor: "createdAt",
      },
      {
        Header: "Last Updated",
        accessor: "updatedAt",
      },
      {
        Header: "Status",
        accessor: "status",
      },
    ],
    []
  );
  const [cookies] = useCookies();

  //  console.log(`process.env.REACT_APP_BACKEND_URL: ${process.env.REACT_APP_BACKEND_URL}`);
  const handleOutAllottedInventory = async (process_id) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}production-process/inventory-in-transit`,
        { _id: process_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Status updated to Inventory in Transit");

      // Use refresh callback instead of full page reload
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const inventoryCategoryStyles = {
    indirect: {
      text: "#fc0303",
    },
    direct: {
      text: "#409503",
    },
  };
  // console.log(products)
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
  }: TableInstance<{
    name: string;
    product_id: string;
    uom: string;
    category: string;
    sub_category?: string;
    item_type: string;
    product_or_service: string;
    current_stock: number;
    price: number;
    quantity?: number;
    min_stock?: number;
    max_stock?: number;
    hsn_code?: number;
    createdAt: string;
    updatedAt: string;
  }> = useTable(
    {
      columns,
      data: products || [],
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );
  const dynamicBg = (index) => {
    return index % 2 !== 0 ? colors.table.stripe : colors.background.card;
  };

  

  if (isLoadingProducts) {
    return <Loading />;
  }

  if (products.length === 0 && !isLoadingProducts) {
    return <EmptyData />;
  }
  console.log("products", products);
  return (
    <div className="p-4 space-y-4">
      {!isLoadingProducts && products.length > 0 && (
        <>
          {/* Page Size Selector */}
          <div className="flex justify-end">
            <Select
              onChange={(e) => setPageSize(e.target.value)}
              width="120px"
              value={pageSize}
              size="sm"
              style={{
                backgroundColor: colors.input.background,
                borderColor: colors.input.border,
                color: colors.text.primary,
              }}
              _hover={{ borderColor: colors.input.borderHover }}
              _focus={{
                borderColor: colors.input.borderFocus,
                boxShadow: `0 0 0 3px ${colors.primary[100]}`,
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={100000}>All</option>
            </Select>
          </div>

          

          {/* Table */}
          <TableContainer
            style={{
              backgroundColor: colors.background.card,
              borderRadius: "12px",
              border: `1px solid ${colors.border.light}`,
              boxShadow: colors.shadow.sm,
            }}
            maxHeight="600px"
            overflowY="auto"
          >
            <Table variant="simple" {...getTableProps()}>
              <Thead
                style={{ backgroundColor: colors.table.header }}
                position="sticky"
                top="0"
                zIndex="1"
              >
              {headerGroups.map((hg: HeaderGroup<any>) => (
                <Tr {...hg.getHeaderGroupProps()}>
                  
                  {hg?.headers.map((column: any) => (
                    <Th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        style={{
                          color: colors.table.headerText,
                          borderColor: colors.table.border,
                        }}
                        fontSize="sm"
                        fontWeight="semibold"
                        textTransform="capitalize"
                        py={4}
                        px={4}
                        cursor="pointer"
                        _hover={{ bg: colors.table.hover }}
                      >
                        <div className="flex items-center gap-2">
                          {column?.render("Header")}
                          {column?.isSorted &&
                            (column?.isSortedDesc ? (
                              <FaCaretDown className="text-xs" />
                            ) : (
                              <FaCaretUp className="text-xs" />
                            ))}
                        </div>
                      </Th>
                    ))}
                    <Th
                      style={{
                        color: colors.table.headerText,
                        borderColor: colors.table.border,
                      }}
                      fontSize="sm"
                      fontWeight="semibold"
                      textTransform="capitalize"
                      py={4}
                      px={4}
                    >
                      Actions
                    </Th>
                  </Tr>
                ))}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {page?.map((row: any, index) => {
                  prepareRow(row);
                  const original = row.original;

                  return (
                    <Tr
                      {...row.getRowProps()}
                      style={{
                        backgroundColor: dynamicBg(index),
                      }}
                      _hover={{ bg: colors.table.hover }}
                    >
                      
                      {row.cells.map((cell: Cell) => {
                        const colId = cell.column.id;
                        let displayValue;

                        if (colId === "inventory_category") {
                          displayValue = (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor:
                                  original.inventory_category === "direct"
                                    ? colors.success[100]
                                    : colors.error[100],
                                color:
                                  original.inventory_category === "direct"
                                    ? colors.success[800]
                                    : colors.error[800],
                              }}
                            >
                              {original.inventory_category
                                ?.charAt(0)
                                .toUpperCase() +
                                original.inventory_category?.slice(1) || "N/A"}
                            </span>
                          );
                        } else if (colId === "quantity") {
                          displayValue = original.quantity || 0;
                        } else if (colId === "price") {
                          displayValue = `₹${original.price || 0}`;
                        } else if (colId === "createdAt") {
                          displayValue = original.createdAt
                            ? moment(original.createdAt).format("DD/MM/YYYY")
                            : "N/A";
                        } else if (colId === "updatedAt") {
                          displayValue = original.updatedAt
                            ? moment(original.updatedAt).format("DD/MM/YYYY")
                            : "N/A";
                        } else if (colId === "change") {
                          displayValue = original.change_type ? (
                            <div className="flex gap-1 items-center">
                              {original.change_type === "increase" ? (
                                <FaArrowUpLong
                                  size={16}
                                  style={{ color: colors.success[500] }}
                                />
                              ) : (
                                <FaArrowDownLong
                                  size={16}
                                  style={{ color: colors.error[500] }}
                                />
                              )}
                              <span
                                style={{
                                  color:
                                    original.change_type === "increase"
                                      ? colors.success[600]
                                      : colors.error[600],
                                }}
                              >
                                {original.quantity_changed}
                              </span>
                            </div>
                          ) : (
                            "N/A"
                          );
                        } else if (colId === "status") {
                          const statusRaw = original.bom_status || "N/A";
                          const status = statusDisplayMap[statusRaw] || statusRaw;

                          const statusClass =
                            statusColorMap[statusRaw] ||
                            "bg-gray-200 text-gray-800";

                          displayValue = (
                            <span
                              className={`px-2 py-1 rounded-full text-sm font-medium ${statusClass}`}
                            >
                              {status}
                            </span>
                          );
                        } else {
                          displayValue = cell.render("Cell");
                        }

                        return (
                          <Td
                            {...cell.getCellProps()}
                            style={{
                              color: colors.text.primary,
                              borderColor: colors.table.border,
                            }}
                            fontSize="sm"
                            py={3}
                            px={4}
                            className="whitespace-nowrap truncate max-w-xs"
                          >
                            {displayValue}
                          </Td>
                        );
                      })}

                      {/* Actions */}
                      <Td
                        style={{ borderColor: colors.table.border }}
                        py={3}
                        px={4}
                      >
                        <div className="flex items-center gap-2">
                          {openProductDetailsDrawerHandler && (
                            <Button
                              size="sm"
                              style={{
                                backgroundColor: colors.button.primary,
                                color: colors.text.inverse,
                              }}
                              _hover={{ bg: colors.button.primaryHover }}
                              onClick={() =>
                                openProductDetailsDrawerHandler(original._id)
                              }
                              leftIcon={<FaEye />}
                            >
                              View
                            </Button>
                          )}

                          {openUpdateProductDrawerHandler && (
                            <Button
                              size="sm"
                              style={{
                                backgroundColor: colors.button.secondary,
                                color: colors.text.inverse,
                              }}
                              _hover={{ bg: colors.button.secondaryHover }}
                              onClick={() =>
                                openUpdateProductDrawerHandler(original._id)
                              }
                              leftIcon={<FaEdit />}
                            >
                              Edit
                            </Button>
                          )}

                          {/* Accept Raw Material Request Button */}
                          {(() => {
                            // Check if current stock is sufficient
                            const currentStock = original.current_stock || 0;
                            const requiredQuantity = original.quantity || 0;
                            const isStockSufficient = currentStock >= requiredQuantity;
                            
                            const isAlreadyAccepted = 
                              isApproved || original.isInventoryApprovalClicked;
                            
                            const isAcceptDisabled =
                              isAlreadyAccepted ||
                              original.bom_status !==
                                "raw material approval pending" ||
                              !isStockSufficient; // Disable if stock is insufficient

                            let acceptButtonLabel = "Accept Request";
                            let buttonBgColor = colors.success[500];
                            
                            if (isAlreadyAccepted) {
                              acceptButtonLabel = "Accepted";
                              buttonBgColor = colors.gray[400];
                            } else if (!isStockSufficient) {
                              acceptButtonLabel = `Insufficient Stock (${currentStock}/${requiredQuantity})`;
                              buttonBgColor = colors.error[500];
                            }

                            return (
                              <Button
                                size="sm"
                                style={{
                                  backgroundColor: buttonBgColor,
                                  color: colors.text.inverse,
                                  cursor: isAcceptDisabled
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: isAcceptDisabled ? 0.7 : 1,
                                }}
                                _hover={{
                                  bg: isAcceptDisabled
                                    ? buttonBgColor
                                    : isStockSufficient
                                    ? colors.success[600]
                                    : colors.error[600],
                                }}
                                onClick={() => {
                                  if (!isStockSufficient) {
                                    toast.error(
                                      `Insufficient stock! Current stock: ${currentStock}, Required: ${requiredQuantity}`
                                    );
                                    return;
                                  }
                                  if (isAlreadyAccepted) {
                                    toast.info("This request has already been accepted");
                                    return;
                                  }
                                  approveProductHandler(original._id);
                                }}
                                leftIcon={<FaCheckCircle />}
                                disabled={isAcceptDisabled}
                                title={
                                  !isStockSufficient
                                    ? `Insufficient stock! Current: ${currentStock}, Required: ${requiredQuantity}`
                                    : isAlreadyAccepted
                                    ? "This request has already been accepted"
                                    : "Click to accept this raw material request"
                                }
                              >
                                {acceptButtonLabel}
                              </Button>
                            );
                          })()}

                          {/* Out Allotted Inventory Button */}
                          {/* {original.bom_status === "request for allow inventory" && (
                            <Button
                              size="sm"
                              style={{
                                backgroundColor: colors.warning[500],
                                color: colors.text.inverse,
                              }}
                              _hover={{ bg: colors.warning[600] }}
                              onClick={() => handleOutAllottedInventory(original._id)}
                            >
                              Out Allotted Inventory
                            </Button>
                          )} */}

                          {original.bom_status ===
                            "request for allow inventory" &&
                            (!original.isOutForInventoryClicked ? (
                              <Button
                                size="sm"
                                style={{
                                  backgroundColor: colors.warning[500],
                                  color: colors.text.inverse,
                                }}
                                _hover={{ bg: colors.warning[600] }}
                                onClick={() =>
                                  handleOutAllottedInventory(original._id)
                                }
                              >
                                Out Allotted Raw Material
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                style={{
                                  backgroundColor: colors.gray[300],
                                  color: colors.text.primary,
                                  cursor: "not-allowed",
                                  opacity: 0.7,
                                }}
                                isDisabled
                              >
                                Inventory Out
                              </Button>
                            ))}

                          {deleteProductHandler && (
                            <Button
                              size="sm"
                              style={{
                                backgroundColor: colors.button.danger,
                                color: colors.text.inverse,
                              }}
                              _hover={{ bg: colors.button.dangerHover }}
                              onClick={() => deleteProductHandler(original._id)}
                              leftIcon={<FaTrash />}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={previousPage}
              disabled={!canPreviousPage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canPreviousPage
                  ? colors.button.primary
                  : colors.gray[300],
                color: canPreviousPage ? colors.text.inverse : colors.gray[500],
              }}
              onMouseEnter={(e) => {
                if (canPreviousPage) {
                  e.currentTarget.style.backgroundColor =
                    colors.button.primaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (canPreviousPage) {
                  e.currentTarget.style.backgroundColor = colors.button.primary;
                }
              }}
            >
              Prev
            </button>

            <span
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              {pageIndex + 1} of {pageCount}
            </span>

            <button
              onClick={nextPage}
              disabled={!canNextPage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canNextPage
                  ? colors.button.primary
                  : colors.gray[300],
                color: canNextPage ? colors.text.inverse : colors.gray[500],
              }}
              onMouseEnter={(e) => {
                if (canNextPage) {
                  e.currentTarget.style.backgroundColor =
                    colors.button.primaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (canNextPage) {
                  e.currentTarget.style.backgroundColor = colors.button.primary;
                }
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BOMRawMaterialTable;
