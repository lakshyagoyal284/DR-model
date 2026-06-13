import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Printer,
  ArrowLeft,
  Calendar,
  User,
  Activity,
  AlertCircle,
  Loader2,
  ZoomIn,
} from "lucide-react";
import { fetchPrediction } from "../api/client";
import ConfidenceChart from "../components/ConfidenceChart";
import Skeleton from "../components/Skeleton";
import type { PredictionResult } from "../types";

/** Fallback placeholder when an image fails to load */
function ImgFallback({ label }: { label: string }) {
  return (
    <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded-lg">
      {label}
    </div>
  );
}

/** Clinical report text per DR grade — informative for patients & practitioners */
const CLINICAL_NOTES: Record<string, { summary: string; recommendation: string }> = {
  "No DR": {
    summary:
      "No signs of diabetic retinopathy detected. The retina appears healthy with no evidence of microaneurysms, hemorrhages, or exudates.",
    recommendation:
      "Continue annual dilated eye examinations. Maintain good glycemic control (HbA1c < 7%), blood pressure management, and regular follow-ups with your endocrinologist.",
  },
  Mild: {
    summary:
      "Mild non-proliferative diabetic retinopathy (NPDR) detected. Early signs include microaneurysms, which are small bulges in retinal blood vessels.",
    recommendation:
      "Schedule a follow-up examination in 6–12 months. Optimize blood glucose control, monitor blood pressure, and consider a comprehensive dilated eye exam annually. Early intervention can slow progression.",
  },
  Moderate: {
    summary:
      "Moderate non-proliferative diabetic retinopathy (NPDR) observed. There is evidence of microaneurysms, hemorrhages, and hard exudates affecting retinal blood vessels.",
    recommendation:
      "Follow up in 3–6 months. Strict glycemic control is critical. Consider referral to a retinal specialist. A dilated fundus examination and optical coherence tomography (OCT) may be indicated to assess for macular edema.",
  },
  Severe: {
    summary:
      "Severe non-proliferative diabetic retinopathy (NPDR) detected. Widespread retinal hemorrhages, venous beading, and intraretinal microvascular abnormalities (IRMA) are present.",
    recommendation:
      "URGENT: Refer to a retinal specialist within 1 month. Consider panretinal photocoagulation (PRP) laser therapy. Strict blood glucose and blood pressure control are essential. Must be monitored every 3 months to prevent progression to proliferative DR.",
  },
  Proliferative: {
    summary:
      "Proliferative diabetic retinopathy (PDR) detected. Abnormal new blood vessels (neovascularization) have formed on the retina, which can lead to vitreous hemorrhage and tractional retinal detachment.",
    recommendation:
      "EMERGENT REFERRAL: Immediate consultation with a retinal specialist is required. Panretinal photocoagulation (PRP) and/or anti-VEGF intravitreal injections (e.g., ranibizumab, aflibercept) are typically indicated. Close follow-up every 1–3 months is mandatory.",
  },
};

const GRADE_BADGE_COLORS = [
  "bg-green-100 text-green-800 border-green-300",
  "bg-yellow-100 text-yellow-800 border-yellow-300",
  "bg-orange-100 text-orange-800 border-orange-300",
  "bg-red-100 text-red-800 border-red-300",
  "bg-purple-100 text-purple-800 border-purple-300",
];

