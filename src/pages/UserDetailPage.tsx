import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Banknote,
  Building,
  CreditCard,
  FileText,
  IdCard,
  Car,
  Globe,
  Calendar,
  Eye,
  Upload,
  ShieldCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { UserDetails } from "@/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  GuestDashboard,
  KYCDocumentsSection,
  UserPersonalInfo,
  UserProfileHeader,
  UserRoleTabs,
} from "@/components";
import HostDashboard from "@/components/specific/userManagement/userDetails/HostDashboard";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { handleApiError } from "@/hooks";
import { getUserDetails, updateUserCashfreeVerification } from "@/utils/services/userManagement.services";
import { uploadImage } from "@/utils/services/auth.services";

const PageHeader = ({ onGoBack }: { onGoBack: () => void }) => (
  <Button
    variant="default"
    onClick={onGoBack}
    className="rounded-full border-0 outline-none shadow-none"
  >
    <ArrowLeft className="h-4 w-4" />
  </Button>
);

const DashboardView = ({
  userDetails,
  activeRoleTab,
  onRoleTabChange,
}: {
  userDetails: UserDetails;
  activeRoleTab: "guest" | "host";
  onRoleTabChange: (tab: "guest" | "host") => void;
}) => (
  <Card className="border shadow-lg rounded-2xl overflow-hidden">
    <CardContent className="p-0">
      {userDetails.role === "both" && (
        <div className="border-b">
          <UserRoleTabs
            activeTab={activeRoleTab}
            onTabChange={onRoleTabChange}
          />
        </div>
      )}

      <div className="p-6">
        {userDetails.role === "guest" ||
        (userDetails.role === "both" && activeRoleTab === "guest") ? (
          <GuestDashboard userId={userDetails.id} />
        ) : (
          <HostDashboard userId={String(userDetails.id)} />
        )}
      </div>
    </CardContent>
  </Card>
);

