import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Globe,
  FileText,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { UserDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { updateUserAbout } from "@/utils/services/userManagement.services";
import { handleApiError } from "@/hooks";

interface UserPersonalInfoProps {
  userDetails: UserDetails;
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b last:border-0">
    <div className="p-2 rounded-lg bg-blue-50">
      <Icon className="h-4 w-4 text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900 font-medium truncate">{value}</p>
    </div>
  </div>
);

const UserPersonalInfo: React.FC<UserPersonalInfoProps> = ({ userDetails }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [aboutText, setAboutText] = useState(userDetails.about || "");
  const [displayAbout, setDisplayAbout] = useState(userDetails.about || "");
  const [loading, setLoading] = useState(false);

  // Sync states when userDetails changes
  React.useEffect(() => {
    setAboutText(userDetails.about || "");
    setDisplayAbout(userDetails.about || "");
  }, [userDetails.about]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not provided";
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

  const formatPhone = () => {
    if (!userDetails.countryCode || !userDetails.phoneNumber)
      return "Not provided";
    return `+${userDetails.countryCode} ${userDetails.phoneNumber}`;
  };

  const getFullName = () => {
    const firstName =
      userDetails.firstName || userDetails.payout?.firstName || "";
    const lastName = userDetails.lastName || userDetails.payout?.lastName || "";

    return `${firstName} ${lastName}`.trim() || "Not provided";
  };

  const getGenderText = () => {
    if (!userDetails.gender) return "Not provided";
    return (
      userDetails.gender.charAt(0).toUpperCase() + userDetails.gender.slice(1)
    );
  };

  const infoItems: InfoItemProps[] = [
    {
      icon: User,
      label: "Full Name",
      value: getFullName(),
    },
    {
      icon: Mail,
      label: "Email",
      value: userDetails.email || "Not provided",
    },
    {
      icon: Phone,
      label: "Phone",
      value: formatPhone(),
    },
    {
      icon: Calendar,
      label: "Date of Birth",
      value: formatDate(userDetails.dob),
    },
    {
      icon: User,
      label: "Gender",
      value: getGenderText(),
    },
  ];

  if (userDetails.jobTitle) {
    infoItems.push({
      icon: Briefcase,
      label: "Profession",
      value: userDetails.jobTitle,
    });
  }

  if (userDetails.languages?.length > 0) {
    infoItems.push({
      icon: Globe,
      label: "Languages",
      value: userDetails.languages.join(", "),
    });
  }

  const bussinessNameObj = {
    label: "Business Name",
    value: userDetails.businessName,
  };
  const nonBussinessNameObj = {
    label: "Name",
    value: getFullName(),
  };

  const name = userDetails.businessName
    ? bussinessNameObj
    : nonBussinessNameObj;

  const additionalInfo = [
    name,
    { label: "PAN Number", value: userDetails.panNumber },
    { label: "GST Number", value: userDetails.gstNumber },
  ].filter((item) => item.value);

  // logic to update about section
  const handleUpdateAbout = async () => {
    if (!userDetails.id) return;

    try {
      setLoading(true);

      const response = await updateUserAbout({
        userId: userDetails.id,
        about: aboutText,
      });
      if (response.status === 200) {
        setDisplayAbout(aboutText);
        toast.success("User 'About' section updated successfully");
        setIsEditing(false);
      }

    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card className="shadow-sm h-fit">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <p className="text-sm text-gray-500">User details & contact</p>
          </div>
        </div>

        <div className="space-y-1">
          {infoItems.map((item, index) => (
            <InfoItem
              key={index}
              icon={item.icon}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>

        {userDetails.panNumber && additionalInfo.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Business Details
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {additionalInfo.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(displayAbout || isEditing) && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-700">About</h4>
              </div>
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <Edit2 className="h-4 w-4 text-gray-500" />
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUpdateAbout}
                    disabled={loading}
                    className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <Textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="min-h-[100px] text-sm resize-none bg-white"
                placeholder="Enter user bio..."
                disabled={loading}
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {displayAbout || "No about information provided."}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPersonalInfo;
