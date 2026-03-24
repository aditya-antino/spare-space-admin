import UserDetailField from "./UserDetailField";
import UserDetailSection from "./UserDetailSection";
import { capitalizeWord } from "@/hooks";

interface BankAccount {
  id: number;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
  accountHolderName: string;
  type: string;
  isPrimary: boolean;
}

const UserBankAccountsSection = ({
  accounts,
}: {
  accounts?: BankAccount[];
}) => {
  if (!accounts || accounts.length === 0) return null;

  return (
    <UserDetailSection title="Bank Accounts">
      {accounts.map((bank) => (
        <div
          key={bank.id}
          className="col-span-2 border p-3 rounded-md grid grid-cols-2 gap-4"
        >
          <UserDetailField
            label="Bank Name"
            value={capitalizeWord(bank.bankName || "-")}
          />
          <UserDetailField label="IFSC Code" value={bank.ifscCode || "-"} />
          <UserDetailField label="Account Number" value={bank.accountNumber || "-"} />
          <UserDetailField label="Holder Name" value={bank.accountHolderName || "-"} />
          <UserDetailField
            label="Type"
            value={capitalizeWord(bank.type || "-")}
          />
          <UserDetailField
            label="Primary"
            value={bank.isPrimary ? "Yes" : "No"}
          />
        </div>
      ))}
    </UserDetailSection>
  );
};

export default UserBankAccountsSection;
