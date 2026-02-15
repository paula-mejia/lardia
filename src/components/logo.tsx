interface LogoProps {
  className?: string
}

export default function Logo({ className = 'h-9' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
        <span className="text-gray-900">Lar</span>
        <span className="text-emerald-700">Dia</span>
      </span>
    </div>
  )
}
