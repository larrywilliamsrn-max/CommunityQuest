import { useContext } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthContext, AuthProvider } from './AuthContext'
import Layout from './components/Layout'
import DashboardHome from './pages/DashboardHome'
import ParticipantDashboard from './pages/ParticipantDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import EventMapPage from './pages/EventMapPage'
import RewardsPage from './pages/RewardsPage'
import OrganizerExperience from './pages/OrganizerExperience'
import ScannerPage from './pages/ScannerPage'
import LoginPage from './pages/LoginPage'
import ParticipantEventPage from './pages/ParticipantEventPage'
import CreateQuestPage from './pages/CreateQuestPage'
import './App.css'

function AppRoutes() {
  const { role } = useContext(AuthContext)

  return (
    <Layout>
      <Routes>
        <Route path="/" element={role ? <Navigate to={role === 'organizer' ? '/organizer' : '/participant'} replace /> : <DashboardHome />} />
        <Route path="/login" element={role ? <Navigate to={role === 'organizer' ? '/organizer' : '/participant'} replace /> : <LoginPage />} />
        <Route path="/participant" element={<ParticipantDashboard />} />
        <Route path="/participant/register" element={<ParticipantEventPage title="Register for the event" description="Secure your spot, choose your session preferences, and confirm your attendance details." details={["Check in with your attendee profile.", "Select your preferred workshops.", "Receive a confirmation badge for entry."]} ctaLabel="Back to dashboard" backTo="/participant" />} />
        <Route path="/participant/keynote" element={<ParticipantEventPage title="Attend Keynote" description="Join the keynote session live and collect your event streak bonus." details={["Reserve your seat in the keynote hall.", "Arrive 10 minutes early for check-in.", "Claim your XP reward after the session."]} ctaLabel="Back to dashboard" backTo="/participant" />} />
        <Route path="/participant/treasure-hunt" element={<ParticipantEventPage title="Treasure Hunt" description="Explore booths, solve clues, and unlock the final reward." details={["Visit each marked booth.", "Collect clues and scan QR codes.", "Complete the final challenge to earn the hidden badge."]} ctaLabel="Back to dashboard" backTo="/participant" />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/organizer/create-quest" element={<CreateQuestPage />} />
        <Route path="/map" element={<EventMapPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/organizer-experience" element={<OrganizerExperience />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="*" element={<DashboardHome />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
