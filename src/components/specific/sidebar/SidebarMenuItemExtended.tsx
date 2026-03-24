import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types";

interface MenuItemExpandedProps {
  item: MenuItem;
  isActive: boolean;
  isOpen: boolean;
  onSubMenuClick: (label: string, hasChildren: boolean) => void;
}

const SidebarMenuItemExtended = ({
  item,
  isActive,
  isOpen,
  onSubMenuClick,
}: MenuItemExpandedProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const Icon = item.icon;

  const handleClick = () => {
    if (item.children) {
      onSubMenuClick(item.label, true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <li>
      <Button
        onClick={handleClick}
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-between h-10 my-1 hover:bg-primary-tint2 hover:text-primary transition-colors",
          isActive &&
            "bg-primary-tint5 text-primary border-r-4 border-primary-p1"
        )}
      >
        <div className="flex items-center pointer-events-none">
          <Icon size={20} className="mr-2" />
          <span className="flex-1 text-left">{item.label}</span>
        </div>
        {item.children &&
          (isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
      </Button>

      {item.children && (
        <ul
          className={cn(
            "overflow-hidden transition-all duration-300 ml-8 space-y-1",
            isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {item.children.map((sub) => {
            const isSubActive = location.pathname.includes(sub.path);
            return (
              <li key={sub.path}>
                <Button
                  onClick={() => navigate(sub.path)}
                  variant={isSubActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-9 text-sm hover:bg-primary-tint2 hover:text-primary",
                    isSubActive &&
                      "bg-primary-tint5 text-primary border-r-4 border-primary-p1"
                  )}
                >
                  {sub.label}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default SidebarMenuItemExtended;
