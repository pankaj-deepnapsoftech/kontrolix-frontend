import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginComponent from "../components/Authentication/LoginComponent";
import ForgetPasswordComponent from "../components/Authentication/ForgetPasswordComponent";
import OTPVerificationComponent from "../components/Authentication/OTPVerificationComponent";
import RegisterComponent from "../components/Authentication/RegisterComponent";
import { useLazyCheckAdminExistsQuery } from "../redux/api/api";
import { toast } from "react-toastify";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();

  const [showLoginComponent, setShowLoginComponent] = useState<boolean>(true);
  const [showForgetPasswordComponent, setShowForgetPasswordComponent] = useState<boolean>(false);
  const [showRegisterComponent, setShowRegisterComponent] = useState<boolean>(false);
  const [showOTPVerificationComponent, setShowOTPVerificationComponent] = useState<boolean>(false);
  const [adminExists, setAdminExists] = useState<boolean>(false);
  
  const [checkAdminExists] = useLazyCheckAdminExistsQuery();

  useEffect(() => {
    // Check if admin exists on component mount
    const checkAdmin = async () => {
      try {
        const result = await checkAdminExists().unwrap();
        setAdminExists(result.adminExists || false);
      } catch (error) {
        // If error, assume admin doesn't exist (for first time setup)
        setAdminExists(false);
      }
    };
    checkAdmin();
  }, [checkAdminExists]);

  // Block register if admin exists
  const handleShowRegister = () => {
    if (adminExists) {
      toast.error("Admin already created. Please contact admin to create your account.");
      return;
    }
    setShowRegisterComponent(true);
    setShowLoginComponent(false);
  };


  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://sopasb2c.deepmart.shop/manufacturing-productio.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-md p-6 ">
          {showLoginComponent && (
            <LoginComponent
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              setShowLoginComponent={setShowLoginComponent}
              setShowForgetPasswordComponent={setShowForgetPasswordComponent}
              setShowOTPVerificationComponent={setShowOTPVerificationComponent}
              setShowRegisterComponent={handleShowRegister}
              adminExists={adminExists}
            />
          )}

          {showForgetPasswordComponent && (
            <ForgetPasswordComponent
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />
          )}

          {showRegisterComponent && !adminExists && (
            <RegisterComponent
              email={email}
              setEmail={setEmail}
              setShowRegisterComponent={setShowRegisterComponent}
              setShowOTPVerificationComponent={setShowOTPVerificationComponent}
              setShowLoginComponent={setShowLoginComponent}
            />
          )}

          {showOTPVerificationComponent && (
            <OTPVerificationComponent email={email} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
