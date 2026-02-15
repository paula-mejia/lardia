interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export default function Logo({ className = 'h-9', iconOnly = false }: LogoProps) {
  const icon = (
    <svg viewBox="0 0 40 42" fill="none" className={iconOnly ? 'h-full w-auto' : 'h-6 w-auto'} xmlns="http://www.w3.org/2000/svg">
      {/* Sun rays - thin lines */}
      <line x1="20" y1="0" x2="20" y2="6.5" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="12" y1="2.5" x2="14.5" y2="8" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="28" y1="2.5" x2="25.5" y2="8" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
      {/* Upper chevron - wide solid filled */}
      <polygon points="20,12 8,24 12,24 20,16.5 28,24 32,24" fill="#10B981" />
      {/* Lower chevron - wider solid filled */}
      <polygon points="20,20 4,36 9,36 20,25.5 31,36 36,36" fill="#10B981" />
    </svg>
  )

  if (iconOnly) {
    return <div className={className}>{icon}</div>
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {icon}
      <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
        <span className="text-gray-900">Lar</span>
        <span className="text-emerald-500">Dia</span>
      </span>
    </div>
  )
}
