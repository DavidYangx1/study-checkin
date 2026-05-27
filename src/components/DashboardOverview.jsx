export default function DashboardOverview({
  currentUser,
  memberNames,
  checkedCount,
  totalMinutes,
  periodStats,
  topStreak,
  missingTodayMembers,
  formatHours,
  setActiveTab,
  onExportCSV,
  onLogout,
  unreadNotificationCount,
  onOpenNotifications,
}) {
  return (
    <>
      <header className="header app-header">
        <div className="app-title-block">
          <p className="header-label">PRIVATE STUDY LOG</p>
          <div className="brand-title-row">
            <h1>Study Circle</h1>
            <span className="member-count-pill">当前 {memberNames.length} 位成员</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="user-badge">
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role === "admin" ? "管理员" : "成员"}</span>
          </div>

          <button className="header-checkin-button" onClick={() => setActiveTab("checkin")}>
            去打卡
          </button>

          <button className="ghost-button header-message-button" onClick={onOpenNotifications}>
            消息 {unreadNotificationCount}
          </button>

          {currentUser.role === "admin" && (
            <button className="ghost-button header-export-button" onClick={onExportCSV}>
              导出 CSV
            </button>
          )}

          <button className="ghost-button header-logout-button" onClick={onLogout}>
            退出
          </button>
        </div>
      </header>

      <section className="hero today-execution-card">
        <div>
          <p className="hero-label">TODAY</p>
          <h2>今日执行</h2>
          <p>用打卡、复盘和评论把今天的学习状态收拢到一处。</p>
        </div>

        <div className="today-primary-metric">
          <span>今日总时长</span>
          <strong>{formatHours(totalMinutes)}</strong>
        </div>

        <div className="today-mini-grid">
          <div>
            <span>已打卡</span>
            <strong>
              {checkedCount}/{memberNames.length}
            </strong>
          </div>

          <div>
            <span>未提交</span>
            <strong>{missingTodayMembers.length}</strong>
          </div>
        </div>
      </section>

      <section className="stats app-metric-strip">
        <div className="stat-card">
          <p>本周总时长</p>
          <h3>{formatHours(periodStats.weekMinutes)}</h3>
        </div>

        <div className="stat-card">
          <p>本月总时长</p>
          <h3>{formatHours(periodStats.monthMinutes)}</h3>
        </div>

        <div className="stat-card">
          <p>本月打卡次数</p>
          <h3>{periodStats.monthCheckins} 次</h3>
        </div>

        <div className="stat-card">
          <p>最高连续</p>
          <h3>{topStreak} 天</h3>
        </div>
      </section>

      <section className="risk-card compact-risk-card">
        <div>
          <p className="section-kicker">TODAY RISK</p>
          <h2>
            {missingTodayMembers.length === 0
              ? "今日全员已提交"
              : `${missingTodayMembers.length} 人未提交`}
          </h2>
        </div>

        <div className="missing-list">
          {missingTodayMembers.length === 0 ? (
            <span className="safe-text">状态正常</span>
          ) : (
            missingTodayMembers.map((name) => (
              <span key={name} className="missing-pill">
                {name}
              </span>
            ))
          )}
        </div>
      </section>
    </>
  );
}
