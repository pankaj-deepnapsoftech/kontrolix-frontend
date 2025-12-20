//@ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();



  // Handle payment when user clicks a plan's button
  const handleBuy = async () => {
    navigate('/login');
  };

  const plansMonthly = [
    // {
    //   name: "Free Trial",
    //   price: "₹0",
    //   period: "for 14 days",
    //   button: "Start Free Trial",
    //   highlight: false,
    //   features: [
    //     { name: "Dashboard Access", included: true },
    //     { name: "Sensors Integration", included: false },
    //     { name: "Resource Status Monitoring", included: false },
    //     { name: "Machine ON/OFF Control (Remote)", included: false },
    //     { name: "View Production Data from Anywhere", included: false },
    //     { name: "Machine Logs & Error Reports", included: false },
    //     { name: "Real-Time Production Monitoring", included: false },
    //     { name: "Production Monitoring", included: true },
    //     { name: "Employee Management", included: true },
    //     { name: "User Roles & Permissions", included: true },
    //     { name: "Resource Management", included: true },
    //     { name: "Work In Progress Tracking", included: true },
    //     { name: "Store & Inventory Management", included: true },
    //     { name: "Inventory Approvals", included: true },
    //     { name: "Scrap Management", included: true },
    //     { name: "Sales Order Management", included: true },
    //     { name: "Procurement", included: true },
    //     { name: "Production Module", included: true },
    //     { name: "Bill of Materials (BOM)", included: true },
    //     { name: "Pre-Production Management", included: true },
    //     { name: "Dispatch & Delivery Tracking", included: true },
    //     { name: "Accounts & Finance", included: true },
    //     { name: "Proforma Invoice", included: true },
    //     { name: "Tax Invoice", included: true },
    //     { name: "Payments Module", included: true },
    //     { name: "Admin Approvals", included: true },
    //     { name: "User Profile & Settings", included: true },
    //     { name: "Users (5)", included: true },
    //     { name: "Custom Integrations (Attendance, HR, CRM)", included: false },
    //     { name: "Cloud Access (Web + Mobile)", included: true },
    //     { name: "Support Type", included: "Email Only" },
    //   ],
    // },
    {
      name: "KONTRONIX",
      price: "₹999",
      period: "/month",
      button: "Choose KONTRONIX",
      highlight: false,
      features: [
        { name: "Dashboard Access", included: true },
        { name: "Sensors Integration", included: true },
        { name: "Resource Status Monitoring", included: true },
        { name: "Machine ON/OFF Control (Remote)", included: true },
        { name: "View Production Data from Anywhere", included: true },
        { name: "Machine Logs & Error Reports", included: true },
        { name: "Real-Time Production Monitoring", included: true },
        { name: "Production Monitoring", included: true },
        { name: "Employee Management", included: false },
        { name: "User Roles & Permissions", included: false },
        { name: "Resource Management", included: false },
        { name: "Work In Progress Tracking", included: false },
        { name: "Store & Inventory Management", included: false },
        { name: "Inventory Approvals", included: false },
        { name: "Scrap Management", included: false },
        { name: "Sales Order Management", included: false },
        { name: "Procurement", included: false },
        { name: "Production Module", included: false },
        { name: "Bill of Materials (BOM)", included: false },
        { name: "Pre-Production Management", included: false },
        { name: "Dispatch & Delivery Tracking", included: false },
        { name: "Accounts & Finance", included: false },
        { name: "Proforma Invoice", included: false },
        { name: "Tax Invoice", included: false },
        { name: "Payments Module", included: false },
        { name: "Admin Approvals", included: false },
        { name: "User Profile & Settings", included: false },
        { name: "Users (5)", included: true },
        { name: "Custom Integrations (Attendance, HR, CRM)", included: false },
        { name: "Cloud Access (Web + Mobile)", included: true },
        { name: "Support Type", included: "Standard" },
      ],
    },
    {
      name: "SOPAS",
      price: "₹1999",
      period: "/month",
      button: "Start Free Trial",
      highlight: true,
      features: [
        { name: "7-day Free Trial", included: true },
        { name: "Dashboard Access", included: true },
        { name: "Sensors Integration", included: false },
        { name: "Resource Status Monitoring", included: false },
        { name: "Machine ON/OFF Control (Remote)", included: false },
        { name: "View Production Data from Anywhere", included: false },
        { name: "Machine Logs & Error Reports", included: false },
        { name: "Real-Time Production Monitoring", included: false },
        { name: "Production Monitoring", included: true },
        { name: "Employee Management", included: true },
        { name: "User Roles & Permissions", included: true },
        { name: "Resource Management", included: true },
        { name: "Work In Progress Tracking", included: true },
        { name: "Store & Inventory Management", included: true },
        { name: "Inventory Approvals", included: true },
        { name: "Scrap Management", included: true },
        { name: "Sales Order Management", included: true },
        { name: "Procurement", included: true },
        { name: "Production Module", included: true },
        { name: "Bill of Materials (BOM)", included: true },
        { name: "Pre-Production Management", included: true },
        { name: "Dispatch & Delivery Tracking", included: true },
        { name: "Accounts & Finance", included: true },
        { name: "Proforma Invoice", included: true },
        { name: "Tax Invoice", included: true },
        { name: "Payments Module", included: true },
        { name: "Admin Approvals", included: true },
        { name: "User Profile & Settings", included: true },
        { name: "Users (5)", included: true },
        { name: "Charges for Additional Users ₹1000/user", included: true },
        { name: "Custom Integrations (Attendance, HR, CRM)", included: true },
        { name: "No Custom Integrations on Free Trial", included: false },
        { name: "Cloud Access (Web + Mobile)", included: true },
        { name: "Support Type", included: "Standard" },
      ],
    },
    {
      name: "RTPAS",
      price: "₹4999",
      period: "/month",
      button: "Choose RTPAS",
      highlight: false,
      features: [
        { name: "Dashboard Access", included: true },
        { name: "Sensors Integration", included: true },
        { name: "Resource Status Monitoring", included: true },
        { name: "Machine ON/OFF Control (Remote)", included: true },
        { name: "View Production Data from Anywhere", included: true },
        { name: "Machine Logs & Error Reports", included: true },
        { name: "Real-Time Production Monitoring", included: true },
        { name: "Production Monitoring", included: true },
        { name: "Employee Management", included: true },
        { name: "User Roles & Permissions", included: true },
        { name: "Resource Management", included: true },
        { name: "Work In Progress Tracking", included: true },
        { name: "Store & Inventory Management", included: true },
        { name: "Inventory Approvals", included: true },
        { name: "Scrap Management", included: true },
        { name: "Sales Order Management", included: true },
        { name: "Procurement", included: true },
        { name: "Production Module", included: true },
        { name: "Bill of Materials (BOM)", included: true },
        { name: "Pre-Production Management", included: true },
        { name: "Dispatch & Delivery Tracking", included: true },
        { name: "Accounts & Finance", included: true },
        { name: "Proforma Invoice", included: true },
        { name: "Tax Invoice", included: true },
        { name: "Payments Module", included: true },
        { name: "Admin Approvals", included: true },
        { name: "User Profile & Settings", included: true },
        { name: "Users (7)", included: true },
        { name: "Custom Integrations (Attendance, HR, CRM)", included: true },
        { name: "Cloud Access (Web + Mobile)", included: true },
        { name: "Support Type", included: "Priority" },
      ],
    },
  ];

  const plansYearly = plansMonthly.map((p) => ({
    ...p,
    price:
      p.name === "Free Trial"
        ? "₹0"
        : `₹${parseInt(p.price.replace(/[₹,]/g, "")) * 10}`,
    period: p.name === "Free Trial" ? "for 7 days" : "/year",
  }));

  const plans = isYearly ? plansYearly : plansMonthly;

  return (
    <section className="relative bg-gradient-to-b from-blue-100 to-white py-24 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-200/40 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-blue-900 text-center mb-6"
        >
          RTPAS Pricing Plans
        </motion.h2>

        <p className="text-center text-blue-700 text-lg mb-10">
          Choose the plan that fits your automation workflow.
        </p>

        {/* Toggle Monthly / Yearly */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-white/60 backdrop-blur-xl border border-blue-200 shadow-lg rounded-2xl p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                !isYearly
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isYearly
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-3xl p-8 flex flex-col border backdrop-blur-2xl transition-all duration-300 ${
                plan.highlight
                  ? "border-blue-600 bg-white/80 shadow-2xl scale-105"
                  : "border-blue-200 bg-white/70 shadow-xl hover:scale-[1.03]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full shadow-lg">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-bold text-blue-800 text-center">
                {plan.name}
              </h3>

              <div className="flex justify-center items-baseline mt-4 mb-6">
                <span className="text-5xl font-extrabold text-blue-900">
                  {plan.price}
                </span>
                <span className="text-blue-600 ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-blue-800 text-sm"
                  >
                    {f.included === true ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : f.included === false ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : (
                      <span className="text-blue-700 font-semibold ml-2">
                        {f.included}
                      </span>
                    )}
                    {typeof f.included === "boolean" && (
                      <span
                        className={`${
                          f.included
                            ? "font-medium"
                            : "line-through text-blue-400"
                        }`}
                      >
                        {f.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleBuy}
                className={`mt-auto w-full py-3 rounded-xl font-semibold shadow-md transition-all ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                }`}
              >
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
