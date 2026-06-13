import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Eye, FileWarning } from "lucide-react";

interface Props {
  onImageSelected: (file: File, preview: string) => void;
  loading: boolean;
}

export default function ImageUpload({ onImageSelected, loading }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG or PNG).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Image size must be under 20 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onImageSelected(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Upload label — separate from error */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={`
          relative flex flex-col items-center justify-center w-full h-72 sm:h-80
          border-2 border-dashed rounded-2xl cursor-pointer
          transition-all duration-300 group
          ${dragOver
            ? "border-blue-500 bg-blue-50/80 shadow-glow"
            : "border-gray-300/70 hover:border-blue-400/70 bg-white/70 hover:bg-white hover:shadow-soft"
          }
          ${loading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={loading}
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          aria-describedby={error ? "upload-error" : undefined}
        />

        {/* Background dot pattern */}
        <div className="absolute inset-0 rounded-2xl opacity-[0.03] bg-dot-pattern" />

        {loading ? (
          /* Loading skeleton */
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 animate-pulse flex items-center justify-center">
              <Eye className="w-7 h-7 text-blue-400" />
            </div>
            <div className="space-y-2 text-center">
              <div className="h-4 w-40 bg-gray-200 rounded-full animate-pulse mx-auto" />
              <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse mx-auto" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-400 z-10">
            {/* Icon container */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              dragOver
                ? "bg-blue-100 scale-110"
                : "bg-gray-100/80 group-hover:bg-blue-50 group-hover:scale-105"
            }`}>
              {dragOver ? (
                <ImageIcon className="w-7 h-7 text-blue-500" />
              ) : (
                <Upload className="w-7 h-7 text-gray-400 group-hover:text-blue-500 transition-colors" />
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-500">
                {dragOver ? (
                  <span className="text-blue-600">Drop image here</span>
                ) : (
                  <>
                    <span className="text-blue-600 font-semibold">Click to upload</span>
                    {" "}or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-400">
                Fundus retinal images &middot; JPG, PNG up to 20 MB
              </p>
            </div>

            {/* Supported image hint */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                JPEG
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                PNG
              </span>
            </div>
          </div>
        )}
      </label>

      {/* Error message — outside label for accessibility */}
      {error && (
        <div
          id="upload-error"
          role="alert"
          className="flex items-center gap-2 px-4 py-2.5 bg-red-50/80 border border-red-200 rounded-xl animate-fade-in-down"
        >
          <FileWarning className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
