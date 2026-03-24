import { CommissionStatsData } from "@/types"; // Changed from BookingStatsData
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

interface CommissionChartProps {
  data: CommissionStatsData;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  loading?: boolean;
  error?: boolean;
}

function CommissionChart({
  data,
  timeRange,
  onTimeRangeChange,
  loading = false,
  error = false,
}: CommissionChartProps) {
  const currentData = data[timeRange as keyof CommissionStatsData] || []; 

  const xAxisKey = timeRange === "daily" ? "date" : "period";

  const isEmpty = !loading && !error && currentData.length === 0;

  const filterComponent = (
    <TimeRangeDropdown value={timeRange} onValueChange={onTimeRangeChange} />
  );

  return (
    <BaseChart
      title="Commission Trend"
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
              "Commission",
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
            dataKey="commission" 
            stroke="#C98D02"
            fill="#C98D02"
            name="Commission"
            strokeWidth={2}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChart>
  );
}

export default CommissionChart;
