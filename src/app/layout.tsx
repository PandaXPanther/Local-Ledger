import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: 'Local Economy Data Dashboard | LocalLedger',
    template: '%s | LocalLedger',
  },
  description:
    'Free economic data dashboards for states, counties, metros, rankings, federal spending, income, jobs, housing, and college ROI. Plus an economy simulator you can play with.',
  keywords: [
    'local economy data', 'county economic indicators', 'state economic dashboard', 'public economic data',
    'federal spending per county', 'college ROI by state', 'Census economic data',
    'economy simulator', 'economics education',
  ],
  alternates: { canonical: '/' },
  authors: [{ name: 'Saras Totey', url: 'https://econ.mom' }],
  creator: 'Saras Totey',
  publisher: 'LocalLedger',
  category: 'education',
  openGraph: {
    type: 'website',
    siteName: 'LocalLedger',
    title: 'Local Economy Data Dashboard | LocalLedger',
    description:
      'Free public economic data for states, counties, metros, rankings, income, jobs, housing, college ROI, and federal spending.',
    url: SITE_URL,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'LocalLedger: local economic data dashboards',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local Economy Data Dashboard | LocalLedger',
    description:
      'Free public economic data for states, counties, metros, rankings, income, jobs, housing, college ROI, and federal spending.',
    images: ['/og-default.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/logo-mark.svg', color: '#23684A' }],
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
          'Free dashboards built from official public economic data, plus an interactive economy simulator for learning economics.',
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
        description:
          'High school student in Boulder, Colorado who builds free economics education tools and works as a Research Analyst Assistant at Northeastern University.',
        affiliation: [
          { '@type': 'EducationalOrganization', name: 'Fairview High School' },
          { '@type': 'CollegeOrUniversity', name: 'Northeastern University' },
          { '@type': 'Organization', name: 'The Dividend Collective', url: 'https://thedividendcollective.com' },
        ],
        knowsAbout: [
          'economics',
          'macroeconomic policy',
          'public economic data',
          'income inequality research',
          'economics education',
        ],
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
