import { useLocation, useNavigate } from 'react-router-dom'
import { Container } from '../../components/ui/Container'
import { TripForm } from '../../components/trip/TripForm'
import { tripService } from '../../services/tripService'

export function TripPlanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialValues = location.state as { origin?: string; destination?: string } | null
  return <Container className="py-10 sm:py-14"><div className="mx-auto max-w-4xl"><header className="mb-8"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Plan with intention</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Build your next journey</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Start with the essentials. Your trip is saved privately to your account, ready for the details to come.</p></header><TripForm initialValues={initialValues ?? undefined} onSubmit={async (input) => { const trip = await tripService.createTrip(input); navigate(`/trips/${trip._id}`) }}/></div></Container>
}
