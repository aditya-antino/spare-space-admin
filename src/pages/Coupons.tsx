import { useEffect, useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Ticket, 
  Info,
  Eye,
  Copy
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { handleApiError } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  Coupon,
  CustomCode
} from "@/utils/services/coupon.services";

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customCodes, setCustomCodes] = useState<CustomCode[]>([]);
  const [activeTab, setActiveTab] = useState<"standard" | "custom">("standard");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [currentCouponId, setCurrentCouponId] = useState<string | number | null>(null);
  
  // Details Modal States
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedCustomCode, setSelectedCustomCode] = useState<CustomCode | null>(null);
  const [isCustomDetailsOpen, setIsCustomDetailsOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
  });

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  const fetchCoupons = async (page: number) => {
    setLoading(true);
    try {
      const response = await getCoupons(page, 10);
      if (response.status === 200) {
        const { coupons: couponsData, customCode: customCodeData, pagination } = response.data.data;
        setCoupons(couponsData || []);
        setCustomCodes(customCodeData || []);
        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
          setCurrentPage(pagination.currentPage || 1);
        }
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(currentPage);
  }, [currentPage]);

  // Open create form for standard coupon
  const handleOpenCreate = () => {
    setIsEditing(false);
    setIsEditingCustom(false);
    setCurrentCouponId(null);
    setFormData({
      code: "",
      discountPercentage: "",
    });
    setIsFormOpen(true);
  };

  // Open create form for custom code
  const handleOpenCreateCustom = () => {
    setIsEditing(false);
    setIsEditingCustom(true);
    setCurrentCouponId(null);
    setFormData({
      code: "",
      discountPercentage: "",
    });
    setIsFormOpen(true);
  };

  // Open edit form for standard coupon
  const handleOpenEdit = (coupon: Coupon) => {
    setIsEditing(true);
    setIsEditingCustom(false);
    setCurrentCouponId(coupon.id);
    setFormData({
      code: coupon.code || "",
      discountPercentage: String(coupon.discountPercentage),
    });
    setIsFormOpen(true);
  };

  // Open edit form for custom code
  const handleOpenEditCustom = (item: CustomCode) => {
    setIsEditing(true);
    setIsEditingCustom(true);
    setCurrentCouponId(item.id);
    setFormData({
      code: item.code,
      discountPercentage: String(item.discountPercentage),
    });
    setIsFormOpen(true);
  };

  // Delete click for standard coupon
  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete for standard coupon
  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteCoupon(couponToDelete.id);
      if (response.status === 200) {
        toast.success("Coupon deleted successfully");
        setIsDeleteDialogOpen(false);
        setCouponToDelete(null);
        fetchCoupons(currentPage);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // View details click for standard coupon
  const handleViewDetails = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailsOpen(true);
  };

  // View details click for custom code
  const handleViewCustomDetails = (item: CustomCode) => {
    setSelectedCustomCode(item);
    setIsCustomDetailsOpen(true);
  };

  // Copy code helper
  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard!");
  };

  // Toggle status directly from switch for standard coupon
  const handleStatusToggle = async (coupon: Coupon, checked: boolean) => {
    try {
      const response = await updateCoupon(coupon.id, { isActive: checked });
      if (response.status === 200) {
        toast.success(`Coupon status is now ${checked ? "Active" : "Inactive"}`);
        setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: checked } : c));
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Toggle status directly from switch for custom code
  const handleCustomStatusToggle = async (item: CustomCode, checked: boolean) => {
    try {
      const response = await updateCoupon(item.id, { isActive: checked });
      if (response.status === 200) {
        toast.success(`Custom code status is now ${checked ? "Active" : "Inactive"}`);
        setCustomCodes(prev => prev.map(c => c.id === item.id ? { ...c, isActive: checked } : c));
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Submit create or edit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditingCustom || (!isEditing && isEditingCustom)) {
      if (!formData.code.trim()) {
        toast.error("Custom code name is required");
        return;
      }
      const cleanCode = formData.code.trim().toUpperCase().replace(/\s+/g, "");
      if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
        toast.error("Custom code must be alphanumeric and cannot contain spaces");
        return;
      }
    }

    if (!formData.discountPercentage || Number(formData.discountPercentage) <= 0 || Number(formData.discountPercentage) > 100) {
      toast.error("Discount percentage must be between 1% and 100%");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && currentCouponId) {
        if (isEditingCustom) {
          const payload = {
            code: formData.code.trim().toUpperCase().replace(/\s+/g, ""),
            discountPercentage: Number(formData.discountPercentage),
          };
          const response = await updateCoupon(currentCouponId, payload);
          if (response.status === 200) {
            toast.success("Custom code updated successfully");
            setIsFormOpen(false);
            fetchCoupons(currentPage);
          }
        } else {
          const payload = {
            discountPercentage: Number(formData.discountPercentage),
          };
          const response = await updateCoupon(currentCouponId, payload);
          if (response.status === 200) {
            toast.success("Coupon updated successfully");
            setIsFormOpen(false);
            fetchCoupons(currentPage);
          }
        }
      } else {
        if (isEditingCustom) {
          const payload = {
            code: formData.code.trim().toUpperCase().replace(/\s+/g, ""),
            discountPercentage: Number(formData.discountPercentage),
            isUnlimited: true,
          };
          const response = await createCoupon(payload);
          if (response.status === 201 || response.status === 200) {
            toast.success("Custom code created successfully");
            setIsFormOpen(false);
            fetchCoupons(1);
          }
        } else {
          const payload = {
            discountPercentage: Number(formData.discountPercentage),
          };
          const response = await createCoupon(payload);
          if (response.status === 201 || response.status === 200) {
            toast.success("Coupon created successfully");
            setIsFormOpen(false);
            fetchCoupons(1);
          }
        }
      }
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Code",
      cell: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground tracking-wider font-mono">{coupon.code}</span>
          {coupon.code && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopyCode(coupon.code)}
              className="h-6 w-6 opacity-60 hover:opacity-100 transition-opacity"
              title="Copy Code"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: "discountPercentage",
      header: "Discount Percentage",
      cell: (coupon: Coupon) => (
        <div className="font-semibold text-foreground">
          {coupon.discountPercentage}%
        </div>
      ),
    },
    {
      key: "isUsed",
      header: "Used",
      cell: (coupon: Coupon) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
          coupon.isUsed 
            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
        }`}>
          {coupon.isUsed ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (coupon: Coupon) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={!!coupon.isActive}
            onCheckedChange={(checked) => handleStatusToggle(coupon, checked)}
            disabled={!!coupon.isUsed}
          />
          <span className={`text-sm font-medium ${coupon.isActive ? "text-green-500" : "text-muted-foreground"} ${coupon.isUsed ? "opacity-50" : ""}`}>
            {coupon.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(coupon)}
            className="hover:bg-muted transition-colors h-8 w-8"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-emerald-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEdit(coupon)}
            className="hover:bg-muted transition-colors h-8 w-8 disabled:opacity-40"
            disabled={!!coupon.isUsed}
            title={coupon.isUsed ? "Cannot edit used coupon" : "Edit Coupon"}
          >
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(coupon)}
            className="hover:bg-red-50 dark:hover:bg-red-950 transition-colors h-8 w-8 disabled:opacity-40"
            disabled={!!coupon.isUsed}
            title={coupon.isUsed ? "Cannot delete used coupon" : "Delete Coupon"}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const customColumns = [
    {
      key: "code",
      header: "Code",
      cell: (item: CustomCode) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground tracking-wider font-mono">{item.code}</span>
          {item.code && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopyCode(item.code)}
              className="h-6 w-6 opacity-60 hover:opacity-100 transition-opacity"
              title="Copy Code"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: "discountPercentage",
      header: "Discount Percentage",
      cell: (item: CustomCode) => (
        <div className="font-semibold text-foreground">
          {item.discountPercentage}%
        </div>
      ),
    },
    {
      key: "totalCountOfUsed",
      header: "Times Used",
      cell: (item: CustomCode) => (
        <div className="text-foreground">
          {item.totalCountOfUsed}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (item: CustomCode) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={!!item.isActive}
            onCheckedChange={(checked) => handleCustomStatusToggle(item, checked)}
          />
          <span className={`text-sm font-medium ${item.isActive ? "text-green-500" : "text-muted-foreground"}`}>
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item: CustomCode) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewCustomDetails(item)}
            className="hover:bg-muted transition-colors h-8 w-8"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-emerald-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditCustom(item)}
            className="hover:bg-muted transition-colors h-8 w-8"
            title="Edit Custom Code"
          >
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Coupon Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center shrink-0">
          <h2 className="text-xl font-semibold">Coupon & Discount Management</h2>
          {activeTab === "standard" ? (
            <Button onClick={handleOpenCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          ) : (
            <Button onClick={handleOpenCreateCustom} className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-sm">
              <Plus className="h-4 w-4" />
              Create Custom Code
            </Button>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("standard")}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "standard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Ticket className="h-4 w-4" />
            Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "custom"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Ticket className="h-4 w-4 text-yellow-500" />
            Custom Discount Codes ({customCodes.length})
          </button>
        </div>

        {/* Coupons List Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden p-6 shadow-sm">
          {activeTab === "standard" ? (
            <DataTable
              data={coupons}
              columns={columns}
              loading={loading}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          ) : (
            <DataTable
              data={customCodes}
              columns={customColumns}
              loading={loading}
              totalPages={1}
              currentPage={1}
            />
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border bg-muted/20">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Ticket className={`h-5 w-5 ${isEditingCustom ? "text-yellow-500" : "text-primary"}`} />
              {isEditing 
                ? (isEditingCustom ? "Edit Custom Discount Code" : "Edit Discount Coupon") 
                : (isEditingCustom ? "Create Custom Discount Code" : "Create New Discount Coupon")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
            {/* Custom Code Name (Required for custom code creation/editing) */}
            {isEditingCustom && (
              <div className="grid gap-2">
                <Label htmlFor="customCodeName" className="text-sm font-medium">
                  Custom Code Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customCodeName"
                  type="text"
                  placeholder="e.g. SABZI-MANDI"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s+/g, "") }))}
                />
              </div>
            )}

            {/* Coupon Code (Read-only, shown only during standard coupon editing) */}
            {isEditing && !isEditingCustom && (
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-muted-foreground">Coupon Code</Label>
                <div className="px-3 py-2 border rounded-md bg-muted/40 font-mono tracking-wider text-sm font-semibold">
                  {formData.code}
                </div>
              </div>
            )}

            {/* Discount Percentage */}
            <div className="grid gap-2">
              <Label htmlFor="discountPercentage" className="text-sm font-medium">
                Discount Percentage (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="discountPercentage"
                type="number"
                placeholder="e.g. 20"
                value={formData.discountPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: e.target.value }))}
                min="1"
                max="100"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : (isEditingCustom ? "Create Custom Code" : "Create Coupon")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-red-500" />
              Delete Discount Coupon?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the coupon
              <span className="font-semibold text-foreground ml-1">"{couponToDelete?.code || "this coupon"}"</span>?
              This action cannot be undone. Guests will no longer be able to apply this coupon code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Coupon"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border bg-muted/20">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Coupon Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Coupon Code</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-foreground tracking-wider font-mono text-base">
                    {selectedCoupon?.code || "N/A"}
                  </span>
                  {selectedCoupon?.code && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(selectedCoupon.code)}
                      className="h-6 w-6 opacity-60 hover:opacity-100 transition-opacity"
                      title="Copy Code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Discount Percentage</span>
                <span className="font-semibold text-foreground text-base">
                  {selectedCoupon?.discountPercentage}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Is Active</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 ${
                  selectedCoupon?.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {selectedCoupon?.isActive ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Is Used</span>
                <span className="font-medium text-foreground">
                  {selectedCoupon?.isUsed ? "Yes" : "No"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Used At</span>
                <span className="font-medium text-foreground font-mono text-[13px]">
                  {selectedCoupon?.usedAt ? new Date(selectedCoupon.usedAt).toLocaleString() : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Used By User ID</span>
                <span className="font-medium text-foreground">
                  {selectedCoupon?.usedByUserId || "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Used in Booking ID</span>
                <span className="font-medium text-foreground">
                  {selectedCoupon?.usedInBookingId || "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Used By User Details</span>
                <span className="font-medium text-foreground">
                  {selectedCoupon?.UsedByUser
                    ? `${selectedCoupon.UsedByUser.firstName} ${selectedCoupon.UsedByUser.lastName} (${selectedCoupon.UsedByUser.email})`
                    : "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Is Locked</span>
                <span className="font-medium text-foreground">
                  {selectedCoupon?.isLocked ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Locked At</span>
                <span className="font-medium text-foreground font-mono text-[13px]">
                  {selectedCoupon?.lockedAt ? new Date(selectedCoupon.lockedAt).toLocaleString() : "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Locked for Booking ID</span>
                <span className="font-medium text-foreground">
                  {selectedCoupon?.lockedForBookingId || "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Created At</span>
                <span className="font-medium text-foreground font-mono text-[13px]">
                  {selectedCoupon?.created_at ? new Date(selectedCoupon.created_at).toLocaleString() : "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Updated At</span>
                <span className="font-medium text-foreground font-mono text-[13px]">
                  {selectedCoupon?.updated_at ? new Date(selectedCoupon.updated_at).toLocaleString() : "-"}
                </span>
              </div>
            </div>

            {/* Unlock History */}
            <div className="pt-2">
              <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider mb-2">
                Unlock History
              </span>
              {selectedCoupon?.unlockReasons && selectedCoupon.unlockReasons.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 border rounded-lg p-2 bg-muted/10">
                  {selectedCoupon.unlockReasons.map((item, index) => (
                    <div
                      key={index}
                      className="p-2.5 rounded-md bg-card border border-border/60 hover:bg-muted/40 transition-colors space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-foreground text-[13px]">
                          {item.reason}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {new Date(item.date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border rounded-lg bg-muted/5 border-dashed">
                  <p className="text-xs text-muted-foreground italic">No unlock history recorded</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="p-4 border-t border-border bg-muted/10 shrink-0">
            <Button type="button" onClick={() => setIsDetailsOpen(false)} className="w-full sm:w-auto">
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Code Details Dialog */}
      <Dialog open={isCustomDetailsOpen} onOpenChange={setIsCustomDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border bg-muted/20">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-yellow-500" />
              Custom Discount Code Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Custom Code</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-foreground tracking-wider font-mono text-base">
                    {selectedCustomCode?.code || "N/A"}
                  </span>
                  {selectedCustomCode?.code && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(selectedCustomCode.code)}
                      className="h-6 w-6 opacity-60 hover:opacity-100 transition-opacity"
                      title="Copy Code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Discount Percentage</span>
                <span className="font-semibold text-foreground text-base">
                  {selectedCustomCode?.discountPercentage}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Is Active</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 ${
                  selectedCustomCode?.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {selectedCustomCode?.isActive ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Times Used</span>
                <span className="font-semibold text-foreground">
                  {selectedCustomCode?.totalCountOfUsed ?? 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Created At</span>
                <span className="font-medium text-foreground font-mono text-[13px]">
                  {selectedCustomCode?.createdAt
                    ? new Date(selectedCustomCode.createdAt).toLocaleString()
                    : selectedCustomCode?.created_at
                    ? new Date(selectedCustomCode.created_at).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Updated At</span>
                <span className="font-medium text-foreground font-mono text-[13px]">
                  {selectedCustomCode?.updatedAt
                    ? new Date(selectedCustomCode.updatedAt).toLocaleString()
                    : selectedCustomCode?.updated_at
                    ? new Date(selectedCustomCode.updated_at).toLocaleString()
                    : "-"}
                </span>
              </div>
            </div>

            {/* List of User IDs */}
            <div className="border-b pb-4">
              <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider mb-2">
                User IDs who used ({selectedCustomCode?.userIds?.length || 0})
              </span>
              {selectedCustomCode?.userIds && selectedCustomCode.userIds.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
                  {selectedCustomCode.userIds.map((uid, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded bg-muted text-xs font-mono text-foreground border border-border"
                    >
                      {uid}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No users have used this code yet</p>
              )}
            </div>

            {/* List of Booking IDs */}
            <div className="pb-2">
              <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider mb-2">
                Booking IDs it was used on ({selectedCustomCode?.bookingIds?.length || 0})
              </span>
              {selectedCustomCode?.bookingIds && selectedCustomCode.bookingIds.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
                  {selectedCustomCode.bookingIds.map((bid, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded bg-muted text-xs font-mono text-foreground border border-border"
                    >
                      {bid}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No bookings have used this code yet</p>
              )}
            </div>
          </div>
          
          <DialogFooter className="p-4 border-t border-border bg-muted/10 shrink-0">
            <Button type="button" onClick={() => setIsCustomDetailsOpen(false)} className="w-full sm:w-auto">
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Coupons;
