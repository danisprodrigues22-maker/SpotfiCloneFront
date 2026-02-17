export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(900px 500px at 20% 0%, rgba(255,255,255,0.06), transparent 60%), #121212",
        padding: 16,
        color: "white",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#181818",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 22,
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>
          Lions Music 🎧
        </div>
        {children}
      </div>
    </div>
  );
}
