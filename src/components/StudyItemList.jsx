export default function StudyItemList({ record }) {
  const items = Array.isArray(record?.study_items) ? record.study_items : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="study-item-list">
      {items.map((item, index) => (
        <div className="study-item-row" key={index}>
          <strong>
            {item.subject || "未填写科目"} · {item.taskType || "未填写类型"}
          </strong>
          <span>{item.result || "未填写结果"}</span>

          {String(item.review || "").trim() && (
            <p className="project-review">项目复盘：{item.review}</p>
          )}
        </div>
      ))}
    </div>
  );
}
