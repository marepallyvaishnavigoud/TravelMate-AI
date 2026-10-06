import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/Home/HomePage'
import { Explore } from './pages/Explore/Explore'
import { DestinationDetails } from './pages/DestinationDetails/DestinationDetails'
import { AppLayout } from './layouts/AppLayout'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Login } from './pages/Login/Login'
import { Register } from './pages/Register/Register'
import { Profile } from './pages/Profile/Profile'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Saved } from './pages/Saved/Saved'
import { TripPlanner } from './pages/TripPlanner/TripPlanner'
import { Trips } from './pages/Trips/Trips'
import { TripDetails } from './pages/Trip/TripDetails'

function App() {
  return <AuthProvider><BrowserRouter><AppLayout><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/explore" element={<Explore />} />
    <Route path="/destination/:id" element={<DestinationDetails />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
    <Route path="/trip-planner" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
    <Route path="/my-trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
    <Route path="/trips/:id" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
    <Route path="*" element={<HomePage />} />
  </Routes></AppLayout></BrowserRouter></AuthProvider>
}

export default App