const GRADE_ACCENT = [
  "border-green-400",
  "border-yellow-400",
  "border-orange-400",
  "border-red-400",
  "border-purple-400",
];

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomedImg, setZoomedImg] = useState<{ data: string; label: string } | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPrediction(Number(id))
      .then(async (res) => {
        if (!res.ok) throw new Error("Report not found");
        const data = await res.json();
        setPrediction(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Skeleton.Report />;
  }

  if (error || !prediction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-fade-in">
        <div className="p-6 bg-red-50/80 backdrop-blur-sm border border-red-200/70 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Report not available</p>
            <p className="text-red-500 text-sm mt-1">{error || "Could not load prediction report."}</p>
            <button
              onClick={() => navigate("/history")}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
            >
              ← Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const notes = CLINICAL_NOTES[prediction.class_name] || CLINICAL_NOTES["No DR"];
  const gradeColor = GRADE_BADGE_COLORS[prediction.grade] || GRADE_BADGE_COLORS[0];
  const accentColor = GRADE_ACCENT[prediction.grade] || GRADE_ACCENT[0];
  const formattedDate = prediction.created_at
    ? new Date(prediction.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  // Build base64 data URIs for images
  // Using image/jpeg MIME — browsers sniff the actual format from magic bytes
  const originalSrc = prediction.image_data
    ? `data:image/jpeg;base64,${prediction.image_data}`
    : null;
  const overlaySrc = prediction.overlay
    ? `data:image/png;base64,${prediction.overlay}`
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 print:py-0 print:px-0 animate-fade-in">
      {/* Toolbar — hidden when printing */}
      <div className="flex items-center justify-between mb-6 print:hidden animate-fade-in-down">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 bg-white/80 border border-gray-200/60 px-3.5 py-2 rounded-xl transition-all hover:shadow-sm active:scale-[0.97]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200/50 hover:shadow-lg active:scale-[0.97]"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>

      {/* Report content */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden print:rounded-none print:border-0 print:shadow-none">
        {/* Report Header */}
        <div className={`border-b-4 ${accentColor} bg-gray-50 px-8 py-6 print:px-6 print:py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-7 h-7 text-blue-600 print:w-6 print:h-6" />
              <h1 className="text-2xl font-bold text-gray-800 print:text-xl">DR Screening Report</h1>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${gradeColor}`}>
              {prediction.class_name}
            </span>
          </div>
          <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Patient ID: {prediction.patient_id || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Report #{prediction.id}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 print:p-6 space-y-8">
          {/* Before / After Scan Comparison */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ZoomIn className="w-5 h-5 text-blue-500" />
              Retinal Scan Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Image — Before */}
              <div className="border rounded-xl overflow-hidden bg-gray-50">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-600">Before — Original Fundus</p>
                </div>
                {originalSrc && !imgErrors["original"] ? (
                  <div className="relative group">
                    <img
                      src={originalSrc}
                      alt="Original fundus"
                      className="w-full object-contain max-h-72 cursor-pointer"
                      onClick={() => setZoomedImg({ data: prediction.image_data!, label: "Original Fundus" })}
                      onError={() => setImgErrors((prev) => ({ ...prev, original: true }))}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white/0 group-hover:text-white/70 transition" />
                    </div>
                  </div>
                ) : (
                  <ImgFallback label={imgErrors["original"] ? "Failed to load image" : "Original image not available"} />
                )}
              </div>

              {/* Overlay — After */}
              <div className="border rounded-xl overflow-hidden bg-gray-50">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-600">After — Lesion Segmentation</p>
                </div>
                {overlaySrc && !imgErrors["overlay"] ? (
                  <div className="relative group">
                    <img
                      src={overlaySrc}
                      alt="Lesion overlay"
                      className="w-full object-contain max-h-72 cursor-pointer"
                      onClick={() => setZoomedImg({ data: prediction.overlay!, label: "Lesion Segmentation" })}
                      onError={() => setImgErrors((prev) => ({ ...prev, overlay: true }))}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white/0 group-hover:text-white/70 transition" />
                    </div>
                  </div>
                ) : (
                  <ImgFallback label={imgErrors["overlay"] ? "Failed to load overlay" : "Segmentation overlay not available"} />
                )}
              </div>
            </div>
            {prediction.overlay && !imgErrors["overlay"] && (
              <p className="text-xs text-gray-400 mt-2 italic">
                Red regions indicate detected lesions (microaneurysms, hemorrhages, exudates).
              </p>
            )}
          </section>

          {/* Diagnosis Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">DR Grade</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{prediction.class_name}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Confidence</p>
              <div className="mt-2">
                <div className="w-full bg-blue-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(prediction.confidence * 100).toFixed(1)}%` }}
                  />
                </div>
                <p className="text-right text-sm font-bold text-gray-800 mt-0.5">
                  {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Assessment</p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {prediction.grade === 0
                  ? "Normal — No referral needed"
                  : prediction.grade <= 2
                  ? "Non-proliferative — Monitor"
                  : "Severe — Urgent referral needed"}
              </p>
            </div>
          </section>

          {/* Confidence Scores */}
          <section>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Per-Class Confidence</h3>
            <ConfidenceChart scores={prediction.scores} />
          </section>

          {/* Clinical Report */}
          <section className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-700 mb-3">Clinical Findings</h3>
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Summary</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{notes.summary}</p>
              </div>
              <div className={`border-l-4 rounded-r-lg p-3 ${
                prediction.grade >= 3
                  ? "border-red-400 bg-red-50"
                  : prediction.grade >= 1
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-green-400 bg-green-50"
              }`}>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{notes.recommendation}</p>
              </div>
            </div>
          </section>

          {/* Patient Notes */}
          {prediction.notes && (
            <section className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Clinician Notes</h3>
              <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg p-3">
                {prediction.notes}
              </p>
            </section>
          )}

          {/* Footer */}
          <div className="border-t pt-4 text-xs text-gray-400 flex items-center justify-between print:mt-4">
            <span>DR Detection System — Report #{prediction.id}</span>
            <span>Generated {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-fade-in"
          onClick={() => setZoomedImg(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`data:image/jpeg;base64,${zoomedImg.data}`}
              alt={zoomedImg.label}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setZoomedImg(null)}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white hover:scale-105 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p className="absolute bottom-3 left-3 text-white/80 text-xs bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              {zoomedImg.label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
