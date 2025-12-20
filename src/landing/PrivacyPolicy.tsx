//@ts-nocheck
import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Who We Are",
      text: "Our website address is: https://deepnapsoftech.com. We value your privacy and are committed to protecting your personal information.",
    },
    {
      title: "2. Comments",
      text: "When visitors leave comments on the site, we collect the data shown in the comments form, along with the visitor’s IP address and browser user agent string to help with spam detection. An anonymized string (hash) created from your email address may be provided to the Gravatar service to check if you are using it. The Gravatar service privacy policy is available at https://deepnapsoftech.com/policy. After approval, your profile picture is visible to the public alongside your comment.",
    },
    {
      title: "3. Media",
      text: "If you upload images to the website, please avoid uploading images with embedded location data (EXIF GPS). Visitors can download and extract location data from images on the website.",
    },
    {
      title: "4. Cookies",
      text: "If you leave a comment, you may opt-in to saving your name, email, and website in cookies for convenience. These cookies last one year. When you log in, we set cookies to save your login information and display preferences. Login cookies last for two days, and screen options cookies for a year. If you select “Remember Me”, your login persists for two weeks. Logging out removes login cookies.",
    },
    {
      title: "5. Embedded Content from Other Websites",
      text: "Articles on this site may include embedded content (e.g., videos, images, articles, etc.). Such content behaves exactly as if the visitor has visited the other website. These external websites may collect data, use cookies, embed third-party tracking, and monitor your interaction with that content.",
    },
    {
      title: "6. Who We Share Your Data With",
      text: "If you request a password reset, your IP address will be included in the reset email.",
    },
    {
      title: "7. How Long We Retain Your Data",
      text: "Comments and their metadata are retained indefinitely to recognize and approve follow-ups automatically. For registered users, we store personal information in their user profiles, which they can view, edit, or delete anytime (except usernames). Website administrators can also edit that information.",
    },
    {
      title: "8. What Rights You Have Over Your Data",
      text: "If you have an account or left comments, you can request an exported file of the personal data we hold about you, including data you’ve provided. You can also request deletion of your personal data, except for information we must retain for legal or security reasons.",
    },
    {
      title: "9. Where Your Data Is Sent",
      text: "Visitor comments may be checked through an automated spam detection service.",
    },
  ];

  return (
    <section className="min-h-screen mt-5 bg-gradient-to-br from-blue-50 to-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold text-blue-900 text-center mb-10"
        >
          Privacy Policy
        </motion.h1>

        {/* Intro Paragraph */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-blue-700 text-center max-w-3xl mx-auto mb-12 text-lg leading-relaxed"
        >
          At Deepnap Softech, we take your privacy seriously. This Privacy Policy
          explains how we collect, use, and safeguard your information when you
          visit our website.
        </motion.p>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                {section.title}
              </h2>
              <p className="text-blue-700 leading-relaxed">{section.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
