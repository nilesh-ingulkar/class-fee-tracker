/** Five-minute granularity for session times (`step` on native time inputs is unreliable). */
export const TIME_INPUT_STEP_SECONDS = 300;

export const FIVE_MINUTE_MARKS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
] as const;

export const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export function toIsoDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Normalizes a Postgres `time` value for `<input type="time">` (HH:MM). */
export function formatTimeForInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return "";
  }

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

/** Rounds a time string to the nearest 5-minute mark (HH:MM). */
export function snapTimeToFiveMinutes(value: string): string {
  const formatted = formatTimeForInput(value);
  if (!formatted) {
    return "";
  }

  const [hoursPart, minutesPart] = formatted.split(":");
  const totalMinutes =
    Number(hoursPart) * 60 + Number(minutesPart);
  const snapped = Math.round(totalMinutes / 5) * 5;
  const hours = Math.floor(snapped / 60) % 24;
  const minutes = snapped % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export type Time12Parts = {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
};

export function toTime24Hour(hour12: number, minute: number, period: "AM" | "PM"): string {
  let hour24 = hour12 % 12;
  if (period === "PM") {
    hour24 += 12;
  }
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function parseTime24To12(value: string): Time12Parts | null {
  const normalized = snapTimeToFiveMinutes(value);
  if (!normalized) {
    return null;
  }

  const [hoursPart, minutesPart] = normalized.split(":");
  const hour24 = Number(hoursPart);
  const minute = Number(minutesPart);
  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }

  return { hour12, minute, period };
}
