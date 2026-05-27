"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  snapTimeToFiveMinutes,
  TIME_INPUT_STEP_SECONDS,
} from "@/lib/export/date-format";
import { cn } from "@/lib/utils";

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
  const handleChange = (nextValue: string) => {
    if (!nextValue) {
      onChange("");
      return;
    }

    onChange(snapTimeToFiveMinutes(nextValue) || nextValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        id={id}
        type="time"
        step={TIME_INPUT_STEP_SECONDS}
        value={value}
        disabled={disabled}
        required={!optional}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={(event) => handleChange(event.target.value)}
        className="w-full"
      />
      {optional && value ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-0 text-xs text-muted-foreground"
          disabled={disabled}
          onClick={() => onChange("")}
        >
          Clear time
        </Button>
      ) : null}
    </div>
  );
}
