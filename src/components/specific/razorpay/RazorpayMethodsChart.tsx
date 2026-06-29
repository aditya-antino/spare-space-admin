import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MethodItem {
  amount: number;
  count: number;
}

interface RazorpayMethodsChartProps {
  methods: Record<string, MethodItem>;
  loading?: boolean;
  error?: boolean;
}

const COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#7c3aed", // violet-600
  "#ea580c", // orange-600
  "#db2777", // pink-600
  "#ca8a04", // yellow-600
];

const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function RazorpayMethodsChart({
  methods = {},
  loading = false,
  error = false,
}: RazorpayMethodsChartProps) {
  const methodEntries = Object.entries(methods || {});
  const totalAmount = methodEntries.reduce((acc, [_, val]) => acc + (val?.amount || 0), 0);

  const pieData = methodEntries
    .map(([key, val]) => {
      const amount = val?.amount || 0;
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      // Format method name beautifully (e.g. netbanking -> Netbanking)
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      return {
        name,
        value: amount,
        count: val?.count || 0,
        percentage,
      };
    })
    .filter((item) => item.value > 0); // Only display methods with volume

  const isEmpty = !loading && !error && pieData.length === 0;

  return (
    <Card className="border-secondary-s2 bg-secondary-s1">
      <CardHeader>
        <CardTitle className="text-tertiary-t1">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full bg-secondary-s2 rounded-lg" />
            <Skeleton className="h-4 w-40 bg-secondary-s2" />
            <Skeleton className="h-4 w-32 bg-secondary-s2" />
          </div>
        ) : isEmpty ? (
          <div className="h-[200px] flex items-center justify-center text-tertiary-t3 text-sm">
            No payment methods data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    const payload = props.payload;
                    return [
                      `${formatINR(value)} (${payload.percentage.toFixed(1)}%)`,
                      name,
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #C8C8C8",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-secondary-s2 flex items-center justify-between">
              <span className="text-sm text-tertiary-t3 font-medium">
                Total Volume
              </span>
              <span className="text-lg font-bold text-tertiary-t1">
                {formatINR(totalAmount)}
              </span>
            </div>

            <div className="mt-2 space-y-1.5">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-xs text-tertiary-t3">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {item.name}
                    <span className="text-[10px] text-tertiary-t3 opacity-75">
                      ({item.count} tx)
                    </span>
                  </span>
                  <span className="font-medium text-tertiary-t1">
                    {formatINR(item.value)}
                    <span className="ml-1 text-[10px] text-primary-p3">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default RazorpayMethodsChart;
