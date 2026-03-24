
import React from "react";
import { User, Home } from "lucide-react";

interface UserRoleTabsProps {
  activeTab: "guest" | "host";
  onTabChange: (tab: "guest" | "host") => void;
}

const UserRoleTabs: React.FC<UserRoleTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex border-b">
      <button
        onClick={() => onTabChange("guest")}
        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
          activeTab === "guest"
            ? "border-blue-500 text-blue-600 bg-blue-50"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <User className="h-4 w-4" />
          Guest Dashboard
        </div>
      </button>

      <button
        onClick={() => onTabChange("host")}
        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
          activeTab === "host"
            ? "border-purple-500 text-purple-600 bg-purple-50"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <Home className="h-4 w-4" />
          Host Dashboard
        </div>
      </button>
    </div>
  );
};

export default UserRoleTabs;
