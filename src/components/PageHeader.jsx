export function PageHeader({ title, description }) {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl font-semibold text-[var(--text-heading)] md:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-slate-500 md:text-base">{description}</p>
      )}
    </div>
  )
}
