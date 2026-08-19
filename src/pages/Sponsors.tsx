import { Link } from 'react-router-dom';
import { FaHandshake } from 'react-icons/fa';
import ContentPageLayout, { ContentSection } from '../components/ContentPageLayout';

/**
 * Equipment costs below are the figures already published on /donate and
 * /sled-hockey-equipment-guide. Keep them in step with those pages.
 *
 * TODO(team): recognition benefits per tier (jersey/banner/website placement,
 * event invitations) are deliberately not listed — those are promises only the
 * team can make. Add them, along with the EIN and a downloadable one-page
 * prospectus, once decided.
 */
const equipmentCosts = [
  { amount: '$120', buys: 'A helmet, gloves or shoulder pads for one player' },
  { amount: '$130', buys: 'A pair of sled hockey sticks' },
  { amount: '$800–$2,000', buys: 'A sled built and fitted to one athlete' },
  { amount: 'Season support', buys: 'Ice time at Flyers Skate Zone, coaching, and travel to national tournaments' },
];

const waysToSupport = [
  { title: 'Sponsor an athlete', detail: 'Fully equip one player for a season.' },
  { title: 'Team or season sponsorship', detail: 'Underwrite ice time, travel or coaching.' },
  { title: 'Event sponsorship', detail: 'Back one of our fundraisers, including the annual golf outing.' },
  { title: 'In-kind giving', detail: 'Equipment, services or professional expertise.' },
  {
    title: 'Matching gifts',
    detail: 'Many employers match charitable giving, which doubles the impact at no extra cost to you.',
  },
];

const Sponsors = () => {
  return (
    <ContentPageLayout
      title="Sponsor Wings of Steel"
      intro="Championship youth sled hockey in South Jersey, free to every player who skates for us."
      icon={FaHandshake}
    >
      <p className="text-lg text-gray-700 mb-10">
        Wings of Steel is a 501(c)(3) nonprofit youth sled hockey team in Voorhees, New Jersey, and
        the 2025 and 2026 USA Sled Hockey Champions. Every player skates for free. Sponsorship is
        what makes that promise possible.
      </p>

      <ContentSection id="why" heading="Why Sponsor Adaptive Sports">
        <p className="text-gray-700">
          Youth ice hockey costs a family thousands of dollars a year. For a child with a physical
          disability, adaptive equipment pushes that higher still — a single fitted sled runs $800
          to $2,000. Families of kids with disabilities are already carrying medical costs most
          households never see. Sponsorship removes the cost question entirely.
        </p>
      </ContentSection>

      <ContentSection id="buys" heading="What Your Sponsorship Buys">
        <p className="mb-6 text-gray-700">These are our actual equipment costs, not estimates:</p>
        <div className="bg-white rounded-lg shadow-md border border-steel-blue/20 divide-y divide-gray-100">
          {equipmentCosts.map((item) => (
            <div key={item.amount} className="flex flex-col sm:flex-row gap-1 sm:gap-6 px-5 py-4">
              <span className="font-bold text-steel-blue sm:w-40 flex-shrink-0 tabular-nums">
                {item.amount}
              </span>
              <span className="text-gray-700">{item.buys}</span>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection id="ways" heading="Ways to Support">
        <ul className="space-y-3">
          {waysToSupport.map((way) => (
            <li key={way.title} className="text-gray-700">
              <strong className="text-dark-steel">{way.title}</strong> — {way.detail}
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection id="tax" heading="Tax Deductibility">
        <p className="text-gray-700">
          Wings of Steel is a registered 501(c)(3) nonprofit organization, so contributions are
          tax-deductible to the extent allowed by law. We can provide documentation for your records
          and for corporate giving or grant review.
        </p>
      </ContentSection>

      <ContentSection id="contact" heading="Talk to Us">
        <p className="mb-6 text-gray-700">
          We're happy to put together something that fits what your business is trying to do,
          whether that's a single athlete or a whole season.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/donate"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-steel-blue hover:bg-steel-blue/80 text-white font-semibold rounded-lg transition-colors"
          >
            Make a donation now
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-steel-blue text-steel-blue hover:bg-steel-blue hover:text-white font-semibold rounded-lg transition-colors"
          >
            See our fundraising events
          </Link>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
};

export default Sponsors;
