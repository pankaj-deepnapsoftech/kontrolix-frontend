//@ts-nocheck
import React, { useEffect, useState } from "react";
import ScrollReveal from "scrollreveal";
import { FaPhone, FaRegFileCode, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { TbDeviceLandlinePhone } from "react-icons/tb";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import contactGif from "../assets/contactUs.gif";

// Add custom styles for animations
const customStyles = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

const Contact = () => {
  const [contact, setContact] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    queries: "",
    city: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const token = localStorage.getItem("user");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/contact/fillcontact`,
          {}, // Empty object as request body (if needed)
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (Array.isArray(response.data)) {
          setContact(response.data);
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (err) {
        console.error("Fetching users failed:", err.response?.data || err.message);
      }
    };

    getUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.queries || !formData.city) {
      setMessage("All fields are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/contact/fillcontact`,
        formData
      );

      if (response.status === 200) {
        setMessage("Your message has been sent successfully!");
        toast.success("Your message has been sent successfully!");
        setFormData({ name: "", email: "", phone: "", queries: "", city: "" }); // Clear form
      } else {
        setMessage("Failed to send message. Please try again.");
      }
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const cardsContent = [
    {
      title: "Address",
      description:
        "Plot No. 121B, 2nd floor, Sector-31, HSIIDC, Faridabad, Haryana 121003",
      icon: <FaMapMarkerAlt className="w-10 h-10 text-blue-500" />,
      link: "https://maps.google.com/?q=Plot+No.+121B,+2nd+floor,+Sector-31,+HSIIDC,+Faridabad,+Haryana+121003",
      action: "View on Map"
    },
    {
      title: "Phone Number",
      description: "91-9205404075 , 91-9205404076",
      icon: <FaPhone className="w-10 h-10 text-blue-500" />,
      link: "tel:919205404075",
      action: "Call Now"
    },
    {
      title: "Email",
      description: "support@itsybizz.com",
      icon: <MdEmail className="w-10 h-10 text-blue-500" />,
      link: "mailto:support@itsybizz.com",
      action: "Send Email"
    },
    {
      title: "Telephone",
      description: "0129-400-1529",
      icon: <TbDeviceLandlinePhone className="w-10 h-10 text-blue-500" />,
      link: "tel:01294001529",
      action: "Call Now"
    },
  ];

  useEffect(() => {
    const sr = ScrollReveal();
    const elements = document.querySelectorAll(".reveal");
    if (elements.length > 0) {
      sr.reveal(elements, {
        distance: "50px",
        duration: 800,
        delay: 100,
        opacity: 0,
        scale: 0.85,
        easing: "ease-in-out",
      });
    }

    // Inject custom styles
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="min-h-screen mt-5 bg-gradient-to-br from-gray-50 via-white to-gray-100 max-w-[2480px] mx-auto">
      {/* Header Section */}
      <div className="w-full h-auto min-h-[300px] md:min-h-[480px] 2xl:min-h-[600px] relative grid md:grid-cols-2 gap-4 md:gap-2 grid-cols-1 px-4 sm:px-5 2xl:px-8 py-12 md:py-24 2xl:py-32 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="col-span-1 flex items-center justify-center md:justify-start relative z-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-purple-500 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-lg mt-4 text-gray-600 text-sm sm:text-base max-w-md leading-relaxed">
              Your goals matter to us. Whether you're starting a new venture, need custom solutions, or simply have a question—we're here to listen, collaborate, and build something remarkable together. Let's start the conversation today.
            </p>
          </div>
        </div>
        <div className="col-span-1 flex justify-center items-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <img
              src={contactGif}
              alt="Contact Us"
              className="relative w-[200px] h-[150px] sm:w-[250px] sm:h-[180px] md:w-[400px] md:h-[300px] lg:w-[500px] lg:h-[400px] drop-shadow-2xl rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Quick Contact Icons - Visible on All Screens */}
      <motion.div 
        className="flex justify-center items-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex gap-6">
          <motion.a
            href="tel:917042707091"
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Call Us: 91-7042707091"
            viewport={{ once: true }}
          >
            <FaPhone className="w-6 h-6" />
          </motion.a>
          
          <motion.a
            href="mailto:support@itsybizz.com"
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            viewport={{ once: true }}
            title="Send Email: support@itsybizz.com"
          >
            <FaEnvelope className="w-6 h-6" />
          </motion.a>
          
          <motion.a
            href="https://maps.google.com/?q=Plot+No.+121B,+2nd+floor,+Sector-31,+HSIIDC,+Faridabad,+Haryana+121003"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            viewport={{ once: true }}
            title="View on Map"
          >
            <FaMapMarkerAlt className="w-6 h-6" />
          </motion.a>
        </div>
      </motion.div>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[2480px] mx-auto px-4 sm:px-6 2xl:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Information Cards */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 reveal">
              {cardsContent.map((card, index) => (
                <motion.div
                  key={index}
                  viewport={{ once: true }}
                  className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl flex flex-col items-center text-center transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 border border-gray-100 hover:border-green-200 relative overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Card background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Card content */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                      <div className="relative">
                        {card.icon}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-green-700 transition-colors duration-300 mb-2">
                      {card.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {card.description}
                    </p>
                    
                    {/* Action Button */}
                    <motion.a
                      href={card.link}
                      viewport={{ once: true }}
                      target={card.link.includes('maps.google.com') ? "_blank" : "_self"}
                      rel={card.link.includes('maps.google.com') ? "noopener noreferrer" : ""}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {card.action}
                    </motion.a>
                  </div>
                  
                  {/* Card shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.div 
            viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-2xl reveal border border-gray-100 relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Form background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-30"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Get In Touch
                </h2>

                {message && (
                  <motion.div 
                  viewport={{ once: true }}
                    className={`mb-6 p-4 rounded-lg ${
                      message.includes("Error") 
                        ? "bg-red-50 border border-red-200 text-red-700" 
                        : "bg-green-50 border border-green-200 text-green-700"
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-semibold">{message}</p>
                  </motion.div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div 
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      />
                    </motion.div>
                    <motion.div 
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      />
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div 
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <input
                        type="text"
                        name="phone"
                        placeholder="Enter Your Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      />
                    </motion.div>
                    <motion.div 
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <input
                        type="text"
                        name="city"
                        placeholder="Enter Your City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      />
                    </motion.div>
                  </div>

                  {/* Queries Section */}
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <textarea
                      name="queries"
                      placeholder="Write your queries here..."
                      value={formData.queries}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Send Message"
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;