import { WORKING_TIMEZONE } from "./constants";

export function formatStaffDateTime(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: WORKING_TIMEZONE,
    timeZoneName: "short",
  }).format(date);
}
