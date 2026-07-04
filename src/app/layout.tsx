import type { Metadata } from 'next'
import { VT323 } from 'next/font/google'
import './globals.css'

const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323' })

export const metadata: Metadata = {
  title: 'Eternity',
  description: 'Optimized for low-end PCs with fast, stable, and lightweight performance.',
  openGraph: {
    title: 'Eternity',
    description: 'Optimized for low-end PCs with fast, stable, and lightweight performance.',
    url: 'https://zeneternity.vercel.app',
    type: 'website',
    images: [
      {
        url: 'https://zeneternity.vercel.app/eternitylogo.png',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eternity',
    description: 'Optimized for low-end PCs with fast, stable, and lightweight performance.',
    images: ['https://zeneternity.vercel.app/eternitylogo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={vt323.variable}>
      <body>
        {children}
      </body>
    </html>
  )
}
