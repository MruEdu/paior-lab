import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const isAuth = sessionStorage.getItem('paoir_authenticated') === '1'
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/diagnose" state={{ from: location }} replace />
  }

  return children
}
