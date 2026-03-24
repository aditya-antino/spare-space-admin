import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { capitalizeWord, handleApiError } from "@/hooks";
import { getApprovalsList } from "@/utils/services/approvals.services";
import { Property } from "@/types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

const Approvals = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);

  // const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
  //   null
  // );
  // const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const fetchApprovalsList = async (page: number) => {
    try {
      const response = await getApprovalsList(page);
      if (response.status === 200) {
        const { list: propertyList, pagination: paginationData } =
          response.data.data;
        setProperties(propertyList || []);
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

  useEffect(() => {
    fetchApprovalsList(pagination.currentPage);
  }, [pagination.currentPage]);

  const handleReviewApprove = (property: Property) => {
    // setSelectedPropertyId(property.id);
    // setApprovalDialogOpen(true);
    navigate(ROUTES.buildApprovalDetails(property.id));
  };

  const columns = [
    {
      key: "id",
      header: "Space Id.",
      cell: (property: Property) => <div>{property?.id || "-"}</div>,
    },
    {
      key: "title",
      header: "Title",
      cell: (property: Property) => (
        <div className="font-medium max-w-xs">
          <p className="line-clamp-2 break-words">
            {capitalizeWord(property.title) || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "hostName",
      header: "Host Name",
      cell: (property: Property) => {
        const { firstName, lastName } = property.User;
        return (
          <div>
            <p>
              {firstName && lastName
                ? capitalizeWord(firstName) + " " + capitalizeWord(lastName)
                : "-"}
            </p>
          </div>
        );
      },
    },
    {
      key: "city",
      header: "City",
      cell: (property: Property) => <div>{property.City?.city || "-"}</div>,
    },
    {
      key: "dateSubmitted",
      header: "Date Submitted",
      cell: (property: Property) => (
        <div>
          {property.updated_at
            ? new Date(property.updated_at).toLocaleString()
            : "-"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      cell: (property: Property) => (
        <Button
          variant="default"
          size="sm"
          onClick={() => handleReviewApprove(property)}
          className="bg-primary text-primary-foreground"
        >
          Review & Approve
        </Button> 
      ),
    },
  ];

  return (
    <DashboardLayout title="Property Approvals">
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-4 rounded-md">
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            This section lists all properties currently 'In Review'. Approve
            them to make them live on the platform.
          </p>
        </div>

        <DataTable
          data={properties}
          columns={columns}
          loading={loading}
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
        />
      </div>

      {/* <ApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        selectedPropertyID={selectedPropertyId}
        fetchApprovals={fetchApprovalsList}
        currentPage={pagination.currentPage}
      /> */}
    </DashboardLayout>
  );
};

export default Approvals;
