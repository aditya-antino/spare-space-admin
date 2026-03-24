import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Download,
  User,
  Home,
  Calendar,
  CreditCard,
  Wallet,
  Building,
  Clock,
  Receipt,
  Banknote,
  RefreshCw,
  CheckCircle,
  XCircle,
  PauseCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TransactionDetailsModalProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailsModal = ({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) => {
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd MMM yyyy • hh:mm a");
    } catch {
      return "-";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "captured":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <PauseCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <PauseCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      captured: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${
          config[status as keyof typeof config] ||
          "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status?.toUpperCase() || "-"}
      </span>
    );
  };

  const getRefundBadge = (status: string) => {
    const config = {
      processed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      initiated: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${
          config[status as keyof typeof config] ||
          "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status?.toUpperCase() || "NONE"}
      </span>
    );
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      card: <CreditCard className="h-5 w-5 text-violet-600" />,
      upi: <Wallet className="h-5 w-5 text-indigo-600" />,
      wallet: <Wallet className="h-5 w-5 text-amber-600" />,
      netbanking: <Banknote className="h-5 w-5 text-emerald-600" />,
    };
    return (
      icons[method as keyof typeof icons] || (
        <CreditCard className="h-5 w-5 text-gray-600" />
      )
    );
  };

  const handleExportReceipt = (): void => {
    toast.success("Receipt downloaded successfully");
  };

  const cancellation = transaction?.Booking?.Cancellations?.[0];
  const bankAccount = transaction?.User?.UserBankAccounts?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 border-0 [&>button]:hidden overflow-hidden h-[85vh] flex flex-col">
        <div className="flex flex-col h-full">
          <div className="bg-white border-b px-6 py-4 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Receipt className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Transaction Details
                  </DialogTitle>
                  <p className="text-sm text-gray-500">Complete overview</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={onClose}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-300 mb-2">Total Amount</p>
                      <h2 className="text-4xl font-bold mb-4">
                        {formatCurrency(parseFloat(transaction?.amount) || 0)}
                      </h2>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction?.status)}
                          <span className="font-medium">
                            {getStatusBadge(transaction?.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            {formatDate(transaction?.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/10 p-3 rounded-lg inline-block">
                        {getMethodIcon(transaction?.method)}
                      </div>
                      <p className="text-sm text-gray-300 mt-2 capitalize">
                        {transaction?.method} Payment
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Transaction ID
                      </p>
                      <p className="font-mono font-medium">
                        {transaction?.rzpPaymentId || "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                      <p className="font-medium">
                        {transaction?.bookingId ||
                          transaction?.Booking?.id ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg border p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-gray-700" />
                        <h3 className="font-semibold text-gray-900">Guest</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Name</p>
                          <p className="font-medium">
                            {`${transaction?.User?.firstName || ""} ${
                              transaction?.User?.lastName || ""
                            }`.trim() || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <p className="font-medium truncate">
                            {transaction?.User?.email || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">User ID</p>
                          <p className="font-medium">
                            {transaction?.User?.id || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Home className="h-5 w-5 text-gray-700" />
                        <h3 className="font-semibold text-gray-900">Booking</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Space</p>
                          <p className="font-medium">
                            {transaction?.Booking?.Space?.title || "-"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Start</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <p className="text-xs font-medium">
                                {formatDate(
                                  transaction?.Booking?.startDatetime
                                )}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">End</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <p className="text-xs font-medium">
                                {formatDate(transaction?.Booking?.endDatetime)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-lg border p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5 text-gray-700" />
                        <h3 className="font-semibold text-gray-900">Host</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Name</p>
                          <p className="font-medium">
                            {`${
                              transaction?.Booking?.Space?.User?.firstName || ""
                            } ${
                              transaction?.Booking?.Space?.User?.lastName || ""
                            }`.trim() || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <p className="font-medium truncate">
                            {transaction?.Booking?.Space?.User?.email || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Host ID</p>
                          <p className="font-medium">
                            {transaction?.Booking?.Space?.User?.id || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {cancellation && (
                      <div className="bg-white rounded-lg border p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <RefreshCw className="h-5 w-5 text-gray-700" />
                          <h3 className="font-semibold text-gray-900">
                            Cancellation
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Refund Status
                              </p>
                              {getRefundBadge(cancellation.refundStatus)}
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Cancelled By
                              </p>
                              <p className="font-medium capitalize">
                                {cancellation.cancelledByType || "-"}
                              </p>
                            </div>
                          </div>
                          {cancellation.refundAmount && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Refund Amount
                              </p>
                              <p className="text-xl font-bold text-green-600">
                                {formatCurrency(
                                  parseFloat(cancellation.refundAmount) || 0
                                )}
                              </p>
                            </div>
                          )}
                          {cancellation.penaltyAmount && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Penalty
                              </p>
                              <p className="text-lg font-semibold text-red-600">
                                {formatCurrency(
                                  parseFloat(cancellation.penaltyAmount) || 0
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {bankAccount && (
                  <div className="bg-white rounded-lg border p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Banknote className="h-5 w-5 text-gray-700" />
                      <h3 className="font-semibold text-gray-900">
                        Bank Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bank</p>
                        <p className="font-medium">{bankAccount.bankName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Holder</p>
                        <p className="font-medium">
                          {bankAccount.accountHolderName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Account</p>
                        <p className="font-mono text-sm">
                          {bankAccount.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">IFSC</p>
                        <p className="font-mono font-medium">
                          {bankAccount.ifscCode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
