import { useState } from 'react'
import { Menu, Plane, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'

const links = [
  { label: 'Explore', href: '#explore' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="relative z-20 border-b border-white/[0.07] bg-[#030712]/90 backdrop-blur-md">
      <Container className="flex h-[76px] items-center justify-between">
        <a href="#home" aria-label="TravelMate AI home" className="inline-flex items-center gap-2.5 rounded-md">
          <span className="grid size-9 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200"><Plane size={18} aria-hidden="true" /></span>
          <span className="text-[15px] font-semibold tracking-tight text-white">TravelMate<span className="text-slate-400"> AI</span></span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {links.map((link) => <a key={link.label} className="text-sm text-slate-400 transition-colors hover:text-white" href={link.href}>{link.label}</a>)}
        </nav>

        <div className="hidden md:block"><Button icon>Get Started</Button></div>
        <button type="button" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen((open) => !open)} className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-200 hover:bg-white/[0.06] md:hidden">
          {isOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </Container>

      {isOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-white/[0.07] bg-[#0B1120] px-5 py-4 md:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          {links.map((link) => <a key={link.label} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white" href={link.href}>{link.label}</a>)}
          <Button icon className="mt-2 w-full">Get Started</Button>
        </div>
      </nav>}
    </header>
  )
}
