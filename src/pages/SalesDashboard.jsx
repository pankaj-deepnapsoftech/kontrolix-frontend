// @ts-nocheck
import { Box, Icon } from "@chakra-ui/react";
import axios from "axios";
import { Check, List, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { FaArrowDown, FaArrowUp, FaRegTimesCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

const SalesDashboard = () => {

    const [isLoadingSales, setIsLoadingSalesDelivered] = useState(false);
    const [salesDeliverData, setSalesDeliveredData] = useState([]);
    const [cookies] = useCookies();
    const token = cookies?.access_token ;
    // console.log(salesDeliverData?.sales)
    const [purchases, setPurchases] = useState([])
    const stats = [
        {
            title: "Sales Order",
            value: salesDeliverData?.sales?.currentMonthSales,
            change: `${salesDeliverData?.sales?.differenceInSales} v/s last month`,
            positive: salesDeliverData?.sales?.differenceInSales >= 0,
            icon: List,
            bgColor: "#07daf1",
            iconColor: "white",
        },
        {
            title: "Completed Orders",
            value: salesDeliverData?.delivered?.currentMonthDelivered,
            change: `${salesDeliverData?.delivered?.differenceInDelivered} v/s last month`,
            positive: salesDeliverData?.delivered?.differenceInDelivered >= 0,
            icon: Check,
            bgColor: "#7ED185",
            iconColor: "white",
        },
        {
            title: "Incompleted Orders",
            value:
                (salesDeliverData?.sales?.currentMonthSales || 0) -
                (salesDeliverData?.delivered?.currentMonthDelivered || 0),
            change: `${(salesDeliverData?.sales?.differenceInSales || 0) -
                (salesDeliverData?.delivered?.differenceInDelivered || 0)} v/s last month`,
            positive:
                ((salesDeliverData?.sales?.differenceInSales || 0) -
                    (salesDeliverData?.delivered?.differenceInDelivered || 0)) >= 0,
            icon: X,
            bgColor: "#FA4F4F",
            iconColor: "white",
        },
    ];


    const orders = [
        {
            id: "SO001",
            merchant: "Testing",
            product: "Pen",
            qty: 1500,
            unit: 15,
            total: 22500,
            status: "In Progress",
        },
        {
            id: "SO002",
            merchant: "John",
            product: "Pencil",
            qty: 1400,
            unit: 3,
            total: 4200,
            status: "Pending",
        },
        {
            id: "SO003",
            merchant: "Testing",
            product: "Tags",
            qty: 12000,
            unit: 15,
            total: 18000,
            status: "Completed",
        },
        {
            id: "SO004",
            merchant: "John",
            product: "Bags",
            qty: 956,
            unit: 3,
            total: 2868,
            status: "Pending",
        },
    ];

    const statusColor = {
        Completed: "bg-green-100 text-green-600",
        Pending: "bg-red-100 text-red-600",
        "In Progress": "bg-yellow-100 text-yellow-600",
    };

    const fetchSalesDeliveredData = async () => {
        setIsLoadingSalesDelivered(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}dashboard/sales-delivered`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies?.access_token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success) {
                    setSalesDeliveredData(data);
                } else {
                    toast({
                        title: "Error",
                        description: data.message || "Failed to fetch sales-delivered data",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            } else {
                console.error('Sales-Delivered API Error:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching sales-delivered data:', error);
            toast({
                title: "Error",
                description: "Failed to fetch sales-delivered data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoadingSalesDelivered(false);
        }
    };

    const fetchPurchases = async () => {
      try {
       
        if (!token) throw new Error("Authentication token not found");
    
        const url = `${process.env.REACT_APP_BACKEND_URL}sale/getAll?limit=5`
          // // role === "admin"
          //   ? 
          //   : `${process.env.REACT_APP_BACKEND_URL}sale/getOne?page=${currentPage}&&limit=10`;
    
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        // Force new reference to trigger re-render
        setPurchases([...response?.data?.data]);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch sale data"
        );
      } 
    };

    useEffect(() => {
        fetchSalesDeliveredData()
        fetchPurchases()
    }, [])

    // console.log(purchases)
    return (
        <div className="p-6 space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2"
                    >
                        <div className="flex justify-between items-center">
                            <h4 className="text-gray-600 font-medium">{item.title}</h4>
                            <Box
                                bg={item.bgColor}
                                p={3}
                                borderRadius={item.icon === List ? 'md' : 'full'}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon as={item.icon} size={20} color={item.iconColor} />
                            </Box>

                        </div>
                        <div className="text-3xl font-bold">{item.value}</div>
                        <div
                            className={`flex items-center text-sm ${item.positive ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {item.positive ? (
                                <FaArrowUp className="mr-1" />
                            ) : (
                                <FaArrowDown className="mr-1" />
                            )}
                            {item.change}
                        </div>
                       
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-md p-6 overflow-auto">
                <div className="flex justify-between w-full">
                    <h3 className="text-lg font-semibold mb-4">Sales</h3>
                    <NavLink to='/sales'>  <h3 className="text-lg font-[400] text-white mb-4 border rounded-md bg-sky-500 px-8 py-1">View all</h3></NavLink>
                </div>
                <table className="w-full border-collapse text-sm ">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 whitespace-nowrap">
                            <th className="py-3 px-4 text-left">Order Id</th>
                            <th className="py-3 px-4 text-left">Created Date</th>
                            <th className="py-3 px-4 text-left">Merchant</th>
                            <th className="py-3 px-4 text-left">Product</th>
                            <th className="py-3 px-4 text-left">Quantity</th>
                            <th className="py-3 px-4 text-left">Unit Price</th>
                            <th className="py-3 px-4 text-left">Total Price</th>
                           
                        </tr>
                    </thead>
                    <tbody>
                        {purchases?.map((order) => (
                            <tr key={order.id} className="border-t whitespace-nowrap hover:bg-gray-50">
                                <td className="py-3 px-4">{order.order_id}</td>
                                <td className="py-3 px-4">
                                    {new Date(order?.createdAt).toLocaleString()}
                                </td>

                                <td className="py-3 px-4">{order?.party?.consignee_name[0] || order?.party?.company_name}</td> 
                                <td className="py-3 px-4">{order?.product_id[0]?.name}</td>
                                <td className="py-3 px-4">{order?.product_qty}</td>
                                <td className="py-3 px-4">₹{order.price}</td>
                                <td className="py-3 px-4">₹{order.total_price}</td>
                                {/* <td className="py-3 px-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.status]}`}
                                    >
                                        {order.status}
                                    </span>
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesDashboard;
