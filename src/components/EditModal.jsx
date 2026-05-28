import StudyItemsEditor from "./StudyItemsEditor";

export default function EditModal({
  record,
  editMinutes,
  setEditMinutes,
  editStudyItems,
  updateEditStudyItem,
  addEditStudyItem,
  removeEditStudyItem,
  editTasks,
  setEditTasks,
  editNote,
  setEditNote,
  onCancel,
  onSave,
}) {
  if (!record) return null;

  return (
    <div className="edit-modal-backdrop">
      <div className="edit-modal">
        <p className="section-kicker">EDIT RECORD</p>
        <h2>编辑打卡记录</h2>

        <div className="edit-record-info">
          <strong>{record.name}</strong>
          <span>{record.date}</span>
        </div>

        <label>
          学习时长 / 小时
          <input
            value={editMinutes}
            onChange={(e) => setEditMinutes(e.target.value)}
          />
        </label>

        <StudyItemsEditor
          items={editStudyItems}
          onChangeItem={updateEditStudyItem}
          onAddItem={addEditStudyItem}
          onRemoveItem={removeEditStudyItem}
          description="可以修改这条记录里的多个学习项目和项目复盘"
        />

        <details className="advanced-options edit-advanced-options">
          <summary className="advanced-options-toggle">
            <span>高级选项：任务标签</span>
            <small>不填时，系统会自动根据学习科目生成标签</small>
          </summary>

          <label>
            任务标签，用逗号隔开
            <input
              value={editTasks}
              onChange={(e) => setEditTasks(e.target.value)}
            />
          </label>
        </details>

        <label>
          今日总复盘
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="总结今天整体执行质量、主要问题、明天调整方向"
          />
        </label>

        <div className="edit-modal-actions">
          <button className="ghost-button" onClick={onCancel}>
            取消
          </button>

          <button onClick={onSave}>保存修改</button>
        </div>
      </div>
    </div>
  );
}
