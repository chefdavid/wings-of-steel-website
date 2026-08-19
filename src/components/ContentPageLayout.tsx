import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { IconType } from 'react-icons';

interface ContentPageLayoutProps {
  /** Page H1. Should match the `h1` for this route in scripts/prerender.mjs. */
  title: string;
  /** One-line summary under the H1. */
  intro: string;
  /** Icon shown beside the title in the header. */
  icon: IconType;
  children: ReactNode;
}

/**
 * Shared shell for the standalone SEO content pages (/try-sled-hockey,
 * /adaptive-sports-south-jersey, /sponsors).
 *
 * These three pages have a prerendered counterpart in scripts/prerender.mjs
 * that crawlers see before React hydrates. Keep the headings here roughly in
 * step with the prerendered copy — a crawler that gets served one set of
 * headings and a user who gets served another is the kind of mismatch Google
 * treats as cloaking.
 */
const ContentPageLayout = ({ title, intro, icon: Icon, children }: ContentPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-dark-steel text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/"
            className="text-ice-blue hover:underline mb-4 inline-block"
            aria-label="Return to home page"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <Icon className="text-4xl text-ice-blue flex-shrink-0" aria-hidden="true" />
            <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
          </div>
          <p className="text-lg md:text-xl text-ice-blue">{intro}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">{children}</main>

      <footer className="bg-dark-steel text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="mb-1">Wings of Steel Youth Sled Hockey — 501(c)(3) Nonprofit</p>
          <p className="text-ice-blue text-sm mb-3">
            Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees Township, NJ 08043
          </p>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            <Link to="/try-sled-hockey" className="text-ice-blue hover:underline">
              Try Sled Hockey
            </Link>
            <Link to="/join-team" className="text-ice-blue hover:underline">
              Join the Team
            </Link>
            <Link to="/practice-schedule" className="text-ice-blue hover:underline">
              Practice Schedule
            </Link>
            <Link to="/sponsors" className="text-ice-blue hover:underline">
              Sponsors
            </Link>
            <Link to="/donate" className="text-ice-blue hover:underline">
              Donate
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

/** Section wrapper with a consistently styled, properly associated heading. */
export const ContentSection = ({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) => (
  <section className="mb-12" aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`} className="text-2xl font-bold mb-4 text-dark-steel">
      {heading}
    </h2>
    {children}
  </section>
);

export default ContentPageLayout;
