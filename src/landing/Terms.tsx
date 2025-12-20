//@ts-nocheck
import React from "react";
import { motion } from "framer-motion";

export default function Terms() {
  const terms = [
    {
      title: "1. Scope of Services",
      text: "Deepnap Softech agrees to provide website design, development, and related services as outlined in the project proposal and agreement.",
    },
    {
      title: "2. Project Timeline",
      text: "We will provide an estimated timeline for the completion of the project, including milestones and deadlines. Any delays caused by the client's actions or failure to provide necessary materials may result in adjustments to the timeline.",
    },
    {
      title: "3. Payment Terms",
      text: "The client agrees to pay Deepnap Softech as per the payment structure outlined in the project agreement. This may include an upfront deposit and subsequent payments based on project milestones.",
    },
    {
      title: "4. Intellectual Property",
      text: "Upon full payment, the client will have ownership of the final website design. Deepnap Softech retains rights to any pre-existing materials and tools used during the project.",
    },
    {
      title: "5. Revisions and Changes",
      text: "The project includes a specified number of revisions. Additional revisions or significant scope changes may incur extra charges and extend the project timeline.",
    },
    {
      title: "6. Content and Materials",
      text: "The client is responsible for providing all necessary content, images, and materials for the project. Deepnap Softech is not responsible for copyright infringement related to client-provided materials.",
    },
    {
      title: "7. Client Responsibilities",
      text: "The client will provide timely feedback, necessary materials, and collaboration throughout the project. Delays caused by the client may result in project timeline adjustments.",
    },
    {
      title: "8. Confidentiality",
      text: "Both parties agree to maintain the confidentiality of any proprietary or sensitive information shared during the project.",
    },
    {
      title: "10. Warranty and Support",
      text: "Deepnap Softech provides 15 days post-launch support for bug fixes and minor updates. Major updates or changes may incur additional charges.",
    },
    {
      title: "11. Hosting and Maintenance",
      text: "If hosting and maintenance services are included, the terms and costs will be outlined in a separate agreement.",
    },
    {
      title: "12. Limitation of Liability",
      text: "Deepnap Softech is not liable for any damages arising from the use of the website. The client agrees to indemnify and hold Deepnap Softech harmless from any claims related to the website's content or functionality.",
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
          Terms & Conditions
        </motion.h1>

        {/* Intro Paragraph */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-blue-700 text-center max-w-3xl mx-auto mb-12 text-lg leading-relaxed"
        >
          Please read these Terms and Conditions carefully before using Deepnap Softech's services. 
          By engaging with our services, you agree to comply with and be bound by the terms below.
        </motion.p>

        {/* Terms List */}
        <div className="space-y-8">
          {terms.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                {item.title}
              </h2>
              <p className="text-blue-700 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        {/* <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-center text-sm text-blue-500 mt-16"
        >
          © 2025 Deepnap Softech. All Rights Reserved.
        </motion.p> */}
      </div>
    </section>
  );
}
