import { CheckCircle2 } from "lucide-react";
import StudyItemsEditor from "./StudyItemsEditor";
import { getDateInputValue } from "../utils/dateHelpers";

export default function CheckinForm({
  currentUser,
  checkinDate,
  setCheckinDate,
  minutes,
  setMinutes,
  studyItems,
  updateStudyItem,
  addStudyItem,
  removeStudyItem,
  tasks,
  setTasks,
  note,
  setNote,
  loading,
  onSubmit,
}) {
  return (
    <section className="form-card">
      <div className="checkin-form-head">
        <div>
          <h2>快速打卡</h2>
          <p>记录今天的学习时长、任务项目和复盘。</p>
        </div>

        <div className="current-user-card">
          当前登录：<strong>{currentUser.name}</strong>
          <span>{currentUser.role === "admin" ? "管理员" : "成员"}</span>
        </div>
      </div>

      <div className="checkin-workspace-grid">
        <div className="checkin-workspace-left">
          <div className="checkin-form-section compact-fields-card">
            <div className="checkin-section-title">
              <h3>基础信息</h3>
            </div>

            <div className="form-row two-cols">
              <label>
                <span className="field-label">
                  打卡日期 <span className="required-star">*</span>
                </span>
                <input
                  type="date"
                  value={checkinDate}
                  max={getDateInputValue()}
                  onChange={(e) => setCheckinDate(e.target.value)}
                />
              </label>

              <label>
                <span className="field-label">
                  学习时长 / 小时 <span className="required-star">*</span>
                </span>
                <input
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="例如：2.5"
                />
              </label>
            </div>
          </div>

          <details className="checkin-form-section advanced-options">
            <summary className="advanced-options-toggle">
              <span>高级选项</span>
              <small>不填写时，系统会自动根据学习科目生成标签。</small>
            </summary>

            <label>
              <span className="field-label">
                手动任务标签 <span className="optional-hint">可选</span>
              </span>
              <input
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder="可选，例如：阅读速度慢，错题复盘，听力精听"
              />
            </label>
          </details>

          <div className="checkin-form-section daily-review-box">
            <div className="checkin-section-title">
              <h3>今日总复盘</h3>
              <p>总结今天整体执行质量、主要问题、明天调整方向。</p>
            </div>

            <div className="form-row review-row">
              <label>
                <span className="field-label">
                  今日总复盘 <span className="required-star">*</span>
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：今天数学推进顺利，但日语阅读速度慢，明天优先处理长句理解。"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="checkin-form-section study-section-card">
          <StudyItemsEditor
            items={studyItems}
            onChangeItem={updateStudyItem}
            onAddItem={addStudyItem}
            onRemoveItem={removeStudyItem}
            description="一天可以记录多个科目，每个项目可以单独写完成结果和复盘"
          />
        </div>
      </div>

      <button className="submit-checkin-button" onClick={onSubmit} disabled={loading}>
        <CheckCircle2 size={18} />
        {loading ? "提交中..." : "提交打卡"}
      </button>
    </section>
  );
}
