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
import Supervisor from "../pages/Supervisor";
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
    name: "Supervisor",
    icon: <IoIosPeople />,
    path: "supervisor",
    element: <Supervisor />,
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
