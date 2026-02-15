interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export default function Logo({ className = 'h-9', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 40 32" fill="none" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Sun rays */}
        <line x1="20" y1="1" x2="20" y2="6" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="3.5" x2="14.5" y2="7.5" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="3.5" x2="25.5" y2="7.5" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        {/* Single chevron roof */}
        <path d="M4 28L20 12L36 28" stroke="#047857" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!iconOnly && (
        <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
          <span className="text-gray-900">Lar</span>
          <span className="text-emerald-700">Dia</span>
        </span>
      )}
    </div>
  )
}
