import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/hooks";
import {
  getPlatformNotification,
  markAllPlatformNotificationRead,
} from "@/utils/services/notifications.services";
import { Bell, Check, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  description: string;
  type: string;
  userId: number;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: number;
}

interface NotificationDropdownProps {
  count: number;
  setCount: (count: number) => void;
}

const NotificationDropdown = ({
  count,
  setCount,
}: NotificationDropdownProps) => {
  const [loadingNotification, setLoadingNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await getPlatformNotification();
      if (response.status === 200) {
        const notificationData = response.data.data || [];
        setNotifications(notificationData);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingNotifications(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const getAllNotificationIds = (): string => {
    const unreadIds = notificationItems.map((notification) => notification.key);
    return unreadIds.join(",");
  };

  const markAllAsRead = async () => {
    try {
      const notificationIdsString = getAllNotificationIds();

      if (notificationIdsString) {
        const response = await markAllPlatformNotificationRead(
          notificationIdsString
        );

        if (response.status === 200) {
          fetchNotifications();
          setCount(0);
          toast.success("All notifications marked as read", {
            description: "You have no new notifications",
            icon: <Check className="h-4 w-4" />,
          });
        }
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleRefreshClick = () => {
    fetchNotifications();
  };

  const skeletons = [...Array(3)].map((_, index) => (
    <div key={index} className="flex items-start space-x-3 p-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  ));

  const emptyState = (
    <div className="py-8 text-center text-tertiary-t3">
      <Bell size={28} className="mx-auto mb-2 text-tertiary-t3 opacity-50" />
      <p className="text-sm">No notifications</p>
    </div>
  );

  const notificationItems = notifications.map((notification) => (
    <DropdownMenuItem
      key={notification.id}
      className="p-3 hover:bg-primary-tint5 focus:bg-primary-tint5 border-b border-secondary-s2 last:border-b-0"
      onSelect={(event) => event.preventDefault()}
    >
      <div className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div
              className={`font-medium text-tertiary-t1 text-sm leading-tight ${
                notification.is_read ? "opacity-70" : ""
              }`}
            >
              {notification.title}
            </div>
            <div className="text-xs text-tertiary-t3 mt-1 line-clamp-2 leading-relaxed">
              {notification.description}
            </div>
            <div className="text-xs text-tertiary-t3 mt-2">
              {new Date(notification.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          {!notification.is_read && (
            <div className="h-2 w-2 bg-danger-d1 rounded-full mt-1 flex-shrink-0" />
          )}
        </div>
      </div>
    </DropdownMenuItem>
  ));

  const markAllReadButton =
    count > 0 ? (
      <Button
        variant="destructive"
        size="sm"
        onClick={markAllAsRead}
        disabled={loadingNotification}
      >
        Mark all read
      </Button>
    ) : null;

  const content = loadingNotification ? (
    <div className="space-y-2">{skeletons}</div>
  ) : notifications.length === 0 ? (
    emptyState
  ) : (
    notificationItems
  );

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <button className="relative hover:bg-primary-tint5 outline-none">
            <Bell size={22} />
            {count > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-danger-d1 text-secondary-s1 text-xs">
                {count}
              </Badge>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 bg-white border border-secondary-s2 rounded-lg shadow-lg max-h-96 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-s2 sticky top-0 bg-white z-10">
            <h3 className="font-semibold text-tertiary-t1">Notifications</h3>
            <div className="flex items-center gap-2">
              {markAllReadButton}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshClick}
                disabled={loadingNotification}
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  size={14}
                  className={loadingNotification ? "animate-spin" : ""}
                />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {content}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationDropdown;
