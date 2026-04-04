import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { MapPin, PlusCircle, LayoutDashboard, LogOut, LogIn, Menu, X, Shield, Building2, Eye } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../ui/NotificationBell'
import { ROLE_META } from '../../utils/rbac'

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin, isOrganization, isModerator, isUser } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/')

  const handleLogout = () => { logout(); navigate('/'); setOpen(false) }

  // Build nav links based on role
  const navLinks = [
    { to: '/', label: 'Xarita', icon: MapPin, always: true },
    isUser         && { to: '/report',       label: 'Bildirish',  icon: PlusCircle,    highlight: true },
    isAuthenticated && { to: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
    isAdmin        && { to: '/admin',        label: 'Admin',      icon: Shield,         role: 'admin' },
    isOrganization && { to: '/organization', label: 'Tashkilot',  icon: Building2,      role: 'organization' },
    isModerator    && { to: '/dashboard',    label: 'Moderator',  icon: Eye,            role: 'moderator' },
  ].filter(Boolean)

  const roleMeta = user ? ROLE_META[user.role] : null

  return (
    <header className="fixed top-0 left-0 right-0 z-[2000] h-16">
      <div className="glass h-full border-b border-surface-800/60">
        {/* <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between"> */}
<div className="mx-auto px-6 h-full flex items-center justify-between w-full">        
  {/* <div className="w-full px-6 h-full flex items-center justify-between"> */}
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow group-hover:shadow-none transition-all">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Muammoli <span className="text-brand-400">Xarita</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon, highlight, role }) => (
              <Link key={to + label} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                  ${highlight
                    ? 'bg-brand-500 text-white hover:bg-brand-400 shadow-glow hover:shadow-none'
                    : role === 'admin'
                      ? isActive(to) ? 'bg-red-500/20 text-red-300' : 'text-red-400/80 hover:bg-red-500/10 hover:text-red-300'
                      : role === 'organization'
                        ? isActive(to) ? 'bg-blue-500/20 text-blue-300' : 'text-blue-400/80 hover:bg-blue-500/10 hover:text-blue-300'
                        : isActive(to) ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
              >
                <Icon size={15} />{label}
              </Link>
            ))}
          </nav>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                {/* User chip */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800 border border-surface-700">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-400">{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-surface-200">{user.name}</span>
                  {roleMeta && (
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${roleMeta.badge}`}>
                      {roleMeta.icon} {roleMeta.label}
                    </span>
                  )}
                </div>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  <LogOut size={15} /> Chiqish
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="btn-ghost text-sm"><LogIn size={15} /> Kirish</Link>
                <Link to="/register" className="btn-primary text-sm">Ro'yxatdan o'tish</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden btn-ghost p-2">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-b border-surface-800/60 animate-fade-in"> 
            {/* <div className="md:hidden glass border-b border-surface-800/60 animate-fade-in" 
       style={{ position: 'relative', zIndex: 1001 }}>
         */}
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label, icon: Icon, highlight }) => (
              <Link key={to + label} to={to} onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${highlight ? 'bg-brand-500 text-white'
                    : isActive(to) ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white hover:bg-surface-800'}`}
              >
                <Icon size={15} />{label}
              </Link>
            ))}

             {isAuthenticated && (
        <div className="px-3 py-2">
          <NotificationBell />
        </div>
      )}

            {isAuthenticated
              ? <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-surface-800 transition-all">
                  <LogOut size={15} /> Chiqish
                </button>
              : <>
                  <Link to="/login"    onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-surface-400 hover:text-white hover:bg-surface-800 transition-all"><LogIn size={15} /> Kirish</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary justify-start">Ro'yxatdan o'tish</Link>
                </>
            }
          </div>
        </div>
      )}
    </header>
  )
}
