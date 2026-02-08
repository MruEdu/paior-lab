import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import AuthGate from './pages/AuthGate'
import TargetSelect from './pages/TargetSelect'
import Survey from './pages/Survey'
import InfoInput from './pages/InfoInput'
import Result from './pages/Result'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/diagnose" element={<AuthGate />} />
      <Route path="/diagnosis" element={<ProtectedRoute><TargetSelect /></ProtectedRoute>} />
      <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
      <Route path="/info" element={<ProtectedRoute><InfoInput /></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
