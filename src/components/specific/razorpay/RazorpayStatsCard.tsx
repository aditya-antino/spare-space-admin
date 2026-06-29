import { LucideIcon, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RazorpayStatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  loading?: boolean;
  error?: boolean;
  accentColor?: string;
  tooltip?: string;
}

const RazorpayStatsCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  loading = false,
  error = false,
  accentColor = "text-primary-p3",
  tooltip,
}: RazorpayStatsCardProps) => {
  if (loading) {
    return (
      <Card className="border-secondary-s2 bg-secondary-s1 h-[120px]">
        <CardContent className="p-5 flex items-center justify-between h-full">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24 bg-secondary-s2" />
            <Skeleton className="h-8 w-20 bg-secondary-s2" />
            <Skeleton className="h-3 w-16 bg-secondary-s2" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg bg-secondary-s2 shrink-0" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-tint1 bg-danger-tint1/10 h-[120px]">
        <CardContent className="p-5 flex items-center justify-between h-full">
          <div className="space-y-1">
            <p className="text-sm font-medium text-danger-d1">{title}</p>
            <h3 className="text-2xl font-bold text-danger-d1">—</h3>
          </div>
          <div className="p-3 bg-danger-tint1/20 rounded-lg shrink-0">
            <Icon className="h-6 w-6 text-danger-d1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-secondary-s2 bg-secondary-s1 hover:shadow-md transition-shadow h-[120px]">
      <CardContent className="p-5 flex items-center justify-between h-full">
        <div className="space-y-1">
          <p className="text-sm font-medium text-tertiary-t3 flex items-center gap-1.5">
            {title}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center text-tertiary-t3/70 hover:text-tertiary-t1 cursor-pointer">
                    <Info className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-xs bg-primary-tint3 text-primary-foreground p-2 rounded shadow-lg border border-secondary-s2">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            )}
          </p>
          <h3 className={`text-2xl font-bold text-tertiary-t1`}>{value}</h3>
          {subValue && (
            <p className="text-xs text-tertiary-t3 font-normal opacity-75">
              {subValue}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-tint4 rounded-lg shrink-0">
          <Icon className={`h-6 w-6 ${accentColor}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default RazorpayStatsCard;
