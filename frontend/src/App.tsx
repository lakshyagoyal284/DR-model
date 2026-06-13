import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, BarChart2, Clock, Eye, Menu, X, Home } from "lucide-react";
import Landing from "./pages/Landing";
import PredictPage from "./pages/PredictPage";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ReportPage from "./pages/ReportPage";
import { ToastProvider } from "./components/Toast";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, desc: "Welcome page", end: true },
  { to: "/predict", label: "Predict", icon: Activity, desc: "Analyze fundus images" },
  { to: "/dashboard", label: "Dashboard", icon: BarChart2, desc: "View screening stats" },
  { to: "/history", label: "History", icon: Clock, desc: "Browse past results" },
];

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-white/95 backdrop-blur-xl border-r border-gray-200/70
          flex flex-col
          transition-transform duration-300 ease-out
          shadow-soft-lg
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:z-30
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 shrink-0">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-lg group-hover:shadow-blue-300/50 transition-shadow">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-lg group-hover:from-blue-500 group-hover:to-indigo-500 transition-all">
              DR Detector
            </span>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, desc, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50/50 text-blue-700 shadow-sm border border-blue-100/80"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/60"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-200"
                        : "bg-gray-100/80 group-hover:bg-gray-200/60"
                    }`}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isActive ? "text-gray-800" : ""}`}>
                      {label}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{desc}</p>
                  </div>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Status */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-700">AI Model Active</p>
              <p className="text-[10px] text-gray-400">Ready for analysis</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/** Page transition wrapper using framer-motion */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Top bar shown only on mobile (< lg) with hamburger + brand */
function MobileTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 lg:hidden bg-white/80 backdrop-blur-lg border-b border-gray-200/60 supports-[backdrop-filter]:bg-white/70">
      <div className="flex items-center h-14 px-4 gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-base">
            DR Detector
          </span>
        </div>
      </div>
    </header>
  );
}

/** Animated mesh gradient background */
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50" />

      {/* Floating gradient orbs */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
        animate={{
          x: [0, 60, -30, 40, 0],
          y: [0, -40, 50, -20, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        animate={{
          x: [0, -50, 30, -20, 0],
          y: [0, 30, -40, 20, 0],
          scale: [1, 0.9, 1.05, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -bottom-1/4 left-1/3 w-[550px] h-[550px] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
        animate={{
          x: [0, 40, -20, -50, 0],
          y: [0, -30, 40, -10, 0],
          scale: [1, 1.05, 0.9, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute top-2/3 -left-1/6 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
        animate={{
          x: [0, -30, 50, -20, 0],
          y: [0, 20, -30, 40, 0],
          scale: [1, 0.95, 1.1, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10" />
    </div>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleClose = useCallback(() => setSidebarOpen(false), []);
  const handleOpen = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="min-h-screen flex relative">
      {/* Animated mesh gradient background */}
      <AnimatedBackground />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={handleClose} />

      {/* Mobile top bar */}
      <MobileTopBar onMenuClick={handleOpen} />

      {/* Main content with page transitions */}
      <main className="flex-1 min-h-screen lg:ml-64 pt-0 lg:pt-0 relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Landing />
                </PageTransition>
              }
            />
            <Route
              path="/predict"
              element={
                <PageTransition>
                  <PredictPage />
                </PageTransition>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              }
            />
            <Route
              path="/history"
              element={
                <PageTransition>
                  <History />
                </PageTransition>
              }
            />
            <Route
              path="/report/:id"
              element={
                <PageTransition>
                  <ReportPage />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  );
}
