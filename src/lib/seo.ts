import { SITE_NAME, SITE_URL } from './constants';

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
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
