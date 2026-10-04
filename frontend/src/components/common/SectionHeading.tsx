type SectionHeadingProps = { eyebrow: string; title: string; description?: string; className?: string }

export function SectionHeading({ eyebrow, title, description, className = '' }: SectionHeadingProps) {
  return <div className={`max-w-2xl ${className}`}>
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-300">{eyebrow}</p>
    <h2 className="text-3xl font-semibold leading-tight tracking-[-.04em] text-white sm:text-4xl">{title}</h2>
    {description && <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">{description}</p>}
  </div>
}
