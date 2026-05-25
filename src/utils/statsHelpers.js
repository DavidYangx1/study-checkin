export function getLatestRecordsByName(records) {
  const latest = {};

  records.forEach((record) => {
    const key = record.name;
    const existing = latest[key];

    if (
      !existing ||
      new Date(record.created_at).getTime() >
        new Date(existing.created_at).getTime()
    ) {
      latest[key] = record;
    }
  });

  return latest;
}

export function getRecordsByMember(records, memberNames) {
  const result = {};

  memberNames.forEach((memberName) => {
    result[memberName] = {};
  });

  records.forEach((record) => {
    if (!record.name || !record.date) return;

    if (!result[record.name]) {
      result[record.name] = {};
    }

    const existing = result[record.name][record.date];

    if (
      !existing ||
      new Date(record.created_at).getTime() >
        new Date(existing.created_at).getTime()
    ) {
      result[record.name][record.date] = record;
    }
  });

  return result;
}

export function calculateStreak(dateMap) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  let streak = 0;
  const currentDate = new Date(todayDate);

  while (true) {
    const dateKey = currentDate.toLocaleDateString("zh-CN");

    if (!dateMap[dateKey]) {
      break;
    }

    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}