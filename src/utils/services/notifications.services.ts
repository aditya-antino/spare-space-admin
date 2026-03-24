import { axiosInstance } from "../axiosInstance";

type sendPushNotificationPayload = {
  type: "GLOBAL" | "GUEST" | "HOST";
  title: string;
  description: string;
  date: Date;
  url: string;
};

const sendPushNotification = async (payload: sendPushNotificationPayload) => {
  const response = await axiosInstance.post(
    `notification/mass-notification`,
    payload
  );
  return response;
};

const getNotifcationsHistory = async (page: number, search?: string | null) => {
  let endpoint = `admin/notification-history?page=${page}&limit=10`;

  if (search)
    endpoint = `admin/notification-history?search=${search}&page=${page}&limit=10`;

  const response = await axiosInstance.get(endpoint);
  return response;
};

const getPlatformNotification = async () => {
  const response = await axiosInstance.get(`admin/notifications`);
  return response;
};

const getPlatformNotificationCount = async () => {
  const response = await axiosInstance.get(`admin/notifications/unread-count`);
  return response;
};

const markAllPlatformNotificationRead = async (notificationIds: string) => {
  const response = await axiosInstance.delete(
    `admin/notifications?notificationIds=${notificationIds}`
  );
  return response;
};

export {
  sendPushNotification,
  getNotifcationsHistory,
  getPlatformNotification,
  getPlatformNotificationCount,
  markAllPlatformNotificationRead,
};
