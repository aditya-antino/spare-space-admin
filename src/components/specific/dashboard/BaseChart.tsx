import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface BaseChartProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  filterComponent?: React.ReactNode;
}

const BaseChart = ({
  title,
  children,
  loading = false,
  error = false,
  empty = false,
  filterComponent,
}: BaseChartProps) => {
  if (loading) {
    return (
      <Card className="border-secondary-s2 bg-secondary-s1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-tertiary-t1">{title}</CardTitle>
          {filterComponent}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-secondary-s2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-secondary-s2 bg-secondary-s1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-tertiary-t1">{title}</CardTitle>
          {filterComponent}
        </CardHeader>
        <CardContent>
          <Alert
            variant="destructive"
            className="border-danger-tint1 bg-danger-tint1/10"
          >
            <AlertCircle className="h-4 w-4 text-danger-d1" />
            <AlertDescription className="text-danger-d1">
              Failed to load chart data
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (empty) {
    return (
      <Card className="border-secondary-s2 bg-secondary-s1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-tertiary-t1">{title}</CardTitle>
          {filterComponent}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-tertiary-t3">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-secondary-s2 bg-secondary-s1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-tertiary-t1">{title}</CardTitle>
        {filterComponent}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default BaseChart;
