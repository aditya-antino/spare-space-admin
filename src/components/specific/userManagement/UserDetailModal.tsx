import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { capitalizeWord } from "@/hooks";
import { UserDetails } from "@/types";
import UserDetailSection from "./UserDetailSection";
import UserDetailField from "./UserDetailField";
import UserBankAccountsSection from "./UserBankAccountsSection";
import UserKycSection from "./UserKycSection";
import UserRoleBadgeComp from "./UserRoleBadgeComp";

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  userDetails: UserDetails;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  open,
  onOpenChange,
  userDetails,
}) => {
  if (!userDetails) return null;

  const formatedDOB = userDetails.dob
    ? new Date(userDetails.dob).toLocaleDateString()
    : "-";

  const userRoles =
    userDetails.Roles?.map((r) => capitalizeWord(r.name)).join(", ") || "-";

  const handleCloseUserModal = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle>
            {capitalizeWord(userDetails.firstName)}{" "}
            {capitalizeWord(userDetails.lastName)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 text-sm">
          <UserDetailSection title="Basic Info">
            <UserDetailField label="Email" value={userDetails.email} />
            <UserDetailField
              label="Phone"
              value={
                userDetails.countryCode
                  ? `+${userDetails.countryCode}-${userDetails.phoneNumber}`
                  : userDetails.phoneNumber || "-"
              }
            />
            <UserDetailField
              label="Gender"
              value={capitalizeWord(userDetails.gender)}
            />
            <UserDetailField label="DOB" value={formatedDOB} />
            <UserDetailField
              label="Status"
              value={
                <span
                  className={
                    userDetails.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {capitalizeWord(userDetails.status)}
                </span>
              }
            />
            <UserDetailField
              label="Role"
              value={<UserRoleBadgeComp role={userDetails.role} />}
            />
            <UserDetailField
              label="PAN Number"
              value={userDetails.panNumber || "-"}
            />
            <UserDetailField
              label="GST Number"
              value={userDetails.gstNumber || "-"}
            />
            <UserDetailField
              label="Job Title"
              value={userDetails.jobTitle || "-"}
            />
          </UserDetailSection>

          {/* ADDRESS */}
          {userDetails.address && (
            <UserDetailSection title="Address">
              <UserDetailField
                label="Line 1"
                value={userDetails.address.line1}
              />
              <UserDetailField
                label="Line 2"
                value={userDetails.address.line2}
              />
              <UserDetailField label="City" value={userDetails.address.city} />
              <UserDetailField
                label="State"
                value={userDetails.address.state}
              />
              <UserDetailField
                label="Country"
                value={userDetails.address.country}
              />
              <UserDetailField
                label="Pincode"
                value={userDetails.address.pincode}
              />
            </UserDetailSection>
          )}

          {/* PAYOUT */}
          {userDetails.payout && (
            <UserDetailSection title="Payout Details">
              <UserDetailField label="Type" value={userDetails.payout.type} />
              <UserDetailField
                label="First Name"
                value={userDetails.payout.firstName}
              />
              <UserDetailField
                label="Last Name"
                value={userDetails.payout.lastName}
              />
              <UserDetailField label="Email" value={userDetails.payout.email} />
              <UserDetailField
                label="Phone"
                value={userDetails.payout.phoneNumber}
              />
              <UserDetailField
                label="Citizenship"
                value={userDetails.payout.citizenship}
              />
              <UserDetailField
                label="Country of Birth"
                value={userDetails.payout.countryOfBirth}
              />
            </UserDetailSection>
          )}

          {/* BANK ACCOUNTS */}
          <UserBankAccountsSection accounts={userDetails.UserBankAccounts} />

          {/* KYCs */}
          <UserKycSection kycs={userDetails.UserKycs} />

          {/* LANGUAGES */}
          {userDetails.languages?.length > 0 && (
            <UserDetailSection title="Languages">
              <UserDetailField
                label="Languages"
                value={userDetails.languages.join(", ")}
              />
            </UserDetailSection>
          )}

          {/* ABOUT */}
          {userDetails.about && (
            <UserDetailSection title="About">
              <UserDetailField label="About" value={userDetails.about} />
            </UserDetailSection>
          )}

          {/* ROLES */}
          {userDetails.Roles?.length > 0 && (
            <UserDetailSection title="Roles">
              <UserDetailField label="Roles" value={userRoles} />
            </UserDetailSection>
          )}

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleCloseUserModal}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
