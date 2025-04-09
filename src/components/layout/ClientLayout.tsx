'use client';

import { Web3Provider } from '@/components/providers/Web3Provider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Web3Provider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </Web3Provider>
  )
} 