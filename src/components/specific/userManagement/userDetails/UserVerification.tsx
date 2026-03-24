import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { UserDetails } from "@/types";

interface UserVerificationProps {
  userDetails: UserDetails;
}

interface VerificationStatusProps {
  status: "verified" | "pending" | "unverified" | "failed";
  label: string;
  description?: string;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  label,
  description,
}) => {
  const getStatusConfig = () => {
    const configs = {
      verified: {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        badgeVariant: "success" as const,
        badgeText: "Verified",
      },
      pending: {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        badgeVariant: "warning" as const,
        badgeText: "Pending",
      },
      unverified: {
        icon: AlertCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        badgeVariant: "secondary" as const,
        badgeText: "Not Verified",
      },
      failed: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        badgeVariant: "destructive" as const,
        badgeText: "Failed",
      },
    };
    return configs[status];
  };

  const {
    icon: Icon,
    color,
    bgColor,
    borderColor,
    badgeVariant,
    badgeText,
  } = getStatusConfig();

  return (
    <div className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${bgColor}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{label}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        <Badge variant={badgeVariant} size="sm">
          {badgeText}
        </Badge>
      </div>
    </div>
  );
};

const UserVerification: React.FC<UserVerificationProps> = ({ userDetails }) => {
  const getEmailStatus = (): VerificationStatusProps => {
    if (userDetails.isEmailVerified) {
      return {
        status: "verified",
        label: "Email Verification",
        description: "Email address has been verified",
      };
    }
    return {
      status: "unverified",
      label: "Email Verification",
      description: "Email address not verified",
    };
  };

  const getPhoneStatus = (): VerificationStatusProps => {
    if (!userDetails.phoneNumber) {
      return {
        status: "unverified",
        label: "Phone Verification",
        description: "Phone number not provided",
      };
    }
    if (userDetails.isPhoneVerified) {
      return {
        status: "verified",
        label: "Phone Verification",
        description: `+${userDetails.countryCode} ${userDetails.phoneNumber}`,
      };
    }
    return {
      status: "pending",
      label: "Phone Verification",
      description: `+${userDetails.countryCode} ${userDetails.phoneNumber}`,
    };
  };

  const getKYCStatus = (): VerificationStatusProps => {
    const kyc = userDetails.UserKycs?.[0];

    if (!kyc) {
      return {
        status: "unverified",
        label: "Identity Verification",
        description: "KYC not submitted",
      };
    }

    const statusMap: Record<string, VerificationStatusProps["status"]> = {
      verified: "verified",
      pending: "pending",
      rejected: "failed",
      failed: "failed",
    };

    return {
      // status: statusMap[kyc.status] || "pending",
      status: statusMap[kyc.status || ""] || (kyc.isVerified ? "verified" : "pending"),
      label: "Identity Verification",
      description: `${kyc.type?.toUpperCase() || "Document"} - ${
        kyc.docNumber || "N/A"
      }`,
    };
  };

  const getProfileCompletion = (): VerificationStatusProps => {
    const completedFields = [
      userDetails.firstName && userDetails.lastName,
      userDetails.email,
      userDetails.phoneNumber,
      userDetails.dob,
      userDetails.gender,
      userDetails.address,
    ].filter(Boolean).length;

    const totalFields = 6;
    const percentage = Math.round((completedFields / totalFields) * 100);

    if (percentage >= 90) {
      return {
        status: "verified",
        label: "Profile Completion",
        description: `${percentage}% complete - All required fields filled`,
      };
    } else if (percentage >= 60) {
      return {
        status: "pending",
        label: "Profile Completion",
        description: `${percentage}% complete - ${
          totalFields - completedFields
        } fields missing`,
      };
    }
    return {
      status: "unverified",
      label: "Profile Completion",
      description: `${percentage}% complete - Profile incomplete`,
    };
  };

  const verificationStatuses = [
    getEmailStatus(),
    getPhoneStatus(),
    getKYCStatus(),
    getProfileCompletion(),
  ];

  const getOverallStatus = () => {
    const verifiedCount = verificationStatuses.filter(
      (s) => s.status === "verified"
    ).length;
    const total = verificationStatuses.length;
    const percentage = Math.round((verifiedCount / total) * 100);

    if (percentage === 100) {
      return {
        status: "verified",
        text: "Fully Verified",
        color: "text-green-600",
        bg: "bg-green-50",
      };
    } else if (percentage >= 75) {
      return {
        status: "verified",
        text: "Mostly Verified",
        color: "text-green-600",
        bg: "bg-green-50",
      };
    } else if (percentage >= 50) {
      return {
        status: "pending",
        text: "Partially Verified",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    } else {
      return {
        status: "unverified",
        text: "Limited Verification",
        color: "text-red-600",
        bg: "bg-red-50",
      };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="shadow-sm h-fit">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Verification Status</h3>
            <p className="text-sm text-gray-500">
              Account security & trust level
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg mb-6 ${overallStatus.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`h-6 w-6 ${overallStatus.color}`} />
              <div>
                <p className="font-medium text-gray-900">Overall Status</p>
                <p className={`text-sm font-semibold ${overallStatus.color}`}>
                  {overallStatus.text}
                </p>
              </div>
            </div>
            <Badge
              variant={
                overallStatus.status === "verified"
                  ? "success"
                  : overallStatus.status === "pending"
                  ? "warning"
                  : "destructive"
              }
            >
              {overallStatus.text}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {verificationStatuses.map((status, index) => (
            <VerificationStatus
              key={index}
              status={status.status}
              label={status.label}
              description={status.description}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserVerification;
