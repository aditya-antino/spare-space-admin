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
import { BaseChart, TimeRangeDropdown } from "../../index";

interface BookingChartProps {
  data: any;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  loading?: boolean;
  error?: boolean;
}

const BookingChart = ({
  data,
  timeRange,
  onTimeRangeChange,
  loading = false,
  error = false,
}: BookingChartProps) => {
  const currentData = data[timeRange] || [];
  const isEmpty = !loading && !error && currentData.length === 0;

  const filterComponent = (
    <TimeRangeDropdown value={timeRange} onValueChange={onTimeRangeChange} />
  );

  return (
    <BaseChart
      title="Bookings Trend"
      loading={loading}
      error={error}
      empty={isEmpty}
      filterComponent={filterComponent}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={currentData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#C8C8C8" />
          <XAxis
            dataKey={timeRange === "daily" ? "date" : "period"}
            tick={{ fontSize: 11, fill: "#333" }}
            stroke="#A8A8A8"
            interval={0}
            angle={-30}
            textAnchor="end"
            height={100}
            dy={10}
            tickMargin={10}
          />

          <YAxis tick={{ fontSize: 12, fill: "#333333" }} stroke="#A8A8A8" />
          <Tooltip />
          <Legend />
          <Bar dataKey="bookings" fill="#F7CD29" name="Bookings" />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default BookingChart;
