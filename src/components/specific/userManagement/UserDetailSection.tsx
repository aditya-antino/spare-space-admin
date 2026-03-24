import React from "react";

interface UserDetailsSectionProps {
  title: string;
  children: React.ReactNode;
}
const UserDetailSection: React.FC<UserDetailsSectionProps> = ({
  title,
  children,
}) => (
  <section>
    <h3 className="font-semibold text-base mb-2">{title}</h3>
    <div className="grid grid-cols-2 gap-4">{children}</div>
  </section>
);

export default UserDetailSection;
