import { useEffect, useState } from 'react'
import { Bot, Menu, Plane, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { useAuth } from '../../context/AuthContext'

const links = [
  { label: 'Explore', href: '/explore' },
  { label: 'Destinations', href: '/explore#destinations' },
  { label: 'Plan a Trip', href: '/trip-planner' },
  { label: 'Weather', href: '/weather' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Restaurants', href: '/restaurants' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 16)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const signOut = async () => {
    setIsOpen(false)
    try { await logout() } catch { /* The local session is cleared even if the API is offline. */ }
    navigate('/')
  }

  return <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${isScrolled ? 'border-white/[0.09] bg-[#030712]/90 shadow-lg shadow-black/10 backdrop-blur-xl' : 'border-white/[0.06] bg-[#030712]/35 backdrop-blur-md'}`}>
    <Container className="flex h-[68px] items-center justify-between sm:h-[74px]">
      <Link to="/" aria-label="TravelMate AI home" className="inline-flex items-center gap-2.5 rounded-md">
        <span className="grid size-9 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200"><Plane size={17} aria-hidden="true" /></span>
        <span className="text-[15px] font-semibold tracking-tight text-white">TravelMate<span className="text-slate-400"> AI</span></span>
      </Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-6 xl:gap-8 lg:flex">
        {links.map((link) => <Link key={link.label} className={`text-[13px] text-slate-300/85 transition-colors hover:text-white ${link.label === 'Hotels' || link.label === 'Restaurants' ? 'hidden xl:inline-flex' : ''}`} to={link.href}>{link.label}</Link>)}
      </nav>
      <div className="hidden items-center gap-4 lg:flex">{user ? <><Link to="/dashboard" className="text-sm text-slate-300 transition hover:text-white">Dashboard</Link><Link to="/my-trips" className="text-sm text-slate-300 transition hover:text-white">My Trips</Link><Link to="/assistant" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-1.5 text-sm text-cyan-100 transition hover:text-white"><Bot size={14}/>Assistant</Link><Link to="/saved" className="text-sm text-slate-300 transition hover:text-white">Saved Destinations</Link><Link to="/profile" className="text-sm text-slate-300 transition hover:text-white">Profile</Link><button type="button" onClick={signOut} className="text-sm text-slate-400 transition hover:text-white">Logout</button></> : <><Link to="/login" className="text-sm text-slate-300 transition hover:text-white">Login</Link><Link to="/register" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white shadow-[0_8px_30px_rgba(79,70,229,0.24)] transition hover:bg-indigo-400">Get Started <span aria-hidden="true">↗</span></Link></>}</div>
      <button type="button" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen((open) => !open)} className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-200 hover:bg-white/[0.06] lg:hidden">{isOpen ? <X size={19} /> : <Menu size={19} />}</button>
    </Container>
    {isOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-white/[0.07] bg-[#080e1a] px-5 py-4 lg:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-1">
      {links.map((link) => <Link key={link.label} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white" to={link.href}>{link.label}</Link>)}
      {user ? <div className="mt-2 grid grid-cols-2 gap-3"><Link to="/dashboard" onClick={()=>setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-500 text-sm font-semibold text-white">Dashboard</Link><Link to="/trip-planner" onClick={()=>setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-slate-200">Plan a Trip</Link><Link to="/my-trips" onClick={()=>setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-slate-200">My Trips</Link><Link to="/assistant" onClick={()=>setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-200/15 text-sm text-cyan-100"><Bot size={15}/>Assistant</Link><Link to="/saved" onClick={()=>setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-slate-200">Saved Destinations</Link><Link to="/profile" onClick={()=>setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-slate-200">Profile</Link><button type="button" onClick={signOut} className="min-h-11 rounded-xl border border-white/10 text-sm text-slate-300">Logout</button></div> : <div className="mt-2 grid grid-cols-2 gap-3"><Link to="/login" onClick={()=>setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-slate-200">Login</Link><Button icon className="w-full" onClick={()=>{setIsOpen(false);navigate('/register')}}>Get Started</Button></div>}
    </div></nav>}
  </header>
}
