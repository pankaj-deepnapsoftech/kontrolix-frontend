//@ts-nocheck
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  // ✅ Navigation handler — handles Home separately
  const handleNavigate = (label) => {
    if (label === "Home") {
      navigate("/");
    } else {
      navigate(`/${label.toLowerCase()}`);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div className="bg-gradient-to-b from-white via-blue-50/95 to-white/90 backdrop-blur-xl shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Mobile Menu Button (Left side) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </motion.button>

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer flex-shrink-0"
              onClick={() => navigate("/")}
            >
              <img src="/DeepnapLogo.png" alt="Itsybizz Logo" className="h-20 w-auto" />
              {/* <p
                className="text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-500 
                bg-clip-text text-transparent tracking-wide drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]
                hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300 select-none"
              >
                ITSYBIZZ
              </p> */}
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-row gap-4 font-medium items-center">
              {["Home", "About", "Pricing", "Services", "Contact"].map((label) => (
                <motion.button
                  key={label}
                  onClick={() => handleNavigate(label)}
                  whileHover={{ scale: 1.05, color: "#1e40af" }}
                  whileTap={{ scale: 0.95 }}
                  className="text-blue-700 hover:text-blue-900 transition px-4 py-2 rounded-lg relative group"
                >
                  {label}
                </motion.button>
              ))}

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
                }}
                onClick={() => navigate("/login")}
                whileTap={{ scale: 0.95 }}
                className="ml-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold rounded-full px-6 py-2.5 shadow-lg hover:shadow-xl transition"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE SLIDE-IN MENU ================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.4 }}
              className="fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-lg shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-blue-100">
                <p className="text-lg font-bold text-blue-800">Menu</p>
                <button
                  className="p-2 text-blue-700 hover:text-blue-900 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-col px-4 pt-4 space-y-3">
                {["Home", "About", "Pricing", "Services", "Contact"].map((label) => (
                  <motion.button
                    key={label}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate(label)}
                    className="text-left text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md font-medium transition"
                  >
                    {label}
                  </motion.button>
                ))}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold rounded-lg px-3 py-2.5 shadow-lg hover:shadow-xl transition"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
