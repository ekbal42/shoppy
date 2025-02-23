export function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);

  if (isNaN(past.getTime())) {
    return "Invalid Date";
  }

  const diffInMs = now.getTime() - past.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);

  if (diffInYears > 0) {
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  } else if (diffInMonths > 0) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds > 0) {
    return `${diffInSeconds} second${diffInSeconds > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

export function formatTimeToAMPM(time: string | null): string {
  if (!time) return "Not Added";
  const [hours, minutes] = time.split(":");
  const parsedHours = parseInt(hours, 10);
  const ampm = parsedHours >= 12 ? "PM" : "AM";
  const formattedHours = parsedHours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}
