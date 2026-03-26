import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import { timeAgo } from '../../utils/constants'

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Tashqariga bosganda yopish
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Har 30 sekundda yangilash
  useEffect(() => {
    if (!isAuthenticated) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnread(data.unreadCount)
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
    } catch {}
  }

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleClick = (notif) => {
    markOneRead(notif.id)
    if (notif.problem?.id) {
      navigate(`/problems/${notif.problem.id}`)
      setOpen(false)
    }
  }

  const typeIcon = (type) => {
    const icons = {
      status_change:    '🔄',
      new_comment:      '💬',
      problem_received: '✅',
      org_response:     '🏛️',
    }
    return icons[type] || '🔔'
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell tugmasi */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-surface-800 border border-surface-700 hover:border-surface-600 transition-all"
      >
        <Bell size={16} className={unread > 0 ? 'text-brand-400' : 'text-surface-400'} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 glass border border-surface-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
            <span className="font-semibold text-white text-sm">
              Bildirishnomalar
              {unread > 0 && (
                <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                  {unread} yangi
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={13} /> Barchasi o'qildi
              </button>
            )}
          </div>

          {/* Ro'yxat */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-surface-500">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Bildirishnomalar yo'q</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`px-4 py-3 border-b border-surface-800/60 cursor-pointer hover:bg-surface-800/40 transition-colors flex gap-3 ${
                    !n.is_read ? 'bg-brand-500/5' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${
                    !n.is_read ? 'bg-brand-500/15' : 'bg-surface-800'
                  }`}>
                    {typeIcon(n.type)}
                  </div>

                  {/* Matn */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-surface-200' : 'text-surface-400'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-surface-600">
                        {timeAgo(n.createdAt || n.created_at)}
                      </span>
                      {n.problem && (
                        <span className="text-[11px] text-brand-500/70 flex items-center gap-0.5">
                          <MapPin size={10} /> Ko'rish
                        </span>
                      )}
                    </div>
                  </div>

                  {/* O'qilmagan dot */}
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
