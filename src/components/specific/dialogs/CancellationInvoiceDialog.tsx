import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { handleApiError } from "@/hooks";
import { toast } from "sonner";
import { downloadInvoice } from "@/utils/services/invoice.services";
import { Info } from "lucide-react";
import { formatGSTForDisplay } from "@/utils/gstHelpers";

interface Financial {
  baseAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  guestPlatformFeeAmount: string;
  guestPlatformFeeCgstAmount: string;
  guestPlatformFeeSgstAmount: string;
  hostPlatformFeeAmount: string;
  hostPlatformFeeCgstAmount: string;
  hostPlatformFeeSgstAmount: string;
  tdsAmount: string;
  tcsAmount: string;
  refundPercentage: number;
  penaltyAmount: string;
  hostGst: boolean;
  discountAmount?: string | number;
  couponCode?: string;
}

interface CancellationInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId?: number;
  data?: {
    id?: number;
    Financial?: Financial;
    Cancellations?: Array<{
      id: number;
      refundStatus: string | null;
      refundAmount: string | null;
      refundId: string | null;
      cancelledByType: string;
    }>;
    Space?: {
      id: number;
      title: string;
      City?: {
        id?: number;
        city?: string;
        state?: string;
      };
    };
    User?: {
      id: number;
      firstName: string;
      lastName: string;
    };
    startDatetime?: string;
    endDatetime?: string;
    status?: string;
    isGst?: boolean;
  };
}

