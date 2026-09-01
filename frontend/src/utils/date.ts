/**
 * Parse an ISO date string as UTC timestamp in milliseconds.
 * Ensures compatibility across different backend formats (with/without Z / offset).
 */
export function parseUtcDate(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  
  let formatted = dateStr.trim();
  // If no timezone offset (Z, +XX:XX, -XX:XX) is present, append Z for UTC interpretation
  if (!formatted.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(formatted)) {
    formatted += 'Z';
  }
  
  const time = new Date(formatted).getTime();
  return isNaN(time) ? 0 : time;
}
