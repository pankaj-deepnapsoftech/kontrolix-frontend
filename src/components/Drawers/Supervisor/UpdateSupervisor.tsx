// @ts-nocheck

import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../../../theme/colors";
import Select from "react-select";
import Loading from "../../../ui/Loading";

interface UpdateSupervisorProps {
  fetchSupervisorsHandler: () => void;
  closeDrawerHandler: () => void;
  supervisorId: string | undefined;
}

const UpdateSupervisor: React.FC<UpdateSupervisorProps> = ({
  closeDrawerHandler,
  fetchSupervisorsHandler,
  supervisorId,
}) => {
  const [cookies] = useCookies();
  const [isUpdatingSupervisor, setIsUpdatingSupervisor] = useState<boolean>(false);
  const [isLoadingSupervisor, setIsLoadingSupervisor] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(false);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: colors.border.medium,
      color: colors.text.primary,
      minHeight: "40px",
      "&:hover": {
        borderColor: colors.border.dark,
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? colors.gray[100] : "white",
      color: colors.text.primary,
      "&:hover": {
        backgroundColor: colors.gray[200],
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: "white",
      border: `1px solid ${colors.border.medium}`,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: colors.text.secondary,
    }),
  };

  // Fetch employees on mount (exclude employees assigned to other supervisors)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        // Pass supervisorId as query param to exclude employees assigned to other supervisors
        // but include employees already assigned to this supervisor
        const url = supervisorId 
          ? `${process.env.REACT_APP_BACKEND_URL}auth/all?supervisorId=${supervisorId}`
          : `${process.env.REACT_APP_BACKEND_URL}auth/all`;
        const response = await fetch(
          url,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );
        const result = await response.json();
        if (result.success && Array.isArray(result.users)) {
          setEmployees(result.users);
          const options = result.users.map((emp: any) => ({
            value: emp._id,
            label: `${emp.first_name || ""} ${emp.last_name || ""}${emp.email ? ` (${emp.email})` : ""}`.trim(),
          }));
          setEmployeeOptions(options);
        }
      } catch (error: any) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    if (supervisorId) {
      fetchEmployees();
    }
  }, [cookies, supervisorId]);

  // Fetch supervisor details
  useEffect(() => {
    const fetchSupervisorDetails = async () => {
      if (!supervisorId) return;
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
        const result = await response.json();
        if (result.success && result.supervisor) {
          const sup = result.supervisor;
          setFirstname(sup.first_name || "");
          setLastname(sup.last_name || "");
          setEmail(sup.email || "");
          setPhone(sup.phone || "");
          setAddress(sup.address || "");
          
          // Set selected employees
          if (sup.assignedEmployees && Array.isArray(sup.assignedEmployees)) {
            const selected = sup.assignedEmployees.map((emp: any) => ({
              value: emp._id || emp,
              label: `${emp.first_name || ""} ${emp.last_name || ""}${emp.email ? ` (${emp.email})` : ""}`.trim(),
            }));
            setSelectedEmployees(selected);
          }
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch supervisor details");
      } finally {
        setIsLoadingSupervisor(false);
      }
    };

    fetchSupervisorDetails();
  }, [supervisorId, cookies]);

  const updateSupervisorHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstname || !email || !phone) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!selectedEmployees || selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    try {
      setIsUpdatingSupervisor(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "supervisor/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify({
            _id: supervisorId,
            first_name: firstname,
            last_name: lastname || "",
            email,
            phone,
            address: address || "",
            assignedEmployees: selectedEmployees.map((emp: any) => emp.value),
          }),
        }
      );

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update supervisor");
      }

      toast.success(result.message || "Supervisor updated successfully");
      fetchSupervisorsHandler();
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsUpdatingSupervisor(false);
    }
  };

  return (
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
          Update Supervisor
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
        {isLoadingSupervisor ? (
          <Loading />
        ) : (
          <form onSubmit={updateSupervisorHandler}>
            <div className="space-y-4">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Select Employees
                </FormLabel>
                <Select
                  className="mt-2"
                  placeholder="Select employees"
                  value={selectedEmployees}
                  options={employeeOptions}
                  styles={customStyles}
                  onChange={(selected: any) => {
                    setSelectedEmployees(selected || []);
                  }}
                  isMulti
                  isClearable
                  isLoading={isLoadingEmployees}
                  isDisabled={isLoadingEmployees}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedEmployees.length > 0
                    ? `${selectedEmployees.length} employee(s) selected`
                    : "Please select at least one employee"}
                </p>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  First Name
                </FormLabel>
                <Input
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="Enter first name"
                  size="lg"
                  borderColor={colors.border.medium}
                  _hover={{ borderColor: colors.border.dark }}
                  _focus={{ borderColor: colors.primary[500], boxShadow: `0 0 0 1px ${colors.primary[500]}` }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.700">
                  Last Name
                </FormLabel>
                <Input
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Enter last name"
                  size="lg"
                  borderColor={colors.border.medium}
                  _hover={{ borderColor: colors.border.dark }}
                  _focus={{ borderColor: colors.primary[500], boxShadow: `0 0 0 1px ${colors.primary[500]}` }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  size="lg"
                  borderColor={colors.border.medium}
                  _hover={{ borderColor: colors.border.dark }}
                  _focus={{ borderColor: colors.primary[500], boxShadow: `0 0 0 1px ${colors.primary[500]}` }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Phone Number
                </FormLabel>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  size="lg"
                  maxLength={10}
                  borderColor={colors.border.medium}
                  _hover={{ borderColor: colors.border.dark }}
                  _focus={{ borderColor: colors.primary[500], boxShadow: `0 0 0 1px ${colors.primary[500]}` }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color="gray.700">
                  Address
                </FormLabel>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address (optional)"
                  size="lg"
                  borderColor={colors.border.medium}
                  _hover={{ borderColor: colors.border.dark }}
                  _focus={{ borderColor: colors.primary[500], boxShadow: `0 0 0 1px ${colors.primary[500]}` }}
                />
              </FormControl>

              <Button
                isLoading={isUpdatingSupervisor}
                type="submit"
                className="mt-1 w-full"
                colorScheme="blue"
                size="lg"
                _hover={{ bg: "blue.600" }}
              >
                Update Supervisor
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateSupervisor;

