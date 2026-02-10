/**
 * Aquarium health status system using Tailwind CSS
 * Replaces the old statusColors.ts Material UI system
 */

export type StatusType = "healthy" | "info" | "attention" | "warning" | "critical"

export const statusStyles: Record<StatusType, string> = {
  healthy: "bg-healthy/15 text-healthy-foreground border-healthy/20",
  info: "bg-info/15 text-info-foreground border-info/20",
  attention: "bg-attention/15 text-attention-foreground border-attention/20",
  warning: "bg-warning/25 text-warning-foreground border-warning/30",
  critical: "bg-critical/20 text-critical-foreground border-critical/30",
}

export const statusBadgeStyles: Record<StatusType, string> = {
  healthy: "bg-healthy text-white",
  info: "bg-info text-white",
  attention: "bg-attention text-black",
  warning: "bg-warning text-black",
  critical: "bg-critical text-white",
}

/**
 * Calculate bioload status from ratio
 */
export function getBioloadStatus(ratio: number): StatusType {
  if (ratio < 0.5) return "healthy"
  if (ratio < 0.7) return "info"
  if (ratio < 0.85) return "attention"
  if (ratio < 1.0) return "warning"
  return "critical"
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: StatusType): string {
  const labels: Record<StatusType, string> = {
    healthy: "Healthy",
    info: "Good",
    attention: "Attention needed",
    warning: "Warning",
    critical: "Critical",
  }
  return labels[status]
}

/**
 * Map status to Radix UI severity (for alerts, etc.)
 */
export function getStatusSeverity(status: StatusType): "info" | "warning" | "error" {
  if (status === "critical") return "error"
  if (status === "warning" || status === "attention") return "warning"
  return "info"
}
