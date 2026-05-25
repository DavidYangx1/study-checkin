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
            <h2>快速打卡</h2>

            <div className="current-user-card">
                当前登录：<strong>{currentUser.name}</strong>
                <span>{currentUser.role === "admin" ? "管理员" : "成员"}</span>
            </div>

            <div className="form-row two-cols">
                <label>
                    打卡日期
                    <input
                        type="date"
                        value={checkinDate}
                        max={getDateInputValue()}
                        onChange={(e) => setCheckinDate(e.target.value)}
                    />
                </label>

                <label>
                    学习时长 / 小时
                    <input
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        placeholder="例如：2.5"
                    />
                </label>
            </div>

            <StudyItemsEditor
                items={studyItems}
                onChangeItem={updateStudyItem}
                onAddItem={addStudyItem}
                onRemoveItem={removeStudyItem}
                description="一天可以记录多个科目和任务结果"
            />

            <div className="form-row two-cols">
                <label>
                    任务标签，用逗号隔开
                    <input
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        placeholder="例如：阅读速度慢, 错题复盘, 听力精听"
                    />
                </label>

                <label>
                    今日复盘
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="写一下今天完成了什么、哪里需要改进"
                    />
                </label>
            </div>

            <button onClick={onSubmit} disabled={loading}>
                <CheckCircle2 size={18} />
                {loading ? "提交中..." : "提交打卡"}
            </button>
        </section>
    );
}