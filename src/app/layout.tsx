import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlowEx - Decentralized Exchange',
  description: 'A decentralized exchange with Curve-style AMM implementation',
}

import dynamic from 'next/dynamic'

const ClientLayout = dynamic(() => import('../components/layout/ClientLayout'), {
  ssr: false
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
} 