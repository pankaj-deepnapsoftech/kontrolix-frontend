// @ts-nocheck

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import Loading from "../../../ui/Loading";
import { colors } from "../../../theme/colors";

interface SupervisorDetailsProps {
  closeDrawerHandler: () => void;
  supervisorId: string | undefined;
}

const SupervisorDetails: React.FC<SupervisorDetailsProps> = ({
  closeDrawerHandler,
  supervisorId,
}) => {
  const [cookies] = useCookies();
  const [isLoadingSupervisor, setIsLoadingSupervisor] = useState<boolean>(false);
  const [supervisor, setSupervisor] = useState<any>(null);

  const fetchSupervisorDetailsHandler = async () => {
    try {
      setIsLoadingSupervisor(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `supervisor/${supervisorId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setSupervisor(data.supervisor);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingSupervisor(false);
    }
  };

  useEffect(() => {
    if (supervisorId) {
      fetchSupervisorDetailsHandler();
    }
  }, [supervisorId]);

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[99vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Supervisor Details
        </h1>
        <button
          onClick={closeDrawerHandler}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{
            color: colors.text.secondary,
            backgroundColor: colors.gray[100],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[200];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[100];
          }}
        >
          <BiX size={20} />
        </button>
      </div>

      <div className="mt-8 px-5">
        {isLoadingSupervisor && <Loading />}
        {!isLoadingSupervisor && supervisor && (
          <div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Supervisor ID</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {supervisor.supervisorId || "N/A"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">First Name</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {supervisor.first_name || "N/A"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Last Name</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {supervisor.last_name || "N/A"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Email</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {supervisor.email || "N/A"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Phone</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {supervisor.phone || "N/A"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Address</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {supervisor.address || "N/A"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Status</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {supervisor.isVerified ? "Verified" : "Pending"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Assigned Employees</p>
              <div className="bg-gray-50 p-3 rounded-md border">
                {!supervisor.assignedEmployees || supervisor.assignedEmployees.length === 0 ? (
                  <p className="text-gray-600">No employees assigned</p>
                ) : (
                  <ul className="space-y-2">
                    {supervisor.assignedEmployees.map((emp: any, index: number) => (
                      <li
                        key={emp._id || index}
                        className="flex items-center text-gray-600"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {emp.first_name || ""} {emp.last_name || ""} 
                        {emp.email && ` (${emp.email})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Resources</p>
              <div className="bg-gray-50 p-3 rounded-md border">
                {!supervisor.role || supervisor.role.length === 0 ? (
                  <p className="text-gray-600">No resources assigned</p>
                ) : (
                  <ul className="space-y-2">
                    {supervisor.role.map((res: any, index: number) => (
                      <li
                        key={res._id || index}
                        className="flex items-center text-gray-600"
                      >
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        {res.name || "Unknown Resource"}
                        {res.type && ` (${res.type})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDetails;

