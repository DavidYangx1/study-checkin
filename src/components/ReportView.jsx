export default function ReportView({
  chartData,
  weeklyReport,
  formatHours,
  formatCompactHours,
}) {
  return (
    <>
      <section className="chart-card">
        <div className="records-top">
          <div>
            <p className="section-kicker">LEARNING CURVE</p>
            <h2>最近 7 天打卡视图</h2>
            <p>从 6 天前到今天，查看每位成员最近一周的学习时长变化</p>
          </div>
        </div>

        <div className="chart-grid">
          {chartData.map((member) => (
            <div className="chart-member" key={member.memberName}>
              <div className="chart-member-head">
                <strong>{member.memberName}</strong>
                <span>
                  最近 7 日合计{" "}
                  {formatHours(
                    member.days.reduce((sum, day) => sum + day.minutes, 0)
                  )}
                </span>
              </div>

              <div className="bar-chart">
                {member.days.map((day) => (
                  <div className="bar-item" key={day.date}>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${Math.max(
                            4,
                            (day.minutes / member.maxMinutes) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="bar-minutes">
                      {formatCompactHours(day.minutes)}
                    </span>
                    <span className="bar-label">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="weekly-report-card">
        <div className="records-top">
          <div>
            <p className="section-kicker">WEEKLY REPORT</p>
            <h2>本周学习周报</h2>
            <p>按本周一到周日统计，小组和个人数据会根据打卡记录自动更新</p>
          </div>
        </div>

        <div className="weekly-summary">
          <div>
            <span>本周总时长</span>
            <strong>{formatHours(weeklyReport.totalMinutes)}</strong>
          </div>

          <div>
            <span>本周学习项目</span>
            <strong>{weeklyReport.totalStudyItems} 项</strong>
          </div>

          <div>
            <span>本周最佳执行者</span>
            <strong>{weeklyReport.bestMember?.memberName || "-"}</strong>
          </div>

          <div>
            <span>补交次数</span>
            <strong>{weeklyReport.totalBackfills} 次</strong>
          </div>

          <div>
            <span>迟交次数</span>
            <strong>{weeklyReport.totalLate} 次</strong>
          </div>

          <div>
            <span>低质量复盘</span>
            <strong>{weeklyReport.totalWeakReviews} 次</strong>
          </div>
        </div>

        <div className="weekly-member-list">
          {weeklyReport.memberReports.map((item) => (
            <div className="weekly-member" key={item.memberName}>
              <div>
                <strong>{item.memberName}</strong>
                <span>{item.checkins} 天打卡</span>
              </div>

              <p>{formatHours(item.minutes)}</p>

              <div className="weekly-quality">
                <span>学习项目：{item.studyItemCount} 项</span>
                <span>按时：{item.onTimeCount} 次</span>
                <span>补交：{item.backfillCount} 次</span>
                <span>迟交：{item.lateCount} 次</span>
                <span>修改：{item.editCount} 次</span>
                <span>低质量复盘：{item.weakReviewCount} 次</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}