import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: 'Economy Simulator and Local Economic Data | LocalLedger',
    template: '%s | LocalLedger',
  },
  description:
    'Free economics education platform: an interactive economy simulator with 41 policy dials and 12 historical scenarios, plus cited official economic data for every U.S. state, county, and metro.',
  keywords: [
    'economy simulator', 'economic policy simulator', 'economics education', 'interactive macroeconomics',
    'local economy data', 'county economic indicators', 'state economic dashboard', 'public economic data',
    'federal spending per county', 'college ROI by state', 'Census economic data',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'LocalLedger',
    title: 'Economy Simulator and Local Economic Data | LocalLedger',
    description:
      'Real economic data for every U.S. county, and an interactive economy you are allowed to destroy. Free, cited, built for economics education.',
    url: SITE_URL,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'LocalLedger: real economic data and an economy simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Economy Simulator and Local Economic Data | LocalLedger',
    description:
      'Real economic data for every U.S. county, and an interactive economy you are allowed to destroy. Free, cited, built for economics education.',
    images: ['/og-default.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/logo-mark.svg', color: '#E8540A' }],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(SITE_URL),
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
        '@id': `${SITE_URL}/#org`,
        name: 'LocalLedger',
        url: SITE_URL,
        founder: { '@id': `${SITE_URL}/about/#saras` },
        relatedLink: ['https://econ.mom'],
        subOrganization: { '@id': 'https://econ.mom/#organization' },
        description:
          'Free economics education platform: official public economic data for every U.S. state and county, plus an interactive macroeconomic policy simulator.',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#site`,
        url: SITE_URL,
        name: 'LocalLedger',
        publisher: { '@id': `${SITE_URL}/#org` },
        relatedLink: ['https://econ.mom'],
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': 'https://econ.mom/#organization',
        name: 'econ.mom',
        url: 'https://econ.mom',
        founder: { '@id': `${SITE_URL}/about/#saras` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/about/#saras`,
        name: 'Saras Totey',
        givenName: 'Saras',
        familyName: 'Totey',
        jobTitle: 'Founder, LocalLedger',
        url: 'https://econ.mom',
        mainEntityOfPage: `${SITE_URL}/about/`,
        sameAs: [
          'https://econ.mom',
          'https://econlever.org',
          'https://github.com/PandaXPanther',
          'https://thedividendcollective.com/saras-totey',
          'https://www.linkedin.com/in/saras-totey-64a777334/',
          'https://www.buymeacoffee.com/sarast1',
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
