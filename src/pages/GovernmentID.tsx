import { useState } from "react";
import { Check, FileDown, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface HostID {
  id: number;
  hostName: string;
  contactNumber: string;
  city: string;
  idType: "Aadhar Card" | "Passport" | "Driving License" | "Voter ID";
  dateSubmitted: string;
}

const GovernmentID = () => {
  const [hostIDs, setHostIDs] = useState<HostID[]>([
    {
      id: 1,
      hostName: "Priya Sharma",
      contactNumber: "+91-9876543210",
      city: "Mumbai",
      idType: "Aadhar Card",
      dateSubmitted: "15 Dec 2024",
    },
    {
      id: 2,
      hostName: "Rajesh Kumar",
      contactNumber: "+91-8765432109",
      city: "Delhi",
      idType: "Passport",
      dateSubmitted: "16 Dec 2024",
    },
    {
      id: 3,
      hostName: "Vikram Singh",
      contactNumber: "+91-6543210987",
      city: "Bangalore",
      idType: "Driving License",
      dateSubmitted: "17 Dec 2024",
    },
    {
      id: 4,
      hostName: "Neha Patel",
      contactNumber: "+91-5432109876",
      city: "Chennai",
      idType: "Aadhar Card",
      dateSubmitted: "18 Dec 2024",
    },
    {
      id: 5,
      hostName: "Amit Verma",
      contactNumber: "+91-4321098765",
      city: "Hyderabad",
      idType: "Voter ID",
      dateSubmitted: "19 Dec 2024",
    },
    {
      id: 6,
      hostName: "Deepika Reddy",
      contactNumber: "+91-3210987654",
      city: "Pune",
      idType: "Passport",
      dateSubmitted: "20 Dec 2024",
    },
    {
      id: 7,
      hostName: "Karan Malhotra",
      contactNumber: "+91-2109876543",
      city: "Jaipur",
      idType: "Aadhar Card",
      dateSubmitted: "21 Dec 2024",
    },
    {
      id: 8,
      hostName: "Meera Iyer",
      contactNumber: "+91-1098765432",
      city: "Ahmedabad",
      idType: "Driving License",
      dateSubmitted: "22 Dec 2024",
    },
  ]);

  const [selectedHostID, setSelectedHostID] = useState<HostID | null>(null);
  const [idDialogOpen, setIdDialogOpen] = useState(false);

  const handleViewApprove = (hostID: HostID) => {
    setSelectedHostID(hostID);
    setIdDialogOpen(true);
  };

  const handleApproveID = () => {
    if (!selectedHostID) return;

    // Remove the ID from the list
    setHostIDs(hostIDs.filter((id) => id.id !== selectedHostID.id));
    setIdDialogOpen(false);

    toast.success("ID Approved", {
      description: `${selectedHostID.hostName}'s ID has been verified successfully.`,
    });
  };

  const handleDownload = () => {
    toast.success("ID Document Downloaded", {
      description: "The document has been downloaded to your device.",
    });
  };

  const columns = [
    {
      key: "hostName",
      header: "Host Name",
      cell: (hostID: HostID) => (
        <div className="font-medium">{hostID.hostName}</div>
      ),
      sortable: true,
    },
    {
      key: "contactNumber",
      header: "Host Contact Number",
      cell: (hostID: HostID) => <div>{hostID.contactNumber}</div>,
      sortable: false,
    },
    {
      key: "city",
      header: "City",
      cell: (hostID: HostID) => <div>{hostID.city}</div>,
      sortable: true,
    },
    {
      key: "idType",
      header: "ID Type",
      cell: (hostID: HostID) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
            {hostID.idType}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "dateSubmitted",
      header: "Date Submitted",
      cell: (hostID: HostID) => <div>{hostID.dateSubmitted}</div>,
      sortable: true,
    },
    {
      key: "actions",
      header: "Action",
      cell: (hostID: HostID) => (
        <Button
          variant="default"
          size="sm"
          onClick={() => handleViewApprove(hostID)}
          className="bg-primary text-primary-foreground"
        >
          View & Approve
        </Button>
      ),
      sortable: false,
    },
  ];

  return (
    <DashboardLayout title="Government ID Verification">
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-4 rounded-md">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Review and approve host-submitted Government IDs for verification.
          </p>
        </div>

        <DataTable
          data={hostIDs}
          columns={columns}
          searchable
          searchPlaceholder="Search by host name or city..."
        />
      </div>

      {/* ID Approval Dialog */}
      {selectedHostID && (
        <Dialog open={idDialogOpen} onOpenChange={setIdDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                ID Verification for {selectedHostID.hostName}
              </DialogTitle>
              <DialogDescription>
                Review the submitted government ID document
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Host Details */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Host Details
                </h3>
                <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Host Name:
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">
                      {selectedHostID.hostName}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">
                      Contact Number:
                    </span>
                  </div>
                  <div>
                    <span>{selectedHostID.contactNumber}</span>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">City:</span>
                  </div>
                  <div>
                    <span>{selectedHostID.city}</span>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">
                      ID Type:
                    </span>
                  </div>
                  <div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
                      {selectedHostID.idType}
                    </span>
                  </div>
                </div>
              </div>

              {/* ID Document Preview */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  ID Document
                </h3>
                <div className="border border-dashed border-border rounded-lg p-4 flex justify-center">
                  <img
                    src="https://storage.googleapis.com/fenado-ai-farm-public/generated/014ab866-9aa6-45d0-b99e-f2d9bf02f2d6.webp"
                    alt="ID Document"
                    className="max-h-48 object-contain rounded-md"
                  />
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-4 rounded-md">
                <p className="text-amber-800 dark:text-amber-300 text-sm">
                  Please verify that the ID document belongs to the host and
                  contains valid information.
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownload}
              >
                <FileDown className="h-4 w-4" />
                Download File
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIdDialogOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApproveID}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve ID
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default GovernmentID;
