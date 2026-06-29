import { axiosInstance } from "@/utils/axiosInstance";

export type RazorpayFilter = "today" | "last7" | "last30" | "last90" | "all";

export interface RazorpaySettlementHistoryItem {
  id: string;
  amount: number;
  utr?: string;
  failure_reason?: string;
  status?: string;
  date: string;
}

export interface RazorpayTimelineItem {
  date: string;
  captured: { amount: number; count: number };
  created: { amount: number; count: number };
  failed: { amount: number; count: number };
  refunded: { amount: number; count: number };
}

export interface RazorpayStatsResponse {
  success: boolean;
  data: {
    overview: {
      availableBalance: number;
      totalSettled: {
        amount: number;
        failedAmount: number;
        history: RazorpaySettlementHistoryItem[];
        failedHistory: RazorpaySettlementHistoryItem[];
      };
    };
    payments: {
      captured: { amount: number; count: number };
      created: { amount: number; count: number };
      failed: { amount: number; count: number };
      refunded: { amount: number; count: number };
      methods: Record<string, any>;
      timeline: RazorpayTimelineItem[];
    };
    fees: {
      baseFee: number;
      tax: number;
      totalDeducted: number;
    };
    settlementDetails: {
      todaysSettlement: number;
      tomorrowsSettlement: number;
      previousSettlement: {
        amount: number;
        date: string;
      };
    };
  };
}

export const getRazorpayStats = async (
  filter: RazorpayFilter = "last30"
): Promise<RazorpayStatsResponse> => {
  const response = await axiosInstance.get(
    `/admin/razorpay/stats?filter=${filter}`,
    { skipEncryption: true } as any
  );
  return response.data;
};
