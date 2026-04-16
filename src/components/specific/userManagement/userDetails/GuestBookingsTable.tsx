import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getUserBookingData } from "@/utils/services/userManagement.services";
import { handleApiError } from "@/hooks";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface Booking {
  id: number;
  totalAmount: string;
  status: string;
  created_at: string;
  User: {
    id: number;
    firstName: string;
  };
  Space: {
    id: number;
    title: string;
    User: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface GuestBookingsTableProps {
  userId: string;
  limit?: number;
}

const GuestBookingsTable: React.FC<GuestBookingsTableProps> = ({
  userId,
  limit = 5,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
      confirmed: {
        label: "Approved",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      completed: {
        label: "Completed",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
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

  const fetchBookings = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getUserBookingData(userId, page, limit);

      if (response?.data?.success && response.data.data?.data) {
        setBookings(response.data.data.data);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      handleApiError(error);
      setBookings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(currentPage);
  }, [userId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: "id",
      header: "Id.",
      cell: (item: Booking) => (
        <div className="min-w-0 w-[90px]">
          <p className="font-medium truncate">{item?.id || "-"}</p>
        </div>
      ),
    },
    {
      key: "property",
      header: "Property",
      cell: (item: Booking) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0 w-[120px]">
                <p className="font-medium text-tertiary-t1 truncate">
                  {item?.Space?.title || "-"}
                </p>
                <p className="text-sm text-tertiary-t3 truncate">Space</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item?.Space?.title || "-"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "host",
      header: "Host",
      cell: (item: Booking) => {
        const hostName = `${item?.Space?.User?.firstName || ""} ${item?.Space?.User?.lastName || ""
          }`.trim();
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="min-w-0 w-[100px]">
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
      key: "guest",
      header: "Guest",
      cell: (item: Booking) => (
        <div className="min-w-0 w-[90px]">
          <p className="font-medium truncate">{item?.User?.firstName || "-"}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item: Booking) => (
        <div className="min-w-0 w-[100px] font-medium text-tertiary-t1">
          {item?.totalAmount
            ? formatCurrency(parseFloat(item.totalAmount))
            : "₹0.00"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Booking) => (
        <div className="min-w-0 w-[100px]">
          {getStatusBadge(item?.status || "")}
        </div>
      ),
    },
    {
      key: "date",
      header: "Booked On",
      cell: (item: Booking) => (
        <div className="min-w-0 w-[100px] whitespace-nowrap">
          {formatDate(item?.created_at || "")}
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <DataTable
        data={limit ? bookings.slice(0, limit) : bookings}
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

export default GuestBookingsTable;
