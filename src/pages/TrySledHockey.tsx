import { Link } from 'react-router-dom';
import { FaHockeyPuck, FaCheckCircle } from 'react-icons/fa';
import ContentPageLayout, { ContentSection } from '../components/ContentPageLayout';

const firstSessionFacts = [
  { label: 'Cost', value: 'Free. There is no fee to try, and no fee to join afterwards.' },
  { label: 'Equipment', value: 'Provided. Sled, sticks, helmet, gloves and pads are fitted for you on the day.' },
  { label: 'Experience', value: 'None. Most players have never been on ice before their first session.' },
  { label: 'Who can try', value: 'Kids with physical disabilities, plus able-bodied siblings and friends.' },
  { label: 'Where', value: 'Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees Township, NJ 08043' },
  { label: 'Bring', value: "Warm clothes and a water bottle. That's it." },
];

const TrySledHockey = () => {
  return (
    <ContentPageLayout
      title="Try Sled Hockey — Free, No Experience Needed"
      intro="Get on the ice for the first time with coaches alongside you. We provide everything."
      icon={FaHockeyPuck}
    >
      <p className="text-lg text-gray-700 mb-10">
        You don't need to know anything about hockey to start. Wings of Steel runs free
        come-and-try sessions where a new player can get into a sled for the first time, with
        coaches beside them the whole way.
      </p>

      <ContentSection id="first-session" heading="What a First Session Looks Like">
        <dl className="bg-white rounded-lg shadow-md border border-steel-blue/20 divide-y divide-gray-100">
          {firstSessionFacts.map((fact) => (
            <div key={fact.label} className="flex flex-col sm:flex-row gap-1 sm:gap-4 px-5 py-4">
              <dt className="font-semibold text-dark-steel sm:w-40 flex-shrink-0">{fact.label}</dt>
              <dd className="text-gray-700">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </ContentSection>

      <ContentSection id="learn" heading="Learn to Play Sled Hockey">
        <p className="mb-4 text-gray-700">
          Sled hockey — also called sledge hockey or para ice hockey — lets players who can't
          skate standing up play the full game. You sit in a sled on two blades and use two
          short sticks: one end handles the puck, the other has metal picks to push yourself
          along the ice.
        </p>
        <p className="text-gray-700">
          New players usually spend a first session just learning to move, stop and turn. Nobody
          is expected to play a game on day one.
        </p>
      </ContentSection>

      <ContentSection id="travel" heading="Coming From Philadelphia or Elsewhere in the Region">
        <p className="text-gray-700">
          Flyers Skate Zone in Voorhees is roughly twenty minutes from Center City Philadelphia
          and draws players from across Camden, Gloucester and Burlington counties, as well as
          southeastern Pennsylvania and Delaware.
        </p>
      </ContentSection>

      <ContentSection id="reserve" heading="Reserve a Spot">
        <p className="mb-6 text-gray-700">
          Sessions run through the season and space in the sleds is limited, so get in touch
          before you come out.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/join-team"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-steel-blue hover:bg-steel-blue/80 text-white font-semibold rounded-lg transition-colors"
          >
            <FaCheckCircle aria-hidden="true" />
            Contact us about a session
          </Link>
          <Link
            to="/practice-schedule"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-steel-blue text-steel-blue hover:bg-steel-blue hover:text-white font-semibold rounded-lg transition-colors"
          >
            View practice schedule
          </Link>
        </div>
      </ContentSection>

      <ContentSection id="more" heading="Learn More First">
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>
            <Link to="/what-is-sled-hockey" className="text-steel-blue hover:underline">
              What is sled hockey?
            </Link>{' '}
            — the rules, the history and how the game is played
          </li>
          <li>
            <Link to="/sled-hockey-equipment-guide" className="text-steel-blue hover:underline">
              Equipment guide
            </Link>{' '}
            — what a sled, sticks and pads actually are
          </li>
          <li>
            <Link to="/adaptive-sports-south-jersey" className="text-steel-blue hover:underline">
              Adaptive sports in South Jersey
            </Link>{' '}
            — who can play, and other programs in the region
          </li>
        </ul>
      </ContentSection>
    </ContentPageLayout>
  );
};

export default TrySledHockey;
