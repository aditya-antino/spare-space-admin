import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Home,
  Calendar,
  AlertCircle,
  TrendingUp,
  UserCheck,
  RefreshCw,
  Eye,
  IndianRupee,
  WalletMinimal,
  Wallet,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DashboardData } from "@/types";
import { handleApiError } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  BookingChart,
  CategoryChart,
  ErrorBoundary,
  GrowthChart,
  SpaceTypeChart,
  DashboardStatusCard,
  CityChart,
  RevenueChart,
  ActivityChart,
  SubcategoryChart,
  PayoutsChart,
  RevenueByHostChart,
  RevenueByCategoryChart,
} from "@/components";
import { ROUTES } from "../routes";
import { getStaticDetails } from "@/utils/services/statistics.services";
import CommissionChart from "../components/specific/dashboard/CommissionChart";

const MOCK_DASHBOARD_DATA: DashboardData = {
  kpis: [
    { title: "Total Bookings", value: "0", icon: "Calendar" },
    { title: "Active Hosts", value: "0", icon: "UserCheck" },
    { title: "Active Guests", value: "0", icon: "Users" },
    { title: "Pending Listings", value: "0", icon: "Home" },
    { title: "Pending Verifications", value: "0", icon: "AlertCircle" },
    { title: "Total Revenue", value: "₹0", icon: "TrendingUp" },
    { title: "Total Commission", value: "₹0", icon: "IndianRupee" },
    { title: "Total Host Payout", value: "₹0", icon: "WalletMinimal" },
  ],

  categoryData: [
    { categoryName: "Creative Spaces", bookingCount: "0", revenue: 0 },
    { categoryName: "Dining Spaces", bookingCount: "0", revenue: 0 },
    { categoryName: "Work & Meeting Spaces", bookingCount: "0", revenue: 0 },
  ],

  revenueByActiveHost: [
    { hostName: "", bookingCount: 0, revenue: 0 },
    { hostName: "", bookingCount: 0, revenue: 0 },
    { hostName: "", bookingCount: 0, revenue: 0 },
  ],

  subcategoryData: [
    { spaceType: "Art Studio", bookingCount: "0" },
    { spaceType: "Bar", bookingCount: "0" },
    { spaceType: "Café", bookingCount: "0" },
    { spaceType: "Conference Room", bookingCount: "0" },
    { spaceType: "Co-Working Space", bookingCount: "0" },
    { spaceType: "Desk Space", bookingCount: "0" },
    { spaceType: "Film Studio", bookingCount: "0" },
    { spaceType: "Fitness Area", bookingCount: "0" },
    { spaceType: "Gallery", bookingCount: "0" },
    { spaceType: "Gym", bookingCount: "0" },
    { spaceType: "Office Space", bookingCount: "0" },
    { spaceType: "Photo Studio", bookingCount: "0" },
    { spaceType: "Recording Studio", bookingCount: "0" },
    { spaceType: "Restaurant", bookingCount: "0" },
    { spaceType: "Sports Turf", bookingCount: "0" },
  ],

  activityBookingData: [
    { activityName: "Production Meeting", bookingCount: "0" },
    { activityName: "Launch Event", bookingCount: "0" },
    { activityName: "Interviews", bookingCount: "0" },
    { activityName: "Performance", bookingCount: "0" },
    { activityName: "Screening", bookingCount: "0" },
    { activityName: "Auditions", bookingCount: "0" },
    { activityName: "Sound Stage", bookingCount: "0" },
    { activityName: "Mixer", bookingCount: "0" },
    { activityName: "Filming", bookingCount: "0" },
    { activityName: "Videography", bookingCount: "0" },
    { activityName: "Celebration", bookingCount: "0" },
    { activityName: "Press Event", bookingCount: "0" },
    { activityName: "Networking Event", bookingCount: "0" },
    { activityName: "Art Exhibit", bookingCount: "0" },
    { activityName: "Photography", bookingCount: "0" },
    { activityName: "Influencer Shoot", bookingCount: "0" },
    { activityName: "Team Building", bookingCount: "0" },
    { activityName: "Group Work", bookingCount: "0" },
    { activityName: "Off-site Meetings", bookingCount: "0" },
  ],

  cityData: [
    { cityName: "Noida", bookingCount: "0" },
    { cityName: "Shimla", bookingCount: "0" },
    { cityName: "New Delhi", bookingCount: "0" },
  ],

  bookingStats: {
    daily: [
      { date: "MON", bookings: 0, revenue: 0 },
      { date: "TUE", bookings: 0, revenue: 0 },
      { date: "WED", bookings: 0, revenue: 0 },
      { date: "THU", bookings: 0, revenue: 0 },
      { date: "FRI", bookings: 0, revenue: 0 },
      { date: "SAT", bookings: 0, revenue: 0 },
      { date: "SUN", bookings: 0, revenue: 0 },
    ],
    weekly: [
      { period: "Week 1", bookings: 0, revenue: 0 },
      { period: "Week 2", bookings: 0, revenue: 0 },
      { period: "Week 3", bookings: 0, revenue: 0 },
      { period: "Week 4", bookings: 0, revenue: 0 },
      { period: "Week 5", bookings: 0, revenue: 0 },
    ],
    monthly: [
      { period: "Jan", bookings: 0, revenue: 0 },
      { period: "Feb", bookings: 0, revenue: 0 },
      { period: "Mar", bookings: 0, revenue: 0 },
      { period: "Apr", bookings: 0, revenue: 0 },
      { period: "May", bookings: 0, revenue: 0 },
      { period: "Jun", bookings: 0, revenue: 0 },
      { period: "Jul", bookings: 0, revenue: 0 },
      { period: "Aug", bookings: 0, revenue: 0 },
      { period: "Sep", bookings: 0, revenue: 0 },
      { period: "Oct", bookings: 0, revenue: 0 },
      { period: "Nov", bookings: 0, revenue: 0 },
      { period: "Dec", bookings: 0, revenue: 0 },
    ],
    yearly: [
      { period: "2022", bookings: 0, revenue: 0 },
      { period: "2023", bookings: 0, revenue: 0 },
      { period: "2024", bookings: 0, revenue: 0 },
      { period: "2025", bookings: 0, revenue: 0 },
    ],
  },

  spaceTypeData: [
    { name: "instantBookings", value: 0 },
    { name: "requestBookings", value: 0 },
  ],

  growthData: {
    daily: [
      { period: "MON", hosts: 0, guests: 0 },
      { period: "TUE", hosts: 0, guests: 0 },
      { period: "WED", hosts: 0, guests: 0 },
      { period: "THU", hosts: 0, guests: 0 },
      { period: "FRI", hosts: 0, guests: 0 },
      { period: "SAT", hosts: 0, guests: 0 },
      { period: "SUN", hosts: 0, guests: 0 },
    ],
    weekly: [
      { period: "Week 1", hosts: 0, guests: 0 },
      { period: "Week 2", hosts: 0, guests: 0 },
      { period: "Week 3", hosts: 0, guests: 0 },
    ],
    monthly: [
      { period: "Jan", hosts: 0, guests: 0 },
      { period: "Feb", hosts: 0, guests: 0 },
      { period: "Mar", hosts: 0, guests: 0 },
      { period: "Apr", hosts: 0, guests: 0 },
      { period: "May", hosts: 0, guests: 0 },
      { period: "Jun", hosts: 0, guests: 0 },
      { period: "Jul", hosts: 0, guests: 0 },
      { period: "Aug", hosts: 0, guests: 0 },
      { period: "Sep", hosts: 0, guests: 0 },
      { period: "Oct", hosts: 0, guests: 0 },
      { period: "Nov", hosts: 0, guests: 0 },
      { period: "Dec", hosts: 0, guests: 0 },
    ],
    yearly: [
      { period: "2022", hosts: 0, guests: 0 },
      { period: "2023", hosts: 0, guests: 0 },
      { period: "2024", hosts: 0, guests: 0 },
      { period: "2025", hosts: 0, guests: 0 },
    ],
  },

  commissionStats: [
    {
      daily: [
        { date: "MON", count: 0, commission: 0 },
        { date: "TUE", count: 0, commission: 0 },
        { date: "WED", count: 0, commission: 0 },
        { date: "THU", count: 0, commission: 0 },
        { date: "FRI", count: 0, commission: 0 },
        { date: "SAT", count: 0, commission: 0 },
        { date: "SUN", count: 0, commission: 0 },
      ],
      weekly: [
        { period: "Week 1", count: 0, commission: 0 },
        { period: "Week 2", count: 0, commission: 0 },
        { period: "Week 3", count: 0, commission: 0 },
        { period: "Week 4", count: 0, commission: 0 },
        { period: "Week 5", count: 0, commission: 0 },
      ],
      monthly: [
        { period: "Jan", count: 0, commission: 0 },
        { period: "Feb", count: 0, commission: 0 },
        { period: "Mar", count: 0, commission: 0 },
        { period: "Apr", count: 0, commission: 0 },
        { period: "May", count: 0, commission: 0 },
        { period: "Jun", count: 0, commission: 0 },
        { period: "Jul", count: 0, commission: 0 },
        { period: "Aug", count: 0, commission: 0 },
        { period: "Sep", count: 0, commission: 0 },
        { period: "Oct", count: 0, commission: 0 },
        { period: "Nov", count: 0, commission: 0 },
        { period: "Dec", count: 0, commission: 0 },
      ],
      yearly: [
        { period: "2022", count: 0, commission: 0 },
        { period: "2023", count: 0, commission: 0 },
        { period: "2024", count: 0, commission: 0 },
        { period: "2025", count: 0, commission: 0 },
      ],
    },
  ],

  hostPayoutStats: {
    daily: [
      { date: "MON", count: 0, payout: 0 },
      { date: "TUE", count: 0, payout: 0 },
      { date: "WED", count: 0, payout: 0 },
      { date: "THU", count: 0, payout: 0 },
      { date: "FRI", count: 0, payout: 0 },
      { date: "SAT", count: 0, payout: 0 },
      { date: "SUN", count: 0, payout: 0 },
    ],
    weekly: [
      { period: "Week 1", count: 0, payout: 0 },
      { period: "Week 2", count: 0, payout: 0 },
      { period: "Week 3", count: 0, payout: 0 },
      { period: "Week 4", count: 0, payout: 0 },
      { period: "Week 5", count: 0, payout: 0 },
    ],
    monthly: [
      { period: "Jan", count: 0, payout: 0 },
      { period: "Feb", count: 0, payout: 0 },
      { period: "Mar", count: 0, payout: 0 },
      { period: "Apr", count: 0, payout: 0 },
      { period: "May", count: 0, payout: 0 },
      { period: "Jun", count: 0, payout: 0 },
      { period: "Jul", count: 0, payout: 0 },
      { period: "Aug", count: 0, payout: 0 },
      { period: "Sep", count: 0, payout: 0 },
      { period: "Oct", count: 0, payout: 0 },
      { period: "Nov", count: 0, payout: 0 },
      { period: "Dec", count: 0, payout: 0 },
    ],
    yearly: [
      { period: "2022", count: 0, payout: 0 },
      { period: "2023", count: 0, payout: 0 },
      { period: "2024", count: 0, payout: 0 },
      { period: "2025", count: 0, payout: 0 },
    ],
  },
};

