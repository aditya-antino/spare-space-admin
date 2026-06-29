import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, CalendarClock, History, ArrowDownToLine, AlertTriangle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SettlementDetailsData {
  todaysSettlement: number;
  tomorrowsSettlement: number;
  previousSettlement: {
    amount: number;
    date: string;
  };
}

interface RazorpaySettlementWidgetProps {
  data: SettlementDetailsData;
  totalSettled: number;
  settlementCount: number;
  failedAmount: number;
  failedCount: number;
  loading?: boolean;
  error?: boolean;
}

const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function RazorpaySettlementWidget({
  data,
  totalSettled,
  settlementCount,
  failedAmount,
  failedCount,
  loading = false,
  error = false,
}: RazorpaySettlementWidgetProps) {
  const items = [
    {
      label: "Total Settled",
      value: formatINR(totalSettled || 0),
      sub: `${settlementCount} settlement(s)`,
      icon: ArrowDownToLine,
      color: "text-primary-p3",
      bg: "bg-primary-tint4",
      tooltip: null,
    },
    {
      label: "Failed Settlements",
      value: formatINR(failedAmount || 0),
      sub: `${failedCount} failed settlement(s)`,
      icon: AlertTriangle,
      color: "text-danger-d1",
      bg: "bg-danger-tint1/20",
      tooltip: "Funds that bounced when Razorpay tried to deposit them. Please verify your bank account details or check the failed history table for the exact reason.",
    },
    {
      label: "Today's Settlement",
      value: formatINR(data?.todaysSettlement || 0),
      sub: "",
      icon: CalendarCheck,
      color: "text-green-600",
      bg: "bg-green-50",
      tooltip: "Settlements operate on a T+2 schedule. If this is 0, the banking partner has not yet finalized today's batch deposit.",
    },
    {
      label: "Tomorrow's Settlement",
      value: formatINR(data?.tomorrowsSettlement || 0),
      sub: "",
      icon: CalendarClock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      tooltip: "Estimated funds to be deposited into your bank account on the next working business day.",
    },
    {
      label: "Previous Settlement",
      value: formatINR(data?.previousSettlement?.amount || 0),
      sub: data?.previousSettlement?.date
        ? `on ${formatDate(data.previousSettlement.date)}`
        : "",
      icon: History,
      color: "text-tertiary-t2",
      bg: "bg-secondary-s2",
      tooltip: null,
    },
  ];

  return (
    <Card className="border-secondary-s2 bg-secondary-s1">
      <CardHeader>
        <CardTitle className="text-tertiary-t1">Settlement Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary-s2/40"
                >
                  <Skeleton className="h-10 w-10 rounded-lg bg-secondary-s2 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-32 bg-secondary-s2" />
                    <Skeleton className="h-6 w-24 bg-secondary-s2" />
                  </div>
                </div>
              ))
            : items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary-s2/40 hover:bg-secondary-s2/70 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${item.bg} shrink-0`}>
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <div className="text-xs text-tertiary-t3 font-medium flex items-center gap-1">
                        {item.label}
                        {item.tooltip && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-tertiary-t3/70 hover:text-tertiary-t1 cursor-pointer inline-flex">
                                <Info className="h-3 w-3" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-xs bg-primary-tint3 text-primary-foreground p-2 rounded shadow-lg border border-secondary-s2">
                              {item.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-lg font-bold text-tertiary-t1">
                        {item.value}
                      </p>
                      {item.sub && (
                        <p className="text-xs text-tertiary-t3">{item.sub}</p>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}

export default RazorpaySettlementWidget;
