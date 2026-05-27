import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function CommentSection({ record, currentUser }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const checkinId = record?.id;

  useEffect(() => {
    if (!checkinId) return undefined;

    async function fetchComments() {
      setLoading(true);

      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("checkin_id", checkinId)
        .order("created_at", { ascending: true });

      setLoading(false);

      if (error) {
        console.error("读取评论失败：", error);
        return;
      }

      setComments(data || []);
    }

    fetchComments();

    const channel = supabase
      .channel(`comments-${checkinId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `checkin_id=eq.${checkinId}`,
        },
        fetchComments
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkinId]);

  async function handleSubmit() {
    const cleanContent = content.trim();

    if (!cleanContent) {
      alert("请输入评论内容");
      return;
    }

    if (!currentUser) {
      alert("请先登录后再评论");
      return;
    }

    setSubmitting(true);

    const { data: comment, error } = await supabase
      .from("comments")
      .insert([
        {
          checkin_id: checkinId,
          author_name: currentUser.name,
          author_role: currentUser.role,
          target_name: record.name,
          content: cleanContent,
        },
      ])
      .select("id")
      .single();

    setSubmitting(false);

    if (error) {
      console.error("提交评论失败：", error);
      alert("评论提交失败，请检查 Supabase 设置");
      return;
    }

    if (currentUser.name !== record.name) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            receiver_name: record.name,
            sender_name: currentUser.name,
            sender_role: currentUser.role,
            checkin_id: record.id,
            comment_id: comment.id,
            type: "comment",
            title: `${currentUser.name} 评论了你的打卡`,
            content: cleanContent,
          },
        ]);

      if (notificationError) {
        console.error("创建通知失败：", notificationError);
      }
    }

    setContent("");
  }

  return (
    <div className="comment-section">
      <div className="comment-section-head">
        <h3>评论</h3>
        <span>{comments.length} 条</span>
      </div>

      <div className="comment-list">
        {loading ? (
          <p className="comment-empty">评论读取中...</p>
        ) : comments.length === 0 ? (
          <p className="comment-empty">还没有评论</p>
        ) : (
          comments.map((comment) => (
            <div className="comment-item" key={comment.id}>
              <div className="comment-meta">
                <strong>{comment.author_name}</strong>
                <span>
                  {comment.author_role === "admin" ? "管理员" : "成员"}
                  {comment.created_at
                    ? ` · ${new Date(comment.created_at).toLocaleString("zh-CN")}`
                    : ""}
                </span>
              </div>

              <p>{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="comment-form">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="写一条评论"
        />

        <button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "提交中..." : "提交评论"}
        </button>
      </div>
    </div>
  );
}
