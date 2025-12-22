import { FaQuoteLeft, FaRegCheckCircle } from "react-icons/fa";
import { IoDocumentTextOutline, IoStorefrontOutline } from "react-icons/io5";
import {
  MdOutlineShoppingCart,
  MdOutlineSpeed,
  MdOutlineSell,
  MdOutlineAttachMoney,
  MdOutlinePayment,
  MdOutlineProductionQuantityLimits,
  MdTask,
  MdOutlineRefresh,
} from "react-icons/md";
import { CgProfile } from "react-icons/cg";

import { RiBillLine } from "react-icons/ri";
import { TbLockAccess, TbTruckDelivery, TbUsersGroup } from "react-icons/tb";
import { SlDirection } from "react-icons/sl";
import { FaHandsHelping } from "react-icons/fa";
import { SiScrapy } from "react-icons/si";
import { FaPeopleGroup } from "react-icons/fa6";
import { BiPurchaseTagAlt } from "react-icons/bi";
import { VscServerProcess } from "react-icons/vsc";
import { GiProgression } from "react-icons/gi";
import Products from "../pages/Products";
import Approvals from "../pages/Approvals";
import Stores from "../pages/Stores";
import Buyers from "../pages/Buyers";
import Sellers from "../pages/Sellers";
import BOM from "../pages/BOM";

