import { StatsCard } from "@/components/ui/stats-card";
import { handleApiError } from "@/hooks";
import { getUserStats } from "@/utils/services/userManagement.services";
import { ShieldUser, Users } from "lucide-react";
import { useEffect, useState } from "react";

const UserCountTiles = () => {
  const [tilesData, setTilesData] = useState({
    totalGuest: 0,
    totalHost: 0,
  });

  const handleFetchTilesData = async () => {
    try {
      const response = await getUserStats();
      if (response.status === 200) {
        const { hosts, guests } = response.data.data;

        setTilesData({
          totalGuest: guests || 0,
          totalHost: hosts || 0,
        });
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    handleFetchTilesData();
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Guests"
        value={tilesData.totalGuest}
        description="All platform guests"
        icon={Users}
      />
      <StatsCard
        title="Total Hosts"
        value={tilesData.totalHost}
        description="All platform hosts"
        icon={ShieldUser}
      />
    </div>
  );
};

export default UserCountTiles;
