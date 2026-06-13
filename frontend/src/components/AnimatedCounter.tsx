import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({
  to,
  duration = 1.2,
  decimals = 0,
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    // Reset for re-animation when `to` changes
    fromRef.current = 0;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (to - fromRef.current) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [to, duration]);

  return (
    <span className={className}>
      {displayValue.toFixed(decimals)}
      {suffix && (
        <span className="text-sm text-gray-400 ml-0.5">{suffix}</span>
      )}
    </span>
  );
}
