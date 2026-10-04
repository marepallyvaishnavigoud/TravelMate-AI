import { HomePage } from './pages/Home/HomePage'
import { AppLayout } from './layouts/AppLayout'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { exploreDestinations } from './data/destinations'
import { Explore } from './pages/Explore/Explore'

function DestinationDetails() {
  const { id } = useParams()
  const destination = exploreDestinations.find((place) => place.id === id)
  return <section className="mx-auto flex min-h-[55vh] max-w-4xl flex-col justify-center px-5 py-20 sm:px-8"><Link to="/explore" className="text-sm text-cyan-200 hover:text-white">← Back to explore</Link><p className="mt-8 text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">{destination?.state ?? 'Destination'}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-6xl">{destination?.name ?? 'Destination not found'}</h1><p className="mt-4 text-slate-400">Destination details coming next.</p></section>
}

function App() {
  return <BrowserRouter><AppLayout><Routes><Route path="/" element={<HomePage />} /><Route path="/explore" element={<Explore />} /><Route path="/destination/:id" element={<DestinationDetails />} /><Route path="*" element={<HomePage />} /></Routes></AppLayout></BrowserRouter>
}

export default App
