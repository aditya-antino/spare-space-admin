import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";
import { logo } from "@/assets";

interface SidebarHeaderProps {
  collapsed: boolean;
}

const SidebarHeader = ({ collapsed }: SidebarHeaderProps) => {
  return (
    <div className="p-4 flex items-center justify-center border-b border-border">
      <Link to={ROUTES.users} className="flex items-center gap-2">
        <img
          src={logo}
          alt="Spare Space Logo"
          className="h-8 w-8 object-contain"
        />
        {!collapsed && (
          <span className="text-lg font-semibold text-primary">
            Spare Space
          </span>
        )}
      </Link>
    </div>
  );
};

export default SidebarHeader;
