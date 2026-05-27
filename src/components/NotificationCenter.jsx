export default function NotificationCenter({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}) {
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return (
    <div className="notification-backdrop" onClick={onClose}>
      <div
        className="notification-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="notification-head">
          <div>
            <p className="section-kicker">MESSAGES</p>
            <h2>站内消息</h2>
            <span>未读 {unreadCount} 条</span>
          </div>

          <button type="button" className="ghost-button" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="notification-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            全部已读
          </button>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <p className="notification-empty">暂无消息</p>
          ) : (
            notifications.map((notification) => (
              <div
                className={
                  notification.read_at
                    ? "notification-item"
                    : "notification-item unread"
                }
                key={notification.id}
              >
                <div className="notification-item-head">
                  <div>
                    <strong>{notification.title}</strong>
                    <span>
                      {notification.sender_name} ·{" "}
                      {notification.sender_role === "admin" ? "管理员" : "成员"}
                      {notification.created_at
                        ? ` · ${new Date(
                            notification.created_at
                          ).toLocaleString("zh-CN")}`
                        : ""}
                    </span>
                  </div>

                  {!notification.read_at && (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => onMarkRead(notification.id)}
                    >
                      标记已读
                    </button>
                  )}
                </div>

                <p>{notification.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
