import { useEffect, useState } from "react";

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

function getSummaryText(value, fallback) {
  return String(value || "").trim() || fallback;
}

function getCompactResult(result) {
  const cleanResult = String(result || "").trim();
  if (!cleanResult) return "未填写结果";
  return cleanResult.length > 34 ? `${cleanResult.slice(0, 34)}...` : cleanResult;
}

export default function StudyItemsEditor({
  items,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  description = "一天可以记录多个科目和任务结果",
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex > items.length - 1) {
      setActiveIndex(items.length - 1);
    }
  }, [activeIndex, items.length]);

  function handleAddItem() {
    const nextIndex = items.length;
    onAddItem();
    setActiveIndex(nextIndex);
  }

  function handleRemoveItem(index) {
    onRemoveItem(index);
    setActiveIndex((currentIndex) => {
      if (items.length <= 1) return 0;
      if (currentIndex === index) return Math.max(0, index - 1);
      if (currentIndex > index) return currentIndex - 1;
      return currentIndex;
    });
  }

  return (
    <div className="study-items-box">
      <div className="study-items-head">
        <div>
          <h3>学习项目</h3>
          <p>{description}</p>
        </div>

        <button type="button" className="ghost-button" onClick={handleAddItem}>
          添加项目
        </button>
      </div>

      <div className="study-item-stack">
        {items.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              className={isActive ? "study-item active" : "study-item"}
              key={index}
            >
              <div className="study-item-summary">
                <div className="study-item-summary-main">
                  <strong>项目 {index + 1}</strong>
                  <span>{getSummaryText(item.subject, "未选择科目")}</span>
                </div>

                <div className="study-item-summary-meta">
                  <span>{getSummaryText(item.taskType, "未选择任务类型")}</span>
                  <span>{getCompactResult(item.result)}</span>
                  {String(item.review || "").trim() && <span>已写复盘</span>}
                </div>

                <div className="study-item-summary-actions">
                  <button
                    type="button"
                    className="ghost-button study-item-toggle"
                    onClick={() => setActiveIndex(isActive ? -1 : index)}
                  >
                    {isActive ? "收起" : "编辑"}
                  </button>

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() => handleRemoveItem(index)}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="study-item-expand">
                  <label>
                    <span className="field-label">
                      学习科目 <span className="required-star">*</span>
                    </span>
                    <select
                      required
                      value={item.subject || ""}
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
                    <span className="field-label">
                      任务类型 <span className="required-star">*</span>
                    </span>
                    <select
                      required
                      value={item.taskType || ""}
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
                    <span className="field-label">
                      任务结果 <span className="required-star">*</span>
                    </span>
                    <input
                      value={item.result || ""}
                      onChange={(e) => onChangeItem(index, "result", e.target.value)}
                      placeholder="例如：阅读 18/25；数学错 3 题；背完经济第 1 章"
                    />
                  </label>

                  <label>
                    <span className="field-label">
                      项目复盘 <span className="optional-hint">可选</span>
                    </span>
                    <span className="optional-hint">
                      可选：记录这个项目哪里卡住、哪里进步、下次怎么调整。
                    </span>
                    <textarea
                      value={item.review || ""}
                      onChange={(e) => onChangeItem(index, "review", e.target.value)}
                      placeholder="可选：这个项目哪里卡住了，下一次如何改进。"
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
