'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-3">
        <Link href="/simulador" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Simulador
        </Link>
        <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Blog
        </Link>
        <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          FAQ
        </Link>
        <Link href="/login">
          <Button variant="ghost" size="sm">Entrar</Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">Comece agora</Button>
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-14 left-0 right-0 bg-background border-b shadow-lg md:hidden z-50">
          <div className="flex flex-col p-4 gap-3">
            <Link
              href="/simulador"
              className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              onClick={() => setOpen(false)}
            >
              Simulador
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              onClick={() => setOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              onClick={() => setOpen(false)}
            >
              FAQ
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">Entrar</Button>
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">Comece agora</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
