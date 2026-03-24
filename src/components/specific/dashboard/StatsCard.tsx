import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  onClick?: () => void;
  loading?: boolean;
  error?: boolean;
}

const DashboardStatusCard = ({
  title,
  value,
  icon: Icon,
  onClick,
  loading = false,
  error = false,
}: StatsCardProps) => {
  if (loading) {
    return (
      <Card className="border-secondary-s2 bg-secondary-s1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20 bg-secondary-s2" />
              <Skeleton className="h-8 w-16 bg-secondary-s2" />
              <Skeleton className="h-3 w-24 bg-secondary-s2" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg bg-secondary-s2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-tint1 bg-danger-tint1/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-danger-d1">{title}</p>
              <h3 className="text-2xl font-bold text-danger-d1">Error</h3>
              <p className="text-xs text-danger-d1">Failed to load</p>
            </div>
            <div className="p-3 bg-danger-tint1/20 rounded-lg">
              <Icon className="h-6 w-6 text-danger-d1" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer border-secondary-s2 bg-secondary-s1 hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-tertiary-t3">{title}</p>
            <h3 className="text-2xl font-bold text-tertiary-t1">{value}</h3>
          </div>
          <div className="p-3 bg-primary-tint4 rounded-lg">
            <Icon className="h-6 w-6 text-primary-p3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatusCard;
