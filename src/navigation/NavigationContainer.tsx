import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./";
import { ROUTES } from "@/constants";
import {
  Approvals,
  ApprovalsDetails,
  Bookings,
  CancellationPolicy,
  Cancellations,
  CancelRequests,
  Dashboard,
  ErrorPage,
  GovernmentID,
  GuestReview,
  Login,
  MassNotification,
  Payments,
  Payout,
  PlatformCommission,
  PrivacyPolicy,
  Profile,
  Properties,
  PropertyReviews,
  TermsAndConditions,
  UserDetailPage,
  UserManagement,
  FinancialReport,
  Blogs,
  BlogDetails,
  Articles,
  ArticlesDetails,
} from "@/pages";

const NavigationContainer = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route index element={<Login />} />
          <Route path={ROUTES.login} element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.dashboard} element={<Dashboard />} />
          <Route path={ROUTES.users} element={<UserManagement />} />
          <Route
            path={ROUTES.userDetailsPage(":id")}
            element={<UserDetailPage />}
          />
          <Route path={ROUTES.properties} element={<Properties />} />
          <Route path={ROUTES.bookings} element={<Bookings />} />
          <Route path={ROUTES.approvals} element={<Approvals />} />
          <Route path={ROUTES.approvalDetails} element={<ApprovalsDetails />} />
          <Route path={ROUTES.propertyReviews} element={<PropertyReviews />} />
          <Route path={ROUTES.guestReviews} element={<GuestReview />} />
          <Route path={ROUTES.governmentId} element={<GovernmentID />} />
          <Route path={ROUTES.cancellations} element={<Cancellations />} />
          <Route path={ROUTES.notifications} element={<MassNotification />} />
          <Route path={ROUTES.profile} element={<Profile />} />
          <Route
            path={ROUTES.termsAndConditions}
            element={<TermsAndConditions />}
          />
          <Route path={ROUTES.privacyPolicy} element={<PrivacyPolicy />} />
          <Route
            path={ROUTES.cancellationPolicy}
            element={<CancellationPolicy />}
          />
          <Route
            path={ROUTES.platformCommission}
            element={<PlatformCommission />}
          />
          <Route path={ROUTES.payments} element={<Payments />} />
          <Route path={ROUTES.payout} element={<Payout />} />
          <Route path={ROUTES.financialReport} element={<FinancialReport />} />
          <Route path={ROUTES.blogs} element={<Blogs />} />
          <Route path={ROUTES.blogDetails} element={<BlogDetails />} />
          <Route path={ROUTES.articles} element={<Articles />} />
          <Route path={ROUTES.articleDetails} element={<ArticlesDetails />} />
        </Route>

        <Route path={ROUTES.notFound} element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default NavigationContainer;
