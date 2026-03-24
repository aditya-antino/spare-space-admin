"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capitalizeWord, handleApiError } from "@/hooks";
import { toast } from "sonner";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { getPropertyDetails } from "@/utils/services/properties.services";
import {
  approveProperty,
  updatePropertyDetails,
} from "@/utils/services/approvals.services";
import { X } from "lucide-react";

interface Property {
  id: number;
  title: string;
  description: string;
  detailedDescription: string;
  city: string;
  address: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;

  host: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
  };

  images: {
    id: number;
    imageUrl: string;
  }[];

  amenities: string[];

  pricing: {
    pricePerHour: string;
    minBookingHours: number;
    extraHourPrice: string;
    basePriceMonThurs: string | null;
    basePriceFriSun: string | null;
    discountAmount: number;
  };

  rules: {
    rule_id: string;
    rule_type: string;
  }[];

  listing: {
    id: number;
    rules: {
      rule_id: string;
      rule_type: string;
    }[];
    customRules: string[];
    arrivalInstructions: string;
  };
}

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPropertyID: number;
  fetchApprovals: (id: number) => void;
  currentPage: number;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  selectedPropertyID,
  fetchApprovals,
  currentPage,
}) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [comments, setComments] = useState<string>(""); 

  const getPropertyDetail = async () => {
    try {
      setLoading(true);
      if (!selectedPropertyID) {
        return toast.error(fallbackMessages.genericError);
      }
      const response = await getPropertyDetails(selectedPropertyID);
      if (response.status === 200 && response.data?.data) {
        const data = response.data.data as Property;
        setProperty(data);
        setFormData({ ...data });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && selectedPropertyID) {
      getPropertyDetail();
    }
  }, [open, selectedPropertyID]);

  const handleApprove = async () => {
    if (!property?.id) return;
    try {
      const response = await approveProperty(property.id);
      if (response.status === 200) {
        toast.success(fallbackMessages.propertyApprovalSuccess);
        fetchApprovals(currentPage);
        onOpenChange(false);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdate = async () => {
    if (!formData?.id) return;

    try {
      setUpdateLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        detailedDescription: formData.detailedDescription,
        images: formData.images.map((img) => ({
          imageUrl: img.imageUrl,
          isFeatured: false,
        })),
        customRules: formData.listing?.customRules || [],
        comments,
      };

      const response = await updatePropertyDetails(formData.id, payload);

      if (response.status === 200) {
        toast.success(fallbackMessages.propertyUpdateSuccess);
        fetchApprovals(currentPage);
        onOpenChange(false);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseModal = () => onOpenChange(false);

  const handleChange = (
    field: keyof Property,
    value: string | number | any
  ) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleRemoveImage = (id: number) => {
    if (!formData) return;
    const updatedImages = formData.images.filter((img) => img.id !== id);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleRemoveRule = (ruleId: string) => {
    if (!formData) return;
    const updatedRules = formData.rules.filter(
      (rule) => rule.rule_id !== ruleId
    );
    setFormData({ ...formData, rules: updatedRules });
  };

  const handleRemoveCustomRule = (index: number) => {
    if (!formData) return;
    const updatedCustomRules = [...formData.listing.customRules];
    updatedCustomRules.splice(index, 1);
    setFormData({
      ...formData,
      listing: { ...formData.listing, customRules: updatedCustomRules },
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto hide-scrollbar">
          <DialogHeader></DialogHeader>
          <div className="p-4 text-center text-gray-500">
            Fetching property details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="line-clamp-2 break-words max-w-2xl">
            {capitalizeWord(formData.title) || "-"}
          </DialogTitle>
          <DialogDescription>
            Review and update property details before approval
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <Label>Detailed Description</Label>
            <Input
              value={formData.detailedDescription}
              onChange={(e) =>
                handleChange("detailedDescription", e.target.value)
              }
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="flex flex-wrap gap-3">
              {formData.images.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.imageUrl}
                    alt="Property"
                    className="h-24 w-32 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <Label>Rules</Label>
            <ul className="list-disc text-gray-700">
              {formData.rules.map((rule) => (
                <li
                  key={rule.rule_id}
                  className="flex items-center justify-between gap-4 p-2 outline-dashed otuline-0 outline-zinc-200 rounded-sm my-2"
                >
                  <span>
                    {rule.rule_id} - {rule.rule_type}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(rule.rule_id)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </li>
              ))}
              {formData.listing?.customRules?.map((custom, idx) => (
                <li
                  key={`custom-${idx}`}
                  className="flex items-center justify-between p-2 gap-4 italic outline-dashed otuline-0 outline-zinc-200 rounded-sm my-2"
                >
                  <span>{custom}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomRule(idx)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label>Comments</Label>
            <Input
              placeholder="Add comments for this property..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="destructive" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleUpdate}
            disabled={updateLoading}
          >
            {updateLoading ? "Updating..." : "Update"}
          </Button>
          <Button variant="outline" onClick={handleApprove}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
