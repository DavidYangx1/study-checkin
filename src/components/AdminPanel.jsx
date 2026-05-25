import { formatHours } from "../utils/timeHelpers";
import StudyItemList from "./StudyItemList";

export default function AdminPanel({
  memberNames,
  todayRecordsByName,
  profiles,
  currentUser,
  newMemberName,
  setNewMemberName,
  newInviteCode,
  setNewInviteCode,
  newMemberRole,
  setNewMemberRole,
  getStatusText,
  canEditRecord,
  onStartEdit,
  onDeleteRecord,
  onAddMember,
  onRemoveMember,
}) {
  return (
    <>
      <section className="today-admin-card">
        <div className="records-top">
          <div>
            <p className="section-kicker">ADMIN DASHBOARD</p>
            <h2>今日执行总览</h2>
            <p>查看所有成员今天的提交状态、学习项目、复盘和修改记录</p>
          </div>
        </div>

        <div className="today-record-list">
          {memberNames.map((memberName) => {
            const record = todayRecordsByName[memberName];

            return (
              <div
                className={record ? "today-record done" : "today-record"}
                key={memberName}
              >
                <div className="today-record-head">
                  <strong>{memberName}</strong>
                  <span>{record ? "今日已打卡" : "今日未打卡"}</span>
                </div>

                {record ? (
                  <>
                    <p className="today-minutes">{formatHours(record.minutes)}</p>

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

                    <p>{record.tasks}</p>
                    <p>{record.note}</p>

                    {record.submitted_at && (
                      <p className="record-time">
                        提交时间：
                        {new Date(record.submitted_at).toLocaleString("zh-CN")}
                      </p>
                    )}

                    {record.edit_count > 0 && record.updated_at && (
                      <p className="record-time">
                        最后修改：
                        {new Date(record.updated_at).toLocaleString("zh-CN")}
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
                  <p className="selected-empty">今天还没有提交记录</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="member-admin-card">
        <div className="records-top">
          <div>
            <p className="section-kicker">MEMBER CONTROL</p>
            <h2>成员与邀请码</h2>
            <p>添加新成员、设置身份，并管理每个人的登录邀请码</p>
          </div>
        </div>

        <div className="member-admin-form">
          <input
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="成员姓名，例如：张三"
          />

          <input
            value={newInviteCode}
            onChange={(e) => setNewInviteCode(e.target.value)}
            placeholder="邀请码，例如：zhangsan-2026"
          />

          <select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
          >
            <option value="member">普通成员</option>
            <option value="admin">管理员</option>
          </select>

          <button onClick={onAddMember}>添加成员</button>
        </div>

        <div className="member-admin-list">
          {profiles.map((profile) => (
            <div className="member-admin-row" key={profile.id}>
              <div>
                <strong>{profile.name}</strong>
                <span>
                  {profile.role === "admin" ? "管理员" : "普通成员"} · 邀请码：
                  {profile.invite_code}
                </span>
              </div>

              <button
                className="delete-button"
                onClick={() => onRemoveMember(profile)}
              >
                移除
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}