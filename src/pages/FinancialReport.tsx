import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { getBookingFinancialReport } from "@/utils/services/financialReport.services";
import { handleApiError } from "@/hooks";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface FinancialReportData {
    srNo: number;
    bookingId: number;
    orderReferenceNo: string;
    bookingDate: string;
    invoiceNumber: string;
    invoiceDate: string;
    propertySpaceName: string;
    spaceType: string;
    city: string;
    state: string;
    hostName: string;
    guestName: string;
    guestGst: string;
    bookingStartDateTime: string;
    numberOfHoursBooked: number;
    grossBookingValue: number | null;
    spaceRentalSgst: number | null;
    spaceRentalCgst: number | null;
    spaceRentalIgst: number | null;
    platformFeeChargedFromGuest: number | null;
    platformFeeSgst: number | null;
    platformFeeCgst: number | null;
    platformFeeIgst: number | null;
    grossHostPayout: number;
    commissionChargedFromHost: number;
    commissionSgst: number;
    commissionCgst: number;
    commissionIgst: number;
    hostRemittedTaxSgst: number | null;
    hostRemittedTaxCgst: number | null;
    hostRemittedTaxIgst: number | null;
    tdsAmount: number;
    tcsAmount: number;
    hostPanNumber: string;
    hostGstNumber: string;
    netAmountPayableToHost: number;
    paymentStatus: string;
    gstinUsedForTransaction: string;
}

