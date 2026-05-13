export default function GerifyLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#00e5a0" />
        <text x="16" y="21" textAnchor="middle" fill="#0a0a0a" fontSize="14" fontWeight="900" fontFamily="'Syne', sans-serif">G</text>
      </svg>
      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: -0.5 }}>
        Gerify
      </span>
    </div>
  );
}
