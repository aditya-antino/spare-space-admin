import { Button } from "@/components/ui/button";
import React from "react";
import { Loader2 } from "lucide-react";

interface StaticPageFooterProps {
  onClickSave: () => void;
  isSaving?: boolean;
}

const StaticPageFooter: React.FC<StaticPageFooterProps> = ({ onClickSave, isSaving }) => {
  return (
    <div className="flex py-4 justify-end mt-8">
      <Button
        onClick={onClickSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-[#EDB726] hover:bg-[#d4a11f] text-[#2A2004] font-medium py-2 px-4 rounded-md transition-colors duration-200 border border-transparent disabled:opacity-50"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};

export default StaticPageFooter;
