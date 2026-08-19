import { Link } from 'react-router-dom';
import { FaUniversalAccess } from 'react-icons/fa';
import ContentPageLayout, { ContentSection } from '../components/ContentPageLayout';

const conditions = [
  'Cerebral palsy',
  'Spina bifida',
  'Spinal cord injuries',
  'Limb difference and amputation',
  'Muscular dystrophy and other neuromuscular conditions',
  'Other conditions affecting the legs, hips or balance',
];

const counties = [
  { name: 'Camden County', towns: 'Voorhees, Cherry Hill, Haddonfield, Sicklerville, Gloucester Township' },
  { name: 'Gloucester County', towns: 'Washington Township, Deptford, Mantua, Glassboro' },
  { name: 'Burlington County', towns: 'Marlton, Mount Laurel, Moorestown, Medford' },
  { name: 'Philadelphia & Delaware Valley', towns: 'Roughly 20 minutes from Center City' },
];

const AdaptiveSportsSouthJersey = () => {
  return (
    <ContentPageLayout
      title="Adaptive Sports in South Jersey"
      intro="Free youth sled hockey in Voorhees, NJ — plus where else to look in the region."
      icon={FaUniversalAccess}
    >
      <p className="text-lg text-gray-700 mb-10">
        If your child has a physical disability and you're looking for a sport they can actually
        play, you're in the right place. Wings of Steel is a free youth sled hockey program based
        in Voorhees, New Jersey, and part of a wider adaptive sports community across South Jersey
        and the Philadelphia region.
      </p>

      <ContentSection id="who" heading="Who Can Play">
        <p className="mb-4 text-gray-700">
          Adaptive sports are built around the athlete rather than the other way round. Players on
          our roster include kids with:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-700">
          {conditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>
        <p className="text-gray-700">
          If your child uses a wheelchair, walker, prosthesis or crutches — or tires too quickly to
          keep up in a standing sport — sled hockey works. Players sit in a sled, so skating on your
          feet is never part of it. Able-bodied siblings and friends play alongside them.
        </p>
      </ContentSection>

      <ContentSection id="areas" heading="Areas We Serve">
        <p className="mb-6 text-gray-700">
          We practice at Flyers Skate Zone in Voorhees Township. Players travel in from across the
          region:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {counties.map((county) => (
            <div
              key={county.name}
              className="bg-white rounded-lg shadow-md border border-steel-blue/20 p-5"
            >
              <h3 className="font-semibold text-dark-steel mb-1">{county.name}</h3>
              <p className="text-sm text-gray-600">{county.towns}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection id="cost" heading="What It Costs">
        <p className="text-gray-700">
          Nothing. Youth ice hockey normally runs families thousands of dollars a year once you
          count equipment, ice time and travel. Wings of Steel is a 501(c)(3) nonprofit and covers
          all of it, because no child should miss out on a team for money reasons.
        </p>
      </ContentSection>

      <ContentSection id="other-programs" heading="Other Adaptive Sports Programs in the Region">
        <p className="mb-4 text-gray-700">
          Sled hockey isn't the right fit for every child, and we'd rather you found the right sport
          than no sport. Other adaptive and inclusive programs serving South Jersey and Philadelphia
          families include:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Wheelchair basketball programs across the Delaware Valley</li>
          <li>Adaptive cycling and learn-to-ride camps</li>
          <li>Miracle League baseball in Camden County</li>
          <li>New Jersey Adaptive Recreation — community-based adaptive sports and therapeutic recreation</li>
          <li>The adaptive sports program at Children's Hospital of Philadelphia</li>
        </ul>
      </ContentSection>

      <ContentSection id="come-see" heading="Come and See">
        <p className="mb-6 text-gray-700">
          The easiest way to find out whether this is for your child is to come to a free
          come-and-try session. No commitment and no cost.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/try-sled-hockey"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-steel-blue hover:bg-steel-blue/80 text-white font-semibold rounded-lg transition-colors"
          >
            Try sled hockey free
          </Link>
          <Link
            to="/join-team"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-steel-blue text-steel-blue hover:bg-steel-blue hover:text-white font-semibold rounded-lg transition-colors"
          >
            Join the team
          </Link>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
};

export default AdaptiveSportsSouthJersey;
