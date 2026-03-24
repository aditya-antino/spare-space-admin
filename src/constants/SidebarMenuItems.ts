import {
  Users,
  Building2,
  Calendar,
  Megaphone,
  ShieldCheck,
  Star,
  LucideIcon,
  FileText,
  ChartArea,
  Settings,
  IndianRupee,
  XCircle,
  Banknote,
  FileBarChart,
  Newspaper,
} from "lucide-react";
import { ROUTES } from "@/constants";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  children?: { label: string; path: string }[];
}

export const SIDEBAR_MENU_ITEMS: MenuItem[] = [
  { icon: ChartArea, label: "Statistics", path: ROUTES.dashboard },
  { icon: Users, label: "User Management", path: ROUTES.users },
  { icon: Building2, label: "Property", path: ROUTES.properties },
  { icon: Calendar, label: "Bookings", path: ROUTES.bookings },
  { icon: ShieldCheck, label: "Approval", path: ROUTES.approvals },
  {
    icon: Star,
    label: "Reviews",
    path: ROUTES.reviews,
    children: [
      { label: "Property Reviews", path: ROUTES.propertyReviews },
      { label: "Guest Reviews", path: ROUTES.guestReviews },
    ],
  },
  { icon: IndianRupee, label: "Transactions", path: ROUTES.payments },
  { icon: Banknote, label: "Payout", path: ROUTES.payout },
  { icon: XCircle, label: "Cancellations", path: ROUTES.cancellations },
  { icon: FileBarChart, label: "Financial Report", path: ROUTES.financialReport },

  {
    icon: FileText,
    label: "Pages",
    path: ROUTES.cancellationPolicy,
    children: [
      { label: "Terms & Conditions", path: ROUTES.termsAndConditions },
      { label: "Privacy Policy", path: ROUTES.privacyPolicy },
      { label: "Cancellation Policy", path: ROUTES.cancellationPolicy },
    ],
  },

  { icon: Megaphone, label: "Mass Notification", path: ROUTES.notifications },
  { icon: Newspaper, label: "Blogs", path: ROUTES.blogs },
  { icon: FileText, label: "Articles", path: ROUTES.articles },
  {
    icon: Settings,
    label: "Platform Commission",
    path: ROUTES.platformCommission,
  },
];
