import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { handleApiError, useDebounce, capitalizeWord } from "@/hooks";
import {
  getPropertiesList,
  resetApprovalStatus,
  searchProperties,
} from "@/utils/services/properties.services";
import { PropertySearchFilterComp, PropertyStatusBadge } from "@/components";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { useNavigate } from "react-router-dom";
import { WEBSITE_URL } from "@/constants";

interface Property {
  id: number;
  title: string;
  city: string;
  listedPersonName: string;
  typeOfSpaces: string;
  contactNumber: string;
  avgRating: string;
  status: "approved" | "rejected" | "pending";
}

const Properties = () => {
  const navigation = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const [appliedFilters, setAppliedFilters] = useState({
    city: "",
    status: "",
  });

  // const [selectedPropertyID, setSelectedPropertyID] = useState<number>();
  // const [propertyDetailsDialogOpen, setPropertyDetailsDialogOpen] =
  //   useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProperties = async (
    page: number,
    city = appliedFilters.city,
    status = appliedFilters.status
  ) => {
    setLoading(true);
    try {
      const response = await getPropertiesList(
        page,
        city,
        status !== "all" && status
      );
      if (response.status === 200) {
        const { properties: propertiesList, pagination: paginationData } =
          response.data.data;
        setProperties(propertiesList || []);
        setPagination({
          totalPages: paginationData.totalPages || 1,
          currentPage: paginationData?.currentPage || 1,
        });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchedProperties = async (
    query: string,
    page: number,
    city = appliedFilters.city,
    status = appliedFilters.status
  ) => {
    setLoading(true);
    try {
      const response = await searchProperties(
        page,
        query,
        city,
        status !== "all" && status
      );
      if (response.status === 200) {
        const { properties: propertiesList, pagination: paginationData } =
          response.data.data;
        setProperties(propertiesList || []);
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

  const handleResetApprovalStatus = async (id: number) => {
    try {
      const response = await resetApprovalStatus(id);
      if (response.status === 200) {
        toast.success(response.data.message || "Status reset successfully");
        if (searchQuery) {
          fetchSearchedProperties(searchQuery, pagination.currentPage);
        } else {
          fetchProperties(pagination.currentPage);
        }
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const debouncedSearch = useDebounce((query: string) => {
    fetchSearchedProperties(query, 1);
  }, 500);

  useEffect(() => {
    if (searchQuery) {
      fetchSearchedProperties(searchQuery, pagination.currentPage);
    } else {
      fetchProperties(pagination.currentPage);
    }
  }, [pagination.currentPage, appliedFilters.city, appliedFilters.status]);

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchProperties(1);
    } else {
      debouncedSearch(query);
    }
  };

  const columns = [
    {
      key: "id",
      header: "Space Id.",
      cell: (property: Property) => (
        <div>{capitalizeWord(property?.id.toString() || "-")}</div>
      ),
    },
    {
      key: "title",
      header: "Title",
      cell: (property: Property) => (
        <div
          className="font-medium hover: cursor-pointer hover:underline"
          onClick={() => {
            if (!property.id) {
              toast.error(fallbackMessages.genericError);
              return;
            }

            window.open(
              `${WEBSITE_URL}/space-details/${property.id}`,
              "_blank"
            );
          }}
        >
          {capitalizeWord(property.title || "-")}
        </div>
      ),
    },
    {
      key: "city",
      header: "City",
      cell: (property: Property) => (
        <div>{capitalizeWord(property.city || "-")}</div>
      ),
    },
    {
      key: "listedPersonName",
      header: "Listed Person Name",
      cell: (property: Property) => (
        <div>{capitalizeWord(property.listedPersonName || "-")}</div>
      ),
    },
    {
      key: "typeOfSpaces",
      header: "Type of Spaces",
      cell: (property: Property) => <div>{property.typeOfSpaces || "-"}</div>,
    },
    {
      key: "contactNumber",
      header: "Contact Number",
      cell: (property: Property) => <div>{property.contactNumber || "-"}</div>,
    },
    {
      key: "avgRating",
      header: "Rating",
      cell: (property: Property) => <div className="text-center">{property.avgRating || "-"}</div>,
    },
    {
      key: "status",
      header: "Status",
      cell: (property: Property) => (
        <PropertyStatusBadge status={property.status} />
      ),
    },
    {
      key: "action",
      header: "Reset to Pending",
      cell: (property: Property) => (
        <div className="flex items-center justify-center">
          <Switch
            checked={property.status === "approved"}
            onCheckedChange={() => handleResetApprovalStatus(property.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Property Management">
      <div className="space-y-6">
        {/* Filters */}
        <PropertySearchFilterComp
          searchQuery={searchQuery}
          handleSearchInput={handleSearchInput}
          filters={{ city: appliedFilters.city, status: appliedFilters.status }}
          setFilters={setAppliedFilters}
          setPagination={setPagination}
        />

        {/* Properties Table */}
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
      {/* <PropertyDetailDialog
        open={propertyDetailsDialogOpen}
        onOpenChange={setPropertyDetailsDialogOpen}
        propertyID={selectedPropertyID}
      /> */}
    </DashboardLayout>
  );
};

export default Properties;
