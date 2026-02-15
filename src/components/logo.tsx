import Image from 'next/image'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export default function Logo({ className = 'h-9', iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return (
      <Image
        src="/icon-full.png"
        alt="LarDia"
        width={94}
        height={74}
        className={className}
      />
    )
  }

  return (
    <Image
      src="/logo-nav.png"
      alt="LarDia"
      width={228}
      height={72}
      className={className}
      priority
    />
  )
}
