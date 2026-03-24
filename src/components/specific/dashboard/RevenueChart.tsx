import { BookingStatsData } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BaseChart, TimeRangeDropdown } from "../../index";

interface RevenueChartProps {
  data: BookingStatsData;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  loading?: boolean;
  error?: boolean;
}

function RevenueChart({
  data,
  timeRange,
  onTimeRangeChange,
  loading = false,
  error = false,
}: RevenueChartProps) {
  const currentData = data[timeRange as keyof BookingStatsData] || [];

  const xAxisKey = timeRange === "daily" ? "date" : "period";

  const isEmpty = !loading && !error && currentData.length === 0;

  const filterComponent = (
    <TimeRangeDropdown value={timeRange} onValueChange={onTimeRangeChange} />
  );

  return (
    <BaseChart
      title="Revenue Trend"
      loading={loading}
      error={error}
      empty={isEmpty}
      filterComponent={filterComponent}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={currentData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#C8C8C8" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: "#333333" }}
            stroke="#A8A8A8"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#333333" }}
            stroke="#A8A8A8"
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            formatter={(value: number) => [
              `₹${value.toLocaleString()}`,
              "Revenue",
            ]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #C8C8C8",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#C98D02"
            fill="#C98D02"
            name="Revenue"
            strokeWidth={2}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChart>
  );
}

export default RevenueChart;
