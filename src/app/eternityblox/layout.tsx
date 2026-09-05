import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EternityBlox — Official Download | Eternity',
  description: 'Download EternityBlox, the premier next-gen Roblox execution and optimization client. Undetected, lightning-fast, and built for absolute dominance.',
  openGraph: {
    title: 'EternityBlox — Official Download',
    description: 'Download EternityBlox, the premier next-gen Roblox execution and optimization client. Undetected, lightning-fast, and built for absolute dominance.',
    url: 'https://zeneternity.vercel.app/eternityblox',
    type: 'website',
    images: [
      {
        url: 'https://zeneternity.vercel.app/eternityblox.png',
        width: 1000,
        height: 1000,
        alt: 'EternityBlox Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EternityBlox — Official Download',
    description: 'Download EternityBlox, the premier next-gen Roblox execution and optimization client. Undetected, lightning-fast, and built for absolute dominance.',
    images: ['https://zeneternity.vercel.app/eternityblox.png'],
  },
};

export default function EternityBloxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
