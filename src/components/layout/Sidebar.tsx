import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarHeader, SidebarNavigation } from "../../components";
import { SIDEBAR_MENU_ITEMS } from "@/constants";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [manuallyToggledSubMenu, setManuallyToggledSubMenu] = useState<
    string | null
  >(null);
  const location = useLocation();

  const activeParent = SIDEBAR_MENU_ITEMS.find((item) =>
    item.children?.some((child) => location.pathname.includes(child.path))
  );

  const openSubMenu = activeParent
    ? activeParent.label
    : manuallyToggledSubMenu;

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const handleSubMenuClick = (label: string, hasChildren: boolean) => {
    if (!hasChildren) return;
    setManuallyToggledSubMenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col min-h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarHeader collapsed={collapsed} />

      <SidebarNavigation
        collapsed={collapsed}
        openSubMenu={openSubMenu}
        onSubMenuClick={handleSubMenuClick}
      />

      <div className="p-2 border-t border-border">
        <div
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center hover:cursor-pointer text-muted-foreground"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
