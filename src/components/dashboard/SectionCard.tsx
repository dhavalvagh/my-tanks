import type { ReactNode } from "react"

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
  gridColumn?: string
  gridRow?: string
  action?: ReactNode
}

export default function SectionCard({ title, subtitle, children, gridColumn, gridRow, action }: Props) {
  return (
    <div className="card" style={{ 
      gridColumn, 
      gridRow,
      padding: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-1)",
      border: "1px solid var(--border)"
    }}>
      <div className="card-header" style={{
        padding: "var(--space-5)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0
      }}>
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="card-header-action">{action}</div>}
      </div>
      <div className="card-body" style={{
        padding: "var(--space-5)",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        overflow: "auto"
      }}>{children}</div>
    </div>
  )
}
