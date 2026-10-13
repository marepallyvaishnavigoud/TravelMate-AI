import { useEffect, useRef, useState } from 'react'
import { Bookmark, Bot, BriefcaseBusiness, ChevronDown, Compass, LayoutDashboard, LogOut, Map, Menu, Plane, UserRound, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { useAuth } from '../../context/AuthContext'

const discoveryLinks = [
  { label: 'Destinations', href: '/explore#destinations', icon: Map },
  { label: 'Weather', href: '/weather', icon: Compass },
  { label: 'Live Explore', href: '/live-explore', icon: Map },
  { label: 'Hotels', href: '/hotels', icon: BriefcaseBusiness },
  { label: 'Restaurants', href: '/restaurants', icon: BriefcaseBusiness },
]
const planningLinks = [
  { label: 'Plan a Trip', href: '/trip-planner', icon: Plane },
  { label: 'Transport & Booking', href: '/transport', icon: BriefcaseBusiness },
]

function linkStyle(active: boolean) {
  return `flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors ${active ? 'bg-cyan-200/[0.08] text-cyan-100' : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'}`
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'discover' | 'plan' | 'account' | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 16)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) { setActiveMenu(null); setIsOpen(false) }
    }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setActiveMenu(null); setIsOpen(false) } }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOnOutside); document.removeEventListener('keydown', closeOnEscape) }
  }, [])

  const closeMenus = () => { setActiveMenu(null); setIsOpen(false) }
  const toggleMenu = (menu: 'discover' | 'plan' | 'account') => setActiveMenu((current) => current === menu ? null : menu)
  const signOut = async () => {
    closeMenus()
    try { await logout() } catch { /* The local session is cleared even if the API is offline. */ }
    navigate('/')
  }

  const dropdown = (menu: 'discover' | 'plan' | 'account', label: string, Icon: typeof Compass, items: typeof discoveryLinks) => <div className="relative" key={menu}>
    <button type="button" aria-haspopup="true" aria-expanded={activeMenu === menu} onClick={() => toggleMenu(menu)} className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium transition-all hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200/60 ${activeMenu === menu ? 'bg-white/[0.07] text-white' : 'text-slate-300'}`}>
      <Icon size={15} aria-hidden="true"/>{label}<ChevronDown size={14} className={`transition-transform ${activeMenu === menu ? 'rotate-180' : ''}`}/>
    </button>
    {activeMenu === menu && <div className={`absolute ${menu === 'account' ? 'right-0' : 'left-0'} top-full z-50 mt-3 w-60 rounded-2xl border border-white/[0.1] bg-[#0b1220]/[.98] p-2.5 shadow-[0_20px_60px_rgba(0,0,0,.55)] ring-1 ring-black/20 backdrop-blur-2xl`} role="group" aria-label={`${label} links`}>
      {items.map(({ label: itemLabel, href, icon: ItemIcon }) => <Link key={href} to={href} onClick={closeMenus} className={linkStyle(false)}><ItemIcon size={15} aria-hidden="true"/>{itemLabel}</Link>)}
      {menu === 'account' && <button type="button" onClick={() => void signOut()} className="mt-2 flex min-h-10 w-full items-center gap-2 rounded-lg border-t border-white/[0.08] px-3 pt-2 text-left text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"><LogOut size={15}/>Log out</button>}
    </div>}
  </div>

  const accountLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Trips', href: '/my-trips', icon: Plane },
    { label: 'Saved Destinations', href: '/saved', icon: Bookmark },
    { label: 'Profile', href: '/profile', icon: UserRound },
  ]

  return <header ref={headerRef} className={`sticky top-0 z-40 border-b transition-all duration-300 ${isScrolled ? 'border-white/[0.1] bg-[#050a14]/90 shadow-[0_12px_40px_rgba(0,0,0,.24)] backdrop-blur-2xl' : 'border-white/[0.07] bg-[#050a14]/75 backdrop-blur-xl'}`}>
    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent"/>
    <Container className="flex min-h-[72px] items-center justify-between gap-3 py-2 sm:min-h-[78px] sm:gap-5">
      <Link to="/" aria-label="TravelMate AI home" onClick={closeMenus} className="group inline-flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200/70">
        <span className="relative grid size-10 place-items-center rounded-[15px] border border-indigo-200/20 bg-gradient-to-br from-indigo-300/20 via-indigo-400/10 to-cyan-200/[0.06] text-indigo-100 shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_5px_20px_rgba(99,102,241,.12)] transition group-hover:border-cyan-100/40 group-hover:text-cyan-100"><Plane size={18} aria-hidden="true"/><span className="absolute -bottom-1 -right-1 size-2 rounded-full border border-[#080e1a] bg-cyan-200"/></span>
        <span className="flex flex-col whitespace-nowrap text-[15px] font-semibold leading-none tracking-tight text-white">TravelMate<span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[.23em] text-slate-400"><span className="text-cyan-200">AI</span> · YOUR NEXT JOURNEY</span></span>
      </Link>

      <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 rounded-2xl border border-white/[0.055] bg-white/[0.025] p-1 lg:flex xl:gap-1.5">
        <Link to="/explore" className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white">Explore</Link>
        {dropdown('plan', 'Plan', Plane, planningLinks)}
        {dropdown('discover', 'Discover', Compass, discoveryLinks)}
        {user && <Link to="/assistant" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"><Bot size={15} className="text-cyan-200"/>Assistant</Link>}
      </nav>

      <div className="hidden shrink-0 items-center gap-2 lg:flex">
        {user ? dropdown('account', 'My Travel', UserRound, accountLinks) : <><Link to="/login" className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:text-white">Log in</Link><Link to="/register" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white shadow-[0_8px_30px_rgba(79,70,229,0.24)] transition hover:bg-indigo-400">Get Started <span aria-hidden="true">↗</span></Link></>}
      </div>

      <button type="button" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => { setActiveMenu(null); setIsOpen((open) => !open) }} className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-200 transition hover:border-cyan-200/25 hover:bg-white/[0.08] focus-visible:outline lg:hidden">{isOpen ? <X size={19}/> : <Menu size={19}/>}</button>
    </Container>

    {isOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-white/[0.07] bg-[#080e1a] px-5 py-4 lg:hidden"><div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2">
      <MobileGroup title="Explore" links={[{ label: 'Explore', href: '/explore', icon: Compass }, ...discoveryLinks]} onNavigate={closeMenus}/>
      <MobileGroup title="Plan your trip" links={planningLinks} onNavigate={closeMenus}/>
      {user ? <><MobileGroup title="My Travel" links={accountLinks} onNavigate={closeMenus}/><div className="flex flex-col gap-1"><p className="px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500">Your assistant</p><Link to="/assistant" onClick={closeMenus} className={linkStyle(false)}><Bot size={15}/>AI Travel Assistant</Link><button type="button" onClick={() => void signOut()} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border-t border-white/[0.08] px-3 pt-2 text-left text-sm text-slate-400 hover:text-white"><LogOut size={15}/>Log out</button></div></> : <div className="flex items-end gap-3"><Link to="/login" onClick={closeMenus} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 text-sm text-slate-200 hover:bg-white/[0.05]">Log in</Link><Button className="min-h-11 flex-1" onClick={() => { closeMenus(); navigate('/register') }}>Get Started</Button></div>}
    </div></nav>}
  </header>
}

function MobileGroup({ title, links, onNavigate }: { title: string; links: Array<{ label: string; href: string; icon: typeof Compass }>; onNavigate: () => void }) {
  return <div className="flex flex-col gap-1"><p className="px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500">{title}</p>{links.map(({ label, href, icon: Icon }) => <Link key={href} to={href} onClick={onNavigate} className={linkStyle(false)}><Icon size={15} aria-hidden="true"/>{label}</Link>)}</div>
}
