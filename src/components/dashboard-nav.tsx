'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/logo'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Calculator, Gift, Palmtree, UserMinus,
  Users, FileText, Shield,
  FileCheck, Cpu, Receipt, Calendar,
  Settings, Heart,
  Menu, X, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Calculadoras',
    items: [
      { label: 'Simulador', href: '/simulador', icon: <Calculator className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { label: 'Empregados', href: '/dashboard', icon: <Users className="h-4 w-4" /> },
      { label: 'Contratos', href: '/dashboard/contracts', icon: <FileText className="h-4 w-4" /> },
      { label: 'Verificação', href: '/dashboard/background-check', icon: <Shield className="h-4 w-4" />, badge: 'Pago' },
    ],
  },
  {
    label: 'eSocial',
    items: [
      { label: 'Status', href: '/dashboard/esocial', icon: <FileCheck className="h-4 w-4" /> },
      { label: 'Processar', href: '/dashboard/esocial/process', icon: <Cpu className="h-4 w-4" /> },
      { label: 'Eventos', href: '/dashboard/esocial/events', icon: <FileText className="h-4 w-4" /> },
      { label: 'DAE', href: '/dashboard/esocial/dae', icon: <Receipt className="h-4 w-4" /> },
      { label: 'Calendário', href: '/dashboard/calendar', icon: <Calendar className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Conta',
    items: [
      { label: 'Configurações', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
      { label: 'Indicar', href: '/dashboard/referral', icon: <Heart className="h-4 w-4" /> },
    ],
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(navGroups.map((g) => g.label))
  )

  function toggleGroup(label: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const navContent = (
    <nav className="space-y-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <button
            onClick={() => toggleGroup(group.label)}
            className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1 hover:text-foreground transition-colors"
          >
            {group.label}
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform',
                expandedGroups.has(group.label) && 'rotate-180'
              )}
            />
          </button>
          {expandedGroups.has(group.label) && (
            <div className="mt-1 space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive(item.href)
                      ? 'bg-emerald-50 text-emerald-800 font-medium dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-background border-r p-4 overflow-y-auto transition-transform lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-6 px-3">
          <Link href="/dashboard" className="flex items-center">
            <Logo className="h-9" />
          </Link>
        </div>
        {navContent}
      </aside>
    </>
  )
}
