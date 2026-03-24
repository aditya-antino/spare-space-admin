import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  onClick,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 border-l-4 border-l-primary-p1 hover:shadow-md hover:cursor-pointer",
        onClick && "cursor-pointer hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-primary-p1 mb-1">{title}</p>
            <h3 className="text-xl font-bold text-black">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs last period
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="bg-primary-tint2 p-2 rounded-full">
              <Icon className="h-5 w-5 text-black" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
