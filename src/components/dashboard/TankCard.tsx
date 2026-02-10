type Props = {
  name: string
  label: string
  volume: number
  fishCount: number
  onClick: () => void
}

export default function TankCard({ name, label, volume, fishCount, onClick }: Props) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-1)", 
        border: "1px solid var(--border)", 
        borderRadius: "var(--radius-lg)", 
        boxShadow: "var(--elevation-1)", 
        transition: "all var(--transition-base)",
        cursor: "pointer"
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.boxShadow = "var(--elevation-4)"; 
        e.currentTarget.style.borderColor = "var(--primary)"; 
        e.currentTarget.style.transform = "translateY(-2px)"; 
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.boxShadow = "var(--elevation-1)"; 
        e.currentTarget.style.borderColor = "var(--border)"; 
        e.currentTarget.style.transform = "translateY(0)"; 
      }}
    >
      {/* Tank Visual Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
        padding: "var(--space-8) var(--space-5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: "140px",
        position: "relative"
      }}>
        <div style={{
          fontSize: "var(--text-xs)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(255, 255, 255, 0.8)",
          marginBottom: "var(--space-2)"
        }}>
          {label}
        </div>
        <h3 style={{
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--font-bold)",
          color: "white",
          margin: 0,
          marginBottom: "var(--space-2)"
        }}>
          {name}
        </h3>
        <div style={{
          fontSize: "var(--text-sm)",
          color: "rgba(255, 255, 255, 0.9)"
        }}>
          {volume}L
        </div>
        {fishCount > 0 && (
          <div style={{
            fontSize: "var(--text-sm)",
            color: "rgba(255, 255, 255, 0.8)",
            marginTop: "var(--space-1)"
          }}>
            {fishCount} fish
          </div>
        )}
      </div>
    </div>
  )
}
