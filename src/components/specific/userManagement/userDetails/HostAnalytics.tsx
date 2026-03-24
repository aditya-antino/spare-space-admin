import React, { useState, useEffect } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { Home, Star, MessageSquare, IndianRupee, XCircle } from "lucide-react";
import { getHostStats } from "@/utils/services/userManagement.services";
import { handleApiError } from "@/hooks";

interface HostAnalyticsProps {
  userId: string;
}

interface AnalyticsData {
  totalSpaces?: number;
  totalReviews?: number;
  averageRating?: number;
  totalEarnings?: number;
  totalTDS?: number;
  hostRemittedTax?: number;
  guestRemittedTax?: number;
  totalCancellations?: number;
}

const HostAnalytics: React.FC<HostAnalyticsProps> = ({ userId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getHostStats(userId);

      if (response?.data?.success && response.data.data) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      handleApiError(error);

      setAnalytics({
        totalSpaces: 0,
        totalReviews: 0,
        averageRating: 0,
        totalEarnings: 0,
        totalTDS: 0,
        hostRemittedTax: 0,
        guestRemittedTax: 0,
        totalCancellations: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-lg h-32 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(analytics.totalEarnings || 0)}
          description="All-time revenue"
          icon={IndianRupee}
        />

        <StatsCard
          title="Total Spaces"
          value={analytics.totalSpaces || 0}
          description="Total listings"
          icon={Home}
        />

        <StatsCard
          title="Avg. Rating"
          value={analytics.averageRating?.toFixed(1) || "0.0"}
          description="Host rating"
          icon={Star}
        />

        <StatsCard
          title="Total Reviews"
          value={analytics.totalReviews || 0}
          description="Guest reviews"
          icon={MessageSquare}
        />
        <StatsCard
          title="Tax Withheld"
          value={formatCurrency(analytics.totalTDS || 0)}
          description="Total Host TDS"
          icon={IndianRupee}
        />
        <StatsCard
          title="Host Remitted Tax"
          value={formatCurrency(analytics.hostRemittedTax || 0)}
          description="Tax remitted by host"
          icon={IndianRupee}
        />
        <StatsCard
          title="Spare Space Remitted Tax"
          value={formatCurrency(analytics.guestRemittedTax || 0)}
          description="Tax remitted by spare space"
          icon={IndianRupee}
        />
        <StatsCard
          title="Cancellations"
          value={analytics.totalCancellations || 0}
          description="Total Cancellations"
          icon={XCircle}
        />
      </div>
    </div>
  );
};

export default HostAnalytics;
