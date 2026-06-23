import { axiosInstance } from "../axiosInstance";

export interface UnlockReason {
  date: string;
  reason: string;
}

export interface Coupon {
  id: string | number;
  code?: string;
  discountPercentage: number | string;
  createdByAdminId?: number;
  isUsed?: boolean;
  usedAt?: string | null;
  usedByUserId?: number | null;
  usedInBookingId?: number | null;
  isLocked?: boolean;
  lockedAt?: string | null;
  lockedForBookingId?: number | null;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  UsedByUser?: any;
  unlockReasons?: UnlockReason[];
}

export interface CustomCode {
  id: string | number;
  code: string;
  discountPercentage: number | string;
  totalCountOfUsed: number;
  userIds: (string | number)[];
  bookingIds: (string | number)[];
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  usages?: any[];
}

export const getCoupons = async (page: number = 1, limit: number = 10, search?: string) => {
  const query = `admin/coupons?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`;
  const response = await axiosInstance.get(query);
  return response;
};

export const createCoupon = async (payload: {
  discountPercentage: number;
  isUnlimited?: boolean;
  code?: string;
}) => {
  const response = await axiosInstance.post("admin/coupons", payload);
  return response;
};

export const updateCoupon = async (
  id: string | number,
  payload: {
    discountPercentage?: number;
    isActive?: boolean;
    code?: string;
  }
) => {
  const response = await axiosInstance.patch(`admin/coupons/${id}`, payload);
  return response;
};

export const deleteCoupon = async (id: string | number) => {
  const response = await axiosInstance.delete(`admin/coupons/${id}`);
  return response;
};
