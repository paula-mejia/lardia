interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export default function Logo({ className = 'h-9', iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return (
      <div className={className}>
        <svg viewBox="0 0 40 36" fill="none" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
          <line x1="20" y1="1" x2="20" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="3.5" x2="14.5" y2="7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="3.5" x2="25.5" y2="7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 24L20 12L32 24" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 32L20 18L36 32" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 40 36" fill="none" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Sun rays */}
        <line x1="20" y1="1" x2="20" y2="6" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="3.5" x2="14.5" y2="7.5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="3.5" x2="25.5" y2="7.5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        {/* Double chevron roof */}
        <path d="M8 24L20 12L32 24" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 32L20 18L36 32" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
        <span className="text-gray-900">Lar</span>
        <span className="text-emerald-500">Dia</span>
      </span>
    </div>
  )
}
