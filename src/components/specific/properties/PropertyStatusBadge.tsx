const PropertyStatusBadge = ({
  status,
}: {
  status: "approved" | "rejected" | "pending";
}) => {
  return (
    <div>
      {status === "approved" && (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
          Approved
        </span>
      )}
      {status === "pending" && (
        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 text-xs rounded-full">
          Pending
        </span>
      )}
      {status === "rejected" && (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full">
          Rejected
        </span>
      )}
    </div>
  );
};

export default PropertyStatusBadge;
