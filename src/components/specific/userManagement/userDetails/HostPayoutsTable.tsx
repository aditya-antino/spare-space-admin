import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/hooks";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { getHostPayoutData } from "@/utils/services/userManagement.services";

interface Payout {
  id: number;
  payoutAmount: string;
  payoutStatus: string;
  payoutDate: string;
  Booking?: {
    created_at: string;
    Payments?: Array<{
      rzpPaymentId: string;
    }>;
  };
}

interface HostPayoutsTableProps {
  userId: string;
  limit?: number;
}

const HostPayoutsTable: React.FC<HostPayoutsTableProps> = ({
  userId,
  limit = 10,
}) => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const getPayoutStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        label: "Paid",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      pending: {
        label: "No Payout",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      failed: {
        label: "Failed",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      processed: {
        label: "Processed",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      initiated: {
        label: "Initiated",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status || "Unknown",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge
        variant="outline"
        className={cn("font-medium text-xs px-2 py-0.5", config.className)}
      >
        {config.label}
      </Badge>
    );
  };

  const fetchPayouts = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getHostPayoutData(userId, page, limit);

      if (response.status === 200 && response.data.data?.data) {
        setPayouts(response.data.data.data);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      handleApiError(error);
      setPayouts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts(currentPage);
  }, [userId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: "id",
      header: "Payout ID",
      cell: (item: Payout) => (
        <div className="min-w-0 w-[100px]">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{item?.id || "-"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "Booking.Payments",
      header: "Transaction ID",
      cell: (item: Payout) => {
        const paymentId = item?.Booking?.Payments?.[0]?.rzpPaymentId;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="min-w-0 w-[150px]">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm truncate">
                      {paymentId || "-"}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono">{paymentId || "-"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: "payoutAmount",
      header: "Amount",
      cell: (item: Payout) => (
        <div className="min-w-0 w-[110px]">
          <div className="flex items-center gap-2">
            <p className="font-medium text-tertiary-t1">
              {item?.payoutAmount
                ? formatCurrency(parseFloat(item.payoutAmount))
                : "₹0.00"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "payoutStatus",
      header: "Status",
      cell: (item: Payout) => (
        <div className="min-w-0 w-[100px]">
          {getPayoutStatusBadge(item?.payoutStatus || "")}
        </div>
      ),
    },
    {
      key: "payoutDate",
      header: "Payout Date",
      cell: (item: Payout) => (
        <div className="min-w-0 w-[110px]">
          <div className="flex items-center gap-2">
            <p className="text-sm whitespace-nowrap">
              {formatDate(item?.payoutDate || "")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "Booking.created_at",
      header: "Booking Date",
      cell: (item: Payout) => (
        <div className="min-w-0 w-[110px]">
          <p className="text-sm whitespace-nowrap">
            {formatDate(item?.Booking?.created_at || "")}
          </p>
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <DataTable
        data={payouts}
        columns={columns}
        searchable={false}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        loading={loading}
        shimmerRowsCount={5}
      />
    </TooltipProvider>
  );
};

export default HostPayoutsTable;
