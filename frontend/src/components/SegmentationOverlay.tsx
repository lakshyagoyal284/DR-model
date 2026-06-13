import { useState, useRef, useCallback } from "react";
import { MoveHorizontal, ZoomIn } from "lucide-react";

interface Props {
  original: string;
  overlay: string | null;
}

export default function SegmentationOverlay({ original, overlay }: Props) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!overlay) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-5 shadow-soft">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <ZoomIn className="w-4 h-4 text-blue-500" />
          Lesion Segmentation
        </h3>
        <div className="w-full h-48 flex items-center justify-center bg-gray-50/80 rounded-xl border border-dashed border-gray-300">
          <p className="text-sm text-gray-400">Segmentation mask not available</p>
        </div>
      </div>
    );
  }

  const overlaySrc = `data:image/png;base64,${overlay}`;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-5 shadow-soft overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <ZoomIn className="w-4 h-4 text-blue-500" />
        Lesion Segmentation
      </h3>

      {/* Before / After Slider */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 select-none bg-gray-100"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={(e) => {
          if (!isDragging || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const touch = e.touches[0];
          const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
          setSliderPos((x / rect.width) * 100);
        }}
        onTouchEnd={handleMouseUp}
      >
        {/* Full overlay image (visible on the right side) */}
        <img
          src={overlaySrc}
          alt="Lesion segmentation overlay"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />

        {/* Original image (clipped to left side) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={original}
            alt="Original fundus"
            className="absolute top-0 left-0 w-full h-full object-contain"
            draggable={false}
            style={{ maxWidth: "none" }}
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 z-10 cursor-ew-resize"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
        >
          {/* Line */}
          <div
            className={`absolute top-0 bottom-0 left-1/2 w-0.5 transition-colors ${
              isDragging ? "bg-blue-500" : "bg-white"
            }`}
          />
          {/* Handle circle */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isDragging
                ? "bg-blue-500 scale-110"
                : "bg-white/90 hover:bg-white hover:scale-105"
            }`}
          >
            <MoveHorizontal className={`w-5 h-5 ${isDragging ? "text-white" : "text-gray-600"}`} />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white/90 text-[10px] font-medium px-2 py-1 rounded-md">
          Original
        </div>
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white/90 text-[10px] font-medium px-2 py-1 rounded-md">
          Segmentation
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 italic flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Drag the slider to compare original fundus with lesion segmentation overlay. Red regions indicate detected lesions.
      </p>
    </div>
  );
}
