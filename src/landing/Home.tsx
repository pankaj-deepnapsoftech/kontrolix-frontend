//@ts-nocheck
import React from "react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div id="home" className="relative w-full">
      
      {/* Background Image */}
      <img
        src="/landingPhoto.png"
        alt="Main Navigation"
        className="w-full h-[90vh] object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Text Section */}
      <div className="absolute inset-0 flex justify-center items-center px-4 text-center">
        
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.05, textShadow: "0px 0px 12px rgba(255,255,255,0.7)" }}
          className="text-white font-semibold max-w-3xl leading-relaxed
          text-2xl sm:text-4xl md:text-5xl cursor-pointer select-none"
        >
          Transform your manufacturing with intelligent automation—  
          creating workflows that move faster, smarter, and perfectly in sync.
        </motion.p>

      </div>
    </div>
  );
}
