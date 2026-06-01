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
  },
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
