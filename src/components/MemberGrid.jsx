import { Search } from "lucide-react";
import CheckinSummaryCard from "./CheckinSummaryCard";
import { formatHours } from "../utils/timeHelpers";


export default function MemberGrid({ query, setQuery, members, currentUser }) {
  return (
    <section className="records">
      <div className="records-top">
        <div>
          <h2>成员打卡记录</h2>
          <p>按今日学习时长和连续天数排序</p>
        </div>

        <label className="search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索成员或目标"
          />
        </label>
      </div>

      <div className="member-grid">
        {members.map((member, index) => {
          const record = member.record || null;

          return (
            <div
              className={member.checkedToday ? "member-card done" : "member-card muted"}
              key={member.name}
            >
              <div className="member-head">
                <div className="avatar">{member.avatar}</div>

                <div>
                  <h3>{member.name}</h3>
                  <p>{member.goal}</p>
                </div>

                <span className="rank">#{index + 1}</span>
              </div>

              <div className="member-execution-row">
                <div className="member-today-hours">
                  <span>今日学习</span>
                  <strong>{formatHours(member.minutes)}</strong>
                </div>

                <div className="mini-stats">
                  <div>
                    <span>连续</span>
                    <strong>{member.streak} 天</strong>
                  </div>

                  <div>
                    <span>累计</span>
                    <strong>{member.total} 次</strong>
                  </div>
                </div>
              </div>

              {record ? (
                <CheckinSummaryCard
                  record={record}
                  memberName={member.name}
                  statusText={member.checkedToday ? "已打卡" : "未打卡"}
                  currentUser={currentUser}
                  variant="member-flow"
                />
              ) : (
                <div className="member-empty-summary">
                  今天还未打卡
                </div>
              )}

              <div className="risk-tags">
                {(member.riskTags || []).map((tag) => (
                  <span key={tag.text} className={`risk-tag ${tag.type}`}>
                    {tag.text}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
