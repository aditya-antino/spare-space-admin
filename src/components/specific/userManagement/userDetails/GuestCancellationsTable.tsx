import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/hooks";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { getUserCancellationHistoryData } from "@/utils/services/userManagement.services";

interface Cancellation {
  id: number;
  refundStatus: string;
  refundAmount: string | null;
  penaltyAmount?: string | null;
  cancelledBy?: number;
  cancelledByType?: string;
  Booking?: {
    id: number;
    startDatetime: string;
    endDatetime: string;
    created_at: string;
    Space?: {
      id: number;
      title: string;
      User?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  };
}

interface GuestCancellationsTableProps {
  userId: string;
  limit?: number;
}

const GuestCancellationsTable: React.FC<GuestCancellationsTableProps> = ({
  userId,
  limit = 5,
}) => {
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
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

  const getRefundStatusBadge = (status: string) => {
    const statusConfig = {
      processed: {
        label: "Processed",
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
      initiated: {
        label: "Initiated",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status || "None",
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

  const fetchCancellations = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getUserCancellationHistoryData(
        userId,
        page,
        limit
      );

      if (response.status === 200 && response.data.data?.data) {
        setCancellations(response.data.data.data);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      handleApiError(error);
      setCancellations([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancellations(currentPage);
  }, [userId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: "id",
      header: "Id.",
      cell: (item: Cancellation) => (
        <div className="min-w-0 w-[100px]">
          <p className="font-medium truncate">{item?.id || "-"}</p>
        </div>
      ),
    },
    {
      key: "Booking.Space",
      header: "Space",
      cell: (item: Cancellation) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0 w-[180px]">
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
      key: "Booking.Space.User",
      header: "Host",
      cell: (item: Cancellation) => {
        const hostName = `${item?.Booking?.Space?.User?.firstName || ""} ${
          item?.Booking?.Space?.User?.lastName || ""
        }`.trim();
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="min-w-0 w-[130px]">
                  <p className="font-medium truncate">{hostName || "-"}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hostName || "-"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: "Booking",
      header: "Booking ID",
      cell: (item: Cancellation) => (
        <div className="min-w-0 w-[100px]">
          <p className="font-medium truncate">{item?.Booking?.id || "-"}</p>
        </div>
      ),
    },
    {
      key: "Booking.startDatetime",
      header: "Booking Date",
      cell: (item: Cancellation) => (
        <div className="min-w-0 w-[120px] whitespace-nowrap">
          {formatDate(item?.Booking?.startDatetime || "")}
        </div>
      ),
    },
    {
      key: "Booking.created_at",
      header: "Cancelled On",
      cell: (item: Cancellation) => (
        <div className="min-w-0 w-[120px] whitespace-nowrap">
          {formatDate(item?.Booking?.created_at || "")}
        </div>
      ),
    },
    {
      key: "refundAmount",
      header: "Refund Amount",
      cell: (item: Cancellation) => (
        <div className="min-w-0 w-[130px] font-medium text-tertiary-t1">
          {item?.refundAmount
            ? formatCurrency(parseFloat(item.refundAmount))
            : "-"}
        </div>
      ),
    },
    {
      key: "refundStatus",
      header: "Refund Status",
      cell: (item: Cancellation) => (
        <div className="min-w-0 w-[110px]">
          {getRefundStatusBadge(item?.refundStatus || "")}
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <DataTable
        data={cancellations}
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

export default GuestCancellationsTable;