const CancellationInvoiceDialog: React.FC<CancellationInvoiceDialogProps> = ({
  open,
  onOpenChange,
  bookingId,
  data,
}) => {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₹${numAmount.toFixed(2)}`;
  };

  // Calculate financial breakdown if Financial data is available
  const financial = data?.Financial;
  const cancellation = data?.Cancellations?.[0];
  const refundPercentage = financial?.refundPercentage || 0;
  const isGst = data?.isGst || false;

  // Check who cancelled (if available in data)
  const isCancelledByGuest = cancellation?.cancelledByType === "guest";

  // Guest calculations
  const guestBaseAmount = Number(financial?.baseAmount) || 0;
  const guestPlatformFeeAmount = Number(financial?.guestPlatformFeeAmount) || 0;

  const multiplier = refundPercentage === 50 ? 2 : 1;
  const originalBaseAmount = guestBaseAmount * multiplier;
  const originalPlatformFeeAmount = guestPlatformFeeAmount * multiplier;

  const discountAmount =
    Math.abs(Number(data?.Financial?.discountAmount)) ||
    0;
  const couponCode =
    data?.Financial?.couponCode ||
    "";

  // Original subtotal calculated after platform fee and admin/coupon discount
  const originalSubtotal = originalBaseAmount + originalPlatformFeeAmount - discountAmount;

  // Original GST breakdown calculated over originalSubtotal
  const totalOriginalGuestCGST = originalSubtotal * 0.09;
  const totalOriginalGuestSGST = originalSubtotal * 0.09;

  const originalGSTItems = formatGSTForDisplay(
    data?.Space?.City?.state,
    totalOriginalGuestCGST,
    totalOriginalGuestSGST
  );

  // Original total amount paid (includes GST calculated over post-coupon subtotal)
  const originalTotal = originalSubtotal + totalOriginalGuestCGST + totalOriginalGuestSGST;

  // Remaining/current booking amount after refund percentage is applied
  const currentDiscountAmount = discountAmount * (1 - refundPercentage / 100);
  const currentSubtotal = guestBaseAmount + guestPlatformFeeAmount - currentDiscountAmount;

  // Current GST breakdown calculated over currentSubtotal
  const totalCurrentGuestCGST = currentSubtotal * 0.09;
  const totalCurrentGuestSGST = currentSubtotal * 0.09;

  const currentGSTItems = formatGSTForDisplay(
    data?.Space?.City?.state,
    totalCurrentGuestCGST,
    totalCurrentGuestSGST
  );

  // Current total remaining after refund percentage is applied
  const currentTotal = currentSubtotal + totalCurrentGuestCGST + totalCurrentGuestSGST;

  // Calculate refund amount:
  const subtotalRefund = originalBaseAmount + (isCancelledByGuest ? 0 : originalPlatformFeeAmount) - (isCancelledByGuest ? 0 : discountAmount);

  let refundAmount = 0;
  if (refundPercentage === 100) {
    if (isCancelledByGuest) {
      refundAmount = subtotalRefund * 1.18;
    } else {
      refundAmount = originalTotal;
    }
  } else if (refundPercentage === 50) {
    refundAmount = originalTotal - currentTotal;
  }
  refundAmount = Math.max(0, refundAmount);

  const cgstRefund = subtotalRefund * 0.09;
  const sgstRefund = subtotalRefund * 0.09;
  const refundGSTItems = formatGSTForDisplay(
    data?.Space?.City?.state,
    cgstRefund,
    sgstRefund
  );

  // Host calculations
  const hostBaseAmount = Number(financial?.baseAmount) || 0;
  const hasHostGST = financial?.hostGst || false;
  const hostCgstAmount = Number(financial?.cgstAmount) || 0;
  const hostSgstAmount = Number(financial?.sgstAmount) || 0;
  const hostPlatformFeeAmount = Number(financial?.hostPlatformFeeAmount) || 0;
  const hostPlatformFeeCgstAmount =
    Number(financial?.hostPlatformFeeCgstAmount) || 0;
  const hostPlatformFeeSgstAmount =
    Number(financial?.hostPlatformFeeSgstAmount) || 0;

  const tdsAmount = Number(financial?.tdsAmount) || 0;
  const hostTCSAmount = Number(financial?.tcsAmount) || 0;
  const hostPenaltyAmount = Number(financial?.penaltyAmount) || 0;

  // Step 1: Calculate subtotal (Base + GST if host has GST)
  let hostSubtotal = hostBaseAmount;
  if (hasHostGST) {
    hostSubtotal = hostBaseAmount + hostCgstAmount + hostSgstAmount;
  }

  // Step 2: Deduct platform fee, platform fee GST, and TDS
  let hostTotal = hostSubtotal - hostPlatformFeeAmount - (hostPlatformFeeCgstAmount + hostPlatformFeeSgstAmount) - tdsAmount;

  // Step 3: Deduct TCS only if host has GST
  if (hasHostGST) {
    hostTotal = hostTotal - hostTCSAmount;
  }

  // Step 4: Deduct penalty only if penaltyAmount > 0 AND refundPercentage !== 100
  const shouldDeductPenalty = hostPenaltyAmount > 0 && refundPercentage !== 100;
  if (shouldDeductPenalty) {
    hostTotal = hostTotal - hostPenaltyAmount;
  }

  // Step 5: If full refund (100%), host amount is 0
  if (refundPercentage === 100) {
    hostTotal = 0;
  }

  const expectedPayout =
    hostSubtotal -
    hostPlatformFeeAmount -
    (hostPlatformFeeCgstAmount + hostPlatformFeeSgstAmount) -
    tdsAmount -
    (hasHostGST ? hostTCSAmount : 0);

  const hostGSTItems = formatGSTForDisplay(
    data?.Space?.City?.state,
    hostCgstAmount,
    hostSgstAmount
  );

  const handleDownloadInvoice = async (
    type: string,
    roleID: string,
    isCancellation: boolean = true
  ) => {
    if (!bookingId) {
      toast.error("Booking ID missing. Cannot download invoice.");
      return;
    }

    setLoading(true);
    toast.info("Preparing your invoice...");

    try {
      const response = await downloadInvoice(bookingId, roleID);

      if (response.status === 200 && Array.isArray(response.data.data)) {
        const invoices = response.data.data;
        const selected = invoices.find((inv) => {
          const matchesType = inv.subType === type;
          const isCN = !!inv.fileName?.startsWith("CN");
          return matchesType && (isCancellation ? isCN : !isCN);
        });

        if (selected?.invoiceUrl) {
          window.open(selected.invoiceUrl, "_blank");
        } else {
          toast.error(
            `Invoice not found for this type ${isCancellation ? "(Cancellation)" : "(Original)"
            }.`
          );
        }
      } else {
        toast.error("No invoice data received.");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const invoiceButtons = [
    ...(isGst
      ? [
          {
            label: "Cancellation GST Guest Booking",
            type: "guest_booking_gst",
            id: "3",
            isCancellation: true,
          },
          {
            label: "Original GST Guest Booking",
            type: "guest_booking_gst",
            id: "3",
            isCancellation: false,
          },
          ...(!isCancelledByGuest
            ? [
                {
                  label: "Cancellation GST Guest Platform",
                  type: "guest_platform_gst",
                  id: "3",
                  isCancellation: true,
                },
              ]
            : []),
          {
            label: "Original GST Guest Platform",
            type: "guest_platform_gst",
            id: "3",
            isCancellation: false,
          },
        ]
      : [
          {
            label: "Cancellation Guest Booking",
            type: "guest_booking",
            id: "3",
            isCancellation: true,
          },
          {
            label: "Original Guest Booking",
            type: "guest_booking",
            id: "3",
            isCancellation: false,
          },
          ...(!isCancelledByGuest
            ? [
                {
                  label: "Cancellation Guest Platform",
                  type: "guest_platform",
                  id: "3",
                  isCancellation: true,
                },
              ]
            : []),
          {
            label: "Original Guest Platform",
            type: "guest_platform",
            id: "3",
            isCancellation: false,
          },
        ]),
    {
      label: "Host Cancellation Invoice",
      type: "host",
      id: "2",
      isCancellation: true,
    },
    {
      label: "Admin Cancellation Invoice",
      type: "admin",
      id: "1",
      isCancellation: true,
    },
  ];

  const renderGuestPayoutTables = () => {
    if (refundPercentage === 0) {
      return (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Booking Amount (No Refund)
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Base Amount
              </span>
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(originalBaseAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Platform Fee
              </span>
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(originalPlatformFeeAmount)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span className="text-sm font-medium text-gray-600">
                  Admin Discount{couponCode ? ` (${couponCode})` : ""}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-semibold text-gray-900">
                Subtotal
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(originalSubtotal)}
              </span>
            </div>

            {originalGSTItems.map((gstItem, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {gstItem.label}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(gstItem.amount)}
                </span>
              </div>
            ))}

            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-semibold text-gray-900">
                Total Amount Charged
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(originalTotal)}
              </span>
            </div>

            <div className="flex justify-between border-t border-red-100 pt-2 bg-red-50 p-2 rounded">
              <span className="text-sm font-semibold text-red-600">
                Refund Amount
              </span>
              <span className="text-sm font-semibold text-red-600">₹0.00</span>
            </div>
          </div>
        </div>
      );
    }

    if (refundPercentage === 100) {
      return (
        <>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Original Booking Amount
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Base Amount
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(originalBaseAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Platform Fee
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(originalPlatformFeeAmount)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span className="text-sm font-medium text-gray-600">
                    Admin Discount{couponCode ? ` (${couponCode})` : ""}
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-semibold text-gray-900">
                  Subtotal
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(originalSubtotal)}
                </span>
              </div>

              {originalGSTItems.map((gstItem, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {gstItem.label}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {formatCurrency(gstItem.amount)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-semibold text-gray-900">
                  Total Amount Paid
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(originalTotal)}
                </span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Full Refund (100%)
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Base Amount Refund
                </span>
                <span className="text-sm font-medium text-gray-600">
                  -{formatCurrency(originalBaseAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Platform Fee Refund
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(isCancelledByGuest ? 0 : originalPlatformFeeAmount)}
                </span>
              </div>

              {!isCancelledByGuest && discountAmount > 0 && (
                <div className="flex justify-between text-gray-600 mt-1">
                  <span className="text-sm font-medium text-gray-600">
                    Admin Discount{couponCode ? ` (${couponCode})` : ""}
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-semibold text-gray-900">
                  Subtotal Refund
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(subtotalRefund)}
                </span>
              </div>

              {refundGSTItems.map((gstItem, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {gstItem.label} Refund
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {formatCurrency(gstItem.amount)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between border-t border-green-100 pt-2 bg-green-50 p-2 rounded">
                <span className="text-sm font-semibold text-green-600">
                  Total Refund Amount
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(refundAmount)}
                </span>
              </div>
            </div>
          </div>
        </>
      );
    }

    // 50% refund case
    return (
      <>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Original Booking Amount
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Base Amount
              </span>
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(originalBaseAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Platform Fee
              </span>
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(originalPlatformFeeAmount)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span className="text-sm font-medium text-gray-600">
                  Admin Discount{couponCode ? ` (${couponCode})` : ""}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-semibold text-gray-900">
                Subtotal
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(originalSubtotal)}
              </span>
            </div>

            {originalGSTItems.map((gstItem, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {gstItem.label}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(gstItem.amount)}
                </span>
              </div>
            ))}

            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-semibold text-gray-900">
                Total Amount Paid
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(originalTotal)}
              </span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            After 50% Refund
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Base Amount
              </span>
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(guestBaseAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Platform Fee
              </span>
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(guestPlatformFeeAmount)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span className="text-sm font-medium text-gray-600">
                  Admin Discount{couponCode ? ` (${couponCode})` : ""}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  -{formatCurrency(currentDiscountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-semibold text-gray-900">
                Subtotal
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(currentSubtotal)}
              </span>
            </div>

            {currentGSTItems.map((gstItem, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {gstItem.label}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(gstItem.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-semibold text-gray-900">
                Amount After Refund
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(currentTotal)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-green-100 pt-2 bg-green-50 p-2 rounded">
          <span className="text-sm font-semibold text-green-600">
            Refund Amount (50%)
          </span>
          <span className="text-sm font-semibold text-green-600">
            {formatCurrency(refundAmount)}
          </span>
        </div>
      </>
    );
  };

  const renderHostPayoutTables = () => {
    return (
      <div className="flex flex-col gap-4 p-4 bg-yellow-50 rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900">
            Host Payout Breakdown
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">
              Base Amount
            </span>
            <span className="text-sm font-medium text-gray-600">
              {formatCurrency(hostBaseAmount)}
            </span>
          </div>

          {hasHostGST && (
            <>
              {hostGSTItems.map((gstItem, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {gstItem.label}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {formatCurrency(gstItem.amount)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-semibold text-gray-700">
                  Subtotal
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {formatCurrency(hostSubtotal)}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">
              Platform Fee
            </span>
            <span className="text-sm font-medium text-gray-600">
              -{formatCurrency(hostPlatformFeeAmount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">
              GST on Platform Fee
            </span>
            <span className="text-sm font-medium text-gray-600">
              -{formatCurrency(hostPlatformFeeCgstAmount + hostPlatformFeeSgstAmount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">TDS</span>
            <span className="text-sm font-medium text-gray-600">
              -{formatCurrency(tdsAmount)}
            </span>
          </div>

          {hasHostGST && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">TCS</span>
              <span className="text-sm font-medium text-gray-600">
                -{formatCurrency(hostTCSAmount)}
              </span>
            </div>
          )}

          {shouldDeductPenalty && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Penalty
                </span>
              </div>
              <span className="text-sm font-medium text-red-600">
                -{formatCurrency(hostPenaltyAmount)}
              </span>
            </div>
          )}

          {hostPenaltyAmount > 0 && refundPercentage === 100 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Penalty (Adjusted Later)
                </span>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-10">
                    This penalty will be adjusted against your future bookings.
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45"></div>
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-red-600">
                -{formatCurrency(hostPenaltyAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
            <span className="text-sm font-semibold text-gray-900">
              Expected Payout
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(expectedPayout)}
            </span>
          </div>

          <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
            <span className="text-sm font-semibold text-gray-900">
              Final Payout to Host
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(hostTotal)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] rounded-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Cancellation Details & Invoices
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col w-full gap-6 mt-4">
          {/* Space Details */}
          {data?.Space && (
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {data.Space.title || "Untitled Space"}
              </h3>
              {data.User && (
                <p className="text-sm font-medium text-gray-600">
                  Guest: {data.User.firstName} {data.User.lastName}
                </p>
              )}
              {data.startDatetime && data.endDatetime && (
                <div className="flex flex-row items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-600">
                    {new Date(data.startDatetime).toLocaleDateString([], {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {new Date(data.startDatetime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    –{" "}
                    {new Date(data.endDatetime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              )}
              {cancellation?.refundStatus && (
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${cancellation.refundStatus === "processed"
                      ? "bg-green-100 text-green-600"
                      : cancellation.refundStatus === "failed"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                      }`}
                  >
                    Refund: {cancellation.refundStatus}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Guest Payout Section */}
          {financial && (
            <div className="flex flex-col gap-4 p-4 bg-yellow-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">
                  Guest Amount Breakdown
                </h3>
              </div>
              {renderGuestPayoutTables()}
            </div>
          )}

          {/* Host Payout Section */}
          {financial && renderHostPayoutTables()}

          {/* Invoice Download Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Download Invoices
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {invoiceButtons.map((btn, i) => (
                <Button
                  key={i}
                  className="w-full bg-[#f7ce2a] hover:bg-[#e6bd1f] flex items-center justify-center transition-colors px-2"
                  onClick={() =>
                    handleDownloadInvoice(
                      btn.type,
                      btn.id,
                      (btn as any).isCancellation
                    )
                  }
                  disabled={loading}
                >
                  <span className="text-xs text-center leading-tight">
                    {btn.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationInvoiceDialog;
