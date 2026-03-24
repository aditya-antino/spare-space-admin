const UserRoleBadge = ({ role }: { role: "host" | "user" | "both" }) => {
  return (
    <>
      {role === "host" && (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
          Host
        </span>
      )}
      {role === "user" && (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
          User
        </span>
      )}
      {role === "both" && (
        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-xs rounded-full">
          Both
        </span>
      )}
      {role !== "both" && role !== "host" && role !== "user" && (
        <span className="px-2 py-1 text-xs text-center">-</span>
      )}
    </>
  );
};

export default UserRoleBadge;
