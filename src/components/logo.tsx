interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export default function Logo({ className = 'h-9', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* House icon with double chevron roof + sun rays */}
      <svg viewBox="0 0 56 52" fill="none" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Sun rays */}
        <line x1="28" y1="2" x2="28" y2="8" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="5" x2="21" y2="10" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="38" y1="5" x2="35" y2="10" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        {/* Upper chevron (smaller) */}
        <path d="M12 28L28 14L44 28" stroke="#047857" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Lower chevron (larger) */}
        <path d="M6 38L28 22L50 38" stroke="#047857" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
