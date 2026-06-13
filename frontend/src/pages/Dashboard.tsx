import { useEffect, useState } from "react";
import {
  BarChart2,
  Eye,
  AlertTriangle,
  Activity,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { fetchHistory } from "../api/client";
import Skeleton from "../components/Skeleton";
import AnimatedCounter from "../components/AnimatedCounter";
import type { PredictionResult } from "../types";

const GRADE_LABELS = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];
const GRADE_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444", "#7c3aed"];

export default function Dashboard() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory(1, 100)
      .then((r) => r.json())
      .then((data) => setPredictions(data.predictions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = predictions.length;
  const gradeDist = Array.from({ length: 5 }, (_, i) =>
    predictions.filter((p) => p.grade === i).length
  );
  const severeCases = gradeDist[3] + gradeDist[4];
  const severePct = total > 0 ? ((severeCases / total) * 100).toFixed(1) : "0";

  // Skeleton loading
  if (loading) {
    return <Skeleton.Dashboard />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in-down">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
          <BarChart2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Overview of all screening results
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-5 shadow-soft hover:shadow-soft-lg transition-all animate-fade-in-up group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Total</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-800">
            <AnimatedCounter to={total} duration={1.5} />
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Scans Analyzed</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-5 shadow-soft hover:shadow-soft-lg transition-all animate-fade-in-up group" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Normal</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-800">
            <AnimatedCounter to={gradeDist[0]} duration={1.5} />
          </p>
          <p className="text-sm text-gray-500 mt-1">No DR Detected</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-5 shadow-soft hover:shadow-soft-lg transition-all animate-fade-in-up group" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Severe</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-800">
            <AnimatedCounter to={severeCases} duration={1.5} />
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Severe + Proliferative (<AnimatedCounter to={Number(severePct)} decimals={1} duration={1.5} suffix="%" />)
          </p>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 shadow-soft overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-700">Grade Distribution</h3>
            </div>
            {total > 0 && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200/60">
                {total} total
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {total === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <BarChart2 className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No screening data available yet</p>
            </div>
          ) : (
            GRADE_LABELS.map((name, i) => {
              const pct = total ? (gradeDist[i] / total) * 100 : 0;
              const isSevere = i >= 3;
              return (
                <div key={i} className="group">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="w-24 text-sm font-medium text-gray-600 truncate">
                      {name}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto tabular-nums">
                      {gradeDist[i]}
                    </span>
                    <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-100/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(to right, ${GRADE_COLORS[i]}dd, ${GRADE_COLORS[i]})`,
                      }}
                    >
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legend footer */}
        {total > 0 && (
          <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">
            <div className="flex flex-wrap gap-4">
              {GRADE_LABELS.map((name, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: GRADE_COLORS[i] }}
                  />
                  <span className="text-[11px] text-gray-500">{name}</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-1 text-[11px] text-gray-400">
                <ChevronRight className="w-3 h-3" />
                <span>Hover bars for detail</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
