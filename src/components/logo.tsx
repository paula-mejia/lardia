interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export default function Logo({ className = 'h-9', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* House roofline icon */}
      <svg viewBox="0 0 48 40" fill="none" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4L2 24h8L24 12l14 12h8L24 4z" fill="#047857" />
      </svg>
      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight">
          <span className="text-gray-900">Lar</span>
          <span className="text-emerald-700">Dia</span>
        </span>
      )}
    </div>
  )
}
