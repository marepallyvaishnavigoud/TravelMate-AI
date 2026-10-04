import { Plane } from 'lucide-react'
import { Container } from '../ui/Container'

export function Footer() {
  return (
    <footer id="about" className="border-t border-white/[0.07] py-7">
      <Container className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <a href="#home" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300"><Plane size={15} className="text-indigo-300" aria-hidden="true" /> TravelMate AI</a>
        <p className="text-xs text-slate-500">Thoughtful journeys start here.</p>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} TravelMate AI</p>
      </Container>
    </footer>
  )
}
