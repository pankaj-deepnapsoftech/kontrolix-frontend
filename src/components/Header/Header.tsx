import { useSelector } from "react-redux";
// import logo from "../../assets/images/logo/logo.png";
import { Avatar } from "@chakra-ui/react";
import { IoIosNotifications } from "react-icons/io";
import { useState, useEffect } from "react";
import ClickMenu from "../../ui/ClickMenu";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import UserDetailsMenu from "../../ui/UserDetailsMenu";
import { colors } from "../../theme/colors";
// import { MdOutlineDashboardCustomize } from "react-icons/md";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [cookie, _, removeCookie] = useCookies();
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const { firstname, lastname, email } = useSelector(
    (state: any) => state.auth
  );

  const [greeting, setGreeting] = useState<string>("Good Afternoon");
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }));


  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8096/api/';

  // Fetch welcome data from API
  useEffect(() => {
    const fetchWelcomeData = async () => {
      try {
        // Get the access token from cookies
        const accessToken = cookie.access_token;
        
        if (!accessToken) {
          return;
        }

        const response = await fetch(`${backendUrl}dashboard/welcome`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();

       
        
        if (data.success) {
          setGreeting(data.greeting);
          setDate(data.date);
        }
      } catch (error) {
        // Fallback to default values if API fails
        setGreeting("Good Afternoon");
        setDate(new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }));
      }
    };

    fetchWelcomeData();
  }, [cookie.access_token]);

  

  const logoutHandler = () => {
    try {
      removeCookie("access_token");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };
  return (
    <div className="relative bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center h-16 px-4 lg:px-6">
      
        <div className=" flex-col justify-center hidden md:flex ml-20 lg:ml-0">
          <h1 className="text-2xl font-semibold text-gray-800">
            {greeting},
            <span className="ml-1 text-blue-600">
              {firstname ? `${firstname} ${lastname}` : "User"}
            </span>
          </h1>
          <i className="text-sm text-gray-500"> "{date}"</i>
        </div>

       
        <div className="flex items-center gap-4 ml-auto">

        {/* <button className="text-white bg-blue-500 hover:bg-blue-600 rounded-md px-2 py-1 text-sm"
          onClick={() => navigate('/pricing-modal?action=renew')}
        >
          Renew
        </button>

        <button className="text-white bg-green-500 hover:bg-green-600 rounded-md px-2 py-1 text-sm"
          onClick={() => navigate('/pricing-modal')}
        >
          Upgrade
        </button>
       */}
          {/* <button
            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Notifications"
          >
            <IoIosNotifications size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button> */}

     
          <div className="relative">
            <Avatar
              cursor="pointer"
              size="md"
              name={firstname ? `${firstname} ${lastname}` : "User"}
              onClick={() => setShowUserDetails((prev) => !prev)}
              className="border-2 border-gray-200 hover:border-blue-400 transition-all duration-200"
            />
            {showUserDetails && (
              <ClickMenu
                top={70}
                right={0}
                closeContextMenuHandler={() => setShowUserDetails(false)}
              >
                <UserDetailsMenu
                  email={email}
                  firstname={firstname}
                  lastname={lastname}
                  logoutHandler={logoutHandler}
                  closeUserDetailsMenu={() => setShowUserDetails(false)}
                />
              </ClickMenu>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default Header;
