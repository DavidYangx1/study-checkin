import { useMemo, useState } from "react";
import StudyItemList from "./StudyItemList";
import { formatHours } from "../utils/timeHelpers";

function getStudyItems(record) {
  return Array.isArray(record?.study_items) ? record.study_items : [];
}

function getSubjectSummary(items) {
  const subjects = items
    .map((item) => item.subject?.trim())
    .filter(Boolean);

  return [...new Set(subjects)];
}

function getItemLabel(item) {
  const subject = item.subject?.trim();
  const taskType = item.taskType?.trim();

  if (subject && taskType) return `${subject}-${taskType}`;
  if (subject) return subject;
  if (taskType) return taskType;
  return "未命名项目";
}

function splitReviewText(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function CheckinSummaryCard({
  record,
  memberName,
  statusText,
  canEdit = false,
  onEdit,
  canDelete = false,
  onDelete,
  emptyText = "这一天还没有提交记录",
}) {
  const [open, setOpen] = useState(false);

  const items = getStudyItems(record);

  const subjects = useMemo(() => getSubjectSummary(items), [items]);

  if (!record) {
    return (
      <div className="checkin-summary-card empty">
        <div className="checkin-summary-head">
          <strong>{memberName}</strong>
          <span>未打卡</span>
        </div>

        <p className="checkin-empty-text">{emptyText}</p>
      </div>
    );
  }

  const note = String(record.note || "").trim();
  const isLongReview = note.length > 90;
  const notePreview = isLongReview ? `${note.slice(0, 90)}...` : note;
  const notePreviewLines = splitReviewText(notePreview);

  const previewItems = items.slice(0, 3);
  const hiddenItemCount = Math.max(0, items.length - previewItems.length);

  return (
    <>
      <div className={record ? "checkin-summary-card done" : "checkin-summary-card"}>
        <div className="checkin-summary-head">
          <strong>{memberName || record.name}</strong>
          <span>{statusText || "已打卡"}</span>
        </div>

        <div className="checkin-summary-hours">
          {formatHours(record.minutes || 0)}
        </div>

        <div className="checkin-summary-section">
          <div className="checkin-summary-title">
            <span>学习项目</span>
            <strong>{items.length} 项</strong>
          </div>

          {items.length > 0 ? (
            <div className="checkin-project-tags">
              {previewItems.map((item, index) => (
                <span key={`${getItemLabel(item)}-${index}`}>
                  {getItemLabel(item)}
                </span>
              ))}

              {hiddenItemCount > 0 && <span>+{hiddenItemCount}</span>}
            </div>
          ) : (
            <p className="checkin-muted">暂无学习项目</p>
          )}

          {subjects.length > 0 && (
            <p className="checkin-subject-line">
              {subjects.slice(0, 4).join("；")}
              {subjects.length > 4 ? "；..." : ""}
            </p>
          )}
        </div>

        <div className="checkin-summary-section">
          <div className="checkin-summary-title">
            <span>今日复盘</span>
            {isLongReview && <strong>长复盘</strong>}
          </div>

          {notePreviewLines.length > 0 ? (
            <div className="checkin-review-preview">
              {notePreviewLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          ) : (
            <p className="checkin-muted">暂无复盘</p>
          )}
        </div>

        <button
          type="button"
          className="checkin-detail-button"
          onClick={() => setOpen(true)}
        >
          查看完整记录
        </button>
      </div>

      {open && (
        <div className="checkin-detail-backdrop" onClick={() => setOpen(false)}>
          <div
            className="checkin-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="checkin-detail-head">
              <div>
                <p className="section-kicker">CHECKIN DETAIL</p>
                <h2>{memberName || record.name} 的完整记录</h2>
                <span>
                  {record.date} · {formatHours(record.minutes || 0)}
                </span>
              </div>

              <button
                type="button"
                className="ghost-button"
                onClick={() => setOpen(false)}
              >
                关闭
              </button>
            </div>

            <div className="checkin-detail-meta">
              <span>{statusText || "已打卡"}</span>

              {(record.edit_count || 0) > 0 && (
                <span>修改 {record.edit_count} 次</span>
              )}

              {record.updated_at && (
                <span>
                  更新时间：{new Date(record.updated_at).toLocaleString("zh-CN")}
                </span>
              )}
            </div>

            <div className="checkin-detail-block">
              <h3>学习项目</h3>
              <StudyItemList record={record} />
            </div>

            {record.tasks && (
              <div className="checkin-detail-block">
                <h3>任务标签</h3>
                <p>{record.tasks}</p>
              </div>
            )}

            <div className="checkin-detail-block">
              <h3>今日复盘</h3>

              {splitReviewText(record.note).length > 0 ? (
                <div className="checkin-detail-review">
                  {splitReviewText(record.note).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="checkin-muted">暂无复盘</p>
              )}
            </div>

            {(canEdit || canDelete) && (
              <div className="checkin-detail-actions">
                {canEdit && (
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => {
                      setOpen(false);
                      onEdit?.(record);
                    }}
                  >
                    编辑记录
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => {
                      setOpen(false);
                      onDelete?.(record.id);
                    }}
                  >
                    删除记录
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}