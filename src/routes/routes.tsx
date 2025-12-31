import { CgProfile } from "react-icons/cg";
import { SlDirection } from "react-icons/sl";
import { FaPeopleGroup } from "react-icons/fa6";
import Products from "../pages/Products";
import Employees from "../pages/Emloyees";
import Userprofile from "../pages/Userprofile";
import {
  Box,
  Calendar,
  Component,
  Construction,
  Container,
  HandCoins,
  Presentation,
  ScanBarcode,
  ShieldCheck,
  Store,
  TicketPercent,
  Workflow,
  Wrench,
  BarChart3,
  Activity,
} from "lucide-react";
import Resources from "../pages/Resources";
import MachineStatus from "../pages/MachineStatus";
import MachineHistory from "../pages/MachineHistory";
import { TbLockAccess } from "react-icons/tb";
import MachineInfo from "../pages/MachineInfo";
import { MdOutlineSpeed } from "react-icons/md";
import StoppageInfo from "../pages/StoppageInfo";
import { IoIosPeople } from "react-icons/io";
import Supervisors from "../pages/Supervisors";
import { FileText } from "lucide-react";
import Requests from "../pages/Requests";
const routes = [
  {
    name: "Live Data",
    icon: <Activity />,
    path: "",
    element: <MachineStatus />,
    isSublink: false,
  },

  {
    name: "Supervisor",
    icon: <IoIosPeople />,
    path: "supervisor",
    element: <Supervisors />,
    isSublink: false,
  },
  {
    name: "Employees",
    icon: <FaPeopleGroup />,
    path: "employee",
    element: <Employees />,
    isSublink: false,
  },
  {
    name: "Machine History",
    icon: <Component />,
    path: "machine-history",
    element: <MachineHistory />,
    isSublink: false,
  },


  {
    name: "Resources",
    icon: <Wrench />,
    path: "resources",
    element: <Resources />,
    isSublink: false,
  },

  {
    name: "Product",
    icon: <SlDirection />,
    path: "product",
    element: <Products />,
    isSublink: false,
  },
  {
    name: "Machine Info",
    icon: <TbLockAccess />,
    path: "machine-info",
    element: <MachineInfo />,
    isSublink: false,
  },
  {
    name: "Stoppage Info",
    icon: <MdOutlineSpeed />,
    path: "stoppage-info",
    element: <StoppageInfo />,
    isSublink: false,
  },
  {
    name: "Requests",
    icon: <FileText />,
    path: "requests",
    element: <Requests />,
    isSublink: false,
  },
  {
    name: "My Profile",
    icon: <CgProfile />,
    path: "userprofile",
    element: <Userprofile />,
    isSublink: false,
  },
];

export default routes;
