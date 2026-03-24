const capitalizeWord = (words: string) => {
  if (!words) return "";
  return words[0].toUpperCase() + words.slice(1).toLowerCase();
};

const formatBookingDateTime = (
  startDatetime: string,
  endDatetime: string
): { date: string; timeRange: string } => {
  try {
    const startDate = new Date(startDatetime);
    const endDate = new Date(endDatetime);

    const dateStr = startDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const startTime = startDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const endTime = endDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      date: dateStr,
      timeRange: `${startTime} - ${endTime}`,
    };
  } catch {
    return {
      date: "-",
      timeRange: "-",
    };
  }
};

export { capitalizeWord, formatBookingDateTime };
