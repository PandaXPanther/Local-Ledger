import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from './constants';

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// Next.js replaces the layout's openGraph/twitter objects wholesale when a page
// defines its own, so every page routes through this helper to get a complete
// social card (image, siteName, card type) instead of a partial override.
export function pageMeta({
  title,
  description,
  path,
  keywords,
  ogTitle,
  ogDescription,
  image = '/og-default.png',
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
}): Metadata {
  const shareTitle = ogTitle ?? `${title} | ${SITE_NAME}`;
  const shareDescription = ogDescription ?? description;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: shareTitle,
      description: shareDescription,
      url: absoluteUrl(path),
      images: [{ url: image, width: 1200, height: 630, alt: shareTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDescription,
      images: [image],
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function localLedgerDatasetJsonLd({
  name,
  description,
  url,
  temporalCoverage,
  variableMeasured,
  distribution,
}: {
  name: string;
  description: string;
  url: string;
  temporalCoverage?: string;
  variableMeasured: string[];
  distribution: Array<{ name: string; contentUrl: string; description?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: absoluteUrl(url),
    creator: { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: SITE_NAME },
    publisher: { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: SITE_NAME },
    license: 'https://www.usa.gov/government-copyright',
    isAccessibleForFree: true,
    temporalCoverage,
    variableMeasured,
    distribution: distribution.map(item => ({
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      name: item.name,
      description: item.description,
      contentUrl: absoluteUrl(item.contentUrl),
    })),
  };
}
