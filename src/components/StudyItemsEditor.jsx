const subjectOptions = ["日语", "数学", "文综", "英语", "专业课", "其他"];

const taskTypeOptions = [
  "阅读",
  "听力",
  "单词",
  "真题",
  "错题",
  "背诵",
  "作文",
  "模考",
  "课程",
  "其他",
];

export default function StudyItemsEditor({
  items,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  description = "一天可以记录多个科目和任务结果",
}) {
  return (
    <div className="study-items-box">
      <div className="study-items-head">
        <div>
          <h3>学习项目</h3>
          <p>{description}</p>
        </div>

        <button type="button" className="ghost-button" onClick={onAddItem}>
          添加项目
        </button>
      </div>

      {items.map((item, index) => (
        <div className="study-item" key={index}>
          <div className="study-item-top">
            <strong>项目 {index + 1}</strong>

            {items.length > 1 && (
              <button
                type="button"
                className="remove-item-button"
                onClick={() => onRemoveItem(index)}
              >
                删除
              </button>
            )}
          </div>

          <label>
            学习科目
            <select
             required
              value={item.subject}
              onChange={(e) => onChangeItem(index, "subject", e.target.value)}
            >
              <option value="">请选择科目</option>
              {subjectOptions.map((subject) => (
                <option value={subject} key={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label>
            任务类型
            <select
             required
              value={item.taskType}
              onChange={(e) => onChangeItem(index, "taskType", e.target.value)}
            >
              <option value="">请选择任务类型</option>
              {taskTypeOptions.map((taskType) => (
                <option value={taskType} key={taskType}>
                  {taskType}
                </option>
              ))}
            </select>
          </label>

          <label>
            任务结果
            <input
              value={item.result}
              onChange={(e) => onChangeItem(index, "result", e.target.value)}
              placeholder="例如：阅读 18/25；数学错 3 题；背完经济第 1 章"
            />
          </label>
        </div>
      ))}
    </div>
  );
}