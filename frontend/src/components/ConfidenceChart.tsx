import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  scores: Record<string, number>;
}

const GRADE_META = [
  { color: "#22c55e", label: "No DR" },
  { color: "#eab308", label: "Mild" },
  { color: "#f97316", label: "Moderate" },
  { color: "#ef4444", label: "Severe" },
  { color: "#7c3aed", label: "Proliferative" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; confidence: number; fill: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-xl px-4 py-3 shadow-soft-lg">
      <p className="text-xs font-medium text-gray-500 mb-1">{data.name}</p>
      <p className="text-lg font-bold" style={{ color: data.fill }}>
        {data.confidence.toFixed(1)}%
      </p>
    </div>
  );
}

export default function ConfidenceChart({ scores }: Props) {
  const data = Object.entries(scores).map(([name, value], i) => ({
    name,
    confidence: +(value * 100).toFixed(1),
    fill: GRADE_META[i]?.color || "#94a3b8",
  }));

  // Find the highest confidence
  const maxConfidence = Math.max(...data.map((d) => d.confidence));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/70 p-5 shadow-soft">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Per-Class Confidence</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            unit="%"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar
            dataKey="confidence"
            radius={[8, 8, 0, 0]}
            maxBarSize={48}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                opacity={entry.confidence === maxConfidence ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.fill, opacity: entry.confidence === maxConfidence ? 1 : 0.6 }}
            />
            <span className="text-[11px] text-gray-500">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
