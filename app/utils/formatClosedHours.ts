/**
 * Given a time string in the format "HH:MM", returns a formatted version of the string
 * with the hours and minutes separated by a colon.
 *
 * @param {string} timeString - The time string to format
 * @returns {string} The formatted time string
 */
export function formatTime(timeString: string) {
  if (!Boolean(timeString)) return "00:00";

  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
}
