'use client'

import { useEffect, type ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import { initLenis } from '@/lib/scroll'

export default function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    initLenis()
  }, [])

  return (
    <div className="min-h-[100dvh] bg-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
