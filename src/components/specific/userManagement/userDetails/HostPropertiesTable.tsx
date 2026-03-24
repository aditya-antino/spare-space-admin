import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/hooks";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { getHostPropertyData } from "@/utils/services/userManagement.services";
import { Building, Tag } from "lucide-react";

interface Property {
  id: number;
  title: string;
  isDeactivated?: boolean;
  status?: string;
  approvalStatus?: string;
  CategoryMaster?: {
    id: number;
    name: string;
  };
}

interface HostPropertiesTableProps {
  userId: string;
  limit?: number;
}

const HostPropertiesTable: React.FC<HostPropertiesTableProps> = ({
  userId,
  limit = 5,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getCategoryBadge = (categoryName: string) => {
    const categoryConfig: Record<string, { className: string }> = {
      "Creative Spaces": {
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      "Dining Spaces": {
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
      "Event Spaces": {
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      "Work & Meeting Spaces": {
        className: "bg-green-100 text-green-800 border-green-200",
      },
    };

    const config = categoryConfig[categoryName] || {
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge
        variant="outline"
        className={cn("font-medium text-xs px-2 py-0.5", config.className)}
      >
        {categoryName || "Uncategorized"}
      </Badge>
    );
  };

  const getApprovalStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string }> = {
      approved: {
        className: "bg-green-100 text-green-800 border-green-200",
      },
      pending: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      rejected: {
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config = statusConfig[status?.toLowerCase()] || {
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge
        variant="outline"
        className={cn("font-medium text-xs px-2 py-0.5", config.className)}
      >
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "-"}
      </Badge>
    );
  };

  const getDeactivationStatusBadge = (isDeactivated: boolean) => {
    if (isDeactivated === false) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 font-medium text-xs px-2 py-0.5"
        >
          Active
        </Badge>
      );
    } else if (isDeactivated === true) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200 font-medium text-xs px-2 py-0.5"
        >
          Deactivated
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-800 border-gray-200 font-medium text-xs px-2 py-0.5"
      >
        -
      </Badge>
    );
  };

  const fetchProperties = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getHostPropertyData(userId, page, limit);

      if (response.status === 200 && response.data.data?.data) {
        setProperties(response.data.data.data);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      handleApiError(error);
      setProperties([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(currentPage);
  }, [userId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: "id",
      header: "Space ID",
      cell: (item: Property) => (
        <div className="min-w-0 w-[90px]">
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm truncate">{item?.id || "-"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: "Space Title",
      cell: (item: Property) => {
        const isLive =
          item?.isDeactivated === false &&
          item?.status === "available" &&
          item?.approvalStatus === "approved";
        const isDraft = item?.status === "draft";

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="min-w-0 w-[200px] flex items-center gap-2">
                  {isLive && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 flex-shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <span className="text-xs font-medium text-green-700">
                        Live
                      </span>
                    </div>
                  )}
                  {isDraft && (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-700 border-gray-300 text-xs px-2 py-0.5 font-medium flex-shrink-0"
                    >
                      Draft
                    </Badge>
                  )}
                  <p className="font-medium text-tertiary-t1 truncate flex-1">
                    {item?.title || "-"}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{item?.title || "-"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: "CategoryMaster",
      header: "Category",
      cell: (item: Property) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="min-w-0 w-[140px]">
                {getCategoryBadge(item?.CategoryMaster?.name || "")}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3" />
                <p>{item?.CategoryMaster?.name || "Uncategorized"}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "approvalStatus",
      header: "Approval Status",
      cell: (item: Property) => (
        <div className="min-w-0 w-[120px]">
          {getApprovalStatusBadge(item?.approvalStatus || "")}
        </div>
      ),
    },
    {
      key: "isDeactivated",
      header: "Deactivated Status",
      cell: (item: Property) => (
        <div className="min-w-0 w-[110px]">
          {getDeactivationStatusBadge(item?.isDeactivated)}
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <DataTable
        data={properties}
        columns={columns}
        searchable={false}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        loading={loading}
        shimmerRowsCount={5}
      />
    </TooltipProvider>
  );
};

export default HostPropertiesTable;
