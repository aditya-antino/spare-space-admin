import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BaseChart } from "../../index";
import { ActivityBookingData } from "@/types";

interface ActivityChartProps {
  data: ActivityBookingData[];
  loading?: boolean;
  error?: boolean;
}

const ActivityChart = ({
  data,
  loading = false,
  error = false,
}: ActivityChartProps) => {
  const isEmpty = !loading && !error && data.length === 0;

  return (
    <BaseChart
      title="Bookings by Activity Type"
      loading={loading}
      error={error}
      empty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#C8C8C8" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#333333" }}
            stroke="#A8A8A8"
          />
          <YAxis
            type="category"
            dataKey="activityName"
            width={80}
            tick={{ fontSize: 12, fill: "#333333" }}
            stroke="#A8A8A8"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #C8C8C8",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="bookingCount" fill="#F7CD29" name="Bookings" />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default ActivityChart;
