import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { BookWorkerPage } from '../pages/BookWorkerPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { MyBookingsPage } from '../pages/MyBookingsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SignupPage } from '../pages/SignupPage'
import { WorkerDashboardPage } from '../pages/WorkerDashboardPage'
import { WorkerDetailsPage } from '../pages/WorkerDetailsPage'
import { WorkersPage } from '../pages/WorkersPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/workers/:id" element={<WorkerDetailsPage />} />
          <Route path="/book/:workerId" element={<BookWorkerPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
