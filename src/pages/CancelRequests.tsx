import { useState } from "react";
import { Check, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

interface CancelRequest {
  id: number;
  bookingId: string;
  property: string;
  requestedBy: string;
  reason: string;
  dateRequested: string;
}

const CancelRequests = () => {
  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>([
    { id: 1, bookingId: "BK54321", property: "Hillside Cottage", requestedBy: "Rohan Verma", reason: "Change of plans.", dateRequested: "20 Dec 2024" },
    { id: 2, bookingId: "BK54322", property: "Sea View Penthouse", requestedBy: "Neha Patel", reason: "Found a better deal elsewhere.", dateRequested: "21 Dec 2024" },
    { id: 3, bookingId: "BK54323", property: "Modern Studio Apartment", requestedBy: "Amit Singh", reason: "Emergency situation, need to cancel.", dateRequested: "22 Dec 2024" },
    { id: 4, bookingId: "BK54324", property: "Cozy 2BHK Apartment", requestedBy: "Priya Sharma", reason: "Property doesn't meet expectations based on listing.", dateRequested: "23 Dec 2024" },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<CancelRequest | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  
  const handleAction = (request: CancelRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setConfirmDialogOpen(true);
  };
  
  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;
    
    // Remove the request from the list
    setCancelRequests(cancelRequests.filter(req => req.id !== selectedRequest.id));
    
    setConfirmDialogOpen(false);
    
    if (actionType === "approve") {
      toast.success("Cancellation Approved", {
        description: `Booking ${selectedRequest.bookingId} has been cancelled successfully.`,
      });
    } else {
      toast.success("Cancellation Rejected", {
        description: `Booking ${selectedRequest.bookingId} cancellation request has been rejected.`,
      });
    }
  };

  const columns = [
    {
      key: "bookingId",
      header: "Booking ID",
      cell: (request: CancelRequest) => <div className="font-medium">{request.bookingId}</div>,
      sortable: true,
    },
    {
      key: "property",
      header: "Property",
      cell: (request: CancelRequest) => <div>{request.property}</div>,
      sortable: true,
    },
    {
      key: "requestedBy",
      header: "Requested By",
      cell: (request: CancelRequest) => <div>{request.requestedBy}</div>,
      sortable: true,
    },
    {
      key: "reason",
      header: "Reason",
      cell: (request: CancelRequest) => <div className="max-w-md truncate">{request.reason}</div>,
      sortable: false,
    },
    {
      key: "dateRequested",
      header: "Date Requested",
      cell: (request: CancelRequest) => <div>{request.dateRequested}</div>,
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (request: CancelRequest) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAction(request, "approve")}
            className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 dark:bg-green-950 dark:hover:bg-green-900 dark:text-green-300 dark:border-green-800"
          >
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAction(request, "reject")}
            className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 dark:border-red-800"
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <DashboardLayout title="Cancellation Requests">
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-4 rounded-md">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Manage all booking cancellation requests submitted by users or hosts.
          </p>
        </div>
        
        <DataTable
          data={cancelRequests}
          columns={columns}
          searchable
          searchPlaceholder="Search by booking ID or property..."
        />
      </div>
      
      {/* Confirmation Dialog */}
      {selectedRequest && actionType && (
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "approve" ? "Approve Cancellation?" : "Reject Cancellation?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === "approve" 
                  ? "This will cancel the booking and issue refunds according to the cancellation policy." 
                  : "This will deny the cancellation request and the booking will remain active."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmAction}
                className={actionType === "approve" 
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
                }
              >
                {actionType === "approve" ? "Approve" : "Reject"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  );
};

export default CancelRequests;