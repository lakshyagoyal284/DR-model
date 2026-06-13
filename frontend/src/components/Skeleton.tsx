import { motion } from "framer-motion";

/* ─── Base skeleton element ─── */

interface SkeletonBaseProps {
  className?: string;
  style?: React.CSSProperties;
}

function SkeletonBase({ className = "", style }: SkeletonBaseProps) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-gray-200/70 ${className}`}
      style={style}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{ translateX: ["-100%", "200%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

/* ─── Composed shapes ─── */

function Line({ width = "100%", className = "" }: { width?: string; className?: string }) {
  return <SkeletonBase className={`h-3 rounded-full ${className}`} style={{ width }} />;
}

function Heading({ className = "" }: { className?: string }) {
  return <SkeletonBase className={`h-6 w-48 rounded-lg ${className}`} />;
}

function Avatar({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeMap = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14" };
  return <SkeletonBase className={`${sizeMap[size]} rounded-xl ${className}`} />;
}

function Card({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white/80 rounded-2xl border border-gray-200/70 overflow-hidden ${className}`}>
      <div className="p-5 space-y-4">
        <SkeletonBase className="h-10 w-10 rounded-xl" />
        <SkeletonBase className="h-8 w-24 rounded-lg" />
        <SkeletonBase className="h-4 w-36 rounded-full" />
      </div>
    </div>
  );
}

function Bar({ className = "" }: { className?: string }) {
  return <SkeletonBase className={`h-4 rounded-full ${className}`} />;
}

function TableRow({ columns = 3, className = "" }: { columns?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 rounded-full ${i === 0 ? "w-8" : i === columns - 1 ? "w-20" : "flex-1"}`}
        />
      ))}
    </div>
  );
}

/* ─── Page-specific skeletons ─── */

function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar />
        <div className="space-y-2">
          <Heading />
          <Line width="12rem" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} />
        ))}
      </div>

      {/* Grade distribution chart skeleton */}
      <div className="bg-white/80 rounded-2xl border border-gray-200/70 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <SkeletonBase className="h-5 w-40 rounded-lg" />
        </div>
        <div className="p-6 space-y-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-3">
                <SkeletonBase className="h-4 w-24 rounded-full" />
                <SkeletonBase className="h-4 w-8 rounded-full ml-auto" />
              </div>
              <SkeletonBase className="h-4 w-full rounded-full" style={{ width: `${100 - i * 12}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function History() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar />
        <div className="space-y-2">
          <Heading />
          <Line width="14rem" />
        </div>
      </div>

      {/* Search bar */}
      <SkeletonBase className="h-12 w-full rounded-2xl" />

      {/* Table */}
      <div className="bg-white/80 rounded-2xl border border-gray-200/70 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-200/60 bg-gray-50/80">
          {["#", "Grade", "Confidence", "Patient ID", "Notes", "Report"].map((_, i) => (
            <SkeletonBase
              key={i}
              className={`h-3 rounded-full ${i === 0 ? "w-6" : i === 5 ? "w-16 ml-auto" : "flex-1"}`}
            />
          ))}
        </div>

        {/* Data rows */}
        <div className="p-5 space-y-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i} columns={6} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Report() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-10 w-24 rounded-xl" />
        <SkeletonBase className="h-10 w-32 rounded-xl" />
      </div>

      {/* Report card */}
      <div className="bg-white rounded-2xl border border-gray-200/70 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gray-50 border-b-4 border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonBase className="h-7 w-7 rounded-lg" />
              <SkeletonBase className="h-7 w-56 rounded-lg" />
            </div>
            <SkeletonBase className="h-7 w-28 rounded-full" />
          </div>
          <div className="flex gap-6">
            <SkeletonBase className="h-4 w-40 rounded-full" />
            <SkeletonBase className="h-4 w-48 rounded-full" />
            <SkeletonBase className="h-4 w-32 rounded-full" />
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Image comparison skeleton */}
          <div className="space-y-4">
            <SkeletonBase className="h-5 w-48 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl overflow-hidden">
                <SkeletonBase className="h-10 w-full rounded-none" />
                <SkeletonBase className="h-48 w-full rounded-none" />
              </div>
              <div className="border rounded-xl overflow-hidden">
                <SkeletonBase className="h-10 w-full rounded-none" />
                <SkeletonBase className="h-48 w-full rounded-none" />
              </div>
            </div>
          </div>

          {/* Diagnosis summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                <SkeletonBase className="h-3 w-16 rounded-full" />
                <SkeletonBase className="h-7 w-24 rounded-lg" />
                <SkeletonBase className="h-4 w-full rounded-full" />
              </div>
            ))}
          </div>

          {/* Clinical findings */}
          <div className="space-y-4">
            <SkeletonBase className="h-5 w-32 rounded-lg" />
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <div className="space-y-2">
                <SkeletonBase className="h-4 w-20 rounded-full" />
                <SkeletonBase className="h-4 w-full rounded-full" />
                <SkeletonBase className="h-4 w-5/6 rounded-full" />
                <SkeletonBase className="h-4 w-4/6 rounded-full" />
              </div>
              <div className="border-l-4 border-gray-300 bg-gray-100 rounded-r-lg p-3 space-y-2">
                <SkeletonBase className="h-4 w-28 rounded-full" />
                <SkeletonBase className="h-4 w-full rounded-full" />
                <SkeletonBase className="h-4 w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Export ─── */

const Skeleton = Object.assign(SkeletonBase, {
  Line,
  Heading,
  Avatar,
  Card,
  Bar,
  TableRow,
  Dashboard,
  History,
  Report,
});

export default Skeleton;
