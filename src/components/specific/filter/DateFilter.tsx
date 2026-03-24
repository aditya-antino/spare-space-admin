import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const DateFilter = ({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Payment Date
      </label>
      <Button
        variant="default"
        className="w-full flex justify-between"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select Date"}
        <CalendarIcon className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onSelect(date);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DateFilter;
