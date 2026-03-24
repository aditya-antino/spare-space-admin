import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HostAnalytics,
  HostBookingsTable,
  HostPayoutsTable,
  HostPropertiesTable,
} from "../../../index";
import { Button } from "@/components/ui/button";
import { Download, Plus, Filter } from "lucide-react";

interface HostDashboardProps {
  userId: string;
}

const HostDashboard: React.FC<HostDashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("properties");

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
        <HostAnalytics userId={userId} />
      </section>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Properties Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <HostPropertiesTable userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bookings Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <HostBookingsTable userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payout History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <HostPayoutsTable userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HostDashboard;
