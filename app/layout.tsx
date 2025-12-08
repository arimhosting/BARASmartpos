import { SpeedInsights } from "@vercel/speed-insights/next"
import React from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BARAsmartpos',
  description: 'Sistem Kasir (POS) modern bertenaga AI untuk UMKM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-gray-100 transition-colors duration-200 overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}
