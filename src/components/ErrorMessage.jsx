import { AlertCircle } from 'lucide-react'

export function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger)]">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  )
}
