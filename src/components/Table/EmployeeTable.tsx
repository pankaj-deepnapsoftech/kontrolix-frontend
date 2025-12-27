// @ts-nocheck

import {
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableContainer,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import moment from "moment";
import { useMemo, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { usePagination, useSortBy, useTable } from "react-table";
import { colors } from "../../theme/colors";

interface EmployeeTableProps {
  employees: Array<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: any;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingEmployees: boolean;
  openUpdateEmployeeDrawerHandler?: (id: string) => void;
  openEmployeeDetailsDrawerHandler?: (id: string) => void;
  deleteEmployeeHandler?: (id: string) => void;
  approveEmployeeHandler?: (id: string) => void;
  bulkApproveEmployeesHandler?: (ids: string[]) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoadingEmployees,
  openUpdateEmployeeDrawerHandler,
  openEmployeeDetailsDrawerHandler,
  deleteEmployeeHandler,
  approveEmployeeHandler,
  bulkApproveEmployeesHandler,
}) => {
  const columns = useMemo(
    () => [
      {
        Header: "Employee Id",
        accessor: "employeeId",
        Cell: ({ value }) => value || "N/A",
      },
      { Header: "First Name", accessor: "first_name" },
      { Header: "Last Name", accessor: "last_name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "phone" },
      {
        Header: "Machine Role",
        accessor: "role",
        Cell: ({ value }: { value: any }) => {
          if (typeof value === "object" && value !== null && value.name) {
            return value.name;
          }
          return value || "N/A";
        },
      },
      { Header: "isVerified", accessor: "isVerified" },
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
  } = useTable(
    {
      columns,
      data: employees,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const isAllSelected =
    page.length > 0 && selectedEmployees.length === page.length;
  const isIndeterminate =
    selectedEmployees.length > 0 && selectedEmployees.length < page.length;
  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedEmployees(page.map((row: any) => row.original._id));
    else setSelectedEmployees([]);
  };
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedEmployees((prev) => [...prev, id]);
    else setSelectedEmployees((prev) => prev.filter((x) => x !== id));
  };

  return (
    <div>
      {isLoadingEmployees && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="xl" color="blue.500" mb={4} />
            <p style={{ color: colors.text.secondary }}>Loading employees...</p>
          </div>
        </div>
      )}

      {!isLoadingEmployees && employees.length === 0 && (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No Employees Found
          </h3>
          <p style={{ color: colors.text.secondary }}>
            Get started by adding your first employee to manage your team.
          </p>
        </div>
      )}

      {!isLoadingEmployees && employees.length > 0 && (
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
              className="p-5 border-b flex items-center justify-between"
              style={{ borderColor: colors.border.light }}
            >
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Employee Directory
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Showing {Math.min(employees.length, pageSize)} of{" "}
                  {employees.length} employee{employees.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-medium"
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

            <TableContainer maxH="400px" overflowY="auto">
              <Table variant="simple" size="sm" {...getTableProps()}>
                <Thead
                  position="sticky"
                  top={0}
                  bg={colors.table.header}
                  zIndex={1}
                >
                  {headerGroups.map((hg) => (
                    <Tr {...hg.getHeaderGroupProps()}>
                      <Th
                        color={colors.table.headerText}
                        style={{ width: "40px" }}
                      ></Th>
                      {hg.headers.map((column) => (
                        <Th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          color={colors.table.headerText}
                        >
                          <div className="flex items-center gap-1">
                            {column.render("Header")}
                            {column.isSorted &&
                              (column.isSortedDesc ? (
                                <FaCaretDown />
                              ) : (
                                <FaCaretUp />
                              ))}
                          </div>
                        </Th>
                      ))}
                      <Th color={colors.table.headerText}>Actions</Th>
                    </Tr>
                  ))}
                </Thead>

                <Tbody {...getTableBodyProps()}>
                  {page.map((row, index) => {
                    prepareRow(row);
                    return (
                      <Tr
                        {...row.getRowProps()}
                        _hover={{ bg: colors.table.hover }}
                      >
                        <Td fontSize="xs" style={{ width: "40px" }}></Td>
                        {row.cells.map((cell) => (
                          <Td {...cell.getCellProps()} fontSize="sm">
                            {cell.column.id === "createdAt" ||
                            cell.column.id === "updatedAt" ? (
                              <span className="text-xs">
                                {moment(row.original[cell.column.id]).format(
                                  "DD MMM YYYY"
                                )}
                              </span>
                            ) : cell.column.id === "isVerified" ? (
                              <p
                                fontSize="xs"
                              >
                                {row.original.isVerified
                                  ? "Verified"
                                  : "Pending"}
                              </p>
                            ) : cell.column.id === "role" ? (
                              <p fontSize="xs">
                                {row.original.isSuper
                                  ? "Super Admin"
                                  : (() => {
                                      const r = row.original?.role;
                                      if (!r) return "No Role";
                                      if (typeof r === "object") {
                                        return (
                                          r.name ||
                                          r.role ||
                                          r.label ||
                                          "No Role"
                                        );
                                      }
                                      return r || "No Role";
                                    })()}
                              </p>
                            ) : (
                              cell.render("Cell")
                            )}
                          </Td>
                        ))}
                        <Td fontSize="sm">
                          <div className="flex items-center gap-1">
                            {openEmployeeDetailsDrawerHandler && (
                              <button
                                onClick={() =>
                                  openEmployeeDetailsDrawerHandler(
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
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            )}
                            {openUpdateEmployeeDrawerHandler && (
                              <button
                                onClick={() =>
                                  openUpdateEmployeeDrawerHandler(
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
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            )}
                            {deleteEmployeeHandler && (
                              <button
                                onClick={() =>
                                  deleteEmployeeHandler(row.original._id)
                                }
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
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                            {/* {approveEmployeeHandler && (
                              <button
                                onClick={() =>
                                  approveEmployeeHandler(row.original._id)
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
                                <FcApproval className="w-3.5 h-3.5" />
                              </button>
                            )} */}
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
              style={{
                backgroundColor: colors.gray[50],
              }}
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
    </div>
  );
};

export default EmployeeTable;
