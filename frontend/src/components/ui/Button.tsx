import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: boolean
  children: ReactNode
}

const variants = {
  primary: 'bg-indigo-500 text-white shadow-[0_8px_30px_rgba(79,70,229,0.24)] hover:bg-indigo-400',
  secondary: 'border border-white/12 bg-white/[0.035] text-slate-100 hover:border-white/20 hover:bg-white/[0.07]',
  ghost: 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
}

export function Button({ variant = 'primary', icon = false, className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-cyan-300 ${variants[variant]} ${className}`} {...props}>
      {children}
      {icon && <ArrowUpRight aria-hidden="true" size={16} />}
    </button>
  )
}
