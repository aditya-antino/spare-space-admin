import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MenuItem } from "@/types";

interface MenuItemCollapsedProps {
  item: MenuItem;
  isActive: boolean;
  isOpen: boolean;
  onSubMenuClick: (label: string, hasChildren: boolean) => void;
}

const SidebarMenuItemCollapsed = ({
  item,
  isActive,
  isOpen,
  onSubMenuClick,
}: MenuItemCollapsedProps) => {
  const location = useLocation();
  const Icon = item.icon;

  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => item.children && onSubMenuClick(item.label, true)}
            variant={isActive ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "w-full h-10 my-1 hover:bg-primary-tint2 hover:text-primary",
              isActive &&
                "bg-primary-tint5 text-primary border-r-4 border-primary-p1"
            )}
          >
            <Link to={item.path}>
              <Icon size={20} />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>

      {item.children && isOpen && (
        <ul className="ml-2 mt-1 space-y-1">
          {item.children.map((sub) => {
            const isSubActive = location.pathname.includes(sub.path);
            return (
              <li key={sub.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={sub.path}>
                      <Button
                        variant={isSubActive ? "secondary" : "ghost"}
                        size="icon"
                        className={cn(
                          "w-full h-9 hover:bg-primary-tint2 hover:text-primary",
                          isSubActive &&
                            "bg-primary-tint5 text-primary border-r-4 border-primary-p1"
                        )}
                      >
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{sub.label}</TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default SidebarMenuItemCollapsed;
