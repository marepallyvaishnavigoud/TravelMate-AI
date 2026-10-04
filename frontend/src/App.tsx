import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/Home/HomePage'
import { Explore } from './pages/Explore/Explore'
import { DestinationDetails } from './pages/DestinationDetails/DestinationDetails'
import { AppLayout } from './layouts/AppLayout'

function App() {
  return <BrowserRouter><AppLayout><Routes><Route path="/" element={<HomePage />} /><Route path="/explore" element={<Explore />} /><Route path="/destination/:id" element={<DestinationDetails />} /><Route path="*" element={<HomePage />} /></Routes></AppLayout></BrowserRouter>
}

export default App
