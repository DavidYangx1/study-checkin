export function hoursToMinutes(hours) {
  return Math.round((Number(hours) || 0) * 60);
}

export function minutesToHours(minutes) {
  return (Number(minutes) || 0) / 60;
}

export function formatHours(minutes) {
  const hours = minutesToHours(minutes);

  if (hours === 0) return "0 小时";

  if (Number.isInteger(hours)) {
    return `${hours} 小时`;
  }

  return `${Number(hours.toFixed(1))} 小时`;
}

export function formatCompactHours(minutes) {
  const hours = minutesToHours(minutes);

  if (hours === 0) return "0h";

  if (Number.isInteger(hours)) {
    return `${hours}h`;
  }

  return `${Number(hours.toFixed(1))}h`;
}