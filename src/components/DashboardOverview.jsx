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
}) {
  return (
    <>
      <header className="header">
        <div>
          <p className="header-label">PRIVATE STUDY LOG</p>
          <h1>Study Circle</h1>
          <p>小组学习执行监督系统 · 当前 {memberNames.length} 位成员</p>
        </div>

        <div className="header-actions">
          <div className="user-badge">
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role === "admin" ? "管理员" : "成员"}</span>
          </div>

          <button onClick={() => setActiveTab("checkin")}>去打卡</button>

          {currentUser.role === "admin" && (
            <button className="ghost-button" onClick={onExportCSV}>
              导出 CSV
            </button>
          )}

          <button className="ghost-button" onClick={onLogout}>
            退出
          </button>
        </div>
      </header>

      <section className="hero">
        <p className="hero-label">DAILY DISCIPLINE SYSTEM</p>

        <h2>每日打卡</h2>

        <p>
          用统一记录代替口头承诺，每一天的学习时长、任务内容和复盘都会被保存，方便小组成员互相监督、追踪进度、复盘执行质量
        </p>
      </section>

      <section className="stats">
        <div className="stat-card">
          <p>今日已打卡</p>
          <h3>
            {checkedCount}/{memberNames.length}
          </h3>
        </div>

        <div className="stat-card">
          <p>今日总时长</p>
          <h3>{formatHours(totalMinutes)}</h3>
        </div>

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

      <section className="risk-card">
        <div>
          <p className="section-kicker">TODAY RISK</p>
          <h2>今日未提交</h2>
          <p>当前还有 {missingTodayMembers.length} 位成员未完成今日打卡。</p>
        </div>

        <div className="missing-list">
          {missingTodayMembers.length === 0 ? (
            <span className="safe-text">今日全员已提交</span>
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