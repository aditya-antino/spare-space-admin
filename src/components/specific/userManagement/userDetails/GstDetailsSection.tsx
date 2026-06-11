import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, ShieldCheck } from "lucide-react";
import { getUserGstDetails } from "@/utils/services/userManagement.services";

const GstDetailsSection = ({ userId }: { userId: number }) => {
  const [gstData, setGstData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGstData = async () => {
      try {
        const response = await getUserGstDetails(userId);
        if (response.data?.success && response.data?.data) {
          setGstData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch GST details", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchGstData();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="border shadow-md rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">GST Details</h3>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gstData || (!gstData.hostGst && !gstData.guestGst)) {
    return (
      <Card className="border shadow-md rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">GST Details</h3>
          </div>
          <p className="text-gray-500 text-center py-4">
            No GST details found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-md rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">GST Details</h3>
        </div>

        <div className="space-y-6">
          {gstData.hostGst && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Host GST</Badge>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Business Name</span>
                  <span className="font-medium text-sm text-right">{gstData.hostGst.businessName || "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">GST Number</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{gstData.hostGst.gstNumber || "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">PAN Number</span>
                  <span className="font-mono text-sm">{gstData.hostGst.panNumber || "-"}</span>
                </div>
              </div>
            </div>
          )}

          {gstData.hostGst && gstData.guestGst && <Separator className="my-4" />}

          {gstData.guestGst && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Guest GST</Badge>
                {gstData.guestGst.isVerified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Company Name</span>
                  <span className="font-medium text-sm text-right">{gstData.guestGst.companyName || "-"}</span>
                </div>
                <Separator />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-600">Company Address</span>
                  <span className="text-sm text-gray-800">{gstData.guestGst.companyAddress || "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Phone Number</span>
                  <span className="text-sm">{gstData.guestGst.phoneNumber || "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">GST Number</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{gstData.guestGst.gstNumber || "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">PAN Number</span>
                  <span className="font-mono text-sm">{gstData.guestGst.panNumber || "-"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GstDetailsSection;
