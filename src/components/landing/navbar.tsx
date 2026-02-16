import Link from 'next/link'
import Logo from '@/components/logo'
import MobileNav from '@/components/mobile-nav'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo className="h-9" />
        </Link>
        <MobileNav />
      </div>
    </nav>
  )
}
