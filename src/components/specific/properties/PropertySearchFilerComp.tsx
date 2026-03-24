import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { capitalizeWord, handleApiError } from "@/hooks";
import { getCitites } from "@/utils/services/properties.services";

interface PaginationState {
  totalPages: number;
  currentPage: number;
}

interface Filters {
  city: string;
  status: string;
}

interface PropertySearchFilterCompProps {
  searchQuery: string;
  handleSearchInput: (value: string) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
}

const status = ["all", "approved", "rejected", "pending"];

const PropertySearchFilterComp: React.FC<PropertySearchFilterCompProps> = ({
  searchQuery,
  handleSearchInput,
  filters,
  setFilters,
  setPagination,
}) => {
  const [citites, setCitites] = useState([]);
  const [loading, setLaoding] = useState(false);

  const fetchCitites = async () => {
    setLaoding(true);
    try {
      const response = await getCitites();
      if (response.status === 200) {
        setCitites(response.data.data);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLaoding(false);
    }
  };

  useEffect(() => {
    fetchCitites();
  }, []);

  const renderStatusOptions = status.map((item, index) => (
    <SelectItem value={item} key={index}>
      {capitalizeWord(item)}
    </SelectItem>
  ));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Property Name or Host Name"
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select
        value={filters.city}
        onValueChange={(value) => {
          setFilters((prev) => ({ ...prev, city: value }));
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by City" />
        </SelectTrigger>
        <SelectContent>
          {!loading && !citites ? (
            <div className="py-6 text-center text-muted-foreground">
              No city available.
            </div>
          ) : (
            citites.map((item) => (
              <SelectItem key={item.key} value={item.name}>
                {capitalizeWord(item.name || "-")}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => {
          setFilters((prev) => ({ ...prev, status: value }));
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>{renderStatusOptions}</SelectContent>
      </Select>
    </div>
  );
};

export default PropertySearchFilterComp;
