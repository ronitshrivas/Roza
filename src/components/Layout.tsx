'use client'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
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
    </div>
  )
}
