import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

/* ─── Types ─── */

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
}

/* ─── Context ─── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/* ─── Helpers ─── */

let toastCounter = 0;
function generateId() {
  toastCounter += 1;
  return `toast-${toastCounter}-${Date.now()}`;
}

/* ─── Config per type ─── */

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    containerClass: "bg-green-50 border-green-200",
    iconClass: "text-green-500",
    titleClass: "text-green-800",
    messageClass: "text-green-600",
  },
  error: {
    icon: XCircle,
    containerClass: "bg-red-50 border-red-200",
    iconClass: "text-red-500",
    titleClass: "text-red-800",
    messageClass: "text-red-600",
  },
  info: {
    icon: Info,
    containerClass: "bg-blue-50 border-blue-200",
    iconClass: "text-blue-500",
    titleClass: "text-blue-800",
    messageClass: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-amber-50 border-amber-200",
    iconClass: "text-amber-500",
    titleClass: "text-amber-800",
    messageClass: "text-amber-600",
  },
};

/* ─── Provider ─── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">): string => {
      const id = generateId();
      const fullToast: Toast = { ...toast, id };
      setToasts((prev) => [...prev, fullToast]);

      const duration = toast.duration ?? 4000;
      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

/* ─── Container ─── */

function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = TYPE_CONFIG[toast.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className={`pointer-events-auto max-w-sm w-[360px] rounded-2xl border shadow-soft-lg backdrop-blur-sm ${config.containerClass}`}
            >
              <div className="flex items-start gap-3 p-4">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconClass}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${config.titleClass}`}>
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className={`text-xs mt-0.5 ${config.messageClass}`}>
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
