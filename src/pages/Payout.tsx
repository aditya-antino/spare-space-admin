import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { handleApiError, useDebounce, capitalizeWord } from "@/hooks";
import { toast } from "sonner";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { WEBSITE_URL } from "@/constants";
import { Download } from "lucide-react";
import { getPayoutData } from "@/utils/services/payout.services";

const Payout = () => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const fetchPayouts = async (page: number, search?: string) => {
    setLoading(true);
    try {
      const response = await getPayoutData(page, search);

      if (response.status === 200) {
        const { data, pagination: paginationData } = response.data.data;

        setPayouts(data || []);
        setPagination({
          totalPages: paginationData?.totalPages || 1,
          currentPage: paginationData?.currentPage || page,
        });
      }
    } catch (error) {
      handleApiError(error);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPayouts = useCallback(async (query: string) => {
    const search = query.trim();
    setSearchQuery(query);

    if (!search) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchPayouts(1);
      return;
    }

    fetchPayouts(1, search);
  }, []);

  const debouncedHandleSearch = useDebounce(searchPayouts, 500);

  useEffect(() => {
    fetchPayouts(pagination.currentPage);
  }, [pagination.currentPage]);

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    debouncedHandleSearch(query);
  };

  const formatCurrency = (amount: string | number) => {
    if (!amount) return "₹0";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const getPayoutStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "no payout":
        return (
          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
            No Payout
          </span>
        );

      case "processed":
      case "success":
      case "completed":
        return (
          <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium rounded-full">
            {capitalizeWord(status)}
          </span>
        );

      case "failed":
      case "rejected":
        return (
          <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs font-medium rounded-full">
            {capitalizeWord(status)}
          </span>
        );

      case "initiated":
      case "pending":
        return (
          <span className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 text-xs font-medium rounded-full">
            {capitalizeWord(status)}
          </span>
        );

      case "in_progress":
      case "processing":
        return (
          <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium rounded-full">
            {capitalizeWord(status)}
          </span>
        );

      default:
        return (
          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
            {capitalizeWord(status || "Unknown")}
          </span>
        );
    }
  };

  const columns = [
    {
      key: "payoutId",
      header: "Payout ID",
      cell: (payout) => (
        <div className="font-medium">
          {payout?.payoutId || <span className="text-gray-400 italic">-</span>}
        </div>
      ),
    },
    {
      key: "bookingId",
      header: "Booking ID",
      cell: (payout) => (
        <div className="font-medium">{payout?.bookingId || "-"}</div>
      ),
    },
    {
      key: "guestName",
      header: "Guest Name",
      cell: (payout) => (
        <div className="font-medium">{payout?.guestName || "-"}</div>
      ),
    },
    {
      key: "hostName",
      header: "Host Name",
      cell: (payout) => (
        <div className="font-medium">{payout?.hostName || "-"}</div>
      ),
    },
    {
      key: "hostSpace",
      header: "Property",
      cell: (payout) => (
        <div
          className="max-w-[180px] truncate overflow-hidden text-ellipsis whitespace-nowrap line-clamp-2 font-medium hover:cursor-pointer hover:underline"
          onClick={() => {
            if (!payout?.spaceId) {
              toast.error(fallbackMessages.genericError);
              return;
            }

            window.open(
              `${WEBSITE_URL}/space-details/${payout?.spaceId}`,
              "_blank"
            );
          }}
        >
          {payout?.hostSpace || "-"}
        </div>
      ),
    },
    {
      key: "trxnId",
      header: "Trxn ID",
      cell: (payout) => (
        <div className="font-mono text-sm">{payout?.trxnId || "-"}</div>
      ),
    },
    {
      key: "payoutStatus",
      header: "Payout Status",
      cell: (payout) => {
        const amount = payout?.amount || "0";
        const numAmount =
          typeof amount === "string" ? parseFloat(amount) : amount;
        const isZero = numAmount === 0 || isNaN(numAmount);
        const status = isZero ? "no payout" : payout?.payoutStatus;

        return (
          <div className="min-w-[120px] flex">
            {getPayoutStatusBadge(status)}
          </div>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      cell: (payout) => {
        const amount = payout?.amount || "0";
        const isNegative = amount?.startsWith("-");

        return (
          <div
            className={`font-medium ${
              isNegative ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatCurrency(amount)}
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Payouts">
      <div className="space-y-6">
        <DataTable
          data={payouts}
          columns={columns}
          searchable
          searchPlaceholder="Search by Payout ID, Booking ID, Guest Name, or Host Name..."
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
    </DashboardLayout>
  );
};

export default Payout;
