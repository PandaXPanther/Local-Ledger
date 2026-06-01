import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getCounties, getMetros, getStates } from '@/lib/nationalData';

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
  '/counties/',
  '/metros/',
  '/rankings/best-local-economies/',
  '/rankings/fastest-growing-counties/',
  '/rankings/highest-income-counties/',
  '/rankings/most-affordable-college-states/',
  '/rankings/federal-spending-per-capita/',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const dynamicRoutes = [
    ...getStates().flatMap(state => [
      `/states/${state.slug}/`,
      `/states/${state.slug}/counties/`,
      `/states/${state.slug}/cities/`,
      `/states/${state.slug}/college-roi/`,
      `/states/${state.slug}/federal-spending/`,
      `/states/${state.slug}/recession-radar/`,
    ]),
    ...getCounties().map(county => `/counties/${county.stateSlug}/${county.slug}/`),
    ...getMetros().map(metro => `/metros/${metro.slug}/`),
  ];

  return [...routes, ...dynamicRoutes].map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route.startsWith('/colorado') ? 0.85 : 0.65,
  }));
}
