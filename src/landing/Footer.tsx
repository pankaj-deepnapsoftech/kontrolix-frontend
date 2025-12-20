//@ts-nocheck
import React from "react";
import { motion } from "framer-motion";
import {
  AiFillYoutube,
  AiFillInstagram,
  AiFillTwitterCircle,
} from "react-icons/ai";
import { BsFacebook } from "react-icons/bs";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";


const Footer = () => {
  const navigate = useNavigate();

  const socialLinks = [
    {
      icon: <BsFacebook />,
      to: "https://www.facebook.com/deepnapsoftech",
      label: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      icon: <AiFillInstagram />,
      to: "https://www.instagram.com/deepnapsoftech/",
      label: "Instagram",
      color: "hover:text-pink-600",
    },
    {
      icon: <AiFillTwitterCircle />,
      to: "https://twitter.com/deepnapsoftech",
      label: "Twitter",
      color: "hover:text-sky-500",
    },
    {
      icon: <AiFillYoutube />,
      to: "https://www.youtube.com/@deepnap_softech",
      label: "YouTube",
      color: "hover:text-red-600",
    },
  ];

  const developmentLinks = [
    { label: "Website Design", to: "/web-design" },
    { label: "Logo Design", to: "/logo-development" },
    { label: "Web Development", to: "/web-development" },
    { label: "Software Development", to: "/software" },
    { label: "App Development", to: "/app-dev" },
    { label: "CRM Development", to: "/crm-dev" },
  ];

  const marketingLinks = [
    { label: "Meta Ads", to: "/meta-ads" },
    { label: "Google Ads", to: "/google-ads" },
    { label: "Email Marketing", to: "/email-marketing" },
    { label: "Content Marketing", to: "/content-Marketing" },
    { label: "SEO & SEM", to: "/seo&smo" },
    { label: "PPC", to: "/ppc" },
  ];

  const brandLinks = [
    { label: "Brand Building", to: "/brand" },
    { label: "Public Relations", to: "/public-relation" },
    { label: "ORM", to: "/orm" },
    { label: "Digital Marketing", to: "/digital-marketing" },
    { label: "Influencer Marketing", to: "/influence" },
    { label: "Social Media Presence", to: "/socialmedia" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms" },
  ];

  return (
    <footer
      id="footer"
      className="relative pl-10 z-50 bg-gradient-to-br from-white via-blue-50 to-blue-100 text-blue-900 border-t border-blue-200"
    >
      {/* Floating background glow (looping, not inView) */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-[350px] h-[350px] bg-blue-300 rounded-full blur-3xl -top-32 -right-20 opacity-25 pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: 0.5 }}
        className="absolute w-[280px] h-[280px] bg-sky-200 rounded-full blur-3xl -bottom-16 -left-20 opacity-20 pointer-events-none"
      />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Logo & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}   // ✅ stops repeat animation
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer flex-shrink-0"
             onClick={() => navigate("/")}
            >
              <img src="/DeepnapLogo.png" alt="Itsybizz Logo" className="h-20 w-auto" />
            </motion.div>

            <p className="text-sm text-blue-600 mb-4 font-medium">Follow Us On</p>

            <div className="flex space-x-3">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  target="_blank"
                  rel="noreferrer"
                  href={link.to}
                  aria-label={link.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}   // ✅ stops repeat animation
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.25, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full bg-white shadow-lg text-blue-700 ${link.color} transition-all p-3 text-2xl`}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>

            <p className="text-xs text-blue-400 mt-6">© 2023 Deepnap Softech</p>
          </motion.div>

          {/* Link Sections */}
          {[
            { title: "Development", links: developmentLinks, route: "development" },
            { title: "Digital Marketing", links: marketingLinks, route: "digital-marketing" },
            { title: "Brand Services", links: brandLinks, route: "become-a-brand" },
            { title: "Resources", links: legalLinks, route: null },
          ].map((section, sectionIdx) => (
            <motion.div
              key={sectionIdx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}   // ✅ stops repeat animation
              transition={{ delay: sectionIdx * 0.12, duration: 0.6 }}
            >
              <p className="font-bold text-lg text-blue-800 mb-4">{section.title}</p>

              <nav className="flex flex-col space-y-2">
                {section.links.map((link, linkIdx) => (
                  <motion.a
                    key={linkIdx}
                    target="_blank"
                    rel="noreferrer"
                    href={
                      section.route
                        ? `https://www.deepnapsoftech.com/service/${section.route}${link.to}`
                        : link.to
                    }
                    initial={{ opacity: 0.7, x: -10 }}
                    whileHover={{ opacity: 1, x: 5 }}
                    viewport={{ once: true }}   // ✅ stops repeat animation
                    transition={{ duration: 0.2 }}
                    className="text-blue-600 hover:text-blue-900 font-medium text-sm flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    <span>{link.label}</span>
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}   // ✅ stops repeat animation
        transition={{ duration: 0.8 }}
        className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"
      />

      {/* Footer Bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}   // ✅ stops repeat animation
        transition={{ delay: 0.3, duration: 0.6 }}
        className="px-4 py-6 text-center bg-white/50 backdrop-blur-sm"
      >
        <p className="text-xs text-blue-500 font-medium">
          All rights reserved:{" "}
          <span className="text-blue-700 font-semibold">
            Itsybizz AI Pvt. Ltd.
          </span>
        </p>
        <p className="text-xs text-blue-400 mt-1">
          Crafted with <span className="text-red-500">❤️</span> for modern manufacturers
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
