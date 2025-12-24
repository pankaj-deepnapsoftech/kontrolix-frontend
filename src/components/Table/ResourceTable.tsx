// @ts-nocheck

import { useMemo, useState } from "react";
import {
  Column,
  TableInstance,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { toast } from "react-toastify";
import Loading from "../../ui/Loading";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import moment from "moment";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import { useCookies } from "react-cookie";
import { SquarePen } from "lucide-react";
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

interface ResourceTableProps {
  resources: Array<{
    _id: string;
    name: string;
    type: string;
    specification?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingResources: boolean;
  openUpdateResourceDrawerHandler?: (id: string) => void;
  openResourceDetailsDrawerHandler?: (id: string) => void;
  deleteResourceHandler?: (id: string) => void;
  fetchResourcesHandler?: () => void;
  setEditResource?: (resource: any) => void;
  editResource?: any;
  openAddResourceDrawerHandler?: () => void;
  setAddResourceDrawerOpened?: (isOpen: boolean) => void;
  bulkDeleteResourcesHandler?: (ids: string[]) => void;
}

const ResourceTable: React.FC<ResourceTableProps> = ({
  resources = [],
  isLoadingResources,
  openUpdateResourceDrawerHandler,
  openResourceDetailsDrawerHandler,
  deleteResourceHandler,
  setEditResource,
  editResource,
  openAddResourceDrawerHandler,
  setAddResourceDrawerOpened,
  bulkDeleteResourcesHandler,
}) => {
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");

  // Bulk selection states
  const [selectedResources, setSelectedResources] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [cookies] = useCookies();
  const columns = useMemo(
    () => [
      { Header: "CustomId", accessor: "customid" },
      { Header: "Name", accessor: "name" },
      { Header: "Type", accessor: "type" },
      { Header: "Specification", accessor: "specification" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
    ],
    []
  );

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
    type: string;
    specification: string;
    createdAt: string;
    updatedAt: string;
  }> = useTable(
    {
      columns,
      data: resources || [],
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  // Bulk selection functions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedResources(page.map((row) => row.original._id));
    } else {
      setSelectedResources([]);
    }
  };

  const handleSelectResource = (resourceId, checked) => {
    if (checked) {
      setSelectedResources((prev) => [...prev, resourceId]);
    } else {
      setSelectedResources((prev) => prev.filter((id) => id !== resourceId));
    }
  };

  const handleBulkDelete = async () => {
    if (
      isBulkDeleting ||
      selectedResources.length === 0 ||
      !bulkDeleteResourcesHandler
    )
      return;

    setIsBulkDeleting(true);

    try {
      await bulkDeleteResourcesHandler(selectedResources);
      setSelectedResources([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      toast.error("Failed to delete some resources. Please try again.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const isAllSelected =
    page.length > 0 && selectedResources.length === page.length;
  const isIndeterminate =
    selectedResources.length > 0 && selectedResources.length < page.length;

  return (
    <div>
      {isLoadingResources && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="xl" color="blue.500" mb={4} />
            <p style={{ color: colors.text.secondary }}>Loading resources...</p>
          </div>
        </div>
      )}

      {!isLoadingResources && resources.length === 0 && (
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
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No Resources Found
          </h3>
          <p style={{ color: colors.text.secondary }}>
            Get started by adding your first resource to manage your production
            equipment.
          </p>
        </div>
      )}

      {!isLoadingResources && resources.length > 0 && (
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
                  Resource Directory
                </h3>
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
                    {cookies?.role === "admin" && (
                      <Th
                        color={colors.table.headerText}
                        style={{ width: "40px" }}
                      >
                        
                      </Th>
                    )}
                    <Th color={colors.table.headerText}>Custom ID</Th>
                    <Th color={colors.table.headerText}>Machine Name</Th>
                    <Th color={colors.table.headerText}>Type</Th>
                    <Th color={colors.table.headerText}>Specification</Th>
                    <Th color={colors.table.headerText}>Created On</Th>
                    <Th color={colors.table.headerText}>Last Updated</Th>
                    {cookies?.role === "admin" && (
                      <Th color={colors.table.headerText}>Actions</Th>
                    )}
                  </Tr>
                </Thead>
                <Tbody>
                  {page.map((row: any, index) => {
                    prepareRow(row);
                    return (
                      <Tr key={row.id} _hover={{ bg: colors.table.hover }}>
                        {cookies?.role === "admin" && (
                          <Td fontSize="xs" style={{ width: "40px" }}>
                            
                          </Td>
                        )}
                        <Td fontSize="sm" fontFamily="mono">
                          {row.original?.customId || "—"}
                        </Td>
                        <Td fontSize="sm" fontWeight="medium">
                          {row.original.name || "—"}
                        </Td>
                        <Td>
                          <p
                            
                            fontSize="xs"
                          >
                            {row.original.type}
                          </p>
                        </Td>
                        <Td
                          fontSize="sm"
                          maxW="200px"
                          isTruncated
                          title={row.original.specification}
                        >
                          {row.original.specification || "—"}
                        </Td>
                        <Td fontSize="xs">
                          {row.original.createdAt
                            ? moment(row.original.createdAt).format(
                                "DD MMM YYYY"
                              )
                            : "—"}
                        </Td>
                        <Td fontSize="xs">
                          {row.original.updatedAt
                            ? moment(row.original.updatedAt).format(
                                "DD MMM YYYY"
                              )
                            : "—"}
                        </Td>
                        {cookies?.role === "admin" && (
                          <Td fontSize="sm">
                            <div className="flex items-center gap-1">
                              {openResourceDetailsDrawerHandler && (
                                <button
                                  onClick={() =>
                                    openResourceDetailsDrawerHandler(
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
                              <button
                                onClick={() => {
                                  setEditResource(row.original);
                                  setAddResourceDrawerOpened(true);
                                }}
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
                              {deleteResourceHandler && (
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
                            </div>
                          </Td>
                        )}
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

      {/* Enhanced Delete Modal */}
      {showDeletePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4  shadow-xl"
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
                  className=" p-4 mb-4"
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
                    <div className="text-center">
                      <p
                        className="font-medium"
                        style={{ color: colors.error[800] }}
                      >
                        Delete Resource
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All resource data will be
                        permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setshowDeletePage(false)}
                  className="flex-1 px-4 py-2  border transition-all duration-200"
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
                    deleteResourceHandler(deleteId);
                    setshowDeletePage(false);
                  }}
                  className="flex-1 px-4 py-2  transition-all duration-200"
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4  shadow-xl"
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
                    className="p-1  transition-colors hover:bg-gray-100"
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
                  className=" p-4 mb-4"
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
                    <div className="text-center">
                      <p
                        className="font-medium"
                        style={{ color: colors.error[800] }}
                      >
                        Delete {selectedResources.length} Resource
                        {selectedResources.length > 1 ? "s" : ""}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All selected resource data
                        will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                </div>

                {isBulkDeleting && (
                  <div
                    className=" p-4 mb-4"
                    style={{ backgroundColor: colors.primary[50] }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="animate-spin  h-5 w-5 border-2 border-b-transparent"
                        style={{ borderColor: colors.primary[500] }}
                      ></div>
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: colors.primary[800] }}
                        >
                          Deleting resources...
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.primary[600] }}
                        >
                          Please wait while we process your request.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="flex-1 px-4 py-2  border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex-1 px-4 py-2  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                  }}
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="animate-spin  h-4 w-4 border-2 border-b-transparent border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    `Delete ${selectedResources.length} Resource${
                      selectedResources.length > 1 ? "s" : ""
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

export default ResourceTable;
