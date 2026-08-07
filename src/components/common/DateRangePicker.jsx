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

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Filter by Date",
  className,
}) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState(dateRange);

  useEffect(() => {
    setTempRange(dateRange);
  }, [dateRange, open]);

  const handleApply = () => {
    if (tempRange?.from) {
      const finalRange = {
        from: tempRange.from,
        to: tempRange.to || tempRange.from,
      };
      onDateRangeChange(finalRange);
    } else {
      onDateRangeChange(undefined);
    }
    setOpen(false);
  };

  const handleClear = (e) => {
    if (e) e.stopPropagation();
    setTempRange(undefined);
    onDateRangeChange(undefined);
    setOpen(false);
  };

  const hasRange = Boolean(dateRange?.from);

  const formatRangeLabel = () => {
    if (!dateRange?.from) return placeholder;
    const fromStr = moment(dateRange.from).format("DD MMM YYYY");
    if (!dateRange?.to || moment(dateRange.from).isSame(dateRange.to, "day")) {
      return fromStr;
    }
    const toStr = moment(dateRange.to).format("DD MMM YYYY");
    return `${fromStr} - ${toStr}`;
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 justify-start text-left font-normal bg-white text-xs gap-2 border-gray-200 hover:bg-gray-50",
              !hasRange && "text-gray-500",
              hasRange && "text-gray-900 border-green-500 bg-green-50/50 font-medium"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <span className="truncate">{formatRangeLabel()}</span>
            {hasRange && (
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
            <span>Select Date Range</span>
            {tempRange?.from && (
              <span className="text-[11px] text-green-700 font-normal">
                {moment(tempRange.from).format("DD MMM")}
                {tempRange.to && !moment(tempRange.from).isSame(tempRange.to, "day")
                  ? ` - ${moment(tempRange.to).format("DD MMM YYYY")}`
                  : ` ${moment(tempRange.from).format("YYYY")}`}
              </span>
            )}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={tempRange?.from || new Date()}
            selected={tempRange}
            onSelect={setTempRange}
            numberOfMonths={1}
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
                disabled={!tempRange?.from}
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

export default DateRangePicker;
