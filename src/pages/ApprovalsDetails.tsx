import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Camera,
  Shield,
  Car,
  Calendar,
  Edit3,
  Check,
  X,
  Phone,
  Mail,
  Building,
  AlertCircle,
  FileText,
  Settings,
  Loader2,
  Eye,
  Star,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fallbackMessages } from "@/constants/fallbackMessages";
import { toast } from "sonner";
import { getPropertyDetails } from "@/utils/services/properties.services";
import { handleApiError, capitalizeWord } from "@/hooks";
import {
  approveProperty,
  updatePropertyDetails,
} from "@/utils/services/approvals.services";
import { ROUTES } from "@/constants";
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

interface Property {
  id: number;
  title: string;
  description: string;
  detailedDescription: string;

  street: string | null;
  area: string | null;
  locality: string | null;
  city: string;
  pincode: number | string | null;
  address: string | null;
  heightFt?: number;
  sizeSqft?: number;
  capacity?: number;

  status: "approved" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
  isRefundable: boolean;

  host: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
  };

  images: {
    id: number;
    imageUrl: string;
    isFeatured?: boolean;
  }[];

  amenities: string[];

  pricing: {
    pricePerHour: string;
    minBookingHours: number;
    extraHourPrice: string;
    basePriceMonThurs: string | null;
    basePriceFriSun: string | null;
    discountAmount: number;
    extraDiscountPer?: {
      four?: number;
      six?: number;
      eight?: number;
      twelve?: number;
    };
  };

  rules: {
    rule_id: string;
    rule_name: string;
    rule_type: string;
  }[];

  listing: {
    id: number;
    rules: {
      rule_id: string;
      rule_type: string;
    }[];
    customRules: string[];
    arrivalInstructions: string | null;
    parkingOptions: {
      free_onsite: boolean;
      paid_onsite: boolean;
      nearby_parking_lot: boolean;
    };
    operatingHours: {
      [key: string]: {
        is_open: boolean;
        sessions?: { from: string; to: string }[];
      };
    };
    cancellationPolicy: {
      key: string;
      message: string;
    };
    instantBooking?: boolean;
    isRefundable?: boolean;
    verificationDocuments?: {
      image: string;
      verification_doc_type: string;
    }[];
    basePriceMonThurs?: string | null;
    basePriceFriSun?: string | null;
    discountAmount?: number;
    advanceBookingDays?: number;
    availableWindowDate?: string | null;
    policies?: {
      regulations?: {
        space_meets_regulations?: boolean;
      };
      booking_policies?: {
        follow_booking_policies?: boolean;
        understand_no_external_contracts?: boolean;
      };
      payment_processing?: {
        understand_service_fee?: boolean;
        process_payments_on_platform?: boolean;
      };
      platform_communication?: {
        keep_conversations_on_platform?: boolean;
      };
    }[];
    extraDiscountPer?: {
      four?: number;
      six?: number;
      eight?: number;
      twelve?: number;
    };
  };

  categoryData?: {
    id: number;
    name: string;
    status: string;
    imgUrl: string;
  };

  activities?: {
    id: number;
    activity: string;
    status: string;
  }[];

  state?: string;

  spaceType?: string[];
}

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [comments, setComments] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const getPropertyDetail = async () => {
    try {
      setLoading(true);
      if (!id) {
        return toast.error(fallbackMessages.genericError);
      }
      const response = await getPropertyDetails(Number(id));
      if (response.status === 200 && response.data?.data) {
        const data = response.data.data as any;

        // Sort images to show featured first
        if (data.images && Array.isArray(data.images)) {
          data.images.sort((a: any, b: any) => {
            if (a.isFeatured === b.isFeatured) return 0;
            return a.isFeatured ? -1 : 1;
          });
        }

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
    if (id) getPropertyDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      const response = await approveProperty(id);
      if (response.status === 200) {
        toast.success(fallbackMessages.propertyApprovalSuccess);
        setProperty((prev) => (prev ? { ...prev, status: "approved" } : null));
        setFormData((prev) => (prev ? { ...prev, status: "approved" } : null));
        navigate(ROUTES.approvals);
      }
    } catch (error) {
      handleApiError(error);
    }
  };
  const address = [
    formData?.street,
    formData?.area,
    formData?.locality,
    formData?.city,
    formData?.state,
    formData?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const area = formData?.area;
  const locality = formData?.locality;

  const handleUpdate = async () => {
    if (!id || !formData) return;

    try {
      setUpdateLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        detailedDescription: formData.detailedDescription,
        images: formData.images.map((img) => ({
          imageUrl: img.imageUrl,
          isFeatured: img.isFeatured || false,
        })),
        customRules: formData.listing?.customRules || [],
        arrivalInstructions: formData.listing?.arrivalInstructions,
        comments,
      };

      const response = await updatePropertyDetails(id, payload);

      if (response.status === 200) {
        toast.success(fallbackMessages.propertyUpdateSuccess);
        setProperty(formData);
        setIsEditing(false);
        setConfirmDialogOpen(false);
        setComments("");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChange = (
    field: keyof Property,
    value: string | number | any,
  ) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleSetFeatured = (index: number) => {
    if (!formData) return;

    const updatedImages = formData.images.map((img, i) => ({
      ...img,
      isFeatured: i === index,
    }));

    setFormData({ ...formData, images: updatedImages });
  };

  const handleRemoveImage = (imgId: number) => {
    if (!formData) return;
    const updatedImages = formData.images.filter((img) => img.id !== imgId);

    // If we're removing the currently selected image, select the first one
    if (selectedImage >= updatedImages.length) {
      setSelectedImage(0);
    }

    setFormData({ ...formData, images: updatedImages });
  };

  const handleRemoveRule = (ruleId: string) => {
    if (!formData) return;
    const updatedRules = formData.rules.filter(
      (rule) => rule.rule_id !== ruleId,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(property ? { ...property } : null);
    setComments("");
  };

  if (loading) {
    return (
      <DashboardLayout title="Property Approvals">
        <div className="min-h-[80%] flex items-center justify-center">
          <div className="flex items-center space-x-3 text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg">Getting property details...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!formData) {
    return (
      <DashboardLayout title="Property Approvals">
        <div className="min-h-[80%] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No property found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const discountAmount = formData.listing.discountAmount;
  const isRefundable = formData.listing.isRefundable;
  let discountText = "-";

  if (discountAmount) {
    if (isRefundable) {
      discountText = `${discountAmount}% + 10%`;
    } else {
      discountText = `${discountAmount}%`;
    }
  } else {
    if (isRefundable) {
      discountText = "10%";
    }
  }

  return (
    <DashboardLayout title="Property Approvals">
      <div className="min-h-screen">
        {/* Header */}
        <div>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    formData.status,
                  )}`}
                >
                  {formData.status.charAt(0).toUpperCase() +
                    formData.status.slice(1)}
                </div>
              </div>

              <div className="flex space-x-3">
                {formData.status === "pending" && !isEditing && (
                  <button
                    onClick={handleApprove}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                )}
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>

                    <button
                      onClick={() => setConfirmDialogOpen(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-p1 hover:bg-primary-tint1 text-black rounded-lg border border-primary-p1 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={
                        formData.images[selectedImage]?.imageUrl ||
                        "/placeholder-image.jpg"
                      }
                      alt="Property"
                      // className="w-full h-full object-cover"
                      className="w-full h-full object-contain bg-black"
                    />
                  </div>
                  {formData.images[selectedImage]?.isFeatured && (
                    <div className="absolute top-4 right-4 bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-900 rounded-full px-3 py-1.5 shadow-lg flex items-center space-x-1.5 border border-amber-300 backdrop-blur-md">
                      <Star
                        size={14}
                        fill="currentColor"
                        className="text-amber-800"
                      />
                      <span className="text-[11px] font-extrabold uppercase tracking-widest">
                        Featured
                      </span>
                    </div>
                  )}

                  {isEditing && !formData.images[selectedImage]?.isFeatured && (
                    <button
                      onClick={() => handleSetFeatured(selectedImage)}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 hover:text-amber-600 rounded-full px-4 py-2 shadow-lg flex items-center space-x-2 border border-gray-200 backdrop-blur-md transition-all transform hover:scale-105"
                    >
                      <Star size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Set as Featured
                      </span>
                    </button>
                  )}

                  <div className="absolute top-4 left-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-white text-sm flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        {selectedImage + 1} / {formData.images.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {formData.images.map((img, index) => (
                      <div key={img.id} className="relative flex-shrink-0">
                        <button
                          onClick={() => setSelectedImage(index)}
                          className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={img.imageUrl}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        {img.isFeatured && (
                          <div className="absolute top-1 left-1 bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-800 rounded-full p-1 shadow-sm border border-amber-300">
                            <Star size={10} fill="currentColor" />
                          </div>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveImage(img.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 mr-6 max-w-[70%]">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 truncate">
                            Title
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                              handleChange("title", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center text-gray-600">
                          {/* <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="break-words line-clamp-2">
                            {address}
                            Area:{area}
                            Locality:{locality}
                          </span> */}
                          <div className="space-y-2">
                            {/* Full Address */}
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="break-words line-clamp-2">
                                {address}
                              </span>
                            </div>

                            <div className="mt-2 flex gap-2">
                              {/* Area */}
                              <div className="flex items-center text-sm text-gray-700">
                                <span className="font-medium mr-2">Area:</span>
                                <span>{area}</span>
                              </div>

                              {/* Locality */}
                              <div className="flex items-center text-sm text-gray-700">
                                <span className="font-medium mr-2">
                                  Locality:
                                </span>
                                <span>{locality}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 break-words line-clamp-2">
                          {formData.title}
                        </h2>
                        <div className="flex items-center text-gray-600 mb-4">
                          {/* <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="break-words line-clamp-2">
                            {address}
                          </span> */}
                          <div className="space-y-2">
                            {/* Full Address */}
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="break-words line-clamp-2">
                                {address}
                              </span>
                            </div>

                            <div className="mt-2 flex gap-2">
                              {/* Area */}
                              <div className="flex items-center text-sm text-gray-700">
                                <span className="font-medium mr-2">Area:</span>
                                <span>{area}</span>
                              </div>

                              {/* Locality */}
                              <div className="flex items-center text-sm text-gray-700">
                                <span className="font-medium mr-2">
                                  Locality:
                                </span>
                                <span>{locality}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-bold text-blue-600">
                      {formData.pricing.pricePerHour || 0}
                    </div>
                    <div className="text-sm text-gray-500">per hour</div>
                  </div>
                </div>

                {/* Read-only pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Min Booking
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {formData.pricing.minBookingHours}h
                        </p>
                      </div>
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          Extra Hour
                        </p>
                        <p className="text-xl font-bold text-green-900">
                          {formatPrice(formData.pricing.extraHourPrice)}
                        </p>
                      </div>
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">
                          Space ID
                        </p>
                        <p className="text-xl font-bold text-purple-900">
                          #{formData.id}
                        </p>
                      </div>
                      <Building className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Editable descriptions */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    {isEditing ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                        {formData.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Detailed Description
                    </h3>
                    {isEditing ? (
                      <textarea
                        value={formData.detailedDescription}
                        onChange={(e) =>
                          handleChange("detailedDescription", e.target.value)
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                        {formData.detailedDescription}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Height (ft)</p>
                  <p className="font-medium text-gray-900">
                    {property?.heightFt}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Size (sqft)</p>
                  <p className="font-medium text-gray-900">
                    {property?.sizeSqft}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-medium text-gray-900">
                    {property?.capacity}
                  </p>
                </div>
              </div>

              {property?.categoryData && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    Category
                  </h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={property?.categoryData?.imgUrl}
                      className="w-8 h-8 rounded-full"
                      alt={property?.categoryData?.name}
                    />
                    <span className="text-gray-900 font-medium">
                      {property?.categoryData?.name}
                    </span>
                  </div>
                </div>
              )}

              {property.activities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Activities
                  </h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    {property.activities.map((activity) => (
                      <li key={activity.id}>{activity.activity}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Operating Hours - Read Only */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Operating Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(formData.listing.operatingHours).map(
                    ([day, schedule]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <span className="font-medium text-gray-900 capitalize">
                          {day}
                        </span>
                        <div className="text-right">
                          {schedule.is_open ? (
                            <div className="text-green-600">
                              {schedule.sessions?.map((session, idx) => (
                                <div key={idx} className="text-sm">
                                  {session.from} - {session.to}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-red-500 text-sm">Closed</span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Rules & Policies */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Rules & Policies
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">
                      Property Rules
                    </h4>
                    <div className="space-y-2">
                      {formData.rules.map((rule) => (
                        <div
                          key={rule.rule_id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-3 ${
                                rule.rule_type === "allow"
                                  ? "bg-green-500"
                                  : rule.rule_type === "do-not-allow"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                              }`}
                            ></div>
                            <span className="text-gray-700">
                              {rule.rule_name}:{" "}
                              {rule.rule_type.replace(/-/g, " ")}
                            </span>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveRule(rule.rule_id)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.listing.customRules.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">
                        Custom Rules
                      </h4>
                      <div className="space-y-2">
                        {formData.listing.customRules.map((rule, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200"
                          >
                            <span className="text-amber-800 flex-1 break-words">
                              {rule}
                            </span>
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveCustomRule(index)}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ml-2 flex-shrink-0 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {property?.listing.policies?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        Policies
                      </h3>
                      {property?.listing.policies.map((policy, idx) => (
                        <div key={idx} className="space-y-2">
                          <p className="text-gray-700">
                            <strong>Regulations:</strong>{" "}
                            {policy.regulations?.space_meets_regulations
                              ? "Yes"
                              : "No"}
                          </p>
                          <p className="text-gray-700">
                            <strong>Booking Policies:</strong>{" "}
                            {policy?.booking_policies?.follow_booking_policies
                              ? "Followed"
                              : "Not Followed"}
                            ,
                            {policy?.booking_policies
                              ?.understand_no_external_contracts
                              ? "No External Contracts"
                              : ""}
                          </p>
                          <p className="text-gray-700">
                            <strong>Payment Processing:</strong>{" "}
                            {policy?.payment_processing?.understand_service_fee
                              ? "Understood Fee"
                              : "Fee Not Understood"}
                            ,
                            {policy?.payment_processing
                              ?.process_payments_on_platform
                              ? "Processed on Platform"
                              : "Not Processed"}
                          </p>
                          <p className="text-gray-700">
                            <strong>Platform Communication:</strong>{" "}
                            {policy?.platform_communication
                              ?.keep_conversations_on_platform
                              ? "Kept on Platform"
                              : "Not Kept"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isRefundable ? (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">
                        Cancellation Policy
                      </h4>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                          <div>
                            <div className="font-medium text-blue-900 mb-1 capitalize">
                              {formData.listing.cancellationPolicy.key} Policy
                            </div>
                            <p className="text-blue-800 text-sm leading-relaxed">
                              {formData.listing.cancellationPolicy.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-800 font-medium text-sm">
                          Non-Refundable Booking (Discount: 10%)
                        </span>
                      </div>
                      <p className="text-red-700 text-xs mt-1">
                        This booking is non-refundable. No refunds will be
                        provided for cancellations.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Property Details */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Additional Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Address</p>
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {address || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 bg-purple-50 border-purple-200">
                    <p className="text-sm text-purple-600 font-medium">
                      Discount
                    </p>
                    <p className="text-sm font-medium text-purple-900">
                      {discountText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parking Options - Read Only */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Parking Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      formData.listing.parkingOptions.free_onsite
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <Car
                        className={`w-5 h-5 mr-3 ${
                          formData.listing.parkingOptions.free_onsite
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">Free Onsite</p>
                        <p
                          className={`text-sm ${
                            formData.listing.parkingOptions.free_onsite
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {formData.listing.parkingOptions.free_onsite
                            ? "Available"
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      formData.listing.parkingOptions.paid_onsite
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <DollarSign
                        className={`w-5 h-5 mr-3 ${
                          formData.listing.parkingOptions.paid_onsite
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">Paid Onsite</p>
                        <p
                          className={`text-sm ${
                            formData.listing.parkingOptions.paid_onsite
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {formData.listing.parkingOptions.paid_onsite
                            ? "Available"
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      formData.listing.parkingOptions.nearby_parking_lot
                        ? "bg-purple-50 border-purple-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <MapPin
                        className={`w-5 h-5 mr-3 ${
                          formData.listing.parkingOptions.nearby_parking_lot
                            ? "text-purple-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">Nearby Lot</p>
                        <p
                          className={`text-sm ${
                            formData.listing.parkingOptions.nearby_parking_lot
                              ? "text-purple-600"
                              : "text-gray-500"
                          }`}
                        >
                          {formData.listing.parkingOptions.nearby_parking_lot
                            ? "Available"
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Host Info & Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Host Information - Read Only */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Host Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-tint2 rounded-full flex items-center justify-center">
                      <span className="text-black font-semibold text-lg">
                        {formData.host.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {capitalizeWord(formData.host.name || "-")}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Host ID: #{formData.host.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-600 mr-3" />
                      <span className="text-sm text-gray-700 break-words">
                        {formData.host.email}
                      </span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-600 mr-3" />
                      <span className="text-sm text-gray-700">
                        {formData.host.phoneNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrival Instructions - Read Only */}
              {/* Arrival Instructions */}
              {(formData.listing.arrivalInstructions || isEditing) && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Arrival Instructions
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={formData.listing.arrivalInstructions || ""}
                      onChange={(e) => {
                        if (!formData) return;
                        setFormData({
                          ...formData,
                          listing: {
                            ...formData.listing,
                            arrivalInstructions: e.target.value,
                          },
                        });
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-blue-900 placeholder-blue-400"
                      placeholder="Enter arrival instructions..."
                    />
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 leading-relaxed break-words">
                        {formData.listing.arrivalInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Stats - Read Only */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Images</span>
                    <span className="font-medium text-gray-900">
                      {formData.images.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Rules</span>
                    <span className="font-medium text-gray-900">
                      {formData.rules.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Custom Rules</span>
                    <span className="font-medium text-gray-900">
                      {formData.listing.customRules.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Open Days</span>
                    <span className="font-medium text-gray-900">
                      {
                        Object.values(formData.listing.operatingHours).filter(
                          (day) => day.is_open,
                        ).length
                      }
                      /7
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {new Date(formData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {new Date(formData.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2">Pricing</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hourly:</span>
                  <span className="font-medium text-gray-900">
                    ₹{Number(property.pricing?.pricePerHour || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600"> Min. Booking Hours:</span>
                  <span className="font-medium text-gray-900">
                    {property.pricing?.minBookingHours}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  Extra Hour Discounts
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">4 Hours:</span>
                    <span className="font-medium text-gray-900">
                      {formData.pricing.extraDiscountPer?.four || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">6 Hours:</span>
                    <span className="font-medium text-gray-900">
                      {formData.pricing.extraDiscountPer?.six || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">8 Hours:</span>
                    <span className="font-medium text-gray-900">
                      {formData.pricing.extraDiscountPer?.eight || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">12 Hours:</span>
                    <span className="font-medium text-gray-900">
                      {formData.pricing.extraDiscountPer?.twelve || 0}%
                    </span>
                  </div>
                </div>
              </div>
              {property.amenities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-green-50 rounded-lg text-green-800 text-sm font-medium text-center"
                      >
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Documents with Image Preview */}
              {property.listing.verificationDocuments?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Verification Documents
                  </h3>
                  <div className="space-y-4">
                    {property.listing.verificationDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-gray-700 font-medium capitalize">
                              {doc.verification_doc_type.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        {/* Image Preview */}
                        {doc.image && (
                          <div className="mt-3">
                            <div className="aspect-video overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                              <img
                                src={doc.image}
                                alt={`${doc.verification_doc_type} document`}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onClick={() => window.open(doc.image, "_blank")}
                              />
                            </div>
                            <div className="mt-3 flex justify-center">
                              <button
                                onClick={() => window.open(doc.image, "_blank")}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Full Size</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between">
                <div>
                  <p className="text-gray-600">Instant Booking</p>
                  <p className="font-medium text-gray-900">
                    {property.listing.instantBooking ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Refundable</p>
                  <p className="font-medium text-gray-900">
                    {!property.listing.isRefundable ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between">
                <div>
                  <p className="text-gray-600">Advance Booking</p>
                  <p className="font-medium text-gray-900">
                    {property.listing.advanceBookingDays === 0 ||
                    !property.listing.advanceBookingDays
                      ? 2
                      : property.listing.advanceBookingDays}{" "}
                    days
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Available Time</p>
                  <p className="font-medium text-gray-900 text-center">
                    {property.listing.availableWindowDate
                      ? new Date(
                          property.listing.availableWindowDate,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "6 months"}
                  </p>
                </div>
              </div>

              {/* Property Status Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Property Status
                </h3>
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-lg border-2 ${getStatusColor(
                      formData.status,
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Status</p>
                        <p className="text-sm opacity-75">
                          {formData.status === "pending" &&
                            "Awaiting review and approval"}
                          {formData.status === "approved" &&
                            "Property is live and bookable"}
                          {formData.status === "rejected" &&
                            "Property needs corrections"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold capitalize">
                          {formData.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.status === "pending" && !isEditing && (
                    <div className="text-center text-sm text-gray-600 mt-2">
                      Use the action buttons above to approve or edit this
                      property.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Confirmation Dialog */}
        <AlertDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Update</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide comments for this property update. This action
                will update the property details.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-4">
              <input
                type="text"
                placeholder="Add comments..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={updateLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUpdate}
                disabled={updateLoading || !comments.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Confirm Update"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default PropertyDetailsPage;
