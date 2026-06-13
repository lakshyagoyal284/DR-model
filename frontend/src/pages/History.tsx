import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { fetchHistory } from "../api/client";
import Skeleton from "../components/Skeleton";
import type { PredictionResult } from "../types";

const GRADE_BADGES = [
  "bg-green-100 text-green-700 border-green-300",
  "bg-yellow-100 text-yellow-700 border-yellow-300",
  "bg-orange-100 text-orange-700 border-orange-300",
  "bg-red-100 text-red-700 border-red-300",
  "bg-purple-100 text-purple-700 border-purple-300",
];

const GRADE_ICONS = ["🟢", "🟡", "🟠", "🔴", "🟣"];

const ITEMS_PER_PAGE = 15;

export default function History() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchHistory()
      .then((r) => r.json())
      .then((data) => setPredictions(data.predictions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? predictions.filter(
        (p) =>
          p.class_name.toLowerCase().includes(search.toLowerCase()) ||
          (p.patient_id &&
            p.patient_id.toLowerCase().includes(search.toLowerCase())) ||
          p.id.toString().includes(search)
      )
    : predictions;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (loading) {
    return <Skeleton.History />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in-down">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">History</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Review past screening predictions
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6 animate-fade-in-up">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by ID, patient ID, or grade…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/70 rounded-2xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all shadow-soft"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3 animate-fade-in-up">
        <p className="text-xs text-gray-400">
          {filtered.length === 0
            ? "No results"
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}${search ? ` for "${search}"` : ""}`}
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 shadow-soft overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200/60">
                <th className="text-left px-5 py-3.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="text-left px-5 py-3.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="text-left px-5 py-3.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wider">Patient ID</th>
                <th className="text-left px-5 py-3.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="text-right px-5 py-3.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wider">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Inbox className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {search ? "No matching results" : "No predictions yet"}
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        {search
                          ? "Try a different search term"
                          : "Upload a fundus image to get started"}
                      </p>
                      {!search && (
                        <button
                          onClick={() => navigate("/predict")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-200/50 active:scale-[0.97]"
                        >
                          Go to Predict
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50/40 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4 text-gray-400 text-xs tabular-nums">{p.id}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${GRADE_BADGES[p.grade]}`}
                      >
                        {GRADE_ICONS[p.grade]} {p.class_name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${(p.confidence * 100).toFixed(1)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 tabular-nums">
                          {(p.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs font-mono">
                      {p.patient_id || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-5 py-4 text-gray-500 max-w-[180px] truncate text-xs">
                      {p.notes || <span className="text-gray-300 italic">No notes</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/report/${p.id}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200/80 text-gray-600 rounded-xl text-xs font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm hover:shadow group-hover:shadow-md active:scale-[0.97]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/50 border-t border-gray-200/60">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200/70 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200/70 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
