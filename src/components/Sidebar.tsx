'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, MessageSquare, Zap, UserCheck,
  Search, ShieldAlert, Users, BarChart2, Settings2, Brain,
  DollarSign, AlertCircle, Settings, Activity
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'CEO Dashboard', icon: LayoutDashboard },
  { href: '/revenue', label: 'Revenue Intel', icon: TrendingUp },
  { href: '/copilot', label: 'AI Copilot', icon: MessageSquare },
  { href: '/decisions', label: 'Decisions', icon: Zap },
  { href: '/qualification', label: 'Qualification', icon: UserCheck },
  { href: '/investigations', label: 'Investigations', icon: Search },
  { href: '/conversations', label: 'Conversations', icon: Users },
  { href: '/sales', label: 'Sales', icon: BarChart2 },
  { href: '/operations', label: 'Operations', icon: Settings2 },
  { href: '/learning', label: 'Learning', icon: Brain },
  { href: '/costs', label: 'Costs', icon: DollarSign },
  { href: '/errors', label: 'Errors', icon: AlertCircle },
  { href: '/config', label: 'Config', icon: Settings },
  { href: '/platform', label: 'Platform', icon: Activity },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[var(--card)] border-r border-[var(--border)] h-screen overflow-y-auto">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <ShieldAlert size={14} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Maya AI</div>
            <div className="text-[10px] text-[var(--muted-foreground)]">Control Center</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-[var(--border)]">
        <div className="text-[10px] text-[var(--muted-foreground)]">v1.0.0 — Production</div>
      </div>
    </aside>
  )
}
