import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

const routes = [
  '/',
  '/colorado/',
  '/colorado/denver/',
  '/colorado/boulder/',
  '/colorado/colorado-springs/',
  '/colorado/fort-collins/',
  '/colorado/aurora/',
  '/colorado/counties/',
  '/colorado/college-roi/',
  '/colorado/federal-spending/',
  '/colorado/recession-radar/',
  '/methodology/',
  '/sources/',
  '/api/',
  '/about/',
  '/states/',
  '/rankings/',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route.startsWith('/colorado') ? 0.85 : 0.65,
  }));
}
