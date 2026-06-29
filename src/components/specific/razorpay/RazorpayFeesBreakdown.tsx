import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Info } from "lucide-react";
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeesData {
  baseFee: number;
  tax: number;
  totalDeducted: number;
}

interface RazorpayFeesBreakdownProps {
  data: FeesData;
  loading?: boolean;
  error?: boolean;
}

const COLORS = ["#C98D02", "#7c3aed"];

const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function RazorpayFeesBreakdown({
  data,
  loading = false,
  error = false,
}: RazorpayFeesBreakdownProps) {
  const pieData = [
    { name: "Base Fee", value: data?.baseFee || 0 },
    { name: "Tax", value: data?.tax || 0 },
  ];

  const isEmpty = !loading && !error && (data?.totalDeducted || 0) === 0;

  return (
    <Card className="border-secondary-s2 bg-secondary-s1">
      <CardHeader>
        <CardTitle className="text-tertiary-t1">Fees & Deductions</CardTitle>
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
            No fee data available
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
                <RechartsTooltip
                  formatter={(value: number) => [formatINR(value), ""]}
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
                Total Deducted
              </span>
              <span className="text-lg font-bold text-danger-d1">
                {formatINR(data?.totalDeducted || 0)}
              </span>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-tertiary-t3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C98D02]" />
                  Base Fee
                </span>
                <span className="font-medium text-tertiary-t1">
                  {formatINR(data?.baseFee || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-tertiary-t3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                  <span className="flex items-center gap-1">
                    Tax
                    <RadixTooltip>
                      <TooltipTrigger asChild>
                        <span className="text-tertiary-t3/70 hover:text-tertiary-t1 cursor-pointer inline-flex">
                          <Info className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] text-xs bg-primary-tint3 text-primary-foreground p-2 rounded shadow-lg border border-secondary-s2">
                        18% GST applied strictly to Razorpay's processing fee, not the total booking amount.
                      </TooltipContent>
                    </RadixTooltip>
                  </span>
                </span>
                <span className="font-medium text-tertiary-t1">
                  {formatINR(data?.tax || 0)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default RazorpayFeesBreakdown;
