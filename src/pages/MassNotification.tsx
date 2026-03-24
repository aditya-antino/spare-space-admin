import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Send, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { handleApiError, useDebounce } from "@/hooks";
import {
  getNotifcationsHistory,
  sendPushNotification,
} from "@/utils/services/notifications.services";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { NotificationDetailsModal } from "@/components";
import { NotificationType } from "@/types";

type RecipientType = "GUEST" | "HOST" | "GLOBAL";

const recipientOptions: { label: string; value: RecipientType }[] = [
  { label: "Guest", value: "GUEST" },
  { label: "Host", value: "HOST" },
  { label: "All", value: "GLOBAL" },
];

const MassNotification = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    recipientType: "GLOBAL" as RecipientType,
    date: new Date(),
  });

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationType | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const fetchNotificationHistory = async (page: number, query?: string) => {
    try {
      setLoading(true);
      const response = await getNotifcationsHistory(page, query);
      if (response.status === 200) {
        const { data: notificationData, pagination: paginationData } =
          response.data.data;
        setNotifications(notificationData || []);
        setPagination({
          totalPages: paginationData?.totalPages || 1,
          currentPage: paginationData?.currentPage || 1,
        });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedHandleSearch = useDebounce((query: string) => {
    fetchNotificationHistory(1, query);
  }, 500);

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    debouncedHandleSearch(query);
  };

  useEffect(() => {
    fetchNotificationHistory(pagination.currentPage, null);
  }, [pagination.currentPage]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendNotification = async () => {
    if (!form.title || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSendingNotification(true);
      const payload = {
        type: form.recipientType,
        title: form.title,
        description: form.description,
        date: form.date,
        url: form.url,
      };
      const response = await sendPushNotification(payload);

      if (response.status === 200) {
        toast.success(fallbackMessages.notificationSendSuccess.title, {
          description: fallbackMessages.notificationSendSuccess.desc,
        });
        setForm({
          title: "",
          description: "",
          url: "",
          recipientType: "GLOBAL",
          date: new Date(),
        });
        fetchNotificationHistory(pagination.currentPage, searchQuery);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSendingNotification(false);
    }
  };

  const handleViewDetails = (notification: NotificationType) => {
    setSelectedNotification(notification);
    setDetailsDialogOpen(true);
  };

  const columns = [
    {
      key: "title",
      header: "Title",
      cell: (notification: NotificationType) => (
        <div className="font-medium">{notification.title}</div>
      ),
    },
    {
      key: "date",
      header: "Date Sent",
      cell: (notification: NotificationType) => (
        <div>{format(new Date(notification.date), "dd MMM yyyy")}</div>
      ),
    },
    {
      key: "type",
      header: "Recipients",
      cell: (notification: NotificationType) => {
        const option = recipientOptions.find(
          (opt) => opt.value === notification.type
        );
        const label = option?.label ?? notification.type;
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Action",
      cell: (notification: NotificationType) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(notification)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout title="Mass Notification">
      <div className="space-y-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Send New Notification</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="default"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date ? format(form.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.date}
                    onSelect={(d) => d && handleChange("date", d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients">Send To</Label>
              <Select
                value={form.recipientType}
                onValueChange={(v) =>
                  handleChange("recipientType", v as RecipientType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient">
                    {
                      recipientOptions.find(
                        (option) => option.value === form.recipientType
                      )?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {recipientOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter notification content"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                placeholder="https://example.com/page"
                value={form.url}
                onChange={(e) => handleChange("url", e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              onClick={handleSendNotification}
              disabled={sendingNotification}
              className="flex items-center gap-2 bg-primary text-primary-foreground"
            >
              {sendingNotification ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Notification
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notification History</h2>
          <DataTable
            data={notifications}
            columns={columns}
            searchable
            loading={loading}
            searchPlaceholder="Search by title or date..."
            handleSearch={handleSearchInput}
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, currentPage: page }))
            }
          />
        </div>
      </div>

      <NotificationDetailsModal
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        notification={selectedNotification}
      />
    </DashboardLayout>
  );
};

export default MassNotification;
