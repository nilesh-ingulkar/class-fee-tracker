"use client";

import {
  FIVE_MINUTE_MARKS,
  HOURS_12,
  parseTime24To12,
  toTime24Hour,
} from "@/lib/export/date-format";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
};

export function TimePicker({
  id,
  value,
  onChange,
  optional = false,
  disabled = false,
  className,
}: TimePickerProps) {
  const parsed = value ? parseTime24To12(value) : null;

  const emit = (hour12: number | null, minute: number | null, period: "AM" | "PM" | null) => {
    if (hour12 === null || minute === null || period === null) {
      if (optional) {
        onChange("");
      }
      return;
    }

    onChange(toTime24Hour(hour12, minute, period));
  };

  return (
    <div
      id={id}
      className={cn("grid grid-cols-3 gap-2", className)}
      aria-label="Session time"
    >
      <Select
        disabled={disabled}
        value={parsed ? String(parsed.hour12) : undefined}
        onValueChange={(hourValue) => {
          if (hourValue === "__clear__") {
            emit(null, null, null);
            return;
          }

          const hour12 = Number(hourValue);
          emit(
            hour12,
            parsed?.minute ?? 0,
            parsed?.period ?? "AM",
          );
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {optional ? <SelectItem value="__clear__">—</SelectItem> : null}
          {HOURS_12.map((hour) => (
            <SelectItem key={hour} value={String(hour)}>
              {String(hour).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        disabled={disabled}
        value={parsed ? String(parsed.minute) : undefined}
        onValueChange={(minuteValue) => {
          if (minuteValue === "__clear__") {
            emit(null, null, null);
            return;
          }

          const minute = Number(minuteValue);
          emit(
            parsed?.hour12 ?? 12,
            minute,
            parsed?.period ?? "AM",
          );
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {optional ? (
            <SelectItem value="__clear__">—</SelectItem>
          ) : null}
          {FIVE_MINUTE_MARKS.map((minute) => (
            <SelectItem key={minute} value={String(minute)}>
              {String(minute).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        disabled={disabled}
        value={parsed?.period}
        onValueChange={(periodValue) => {
          if (periodValue === "__clear__") {
            emit(null, null, null);
            return;
          }

          emit(
            parsed?.hour12 ?? 12,
            parsed?.minute ?? 0,
            periodValue as "AM" | "PM",
          );
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          {optional ? (
            <SelectItem value="__clear__">—</SelectItem>
          ) : null}
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
