import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PARTICLE_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f97316", // orange
];

const PARTICLE_SHAPES = ["circle", "square", "star"] as const;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  shape: string;
  rotation: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export default function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [isVisible, setIsVisible] = useState(false);

  const particles = useMemo<Particle[]>(() => {
    if (!active) return [];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: -(Math.random() * 400 + 100),
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      shape: PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)],
      rotation: Math.random() * 720 - 360,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.3,
      duration: Math.random() * 1.5 + 1.5,
      drift: (Math.random() - 0.5) * 200,
    }));
  }, [active]);

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [active, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
          {particles.map((p) =>
            p.shape === "star" ? (
              <motion.div
                key={p.id}
                className="absolute"
                style={{ left: "50%", top: "50%" }}
                initial={{ x: 0, y: 0, rotate: 0, scale: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  rotate: p.rotation,
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <svg
                  width={p.size * 1.5}
                  height={p.size * 1.5}
                  viewBox="0 0 20 20"
                  fill={p.color}
                >
                  <path d="M10 0l2.5 7.5L20 10l-7.5 2.5L10 20l-2.5-7.5L0 10l7.5-2.5L10 0z" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key={p.id}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  width: p.size,
                  height: p.shape === "circle" ? p.size : p.size,
                  borderRadius: p.shape === "circle" ? "9999px" : "2px",
                  backgroundColor: p.color,
                }}
                initial={{ x: 0, y: 0, rotate: 0, scale: 0 }}
                animate={{
                  x: p.x + p.drift,
                  y: p.y,
                  rotate: p.rotation,
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            )
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
