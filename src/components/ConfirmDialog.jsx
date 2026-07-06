export function ConfirmDialog({ title, message, onConfirm, onCancel, open }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-[var(--surface)] p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-[var(--text-heading)]">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
