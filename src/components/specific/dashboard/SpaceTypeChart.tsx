import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { BaseChart } from "../../index";

interface SpaceTypeData {
  name: string;
  value: number;
}

interface SpaceTypeChartProps {
  data: SpaceTypeData[];
  loading?: boolean;
  error?: boolean;
}

const CHART_COLORS = ["#F7CD29", "#C98D02"];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SpaceTypeData;
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #C8C8C8",
          borderRadius: "8px",
          padding: "8px 12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold" }}>{data.name}</p>
        <p style={{ margin: "4px 0 0 0" }}>
          <span style={{ fontWeight: "bold" }}>{data.value}</span> bookings
        </p>
        <p style={{ margin: "2px 0 0 0", color: "#666" }}>({percentage}%)</p>
      </div>
    );
  }
  return null;
};

const SpaceTypeChart = ({
  data,
  loading = false,
  error = false,
}: SpaceTypeChartProps) => {
  const isEmpty = !loading && !error && data.length === 0;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <BaseChart
      title="Bookings by Space Type"
      loading={loading}
      error={error}
      empty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => {
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(0) : "0";
              return `${name} ${percentage}%`;  
            }}
            outerRadius={80}
            innerRadius={40}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                style={{ fontSize: "12px" }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default SpaceTypeChart;
