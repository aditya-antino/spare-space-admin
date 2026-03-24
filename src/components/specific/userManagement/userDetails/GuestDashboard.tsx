import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/ui/stats-card";
import { Calendar, IndianRupee, Star, XCircle, RotateCcw } from "lucide-react";
import GuestBookingsTable from "./GuestBookingsTable";
import GuestTransactionsTable from "./GuestTransactionsTable";
import GuestCancellationsTable from "./GuestCancellationsTable";
import { getGuestStats } from "@/utils/services/userManagement.services";
import { handleApiError } from "@/hooks";

interface GuestDashboardProps {
  userId: string | number;
}

interface GuestStats {
  user?: {
    id: number;
    averageRating: number;
  };
  totalBookings: number;
  totalAmount: number;
  amount: number;
  totalSgst: number;
  totalCgst: number;
  totalGuestPlatformFee: number;
  totalCancellations: number;
  totalRefundAmount: number;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GuestStats>({
    totalBookings: 0,
    totalAmount: 0,
    amount: 0,
    totalSgst: 0,
    totalCgst: 0,
    totalGuestPlatformFee: 0,
    totalCancellations: 0,
    totalRefundAmount: 0,
  });

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getGuestStats(userId);

      if (response.status === 200 && response.data.data) {
        const data = response.data.data;
        setStats({
          user: data.user,
          totalBookings: data.totalBookings || 0,
          totalAmount: data.totalAmount || 0,
          amount: data.amount || 0,
          totalSgst: data.totalSgst || 0,
          totalCgst: data.totalCgst || 0,
          totalGuestPlatformFee: data.totalGuestPlatformFee || 0,
          totalCancellations: data.totalCancellations || 0,
          totalRefundAmount: data.totalRefundAmount || 0,
        });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-100 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2  gap-4">
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          description="All-time bookings"
          icon={Calendar}
          onClick={() => setActiveTab("bookings")}
        />

        <StatsCard
          title="Total Spent"
          value={formatCurrency(stats.totalAmount)}
          description="Total spent (including taxes)"
          icon={IndianRupee}
          onClick={() => setActiveTab("transactions")}
        />

        <StatsCard
          title="Total Spent"
          value={formatCurrency(stats.amount)}
          description="Total spent (excluding taxes)"
          icon={IndianRupee}
        />

        <StatsCard
          title="Total SGST"
          value={formatCurrency(stats.totalSgst)}
          description="State GST paid"
          icon={IndianRupee}
        />

        <StatsCard
          title="Total CGST"
          value={formatCurrency(stats.totalCgst)}
          description="Central GST paid"
          icon={IndianRupee}
        />

        <StatsCard
          title="Platform Fee"
          value={formatCurrency(stats.totalGuestPlatformFee)}
          description="Total platform fees"
          icon={IndianRupee}
        />

        <StatsCard
          title="Average Rating"
          value={stats.user?.averageRating?.toFixed(1) || "0.0"}
          description="Guest rating"
          icon={Star}
          onClick={() => setActiveTab("reviews")}
        />

        <StatsCard
          title="Cancellations"
          value={stats.totalCancellations}
          description="Cancelled bookings"
          icon={XCircle}
          onClick={() => setActiveTab("cancellations")}
        />

        <StatsCard
          title="Total Refund Amount"
          value={formatCurrency(stats.totalRefundAmount)}
          description="Total refunds received"
          icon={RotateCcw}
          onClick={() => setActiveTab("cancellations")}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <GuestBookingsTable userId={userId.toString()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <GuestTransactionsTable userId={userId.toString()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancellations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cancellation History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <GuestCancellationsTable userId={userId.toString()} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuestDashboard;
