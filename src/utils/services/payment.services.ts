import { axiosInstance } from "../axiosInstance";

const getPaymentStats = async (timePeriod: string) => {
  const response = await axiosInstance(
    `admin/payout-dashboard?timeFilter=${timePeriod}`
  );
  return response;
};

const getCancellationStats = async () => {
  const response = await axiosInstance(`admin/cancellation-stats`);
  return response;
};

const getPaymentData = async (
  searchQuery: string,
  payStatus: "pending" | "captured" | "failed" | "",
  refundStatus: "initiated" | "processed" | "failed" | "",
  paymentMethod: "" | "card" | "upi" | "wallet" | "netbanking",
  page?: number,
  limit?: number,
  paymentDate?: string
) => {
  const params = new URLSearchParams();

  if (searchQuery) params.append("search", searchQuery);
  if (payStatus) params.append("paymentStatus", payStatus);
  if (refundStatus) params.append("refundStatus", refundStatus);
  if (paymentDate) params.append("paymentDate", paymentDate);
  if (paymentMethod) params.append("paymentMethod", paymentMethod);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());

  const queryString = params.toString();
  const url = queryString
    ? `admin/transactions?${queryString}`
    : "admin/transactions";

  const response = await axiosInstance.get(url);
  return response;
};

export { getPaymentStats, getCancellationStats, getPaymentData };
