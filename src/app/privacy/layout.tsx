import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Eternity',
  description: 'Understand how Eternity handles telemetry, coarse geographic analytics, and session data with complete transparency.',
  openGraph: {
    title: 'Privacy Policy | Eternity',
    description: 'Understand how Eternity handles telemetry, coarse geographic analytics, and session data with complete transparency.',
    url: 'https://zeneternity.vercel.app/privacy',
    images: ['https://zeneternity.vercel.app/eternity.png'],
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
