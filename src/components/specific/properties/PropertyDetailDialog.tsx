import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { handleApiError, capitalizeWord } from "@/hooks";
import { getPropertyDetails } from "@/utils/services/properties.services";

interface Host {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
}

interface Image {
  id: number;
  imageUrl: string;
}

interface Property {
  id: number;
  title: string;
  description: string | null;
  city: string;
  address: string | null;
  status: string;
  host: Host;
  spaceType: string;
  images: Image[];
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

interface PropertyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyID?: number;
}

const PropertyDetailDialog: React.FC<PropertyDetailDialogProps> = ({
  open,
  onOpenChange,
  propertyID,
}) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPropertyDetails = async (id: number) => {
    setLoading(true);
    try {
      const response = await getPropertyDetails(id);
      if (response.status === 200) {
        setProperty(response.data.data || null);
      } else {
        setProperty(null);
      }
    } catch (error) {
      handleApiError(error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && propertyID) {
      fetchPropertyDetails(propertyID);
    }
  }, [propertyID, open]);

  const handleClosePropertyDetailModal = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {loading ? "Loading..." : property?.title || "No Property Found"}
          </DialogTitle>
          <DialogDescription>
            Property details and host information
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && !property && (
          <div className="py-6 text-center text-muted-foreground">
            No property details available.
          </div>
        )}

        {!loading && property && (
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold">Basic Info</h3>
              <p>
                <span className="font-medium">City:</span>{" "}
                {capitalizeWord(property.city || "-")}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {capitalizeWord(property.status || "-")}
              </p>
              <p>
                <span className="font-medium">Space Type:</span>{" "}
                {property.spaceType}
              </p>
              {property.address && (
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {property.address}
                </p>
              )}
            </section>

            <section>
              <h3 className="font-semibold">Host</h3>
              <p>{property.host?.name || "-"}</p>
              <p>{property.host?.email || "-"}</p>
              {property.host?.phoneNumber && <p>{property.host.phoneNumber}</p>}
            </section>

            {property.description && (
              <section>
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {property.description}
                </p>
              </section>
            )}

            {property.images?.length > 0 && (
              <section>
                <h3 className="font-semibold mb-2">Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt="Property"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  ))}
                </div>
              </section>
            )}

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleClosePropertyDetailModal}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailDialog;
