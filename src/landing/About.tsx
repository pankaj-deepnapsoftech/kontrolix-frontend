//@ts-nocheck
import { motion } from "framer-motion";
import { TrendingUp, Zap, Factory, ShieldCheck } from "lucide-react"; // optional: for stat icons

export default function AboutSection() {
  const stats = [
    { label: "Realtime Productions Tracked", value: 12000, icon: TrendingUp },
    { label: "Automation Triggers Executed", value: 48000, icon: Zap },
    { label: "Active Manufacturing Units", value: 650, icon: Factory },
    { label: "Uptime Accuracy", value: "99.9%", icon: ShieldCheck },
  ];

  return (
    <section
      id="about"
      className="relative min-h-[100vh] w-full bg-gradient-to-br from-white to-blue-50 flex flex-col justify-center items-center px-6 py-24"
    >
      {/* Blue glow background overlays */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        className="absolute w-[450px] h-[450px] bg-blue-400 rounded-full blur-3xl -top-32 -left-24"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.11 }}
        className="absolute w-[320px] h-[320px] bg-blue-200 rounded-full blur-3xl bottom-4 right-0"
      />

      {/* Content */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} // ✅ animate only once
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold text-center max-w-3xl mb-3 text-blue-800 drop-shadow"
      >
        <span className="block">Empowering Manufacturing</span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-400 to-blue-600">
          With Realtime Automation
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} // ✅ animate only once
        transition={{ delay: 0.3, duration: 0.9 }}
        className="text-blue-600 max-w-xl text-center mt-4 text-lg"
      >
        Elevate your production efficiency with our intelligent automation
        suite. Enjoy{" "}
        <span className="font-semibold text-blue-700">
          streamlined workflow, instant monitoring,
        </span>{" "}
        and smarter decision systems—all in a cloud-native, scalable toolkit for
        modern manufacturers.
      </motion.p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} // ✅ only first time
            transition={{ delay: i * 0.18, duration: 0.7 }}
            className="bg-white/90 backdrop-blur-[2px] px-8 py-7 rounded-2xl shadow-xl..."
          >
            {stat.icon && (
              <span className="mx-auto mb-3 flex justify-center items-center">
                <stat.icon className="w-8 h-8 text-sky-500" />
              </span>
            )}
            <motion.h2
              initial={{ scale: 0.7 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }} // ✅ only once
              transition={{ type: "spring", stiffness: 80, delay: i * 0.14 }}
              className="text-3xl md:text-4xl font-extrabold text-blue-800"
            >
              {stat.value}
            </motion.h2>
            <p className="text-blue-600 text-base mt-2 font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
