import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { handleApiError, useDebounce, capitalizeWord } from "@/hooks";
import { toast } from "sonner";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { WEBSITE_URL } from "@/constants";
import { getCancellationsData } from "@/utils/services/cancellations.services";
import { CancellationInvoiceDialog } from "@/components";
import { Info } from "lucide-react";

const Cancellations = () => {
  const [cancellations, setCancellations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [selectedCancellation, setSelectedCancellation] = useState<any>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  const fetchCancellations = async (page: number, search?: string) => {
    setLoading(true);
    try {
      const response = await getCancellationsData(page, search);

      if (response.status === 200) {
        const { data, pagination: paginationData } = response.data.data;

        setCancellations(data || []);
        setPagination({
          totalPages: paginationData?.totalPages || 1,
          currentPage: paginationData?.currentPage || page,
        });
      }
    } catch (error) {
      handleApiError(error);
      setCancellations([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCancellations = useCallback(async (query: string) => {
    const search = query.trim();
    setSearchQuery(query);

    if (!search) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchCancellations(1);
      return;
    }

    fetchCancellations(1, search);
  }, []);

  const debouncedHandleSearch = useDebounce(searchCancellations, 500);

  useEffect(() => {
    fetchCancellations(pagination.currentPage);
  }, [pagination.currentPage]);

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
      });
    } catch {
      return "-";
    }
  };

  const formatCurrency = (amount: string | number) => {
    if (!amount) return "₹0";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const handleDownloadClick = (cancellation: any) => {
    setSelectedCancellation(cancellation);
    setIsInvoiceDialogOpen(true);
  };

  const columns = [
    {
      key: "id",
      header: "Booking ID",
      cell: (cancellation) => (
        <div className="font-medium">{cancellation?.id || "-"}</div>
      ),
    },
    {
      key: "guestName",
      header: "Guest Name",
      cell: (cancellation) => (
        <div className="font-medium">
          {cancellation?.User
            ? `${capitalizeWord(cancellation.User.firstName)} ${capitalizeWord(
                cancellation.User.lastName
              )}`
            : "-"}
        </div>
      ),
    },
    {
      key: "spaceName",
      header: "Space Name",
      cell: (cancellation) => (
        <div
          className="max-w-[180px] truncate overflow-hidden text-ellipsis whitespace-nowrap line-clamp-2
           font-medium hover: cursor-pointer hover:underline"
          onClick={() => {
            if (!cancellation?.Space?.id) {
              toast.error(fallbackMessages.genericError);
              return;
            }

            window.open(
              `${WEBSITE_URL}/space-details/${cancellation.Space.id}`,
              "_blank"
            );
          }}
        >
          {cancellation.Space?.title || "-"}
        </div>
      ),
    },
    {
      key: "cancellationDate",
      header: "Cancellation Date",
      cell: (cancellation) => <div>{formatDate(cancellation?.created_at)}</div>,
    },
    {
      key: "refundID",
      header: "Refund Id",
      cell: (cancellation) => (
        <div>{cancellation?.Cancellations?.[0]?.refundId}</div>
      ),
    },
    {
      key: "refundStatus",
      header: "Refund Status",
      cell: (cancellation) => {
        const cancellationData = cancellation?.Cancellations?.[0];
        const status = cancellationData?.refundStatus || "failed";

        return (
          <div className="min-w-[120px] flex">
            {status === "processed" && (
              <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium rounded-full">
                Processed
              </span>
            )}

            {status === "failed" && (
              <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs font-medium rounded-full">
                Failed
              </span>
            )}

            {status === "initiated" && (
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium rounded-full">
                Initiated
              </span>
            )}

            {!["processed", "initiated", "failed"].includes(status) && (
              <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                {capitalizeWord(status)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "refundAmount",
      header: "Refund Amount",
      cell: (cancellation) => {
        const cancellationData = cancellation?.Cancellations?.[0];
        const amount = cancellationData?.refundAmount || "0";

        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      cell: (cancellation) => (
        <div className="flex justify-end">
          <button
            onClick={() => handleDownloadClick(cancellation)}
            title="View cancellation details and invoices"
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Info className="h-4 w-4 text-gray-500 hover:text-blue-600 transition-colors" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Cancellations">
      <div className="space-y-6">
        <DataTable
          data={cancellations}
          columns={columns}
          searchable
          searchPlaceholder="Search by booking ID, guest name, or space..."
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

      {/* Invoice Dialog */}
      <CancellationInvoiceDialog
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        bookingId={selectedCancellation?.id || 0}
        data={selectedCancellation}
      />
    </DashboardLayout>
  );
};

export default Cancellations;
