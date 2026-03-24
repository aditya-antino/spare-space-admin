import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { handleApiError, capitalizeWord } from "@/hooks";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";
import { format } from "date-fns";
import { DateFilter, TransactionDetailsModal } from "../../index";
import { Transaction } from "@/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getPaymentData } from "@/utils/services/payment.services";

const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
  } catch {
    return "-";
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    pending: "bg-yellow-100 text-yellow-800",
    captured: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${
        config[status as keyof typeof config] || "bg-gray-100 text-gray-800"
      }`}
    >
      {capitalizeWord(status)}
    </span>
  );
};

const RefundBadge = ({ status }: { status: string }) => {
  const config = {
    initiated: "bg-blue-100 text-blue-800",
    processed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    none: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${
        config[status as keyof typeof config] || "bg-gray-100 text-gray-800"
      }`}
    >
      {capitalizeWord(status || "none")}
    </span>
  );
};

const PaymentMethodBadge = ({ method }: { method: string }) => {
  const config = {
    card: "bg-purple-100 text-purple-800",
    upi: "bg-indigo-100 text-indigo-800",
    wallet: "bg-orange-100 text-orange-800",
    netbanking: "bg-teal-100 text-teal-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${
        config[method as keyof typeof config] || "bg-gray-100 text-gray-800"
      }`}
    >
      {capitalizeWord(method)}
    </span>
  );
};

const Filters = ({
  searchQuery,
  onSearchChange,
  appliedFilters,
  onFilterChange,
  onResetFilters,
  selectedDate,
  onDateChange,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  appliedFilters: Record<string, string>;
  onFilterChange: (key: string) => (value: string) => void;
  onResetFilters: () => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search by Transaction ID, Booking ID, Guest or Host Name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>
      <button
        onClick={onResetFilters}
        className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Reset Filters
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <DateFilter selectedDate={selectedDate} onSelect={onDateChange} />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Status
        </label>
        <Select
          value={appliedFilters.paymentStatus}
          onValueChange={onFilterChange("paymentStatus")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="captured">Captured</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Method
        </label>
        <Select
          value={appliedFilters.paymentMethod}
          onValueChange={onFilterChange("paymentMethod")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
            <SelectItem value="netbanking">Net Banking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Refund Status
        </label>
        <Select
          value={appliedFilters.refundStatus}
          onValueChange={onFilterChange("refundStatus")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="initiated">Initiated</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    paymentStatus: "",
    paymentMethod: "",
    refundStatus: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const formatDateToUTC = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return date.toISOString().split("item")[0];
  };

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const paymentStatus = appliedFilters.paymentStatus as
        | ""
        | "pending"
        | "captured"
        | "failed";
      const refundStatus = appliedFilters.refundStatus as
        | ""
        | "initiated"
        | "processed"
        | "failed";

      const paymentMethod = appliedFilters.paymentMethod as
      | ""
      | "card"
      | "upi"
      | "wallet"
      | "netbanking";

    const paymentDate = formatDateToUTC(selectedDate);

    const response = await getPaymentData(
      searchQuery,
      paymentStatus,
      refundStatus,
      paymentMethod,
      page,
      pagination.limit,
      paymentDate
    );

      if (response.data?.success && response.data.data?.data) {
        setTransactions(response.data.data.data);

        if (response.data.data.pagination) {
          setPagination({
            totalPages: response.data.data.pagination.totalPages || 1,
            currentPage: page,
            limit: response.data.data.pagination.limit || 10,
          });
        }
      }
    } catch (error) {
      handleApiError(error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleFilterChange = (key: string) => (value: string) => {
    setAppliedFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleResetFilters = () => {
    setAppliedFilters({
      paymentStatus: "",
      paymentMethod: "",
      refundStatus: "",
    });
    setSearchQuery("");
    setSelectedDate(undefined);
    setPagination((prev) => ({ totalPages: 1, currentPage: 1, limit: 10 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  useEffect(() => {
    fetchTransactions(pagination.currentPage);
  }, [pagination.currentPage, appliedFilters, selectedDate, searchQuery]);

  const columns = [
    {
      key: "rzpPaymentId",
      header: "Transaction ID",
      cell: (item) => (
        <div className="font-medium text-sm">{item?.rzpPaymentId || "-"}</div>
      ),
    },
    {
      key: "bookingId",
      header: "Booking ID",
      cell: (item) => (
        <div className="text-sm">{item?.bookingId?.toString() || "-"}</div>
      ),
    },
    {
      key: "guest",
      header: "Guest",
      cell: (item) => (
        <div>
          {capitalizeWord(
            `${item?.User?.firstName || ""} ${
              item?.User?.lastName || ""
            }`.trim() || "-"
          )}
        </div>
      ),
    },
    {
      key: "Booking",
      header: "Host Name",
      cell: (item) => (
        <div>
          {capitalizeWord(
            `${item?.Booking?.Space?.User?.firstName || ""} ${
              item?.Booking?.Space?.User?.lastName || ""
            }`.trim() || "-"
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item) => (
        <div className="font-medium">
          {formatCurrency(item?.amount ? parseFloat(item.amount) : 0)}
        </div>
      ),
    },
    {
      key: "method",
      header: "Method",
      cell: (item) => (
        <div className="text-center">
          {item?.method ? <PaymentMethodBadge method={item.method} /> : "-"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Payment Status",
      cell: (item) => (
        <div className="text-center">
          {item?.status ? <StatusBadge status={item.status} /> : "-"}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Payment Date",
      cell: (item) => (
        <div className="text-sm">
          {item?.created_at ? formatDate(item.created_at) : "-"}
        </div>
      ),
    },
    {
      key: "Booking.Cancellations",
      header: "Refund Status",
      cell: (item) => (
        <div className="text-center">
          <RefundBadge
            status={item?.Booking?.Cancellations?.[0]?.refundStatus || "none"}
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(item)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed view of all payment transactions
          </p>
        </div>
      </div>

      <Filters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        appliedFilters={appliedFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      <DataTable
        data={transactions}
        columns={columns}
        loading={loading}
        totalPages={pagination.totalPages}
        currentPage={pagination.currentPage}
        onPageChange={handlePageChange}
      />

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TransactionsTable;
