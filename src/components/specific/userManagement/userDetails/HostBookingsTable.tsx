import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { capitalizeWord, formatBookingDateTime, handleApiError } from "@/hooks";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { getHostBookingData } from "@/utils/services/userManagement.services";

interface Booking {
  id: number | string;
  created_at: string;
  endDatetime: string;
  status: string;
  startDatetime: string;
  totalAmount: string;
  Space?: {
    title: string;
    User?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
}

interface HostBookingsTableProps {
  userId: string;
  limit?: number;
}

const HostBookingsTable: React.FC<HostBookingsTableProps> = ({
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

  const formatDateTime = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const fetchBookings = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getHostBookingData(userId, page, limit);

      if (response.status === 200 && response.data.data?.data) {
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
      header: "Booking Id.",
      cell: (item: Booking) => (
        <div className="min-w-0 w-[110px] whitespace-nowrap">
          {item?.id || "-"}
        </div>
      ),
    },
    {
      key: "Space.User",
      header: "Host",
      cell: (item: Booking) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0 w-[130px]">
                <p className="font-medium truncate">
                  {`${item?.Space?.User?.firstName || ""} ${
                    item?.Space?.User?.lastName || ""
                  }`.trim() || "-"}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {`${item?.Space?.User?.firstName || ""} ${
                  item?.Space?.User?.lastName || ""
                }`.trim() || "-"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "Space",
      header: "Space",
      cell: (item: Booking) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0 w-[180px]">
                <p className="font-medium text-tertiary-t1 truncate">
                  {item?.Space?.title || "-"}
                </p>
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
      key: "created_at",
      header: "Booked On",
      cell: (booking: Booking) => <div>{formatDate(booking.created_at)}</div>,
    },
    {
      key: "bookingDateTime",
      header: "Date and Time",
      cell: (booking: Booking) => {
        const { date, timeRange } = formatBookingDateTime(
          booking?.startDatetime || "",
          booking?.endDatetime || ""
        );
        return (
          <div className="min-w-[180px]">
            <div className="font-medium text-gray-900">{date}</div>
            <div className="text-sm text-gray-600">{timeRange}</div>
          </div>
        );
      },
    },
    {
      key: "totalAmount",
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
      cell: (item: Booking) => {
        return (
          <div className=" text-tertiary-t1 text-xs font-medium">
            {capitalizeWord(item?.status || "-")}
          </div>
        );
      },
    },
    {
      key: "created_at",
      header: "Created On",
      cell: (item: Booking) => (
        <div className="min-w-0 w-[110px] whitespace-nowrap">
          {formatDate(item?.created_at || "")}
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <DataTable
        data={bookings}
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

export default HostBookingsTable;
