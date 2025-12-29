// @ts-nocheck

import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../../../theme/colors";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

interface AddSupervisorProps {
  fetchSupervisorsHandler: () => void;
  closeDrawerHandler: () => void;
}

const AddSupervisor: React.FC<AddSupervisorProps> = ({
  closeDrawerHandler,
  fetchSupervisorsHandler,
}) => {
  const [cookies] = useCookies();
  const [isCreatingSupervisor, setIsCreatingSupervisor] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");

  const validatePassword = (value: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (value.length < minLength) return "Password must be at least 8 characters.";
    if (!hasUpper) return "Password must contain at least one uppercase letter.";
    if (!hasLower) return "Password must contain at least one lowercase letter.";
    if (!hasNumber) return "Password must contain at least one number.";
    if (!hasSpecial) return "Password must contain at least one special character.";

    return null;
  };

  const createSupervisorHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordError) {
      toast.error("Fix password errors before proceeding");
      return;
    }

    if (!firstname || !email || !phone || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsCreatingSupervisor(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "supervisor/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify({
            first_name: firstname,
            last_name: lastname || "",
            email,
            password,
            phone,
            address: address || "",
          }),
        }
      );

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create supervisor");
      }

      toast.success(result.message || "Supervisor created successfully");
      fetchSupervisorsHandler();
      closeDrawerHandler();
      
      // Reset form
      setFirstname("");
      setLastname("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setPasswordError(null);
      setAddress("");
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsCreatingSupervisor(false);
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
          Add New Supervisor
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
        <form onSubmit={createSupervisorHandler}>
          <div className="space-y-4">
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
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
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
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
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
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
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
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
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
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Password
              </FormLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    const error = validatePassword(value);
                    setPasswordError(error);
                  }}
                  placeholder="Enter password"
                  size="lg"
                  borderColor={passwordError ? "red.500" : colors.border.medium}
                  _hover={{
                    borderColor: passwordError ? "red.500" : colors.border.dark,
                  }}
                  _focus={{
                    borderColor: passwordError
                      ? "red.500"
                      : colors.primary[500],
                    boxShadow: passwordError
                      ? "0 0 0 1px red.500"
                      : `0 0 0 1px ${colors.primary[500]}`,
                  }}
                  pr="45px"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 z-20"
                  style={{ color: colors.text.secondary }}
                >
                  {showPassword ? (
                    <IoEyeOutline size={18} />
                  ) : (
                    <IoEyeOffOutline size={18} />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
              {password && !passwordError && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters with uppercase,
                  lowercase, number, and special character
                </p>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Confirm Password
              </FormLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  size="lg"
                  borderColor={
                    confirmPassword && password !== confirmPassword
                      ? "red.500"
                      : colors.border.medium
                  }
                  _hover={{
                    borderColor:
                      confirmPassword && password !== confirmPassword
                        ? "red.500"
                        : colors.border.dark,
                  }}
                  _focus={{
                    borderColor:
                      confirmPassword && password !== confirmPassword
                        ? "red.500"
                        : colors.primary[500],
                    boxShadow:
                      confirmPassword && password !== confirmPassword
                        ? "0 0 0 1px red.500"
                        : `0 0 0 1px ${colors.primary[500]}`,
                  }}
                  pr="45px"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20"
                  style={{ color: colors.text.secondary }}
                >
                  {showPassword ? (
                    <IoEyeOutline size={18} />
                  ) : (
                    <IoEyeOffOutline size={18} />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </FormControl>

            <Button
              isLoading={isCreatingSupervisor}
              type="submit"
              className="mt-1 w-full"
              colorScheme="blue"
              size="lg"
              isDisabled={
                passwordError !== null ||
                (confirmPassword && password !== confirmPassword)
              }
              _hover={{ bg: "blue.600" }}
            >
              Create Supervisor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupervisor;

