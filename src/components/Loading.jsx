export function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-light)] border-t-[var(--primary)]"></div>
      <span className="ml-3 text-sm text-slate-500">Carregando...</span>
    </div>
  )
}
