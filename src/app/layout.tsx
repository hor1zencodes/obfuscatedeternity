import type { Metadata } from 'next'
import { VT323, Montserrat, Fira_Code, Poppins } from 'next/font/google'
import './globals.css'

const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' })
const poppins = Poppins({ weight: ['400','600','700','800','900'], subsets: ['latin'], variable: '--font-poppins' })

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

import SmoothScroll from '@/components/SmoothScroll'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${vt323.variable} ${montserrat.variable} ${firaCode.variable} ${poppins.variable}`}>
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
