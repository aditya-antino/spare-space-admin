import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Calendar,
  Star,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  Hash,
} from "lucide-react";
import { UserDetails } from "@/types";
import { cn } from "@/lib/utils";
import VerificationItem from "./VerificationItem";

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  verified?: boolean;
}

interface UserProfileHeaderProps {
  userDetails: UserDetails;
}

const InfoItem: React.FC<InfoItemProps> = ({
  icon: Icon,
  label,
  value,
  verified,
}) => (
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-blue-50 relative">
      <Icon className="h-4 w-4 text-blue-600" />
      {verified && (
        <div className="absolute -top-1 -right-1">
          <ShieldCheck className="h-3 w-3 text-green-500" />
        </div>
      )}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  userDetails,
}) => {
  const fullName = `${userDetails.firstName || ""} ${
    userDetails.lastName || ""
  }`.trim();

  const formatDateSafe = (dateString?: string | null) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getInitials = () => {
    const first = userDetails.firstName?.[0] || "";
    const last = userDetails.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  const getRoleBadgeProps = () => {
    switch (userDetails.role) {
      case "host":
        return {
          variant: "default" as const,
          className: "bg-purple-500 hover:bg-purple-600",
        };
      case "guest":
        return { variant: "secondary" as const };
      case "both":
        return {
          variant: "outline" as const,
          className: "border-purple-300 text-purple-700",
        };
      default:
        return { variant: "secondary" as const };
    }
  };

  const isFullyVerified =
    userDetails.isEmailVerified &&
    userDetails.isPhoneVerified &&
    userDetails.isVerified;

  const formatPhone = () => {
    if (!userDetails.countryCode || !userDetails.phoneNumber) return null;
    return `+${userDetails.countryCode} ${userDetails.phoneNumber}`;
  };

  const getUserRating = () => {
    if (!userDetails.role) return null;
    if (userDetails.role === "guest" && userDetails.guestRating)
      return userDetails.guestRating;
    if (userDetails.role === "host" && userDetails.hostRating)
      return userDetails.hostRating;
    if (
      userDetails.role === "both" &&
      (userDetails.guestRating || userDetails.hostRating)
    )
      return userDetails.guestRating || userDetails.hostRating;
    return null;
  };

  const phoneNumber = formatPhone();
  const userRating = getUserRating();
  const roleBadgeProps = getRoleBadgeProps();

  return (
    <div className="border-0 rounded-2xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                {userDetails.avatar ? (
                  <AvatarImage src={userDetails.avatar} alt={fullName} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {isFullyVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-md">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              )}
            </div>

            {userRating && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-800">
                  {typeof userRating === "number"
                    ? userRating.toFixed(1)
                    : userRating}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {fullName || "Unnamed User"}
                  </h1>
                  {!isFullyVerified && (
                    <ShieldAlert className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {userDetails.email || "No email"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  {...roleBadgeProps}
                  className={cn(
                    "px-3 py-1 text-sm font-medium",
                    roleBadgeProps.className
                  )}
                >
                  {userDetails.role?.toUpperCase() || "USER"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                icon={Hash}
                label="User ID"
                value={String(userDetails.id)}
              />

              {phoneNumber && (
                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={phoneNumber}
                  verified={userDetails.isPhoneVerified}
                />
              )}

              <InfoItem
                icon={Calendar}
                label="Member Since"
                value={formatDateSafe(userDetails.created_at)}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {userDetails.jobTitle && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                  <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                  <span className="font-medium text-gray-800">
                    {userDetails.jobTitle}
                  </span>
                </div>
              )}

              {userDetails.languages?.length > 0 && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                  <span className="text-gray-600">Languages:</span>
                  <span className="font-medium text-gray-800">
                    {userDetails.languages.join(", ")}
                  </span>
                </div>
              )}

              {userDetails.Roles?.length > 0 && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                  <span className="text-gray-600">Roles:</span>
                  <span className="font-medium text-gray-800">
                    {userDetails.Roles.map((r) => r.name).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {isFullyVerified ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-600">
                    Verified Account
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-yellow-600">
                    Verification Pending
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <VerificationItem
                verified={userDetails.isEmailVerified}
                label="Email"
                size="md"
              />

              {phoneNumber && (
                <VerificationItem
                  verified={userDetails.isPhoneVerified}
                  label="Phone"
                  size="md"
                />
              )}

              <VerificationItem
                verified={userDetails.isVerified}
                label="KYC docs"
                size="md"
              />

              <VerificationItem
                verified={userDetails.isProfileCompleted}
                label="Completed profile"
                size="md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
