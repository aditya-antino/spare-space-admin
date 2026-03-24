import { axiosInstance } from "../axiosInstance";

const getPlatformCommissionFees = async () => {
  const response = await axiosInstance.get(`admin/guest-platform-fee`);
  return response;
};

const postGuestPlatformCommissionFee = async (commissionFee: number) => {
  const response = await axiosInstance.patch(
    `admin/guest-platform-fee?guestPlatformFee=${commissionFee}`
  );
  return response;
};

const getHostPlatformCommissionFee = async (commissionFee: number) => {
  const response = await axiosInstance.patch(
    `admin/host-platform-fee?hostPlatformFee=${commissionFee}`
  );
  return response;
};

export {
  getPlatformCommissionFees,
  postGuestPlatformCommissionFee,
  getHostPlatformCommissionFee,
};
