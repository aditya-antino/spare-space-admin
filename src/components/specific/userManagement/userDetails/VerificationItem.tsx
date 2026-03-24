
import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationItemProps {
  verified?: boolean;
  label: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VerificationItem: React.FC<VerificationItemProps> = ({
  verified = false,
  label,
  showLabel = true,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {verified ? (
        <ShieldCheck className={cn(sizeClasses[size], "text-green-500")} />
      ) : (
        <ShieldAlert className={cn(sizeClasses[size], "text-gray-400")} />
      )}

      {showLabel && (
        <span
          className={cn(
            textSizeClasses[size],
            verified ? "text-green-600 font-medium" : "text-gray-500"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default VerificationItem;
