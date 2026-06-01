import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Saras Totey',
  description:
    'About Saras Totey, founder of LocalLedger and creator of free public economics tools including econ.mom and EconLever.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  const personJsonLd = {
    '@context': 'https://schema.org',
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
  };

  const aboutJsonLd = {
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
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <Hero
        tag="Founder"
        headline="Saras Totey"
        subheadline="Fairview High School student in Boulder, Colorado. Research Analyst Assistant at Northeastern University. Builder of econ.mom, EconLever, and LocalLedger."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">About the founder</h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Saras Totey is a student at Fairview High School in Boulder, Colorado, and a Research Analyst
            Assistant at Northeastern University, where he assists with research on the socioeconomic legacy
            of Reaganomics, specifically analyzing how the 1981 to 1989 reduction in top marginal rates and
            welfare retrenchment shaped post-tax income disparity.
          </p>
          <p className="text-text-secondary leading-relaxed">
            He also serves as Head Economics Researcher at{' '}
            <a
              href="https://thedividendcollective.com/saras-totey"
              target="_blank"
              rel="noopener"
              className="text-accent editorial-link"
            >
              The Dividend Collective
            </a>
            , a youth-led economics and policy research organization, while publishing his broader economics
            work through{' '}
            <a href="https://econ.mom" target="_blank" rel="noopener" className="text-accent editorial-link">
              econ.mom
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Economics work</h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            A 2x National Economics Challenge Qualifier and an International Economics Olympiad Winter
            Challenge Bronze Medalist, Saras is also a competitive extemporaneous speaker and a social-impact
            founder. He builds tools that translate dense economic research into accessible, decision-ready
            interfaces for students, debaters, and civic audiences.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The journey began with{' '}
            <a href="https://econlever.org" target="_blank" rel="noopener" className="text-accent editorial-link">
              EconLever
            </a>
            , a single-purpose calculator built to demystify the levers behind macroeconomic policy. Students
            used it. Debate teams cited it. Teachers shared it. But one tool was never going to be enough.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">The Mother of Econ</h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Saras kept building. The Mother of Econ is a collection of twelve purpose-built instruments for
            AP and policy economics. Each one answers a question that, until now, had no public answer, or
            whose answer was paywalled, stale, or wrong.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The Mother of Econ was built independently in a bedroom in Boulder with no team and no budget.
            The lessons from shipping it, including how to make a free tool feel serious and how to earn
            trust without a brand behind you, eventually became the foundation for{' '}
            <a href="https://attagency.co" target="_blank" rel="noopener" className="text-accent editorial-link">
              ATT Agency
            </a>
            , a Boulder, Colorado marketing and brand studio Saras went on to co-found.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">LocalLedger</h2>
          <p className="text-text-secondary leading-relaxed">
            LocalLedger continues the same idea for community economic intelligence: every tool is readable,
            every formula is shown, and every dataset is cited. If official data is not available, the site
            says &ldquo;Data unavailable&rdquo; instead of filling the gap with an estimate.
          </p>
        </section>

        <section>
          <div className="card p-5">
            <p className="text-text-secondary leading-relaxed italic">
              &ldquo;Si vis pacem, para statistica.&rdquo; Peace through numbers, not through pretending we have them.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Links</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: 'econ.mom',
                href: 'https://econ.mom',
                desc: 'Primary site and sister project for Saras Totey economics work.',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/saras-totey-64a777334/',
                desc: 'Founder profile and professional background.',
              },
              {
                label: 'Buy Me a Coffee',
                href: 'https://www.buymeacoffee.com/sarast1',
                desc: 'Support Saras Totey and independent economics tools.',
              },
              {
                label: 'EconLever',
                href: 'https://econlever.org',
                desc: 'Macroeconomic policy lever calculator.',
              },
              {
                label: 'The Dividend Collective',
                href: 'https://thedividendcollective.com/saras-totey',
                desc: 'Youth-led economics and policy research profile.',
              },
            ].map(link => (
              <li key={link.href} className="card p-4">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  className="font-semibold text-accent editorial-link"
                >
                  {link.label}
                </a>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{link.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex gap-4">
          <Link href="/methodology/" className="btn-primary">View Methodology</Link>
          <Link href="/sources/" className="btn-secondary">Data Sources</Link>
        </div>
      </div>
    </>
  );
}
