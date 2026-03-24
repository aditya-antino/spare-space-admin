import { LucideIcon } from "lucide-react";

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: any;
}

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  children?: { label: string; path: string }[];
}

export interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  dob: string | null;
  gender: string | null;
  countryCode: string | null;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  email: string;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  socialMediaId: string | null;
  agreedTnc: boolean;
  avatar: string | null;
  panNumber: string | null;
  gstNumber: string | null;
  payout: {
    [key: string]: any;
  };
  businessName: string | null;
  payoutBusiness: string | null;
  address: {
    [key: string]: any;
  };
  cityId: number | null;
  jobTitle: string | null;
  languages: string[];
  about: string | null;
  active?: "active" | "in-active";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  city_id: number | null;
  guestRating: string | number;
  hostRating: string | number;
  role?: "host" | "guest" | "both";
  Roles?: Array<{
    id: number;
    name: string;
  }>;
  UserKycs?: Array<{
    id: number;
    docNumber: string;
    docLink: string;
    nameVerified: boolean;
    isVerified: boolean;
    userName: string;
    type: "aadhaar" | "dl" | "passport";
    status?: "verified" | "pending" | "rejected" | "failed" | string;
  }>;
  UserBankAccounts?: any[];
  City?: string;

  [key: string]: any;
}

export interface Property {
  id: number;
  title: string;
  updated_at: string;
  User: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  City: {
    city: string;
    state: string;
  };
}

export interface NotificationType {
  id: number;
  title: string;
  description: string;
  date: string;
  dateSent?: string;
  recipients?: string;
  url?: string;
  type: string;
  User?: {
    firstName: string;
    email: string;
  };
}

export interface DailyBookingStats {
  date: string;
  bookings: number;
  revenue: number;
}

export interface WeeklyBookingStats {
  period: string;
  bookings: number;
  revenue: number;
}

export interface MonthlyBookingStats {
  period: string;
  bookings: number;
  revenue: number;
}

export interface YearlyBookingStats {
  period: string;
  bookings: number;
  revenue: number;
}

export interface BookingStatsData {
  daily: DailyBookingStats[];
  weekly: WeeklyBookingStats[];
  monthly: MonthlyBookingStats[];
  yearly: YearlyBookingStats[];
}

export interface DailyCommissionStats {
  date: string;
  count: number;
  commission: number;
}

export interface WeeklyCommissionStats {
  period: string;
  count: number;
  commission: number;
}

export interface MonthlyCommissionStats {
  period: string;
  count: number;
  commission: number;
}

export interface YearlyCommissionStats {
  period: string;
  count: number;
  commission: number;
}

export interface CommissionStatsData {
  daily: DailyCommissionStats[];
  weekly: WeeklyCommissionStats[];
  monthly: MonthlyCommissionStats[];
  yearly: YearlyCommissionStats[];
}

export interface DailyPayoutStats {
  date: string;
  count: number;
  payout: number;
}

export interface WeeklyPayoutStats {
  period: string;
  count: number;
  payout: number;
}

export interface MonthlyPayoutStats {
  period: string;
  count: number;
  payout: number;
}

export interface YearlyPayoutStats {
  period: string;
  count: number;
  payout: number;
}

export interface HostPayoutStatsData {
  daily: DailyPayoutStats[];
  weekly: WeeklyPayoutStats[];
  monthly: MonthlyPayoutStats[];
  yearly: YearlyPayoutStats[];
}

export interface SpaceTypeData {
  name: string;
  value: number;
}

export interface CityData {
  cityName: string;
  bookingCount: string;
}

export interface GrowthData {
  period: string;
  hosts: number;
  guests: number;
}

export interface GrowthDataByTime {
  daily: GrowthData[];
  weekly: GrowthData[];
  monthly: GrowthData[];
  yearly: GrowthData[];
}

export interface CategoryData {
  categoryName: string;
  bookingCount: string;
  revenue: string | number;
}

export interface SubcategoryData {
  spaceType: string;
  bookingCount: string;
}

export interface ActivityBookingData {
  activityName: string;
  bookingCount: string;
}

export interface RevenueByActiveHost {
  hostName: string;
  bookingCount: number;
  revenue: number;
}

export interface DashboardData {
  kpis: Array<{
    title: string;
    value: string;
    icon: string;
  }>;
  bookingStats: BookingStatsData;
  spaceTypeData: SpaceTypeData[];
  cityData: CityData[];
  growthData: GrowthDataByTime;
  categoryData: CategoryData[];
  subcategoryData: SubcategoryData[];
  activityBookingData: ActivityBookingData[];
  revenueByActiveHost: RevenueByActiveHost[];
  commissionStats: CommissionStatsData[];
  hostPayoutStats: HostPayoutStatsData;
}

export interface Transaction {
  id: number;
  transactionId: string;
  bookingId: string;
  userName: string;
  hostName: string;
  spaceName: string;
  transactionAmount: number;
  paymentMethod: "card" | "upi" | "wallet" | "netbanking";
  transactionStatus: "success" | "failed" | "pending" | "refunded";
  paymentDate: string;
  bookingDate: string;
  payoutDetails: string;
  payoutDate: string;
  commission: number;
  hostEarning: number;
  refundStatus: "none" | "pending" | "completed" | "failed";
}
