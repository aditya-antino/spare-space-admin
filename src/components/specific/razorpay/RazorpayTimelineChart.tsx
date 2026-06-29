import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BaseChart } from "@/components";
import { RazorpayTimelineItem } from "@/utils/services/razorpay.services";

interface RazorpayTimelineChartProps {
  timeline: RazorpayTimelineItem[];
  loading?: boolean;
  error?: boolean;
}

const LINE_CONFIG = [
  { key: "captured", label: "Captured", color: "#16a34a" },
  { key: "pending", label: "Pending Payments", color: "#C98D02" },
  { key: "failed", label: "Failed", color: "#dc2626" },
  { key: "refunded", label: "Refunded", color: "#7c3aed" },
] as const;

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  // Check if standard YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const dateObj = new Date(dateStr);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }
  }
  // Direct label (e.g. "Week of Apr 12", "Jun 2026")
  return dateStr;
};

function RazorpayTimelineChart({
  timeline,
  loading = false,
  error = false,
}: RazorpayTimelineChartProps) {
  const [focusKey, setFocusKey] = useState<string | null>(null);

  const chartData = (timeline || []).map((item) => ({
    date: formatDate(item.date),
    captured: item.captured?.amount || 0,
    pending: item.created?.amount || 0,
    failed: item.failed?.amount || 0,
    refunded: item.refunded?.amount || 0,
  }));

  const isEmpty = !loading && !error && chartData.length === 0;

  return (
    <BaseChart
      title="Payment Timeline"
      loading={loading}
      error={error}
      empty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#C8C8C8" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#333333" }}
            stroke="#A8A8A8"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#333333" }}
            stroke="#A8A8A8"
            tickFormatter={(value) =>
              value >= 1000 ? `₹${(value / 1000).toFixed(0)}K` : `₹${value}`
            }
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const config = LINE_CONFIG.find((c) => c.key === name);
              return [
                `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                config?.label || name,
              ];
            }}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #C8C8C8",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            onClick={(e) => {
              if (e && e.dataKey) {
                const clickedKey = String(e.dataKey);
                setFocusKey((prev) => (prev === clickedKey ? null : clickedKey));
              }
            }}
            style={{ cursor: "pointer" }}
            formatter={(value) => {
              const config = LINE_CONFIG.find((c) => c.key === value);
              const isHighlighted = focusKey === null || focusKey === value;
              return (
                <span
                  style={{
                    fontSize: 12,
                    color: isHighlighted ? "#333" : "#aaa",
                    textDecoration: isHighlighted ? "none" : "line-through",
                    fontWeight: focusKey === value ? "bold" : "normal",
                    cursor: "pointer",
                  }}
                >
                  {config?.label || value}
                </span>
              );
            }}
          />
          {LINE_CONFIG.map(({ key, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
              hide={focusKey !== null && focusKey !== key}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </BaseChart>
  );
}

export default RazorpayTimelineChart;
