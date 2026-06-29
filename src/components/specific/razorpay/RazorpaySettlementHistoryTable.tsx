import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RazorpaySettlementHistoryItem } from "@/utils/services/razorpay.services";

interface RazorpaySettlementHistoryTableProps {
  history: RazorpaySettlementHistoryItem[];
  failedHistory: RazorpaySettlementHistoryItem[];
  loading?: boolean;
  error?: boolean;
}

const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateStr;
  }
};

type Tab = "history" | "failed";

function SettlementTable({
  rows,
  emptyLabel,
  isFailed = false,
}: {
  rows: RazorpaySettlementHistoryItem[];
  emptyLabel: string;
  isFailed?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-tertiary-t3 text-center py-6">{emptyLabel}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-secondary-s2">
            <th className="text-left py-3 px-4 text-tertiary-t3 font-medium">Settlement ID</th>
            <th className="text-left py-3 px-4 text-tertiary-t3 font-medium">
              {isFailed ? "Failure Reason" : "UTR"}
            </th>
            <th className="text-left py-3 px-4 text-tertiary-t3 font-medium">Date</th>
            <th className="text-right py-3 px-4 text-tertiary-t3 font-medium">Amount</th>
            <th className="text-center py-3 px-4 text-tertiary-t3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, idx) => {
            const status = item.status || (isFailed ? "failed" : "processed");
            return (
              <tr
                key={item.id || idx}
                className={`border-b border-secondary-s2/50 hover:bg-secondary-s2/30 transition-colors ${
                  idx === rows.length - 1 ? "border-b-0" : ""
                }`}
              >
                <td className="py-3 px-4 text-tertiary-t3 font-mono text-xs">{item.id}</td>
                <td className="py-3 px-4 text-tertiary-t2 font-mono text-xs max-w-[200px] truncate">
                  {isFailed ? item.failure_reason || "Unknown reason" : item.utr || "—"}
                </td>
                <td className="py-3 px-4 text-tertiary-t3">{formatDate(item.date)}</td>
                <td className="py-3 px-4 text-right font-semibold text-tertiary-t1">
                  {formatINR(item.amount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    className={
                      status === "processed"
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                        : status === "failed"
                        ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RazorpaySettlementHistoryTable({
  history,
  failedHistory,
  loading = false,
  error = false,
}: RazorpaySettlementHistoryTableProps) {
  const [activeTab, setActiveTab] = useState<Tab>("history");

  return (
    <Card className="border-secondary-s2 bg-secondary-s1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <CardTitle className="text-tertiary-t1">Settlement History</CardTitle>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-secondary-s2/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "history"
                ? "bg-secondary-s1 text-tertiary-t1 shadow-sm"
                : "text-tertiary-t3 hover:text-tertiary-t2"
            }`}
          >
            History
            {history.length > 0 && (
              <span className="ml-1.5 bg-primary-tint4 text-primary-p3 text-[10px] px-1.5 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("failed")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "failed"
                ? "bg-secondary-s1 text-tertiary-t1 shadow-sm"
                : "text-tertiary-t3 hover:text-tertiary-t2"
            }`}
          >
            Failed History
            {failedHistory.length > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full">
                {failedHistory.length}
              </span>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-secondary-s2 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-danger-d1 text-center py-6">
            Failed to load settlement history
          </p>
        ) : activeTab === "history" ? (
          <SettlementTable
            rows={history}
            emptyLabel="No settlement history available for this period"
          />
        ) : (
          <SettlementTable
            rows={failedHistory}
            emptyLabel="No failed settlements for this period"
            isFailed={true}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default RazorpaySettlementHistoryTable;
