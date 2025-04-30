export function truncateString(text, limit) {
    if (text.length > limit) {
      return text.substring(0, limit) + "...";
    }
    return text;
  }

export function formatCustomDate(isoDateString) {
    const date = new Date(isoDateString);
    
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
  
    return date.toLocaleString("en-US", options);
    // return isoDateString;
  }