import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useLocation } from "react-router-dom";
import {
  SidebarMenuItemCollapsed,
  SidebarMenuItemExpanded,
} from "../../../components";
import { SIDEBAR_MENU_ITEMS } from "@/constants";

interface SidebarNavigationProps {
  collapsed: boolean;
  openSubMenu: string | null;
  onSubMenuClick: (label: string, hasChildren: boolean) => void;
}

const SidebarNavigation = ({
  collapsed,
  openSubMenu,
  onSubMenuClick,
}: SidebarNavigationProps) => {
  const location = useLocation();
  const roles = useSelector((state: RootState) => state.user.user?.roles || []);
  const isMarketing = roles.includes("marketing");
  const isAdmin = roles.includes("admin");

  const filteredMenuItems = SIDEBAR_MENU_ITEMS.filter((item) => {
    if (isMarketing && !isAdmin) {
      return (
        item.label === "Blogs" ||
        item.label === "Articles" ||
        item.label === "Pages"
      );
    }
    return true;
  });

  return (
    <nav className="flex-1 py-4 overflow-y-auto my-2 hide-scrollbar">
      <ul className="space-y-1 px-2">
        {filteredMenuItems.map((item) => {
          const isActive =
            location.pathname.includes(item.path) ||
            item.children?.some((child) =>
              location.pathname.includes(child.path)
            );
          const isOpen = openSubMenu === item.label;

          if (collapsed) {
            return (
              <SidebarMenuItemCollapsed
                key={item.path}
                item={item}
                isActive={isActive}
                isOpen={isOpen}
                onSubMenuClick={onSubMenuClick}
              />
            );
          }

          return (
            <SidebarMenuItemExpanded
              key={item.path}
              item={item}
              isActive={isActive}
              isOpen={isOpen}
              onSubMenuClick={onSubMenuClick}
            />
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNavigation;
