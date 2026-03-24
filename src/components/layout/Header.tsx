import { useState, useEffect } from "react";
import { Bell, LogOut, User, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { clearUser } from "@/store/slices/userSlice";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import NotificationDropdown from "../specific/dropdown/NotificationDropdown";
import { handleApiError } from "@/hooks";
import { getPlatformNotificationCount } from "@/utils/services/notifications.services";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const navigation = useNavigate();
  const userDetails = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch<AppDispatch>();
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotificationCount = async () => {
    try {
      const response = await getPlatformNotificationCount();
      if (response.status === 200) {
        setNotificationCount(response.data.count || 0);
      }
    } catch (error) {
      handleApiError(error);
    }
  };
  useEffect(() => {
    fetchNotificationCount();

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(clearUser());
    toast.success(fallbackMessages.logoutSuccess);
  };

  const handleClickProfile = () => {
    navigation(ROUTES.profile);
  };

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-4">
        <NotificationDropdown
          count={notificationCount}
          setCount={setNotificationCount}
        />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 hover:cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    userDetails.avatar ||
                    "https://storage.googleapis.com/fenado-ai-farm-public/generated/9d46f050-dca1-455e-8cac-a5a29aa63331.webp"
                  }
                />
                <AvatarFallback>
                  {userDetails?.firstName?.[0] || "-"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-sm">
                <span className="font-medium select-none">
                  {userDetails?.firstName || "User"}
                </span>
                <span className="text-xs text-muted-foreground select-none">
                  {userDetails?.email || "-"}
                </span>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleClickProfile}
            >
              <User size={16} className="mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer focus:bg-danger-tint1"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
