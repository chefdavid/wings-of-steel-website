#!/usr/bin/env node
/**
 * SEO Pre-render Script for Wings of Steel
 * 
 * Generates route-specific HTML files from the Vite build output.
 * Each route gets its own index.html with:
 *   - Unique <title> and <meta description>
 *   - Canonical URL
 *   - Open Graph + Twitter Card meta
 *   - Meaningful <noscript> content for crawlers
 *   - The full SPA JS bundle (React hydrates normally)
 * 
 * This approach doesn't need Puppeteer or a running app — it works
 * by cloning the built index.html and customizing per route.
 * 
 * Usage: node scripts/prerender.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');

// Route definitions with SEO metadata and noscript content
const ROUTES = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly',
    title: 'Wings of Steel - Youth Sled Hockey | No Child Pays to Play',
    description: 'Wings of Steel Youth Sled Hockey — Championship team making hockey accessible to all children. No child pays to play. 2025 & 2026 USA Champions. Voorhees, NJ.',
    h1: 'Wings of Steel Youth Sled Hockey',
    // Each question below appears on exactly ONE page across the whole site.
    // See the FAQ_SCHEMA_SLOT comment in index.html for why.
    faq: [
      {
        q: 'How much does it cost to play sled hockey with Wings of Steel?',
        a: 'Wings of Steel is completely free for all players. As a 501(c)(3) nonprofit, we provide all equipment including sleds, sticks, helmets, pads, and jerseys at no cost to families. No child pays to play.',
      },
      {
        q: 'Where does Wings of Steel practice?',
        a: 'Wings of Steel practices at Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees Township, NJ 08043. Practices are held on Thursdays from 6:10 PM to 7:10 PM.',
      },
      {
        q: 'Do I need experience to join a sled hockey team?',
        a: 'No experience is needed to join Wings of Steel. We welcome players of all abilities and experience levels. Our coaches teach everything from basic sled movement to advanced game skills.',
      },
    ],
    content: `
      <p>Wings of Steel is a championship youth sled hockey team based at Flyers Skate Zone in Voorhees, NJ. 
      We are the 2025 and 2026 USA Sled Hockey Champions.</p>
      <p><strong>No child pays to play.</strong> Every child deserves the chance to play hockey regardless of 
      financial ability or physical disability.</p>
      <h2>About Sled Hockey</h2>
      <p>Sled hockey (also called sledge hockey) is an adaptive form of ice hockey for players with physical 
      disabilities. Players sit in specially designed sleds and use two short sticks to propel themselves and 
      handle the puck.</p>
      <h2>Practice Schedule</h2>
      <p>Thursdays 6:10-7:10 PM at Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees Township, NJ 08043.</p>
      <h2>Get Involved</h2>
      <ul>
        <li><a href="/join-team">Join the Team</a> — No experience needed, all abilities welcome</li>
        <li><a href="/donate">Make a Donation</a> — 100% goes to keeping hockey free for kids</li>
        <li><a href="/events">Events</a> — Fundraisers and community events</li>
      </ul>
    `,
  },
  {
    path: '/donate',
    title: 'Donate to Wings of Steel | Support Youth Sled Hockey',
    description: 'Support Wings of Steel youth sled hockey. 100% of donations go to ensuring no child pays to play. Tax-deductible 501(c)(3) contributions.',
    h1: 'Donate to Wings of Steel',
    content: `
      <p>Wings of Steel is a 501(c)(3) nonprofit organization. Your tax-deductible donation helps ensure 
      that no child pays to play sled hockey.</p>
      <h2>Where Your Money Goes</h2>
      <ul>
        <li>Equipment — Sleds, sticks, helmets, and protective gear</li>
        <li>Ice Time — Practice and game ice rental at Flyers Skate Zone</li>
        <li>Travel — Tournament travel for games across the country</li>
        <li>Player Development — Coaching and training programs</li>
      </ul>
      <p>Every dollar makes a difference. <a href="/">Learn more about Wings of Steel</a>.</p>
    `,
  },
  {
    path: '/join-team',
    title: 'Join Wings of Steel | Youth Sled Hockey Registration',
    description: 'Join Wings of Steel youth sled hockey team in Voorhees, NJ. No experience needed. No cost to families. All abilities welcome.',
    h1: 'Join Wings of Steel',
    content: `
      <p>Interested in playing sled hockey? Wings of Steel welcomes players of all abilities and experience levels.</p>
      <h2>What You Need to Know</h2>
      <ul>
        <li><strong>Cost:</strong> Free. No child pays to play.</li>
        <li><strong>Experience:</strong> None required. We teach everything from scratch.</li>
        <li><strong>Equipment:</strong> Provided by the team.</li>
        <li><strong>Location:</strong> Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees, NJ 08043</li>
        <li><strong>Practice:</strong> Thursdays 6:10-7:10 PM</li>
      </ul>
      <p><a href="/practice-schedule">View full practice schedule</a> | <a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/store',
    title: 'Wings Store Refresh | Wings of Steel',
    description: 'The Wings of Steel team store is being refreshed. Donations remain the best way to support equipment, ice time, travel, and tournament costs.',
    h1: 'Wings Store Refresh',
    content: `
      <p>The Wings of Steel merchandise lineup is currently being updated.</p>
      <p>In the meantime, donations are the best way to support equipment, ice time, travel, and tournament costs while ensuring no child pays to play.</p>
      <p><a href="/donate">Make a donation</a> | <a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/practice-schedule',
    title: 'Practice Schedule | Wings of Steel Sled Hockey',
    description: 'Wings of Steel practice schedule at Flyers Skate Zone, Voorhees, NJ. Thursdays 6:10-7:10 PM. Open to all youth players.',
    h1: 'Practice Schedule',
    content: `
      <p>Wings of Steel practices at Flyers Skate Zone in Voorhees, NJ.</p>
      <h2>Regular Practice</h2>
      <p><strong>Day:</strong> Thursday<br>
      <strong>Time:</strong> 6:10 PM - 7:10 PM<br>
      <strong>Location:</strong> Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees Township, NJ 08043</p>
      <p>All equipment is provided. New players are welcome at any practice.</p>
      <p><a href="/join-team">Join the team</a> | <a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/events',
    title: 'Events | Wings of Steel Sled Hockey',
    description: 'Upcoming Wings of Steel events, fundraisers, and games. Golf outings, community events, and more.',
    h1: 'Events',
    content: `
      <p>Wings of Steel hosts fundraising events throughout the year to support the team and keep 
      hockey free for all children.</p>
      <p><a href="/donate">Make a donation</a> | <a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/opponents',
    title: 'Opponent Teams | Wings of Steel Sled Hockey',
    description: 'Wings of Steel opponent teams directory. Sled hockey teams across the region and nationally.',
    h1: 'Opponent Teams',
    content: `
      <p>Wings of Steel competes against sled hockey teams across the United States. As the 2025 and 2026 
      USA Champions, we face top competition from teams nationwide.</p>
      <p><a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/gallery',
    title: 'Photo Gallery | Wings of Steel Sled Hockey',
    description: 'Photos and media from Wings of Steel youth sled hockey games, practices, and events.',
    h1: 'Photo Gallery',
    content: `
      <p>Photos from Wings of Steel games, practices, and events. See our players in action on the ice.</p>
      <p><a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/game-highlights',
    title: 'Game Highlights | Wings of Steel Sled Hockey',
    description: 'Game highlights and recaps from Wings of Steel youth sled hockey. Watch our champions in action.',
    h1: 'Game Highlights',
    content: `
      <p>Game highlights and recaps from Wings of Steel youth sled hockey. Relive the best moments 
      from our championship seasons.</p>
      <p><a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/stats',
    title: 'Team Stats | Wings of Steel Youth Sled Hockey',
    description: 'Season-by-season stats for Wings of Steel youth sled hockey: team record, scoring leaders, goaltending and head-to-head results.',
    h1: 'Team Stats',
    content: `
      <p>Season stats for Wings of Steel youth sled hockey — team record, scoring
      leaders, goaltending numbers and head-to-head results against every opponent.</p>
      <p><a href="/game-highlights">Game highlights</a> · <a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/accessibility',
    title: 'Accessibility Statement | Wings of Steel',
    description: 'Wings of Steel website accessibility statement. Committed to making our site accessible to all users.',
    h1: 'Accessibility Statement',
    content: `
      <p>Wings of Steel is committed to making our website accessible to all users, including those
      with disabilities. Our mission of inclusion extends to our digital presence.</p>
      <p><a href="/">Back to home</a></p>
    `,
  },
  {
    path: '/what-is-sled-hockey',
    title: 'What Is Sled Hockey? Complete Guide to Adaptive Ice Hockey',
    description: 'Learn what sled hockey is, the rules, equipment, history, and how it connects to the Paralympics. Comprehensive guide to sledge hockey / adaptive ice hockey.',
    h1: 'What Is Sled Hockey?',
    priority: '0.8',
    faq: [
      {
        q: 'What is sled hockey?',
        a: 'Sled hockey (also called sledge hockey) is an adaptive form of ice hockey designed for players with physical disabilities. Players sit in specially designed sleds mounted on two hockey skate blades and use two short sticks — one end has a blade for shooting and passing, the other has metal picks for propelling across the ice.',
      },
      {
        q: 'Is sled hockey a Paralympic sport?',
        a: 'Yes. Known internationally as para ice hockey, it has been a Paralympic sport since the 1994 Winter Paralympics in Lillehammer, Norway, and is one of the fastest and most popular events at the Winter Paralympics.',
      },
      {
        q: 'What is the difference between sled hockey, sledge hockey and para ice hockey?',
        a: 'They are the same sport under three names. "Sled hockey" is the common term in the United States, "sledge hockey" is used in Canada and was the original name, and "para ice hockey" is the official name used by the International Paralympic Committee.',
      },
      {
        q: 'What are the rules of sled hockey?',
        a: 'The rules closely mirror standard ice hockey: three periods, the same rink dimensions and goals, and the same offside and icing rules. The differences are in the equipment and in how players move, since every player is seated in a sled.',
      },
    ],
    content: `
      <p>Sled hockey (also called sledge hockey) is an adaptive form of ice hockey designed for players
      with physical disabilities affecting the lower body. Players sit in specially designed sleds mounted
      on two hockey skate blades and use two short sticks to propel themselves and handle the puck.</p>
      <h2>History of Sled Hockey</h2>
      <p>Sled hockey was invented in the early 1960s in Stockholm, Sweden, at a rehabilitation center.
      It has been a Paralympic sport since the 1994 Winter Games in Lillehammer, Norway.</p>
      <h2>Rules & Gameplay</h2>
      <p>The rules closely mirror standard ice hockey: three periods of 15 minutes, same rink dimensions,
      same goals, offsides, and icing. The main difference is the equipment and mode of movement.</p>
      <h2>Who Plays Sled Hockey?</h2>
      <p>Sled hockey is for people with physical disabilities affecting the lower body, including spinal cord
      injuries, amputations, cerebral palsy, and more. Many programs also welcome able-bodied players.</p>
      <p><a href="/join-team">Join Wings of Steel</a> | <a href="/donate">Support our team</a> |
      <a href="/sled-hockey-nj">Play in New Jersey</a></p>
    `,
  },
  {
    path: '/sled-hockey-nj',
    title: 'Sled Hockey in New Jersey | Wings of Steel - Voorhees, NJ',
    description: 'Play sled hockey in New Jersey with Wings of Steel at Flyers Skate Zone in Voorhees, NJ. Free youth sled hockey — Thursdays 6:10-7:10 PM. All equipment provided.',
    h1: 'Sled Hockey in New Jersey',
    content: `
      <p>Wings of Steel is New Jersey's premier youth sled hockey team, based at Flyers Skate Zone
      in Voorhees, NJ. We are the 2025 and 2026 USA Sled Hockey Champions.</p>
      <h2>Practice Location & Schedule</h2>
      <p><strong>Location:</strong> Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees, NJ 08043</p>
      <p><strong>Schedule:</strong> Thursdays 6:10-7:10 PM</p>
      <h2>What to Expect</h2>
      <p>All equipment is provided free of charge. No experience needed. Show up 15 minutes early
      for your first practice.</p>
      <p><a href="/join-team">Join the team</a> | <a href="/what-is-sled-hockey">What is sled hockey?</a> |
      <a href="/donate">Support us</a></p>
    `,
  },
  {
    path: '/sled-hockey-teams',
    title: 'Sled Hockey Teams in the USA | Complete Team Directory',
    description: 'Directory of sled hockey teams across the United States organized by region. Find a sled hockey team near you — Northeast, Southeast, Midwest, and West.',
    h1: 'Sled Hockey Teams in the USA',
    content: `
      <p>Sled hockey is growing across the United States, with teams in nearly every region. Many NHL franchises
      sponsor sled hockey programs through USA Hockey's disabled hockey program.</p>
      <h2>Northeast Teams</h2>
      <p>Wings of Steel (Voorhees, NJ), Philadelphia Flyers Sled Hockey, New York Rangers Sled Hockey,
      Northeast Passage Wildcats, Boston Sled Hockey, Pittsburgh Mighty Penguins, and more.</p>
      <h2>Midwest Teams</h2>
      <p>Chicago Blackhawks Sled Hockey, Minnesota Wild Sled Hockey, Detroit Sled Wings,
      St. Louis Blues Sled Hockey, Columbus Blue Jackets Sled Hockey.</p>
      <p><a href="/join-team">Join Wings of Steel</a> | <a href="/what-is-sled-hockey">About sled hockey</a></p>
    `,
  },
  {
    path: '/free-youth-hockey',
    title: 'Free Youth Hockey | Wings of Steel - No Child Pays to Play',
    description: 'Wings of Steel provides free youth sled hockey in NJ. All equipment, ice time, and travel included at no cost. Learn how we remove financial barriers from youth sports.',
    h1: 'Free Youth Hockey — No Child Pays to Play',
    content: `
      <p>Youth ice hockey costs families $2,000-5,000+ per year. Wings of Steel removes every financial barrier
      so that no child misses out on the life-changing experience of team sports.</p>
      <h2>What We Cover</h2>
      <ul>
        <li>Adaptive sleds ($800-2,000 each)</li>
        <li>Sticks, helmets, gloves, pads, jerseys</li>
        <li>Ice time at Flyers Skate Zone</li>
        <li>Travel to tournaments including nationals</li>
        <li>Coaching and player development</li>
      </ul>
      <p>We are a 501(c)(3) nonprofit. 100% of donations go directly to our players.</p>
      <p><a href="/donate">Make a donation</a> | <a href="/join-team">Join the team</a></p>
    `,
  },
  {
    path: '/sled-hockey-equipment-guide',
    title: 'Sled Hockey Equipment Guide | Sleds, Sticks & Protective Gear',
    description: 'Complete guide to sled hockey equipment: sleds, sticks, helmets, gloves, and protective gear. Learn what you need and what Wings of Steel provides for free.',
    h1: 'Sled Hockey Equipment Guide',
    faq: [
      {
        q: 'How much does a hockey sled cost?',
        a: 'A sled hockey sled typically costs between $800 and $2,000 depending on whether it is an entry-level or a custom competition sled fitted to the athlete. Wings of Steel provides fitted sleds to its players at no cost.',
      },
      {
        q: 'Why do sled hockey players use two sticks?',
        a: 'Each player carries two short sticks. One end of each stick has a blade for shooting and passing; the other end has metal picks that bite into the ice so the player can propel and steer the sled. A pair typically costs $50 to $130.',
      },
    ],
    content: `
      <p>Sled hockey requires specialized adaptive equipment. This guide covers everything you need to know
      about sleds, sticks, helmets, and protective gear.</p>
      <h2>The Sled</h2>
      <p>Players sit in a bucket-style seat mounted on a frame with two hockey skate blades underneath.
      The seat height allows the puck to pass beneath. Cost: $800-2,000.</p>
      <h2>Sticks</h2>
      <p>Each player uses TWO short sticks. One end has a blade for shooting and passing; the other end
      has metal picks for propulsion on the ice. Cost: $50-130 per pair.</p>
      <h2>What Wings of Steel Provides</h2>
      <p>All equipment is provided free to our players, including sleds fitted to each player, sticks,
      helmets, gloves, pads, and jerseys.</p>
      <p><a href="/join-team">Join the team</a> | <a href="/what-is-sled-hockey">What is sled hockey?</a> |
      <a href="/donate">Support us</a></p>
    `,
  },
  {
    // Recruiting page. "Try Sled Hockey" is a real recurring event the team
    // runs to bring new players in, and until now it had no URL at all — the
    // path 404'd (as a soft 404, so it silently served the homepage).
    //
    // TODO(team): once session dates are confirmed, add schema.org Event
    // markup here — one Event per dated session, with startDate, location and
    // the registration URL. That's what puts the sessions into Google's
    // "Events near me" panel, which no other sled programme in the region is
    // currently claiming. Deliberately not adding placeholder dates: invented
    // event data is worse than none.
    path: '/try-sled-hockey',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Try Sled Hockey Free | Come-and-Try Sessions in South Jersey',
    description: 'Try sled hockey free with Wings of Steel in Voorhees, NJ. No experience, no equipment and no cost needed — we provide everything. Open to kids with and without disabilities.',
    h1: 'Try Sled Hockey — Free, No Experience Needed',
    faq: [
      {
        q: 'Do I need my own equipment to try sled hockey?',
        a: 'No. Wings of Steel provides everything for a come-and-try session — the sled, both sticks, helmet, gloves and pads, all fitted on the day. Bring warm clothes and a water bottle.',
      },
      {
        q: 'Can able-bodied kids play sled hockey?',
        a: 'Yes. Siblings and friends without disabilities are welcome to get in a sled and play alongside our athletes. Everyone plays the same way, seated in a sled.',
      },
      {
        q: 'Does it cost anything to try sled hockey with Wings of Steel?',
        a: 'No. Come-and-try sessions are free, and there is no fee to join the team afterwards either. Wings of Steel is a 501(c)(3) nonprofit and covers equipment, ice time and travel.',
      },
    ],
    content: `
      <p>You don't need to know anything about hockey to start. Wings of Steel runs free
      come-and-try sessions where a new player can get on the ice in a sled for the first
      time, with coaches alongside them the whole way.</p>
      <h2>What a First Session Looks Like</h2>
      <ul>
        <li><strong>Cost:</strong> Free. There is no fee to try, and no fee to join afterwards.</li>
        <li><strong>Equipment:</strong> Provided. Sled, sticks, helmet, gloves and pads are all fitted for you on the day.</li>
        <li><strong>Experience:</strong> None. Most players have never been on ice before their first session.</li>
        <li><strong>Who can try:</strong> Kids with physical disabilities, and able-bodied siblings and friends too.</li>
        <li><strong>Where:</strong> Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees Township, NJ 08043</li>
        <li><strong>Bring:</strong> Warm clothes and a water bottle. That's it.</li>
      </ul>
      <h2>Learn to Play Sled Hockey</h2>
      <p>Sled hockey — also called sledge hockey or para ice hockey — lets players who can't
      skate standing up play the full game. You sit in a sled on two blades and use two short
      sticks, one end for the puck and the other with picks to push yourself along the ice.
      New players usually spend a first session just learning to move, stop and turn.</p>
      <h2>Coming From Philadelphia or Elsewhere in the Region</h2>
      <p>Flyers Skate Zone in Voorhees is roughly twenty minutes from Center City Philadelphia
      and draws players from across Camden, Gloucester and Burlington counties as well as
      southeastern Pennsylvania and Delaware.</p>
      <h2>Reserve a Spot</h2>
      <p>Sessions run through the season and space in the sleds is limited, so get in touch
      before you come out.</p>
      <p><a href="/join-team">Contact us about a session</a> ·
      <a href="/practice-schedule">Practice schedule</a> ·
      <a href="/what-is-sled-hockey">What is sled hockey?</a> ·
      <a href="/sled-hockey-equipment-guide">Equipment guide</a></p>
    `,
  },
  {
    // Regional hub. Parents of newly disabled kids search their child's
    // diagnosis or "adaptive sports", not "sled hockey" — they don't yet know
    // the sport exists. This page exists to catch that search and is modelled
    // on the regional-page pattern the Challenged Athletes Foundation uses.
    path: '/adaptive-sports-south-jersey',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Adaptive Sports in South Jersey | Wings of Steel',
    description: 'Adaptive sports for kids with disabilities in South Jersey. Free youth sled hockey in Voorhees, NJ serving Camden, Gloucester and Burlington counties — plus other adaptive programs in the region.',
    h1: 'Adaptive Sports in South Jersey',
    faq: [
      {
        q: 'What disabilities can play sled hockey?',
        a: 'Sled hockey suits players with physical disabilities affecting the lower body, including cerebral palsy, spina bifida, spinal cord injuries, limb difference and amputation, and neuromuscular conditions such as muscular dystrophy. Because every player is seated in a sled, standing and skating on your feet is never part of the sport.',
      },
      {
        q: 'What areas of South Jersey does Wings of Steel serve?',
        a: 'We practice at Flyers Skate Zone in Voorhees Township and draw players from across Camden, Gloucester and Burlington counties, as well as Philadelphia and the wider Delaware Valley. Nearby towns include Cherry Hill, Marlton, Mount Laurel, Haddonfield, Washington Township, Sicklerville and Moorestown.',
      },
      {
        q: 'Are there adaptive sports for kids near Philadelphia?',
        a: 'Yes. Wings of Steel is roughly twenty minutes from Center City Philadelphia. Other adaptive options in the region include wheelchair basketball, adaptive cycling programs, Miracle League baseball in Camden County, New Jersey Adaptive Recreation, and the adaptive sports program at Children’s Hospital of Philadelphia.',
      },
    ],
    content: `
      <p>If your child has a physical disability and you're looking for a sport they can
      actually play, you're in the right place. Wings of Steel is a free youth sled hockey
      programme based in Voorhees, New Jersey, and we're part of a wider adaptive sports
      community across South Jersey and the Philadelphia region.</p>
      <h2>Who Can Play</h2>
      <p>Adaptive sports are built around the athlete rather than the other way round. Players
      on our roster include kids with:</p>
      <ul>
        <li>Cerebral palsy</li>
        <li>Spina bifida</li>
        <li>Spinal cord injuries</li>
        <li>Limb difference and amputation</li>
        <li>Muscular dystrophy and other neuromuscular conditions</li>
        <li>Other conditions affecting the legs, hips or balance</li>
      </ul>
      <p>If your child uses a wheelchair, walker, prosthesis or crutches — or tires too quickly
      to keep up in a standing sport — sled hockey works. Players sit in a sled, so skating on
      your feet is never part of it. Able-bodied siblings and friends play alongside them.</p>
      <h2>Areas We Serve</h2>
      <p>We practise at Flyers Skate Zone in Voorhees Township and players travel in from
      across Camden County, Gloucester County and Burlington County, along with Philadelphia
      and the surrounding Delaware Valley. Nearby towns include Cherry Hill, Marlton, Mount
      Laurel, Haddonfield, Washington Township, Sicklerville and Moorestown.</p>
      <h2>What It Costs</h2>
      <p>Nothing. Youth ice hockey normally runs families thousands of dollars a year once you
      count equipment, ice time and travel. Wings of Steel is a 501(c)(3) nonprofit and covers
      all of it, because no child should miss out on a team for money reasons.</p>
      <h2>Other Adaptive Sports Programs in the Region</h2>
      <p>Sled hockey isn't the right fit for every child, and we'd rather you found the right
      sport than no sport. Other adaptive and inclusive programs serving South Jersey and
      Philadelphia families include wheelchair basketball, adaptive cycling programs, the
      Miracle League baseball fields in Camden County, adaptive recreation through New Jersey
      Adaptive Recreation, and the adaptive sports program at Children's Hospital of
      Philadelphia.</p>
      <h2>Come and See</h2>
      <p>The easiest way to find out whether this is for your child is to come to a free
      come-and-try session. No commitment and no cost.</p>
      <p><a href="/try-sled-hockey">Try sled hockey free</a> ·
      <a href="/join-team">Join the team</a> ·
      <a href="/what-is-sled-hockey">What is sled hockey?</a> ·
      <a href="/sled-hockey-nj">Sled hockey in New Jersey</a></p>
    `,
  },
  {
    // Sponsor-facing page. /donate serves individual givers; nothing on the
    // site addressed a business.
    //
    // TODO(team): fill in (a) the EIN, (b) recognition benefits per tier —
    // jersey/banner/website placement, event invitations, and so on — and
    // (c) a downloadable one-page prospectus PDF. The dollar figures below are
    // the real published equipment costs from /donate and
    // /sled-hockey-equipment-guide, but the benefits attached to each tier are
    // a promise only the team can make, so none are stated here yet.
    path: '/sponsors',
    priority: '0.9',
    changefreq: 'monthly',
    title: 'Sponsor Wings of Steel | Youth Sled Hockey Sponsorship',
    description: 'Sponsor a South Jersey youth sled hockey team. Wings of Steel is a 501(c)(3) nonprofit — corporate sponsorship keeps adaptive sports free for kids with disabilities in Voorhees, NJ.',
    h1: 'Sponsor Wings of Steel',
    faq: [
      {
        q: 'Are sponsorships of Wings of Steel tax-deductible?',
        a: 'Wings of Steel is a registered 501(c)(3) nonprofit organization, so contributions are tax-deductible to the extent allowed by law. We can provide documentation for your records and for corporate giving or grant review.',
      },
      {
        q: 'What does a youth sled hockey sponsorship pay for?',
        a: 'Sponsorship covers adaptive equipment and the cost of running a season: $120 buys a helmet, gloves or shoulder pads for one player, $130 buys a pair of sled hockey sticks, and $800 to $2,000 builds a sled fitted to one athlete. Season support covers ice time at Flyers Skate Zone, coaching, and travel to national tournaments.',
      },
      {
        q: 'How can a business support adaptive sports in South Jersey?',
        a: 'Businesses can sponsor an individual athlete, underwrite ice time or travel for the season, back a fundraising event such as the annual golf outing, or give in kind with equipment, services or professional expertise. Many employers also match charitable giving, which doubles the impact at no extra cost.',
      },
    ],
    content: `
      <p>Wings of Steel is a 501(c)(3) nonprofit youth sled hockey team in Voorhees, New Jersey,
      and the 2025 and 2026 USA Sled Hockey Champions. Every player skates for free. Sponsorship
      is what makes that promise possible.</p>
      <h2>Why Sponsor Adaptive Sports</h2>
      <p>Youth ice hockey costs a family thousands of dollars a year. For a child with a physical
      disability, adaptive equipment pushes that higher still — a single fitted sled runs
      $800 to $2,000. Families of kids with disabilities are already carrying medical costs that
      most households never see. Sponsorship removes the cost question entirely.</p>
      <h2>What Your Sponsorship Buys</h2>
      <p>These are our actual equipment costs, not estimates:</p>
      <ul>
        <li><strong>$120</strong> — a helmet, gloves or shoulder pads for one player</li>
        <li><strong>$130</strong> — a pair of sled hockey sticks</li>
        <li><strong>$800–$2,000</strong> — a sled built and fitted to one athlete</li>
        <li><strong>Season support</strong> — ice time at Flyers Skate Zone, coaching, and travel to national tournaments</li>
      </ul>
      <h2>Ways to Support</h2>
      <ul>
        <li><strong>Sponsor an athlete</strong> — fully equip one player for a season</li>
        <li><strong>Team or season sponsorship</strong> — underwrite ice time, travel or coaching</li>
        <li><strong>Event sponsorship</strong> — back one of our fundraisers, including the annual golf outing</li>
        <li><strong>In-kind giving</strong> — equipment, services or professional expertise</li>
        <li><strong>Matching gifts</strong> — many employers match charitable giving, which doubles the impact at no extra cost to you</li>
      </ul>
      <h2>Tax Deductibility</h2>
      <p>Wings of Steel is a registered 501(c)(3) nonprofit organization, so contributions are
      tax-deductible to the extent allowed by law. We can provide documentation for your
      records and for corporate giving or grant review.</p>
      <h2>Talk to Us</h2>
      <p>We're happy to put together something that fits what your business is trying to do,
      whether that's a single athlete or a season.</p>
      <p><a href="/donate">Make a donation now</a> ·
      <a href="/events">See our fundraising events</a> ·
      <a href="/adaptive-sports-south-jersey">About adaptive sports in South Jersey</a></p>
    `,
  },
  {
    // Written to dist/404.html rather than dist/404/index.html. Netlify serves
    // this file, with a real 404 status, for any path the redirect rules in
    // netlify.toml don't claim. Before this existed the blanket "/* ->
    // /index.html 200" rule answered every bad URL with a 200 and a copy of the
    // homepage, which Search Console reports as a soft 404 and which turns
    // every typo'd link into another duplicate of the front page.
    path: '/404',
    outputFile: '404.html',
    noindex: true,
    title: 'Page Not Found | Wings of Steel Youth Sled Hockey',
    description: 'That page could not be found. Find Wings of Steel practice times, how to join the team, and ways to support youth sled hockey in Voorhees, NJ.',
    h1: 'That page has moved or never existed',
    content: `
      <p>Sorry — we couldn't find that page. Here's where most people are headed:</p>
      <ul>
        <li><a href="/try-sled-hockey">Try Sled Hockey</a> — free come-and-try sessions, no experience needed</li>
        <li><a href="/join-team">Join the Team</a> — registration and what to expect</li>
        <li><a href="/practice-schedule">Practice Schedule</a> — Thursdays at Flyers Skate Zone</li>
        <li><a href="/donate">Donate</a> — keep hockey free for every player</li>
        <li><a href="/sponsors">Sponsor the Team</a> — partnership tiers for local businesses</li>
        <li><a href="/">Home</a></li>
      </ul>
    `,
  },
];

/**
 * Generate a route-specific HTML file from the base template
 */
