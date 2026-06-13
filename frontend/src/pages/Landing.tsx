import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Activity,
  BarChart2,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  FileText,
  ScanLine,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    to: "/predict",
    icon: Activity,
    title: "DR Detection",
    desc: "Upload fundus images for instant AI-powered diabetic retinopathy grading and lesion segmentation.",
    gradient: "from-blue-600 to-indigo-600",
    shadow: "shadow-blue-200/50",
    badge: "AI-Powered",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    to: "/dashboard",
    icon: BarChart2,
    title: "Dashboard",
    desc: "View screening statistics, grade distribution analytics, and track detection trends over time.",
    gradient: "from-violet-600 to-indigo-600",
    shadow: "shadow-violet-200/50",
    badge: "Analytics",
    badgeClass: "bg-violet-100 text-violet-700",
  },
  {
    to: "/history",
    icon: Clock,
    title: "History",
    desc: "Browse, search, and filter past screening results. Access detailed reports for any prediction.",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-200/50",
    badge: "Records",
    badgeClass: "bg-amber-100 text-amber-700",
  },
];

const STATS = [
  { value: "5", label: "DR Grades", icon: ScanLine },
  { value: "98%", label: "Accuracy", icon: Shield },
  { value: "<3s", label: "Analysis", icon: Zap },
  { value: "PDF", label: "Reports", icon: FileText },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-blue-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 text-center relative z-10">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-blue-700">
              AI Model Active — Ready for Screening
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
          >
            <span className="text-gray-900">Diabetic Retinopathy</span>
            <br />
            <span className="text-gradient-hero-light">Detection System</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            An advanced AI-powered platform for automated DR screening, lesion segmentation,
            and comprehensive clinical reporting. Upload a fundus image and get results in seconds.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate("/predict")}
              className="group relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 active:scale-[0.98] flex items-center gap-2.5"
            >
              <Sparkles className="w-5 h-5" />
              Start Screening
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3.5 bg-white/80 border border-gray-200/70 text-gray-700 rounded-2xl font-semibold text-base hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2"
            >
              <BarChart2 className="w-5 h-5 text-violet-500" />
              View Dashboard
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12"
          >
            {STATS.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/70 border border-gray-200/60 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">{stat.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Everything you need for DR screening
            </h2>
            <p className="text-sm text-gray-400">
              Three powerful tools in one unified platform
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.to}
                  onClick={() => navigate(feature.to)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.1, duration: 0.5 }}
                  className="group relative text-left bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] w-full"
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.shadow} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Badge */}
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${feature.badgeClass} mb-2`}
                  >
                    {feature.badge}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-800 mb-1.5">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{feature.desc}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                    Go to {feature.title}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-gray-400">
            Powered by deep learning · Upload a fundus image to get started
          </p>
        </motion.div>
      </div>
    </div>
  );
}
