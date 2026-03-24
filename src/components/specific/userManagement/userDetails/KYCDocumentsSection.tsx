import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IdCard, Car, Globe, FileText, Calendar, Eye } from "lucide-react";
import { UserDetails } from "@/types";

interface KYCDocumentsSectionProps {
  userDetails: UserDetails;
}

interface KYC_Document {
  id: number;
  docNumber?: string;
  docLink?: string;
  nameVerified?: boolean;
  isVerified?: boolean;
  userName?: string;
  type: "aadhaar" | "dl" | "passport";
}

const KYCDocumentsSection: React.FC<KYCDocumentsSectionProps> = ({
  userDetails,
}) => {
  const kycDocuments: KYC_Document[] = userDetails?.UserKycs || [];

  const aadharDoc = kycDocuments.find((doc) => doc?.type === "aadhaar");
  const dlDoc = kycDocuments.find((doc) => doc?.type === "dl");
  const passportDoc = kycDocuments.find((doc) => doc?.type === "passport");

  const parseDocumentNumber = (docNumber: string | undefined, type: string) => {
    if (!docNumber) return { number: "", dob: "" };

    try {
      if (type === "dl" || type === "passport") {
        const parts = docNumber.split("-");
        if (parts.length >= 3) {
          const numberPart =
            parts.slice(0, Math.max(0, parts.length - 3)).join("-") || parts[0];
          const dob = `${parts[parts.length - 3]}-${parts[parts.length - 2]}-${
            parts[parts.length - 1]
          }`;
          return { number: numberPart, dob };
        }
      } else if (type === "aadhaar") {
        return { number: docNumber, dob: "" };
      }
    } catch (error) {
      console.error("Error parsing document number:", error);
    }

    return { number: docNumber, dob: "" };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case "aadhaar":
        return "Aadhaar Card";
      case "dl":
        return "Driving License";
      case "passport":
        return "Passport";
      default:
        return "Document";
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "aadhaar":
        return <IdCard className="h-4 w-4 text-blue-600" />;
      case "dl":
        return <Car className="h-4 w-4 text-purple-600" />;
      case "passport":
        return <Globe className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case "aadhaar":
        return "bg-blue-50";
      case "dl":
        return "bg-purple-50";
      case "passport":
        return "bg-orange-50";
      default:
        return "bg-gray-50";
    }
  };

  const submittedDocuments = [aadharDoc, dlDoc, passportDoc].filter(Boolean);

  if (submittedDocuments.length === 0) {
    return (
      <Card className="border shadow-md rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <IdCard className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">KYC Documents</h3>
          </div>
          <div className="text-center py-6">
            <p className="text-gray-500">No KYC documents submitted yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderDocumentSection = (
    doc: KYC_Document | undefined,
    type: "aadhaar" | "dl" | "passport",
    showSeparator: boolean
  ) => {
    if (!doc) return null;

    const parsedData = parseDocumentNumber(doc.docNumber, type);
    const isVerified = doc.isVerified ?? false;
    const docLink = doc.docLink || "";

    return (
      <React.Fragment key={type}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getDocumentColor(type)}`}>
              {getDocumentIcon(type)}
            </div>
            <h4 className="font-medium text-gray-800">
              {getDocumentTitle(type)}
            </h4>
            <div className="ml-auto">
              <Badge
                className={
                  isVerified
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-700"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700"
                }
                variant="outline"
              >
                {isVerified ? "Verified" : "Pending Verification"}
              </Badge>
            </div>
          </div>

          <div className="pl-10 space-y-3">
            {type === "dl" || type === "passport" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">
                    {type === "dl" ? "License Number" : "Passport Number"}
                  </span>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                    {parsedData.number || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Date of Birth</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">
                      {formatDate(parsedData.dob)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Aadhaar Number</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {parsedData.number || "N/A"}
                </span>
              </div>
            )}

            {docLink && (
              <div className="space-y-1">
                <span className="text-sm text-gray-600">Document Image</span>
                <div className="relative group">
                  <img
                    src={docLink}
                    alt={`${getDocumentTitle(type)} Document`}
                    className="w-full max-w-md rounded-lg border border-gray-200 cursor-pointer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => docLink && window.open(docLink, "_blank")}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {showSeparator && <Separator />}
      </React.Fragment>
    );
  };

  return (
    <Card className="border shadow-md rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <IdCard className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">KYC Documents</h3>
        </div>

        <div className="space-y-6">
          {renderDocumentSection(
            aadharDoc,
            "aadhaar",
            submittedDocuments.length > 1
          )}
          {renderDocumentSection(
            dlDoc,
            "dl",
            submittedDocuments.filter((doc) => doc !== dlDoc && doc !== null)
              .length > 0
          )}
          {renderDocumentSection(passportDoc, "passport", false)}
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCDocumentsSection;