function Dashboard() {
  const navigate = useNavigate();
  const [bookingTimeRange, setBookingTimeRange] = useState("monthly");
  const [revenueTimeRange, setRevenueTimeRange] = useState("monthly");
  const [payoutTimeRange, setPayoutTimeRange] = useState("monthly");
  const [comissionTimeRange, setComissionTimeRange] = useState("monthly");
  const [growthTimeRange, setGrowthTimeRange] = useState("monthly");
  const [data, setData] = useState<DashboardData>(MOCK_DASHBOARD_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStaticDetails();

      if (response.status === 200) {
        setData(response?.data?.data);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefetch = () => {
    fetchDashboardData();
  };

  const handleKpiClick = (kpiTitle: string) => {
    const routeMap = {
      Booking: ROUTES.bookings,
      Host: ROUTES.users,
      Guest: ROUTES.users,
      Listing: ROUTES.approvals,
      Verification: ROUTES.users,
      Revenue: ROUTES.bookings,
    };

    const matchedRoute = Object.entries(routeMap).find(([key]) =>
      kpiTitle.includes(key)
    );

    if (matchedRoute) {
      navigate(matchedRoute[1]);
    }
  };

  const iconMap = {
    Calendar,
    UserCheck,
    Users,
    Home,
    AlertCircle,
    TrendingUp,
    IndianRupee,
    Wallet,
  };

  const kpis = data.kpis;
  const bookingStats = data.bookingStats;
  const spaceTypeData = data.spaceTypeData;
  const cityData = data.cityData;
  const growthData = data.growthData;
  const categoryData = data.categoryData;
  const subcategoryData = data.subcategoryData;
  const activityData = data.activityBookingData;
  const revenueByHostData = data.revenueByActiveHost;
  const commssionData = data.commissionStats;

  const quickActions = [
    {
      title: "Review Listings",
      description: `${
        kpis.find((k) => k.title === "Pending Listings")?.value || 0
      } listings pending`,
      icon: Eye,
      onClick: () => navigate("/dashboard/approvals"),
    },
    {
      title: "Manage Users",
      description: "Hosts & guests management",
      icon: Users,
      onClick: () => navigate("/dashboard/users"),
    },
  ];

  const monthlyBookings = bookingStats.monthly.reduce(
    (sum, item) => sum + item.bookings,
    0
  );
  const monthlyRevenue = bookingStats.monthly.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalHosts =
    growthData.monthly[growthData.monthly.length - 1]?.hosts || 0;
  const totalGuests =
    growthData.monthly[growthData.monthly.length - 1]?.guests || 0;

  return (
    <DashboardLayout title="Analytics Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-tertiary-t1">
              Dashboard Overview
            </h1>
            <p className="text-tertiary-t3 mt-1">
              Real-time platform analytics and insights
            </p>
          </div>

          <Button
            onClick={handleRefetch}
            disabled={loading}
            variant="outline"
            className="border-primary-p3 text-primary-p3 hover:bg-primary-tint5 hover:text-black"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-tertiary-t1 mb-4">
            Key Metrics
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi, index) => (
              <ErrorBoundary key={index}>
                <DashboardStatusCard
                  title={kpi.title}
                  value={kpi.value}
                  icon={iconMap[kpi.icon as keyof typeof iconMap]}
                  loading={loading}
                  error={!!error}
                  onClick={() => handleKpiClick(kpi.title)}
                />
              </ErrorBoundary>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-tertiary-t1 mb-4">
            Analytics & Insights
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <ErrorBoundary>
              <BookingChart
                data={bookingStats}
                timeRange={bookingTimeRange}
                onTimeRangeChange={setBookingTimeRange}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <RevenueChart
                data={bookingStats}
                timeRange={revenueTimeRange}
                onTimeRangeChange={setRevenueTimeRange}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <CommissionChart
                data={commssionData[0]}
                timeRange={comissionTimeRange}
                onTimeRangeChange={setComissionTimeRange}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <PayoutsChart
                data={bookingStats}
                timeRange={payoutTimeRange}
                onTimeRangeChange={setPayoutTimeRange}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>

            {/* <ErrorBoundary>
              <RevenueByHostChart
                data={revenueByHostData}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary> */}
            <ErrorBoundary>
              <RevenueByCategoryChart
                data={categoryData}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <GrowthChart
                data={growthData}
                timeRange={growthTimeRange}
                onTimeRangeChange={setGrowthTimeRange}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <SpaceTypeChart
                data={spaceTypeData}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <CityChart data={cityData} loading={loading} error={!!error} />
            </ErrorBoundary>

            <ErrorBoundary>
              <CategoryChart
                data={categoryData}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <SubcategoryChart
                data={subcategoryData}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <ActivityChart
                data={activityData}
                loading={loading}
                error={!!error}
              />
            </ErrorBoundary>
          </div>
        </section>

        {/* <section>
          <h2 className="text-xl font-semibold text-tertiary-t1 mb-4">
            Quick Actions
          </h2>
          <ErrorBoundary>
            <QuickActions actions={quickActions} />
          </ErrorBoundary>
        </section> */}
        {/* 
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-primary-tint5 border border-primary-tint3 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-p3">
                {monthlyBookings.toLocaleString()}
              </div>
              <div className="text-sm text-tertiary-t3">Monthly Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-p3">
                ₹{(monthlyRevenue / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-tertiary-t3">Monthly Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-p3">
                {totalHosts}
              </div>
              <div className="text-sm text-tertiary-t3">Total Hosts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-p3">
                {totalGuests}
              </div>
              <div className="text-sm text-tertiary-t3">Total Guests</div>
            </div>
          </div>
        </section> */}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
