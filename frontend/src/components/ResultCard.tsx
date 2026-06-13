import type { PredictionResult } from "../types";

const GRADE_CONFIG = [
  {
    badge: "bg-green-100 text-green-800 border-green-300",
    card: "from-green-50/80 to-emerald-50/30 border-green-200",
    accent: "#22c55e",
    gradient: "from-green-500 to-emerald-500",
    icon: "🟢",
  },
  {
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
    card: "from-yellow-50/80 to-amber-50/30 border-yellow-200",
    accent: "#eab308",
    gradient: "from-yellow-500 to-amber-500",
    icon: "🟡",
  },
  {
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    card: "from-orange-50/80 to-red-50/30 border-orange-200",
    accent: "#f97316",
    gradient: "from-orange-500 to-red-500",
    icon: "🟠",
  },
  {
    badge: "bg-red-100 text-red-800 border-red-300",
    card: "from-red-50/80 to-rose-50/30 border-red-200",
    accent: "#ef4444",
    gradient: "from-red-500 to-rose-500",
    icon: "🔴",
  },
  {
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    card: "from-purple-50/80 to-violet-50/30 border-purple-200",
    accent: "#7c3aed",
    gradient: "from-purple-500 to-violet-500",
    icon: "🟣",
  },
];

interface Props {
  result: PredictionResult;
}

export default function ResultCard({ result }: Props) {
  const cfg = GRADE_CONFIG[result.grade] || GRADE_CONFIG[0];
  const confidencePct = (result.confidence * 100).toFixed(1);

  return (
    <div
      className={`rounded-2xl border-2 p-6 bg-gradient-to-br ${cfg.card} shadow-soft transition-all duration-300 hover:shadow-soft-lg animate-fade-in-up`}
      style={{ animationDelay: "0.1s", animationFillMode: "both" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
          DR Grade
        </h3>
        <span
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${cfg.badge}`}
        >
          {cfg.icon} {result.class_name}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm text-gray-500 font-medium">Confidence</p>
          <p className="text-sm font-bold text-gray-700">{confidencePct}%</p>
        </div>
        <div className="w-full bg-gray-200/70 rounded-full h-3.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out"
            style={{
              width: `${confidencePct}%`,
              background: `linear-gradient(to right, ${cfg.accent}, ${cfg.accent}dd)`,
            }}
          />
        </div>
      </div>

      {/* Severity indicator */}
      <div className={`rounded-xl p-3 bg-white/50 border border-gray-100/80`}>
        <p className="text-xs text-gray-400 mb-1">Assessment</p>
        <p className="text-sm font-medium text-gray-700">
          {result.grade === 0
            ? "No referral needed — normal retina"
            : result.grade <= 2
            ? "Non-proliferative — schedule monitoring"
            : "Severe — urgent referral recommended"}
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        Prediction #{result.id}
      </p>
    </div>
  );
}
