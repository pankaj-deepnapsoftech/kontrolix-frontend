// @ts-nocheck

import { Button, Spinner } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddSupervisorDrawer,
  openAddSupervisorDrawer,
} from "../redux/reducers/drawersSlice";
import SupervisorTable from "../components/Table/SupervisorTable";
import AddSupervisor from "../components/Drawers/Supervisor/AddSupervisor";
import { colors } from "../theme/colors";
import {
  Users,
  RefreshCw,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

const Supervisors: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("supervisor");
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [filteredData, setFilteredData] = useState<any>([]);

  const { isAddSupervisorDrawerOpened } =
    useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();

  const openAddSupervisorDrawerHandler = () => {
    dispatch(openAddSupervisorDrawer());
  };

  const closeAddSupervisorDrawerHandler = () => {
    dispatch(closeAddSupervisorDrawer());
  };

  const [isLoadingSupervisors, setIsLoadingSupervisors] = useState<boolean>(false);

  const fetchSupervisorsHandler = async () => {
    try {
      setIsLoadingSupervisors(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "supervisor/all",
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
      setData(results.supervisors || []);
      setFilteredData(results.supervisors || []);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingSupervisors(false);
    }
  };

  useEffect(() => {
    fetchSupervisorsHandler();
  }, []);

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    const results = data.filter(
      (sup: any) =>
        sup.first_name?.toLowerCase()?.includes(searchTxt) ||
        sup.last_name?.toLowerCase().includes(searchTxt) ||
        sup.email.toLowerCase()?.includes(searchTxt) ||
        sup.phone.toLowerCase().toString().includes(searchTxt) ||
        sup.supervisorId?.toLowerCase()?.includes(searchTxt) ||
        sup.address?.toLowerCase()?.includes(searchTxt) ||
        (sup?.createdAt &&
          new Date(sup?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (sup?.updatedAt &&
          new Date(sup?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredData(results);
  }, [searchKey, data]);

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
      {/* Add Supervisor Drawer */}
      {isAddSupervisorDrawerOpened && (
        <AddSupervisor
          closeDrawerHandler={closeAddSupervisorDrawerHandler}
          fetchSupervisorsHandler={fetchSupervisorsHandler}
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
                Supervisors
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.secondary }}
              >
                Manage supervisor information
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              leftIcon={<UserPlus size={16} />}
              onClick={openAddSupervisorDrawerHandler}
              size="sm"
              colorScheme="blue"
              _hover={{ bg: "blue.600" }}
            >
              Add New Supervisor
            </Button>
            <Button
              leftIcon={<RefreshCw size={16} />}
              onClick={fetchSupervisorsHandler}
              isLoading={isLoadingSupervisors}
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
              Search Supervisors
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
                placeholder="Search by name, email, phone, supervisor ID..."
                value={searchKey || ""}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <SupervisorTable
        supervisors={filteredData}
        isLoadingSupervisors={isLoadingSupervisors}
      />
    </div>
  );
};

export default Supervisors;

