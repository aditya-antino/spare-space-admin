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
import { BaseChart, TimeRangeDropdown } from "../../index";

interface GrowthData {
  period: string;
  hosts: number;
  guests: number;
}

interface GrowthChartProps {
  data: {
    daily: GrowthData[];
    weekly: GrowthData[];
    monthly: GrowthData[];
    yearly: GrowthData[];
  };
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  loading?: boolean;
  error?: boolean;
}

const GrowthChart = ({
  data,
  timeRange,
  onTimeRangeChange,
  loading = false,
  error = false,
}: GrowthChartProps) => {
  const currentData = data[timeRange as keyof typeof data] || [];

  const isEmpty = !loading && !error && currentData.length === 0;

  const filterComponent = (
    <TimeRangeDropdown value={timeRange} onValueChange={onTimeRangeChange} />
  );

  return (
    <BaseChart
      title="Host & Guest Growth"
      loading={loading}
      error={error}
      empty={isEmpty}
      filterComponent={filterComponent}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={currentData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#C8C8C8" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12, fill: "#333333" }}
            stroke="#A8A8A8"
          />
          <YAxis tick={{ fontSize: 12, fill: "#333333" }} stroke="#A8A8A8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #C8C8C8",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="hosts"
            stroke="#F7CD29"
            strokeWidth={3}
            name="Hosts"
            dot={{ fill: "#F7CD29" }}
          />
          <Line
            type="monotone"
            dataKey="guests"
            stroke="#C98D02"
            strokeWidth={3}
            name="Guests"
            dot={{ fill: "#C98D02" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default GrowthChart;
