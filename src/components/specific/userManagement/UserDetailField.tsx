import React from "react";

interface UserDetailFieldProps {
  label: string;
  value: React.ReactNode | string;
}

const UserDetailField: React.FC<UserDetailFieldProps> = ({ label, value }) => (
  <div>
    <p className="font-medium">{label}</p>
    <p className="text-muted-foreground break-words">{value || "-"}</p>
  </div>
);

export default UserDetailField;
