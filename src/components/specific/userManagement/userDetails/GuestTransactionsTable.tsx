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
import { getUserPaymentHistoryData } from "@/utils/services/userManagement.services";

interface PaymentHistory {
  id: number;
  amount: string;
  status: string;
  created_at: string;
  Booking?: {
    id: number;
    Space?: {
      title: string;
    };
  };
}

interface GuestTransactionsTableProps {
  userId: string;
  limit?: number;
}

const GuestTransactionsTable: React.FC<GuestTransactionsTableProps> = ({
  userId,
  limit = 5,
}) => {
  const [transactions, setTransactions] = useState<PaymentHistory[]>([]);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      captured: {
        label: "Completed",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      failed: {
        label: "Failed",
        className: "bg-red-100 text-red-800 border-red-200",
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

  const fetchTransactions = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getUserPaymentHistoryData(userId, page, limit);

      if (response.status === 200 && response.data.data?.data) {
        setTransactions(response.data.data.data);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      handleApiError(error);

      setTransactions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [userId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: "created_at",
      header: "Date",
      cell: (item: PaymentHistory) => (
        <div className="min-w-0 w-[100px] whitespace-nowrap">
          {formatDate(item?.created_at || "")}
        </div>
      ),
    },
    {
      key: "id",
      header: "Payment ID",
      cell: (item: PaymentHistory) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0 w-[120px]">
                <p className="font-mono text-sm truncate">
                  {item?.id || "-"}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-sm">Payment ID: {item?.id || "-"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "Booking",
      header: "Booking",
      cell: (item: PaymentHistory) => (
        <div className="min-w-0 w-[100px]">
          <p className="text-sm truncate">{item?.Booking?.id || "-"}</p>
        </div>
      ),
    },
    {
      key: "Booking.Space",
      header: "Property",
      cell: (item: PaymentHistory) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0 w-[150px]">
                <p className="font-medium text-tertiary-t1 truncate">
                  {item?.Booking?.Space?.title || "-"}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item?.Booking?.Space?.title || "-"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item: PaymentHistory) => (
        <div className="min-w-0 w-[100px] font-medium text-tertiary-t1">
          {item?.amount ? formatCurrency(parseFloat(item.amount)) : "₹0.00"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: PaymentHistory) => (
        <div className="min-w-0 w-[100px]">
          {getStatusBadge(item?.status || "")}
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <DataTable
        data={transactions}
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

export default GuestTransactionsTable;
