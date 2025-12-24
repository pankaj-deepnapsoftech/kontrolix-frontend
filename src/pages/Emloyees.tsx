// @ts-nocheck

import { Button, Select, Spinner, Badge } from "@chakra-ui/react";
import { MdOutlineRefresh } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddEmployeeDrawer,
  closeEmployeeDetailsDrawer,
  closeUpdateEmployeeDrawer,
  openAddEmployeeDrawer,
  openEmployeeDetailsDrawer,
  openUpdateEmployeeDrawer,
} from "../redux/reducers/drawersSlice";
import EmployeeTable from "../components/Table/EmployeeTable";
import EmployeeDetails from "../components/Drawers/Employee/EmployeeDetails";
import UpdateEmployee from "../components/Drawers/Employee/UpdateEmployee";
import { colors } from "../theme/colors";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  bgColor,
}) => (
  <div
    className="p-5 rounded-xl border transition-all duration-300 hover:shadow-lg"
    style={{
      backgroundColor: colors.background.card,
      borderColor: colors.border.light,
    }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: colors.text.secondary }}
        >
          {title}
        </p>
        <h3
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          {value}
        </h3>
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: bgColor }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
  </div>
);

const Employees: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("employee");
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [filteredData, setFilteredData] = useState<any>([]);

  const { isUpdateEmployeeDrawerOpened, isEmployeeDetailsDrawerOpened } =
    useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();

  const openUpdateEmployeeDrawerHandler = (id: string) => {
    setEmployeeId(id);
    dispatch(openUpdateEmployeeDrawer());
  };

  const closeUpdateEmployeeDrawerHandler = () => {
    dispatch(closeUpdateEmployeeDrawer());
  };

  const openEmployeeDetailsDrawerHandler = (id: string) => {
    setEmployeeId(id);
    dispatch(openEmployeeDetailsDrawer());
  };

  const closeEmployeeDetailsDrawerHandler = () => {
    dispatch(closeEmployeeDetailsDrawer());
  };

  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(false);

  const fetchEmployeesHandler = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "auth/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const results = await response.json();
      if (!results.success) {
        throw new Error(results?.message);
      }
      setData(results.users);
      setFilteredData(results.users);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const approveEmployeeHandler = async (id: string) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "auth/user",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify({ _id: id, isVerified: true }),
        }
      );
      const result = await response.json();
      if (!result.success) throw new Error(result?.message);
      toast.success("User verified");
      fetchEmployeesHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const bulkApproveEmployeesHandler = async (ids: string[]) => {
    try {
      await Promise.all(
        (ids || []).map((id) =>
          fetch(process.env.REACT_APP_BACKEND_URL + "auth/user", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cookies?.access_token}`,
            },
            body: JSON.stringify({ _id: id, isVerified: true }),
          })
            .then((res) => res.json())
            .then((json) => {
              if (!json.success) throw new Error(json?.message);
            })
        )
      );
      toast.success(`Approved ${ids.length} user(s)`);
      fetchEmployeesHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchEmployeesHandler();
  }, []);

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    const results = data.filter(
      (emp: any) =>
        emp.first_name?.toLowerCase()?.includes(searchTxt) ||
        emp.last_name?.toLowerCase().includes(searchTxt) ||
        emp.email.toLowerCase()?.includes(searchTxt) ||
        emp.phone.toLowerCase().toString().includes(searchTxt) ||
        emp?.role?.role?.toLowerCase()?.includes(searchTxt) ||
        emp?.employeeId?.toLowerCase()?.includes(searchTxt) ||
        (emp?.createdAt &&
          new Date(emp?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (emp?.updatedAt &&
          new Date(emp?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredData(results);
  }, [searchKey]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.length) {
      return {
        totalEmployees: 0,
        verifiedEmployees: 0,
        unverifiedEmployees: 0,
        uniqueRoles: 0,
        verifiedPercentage: 0,
      };
    }

    const totalEmployees = data.length;
    const verifiedEmployees = data.filter((emp: any) => emp.isVerified).length;
    const unverifiedEmployees = totalEmployees - verifiedEmployees;
    const uniqueRoles = new Set(
      data.map((emp: any) => emp.role?.role || emp.role?.name || "N/A")
    ).size;
    const verifiedPercentage =
      totalEmployees > 0
        ? ((verifiedEmployees / totalEmployees) * 100).toFixed(1)
        : 0;

    return {
      totalEmployees,
      verifiedEmployees,
      unverifiedEmployees,
      uniqueRoles,
      verifiedPercentage,
    };
  }, [data]);

  if (!isAllowed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background.page }}
      >
        <div
          className="rounded-xl border p-8 text-center"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <AlertTriangle
            size={48}
            className="mx-auto mb-4"
            style={{ color: colors.error[500] }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            Access Denied
          </h3>
          <p style={{ color: colors.text.secondary }}>
            You are not allowed to access this route.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 lg:p-6"
      style={{ backgroundColor: colors.background.page }}
    >
      {/* Update Employee Drawer */}
      {isUpdateEmployeeDrawerOpened && (
        <UpdateEmployee
          closeDrawerHandler={closeUpdateEmployeeDrawerHandler}
          employeeId={employeeId}
          fetchEmployeesHandler={fetchEmployeesHandler}
        />
      )}
      {/* Employee Details Drawer */}
      {isEmployeeDetailsDrawerOpened && (
        <EmployeeDetails
          closeDrawerHandler={closeEmployeeDetailsDrawerHandler}
          employeeId={employeeId}
        />
      )}

      {/* Header Section */}
      <div
        className="rounded-xl shadow-sm border p-6 mb-6"
        style={{
          backgroundColor: colors.background.card,
          borderColor: colors.border.light,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Employees
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.secondary }}
              >
                Manage employee information and roles
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              leftIcon={<RefreshCw size={16} />}
              onClick={fetchEmployeesHandler}
              isLoading={isLoadingEmployees}
              size="sm"
              variant="outline"
              borderColor={colors.border.medium}
              _hover={{ bg: colors.gray[50] }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 max-w-md">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Search Employees
            </label>
            <div className="relative">
              <FiSearch
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
                  e.currentTarget.style.borderColor = colors.input.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.input.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="Search by name, email, phone, role..."
                value={searchKey || ""}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {isLoadingEmployees ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="xl" color="blue.500" mb={4} />
            <p style={{ color: colors.text.secondary }}>Loading employees...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <AlertTriangle
            size={48}
            className="mx-auto mb-4"
            style={{ color: colors.warning[500] }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No Employees Found
          </h3>
          <p style={{ color: colors.text.secondary }}>
            No employee data available. Try refreshing the page.
          </p>
        </div>
      ) : (
        <>
            <EmployeeTable
              employees={filteredData}
              openEmployeeDetailsDrawerHandler={
                openEmployeeDetailsDrawerHandler
              }
              openUpdateEmployeeDrawerHandler={openUpdateEmployeeDrawerHandler}
              isLoadingEmployees={false}
              approveEmployeeHandler={approveEmployeeHandler}
              bulkApproveEmployeesHandler={bulkApproveEmployeesHandler}
            />
        </>
      )}
    </div>
  );
};

export default Employees;
