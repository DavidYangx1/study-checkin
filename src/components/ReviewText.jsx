import { useState } from "react";

function splitReviewText(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ReviewText({ note, title = "今日复盘", compact = false }) {
  const [open, setOpen] = useState(false);
  const cleanNote = String(note || "").trim();

  if (!cleanNote) {
    return <p className="review-empty">暂无复盘</p>;
  }

  const isLong = cleanNote.length > 90;
  const preview = isLong ? `${cleanNote.slice(0, 90)}...` : cleanNote;
  const previewLines = splitReviewText(preview);
  const fullLines = splitReviewText(cleanNote);

  return (
    <>
      <div className={compact ? "review-preview compact" : "review-preview"}>
        <div className="review-preview-head">
          <span>{title}</span>
          {isLong && <strong>长复盘</strong>}
        </div>

        <div className="review-preview-body">
          {previewLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        {isLong && (
          <button
            type="button"
            className="review-open-button"
            onClick={() => setOpen(true)}
          >
            查看完整复盘
          </button>
        )}
      </div>

      {open && (
        <div className="review-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="review-modal" onClick={(event) => event.stopPropagation()}>
            <div className="review-modal-head">
              <div>
                <p className="section-kicker">REVIEW DETAIL</p>
                <h2>{title}</h2>
              </div>

              <button
                type="button"
                className="ghost-button"
                onClick={() => setOpen(false)}
              >
                关闭
              </button>
            </div>

            <div className="review-modal-body">
              {fullLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}