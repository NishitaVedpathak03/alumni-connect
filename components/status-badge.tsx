import { cn } from "@/lib/utils"

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
}

export function StatusBadge({ status, className }: { status: keyof typeof STATUS_STYLES; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLES[status], className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
