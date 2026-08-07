import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateFilter({
  dateFilter,
  onDateChange,
  placeholder = "Filter by Date",
  className,
}) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(dateFilter);

  useEffect(() => {
    setTempDate(dateFilter);
  }, [dateFilter, open]);

  const handleApply = () => {
    onDateChange(tempDate);
    setOpen(false);
  };

  const handleClear = (e) => {
    if (e) e.stopPropagation();
    setTempDate(undefined);
    onDateChange(undefined);
    setOpen(false);
  };

  const hasDate = Boolean(dateFilter);

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 justify-start text-left font-normal bg-white text-xs gap-2 border-gray-200 hover:bg-gray-50",
              !hasDate && "text-gray-500",
              hasDate && "text-gray-900 border-green-500 bg-green-50/50 font-medium"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <span className="truncate">
              {hasDate ? moment(dateFilter).format("DD MMM YYYY") : placeholder}
            </span>
            {hasDate && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleClear(e);
                }}
                className="ml-auto hover:bg-green-200/60 p-0.5 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                title="Clear Date Filter"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border border-gray-200 shadow-lg bg-white rounded-lg" align="start">
          <div className="p-2 border-b bg-gray-50/80 flex items-center justify-between text-xs font-semibold text-gray-700">
            <span>Select Date</span>
            {tempDate && (
              <span className="text-[11px] text-green-700 font-normal">
                {moment(tempDate).format("DD MMM YYYY")}
              </span>
            )}
          </div>
          <Calendar
            initialFocus
            mode="single"
            defaultMonth={tempDate || new Date()}
            selected={tempDate}
            onSelect={setTempDate}
            className="p-3"
          />
          <div className="flex items-center justify-between gap-2 p-3 border-t bg-gray-50/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-8 text-xs text-gray-600 hover:text-gray-900"
            >
              Clear
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!tempDate}
                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateFilter;
