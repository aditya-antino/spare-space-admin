import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  getBookings,
  searchBookings,
} from "@/utils/services/bookings.services";
import { handleApiError, useDebounce, capitalizeWord, formatBookingDateTime } from "@/hooks";
import { BookingDetailsModal } from "@/components";
import { toast } from "sonner";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { WEBSITE_URL } from "@/constants";

interface Booking {
  id: number;
  startDatetime: string;
  endDatetime: string;
  isGst: boolean;
  status: "pending" | "approved" | "rejected" | "confirmed" | "cancelled";
  totalAmount: string;
  created_at: string;
  Payments: [
    {
      status: string;
    }
  ];
  Space: {
    id: number;
    title: string;
    SpaceListing: {
      instant_booking: boolean;
    };
  };
  User: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
  Payouts: {
    id: string | number;
    payoutStatus: "initiated" | "completed" | "failed" | "pending";
  }[];
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const fetchBooking = async (page: number) => {
    setLoading(true);
    try {
      const response = await getBookings(page);
      if (response.status === 200) {
        const { bookingList, pagination: paginationData } = response.data.data;
        setBookings(bookingList || []);
        setPagination({
          totalPages: paginationData?.totalPages || 1,
          currentPage: paginationData?.currentPage || 1,
        });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchedBookings = useCallback(
    async (query: string) => {
      const search = query.trim().toLowerCase();
      setSearchQuery(query);

      if (!search) {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        fetchBooking(1);
        return;
      }

      setLoading(true);
      try {
        const response = await searchBookings(
          pagination.currentPage,
          parseInt(search)
        );
        if (response.status === 200) {
          const { bookingList, pagination: paginationData } =
            response.data.data;
          setBookings(bookingList || []);
          setPagination({
            totalPages: paginationData?.totalPages || 1,
            currentPage: paginationData?.currentPage || 1,
          });
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.currentPage]
  );

  const debouncedHandleSearch = useDebounce(fetchSearchedBookings, 500);

  useEffect(() => {
    if (searchQuery) {
      debouncedHandleSearch(searchQuery);
    } else {
      fetchBooking(pagination.currentPage);
    }
  }, [searchQuery, pagination.currentPage, debouncedHandleSearch]);

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    debouncedHandleSearch(query);
  };


  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const columns = [
    {
      key: "id",
      header: "Booking ID",
      cell: (booking: Booking) => (
        <div className="font-medium">{booking?.id || "-"}</div>
      ),
    },
    {
      key: "guestId",
      header: "Guest ID",
      cell: (booking: Booking) => (
        <div className="font-medium">{booking?.User?.id || "-"}</div>
      ),
    },
    {
      key: "property",
      header: "Booking Property",
      cell: (booking: Booking) => (
        <div
          className="max-w-[180px] truncate overflow-hidden text-ellipsis whitespace-nowrap line-clamp-2
           font-medium hover: cursor-pointer hover:underline"
          onClick={() => {
            if (!booking?.Space?.id) {
              toast.error(fallbackMessages.genericError);
              return;
            }

            window.open(
              `${WEBSITE_URL}/space-details/${booking?.Space?.id}`,
              "_blank"
            );
          }}
        >
          {booking.Space?.title || "-"}
        </div>
      ),
    },
    {
      key: "bookingType",
      header: "Booking Type",
      cell: (booking: Booking) => (
        <div>
          {booking.Space.SpaceListing.instant_booking && "Instant"}
          {booking.Space.SpaceListing.instant_booking === false &&
            "Booking Request"}
          {booking.Space.SpaceListing.instant_booking === undefined && "-"}
        </div>
      ),
    },
    {
      key: "bookedBy",
      header: "Who Booked",

      cell: (booking: Booking) => (
        <div>{capitalizeWord(booking.User.firstName || "-")}</div>
      ),
    },
    {
      key: "created_at",
      header: "Booked On",
      cell: (booking: Booking) => (
        <div className="min-w-[180px]">
          {formatDate(booking.created_at)}
        </div>
      ),
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
      key: "bookingRequest",
      header: "Booking Req.",
      cell: (booking: Booking) => (
        <div className="min-w-[120px] flex justify-center mx-auto">
          {booking.status === "approved" && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
              Approved
            </span>
          )}

          {booking.status === "pending" && (
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 text-xs rounded-full">
              Awaiting
            </span>
          )}

          {booking.status === "rejected" && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full">
              Rejected
            </span>
          )}

          {booking.status === "cancelled" && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full">
              Cancelled
            </span>
          )}

          {booking.status === "confirmed" &&
            booking?.Space?.SpaceListing?.instant_booking && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
                Instant Approved
              </span>
            )}

          {booking.status === "confirmed" &&
            !booking?.Space?.SpaceListing?.instant_booking && (
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 text-xs rounded-full">
                Approved
              </span>
            )}

          {![
            "pending",
            "approved",
            "rejected",
            "confirmed",
            "cancelled",
          ].includes(booking.status) && (
              <span className="px-2 py-1 text-xs rounded-full">-</span>
            )}
        </div>
      ),
    },
    {
      key: "payStatus",
      header: "Payment",
      cell: (booking: Booking) => (
        <>
          {booking?.Payments?.[0]?.status ? (
            <span className="px-2 py-1 border-2 border-yellow-400 text-xs rounded-full">
              {capitalizeWord(booking.Payments[0].status)}
            </span>
          ) : (
            <span className="px-2 py-1 text-xs text-center rounded-full">
              -
            </span>
          )}
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (booking: Booking) => {
        const isConfirmedWithPayment =
          booking.status === "confirmed" &&
          booking?.Payments?.[0]?.status === "captured";

        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${isConfirmedWithPayment
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
          >
            {isConfirmedWithPayment ? "Confirmed" : "-"}
          </span>
        );
      },
    },
    {
      key: "payout",
      header: "Payout Status",
      cell: (booking: Booking) => {
        if (!booking.Payouts || booking.Payouts.length === 0) {
          return (
            <div className="min-w-[100px] flex justify-center mx-auto">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                No Payout
              </span>
            </div>
          );
        }

        const payout = booking.Payouts[0];
        const status = payout?.payoutStatus || "pending";

        return (
          <div className="min-w-[100px] flex justify-center mx-auto">
            {status === "completed" && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
                Completed
              </span>
            )}

            {status === "initiated" && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
                Initiated
              </span>
            )}

            {status === "failed" && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full">
                Failed
              </span>
            )}

            {status === "pending" && (
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 text-xs rounded-full">
                Pending
              </span>
            )}

            {!["completed", "initiated", "failed", "pending"].includes(
              status
            ) && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  Unknown
                </span>
              )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Details",
      cell: (booking: Booking) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(booking)}
        >
          Details
        </Button>
      ),
      sortable: false,
    },
  ];

  return (
    <DashboardLayout title="Bookings">
      <div className="space-y-6">
        <DataTable
          data={bookings}
          columns={columns}
          searchable
          searchPlaceholder="Search by booking ID or property..."
          searchQuery={searchQuery}
          handleSearch={handleSearchInput}
          loading={loading}
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
        />
      </div>

      <BookingDetailsModal
        isOpen={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </DashboardLayout>
  );
};

export default Bookings;
