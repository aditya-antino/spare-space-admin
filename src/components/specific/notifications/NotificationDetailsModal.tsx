import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { NotificationType } from "@/types";

interface NotificationDetailsModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  notification: NotificationType | null;
}

const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  open,
  onOpenChange,
  notification,
}) => {
  if (!notification) return null;

  const formattedDate = notification.date
    ? format(new Date(notification.date), "PPP p")
    : "Unknown date";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
          <DialogDescription>
            Sent on <strong>{formattedDate}</strong> by{" "}
            <strong>{notification.User?.firstName}</strong> (
            {notification.User?.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pb-4 overflow-y-auto max-h-[60vh] pr-2 scrollbar-hide">
          <div className="bg-primary-tint3 rounded-lg p-4">
            <p className="whitespace-pre-wrap">{notification.description}</p>
          </div>

          {notification.url && (
            <div className="flex items-center gap-2 text-black">
              <Info className="h-6 w-6" />
              <Link
                to={notification.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all text-xs"
              >
                {notification.url}
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailsModal;
