import UserDetailField from "./UserDetailField";
import UserDetailSection from "./UserDetailSection";
import { capitalizeWord } from "@/hooks";

interface Kyc {
  id: number;
  type: string;
  docNumber: string;
  isVerified: boolean;
  docLink: string;
  verificationId?: string;
  userName?: string;
  idName?: string | null;
  nameVerified?: boolean;
  created_at?: string;
  updated_at?: string;
}

const UserKycSection = ({ kycs }: { kycs?: Kyc[] }) => {
  const verifiedKycs = kycs?.filter((kyc) => kyc.isVerified) || [];

  if (verifiedKycs.length === 0) return null;

  return (
    <UserDetailSection title="KYC Documents">
      {verifiedKycs.map((kyc) => (
        <div
          key={kyc.id}
          className="col-span-2 border p-3 rounded-md grid grid-cols-2 gap-4"
        >
          <UserDetailField
            label="Type"
            value={capitalizeWord(kyc.type || "")}
          />
          <UserDetailField label="Doc Number" value={kyc.docNumber} />
          <UserDetailField label="Verified" value="Yes" />
          {kyc.docLink && (
            <UserDetailField
              label="Doc Link"
              value={
                <a
                  href={kyc.docLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              }
            />
          )}
        </div>
      ))}
    </UserDetailSection>
  );
};

export default UserKycSection;