const BankDetailsSection = ({ userDetails }: { userDetails: UserDetails }) => {
  if (
    !userDetails?.UserBankAccounts ||
    userDetails.UserBankAccounts.length === 0
  ) {
    return (
      <Card className="border shadow-md rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Bank Account Details</h3>
          </div>
          <p className="text-gray-500 text-center py-4">
            No bank account added
          </p>
        </CardContent>
      </Card>
    );
  }

  const primaryAccount =
    userDetails.UserBankAccounts.find((acc) => acc.isPrimary) ||
    userDetails.UserBankAccounts[0];

  return (
    <Card className="border shadow-md rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Bank Account Details</h3>
          </div>
          {primaryAccount?.isPrimary && (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Primary
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Bank Name
              </span>
            </div>
            <span className="font-medium">{primaryAccount.bankName}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Account Holder
              </span>
            </div>
            <span className="font-medium">
              {primaryAccount.accountHolderName}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Account Number
              </span>
            </div>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
              {primaryAccount.accountNumber}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Account Type
            </span>
            <Badge variant="outline" className="capitalize">
              {primaryAccount.type}
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">IFSC Code</span>
            <span className="font-mono">{primaryAccount.ifscCode}</span>
          </div>
        </div>

        {userDetails.UserBankAccounts.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">
              {userDetails.UserBankAccounts.length - 1} more bank account(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const VerificationDialog = ({
  userDetails,
  open,
  onOpenChange,
  onSuccess,
}: {
  userDetails: UserDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<any | null>(null);
  const [docLink, setDocLink] = useState<string | null>(null);
  const [idType, setIdType] = useState<string>("aadhaar");
  const [idNumber, setIdNumber] = useState("");


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      setDocLink(URL.createObjectURL(selectedFile));
    } else {
      setDocLink(null);
    }

    try {
      setIsUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("files", selectedFile);

      const uploadRes = await uploadImage(uploadFormData);
      const data = uploadRes.data?.data?.[0];

      if (!data?.url) {
        toast.error("Failed to upload image. Please try again.");
        handleCancelFile();
        return;
      }

      setUploadedFileData(data);
      toast.success("File uploaded successfully");
    } catch (error) {
      handleApiError(error);
      toast.error("Failed to upload file");
      handleCancelFile();
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelFile = () => {
    setFile(null);
    setDocLink(null);
    setUploadedFileData(null);
  };

  const handleUpdate = async () => {
    if (!userDetails.id || !idNumber) {
      toast.error("Please fill all fields");
      return;
    }

    if (!uploadedFileData) {
      if (isUploading) {
        toast.info("Please wait for the file to finish uploading");
      } else {
        toast.error("Please upload a file first");
      }
      return;
    }



    try {
      setLoading(true);

      // Send the image and other details as a JSON object to the verification API
      const payload = {
        type: idType,
        doc_number: idNumber,
        doc_url: uploadedFileData.url,
      };

      await updateUserCashfreeVerification(userDetails.id, payload);
      toast.success("Verification data submitted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      handleApiError(error);
      toast.error("Failed to submit verification data");
    } finally {
      setLoading(false);
    }
  };

  const idTypeLabel = idType === "aadhaar" ? "Aadhar Card" : idType === "passport" ? "Passport" : "Driving License";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl max-h-[95vh] flex flex-col">
        <DialogHeader className="p-6 pb-0 flex flex-col items-center shrink-0">
          <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-yellow-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Upload your {idTypeLabel}
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-2 text-center px-6">
            ID Proof (Aadhar, Driving License, Passport)
          </p>
          <p className="text-sm text-gray-500 text-center pb-4">
            File Upload (Max 5 MB, Formats: JPG, JPEG, PNG, PDF)
          </p>
        </DialogHeader>

        <div className="p-8 space-y-6 overflow-y-auto">
          {file ? (
            docLink ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <img src={docLink} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={handleCancelFile}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {isUploading ? "Uploading..." : "Ready to upload"}
                    </span>
                  </div>
                </div>
                <button onClick={handleCancelFile} className="text-red-500 hover:text-red-600 transition-colors p-1">
                  <X size={18} />
                </button>
              </div>
            )
          ) : (
            <div
              className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/10 transition-all bg-gray-50/50"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <span className="text-blue-500 font-medium text-sm">
                Click to choose file
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">ID Type</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger className="w-full h-12 bg-white rounded-xl border-gray-200 focus:ring-yellow-400">
                  <SelectValue placeholder="Select ID Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar">Aadhar Card</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="dl">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">
                {idType === "aadhaar" ? "Aadhar Number" : idType === "passport" ? "Passport File No." : "DL Number"}
              </Label>
              <Input
                placeholder={idType === "aadhaar" ? "Enter Aadhar Number" : idType === "passport" ? "Enter Passport File No." : "Enter DL Number"}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full h-12 bg-white rounded-xl border-gray-200 focus:ring-yellow-400 placeholder:text-gray-300"
              />
            </div>


          </div>

          <Button
            className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg rounded-full mt-4 shadow-lg shadow-yellow-100 transition-all active:scale-[0.98]"
            onClick={handleUpdate}
            disabled={loading || isUploading}
          >
            {loading ? "Processing..." : isUploading ? "Uploading File..." : "Verify ID"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CashfreeVerificationSection = ({
  userDetails,
  onVerifyClick,
}: {
  userDetails: UserDetails;
  onVerifyClick: () => void;
}) => {
  return (
    <Card className="border shadow-md rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Cashfree Verification</h3>
          </div>
          {userDetails.isVerified && (
            <Badge className="bg-green-600 hover:bg-green-700 border-0 text-white">
              Verified
            </Badge>
          )}
        </div>

        {userDetails.isVerified ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">Identity Verified</p>
            <p className="text-xs text-gray-500 mt-1">User has successfully completed KYC verification</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Identity verification is required for this user to participate in all activities.
            </p>
            <Button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl"
              onClick={onVerifyClick}
            >
              Verify Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<"guest" | "host">("guest");
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);

  const handleCashfreeUpdate = (userId: string, isVerified: boolean) => {
    if (userDetails) {
      setUserDetails({ ...userDetails, isVerified });
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetails(id);
    }
  }, [id]);

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserDetails(userId);

      const success = response?.data?.success;
      const apiData = response?.data?.data;

      if (!success || !apiData) {
        setError("User details not available");
        return;
      }

      const roles = apiData.Roles ?? [];
      const isHost = roles.some((role: any) => role?.name === "host");

      const userDetailsData: UserDetails = {
        id: apiData.id ?? 0,
        firstName: apiData.firstName ?? "",
        lastName: apiData.lastName ?? "",
        dob: apiData.dob ?? null,
        gender: apiData.gender ?? null,
        countryCode: apiData.countryCode ?? null,
        phoneNumber: apiData.phoneNumber ?? null,
        isPhoneVerified: Boolean(apiData.isPhoneVerified),
        email: apiData.email ?? "",
        isEmailVerified: Boolean(apiData.isEmailVerified),
        isProfileCompleted: Boolean(apiData.isProfileCompleted),
        isVerified: Boolean(apiData.isVerified),
        socialMediaId: apiData.socialMediaId ?? null,
        agreedTnc: Boolean(apiData.agreedTnc),
        avatar: apiData.avatar ?? null,
        panNumber: apiData.panNumber ?? null,
        gstNumber: apiData.gstNumber ?? null,
        payout: apiData.payout ?? {},
        businessName: apiData.businessName ?? null,
        payoutBusiness: apiData.payoutBusiness ?? null,
        address: apiData.address ?? {},
        cityId: apiData.cityId ?? null,
        jobTitle: apiData.jobTitle ?? null,
        languages: apiData.languages ?? [],
        about: apiData.about ?? null,
        status: apiData.status ?? "active",
        averageRating: apiData.averageRating ?? 0,
        hostResponseTime: apiData.hostResponseTime ?? null,
        created_at: apiData.created_at ?? "",
        updated_at: apiData.updated_at ?? "",
        deleted_at: apiData.deleted_at ?? null,
        city_id: apiData.city_id ?? null,
        City: apiData.City ?? undefined,
        Roles: roles,
        UserBankAccounts: apiData.UserBankAccounts ?? [],
        UserKycs: apiData.UserKycs ?? [],
        guestRating: apiData.guestRating ?? apiData.averageRating ?? 0,
        hostRating: apiData.hostRating ?? apiData.averageRating ?? 0,
        role: isHost ? "both" : "guest",
      };

      setUserDetails(userDetailsData);

      if (userDetailsData.role === "both") {
        setActiveRoleTab("host");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load user details";
      setError(errorMessage);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => navigate(-1);

  if (loading) {
    return (
      <DashboardLayout title="User Management">
        <div className="space-y-6 flex items-center">
          <div className="animate-pulse">
            <p>Loading user details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !userDetails) {
    return (
      <DashboardLayout title="User Management">
        <div className="space-y-6">
          <PageHeader onGoBack={handleGoBack} />
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error || "User not found"}</p>
            <Button onClick={() => id && fetchUserDetails(id)}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        <PageHeader onGoBack={handleGoBack} />

        <UserProfileHeader userDetails={userDetails} />
        <VerificationDialog
          userDetails={userDetails}
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
          onSuccess={() => handleCashfreeUpdate(String(userDetails.id), true)}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <UserPersonalInfo userDetails={userDetails} />
            <CashfreeVerificationSection
              userDetails={userDetails}
              onVerifyClick={() => setIsVerificationDialogOpen(true)}
            />
            <BankDetailsSection userDetails={userDetails} />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-3">
            <KYCDocumentsSection userDetails={userDetails} />
            <DashboardView
              userDetails={userDetails}
              activeRoleTab={activeRoleTab}
              onRoleTabChange={setActiveRoleTab}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailPage;
