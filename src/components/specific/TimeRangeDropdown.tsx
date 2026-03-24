import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const TimeRangeDropdown = ({
  value,
  onValueChange,
  className = "w-32",
}: TimeRangeDropdownProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`border-secondary-s2 bg-secondary-s1 ${className}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-secondary-s2 bg-secondary-s1">
        <SelectItem value="daily" className="text-tertiary-t1">
          Daily
        </SelectItem>
        <SelectItem value="weekly" className="text-tertiary-t1">
          Weekly
        </SelectItem>
        <SelectItem value="monthly" className="text-tertiary-t1">
          Monthly
        </SelectItem>
        <SelectItem value="yearly" className="text-tertiary-t1">
          Yearly
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TimeRangeDropdown;
