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
    <button type="button" aria-haspopup="true" aria-expanded={activeMenu === menu} onClick={() => toggleMenu(menu)} className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors hover:bg-white/[0.05] hover:text-white ${activeMenu === menu ? 'text-white' : 'text-slate-300'}`}>
      <Icon size={15} aria-hidden="true"/>{label}<ChevronDown size={14} className={`transition-transform ${activeMenu === menu ? 'rotate-180' : ''}`}/>
    </button>
    {activeMenu === menu && <div className={`absolute ${menu === 'account' ? 'right-0' : 'left-0'} top-full z-50 mt-2 w-56 rounded-xl border border-white/[0.1] bg-[#0B1120] p-2 shadow-xl shadow-black/30`} role="group" aria-label={`${label} links`}>
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

  return <header ref={headerRef} className={`sticky top-0 z-40 border-b transition-colors duration-300 ${isScrolled ? 'border-white/[0.09] bg-[#030712]/95 shadow-lg shadow-black/10 backdrop-blur-xl' : 'border-white/[0.06] bg-[#030712]/90 backdrop-blur-md'}`}>
    <Container className="flex min-h-[68px] items-center justify-between gap-3 py-2 sm:min-h-[74px] sm:gap-5">
      <Link to="/" aria-label="TravelMate AI home" onClick={closeMenus} className="inline-flex shrink-0 items-center gap-2.5 rounded-md">
        <span className="grid size-9 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200"><Plane size={17} aria-hidden="true"/></span>
        <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-white">TravelMate<span className="text-slate-400"> AI</span></span>
      </Link>

      <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
        <Link to="/explore" className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:text-white">Explore</Link>
        {dropdown('plan', 'Plan', Plane, planningLinks)}
        {dropdown('discover', 'Discover', Compass, discoveryLinks)}
        {user && <Link to="/assistant" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-slate-300 transition-colors hover:text-white"><Bot size={15}/>Assistant</Link>}
      </nav>

      <div className="hidden shrink-0 items-center gap-2 lg:flex">
        {user ? dropdown('account', 'My Travel', UserRound, accountLinks) : <><Link to="/login" className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:text-white">Log in</Link><Link to="/register" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white shadow-[0_8px_30px_rgba(79,70,229,0.24)] transition hover:bg-indigo-400">Get Started <span aria-hidden="true">↗</span></Link></>}
      </div>

      <button type="button" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => { setActiveMenu(null); setIsOpen((open) => !open) }} className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline lg:hidden">{isOpen ? <X size={19}/> : <Menu size={19}/>}</button>
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
