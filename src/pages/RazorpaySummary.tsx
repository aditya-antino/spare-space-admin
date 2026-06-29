import { useEffect, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  CreditCard,
  Clock,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorBoundary } from "@/components";
import { handleApiError } from "@/hooks";
import {
  getRazorpayStats,
  RazorpayFilter,
  RazorpayStatsResponse,
} from "@/utils/services/razorpay.services";
import RazorpayStatsCard from "@/components/specific/razorpay/RazorpayStatsCard";
import RazorpaySettlementWidget from "@/components/specific/razorpay/RazorpaySettlementWidget";
import RazorpayFeesBreakdown from "@/components/specific/razorpay/RazorpayFeesBreakdown";
import RazorpaySettlementHistoryTable from "@/components/specific/razorpay/RazorpaySettlementHistoryTable";
import RazorpayTimelineChart from "@/components/specific/razorpay/RazorpayTimelineChart";
import RazorpayMethodsChart from "@/components/specific/razorpay/RazorpayMethodsChart";
import { TooltipProvider } from "@/components/ui/tooltip";

const FILTER_OPTIONS: { label: string; value: RazorpayFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "Last 90 Days", value: "last90" },
  { label: "All Time", value: "all" },
];

const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function RazorpaySummary() {
  const [filter, setFilter] = useState<RazorpayFilter>("last30");
  const [data, setData] = useState<RazorpayStatsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (selectedFilter: RazorpayFilter) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRazorpayStats(selectedFilter);
      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to load Razorpay data");
      }
    } catch (err) {
      setError("Failed to load Razorpay data");
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  const handleFilterChange = (value: string) => {
    setFilter(value as RazorpayFilter);
  };

  const handleRefresh = () => {
    fetchData(filter);
  };

  const kpiCards = [
    {
      title: "Available Balance",
      value: loading ? "—" : formatINR(data?.overview?.availableBalance || 0),
      subValue: "Ready for withdrawal",
      icon: Wallet,
      tooltip: "Funds currently held securely in your Razorpay wallet waiting to be settled to your bank.",
    },
    {
      title: "Captured Payments",
      value: loading ? "—" : formatINR(data?.payments?.captured?.amount || 0),
      subValue: `${data?.payments?.captured?.count || 0} transaction(s)`,
      icon: CheckCircle2,
    },
    {
      title: "Failed Payments",
      value: loading ? "—" : formatINR(data?.payments?.failed?.amount || 0),
      subValue: `${data?.payments?.failed?.count || 0} transaction(s)`,
      icon: XCircle,
    },
    {
      title: "Total Refunded",
      value: loading ? "—" : formatINR(data?.payments?.refunded?.amount || 0),
      subValue: `${data?.payments?.refunded?.count || 0} refund(s)`,
      icon: RotateCcw,
    },
    {
      title: "Total Fees Deducted",
      value: loading ? "—" : formatINR(data?.fees?.totalDeducted || 0),
      subValue: "Platform fee + GST",
      icon: CreditCard,
    },
    {
      title: "Pending Payments",
      value: loading ? "—" : formatINR(data?.payments?.created?.amount || 0),
      subValue: `${data?.payments?.created?.count || 0} transaction(s)`,
      icon: Clock,
      tooltip: "Transactions where the user opened the payment screen but abandoned it before paying.",
    },
  ];

  return (
    <TooltipProvider>
      <DashboardLayout title="Razorpay Summary">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-tertiary-t1">
                Razorpay Summary
              </h1>
              <p className="text-tertiary-t3 mt-1">
                Real-time payment gateway analytics from your Razorpay account
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-40 border-secondary-s2 bg-secondary-s1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-secondary-s2 bg-secondary-s1">
                  {FILTER_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-tertiary-t1"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                className="border-primary-p3 text-primary-p3 hover:bg-primary-tint5 hover:text-black"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <section>
            <h2 className="text-xl font-semibold text-tertiary-t1 mb-4">
              Key Metrics
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {kpiCards.map((card) => (
                <ErrorBoundary key={card.title}>
                  <RazorpayStatsCard
                    title={card.title}
                    value={card.value}
                    subValue={card.subValue}
                    icon={card.icon}
                    loading={loading}
                    error={!!error}
                    tooltip={card.tooltip}
                  />
                </ErrorBoundary>
              ))}
            </div>
          </section>

          {/* Analytics & Charts */}
          <section>
            <h2 className="text-xl font-semibold text-tertiary-t1 mb-4">
              Analytics & Details
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">

              {/* Multi-line Payment Timeline — full width */}
              <ErrorBoundary>
                <div className="lg:col-span-2">
                  <RazorpayTimelineChart
                    timeline={data?.payments?.timeline || []}
                    loading={loading}
                    error={!!error}
                  />
                </div>
              </ErrorBoundary>

              {/* Payment Methods Chart */}
              <ErrorBoundary>
                <RazorpayMethodsChart
                  methods={data?.payments?.methods || {}}
                  loading={loading}
                  error={!!error}
                />
              </ErrorBoundary>

              {/* Fees Breakdown Pie */}
              <ErrorBoundary>
                <RazorpayFeesBreakdown
                  data={data?.fees!}
                  loading={loading}
                  error={!!error}
                />
              </ErrorBoundary>

              {/* Settlement Details Widget — 5 boxes, full width */}
              <ErrorBoundary>
                <div className="lg:col-span-2">
                  <RazorpaySettlementWidget
                    data={data?.settlementDetails!}
                    totalSettled={data?.overview?.totalSettled?.amount || 0}
                    settlementCount={data?.overview?.totalSettled?.history?.length || 0}
                    failedAmount={data?.overview?.totalSettled?.failedAmount || 0}
                    failedCount={data?.overview?.totalSettled?.failedHistory?.length || 0}
                    loading={loading}
                    error={!!error}
                  />
                </div>
              </ErrorBoundary>

              {/* Settlement History Table (History / Failed History tabs) — full width */}
              <ErrorBoundary>
                <RazorpaySettlementHistoryTable
                  history={data?.overview?.totalSettled?.history || []}
                  failedHistory={data?.overview?.totalSettled?.failedHistory || []}
                  loading={loading}
                  error={!!error}
                />
              </ErrorBoundary>

            </div>
          </section>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}

export default RazorpaySummary;
