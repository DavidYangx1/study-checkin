import { formatHours } from "../utils/timeHelpers";
import StudyItemList from "./StudyItemList";

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
  return (
    <section className="history-card">
      <div className="history-top">
        <div>
          <p className="section-kicker">CHECK-IN CALENDAR</p>
          <h2>年度打卡日历</h2>
          <p>查看前后一年内的打卡记录，点击日期查看当天所有成员的打卡情况</p>
        </div>

        <div className="calendar-control">
          <div className="selected-summary">
            <span>{selectedDate}</span>
            <strong>
              已打卡 {Object.keys(selectedRecordsByName).length}/{memberNames.length} 人 · 总计{" "}
              {formatHours(selectedTotalMinutes)}
            </strong>
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

      <div className="calendar-grid">
        {calendarDays.map((day) => {
          const dayRecords = recordsByDate[day.date] || {};
          const count = Object.keys(dayRecords).length;
          const isSelected = selectedDate === day.date;

          return (
            <button
              key={day.date}
              className={isSelected ? "date-cell selected" : "date-cell"}
              onClick={() => setSelectedDate(day.date)}
            >
              <span className="date-weekday">周{day.weekday}</span>
              <strong>{day.day}</strong>
              <span className="date-month">{day.month}月</span>

              <div className="date-dots">
                {memberNames.map((memberName) => (
                  <i
                    key={memberName}
                    className={dayRecords[memberName] ? "dot done" : "dot"}
                  />
                ))}
              </div>

              <small>{count}/{memberNames.length}</small>
            </button>
          );
        })}
      </div>

      <div className="selected-day-panel">
        {memberNames.map((memberName) => {
          const record = selectedRecordsByName[memberName];

          return (
            <div
              className={record ? "selected-member done" : "selected-member"}
              key={memberName}
            >
              <div className="selected-member-head">
                <strong>{memberName}</strong>
                <span>{record ? "已打卡" : "未打卡"}</span>
              </div>

              {record ? (
                <>
                  <p className="selected-minutes">{formatHours(record.minutes)}</p>

                  <div className="record-meta">
                    <span className={`status-pill ${record.status || "normal"}`}>
                      {getStatusText(record.status)}
                    </span>

                    {record.edit_count > 0 && (
                      <span className="status-pill edited">
                        已修改 {record.edit_count} 次
                      </span>
                    )}
                  </div>

                  <StudyItemList record={record} />

                  <p className="selected-tasks">{record.tasks}</p>
                  <p className="selected-note">{record.note}</p>

                  {record.submitted_at && (
                    <p className="record-time">
                      提交时间：{new Date(record.submitted_at).toLocaleString("zh-CN")}
                    </p>
                  )}

                  {record.edit_count > 0 && record.updated_at && (
                    <p className="record-time">
                      最后修改：{new Date(record.updated_at).toLocaleString("zh-CN")}
                    </p>
                  )}

                  {canEditRecord(record) && (
                    <button
                      className="edit-button"
                      onClick={() => onStartEdit(record)}
                    >
                      编辑这条记录
                    </button>
                  )}

                  {currentUser.role === "admin" && (
                    <button
                      className="delete-button"
                      onClick={() => onDeleteRecord(record.id)}
                    >
                      删除这条记录
                    </button>
                  )}
                </>
              ) : (
                <p className="selected-empty">这一天还没有提交记录</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}