const FinancialReport = () => {
    const [reportData, setReportData] = useState<FinancialReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        totalPages: 1,
        currentPage: 1,
        totalRecords: 0,
    });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchFinancialReport = async (page: number, start?: string, end?: string) => {
        setLoading(true);
        try {
            const response = await getBookingFinancialReport({
                page,
                limit: 10,
                startDate: start,
                endDate: end,
            });

            if (response.status === 200) {
                const { reportData: data, pagination: paginationData } = response.data.data;
                setReportData(data || []);
                setPagination({
                    totalPages: paginationData?.totalPages || 1,
                    currentPage: paginationData?.currentPage || 1,
                    totalRecords: paginationData?.totalRecords || 0,
                });
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancialReport(pagination.currentPage, startDate, endDate);
    }, [pagination.currentPage]);

    const handleApplyFilter = () => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            toast.error("Start date cannot be after end date");
            return;
        }
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        fetchFinancialReport(1, startDate, endDate);
    };

    const handleClearFilter = () => {
        setStartDate("");
        setEndDate("");
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        fetchFinancialReport(1, "", "");
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) return "—";
        return `₹${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "—";
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const dateStr = date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
            const timeStr = date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            return `${dateStr} ${timeStr}`;
        } catch {
            return "—";
        }
    };

    const downloadCSV = async () => {
        toast.info("Preparing CSV download...");

        try {
            const response = await getBookingFinancialReport({
                page: 1,
                limit: 999999,
                startDate,
                endDate,
            });

            if (response.status !== 200 || !response.data.data.reportData) {
                toast.error("Failed to fetch data for CSV export");
                return;
            }

            const allData = response.data.data.reportData;

            if (allData.length === 0) {
                toast.error("No data available to download");
                return;
            }

            // Define CSV headers
            const headers = [
                "Sr No",
                "Booking ID",
                "Order Reference No",
                "Booking Date",
                "Invoice Number",
                "Invoice Date",
                "Property/Space Name",
                "Space Type",
                "City",
                "State",
                "Host Name",
                "Guest Name",
                "Guest GST",
                "Booking Start Date Time",
                "Number of Hours Booked",
                "Gross Booking Value",
                "Space Rental SGST",
                "Space Rental CGST",
                "Space Rental IGST",
                "Platform Fee Charged From Guest",
                "Platform Fee SGST",
                "Platform Fee CGST",
                "Platform Fee IGST",
                "Gross Host Payout",
                "Commission Charged From Host",
                "Commission SGST",
                "Commission CGST",
                "Commission IGST",
                "Host Remitted Tax SGST",
                "Host Remitted Tax CGST",
                "Host Remitted Tax IGST",
                "TDS Amount",
                "TCS Amount",
                "Host PAN Number",
                "Host GST Number",
                "Net Amount Payable to Host",
                "Payment Status",
                "GSTIN Used for Transaction",
            ];

            // Convert data to CSV rows with comprehensive null checks
            const csvRows = [
                headers.join(","),
                ...allData.map((row) =>
                    [
                        row.srNo ?? "",
                        row.bookingId ?? "",
                        `"${row.orderReferenceNo ?? "N/A"}"`,
                        `"${row.bookingDate ? formatDate(row.bookingDate) : "N/A"}"`,
                        `"${row.invoiceNumber ?? "N/A"}"`,
                        `"${row.invoiceDate ? formatDateTime(row.invoiceDate) : "N/A"}"`,
                        `"${row.propertySpaceName ?? "N/A"}"`,
                        `"${row.spaceType ?? "N/A"}"`,
                        `"${row.city ?? "N/A"}"`,
                        `"${row.state ?? "N/A"}"`,
                        `"${row.hostName ?? "N/A"}"`,
                        `"${row.guestName ?? "N/A"}"`,
                        `"${row.guestGst ?? "N/A"}"`,
                        `"${row.bookingStartDateTime ? formatDateTime(row.bookingStartDateTime) : "N/A"}"`,
                        row.numberOfHoursBooked ?? 0,
                        row.grossBookingValue ?? "",
                        row.spaceRentalSgst ?? "",
                        row.spaceRentalCgst ?? "",
                        row.spaceRentalIgst ?? "",
                        row.platformFeeChargedFromGuest ?? "",
                        row.platformFeeSgst ?? "",
                        row.platformFeeCgst ?? "",
                        row.platformFeeIgst ?? "",
                        row.grossHostPayout ?? 0,
                        row.commissionChargedFromHost ?? 0,
                        row.commissionSgst ?? 0,
                        row.commissionCgst ?? 0,
                        row.commissionIgst ?? 0,
                        row.hostRemittedTaxSgst ?? "",
                        row.hostRemittedTaxCgst ?? "",
                        row.hostRemittedTaxIgst ?? "",
                        row.tdsAmount ?? 0,
                        row.tcsAmount ?? 0,
                        `"${row.hostPanNumber ?? "N/A"}"`,
                        `"${row.hostGstNumber ?? "N/A"}"`,
                        row.netAmountPayableToHost ?? 0,
                        `"${row.paymentStatus ?? "N/A"}"`,
                        `"${row.gstinUsedForTransaction ?? "N/A"}"`,
                    ].join(",")
                ),
            ];

            // Create blob and download
            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            const fileName = `financial_report_${startDate || "all"}_to_${endDate || "all"}_${new Date().toISOString().split("T")[0]}.csv`;

            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`CSV downloaded successfully (${allData.length} records)`);
        } catch (error) {
            handleApiError(error);
            toast.error("Failed to download CSV");
        }
    };

    const columns = [
        {
            key: "srNo",
            header: "Sr No",
            cell: (row: FinancialReportData) => <div className="font-medium">{row.srNo}</div>,
        },
        {
            key: "bookingId",
            header: "Booking ID",
            cell: (row: FinancialReportData) => <div className="font-medium">{row.bookingId}</div>,
        },
        {
            key: "orderReferenceNo",
            header: "Order Ref",
            cell: (row: FinancialReportData) => <div className="text-sm">{row.orderReferenceNo}</div>,
        },
        {
            key: "bookingDate",
            header: "Booking Date",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[100px] text-sm">{formatDate(row.bookingDate)}</div>
            ),
        },
        {
            key: "invoiceNumber",
            header: "Invoice No",
            cell: (row: FinancialReportData) => <div className="text-sm">{row.invoiceNumber}</div>,
        },
        {
            key: "propertySpaceName",
            header: "Property/Space",
            cell: (row: FinancialReportData) => (
                <div className="max-w-[180px] truncate text-sm" title={row.propertySpaceName}>
                    {row.propertySpaceName}
                </div>
            ),
        },
        {
            key: "spaceType",
            header: "Space Type",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[120px] text-sm">{row.spaceType}</div>
            ),
        },
        {
            key: "city",
            header: "City",
            cell: (row: FinancialReportData) => <div className="text-sm">{row.city}</div>,
        },
        {
            key: "state",
            header: "State",
            cell: (row: FinancialReportData) => <div className="text-sm">{row.state}</div>,
        },
        {
            key: "hostName",
            header: "Host Name",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[120px] text-sm">{row.hostName}</div>
            ),
        },
        {
            key: "guestName",
            header: "Guest Name",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[120px] text-sm">{row.guestName}</div>
            ),
        },
        {
            key: "guestGst",
            header: "Guest GST",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[140px] text-sm font-mono">{row.guestGst}</div>
            ),
        },
        {
            key: "numberOfHoursBooked",
            header: "Hours",
            cell: (row: FinancialReportData) => (
                <div className="text-center">{row.numberOfHoursBooked}</div>
            ),
        },
        {
            key: "grossBookingValue",
            header: "Gross Value",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[100px] text-sm font-medium">
                    {formatCurrency(row.grossBookingValue)}
                </div>
            ),
        },
        {
            key: "platformFeeChargedFromGuest",
            header: "Platform Fee",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[100px] text-sm">
                    {formatCurrency(row.platformFeeChargedFromGuest)}
                </div>
            ),
        },
        {
            key: "grossHostPayout",
            header: "Gross Payout",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[100px] text-sm font-medium">
                    {formatCurrency(row.grossHostPayout)}
                </div>
            ),
        },
        {
            key: "commissionChargedFromHost",
            header: "Commission",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[100px] text-sm">
                    {formatCurrency(row.commissionChargedFromHost)}
                </div>
            ),
        },
        {
            key: "tdsAmount",
            header: "TDS",
            cell: (row: FinancialReportData) => (
                <div className="text-sm">{formatCurrency(row.tdsAmount)}</div>
            ),
        },
        {
            key: "tcsAmount",
            header: "TCS",
            cell: (row: FinancialReportData) => (
                <div className="text-sm">{formatCurrency(row.tcsAmount)}</div>
            ),
        },
        {
            key: "netAmountPayableToHost",
            header: "Net Payout",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[100px] text-sm font-semibold text-green-700 dark:text-green-400">
                    {formatCurrency(row.netAmountPayableToHost)}
                </div>
            ),
        },
        {
            key: "paymentStatus",
            header: "Payment Status",
            cell: (row: FinancialReportData) => (
                <div className="min-w-[100px]">
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${row.paymentStatus === "captured"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                            : row.paymentStatus === "pending"
                                ? "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            }`}
                    >
                        {row.paymentStatus}
                    </span>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Booking Financial Report">
            <div className="space-y-6">
                {/* Filter Section */}
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium mb-2">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium mb-2">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleApplyFilter}
                                variant="outline"
                            >
                                Apply Filter
                            </Button>
                            <Button
                                onClick={handleClearFilter}
                                variant="outline"

                            >
                                Clear
                            </Button>
                            <Button
                                onClick={downloadCSV}
                                variant="outline"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download CSV
                            </Button>
                        </div>
                    </div>
                    {pagination.totalRecords > 0 && (
                        <div className="mt-3 text-sm text-muted-foreground">
                            Total Records: <span className="font-semibold">{pagination.totalRecords}</span>
                        </div>
                    )}
                </div>

                {/* Data Table */}
                <DataTable
                    data={reportData}
                    columns={columns}
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

export default FinancialReport;
