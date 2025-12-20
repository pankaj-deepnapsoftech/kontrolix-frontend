//@ts-nocheck
import { motion } from "framer-motion";
import { 
  Cog, 
  Activity, 
  Factory, 
  Workflow, 
  CloudLightning, 
  ShieldCheck 
} from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      title: "Production Tracking",
      desc: "Monitor every step of your manufacturing in realtime with automated insights.",
      icon: Activity,
    },
    {
      title: "Workflow Automation",
      desc: "Eliminate manual work using no-code automation triggers tailored to your factory.",
      icon: Workflow,
    },
    {
      title: "Smart Manufacturing",
      desc: "AI-powered predictions to help you scale and optimize your plant capacity.",
      icon: Factory,
    },
    {
      title: "Cloud Sync & Backup",
      desc: "Instant data sync across all departments with secure cloud backups.",
      icon: CloudLightning,
    },
    {
      title: "Maintenance Alerts",
      desc: "Receive automated reminders and alerts for machine upkeep and downtime reduction.",
      icon: Cog,
    },
    {
      title: "Secure Infrastructure",
      desc: "99.9% uptime with enterprise-grade security & end-to-end encryption.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section
      id="services"
      className="relative w-full min-h-[100vh] bg-gradient-to-br from-blue-50 to-white py-24 px-6"
    >
      {/* Background Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        className="absolute w-[400px] h-[400px] bg-blue-300 rounded-full blur-3xl -top-20 -left-10"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        className="absolute w-[350px] h-[350px] bg-blue-200 rounded-full blur-3xl bottom-10 right-0"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}   // ✅ stops repeat on scroll
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-extrabold text-blue-900 text-center"
        >
          Our Services
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}   // ✅ stops repeat on scroll
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-blue-600 text-center max-w-2xl mx-auto mt-4 text-lg"
        >
          A complete automation ecosystem built to power modern manufacturing workflows.
        </motion.p>

        {/* Cards */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 mt-16">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}   // ✅ stops repeat on scroll
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ scale: 1.05, rotate: 0.5 }}
              className="group bg-white/80 border border-blue-200 backdrop-blur-xl p-8 rounded-3xl shadow-xl cursor-pointer 
              hover:shadow-2xl transition-all duration-300 hover:bg-white"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex justify-center items-center mb-6 
                group-hover:bg-blue-200 transition-all duration-300">
                <service.icon className="text-blue-700 w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                {service.title}
              </h3>

              <p className="text-blue-600">
                {service.desc}
              </p>

              {/* bottom accent line */}
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                viewport={{ once: true }}
                className="h-1 bg-blue-600 rounded-full mt-6"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
