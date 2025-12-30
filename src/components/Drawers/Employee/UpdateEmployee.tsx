import { Button, FormControl, FormLabel } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useUpdateEmployeeMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../../../ui/Loading";
import { colors } from "../../../theme/colors";
import { useSelector } from "react-redux";

interface UpdateEmployeeProps {
  employeeId: string | undefined;
  fetchEmployeesHandler: () => void;
  closeDrawerHandler: () => void;
}

const UpdateEmployee: React.FC<UpdateEmployeeProps> = ({
  closeDrawerHandler,
  fetchEmployeesHandler,
  employeeId,
}) => {
  const [cookies, setCookie] = useCookies();
  const auth = useSelector((state: any) => state?.auth);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [isUpdatingEmployee, setIsUpdatingEmployee] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<string | undefined>();
  const [lastname, setLastname] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [role, setRole] = useState<{ value: string; label: string } | null>(null);

  const [isSuper, setIsSuper] = useState<boolean | undefined>();
  const [isVerified, setIsVerified] = useState<string | undefined>();

  const [roleOptions, setRoleOptions] = useState<
    { value: string; label: string }[] | []
  >([]);

  const [updateEmployee] = useUpdateEmployeeMutation();

  const updateEmployeeHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role || !role.value) {
      toast.error("Please select a machine role");
      return;
    }
    
    try {
      setIsUpdatingEmployee(true);
      // Send single role ID as array (backend expects array)
      const response = await updateEmployee({
        _id: employeeId,
        role: [role.value],
      }).unwrap();
      toast.success(response.message);
      fetchEmployeesHandler();
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    } finally {
      setIsUpdatingEmployee(false);
    }
  };

  const fetchUserDetailsHandler = async () => {
    try {
      setIsLoadingEmployee(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `auth/user/${employeeId}`,
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
      setFirstname(data.user.first_name);
      setLastname(data.user?.last_name);
      setEmail(data.user.email);
      setPhone(data.user.phone);
      
      const userRole = data.user?.role;
      // Handle role initialization - support both array and single role for backward compatibility
      if (Array.isArray(userRole) && userRole.length > 0) {
        // Array of roles - take the first one for single select
        const firstRole = userRole[0];
        const formattedRole = {
          value: typeof firstRole === 'object' && firstRole !== null && firstRole._id ? firstRole._id : firstRole.value || firstRole,
          label: typeof firstRole === 'object' && firstRole !== null && (firstRole.name || firstRole.role) ? (firstRole.name || firstRole.role) : firstRole.label || 'Role'
        };
        setRole(formattedRole);
      } else if (userRole && typeof userRole === 'object' && userRole._id) {
        // Single role object (backward compatibility)
        setRole({ value: userRole._id, label: (userRole.name || userRole.role || 'Role') as string });
      } else {
        // Fallback - null
        setRole(null);
      }

      setIsVerified(data.user.isVerified);
      setIsSuper(data.user.isSuper);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  const fetchResourcesHandler = async () => {
    try {
      // Always show only resources assigned to the employee's supervisor
      // This applies whether employee is editing their own profile or admin/supervisor is editing
      const url = process.env.REACT_APP_BACKEND_URL + `resources/for-employee/${employeeId}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      const resources = data.resources || [];
      const modifiedResources = resources.map((resource: any) => ({
        value: resource._id,
        label: resource.name,
      }));
      setRoleOptions(modifiedResources);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  useEffect(() => {
    fetchUserDetailsHandler();
    fetchResourcesHandler();
  }, []);

  return (
    // <Drawer closeDrawerHandler={closeDrawerHandler}>

    // </Drawer>

    <div
      className="absolute overflow-auto h-screen w-[99vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
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
          Update Employee
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
        {isLoadingEmployee && <Loading />}
        {!isLoadingEmployee && (
          <form onSubmit={updateEmployeeHandler}>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">First Name</h3>
                <p className="text-gray-600">{firstname}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Last Name</h3>
                <p className="text-gray-600">{lastname}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
                <p className="text-gray-600">{email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Phone</h3>
                <p className="text-gray-600">{phone}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Is Verified
                </h3>
                <p className="text-gray-600">
                  {isVerified ? "Verified" : "Not Verified"}
                </p>
              </div>

              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Machine Role
                </FormLabel>
                <Select
                  value={role}
                  options={roleOptions}
                  onChange={(e: any) => setRole(e)}
                  isClearable
                  styles={{
                    control: (provided: any) => ({
                      ...provided,
                      backgroundColor: "white",
                      borderColor: "#d1d5db",
                      color: "#374151",
                      minHeight: "40px",
                      "&:hover": {
                        borderColor: "#9ca3af",
                      },
                    }),
                    option: (provided: any, state: any) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? "#e5e7eb" : "white",
                      color: "#374151",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                    }),
                    placeholder: (provided: any) => ({
                      ...provided,
                      color: "#9ca3af",
                    }),
                    singleValue: (provided: any) => ({
                      ...provided,
                      color: "#374151",
                    }),
                    menu: (provided: any) => ({
                      ...provided,
                      zIndex: 9999,
                      backgroundColor: "white",
                      border: "1px solid #d1d5db",
                    }),
                  }}
                />
              </FormControl>

              <Button
                isLoading={isUpdatingEmployee}
                type="submit"
                className="mt-1 w-full"
                colorScheme="blue"
                size="lg"
                _hover={{ bg: "blue.600" }}
              >
                Update Employee
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateEmployee;
