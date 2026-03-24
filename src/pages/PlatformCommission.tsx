import { useState, useEffect, ChangeEvent } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Percent,
  Save,
  Users,
  UserCheck,
  CreditCard,
  Building,
} from "lucide-react";
import { toast } from "sonner";

import { handleApiError } from "@/hooks";
import {
  getHostPlatformCommissionFee,
  getPlatformCommissionFees,
  postGuestPlatformCommissionFee,
} from "@/utils/services/platformComission.services";

const PlatformCommission = () => {
  const [loading, setLoading] = useState(false);
  const [savingGuest, setSavingGuest] = useState(false);
  const [savingHost, setSavingHost] = useState(false);
  const [guestFee, setGuestFee] = useState("");
  const [hostFee, setHostFee] = useState("");

  const fetchCommission = async () => {
    try {
      setLoading(true);
      const response = await getPlatformCommissionFees();

      if (response.status === 200) {
        setGuestFee(String(response.data.data.guest_platform_fee || ""));
        setHostFee(String(response.data.data.host_platform_fee || ""));
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommission();
  }, []);

  const updateGuestFee = async () => {
    try {
      if (!guestFee || isNaN(Number(guestFee))) {
        toast.error("Please enter a valid guest fee percentage");
        return;
      }

      setSavingGuest(true);

      const response = await postGuestPlatformCommissionFee(Number(guestFee));
      if (response?.status === 200) {
        toast.success("Guest platform fee updated successfully");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingGuest(false);
    }
  };

  const updateHostFee = async () => {
    try {
      if (!hostFee || isNaN(Number(hostFee))) {
        toast.error("Please enter a valid host fee percentage");
        return;
      }

      setSavingHost(true);

      const response = await getHostPlatformCommissionFee(Number(hostFee));
      if (response?.status === 200) {
        toast.success("Host platform fee updated successfully");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingHost(false);
    }
  };

  const handleFeeChange =
    (setter: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const numericValue = event.target.value.replace(/[^0-9.]/g, "");
      setter(numericValue);
    };

  return (
    <DashboardLayout title="Platform Commission">
      <div className="space-y-8">
        <p className="text-gray-600 max-w-2xl">
          Configure platform fees for guests and hosts. These percentages will
          be applied to all bookings on the platform.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      Guest Platform Fee
                    </div>
                    <div className="text-sm font-normal text-blue-700">
                      Service fee charged to guests
                    </div>
                  </div>
                </CardTitle>
                <div className="text-2xl font-bold text-blue-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                  {guestFee}%
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Fee Percentage
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={guestFee}
                  onChange={handleFeeChange(setGuestFee)}
                  placeholder="0.00"
                  disabled={loading}
                  className="pl-8 text-lg font-medium border-gray-300"
                />
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">How it works for guests:</p>
                    <p>
                      This fee is added to the booking total. Guests pay the
                      space price plus {guestFee}% platform fee.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50">
              <Button
                onClick={updateGuestFee}
                disabled={savingGuest || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 shadow-md"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingGuest ? "Updating..." : "Update Guest Fee"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-green-900">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      Host Platform Fee
                    </div>
                    <div className="text-sm font-normal text-green-700">
                      Commission deducted from hosts
                    </div>
                  </div>
                </CardTitle>
                <div className="text-2xl font-bold text-green-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                  {hostFee}%
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Fee Percentage
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={hostFee}
                  onChange={handleFeeChange(setHostFee)}
                  placeholder="0.00"
                  disabled={loading}
                  className="pl-8 text-lg font-medium border-gray-300"
                />
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">How it works for hosts:</p>
                    <p>
                      This commission is deducted from host payouts. Hosts
                      receive the booking amount minus {hostFee}%.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50">
              <Button
                onClick={updateHostFee}
                disabled={savingHost || loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 shadow-md"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingHost ? "Updating..." : "Update Host Fee"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlatformCommission;
