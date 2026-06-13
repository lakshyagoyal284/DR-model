import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  FileText,
  ArrowRight,
  Sparkles,
  ImagePlus,
  RotateCcw,
  Eye,
  ScanLine,
  BrainCircuit,
  Crosshair,
} from "lucide-react";
import ImageUpload from "../components/ImageUpload";
import ResultCard from "../components/ResultCard";
import ConfidenceChart from "../components/ConfidenceChart";
import SegmentationOverlay from "../components/SegmentationOverlay";
import Confetti from "../components/Confetti";
import { uploadImage } from "../api/client";
import { useToast } from "../components/Toast";
import type { PredictionResult } from "../types";

export default function PredictPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleImage = (f: File, p: string) => {
    setFile(f);
    setPreview(p);
    setResult(null);
    setError(null);
  };

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const { addToast } = useToast();

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await uploadImage(file);
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setShowConfetti(true);
      addToast({
        type: "success",
        title: "Analysis complete",
        message: `DR Grade: ${data.class_name} — ${(data.confidence * 100).toFixed(1)}% confidence`,
        duration: 5000,
      });
      // Scroll to results after a brief delay
      scrollTimeoutRef.current = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err: any) {
      const msg = err.message || "Prediction failed";
      setError(msg);
      addToast({
        type: "error",
        title: "Analysis failed",
        message: msg,
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setShowConfetti(false);
  };

  // Floating hero icons with random positions
  const floatingIcons = useMemo(() =>
    [Eye, ScanLine, BrainCircuit, Crosshair, Activity].map((Icon, i) => ({
      id: i,
      Icon,
      x: [15, 75, 85, 25, 60][i],
      y: [20, 15, 70, 75, 45][i],
      size: [28, 24, 32, 22, 26][i],
      delay: [0, 0.5, 1, 0.3, 0.8][i],
      duration: [5, 7, 6, 8, 5.5][i],
      opacity: [0.08, 0.06, 0.1, 0.07, 0.09][i],
    })), []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Confetti celebration */}
      <Confetti active={showConfetti} duration={3500} />
      {/* Upload state — HERO SECTION */}
      {!preview && (
        <div className="relative">
          {/* Animated gradient background */}
          <div className="absolute inset-0 -mx-4 -mt-8 sm:-mx-6 sm:-mt-8 rounded-none sm:rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0 animate-gradient-shift opacity-60"
              style={{
                background: 'linear-gradient(-45deg, #eff6ff, #eef2ff, #f0fdf4, #f5f3ff, #ecfeff)',
                backgroundSize: '400% 400%',
              }}
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-grid-pattern" />
            {/* Radial glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-3xl" />

            {/* Floating icons */}
            {floatingIcons.map(({ id, Icon, x, y, size, delay, duration, opacity }) => (
              <motion.div
                key={id}
                className="absolute pointer-events-none"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  opacity,
                }}
                animate={{
                  y: [0, -12, 4, -6, 0],
                  rotate: [0, 3, -2, 1, 0],
                }}
                transition={{
                  duration,
                  delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Icon size={size} className="text-blue-600/40" />
              </motion.div>
            ))}
          </div>

          {/* Hero content */}
          <div className="relative z-10 pt-8 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-8"
            >
              {/* Pill badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm mb-5"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-semibold text-blue-700">
                  AI-Powered Retinal Screening
                </span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
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
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
              >
                Upload a fundus retinal image and get instant AI-powered
                DR grading, lesion segmentation, and printable clinical reports.
              </motion.p>
            </motion.div>

            {/* Quick info cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
            >
              <div className="group flex items-center gap-3 px-4 py-3.5 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">AI-Powered</p>
                  <p className="text-[11px] text-gray-400">Instant DR grading</p>
                </div>
              </div>
              <div className="group flex items-center gap-3 px-4 py-3.5 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Segmentation</p>
                  <p className="text-[11px] text-gray-400">Lesion overlay maps</p>
                </div>
              </div>
              <div className="group flex items-center gap-3 px-4 py-3.5 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Reports</p>
                  <p className="text-[11px] text-gray-400">Printable PDF reports</p>
                </div>
              </div>
            </motion.div>

            {/* Upload area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <ImageUpload onImageSelected={handleImage} loading={loading} />
            </motion.div>

            {/* Trust/Stats bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center"
            >
              <div>
                <p className="text-lg font-bold text-gray-800">5</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">DR Grades</p>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div>
                <p className="text-lg font-bold text-gray-800">98%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Accuracy</p>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div>
                <p className="text-lg font-bold text-gray-800">&lt;3s</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Analysis Time</p>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div>
                <p className="text-lg font-bold text-gray-800">PDF</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Export Reports</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Preview & actions */}
      {preview && !result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200/70 bg-gray-50 shadow-soft group">
            <img
              src={preview}
              alt="Fundus preview"
              className="w-full max-h-[400px] object-contain"
            />
            {/* Gradient fade at bottom for button */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-white hover:shadow-md transition-all flex items-center gap-1.5 border border-white/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change image
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing retinal image…
              </>
            ) : (
              <>
                Analyze Image
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/70 rounded-2xl flex items-start gap-3 animate-fade-in-down shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Analysis failed</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultRef} className="mt-8 space-y-6 animate-fade-in">
          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Analysis Results</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/report/${result.id}`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200/50 active:scale-[0.97]"
              >
                <FileText className="w-4 h-4" />
                View Full Report
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white/80 border border-gray-200/60 rounded-xl hover:text-gray-700 hover:bg-white hover:border-gray-300 transition-all active:scale-[0.97]"
              >
                New analysis
              </button>
            </div>
          </div>

          {/* Results grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="animate-fade-in-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
              <ResultCard result={result} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
              <ConfidenceChart scores={result.scores} />
            </div>
          </div>

          {/* Segmentation overlay with slide-in */}
          {result.overlay && (
            <div className="animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
              <SegmentationOverlay original={preview!} overlay={result.overlay} />
            </div>
          )}

          {/* Image preview in results */}
          {preview && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-5 shadow-soft animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Image</h3>
              <img
                src={preview}
                alt="Uploaded fundus"
                className="w-full max-h-48 object-contain rounded-xl border border-gray-200"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
