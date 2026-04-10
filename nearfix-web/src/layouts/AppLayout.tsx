import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/categories', label: 'Categories' },
  { to: '/workers', label: 'Workers' },
  { to: '/my-bookings', label: 'My Bookings' },
  { to: '/worker/dashboard', label: 'Worker Dashboard' },
  { to: '/admin/dashboard', label: 'Admin Dashboard' },
]

function navClassName(isActive: boolean) {
  return isActive
    ? 'rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white'
    : 'rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100'
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
            NearFix
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => navClassName(isActive)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>
            <Link to="/signup" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
