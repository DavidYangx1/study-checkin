import { useMemo, useState } from "react";
import CheckinSummaryCard from "./CheckinSummaryCard";
import { formatHours } from "../utils/timeHelpers";

export default function CalendarView({
    memberNames,
    calendarDays,
    calendarTitle,
    recordsByDate,
    selectedDate,
    setSelectedDate,
    selectedRecordsByName,
    selectedTotalMinutes,
    monthOffset,
    setMonthOffset,
    getStatusText,
    canEditRecord,
    currentUser,
    onStartEdit,
    onDeleteRecord,
}) {
    const [calendarMode, setCalendarMode] = useState("personal");

    const currentUserName = currentUser?.name;
    const selectedDayGroupCount = Object.keys(selectedRecordsByName).length;
    const selectedRecords = calendarMode === "personal"
        ? currentUserName
            ? { [currentUserName]: selectedRecordsByName[currentUserName] }
            : {}
        : selectedRecordsByName;

    const selectedMemberNames = calendarMode === "personal" && currentUserName
        ? [currentUserName]
        : memberNames;

    const personalMonthStats = useMemo(() => {
        if (!currentUserName) {
            return { checkins: 0, minutes: 0, streak: 0 };
        }

        const checkins = calendarDays.filter((day) => {
            return recordsByDate[day.date]?.[currentUserName];
        });

        const minutes = checkins.reduce((sum, day) => {
            return sum + Number(recordsByDate[day.date]?.[currentUserName]?.minutes || 0);
        }, 0);

        let streak = 0;
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);

        while (true) {
            const dateKey = cursor.toLocaleDateString("zh-CN");

            if (!recordsByDate[dateKey]?.[currentUserName]) {
                break;
            }

            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        return {
            checkins: checkins.length,
            minutes,
            streak,
        };
    }, [calendarDays, currentUserName, recordsByDate]);

    const groupMonthStats = useMemo(() => {
        const completeDays = calendarDays.filter((day) => {
            const count = Object.keys(recordsByDate[day.date] || {}).length;
            return memberNames.length > 0 && count === memberNames.length;
        }).length;

        const activeDays = calendarDays.filter((day) => {
            return Object.keys(recordsByDate[day.date] || {}).length > 0;
        }).length;

        return {
            completeDays,
            activeDays,
        };
    }, [calendarDays, recordsByDate, memberNames]);

    return (
        <section className="history-card">
            <div className="calendar-shell">
                <div className="calendar-main-card">
                    <div className="history-top">
                        <div>
                            <p className="section-kicker">CHECK-IN CALENDAR</p>
                            <h2>年度打卡日历</h2>
                            <p>查看前后一年内的打卡记录，点击日期查看当天所有成员的打卡情况</p>

                            <div className="calendar-mode-tabs">
                                <button
                                    type="button"
                                    className={calendarMode === "personal" ? "active" : ""}
                                    onClick={() => setCalendarMode("personal")}
                                >
                                    个人打卡日历
                                </button>

                                <button
                                    type="button"
                                    className={calendarMode === "group" ? "active" : ""}
                                    onClick={() => setCalendarMode("group")}
                                >
                                    小组打卡日历
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`calendar-grid habit-calendar ${calendarMode}`}>
                        {calendarDays.map((day) => {
                            const dayRecords = recordsByDate[day.date] || {};
                            const count = Object.keys(dayRecords).length;
                            const isSelected = selectedDate === day.date;
                            const personalDone = Boolean(currentUserName && dayRecords[currentUserName]);
                            const completionClass = calendarMode === "personal"
                                ? personalDone
                                    ? "done"
                                    : "empty"
                                : count === 0
                                    ? "empty"
                                    : count === memberNames.length && memberNames.length > 0
                                        ? "complete"
                                        : "partial";

                            return (
                                <button
                                    key={day.date}
                                    className={[
                                        "date-cell",
                                        "habit-day",
                                        completionClass,
                                        isSelected ? "selected" : "",
                                    ].filter(Boolean).join(" ")}
                                    onClick={() => setSelectedDate(day.date)}
                                >
                                    <strong>{day.day}</strong>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={`calendar-control calendar-summary-card ${calendarMode}`}>
                    <div className="calendar-matrix-head">
                        <div>
                            <span>{calendarMode === "personal" ? "本月打卡" : "选中日完成"}</span>
                            <strong>
                                {calendarMode === "personal"
                                    ? `${personalMonthStats.checkins} 天`
                                    : `${selectedDayGroupCount}/${memberNames.length}`}
                            </strong>
                        </div>
                    </div>

                    <div className="selected-summary">
                        {calendarMode === "personal" ? (
                            <div className="calendar-metrics">
                                <div>
                                    <strong>{formatHours(personalMonthStats.minutes)}</strong>
                                    <small>本月总时长</small>
                                </div>
                                <div>
                                    <strong>{personalMonthStats.streak} 天</strong>
                                    <small>当前连续天数</small>
                                </div>
                                <div>
                                    <strong>{calendarTitle}</strong>
                                    <small>当前月份</small>
                                </div>
                            </div>
                        ) : (
                            <div className="calendar-metrics">
                                <div>
                                    <strong>{formatHours(selectedTotalMinutes)}</strong>
                                    <small>当天总时长</small>
                                </div>
                                <div>
                                    <strong>{groupMonthStats.activeDays} 天</strong>
                                    <small>本月有效打卡</small>
                                </div>
                                <div>
                                    <strong>{calendarTitle}</strong>
                                    <small>当前月份</small>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="month-switch">
                        <button
                            onClick={() => setMonthOffset((prev) => Math.max(-12, prev - 1))}
                            disabled={monthOffset === -12}
                        >
                            上个月
                        </button>

                        <strong>{calendarTitle}</strong>

                        <button
                            onClick={() => setMonthOffset((prev) => Math.min(12, prev + 1))}
                            disabled={monthOffset === 12}
                        >
                            下个月
                        </button>
                    </div>
                </div>
            </div>

            <div className="selected-day-panel">
                {selectedMemberNames.map((memberName) => {
                    const record = selectedRecords[memberName];

                    return (
                        <CheckinSummaryCard
                            key={memberName}
                            record={record}
                            memberName={memberName}
                            statusText={record ? getStatusText(record.status) : "未打卡"}
                            canEdit={record ? canEditRecord(record) : false}
                            canDelete={record ? currentUser.role === "admin" : false}
                            onEdit={onStartEdit}
                            onDelete={onDeleteRecord}
                            emptyText="这一天还没有提交记录"
                            currentUser={currentUser}
                        />
                    );
                })}
            </div>
        </section>
    );
}
