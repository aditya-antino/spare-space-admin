import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PaymentSummaryDashboard, TransactionsTable } from "@/components";

const Payments = () => {
  const [timeRange, setTimeRange] = useState("monthly");

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  return (
    <DashboardLayout title="Payments Management">
      <div className="space-y-6">
        <PaymentSummaryDashboard
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />

        <TransactionsTable />
      </div>
    </DashboardLayout>
  );
};

export default Payments;
