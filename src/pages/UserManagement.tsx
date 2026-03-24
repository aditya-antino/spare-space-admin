import { useCallback, useEffect, useState } from "react";
import { Download, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";
import { capitalizeWord, handleApiError, useDebounce } from "@/hooks";
import {
  downloadUserListCSV,
  getUserList,
  searchUsers,
  toggleUserStatus,
} from "@/utils/services/userManagement.services";
import {
  UserCountTiles,
  UserDetailModal,
  UserRoleBadgeComp,
} from "@/components";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { UserDetails } from "@/types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [exportCSVLoading, setExportCSVLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userDetailsDialogOpen, setUserDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      fetchUsers(pagination.currentPage);
    }
  }, [pagination.currentPage, searchQuery]);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await getUserList(page);
      if (response.status === 200) {
        const { users: user, pagination: paginationData } = response.data.data;
        setUsers(user || []);
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

  const fetchSearchedUsers = useCallback(
    async (query: string) => {
      const search = query.trim().toLowerCase();
      setSearchQuery(query);

      if (!search) {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        return;
      }

      setLoading(true);
      try {
        const response = await searchUsers(pagination.currentPage, search);
        if (response.status === 200) {
          const { users: user, pagination: paginationData } =
            response.data.data;
          setUsers(user);
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
    },
    [pagination.currentPage]
  );

  const debouncedHandleSearch = useDebounce(fetchSearchedUsers, 500);

  useEffect(() => {
    if (searchQuery) {
      debouncedHandleSearch(searchQuery);
    }
  }, [searchQuery, pagination.currentPage, debouncedHandleSearch]);

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    debouncedHandleSearch(query);
  };

  const handleStatusChange = async (userId: number, active: boolean) => {
    try {
      const payload = { userId };
      const response = await toggleUserStatus(payload);

      if (response.status === 200) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, status: active ? "active" : "in-active" }
              : user
          )
        );

        toast.success("User status updated", {
          description: fallbackMessages.userToggleState(active),
        });
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleBackdoorAccess = (user: UserDetails) => {
    // setUserDetails(user);
    // setUserDetailDialogOpen(true);
    if (user?.id) {
      navigate(ROUTES.userDetailsPage(user.id));
    } else {
      toast.error("Something went wrong!!");
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportCSVLoading(true);
      const response = await downloadUserListCSV();
      if (response.status === 200) {
        const { fileUrl } = response.data.data;
        window.open(fileUrl, "_blank");
      }
      toast.success("Exporting user data", {
        description: fallbackMessages.userCSVExportSuccess,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setExportCSVLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      header: "Id.",
      cell: (user: UserDetails) => <div>{user?.id || "-"}</div>,
    },
    {
      key: "firstName",
      header: "Name",
      cell: (user: UserDetails) => {
        const isFullyVerified =
          user?.isEmailVerified &&
          user?.isPhoneVerified &&
          user?.isVerified &&
          user?.isProfileCompleted;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant={"link"}
              className="hover:underline p-0 h-auto"
              onClick={() => handleBackdoorAccess(user)}
            >
              {capitalizeWord(user?.firstName || "") +
                " " +
                capitalizeWord(user?.lastName || "")}
            </Button>
            {isFullyVerified && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Role",
      cell: (user: UserDetails) => <UserRoleBadgeComp role={user.role} />,
    },
    {
      key: "email",
      header: "Email ID",
      cell: (user: UserDetails) => <div>{user?.email || "-"}</div>,
    },
    {
      key: "phoneNumber",
      header: "Phone Number",
      cell: (user: UserDetails) => (
        <div>
          {user?.phoneNumber
            ? `+${user?.countryCode || ""}-${user?.phoneNumber}`
            : "-"}
        </div>
      ),
    },
    {
      key: "city",
      header: "City",
      cell: (user: UserDetails) => <div>{user.city || "-"}</div>,
    },
    {
      key: "guestRating",
      header: "Guest Rating",
      cell: (user: UserDetails) => (
        <div className="text-center">{user.guestRating || "-"}</div>
      ),
    },
    {
      key: "hostRating",
      header: "Host Rating",
      cell: (user: UserDetails) => (
        <div className="text-center">{user.hostRating || "-"}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (user: UserDetails) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={user?.status === "active" || false}
            onCheckedChange={(checked) => handleStatusChange(user?.id, checked)}
          />
          <span
            className={
              user?.status === "active" ? "text-green-400" : "text-red-400"
            }
          >
            {user?.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        <UserCountTiles />

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">User List</h2>
          <Button
            onClick={handleExportCsv}
            disabled={exportCSVLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        <DataTable
          data={users}
          columns={columns}
          searchable
          searchQuery={searchQuery}
          handleSearch={handleSearchInput}
          searchPlaceholder="Search by first name, email or phone..."
          loading={loading}
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
        />
      </div>

      {userDetails && (
        <UserDetailModal
          userDetails={userDetails}
          open={userDetailsDialogOpen}
          onOpenChange={setUserDetailDialogOpen}
        />
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
