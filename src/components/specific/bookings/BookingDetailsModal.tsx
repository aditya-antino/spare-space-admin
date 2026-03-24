import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Zap } from "lucide-react";
import { handleApiError } from "@/hooks";
import { toast } from "sonner";
import { downloadInvoice } from "@/utils/services/invoice.services";
import { formatGSTForDisplay } from "@/utils/gstHelpers";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  booking: any;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const {
    id,
    startDatetime,
    endDatetime,
    tds_percent: topTdsPercent,
    tcs_percent: topTcsPercent,
    User = {},
    Space = {},
    attendees = 0,
    status = 'N/A',
    isGst: showGstInvoiceDownloadBTN = false,
    Financial: {
      baseAmount = 0,
      hostGst = false,
      tcsAmount = 0,
      tdsAmount = 0,
      cgstAmount = 0,
      sgstAmount = 0,
      guestPlatformFeeAmount = 0,
      guestPlatformFeeCgstAmount = 0,
      guestPlatformFeeSgstAmount = 0,
      hostPlatformFeeAmount = 0,
      hostPlatformFeeCgstAmount = 0,
      hostPlatformFeeSgstAmount = 0,
      penaltyAmount = 0,
      refundPercentage = 0,
      tds_percent: financialTdsPercent,
      tcs_percent: financialTcsPercent,
    } = {},
  } = booking || {};

  // Guest calculations
  const guestBaseAmount = Number(baseAmount);
  const guestPlatformFee = Number(guestPlatformFeeAmount);
  const guestSubtotal = guestBaseAmount + guestPlatformFee;

  // Total GST for guest (includes base GST + platform fee GST)
  const totalGuestCGST = Number(cgstAmount) + Number(guestPlatformFeeCgstAmount);
  const totalGuestSGST = Number(sgstAmount) + Number(guestPlatformFeeSgstAmount);
  const totalGuestGST = totalGuestCGST + totalGuestSGST;

  const guestTotalAmount = guestSubtotal + totalGuestGST;

  // Pre-compute GST items for guest display
  const guestGSTItems = useMemo(() => formatGSTForDisplay(
    Space?.City?.state,
    totalGuestCGST,
    totalGuestSGST
  ), [Space?.City?.state, totalGuestCGST, totalGuestSGST]);

  // Host calculations
  const hostBaseAmount = Number(baseAmount);
  const hostGSTAmount = Number(cgstAmount) + Number(sgstAmount);
  const hostSubtotal = hostGst ? hostBaseAmount + hostGSTAmount : hostBaseAmount;

  const hostPlatformFee = Number(hostPlatformFeeAmount);
  const hostPlatformFeeGST = Number(hostPlatformFeeCgstAmount) + Number(hostPlatformFeeSgstAmount);
  const hostTCS = Number(tcsAmount);
  const hostTDS = Number(tdsAmount);
  const hostPenalty = Number(penaltyAmount);

  // Calculate final payout
  let finalPayout = hostSubtotal - hostPlatformFee - hostPlatformFeeGST - hostTDS;

  // Deduct TCS only if host has GST
  if (hostGst) {
    finalPayout = finalPayout - hostTCS;
  }

  // Deduct penalty only if penaltyAmount > 0 AND refundPercentage !== 100
  const shouldDeductPenalty = hostPenalty > 0 && refundPercentage !== 100;
  if (shouldDeductPenalty) {
    finalPayout = finalPayout - hostPenalty;
  }

  // Round to 2 decimal places to avoid floating-point precision issues
  finalPayout = Number(finalPayout.toFixed(2));

  // Determine Percentages (Fallback to calculation if missing)
  const tds_percent =
    topTdsPercent ||
    financialTdsPercent ||
    (hostBaseAmount > 0 ? (hostTDS / hostBaseAmount) * 100 : 0);

  const tcs_percent =
    topTcsPercent ||
    financialTcsPercent ||
    (tcsAmount > 0 && hostBaseAmount > 0
      ? (hostTCS / hostBaseAmount) * 100
      : 0);

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const handleDownloadInvoice = async (
    type:
      | "guest_booking"
      | "guest_platform_gst"
      | "guest_booking_gst"
      | "guest_platform"
      | "host"
      | "admin",
    roleID: string
  ) => {
    if (!id) return toast.error("Booking ID missing. Cannot download invoice.");

    toast.info("Preparing your invoice...");

    try {
      const response = await downloadInvoice(id, roleID);

      if (response.status === 200 && Array.isArray(response.data.data)) {
        const invoices = response.data.data;

        const selected = invoices.find((inv) => inv.subType === type);

        if (selected?.invoiceUrl) {
          window.open(selected.invoiceUrl, "_blank");
        } else {
          toast.error("Invoice not found for this type.");
        }
      } else {
        toast.error("No invoice data received.");
      }
    } catch (err) {
      handleApiError(err);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-md rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <div className="flex justify-between items-center mb-2">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {Space?.title || "Untitled Space"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {Space?.SpaceListing?.instant_booking && (
                <div className="flex flex-row items-center gap-1">
                  <Zap className="w-5 h-5 text-primary-p1" />
                  <p className="text-xs font-medium">Instant Booking</p>
                </div>
              )}
              <div className="px-2 py-1 rounded bg-gray-100">
                <p className="text-xs font-semibold text-gray-600">
                  {hostGst ? "GST Registered" : "Non-GST"}
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {Space?.City?.city || "Unknown City"}, {Space?.City?.state || "Unknown State"}
          </p>
          {startDatetime && endDatetime && (
            <div className="flex flex-row items-center justify-between mt-2">
              <p className="text-gray-600 text-sm font-medium">
                {new Date(startDatetime).toLocaleDateString([], {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-gray-600 text-sm font-medium">
                {new Date(startDatetime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}{' '}
                –{' '}
                {new Date(endDatetime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-medium text-gray-500">
              Status: {(status || 'N/A').toUpperCase()}
            </p>
          </div>
        </DialogHeader>

        <section className="space-y-4">
          {/* Guest Information */}
          <div className="flex justify-between items-center">
            <p className="text-gray-900 text-base font-semibold">
              Guest
            </p>
            <p className="text-gray-600 text-base font-medium">
              {User ? (
                <>
                  {User.firstName || User.first_name || 'Guest'}
                  {(User.lastName || User.last_name) ? ` ${(User.lastName || User.last_name)[0]}.` : ''}
                  {User.phoneNumber || User.phone_number ? ` (${User.phoneNumber || User.phone_number})` : ''}
                </>
              ) : (
                'Guest'
              )}
            </p>
          </div>

          {/* Guest Paid Section */}
          <div className="flex flex-col gap-2 p-4 bg-yellow-50 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-gray-900 text-base font-semibold">
                Guest Paid Amount
              </p>
              <p className="text-green-700 text-sm font-semibold">
                Total: {formatCurrency(guestTotalAmount)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600 text-sm font-medium">
                  Base Amount
                </p>
                <p className="text-gray-600 text-sm font-medium">
                  {formatCurrency(guestBaseAmount)}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600 text-sm font-medium">
                  Platform Fee
                </p>
                <p className="text-gray-600 text-sm font-medium">
                  {formatCurrency(guestPlatformFee)}
                </p>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-2">
                <p className="text-gray-900 text-sm font-semibold">
                  Subtotal
                </p>
                <p className="text-gray-900 text-sm font-semibold">
                  {formatCurrency(guestSubtotal)}
                </p>
              </div>

              {/* GST Display */}
              {guestGSTItems.map((gstItem, index) => (
                <div key={index} className="flex justify-between">
                  <p className="text-gray-600 text-sm font-medium">
                    {gstItem.label}
                  </p>
                  <p className="text-gray-600 text-sm font-medium">
                    {formatCurrency(gstItem.amount)}
                  </p>
                </div>
              ))}

              <div className="flex justify-between border-t border-gray-200 pt-2">
                <p className="text-gray-900 text-sm font-semibold">
                  Total Amount Paid
                </p>
                <p className="text-gray-900 text-sm font-semibold">
                  {formatCurrency(guestTotalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Host Payout Section */}
          <div className="flex flex-col gap-2 p-4 bg-yellow-50 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-gray-900 text-base font-semibold">
                Host Payout Breakdown
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600 text-sm font-medium">
                  Base Amount
                </p>
                <p className="text-gray-600 text-sm font-medium">
                  {formatCurrency(hostBaseAmount)}
                </p>
              </div>

              {hostGst && (
                <div className="flex justify-between">
                  <p className="text-gray-600 text-sm font-medium">
                    GST
                  </p>
                  <p className="text-green-600 text-sm font-medium">
                    +{formatCurrency(hostGSTAmount)}
                  </p>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 pt-2">
                <p className="text-gray-900 text-sm font-semibold">
                  Subtotal
                </p>
                <p className="text-gray-900 text-sm font-semibold">
                  {formatCurrency(hostSubtotal)}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600 text-sm font-medium">
                  Platform Fee
                </p>
                <p className="text-red-600 text-sm font-medium">
                  -{formatCurrency(hostPlatformFee)}
                </p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-600 text-sm font-medium">
                  GST on Platform Fee
                </p>
                <p className="text-red-600 text-sm font-medium">
                  -{formatCurrency(hostPlatformFeeGST)}
                </p>
              </div>

              {hostGst && (
                <div className="flex justify-between">
                  <p className="text-gray-600 text-sm font-medium">
                    TCS
                  </p>
                  <p className="text-red-600 text-sm font-medium">
                    -{formatCurrency(hostTCS)}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <p className="text-gray-600 text-sm font-medium">
                  TDS
                </p>
                <p className="text-red-600 text-sm font-medium">
                  -{formatCurrency(hostTDS)}
                </p>
              </div>

              {shouldDeductPenalty && (
                <div className="flex justify-between">
                  <p className="text-gray-600 text-sm font-medium">
                    Penalty
                  </p>
                  <p className="text-red-600 text-sm font-medium">
                    -{formatCurrency(hostPenalty)}
                  </p>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 pt-2">
                <p className="text-gray-900 text-sm font-semibold">
                  Final Payout to Host
                </p>
                <p className="text-gray-900 text-sm font-semibold">
                  {formatCurrency(finalPayout)}
                </p>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-3">
            <p className="text-gray-600 text-sm font-medium">
              Attendees
            </p>
            <p className="text-gray-600 text-sm font-medium">
              {attendees ?? 0}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            ...(showGstInvoiceDownloadBTN
              ? [
                {
                  label: "GST Guest Booking Invoice",
                  type: "guest_booking_gst",
                  id: "3",
                },
                {
                  label: "GST Guest Platform Invoice",
                  type: "guest_platform_gst",
                  id: "3",
                },
              ]
              : [
                { label: "Guest Booking Invoice", type: "guest_booking", id: "3" },
                {
                  label: "Guest Platform Invoice",
                  type: "guest_platform",
                  id: "3",
                },
              ]),
            { label: "Host Invoice", type: "host", id: "2" },
            { label: "Admin Invoice", type: "admin", id: "1" },
          ].map((btn, i) => (
            <Button
              key={i}
              className="w-full relative bg-[#f7ce2a] hover:bg-[#e6bd1f] flex items-center justify-center transition-colors"
              onClick={() =>
                handleDownloadInvoice(
                  btn.type as
                  | "guest_booking"
                  | "guest_platform"
                  | "guest_platform_gst"
                  | "guest_booking_gst"
                  | "host"
                  | "admin",
                  btn.id
                )
              }
            >
              <FileDown className="h-4 w-4 absolute left-3" />
              <span className="mx-auto">{btn.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