import UserRole from "../pages/UserRoles";
import Employees from "../pages/Emloyees";
import ProformaInvoice from "../pages/ProformaInvoice";
import Invoice from "../pages/Invoice";
import Payment from "../pages/Payment";
// import AccountantDashboard from "../pages/AccountantDashboard";
import Process from "../pages/Process";
import IndirectProducts from "../pages/IndirectProducts";
import WIPProducts from "../pages/WIPProducts";
import InventoryApprovals from "../pages/InventoryApprovals";
import Userprofile from "../pages/Userprofile";
import Sales from "../pages/Sales";
import Dispatch from "../pages/Dispatch";
import Parties from "../pages/Parties";
import { IoIosPeople } from "react-icons/io";
import Task from "../pages/Task";
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
import Dashboard from "../pages/Dashboard";
import Scrap from "../pages/Scrap";
import PurchaseOrder from "../pages/PurchaseOrder";
import Resources from "../pages/Resources";
import ProductionStatus from "../pages/ProductionStatus";
// import ProductionDashboard from "../pages/ProductionDashboard";
import MachineStatus from "../pages/MachineStatus";
import UpcomingSales from "../pages/UpcomingSales";
// import DesignerDashboard from "../pages/DesignerDashboard";
import Sensors from "../pages/Sensors";
import PlcMachineData from "../pages/PlcMachineData";
import PlcDemo from "../pages/plcddemo";
const routes = [
   {
      name: "Live Data",
      icon: <Activity />,
      path: "",
      element: <MachineStatus />,
      isSublink: false,
    },
  // {
  //   name: "Dashboard",
  //   icon: <MdOutlineSpeed />,
  //   path: "",
  //   element: <Dashboard />,
  //   isSublink: false,
  // },

  {
    name: "Employees",
    icon: <FaPeopleGroup />,
    path: "employee",
    element: <Employees />,
    isSublink: false,
  },
  // {
  //   name: "Sensors",
  //   icon: <Component />,
  //   path: "sensors",
  //   element: <Sensors />,
  //   isSublink: false,
  // },
  // {
  //   name: "Live Data",
  //   icon: <BarChart3 />,
  //   path: "Plc-Demo",
  //   element: <PlcDemo />,
  //   isSublink: false,
  // },
  // {
  //   name: "PLC Machine Data",
  //   icon: <BarChart3 />,
  //   path: "plc-machine-data",
  //   element: <PlcMachineData />,
  //   isSublink: false,
  // },
  // {
  //   name: "User Roles",
  //   icon: <TbLockAccess />,
  //   path: "role",
  //   element: <UserRole />,
  //   isSublink: false,
  // },

  {
    name: "Resources",
    icon: <Wrench />,
    path: "resources",
    element: <Resources />,
    isSublink: false,
  },

  //   {
  //     name: "Merchant",
  //     icon: <IoIosPeople />,
  //     path: "merchant",
  //     element: <Parties />,
  //     isSublink: false,
  //   },
  //   {
  //     name: "Inventory",
  //     icon: <MdOutlineShoppingCart />,
  //     path: "inventory",
  //      sublink: [
  // {
  //   name: "Dashboard",
  //   icon: <MdOutlineSpeed />,
  //   path: "dashboard",
  //   element: <InventoryDashboard />,
  // },
  //      {
  //        name: "Direct",
  //        icon: <SlDirection />,
  //        path: "direct",
  //        element: <Products />,
  //      },
  //     {
  //       name: "Indirect",
  //       icon: <FaHandsHelping />,
  //       path: "indirect",
  //       element: <IndirectProducts />,
  //     },
  //     {
  //       name: "Work In Progress",
  //       icon: <GiProgression />,
  //       path: "wip",
  //       element: <WIPProducts />,
  //     },
  //     {
  //       name: "Store",
  //       icon: <Store />,
  //       path: "store",
  //       element: <Stores />,
  //     },

  //     {
  //       name: "Inventory Approvals",
  //       icon: <FaRegCheckCircle />,
  //       path: "approval",
  //       element: <InventoryApprovals />,
  //     },
  //     {
  //       name: "Scrap Management",
  //       icon: <SiScrapy />,
  //       path: "scrap",
  //       element: <Scrap />,
  //     },
  //   ],
  //   isSublink: true,
  // },
  // {
  //   name: "Sales Order",
  //   icon: <HandCoins />,
  //   path: "sales",
  //   element: <Sales />,
  //   isSublink: false,
  // },

  // {
  //   name: "Procurement",
  //   icon: <Box />,
  //   path: "procurement",
  //   sublink: [
  //     {
  //       name: "Purchase Order",
  //       icon: <ScanBarcode />,
  //       path: "purchase-order",
  //       element: <PurchaseOrder />,
  //     },
  //   ],
  //   isSublink: true,
  // },

  // {
  //   name: "Production",
  //   path: "production",
  //   icon: <MdOutlineProductionQuantityLimits />,
  //   sublink: [
  //     {
  //       name: "Coming Production",
  //       icon: <Calendar />,
  //       path: "upcoming-sales",
  //       element: <UpcomingSales />,
  //     },
  //     {
  //       name: "BOM",
  //       icon: <RiBillLine />,
  //       path: "bom",
  //       element: <BOM />,
  //     },
  //     {
  //       name: "Pre Production",
  //       icon: <VscServerProcess />,
  //       path: "pre-production",
  //       element: <Process />,
  //     },
  //     {
  //       name: "Production Status",
  //       icon: <VscServerProcess />,
  //       path: "production-status",
  //       element: <ProductionStatus />,
  //     },

  //   ],
  //   isSublink: true,
  // },
  // {
  //   name: "Dispatch",
  //   icon: <TbTruckDelivery />,
  //   path: "dispatch",
  //   element: <Dispatch />,
  //   isSublink: false,
  // },
  // {
  //   name: "Accounts",
  //   path: "accounts",
  //   icon: <BiPurchaseTagAlt />,
  //   sublink: [
  // {
  //   name: "Dashboard",
  //   icon: <MdOutlineSpeed />,
  //   path: "dashboard",
  //   element: <AccountantDashboard />,
  // },
  // {
  //   name: "Dashboard",
  //   icon: <MdOutlineSpeed />,
  //   path: "dashboard",
  //   element: <AccountantDashboard />,
  // },
  //     {
  //       name: "Proforma Invoices",
  //       icon: <IoDocumentTextOutline />,
  //       path: "proforma-invoice",
  //       element: <ProformaInvoice />,
  //     },
  //     {
  //       name: "Tax Invoices",
  //       icon: <RiBillLine />,
  //       path: "taxInvoice",
  //       element: <Invoice />,
  //     },

  //     {
  //       name: "Payments",
  //       icon: <MdOutlinePayment />,
  //       path: "payment",
  //       element: <Payment />,
  //     },
  //   ],
  //   isSublink: true,
  // },

  // {
  //   name: "Task",
  //   icon: <MdTask />,
  //   path: "task",
  //   element: <Task />,
  //   isSublink: false,
  // },
  // {
  //   name: "Designer Dashboard",
  //   icon: <MdOutlineSpeed />,
  //   path: "designer-dashboard",
  //   element: <DesignerDashboard />,
  //   isSublink: false,
  // },
  // {
  //   name: "Control Panel",
  //   icon: <FaRegCheckCircle />,
  //   path: "approval",
  //   element: <Approvals />,
  //   isSublink: false,
  // },
  {
    name: "My Profile",
    icon: <CgProfile />,
    path: "userprofile",
    element: <Userprofile />,
    isSublink: false,
  },
];

export default routes;


