import React from "react";
import { UserDetails } from "@/types";
import { Calendar, DollarSign, Home, IndianRupee } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";

interface UserMetricsProps {
  userDetails: UserDetails;
}

const UserMetrics: React.FC<UserMetricsProps> = ({ userDetails }) => {
  const getRoleBasedMetrics = () => {
    const isHost = userDetails.role === "host" || userDetails.role === "both";
    const isGuest = userDetails.role === "guest" || userDetails.role === "both";

    const handleClick = () => {};

    const hostMetrics = isHost
      ? [
          {
            title: "Total Earnings",
            value: "$41,900",
            description: "All-time revenue",
            icon: IndianRupee,
            trend: { value: 12, isPositive: true },
            onClick: handleClick,
          },
          {
            title: "Active Properties",
            value: "3",
            description: "Listings",
            icon: Home,
            onClick: handleClick,
          },
        ]
      : [];

    const guestMetrics = isGuest
      ? [
          {
            title: "Total Bookings",
            value: "24",
            description: "All-time bookings",
            icon: Calendar,
            onClick: handleClick,
          },
          {
            title: "Total Spent",
            value: "$12,500",
            description: "Amount spent",
            icon: IndianRupee,
            onClick: handleClick,
          },
        ]
      : [];

    if (userDetails.role === "both") {
      return [...hostMetrics, ...guestMetrics];
    } else if (userDetails.role === "host") {
      return hostMetrics;
    } else {
      return guestMetrics;
    }
  };

  const metrics = getRoleBasedMetrics();

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <StatsCard
          key={index}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
          onClick={metric.onClick}
        />
      ))}
    </div>
  );
};

export default UserMetrics;
