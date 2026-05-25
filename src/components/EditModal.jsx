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
          description="可以修改这条记录里的多个学习项目"
        />

        <label>
          任务内容
          <input
            value={editTasks}
            onChange={(e) => setEditTasks(e.target.value)}
          />
        </label>

        <label>
          复盘内容
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
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