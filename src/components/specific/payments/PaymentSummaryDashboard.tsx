import { JSX, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  TrendingUp,
  IndianRupee,
  Wallet,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import DashboardStatusCard from "../dashboard/StatsCard";
import { handleApiError } from "@/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCancellationStats,
  getPaymentStats,
} from "@/utils/services/payment.services";
import { error } from "console";

interface PaymentSummary {
  totalPayoutsMade: string;
  totalCommissionsRetained: string;
  totalRevenue: string;
  totalTDSCollected: string;
  totalGSTCollected: string;
  pendingPayouts: string;
}

interface CancellationRefundData {
  name: string;
  value: number;
  color: string;
}

interface PaymentSummaryDashboardProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const PaymentSummaryDashboard = ({
  timeRange,
  onTimeRangeChange,
}: PaymentSummaryDashboardProps) => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [cancellationData, setCancellationData] = useState<
    CancellationRefundData[]
  >([
    { name: "Host Cancellations", value: 12, color: "#FF6B6B" },
    { name: "Guest Cancellations", value: 8, color: "#4ECDC4" },
    { name: "Successful Bookings", value: 80, color: "#45B7D1" },
  ]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: string | number): string => {
    if (!amount) return "₹0.00";
    const numericValue = typeof amount === "string"
      ? parseFloat(amount.replace(/[₹,]/g, ""))
      : amount;

    if (isNaN(numericValue)) return "₹0.00";

    return `₹${numericValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleRefresh = (): void => {
    fetchPaymentSummary();
    fetchCancellationStats();
  };

  const handleRange = (val: string): void => {
    onTimeRangeChange(val);
  };

  const fetchPaymentSummary = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await getPaymentStats(timeRange);

      if (response.status === 200) {
        setSummary(response.data.data.summary);
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCancellationStats = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await getCancellationStats();
      if (response.status === 200) {
        const data = response.data.data;
        const totalBookings = data.totalBookings || 0;
        const cancelledBookings = data.cancelledBookings || 0;
        const guestCancellations =
          data.cancellationBreakdown?.guestCancellations?.count || 0;
        const hostCancellations =
          data.cancellationBreakdown?.hostCancellations?.count || 0;

        const successfulBookings = totalBookings - cancelledBookings;

        setCancellationData([
          {
            name: "Host Cancellations",
            value: hostCancellations,
            color: "#FF6B6B",
          },
          {
            name: "Guest Cancellations",
            value: guestCancellations,
            color: "#4ECDC4",
          },
          {
            name: "Successful Bookings",
            value: successfulBookings,
            color: "#45B7D1",
          },
        ]);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentSummary();
  }, [timeRange]);

  useEffect(() => {
    fetchCancellationStats();
  }, []);

  const KPIContent = (): JSX.Element => {
    if (!summary)
      return (
        <>
          <DashboardStatusCard
            title="Total Revenue"
            value="-"
            icon={TrendingUp}
            loading
          />
          <DashboardStatusCard
            title="Total Payouts"
            value="-"
            icon={Wallet}
            loading
          />
          <DashboardStatusCard
            title="Total Commission"
            value="-"
            icon={IndianRupee}
            loading
          />
          <DashboardStatusCard
            title="TDS Collected"
            value="-"
            icon={Receipt}
            loading
          />
          <DashboardStatusCard
            title="GST Collected"
            value="-"
            icon={Receipt}
            loading
          />
        </>
      );

    return (
      <>
        <DashboardStatusCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={TrendingUp}
          loading={loading}
        />
        <DashboardStatusCard
          title="Total Payouts"
          value={formatCurrency(summary.totalPayoutsMade)}
          icon={Wallet}
          loading={loading}
        />
        <DashboardStatusCard
          title="Total Commission"
          value={formatCurrency(summary.totalCommissionsRetained)}
          icon={IndianRupee}
          loading={loading}
        />
        <DashboardStatusCard
          title="TDS Collected"
          value={formatCurrency(summary.totalTDSCollected)}
          icon={Receipt}
          loading={loading}
        />
        <DashboardStatusCard
          title="GST Collected"
          value={formatCurrency(summary.totalGSTCollected)}
          icon={Receipt}
          loading={loading}
        />
      </>
    );
  };

  const PieLabel = (name: string, percent: number): string =>
    `${name}: ${(percent * 100).toFixed(1)}%`;

  const TooltipFormatter = (
    value: number,
    name: string,
    props: any,
    index: number,
    payload: any[]
  ): [string, string] => {
    const total = cancellationData.reduce((sum, item) => sum + item.value, 0);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
    return [`${percentage}%`, name];
  };


  const PieCell = (e: CancellationRefundData, i: number): JSX.Element => (
    <Cell key={i} fill={e.color} />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Financial summary and transaction analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={handleRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range ▼" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="daily">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPIContent />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cancellation & Refund Patterns
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Distribution of bookings by status
              </p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cancellationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => PieLabel(name, percent)}
                  outerRadius={80}
                  dataKey="value"
                >
                  {cancellationData.map(PieCell)}
                </Pie>
                <Tooltip formatter={TooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSummaryDashboard;
