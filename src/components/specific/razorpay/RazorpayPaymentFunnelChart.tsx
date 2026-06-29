import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BaseChart } from "@/components";

interface PaymentFunnelData {
  captured: { amount: number; count: number };
  created: { amount: number; count: number };
  failed: { amount: number; count: number };
  refunded: { amount: number; count: number };
}

interface RazorpayPaymentFunnelChartProps {
  data: PaymentFunnelData;
  loading?: boolean;
  error?: boolean;
}

const COLORS = {
  captured: "#16a34a",
  created: "#C98D02",
  failed: "#dc2626",
  refunded: "#7c3aed",
};

function RazorpayPaymentFunnelChart({
  data,
  loading = false,
  error = false,
}: RazorpayPaymentFunnelChartProps) {
  const chartData = [
    {
      name: "Captured",
      amount: data?.captured?.amount || 0,
      count: data?.captured?.count || 0,
      fill: COLORS.captured,
    },
    {
      name: "Pending Payments",
      amount: data?.created?.amount || 0,
      count: data?.created?.count || 0,
      fill: COLORS.created,
    },
    {
      name: "Failed",
      amount: data?.failed?.amount || 0,
      count: data?.failed?.count || 0,
      fill: COLORS.failed,
    },
    {
      name: "Refunded",
      amount: data?.refunded?.amount || 0,
      count: data?.refunded?.count || 0,
      fill: COLORS.refunded,
    },
  ];

  const isEmpty =
    !loading && !error && chartData.every((d) => d.amount === 0 && d.count === 0);

  return (
    <BaseChart
      title="Payment Funnel"
      loading={loading}
      error={error}
      empty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#C8C8C8" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#333333" }}
            stroke="#A8A8A8"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#333333" }}
            stroke="#A8A8A8"
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === "amount"
                ? `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                : value,
              name === "amount" ? "Amount" : "Count",
            ]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #C8C8C8",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Count pills below chart */}
      <div className="flex gap-3 flex-wrap mt-3">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5 bg-secondary-s2/50 rounded-full px-3 py-1"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs text-tertiary-t3">
              {item.name}:{" "}
              <span className="font-semibold text-tertiary-t1">
                {item.count} txn
              </span>
            </span>
          </div>
        ))}
      </div>
    </BaseChart>
  );
}

export default RazorpayPaymentFunnelChart;
