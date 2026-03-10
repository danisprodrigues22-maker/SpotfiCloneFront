export default function EmptyState({
  icon = "🎵",
  title = "Nada por aqui",
  description = "",
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        padding: 40,
        background: "#181818",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
        textAlign: "center",
        maxWidth: 500,
        margin: "40px auto",
      }}
    >
      <div style={{ fontSize: 50, marginBottom: 16 }}>
        {icon}
      </div>

      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
        {title}
      </div>

      {description && (
        <div style={{ opacity: 0.75, marginBottom: 20 }}>
          {description}
        </div>
      )}

      {actionLabel && (
        <button
          onClick={onAction}
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            border: "none",
            background: "#1db954",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}