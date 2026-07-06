import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { Evaluations } from './pages/Evaluations'
import { Financial } from './pages/Financial'
import { Attendance } from './pages/Attendance'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
