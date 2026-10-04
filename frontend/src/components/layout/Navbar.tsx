import { useEffect, useState } from 'react'
import { Menu, Plane, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'

const links = [
  { label: 'Explore', href: '#experiences' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Plan a Trip', href: '#plan' },
  { label: 'Hotels', href: '#planner' },
  { label: 'Restaurants', href: '#planner' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 16)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${isScrolled ? 'border-white/[0.09] bg-[#030712]/90 shadow-lg shadow-black/10 backdrop-blur-xl' : 'border-white/[0.06] bg-[#030712]/35 backdrop-blur-md'}`}>
    <Container className="flex h-[68px] items-center justify-between sm:h-[74px]">
      <a href="#home" aria-label="TravelMate AI home" className="inline-flex items-center gap-2.5 rounded-md">
        <span className="grid size-9 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200"><Plane size={17} aria-hidden="true" /></span>
        <span className="text-[15px] font-semibold tracking-tight text-white">TravelMate<span className="text-slate-400"> AI</span></span>
      </a>
      <nav aria-label="Main navigation" className="hidden items-center gap-6 xl:gap-8 lg:flex">
        {links.map((link) => <a key={link.label} className="text-[13px] text-slate-300/85 transition-colors hover:text-white" href={link.href}>{link.label}</a>)}
      </nav>
      <div className="hidden items-center gap-4 lg:flex"><a href="#plan" className="text-sm text-slate-300 transition hover:text-white">Login</a><Button icon className="min-h-10 px-4 text-xs">Get Started</Button></div>
      <button type="button" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen((open) => !open)} className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-200 hover:bg-white/[0.06] lg:hidden">{isOpen ? <X size={19} /> : <Menu size={19} />}</button>
    </Container>
    {isOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-white/[0.07] bg-[#080e1a] px-5 py-4 lg:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-1">
      {links.map((link) => <a key={link.label} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white" href={link.href}>{link.label}</a>)}
      <div className="mt-2 grid grid-cols-2 gap-3"><a href="#plan" onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-slate-200">Login</a><Button icon className="w-full" onClick={() => setIsOpen(false)}>Get Started</Button></div>
    </div></nav>}
  </header>
}
