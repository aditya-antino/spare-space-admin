import { axiosInstance } from "../axiosInstance";

interface FinancialReportParams {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

const getBookingFinancialReport = async (params: FinancialReportParams = {}) => {
    const { page = 1, limit = 10, startDate, endDate } = params;

    let url = `admin/booking-financial-report?page=${page}&limit=${limit}`;

    if (startDate) {
        url += `&startDate=${startDate}`;
    }

    if (endDate) {
        url += `&endDate=${endDate}`;
    }

    const response = await axiosInstance(url);
    return response;
};

export { getBookingFinancialReport };
