import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
  align?: 'left' | 'center'
}

export function SectionHeading({ eyebrow, title, description, children, align = 'left' }: SectionHeadingProps) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-2xl`}>
      {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>}
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">{description}</p>}
      {children}
    </div>
  )
}
