import { Navigate, useLocation } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from './AuthContext'
import type { UserRole } from '../../types'

interface ProtectedRouteProps {
  children: ReactElement
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isLoading, profile } = useAuth()

  if (isLoading) {
    return <p className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600">Checking your session...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !profile) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    const fallbackPath = profile.role === 'worker' ? '/worker/dashboard' : '/'
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
