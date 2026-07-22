import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Building2,
  Tag,
  Loader2,
  ExternalLink,
  Shield,
  Edit2,
  Trash2,
  Filter,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import {
  createAdminTag,
  getAllAdminTags,
  updateAdminTag,
  toggleAdminTagStatus,
  deleteAdminTag,
  getSpaceTagCategories,
} from "@/utils/services/approvals.services";

interface LinkedSpace {
  id: number;
  title: string;
  city: string;
}

interface Category {
  id: number;
  name: string;
}

interface TagWithSpaces {
  id: number;
  name: string;
  categoryId?: number;
  category?: Category | null;
  status: string;
  spaceCount: number;
  spaces: LinkedSpace[];
}

const AdminTags = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagWithSpaces[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 100; // table items per page

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Modals state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategoryId, setNewTagCategoryId] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithSpaces | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<TagWithSpaces | null>(null);

  // Linked Spaces modal
  const [spacesModalOpen, setSpacesModalOpen] = useState(false);
  const [selectedTagForSpaces, setSelectedTagForSpaces] = useState<TagWithSpaces | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await getSpaceTagCategories();
      if (response.status === 200 && response.data?.data) {
        setCategories(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTagsAndSpaces = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        categoryId: categoryFilter ? Number(categoryFilter) : undefined,
      };

      const response = await getAllAdminTags(params);
      if (response.status === 200 && response.data?.data) {
        const fetchedData = response.data.data;
        if (fetchedData.tags) {
          setTags(fetchedData.tags);
          setTotalPages(fetchedData.pagination?.totalPages || 1);
        } else {
          // If response format is flat array
          const rawTags = Array.isArray(fetchedData) ? fetchedData : fetchedData.tags || [];
          setTags(rawTags);
          setTotalPages(1);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch space tags:", error);
      const errMsg = error?.message || error?.response?.data?.message || "Failed to fetch admin tags";
      toast.error(errMsg);
      setTags([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTagsAndSpaces();
  }, [currentPage, searchQuery, statusFilter, categoryFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !newTagCategoryId) return;

    try {
      setActionLoading(true);
      const response = await createAdminTag({
        name: newTagName.trim(),
        categoryId: Number(newTagCategoryId),
        status: "active",
      });
      if (response.status === 200 || response.status === 201) {
        toast.success("Admin tag created successfully");
        setCreateDialogOpen(false);
        setNewTagName("");
        setNewTagCategoryId("");
        fetchTagsAndSpaces();
      }
    } catch (error: any) {
      const errMsg = error?.message || error?.response?.data?.message || "Tag creation failed";
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTagName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editTagName.trim()) return;

    try {
      setActionLoading(true);
      const payload: { name?: string; categoryId?: number } = { name: editTagName.trim() };
      // Only send categoryId if it was changed
      const newCatId = editCategoryId ? Number(editCategoryId) : undefined;
      if (newCatId && newCatId !== editingTag.categoryId) {
        payload.categoryId = newCatId;
      }
      const response = await updateAdminTag(editingTag.id, payload);
      if (response.status === 200) {
        toast.success("Tag updated successfully");
        setEditDialogOpen(false);
        setEditingTag(null);
        setEditTagName("");
        setEditCategoryId("");
        fetchTagsAndSpaces();
      }
    } catch (error: any) {
      const errMsg = error?.message || error?.response?.data?.message || "Update failed";
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (tag: TagWithSpaces) => {
    try {
      const response = await toggleAdminTagStatus(tag.id);
      if (response.status === 200) {
        const nextStatus = tag.status === "active" ? "deactivated" : "activated";
        toast.success(`Tag ${nextStatus} successfully`);
        fetchTagsAndSpaces();
      }
    } catch (error: any) {
      const errMsg = error?.message || error?.response?.data?.message || "Failed to toggle status";
      toast.error(errMsg);
    }
  };

  const handleDeleteTag = async () => {
    if (!deletingTag) return;

    try {
      setActionLoading(true);
      const response = await deleteAdminTag(deletingTag.id);
      if (response.status === 200) {
        toast.success("Tag deleted successfully");
        setDeleteDialogOpen(false);
        setDeletingTag(null);
        fetchTagsAndSpaces();
      }
    } catch (error: any) {
      const errMsg = error?.message || error?.response?.data?.message || "Failed to delete tag";
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const triggerEdit = (tag: TagWithSpaces) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
    setEditCategoryId(tag.categoryId?.toString() || "");
    setEditDialogOpen(true);
  };

  const triggerDelete = (tag: TagWithSpaces) => {
    setDeletingTag(tag);
    setDeleteDialogOpen(true);
  };

  const handleViewLinkedSpaces = (tag: TagWithSpaces) => {
    setSelectedTagForSpaces(tag);
    setSpacesModalOpen(true);
  };

  // Define Table Columns
  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (tag: TagWithSpaces) => (
        <span className="font-semibold text-gray-700">{tag.id}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (tag: TagWithSpaces) => (
        <button
          onClick={() => handleViewLinkedSpaces(tag)}
          className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline text-left cursor-pointer transition-colors"
        >
          {tag.name}
        </button>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (tag: TagWithSpaces) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tag.category
            ? "text-indigo-700 bg-indigo-50 border-indigo-100"
            : "text-gray-400 bg-gray-50 border-gray-100"
          }`}>
          {tag.category?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "spacesCount",
      header: "Linked Spaces",
      cell: (tag: TagWithSpaces) => (
        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
          {tag.spaces?.length || 0} {tag.spaces?.length === 1 ? "space" : "spaces"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (tag: TagWithSpaces) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={tag.status === "active"}
            onCheckedChange={() => handleToggleStatus(tag)}
            disabled={actionLoading}
          />
          <span
            className={`text-xs font-semibold ${tag.status === "active" ? "text-green-600" : "text-gray-400"
              }`}
          >
            {tag.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      cell: (tag: TagWithSpaces) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewLinkedSpaces(tag)}
          className="h-8 text-xs font-semibold rounded-xl text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
        >
          View Details
        </Button>
      ),
      sortable: false,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (tag: TagWithSpaces) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => triggerEdit(tag)}
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            title="Edit tag name"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => triggerDelete(tag)}
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
            title="Delete tag"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <DashboardLayout title="Admin Tags">
      <div className="space-y-6">
        {/* Info Alert Box */}
        <div className="bg-primary-tint5 border border-primary-tint3 p-4 rounded-xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary-p3 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-primary-p3 text-sm font-sans">Tag Management Console</h4>
            <p className="text-primary-p3 text-xs mt-1 leading-relaxed opacity-90">
              Manage tags to categorize space listings. Click on any tag name to view its linked spaces. Note: You cannot deactivate or delete a tag that is currently assigned to spaces.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-gray-200 rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val === "all" ? "" : val)}>
              <SelectTrigger className="w-full sm:w-60 bg-white border-gray-200 rounded-xl h-[40px] px-3">
                <div className="flex items-center gap-2 text-sm min-w-0 overflow-hidden w-full">
                  <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <div className="truncate min-w-0 flex-1 text-left">
                    <SelectValue placeholder="All Categories" />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full md:w-auto rounded-xl flex items-center gap-1.5 shadow-sm font-semibold h-[40px] px-4"
          >
            <Plus className="w-4 h-4" />
            Create New Tag
          </Button>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <DataTable
            data={tags}
            columns={columns}
            searchable={false} // Toolbar has custom search input
            loading={loading}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Linked Spaces Modal */}
      <Dialog open={spacesModalOpen} onOpenChange={setSpacesModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-white p-6 border-0 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Spaces linked to "{selectedTagForSpaces?.name}"
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-1">
              Currently assigned to {selectedTagForSpaces?.spaces?.length || 0} space
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {selectedTagForSpaces?.spaces && selectedTagForSpaces.spaces.length > 0 ? (
              selectedTagForSpaces.spaces.map((space) => (
                <div
                  key={space.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 border border-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {space.id} - {space.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {space.city || ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSpacesModalOpen(false);
                      navigate(ROUTES.buildApprovalDetails(space.id));
                    }}
                    className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg shrink-0 transition-colors"
                    title="Go to space approvals/details page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 italic text-sm">
                No spaces are currently linked to this tag.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSpacesModalOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-700 rounded-xl px-4 py-2 w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tag Modal */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) { setNewTagName(""); setNewTagCategoryId(""); }
      }}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 border-0 shadow-lg">
          <form onSubmit={handleCreateTag}>
            <DialogHeader>
              <DialogTitle className="text-gray-900 font-bold flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                Create New Admin Tag
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm mt-1">
                Select a category and enter a unique name for the new tag. This tag will become available for assignment to properties.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select value={newTagCategoryId} onValueChange={setNewTagCategoryId}>
                  <SelectTrigger className="w-full bg-white border-gray-200 rounded-xl">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tag Name */}
              <div>
                <label htmlFor="tagName" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="tagName"
                  type="text"
                  required
                  placeholder="e.g. Photography, Dance, Yoga"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full bg-white border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={actionLoading}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-700 rounded-xl px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading || !newTagName.trim() || !newTagCategoryId}
                className="rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-sm font-semibold"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Tag
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Modal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 border-0 shadow-lg">
          <form onSubmit={handleEditTagName}>
            <DialogHeader>
              <DialogTitle className="text-gray-900 font-bold flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                Edit Tag
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm mt-1">
                Update the category or name of this admin tag.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Category
                </label>
                <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                  <SelectTrigger className="w-full bg-white border-gray-200 rounded-xl">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tag Name */}
              <div>
                <label htmlFor="editTagName" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tag Name
                </label>
                <Input
                  id="editTagName"
                  type="text"
                  required
                  placeholder="Enter new name"
                  value={editTagName}
                  onChange={(e) => setEditTagName(e.target.value)}
                  className="w-full bg-white border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={actionLoading}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-700 rounded-xl px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  actionLoading ||
                  !editTagName.trim() ||
                  (editTagName.trim() === editingTag?.name && editCategoryId === (editingTag?.categoryId?.toString() || ""))
                }
                className="rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-sm font-semibold"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 border-0 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-bold flex items-center gap-2">
              Delete Admin Tag
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-1">
              Are you sure you want to delete the tag <strong className="text-gray-800">"{deletingTag?.name}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-700 rounded-xl px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTag}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-sm font-semibold"
            >
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminTags;
