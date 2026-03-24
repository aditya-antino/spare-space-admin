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
import { CityData } from "@/types";

interface CityChartProps {
  data: CityData[];
  loading?: boolean;
  error?: boolean;
}

const CityChart = ({
  data,
  loading = false,
  error = false,
}: CityChartProps) => {
  const isEmpty = !loading && !error && data.length === 0;

  return (
    <BaseChart
      title="Bookings by City"
      loading={loading}
      error={error}
      empty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#C8C8C8" />
          <XAxis
            dataKey="cityName"
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
          <Bar dataKey="bookingCount" fill="#F7CD29" name="Bookings" />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default CityChart;
