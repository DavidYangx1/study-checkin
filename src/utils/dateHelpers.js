export function getDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatInputDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("zh-CN");
}

export function getCheckinStatus(dateValue) {
  const todayValue = getDateInputValue();
  const now = new Date();

  if (dateValue < todayValue) {
    return "backfill";
  }

  if (dateValue === todayValue && now.getHours() >= 23) {
    return "late";
  }

  return "normal";
}

export function getStatusText(status) {
  if (status === "backfill") return "补交";
  if (status === "late") return "迟交";
  return "按时";
}

export function isThisWeek(dateText) {
  const date = new Date(dateText);
  const todayDate = new Date();

  date.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);

  const dayOfWeek = todayDate.getDay() || 7;
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() - dayOfWeek + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return date >= monday && date <= sunday;
}

export function isThisMonth(dateText) {
  const date = new Date(dateText);
  const todayDate = new Date();

  return (
    date.getFullYear() === todayDate.getFullYear() &&
    date.getMonth() === todayDate.getMonth()
  );
}

export function getMonthDays(offset) {
  const todayDate = new Date();

  const targetMonth = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth() + offset,
    1
  );

  const year = targetMonth.getFullYear();
  const month = targetMonth.getMonth();

  const lastDay = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    days.push({
      date: date.toLocaleDateString("zh-CN"),
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      weekday: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
    });
  }

  return days;
}

export function getMonthTitle(offset) {
  const todayDate = new Date();

  const targetMonth = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth() + offset,
    1
  );

  return `${targetMonth.getFullYear()} 年 ${targetMonth.getMonth() + 1} 月`;
}

export function getRecentSevenDays() {
  const days = [];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() - i);

    days.push({
      date: date.toLocaleDateString("zh-CN"),
      label: `${date.getMonth() + 1}/${date.getDate()}`,
    });
  }

  return days;
}