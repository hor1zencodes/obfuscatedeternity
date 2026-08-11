import type { Metadata } from 'next'
import { VT323, Outfit, Fira_Code } from 'next/font/google'
import './globals.css'

const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' })

export const viewport: import('next').Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Eternity',
  description: 'Eternity — Redefining execution. Lightning fast, undetectable, and built for absolute dominance.',
  openGraph: {
    title: 'Eternity',
    description: 'Eternity — Redefining execution. Lightning fast, undetectable, and built for absolute dominance.',
    url: 'https://zeneternity.vercel.app',
    type: 'website',
    images: [
      {
        url: 'https://zeneternity.vercel.app/eternity.png',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eternity',
    description: 'Eternity — Redefining execution. Lightning fast, undetectable, and built for absolute dominance.',
    images: ['https://zeneternity.vercel.app/eternity.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${vt323.variable} ${outfit.variable} ${firaCode.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
