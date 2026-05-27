/** Five-minute granularity for native `<input type="time">` (`step` is in seconds). */
export const TIME_INPUT_STEP_SECONDS = 300;

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
  const totalMinutes = Number(hoursPart) * 60 + Number(minutesPart);
  const snapped = Math.round(totalMinutes / 5) * 5;
  const hours = Math.floor(snapped / 60) % 24;
  const minutes = snapped % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
