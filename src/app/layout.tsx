import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'LocalLedger | Public Economic Intelligence',
    template: '%s | LocalLedger',
  },
  description:
    'LocalLedger transforms official labor, income, housing, education, business, and public finance data into readable dashboards, scorecards, and economic briefs.',
  keywords: [
    'Colorado economy', 'economic data', 'public finance', 'labor statistics',
    'census data', 'economic dashboard', 'community economics',
  ],
  openGraph: {
    type: 'website',
    siteName: 'LocalLedger',
    title: 'LocalLedger | Public Economic Intelligence',
    description:
      'Official labor, income, housing, education, and public finance data for Colorado communities.',
    url: 'https://localledger.pages.dev',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'LocalLedger public economic intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalLedger | Public Economic Intelligence',
    description:
      'Official labor, income, housing, education, and public finance data for every community.',
    images: ['/og-default.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/logo-mark.svg', color: '#0f172a' }],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://localledger.pages.dev'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://localledger.pages.dev/#org',
        name: 'LocalLedger',
        url: 'https://localledger.pages.dev',
        founder: { '@id': 'https://localledger.pages.dev/about/#saras' },
        description:
          'Public economic intelligence dashboards built from official public economic data.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://localledger.pages.dev/#site',
        url: 'https://localledger.pages.dev',
        name: 'LocalLedger',
        publisher: { '@id': 'https://localledger.pages.dev/#org' },
        inLanguage: 'en-US',
      },
      {
        '@type': 'Person',
        '@id': 'https://localledger.pages.dev/about/#saras',
        name: 'Saras Totey',
        givenName: 'Saras',
        familyName: 'Totey',
        jobTitle: 'Founder, LocalLedger',
        url: 'https://localledger.pages.dev/about/',
        sameAs: [
          'https://econ.mom/#/founder',
          'https://econlever.org',
          'https://github.com/PandaXPanther',
          'https://thedividendcollective.com/saras-totey',
          'https://www.linkedin.com/in/saras-totey-64a777334/',
          'https://www.instagram.com/sarastotey_/',
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
