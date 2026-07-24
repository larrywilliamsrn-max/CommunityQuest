import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Layout from './components/Layout'
import DashboardHome from './pages/DashboardHome'
import ParticipantDashboard from './pages/ParticipantDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import EventMapPage from './pages/EventMapPage'
import RewardsPage from './pages/RewardsPage'
import OrganizerExperience from './pages/OrganizerExperience'
import ScannerPage from './pages/ScannerPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/participant" element={<ParticipantDashboard />} />
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/map" element={<EventMapPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/organizer-experience" element={<OrganizerExperience />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="*" element={<DashboardHome />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