function generateRouteHTML(baseHTML, route) {
  let html = baseHTML;
  // Canonical URLs MUST carry a trailing slash.
  //
  // Each route below is written to dist/<route>/index.html, so Netlify serves
  // it at "/donate/" and 301-redirects "/donate" -> "/donate/". Emitting the
  // slashless form here pointed every canonical at a URL that redirects, so the
  // sitemap, the canonical tag and the server each named a different address
  // for the same page. Aligning to the slash — the form the server actually
  // settles on — removes the redirect hop. public/sitemap.xml must match.
  const canonical = `https://wingsofsteel.org${route.path === '/' ? '/' : `${route.path}/`}`;

  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${route.title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${route.description}">`
  );

  // Update OG tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${canonical}">`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${route.title}">`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${route.description}">`
  );

  // Update Twitter tags
  html = html.replace(
    /<meta property="twitter:url" content="[^"]*">/,
    `<meta property="twitter:url" content="${canonical}">`
  );
  html = html.replace(
    /<meta property="twitter:title" content="[^"]*">/,
    `<meta property="twitter:title" content="${route.title}">`
  );
  html = html.replace(
    /<meta property="twitter:description" content="[^"]*">/,
    `<meta property="twitter:description" content="${route.description}">`
  );

  // Add/update canonical link.
  //
  // A noindex route (the 404 shell) must not carry one at all: a canonical is a
  // claim that this URL is the preferred address for real content, which is the
  // opposite of what a not-found page means. Strip any inherited tag instead.
  if (route.noindex) {
    html = html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '');
    html = html.replace(
      '</head>',
      `    <meta name="robots" content="noindex, follow" />\n  </head>`
    );
  } else if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${canonical}" />`
    );
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${canonical}" />\n  </head>`);
  }

  // Inject this route's FAQ schema at the marker in index.html. Routes that
  // don't declare `faq` get no FAQPage block — better than repeating one
  // generic set of questions across every page, which is what used to happen.
  if (route.faq?.length) {
    const faqJson = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: route.faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      null,
      2
    );
    html = html.replace(
      '<!--FAQ_SCHEMA_SLOT-->',
      `<script type="application/ld+json">\n${faqJson}\n    </script>`
    );
  } else {
    html = html.replace('<!--FAQ_SCHEMA_SLOT-->', '');
  }

  // Inject noscript SEO content inside <div id="root">
  // React will replace this on hydration, but crawlers see real content
  const noscriptContent = `
    <div id="seo-content" style="max-width:800px;margin:0 auto;padding:2rem;font-family:system-ui,sans-serif;">
      <header>
        <a href="/">Wings of Steel - Youth Sled Hockey</a>
        <nav>
          <a href="/">Home</a> | 
          <a href="/join-team">Join</a> | 
          <a href="/donate">Donate</a> | 
          <a href="/practice-schedule">Schedule</a> | 
          <a href="/events">Events</a> | 
          <a href="/gallery">Gallery</a>
        </nav>
      </header>
      <main>
        <h1>${route.h1}</h1>
        ${route.content}
      </main>
      <footer>
        <p>Wings of Steel Youth Sled Hockey — 501(c)(3) Nonprofit</p>
        <p>Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees Township, NJ 08043</p>
        <p>No child pays to play.</p>
      </footer>
    </div>`;

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${noscriptContent}</div>`
  );

  return html;
}

function prerender() {
  console.log('\n🏒 Wings of Steel — Generating SEO pages\n');

  const indexPath = join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    console.error('❌ dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const baseHTML = readFileSync(indexPath, 'utf-8');
  let count = 0;

  for (const route of ROUTES) {
    const html = generateRouteHTML(baseHTML, route);

    // Most routes become dist/<route>/index.html so Netlify serves them at
    // "/<route>/". `outputFile` opts out of that for pages that must sit at a
    // fixed flat path — 404.html, which Netlify serves (with a 404 status) for
    // anything the redirect rules don't claim.
    let outputPath;
    if (route.outputFile) {
      outputPath = join(DIST_DIR, route.outputFile);
    } else {
      const outputDir = route.path === '/'
        ? DIST_DIR
        : join(DIST_DIR, route.path);

      if (route.path !== '/') {
        mkdirSync(outputDir, { recursive: true });
      }
      outputPath = join(outputDir, 'index.html');
    }

    writeFileSync(outputPath, html);
    count++;

    console.log(`  ✅ ${route.path} → ${outputPath.replace(DIST_DIR, 'dist')}`);
  }

  console.log(`\n  Generated ${count}/${ROUTES.length} SEO pages.\n`);

  generateSitemap();
}

/**
 * Write dist/sitemap.xml from the same ROUTES table that produces the pages.
 *
 * This used to be a hand-maintained public/sitemap.xml, which is how the
 * sitemap and the canonical tags drifted apart: the sitemap listed
 * "/donate", the canonical said "/donate", and the server answered on
 * "/donate/". Deriving both from one table means they cannot disagree again,
 * and a new route shows up in the sitemap the moment it's added above.
 */
function generateSitemap() {
  const lastmod = new Date().toISOString().slice(0, 10);

  const indexable = ROUTES.filter((route) => !route.noindex);

  const body = indexable
    .map((route) => {
      const loc = `https://wingsofsteel.org${route.path === '/' ? '/' : `${route.path}/`}`;
      const priority = route.priority ?? (route.path === '/' ? '1.0' : '0.7');
      const changefreq = route.changefreq ?? 'monthly';
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  writeFileSync(join(DIST_DIR, 'sitemap.xml'), xml);
  console.log(`  🗺  sitemap.xml → ${indexable.length} URLs (${ROUTES.length - indexable.length} noindex route excluded)\n`);
}

prerender();
