import { formatHours } from "../utils/timeHelpers";
import { Flame, Clock, CalendarDays, Search } from "lucide-react";

export default function MemberGrid({ query, setQuery, members }) {
  return (
    <section className="records">
      <div className="records-top">
        <div>
          <h2>成员打卡记录</h2>
          <p>按今日学习时长和连续天数排序</p>
        </div>

        <div className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索成员或目标"
          />
        </div>
      </div>

      <div className="member-grid">
        {members.map((member, index) => (
          <div
            className={member.checkedToday ? "member-card done" : "member-card"}
            key={member.id}
          >
            <div className="member-head">
              <div className="avatar">{member.avatar}</div>

              <div>
                <h3>{member.name}</h3>
                <p>{member.goal}</p>
              </div>

              <span className="rank">#{index + 1}</span>
            </div>

            <div className="mini-stats">
              <div>
                <Flame size={15} />
                <span>{member.streak} 天</span>
              </div>

              <div>
                <Clock size={15} />
                <span>{formatHours(member.minutes)}</span>
              </div>

              <div>
                <CalendarDays size={15} />
                <span>{member.total} 次</span>
              </div>
            </div>

            <p className="note">{member.note}</p>

            <div className="tags">
              {member.tasks.map((task) => (
                <span key={task}>{task}</span>
              ))}
            </div>

            <div className={member.checkedToday ? "status done" : "status"}>
              {member.checkedToday ? "今日已打卡" : "今日未打卡"}
            </div>

            <div className="risk-tags">
              {member.riskTags.map((tag) => (
                <span key={tag.text} className={`risk-tag ${tag.type}`}>
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}