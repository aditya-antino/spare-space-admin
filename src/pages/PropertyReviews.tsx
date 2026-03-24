import { useCallback, useEffect, useState } from "react";
import { Flag, Star, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { handleApiError, useDebounce, capitalizeWord } from "@/hooks";
import {
  deletePropertyReview,
  getPropertyReviewList,
} from "@/utils/services/reviews.services";
import { fallbackMessages } from "@/constants/fallbackMessages";
import DeleteConfirmationDialog from "@/components/specific/dialogs/ConfirmationDialog";

interface Review {
  id: number;
  property: string;
  reviewer: string;
  comments: string;
  reviewerEmail: string;
  rating: number;
  date: string;
  flagged: boolean;
  spaceId: number;
  reviewerId: number;
}

const PropertyReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBTNLoading, setDeleteBTNLoading] = useState(false);

  const fetchReviews = async (page: number, searchVal: string | null) => {
    try {
      setLoading(true);
      const response = await getPropertyReviewList(page, searchVal);
      if (response.status === 200) {
        const { reviews, pagination: paginationData } = response.data.data;
        setReviews(reviews || []);
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
    if (!searchQuery) {
      fetchReviews(pagination.currentPage, null);
    }
  }, [pagination.currentPage, searchQuery]);

  const handleDeleteReview = (id: number) => {
    setDeleteReviewId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteReviewId) return;
    setDeleteBTNLoading(true);
    try {
      const response = await deletePropertyReview(deleteReviewId);
      if (response.status === 200) {
        const filteredReviews = reviews.filter(
          (review) => review.id !== deleteReviewId
        );
        setReviews(filteredReviews);
        setDeleteDialogOpen(false);

        toast.success("Review deleted", {
          description: fallbackMessages.deleteReviewSuccess,
        });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setDeleteBTNLoading(false);
    }
  };

  const columns = [
    {
      key: "property",
      header: "Property",
      cell: (review: Review) => (
        <div className="font-medium">{capitalizeWord(review.property)}</div>
      ),
    },
    {
      key: "reviewer",
      header: "Reviewer",
      cell: (review: Review) => <div>{capitalizeWord(review.reviewer)}</div>,
    },
    {
      key: "rating",
      header: "Rating",
      cell: (review: Review) => (
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "review",
      header: "Review",
      cell: (review: Review) => (
        <div className="max-w-md truncate">{review.comments}</div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (review: Review) => <div>{review.date}</div>,
    },
    {
      key: "flagged",
      header: "Flagged",
      cell: (review: Review) => (
        <div className="flex items-center justify-center">
          {review.flagged ? (
            <Flag className="h-5 w-5 text-red-500" />
          ) : (
            <span>-</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      cell: (review: Review) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteReview(review.id)}
          className="text-muted-foreground hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-950 rounded-full"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleSearch = useCallback(
    async (query: string) => {
      const search = query.trim().toLowerCase();
      setSearchQuery(query);

      if (!search) {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        return;
      }
      setLoading(true);

      try {
        const response = await getPropertyReviewList(
          pagination.currentPage,
          search
        );
        if (response.status === 200) {
          const { reviews, pagination: paginationData } = response.data.data;
          setReviews(reviews || []);
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

  const debouncedHandleSearch = useDebounce(handleSearch, 500);

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    debouncedHandleSearch(query);
  };

  useEffect(() => {
    if (searchQuery) {
      debouncedHandleSearch(searchQuery);
    }
  }, [searchQuery, pagination.currentPage, debouncedHandleSearch]);

  return (
    <DashboardLayout title="Reviews">
      <div className="space-y-6">
        <DataTable
          data={reviews}
          columns={columns}
          searchable
          searchPlaceholder="Search by property or reviewer..."
          searchQuery={searchQuery}
          handleSearch={handleSearchInput}
          loading={loading}
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
        />
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          loading={deleteBTNLoading}
          title="Are you sure?"
          description="This will permanently delete the review from the platform."
        />
        ;
      </div>
    </DashboardLayout>
  );
};

export default PropertyReviews;
