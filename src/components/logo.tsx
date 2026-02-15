interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export default function Logo({ className = 'h-9', iconOnly = false }: LogoProps) {
  const icon = (
    <svg viewBox="0 0 44 44" fill="none" className={iconOnly ? 'h-full w-auto' : 'h-6 w-auto'} xmlns="http://www.w3.org/2000/svg">
      {/* Sun rays */}
      <line x1="22" y1="2" x2="22" y2="8" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="13.5" y1="5" x2="16" y2="9.5" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="30.5" y1="5" x2="28" y2="9.5" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" />
      {/* Upper chevron - filled solid shape */}
      <path d="M22 14L11 25h4L22 18l7 7h4L22 14z" fill="#10B981" />
      {/* Lower chevron - filled solid shape */}
      <path d="M22 22L7 37h5L22 27l10 10h5L22 22z" fill="#10B981" />
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
