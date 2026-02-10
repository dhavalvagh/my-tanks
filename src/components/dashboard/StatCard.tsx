type Props = {
  value: string | number
  label: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: string
}

export default function StatCard({ value, label, change, changeType = "neutral", icon }: Props) {
  return (
    <div className="card stat-card">
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${changeType}`}>{change}</div>}
    </div>
  )
}
