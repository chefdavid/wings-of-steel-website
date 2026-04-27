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
    title: 'Wings of Steel - Youth Sled Hockey | No Child Pays to Play',
    description: 'Wings of Steel Youth Sled Hockey — Championship team making hockey accessible to all children. No child pays to play. 2025 & 2026 USA Champions. Voorhees, NJ.',
    h1: 'Wings of Steel Youth Sled Hockey',
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
];

/**
 * Generate a route-specific HTML file from the base template
 */
function generateRouteHTML(baseHTML, route) {
  let html = baseHTML;
  const canonical = `https://wingsofsteel.org${route.path === '/' ? '' : route.path}`;

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

  // Add/update canonical link
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${canonical}" />`
    );
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${canonical}" />\n  </head>`);
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

    // Write to dist/<route>/index.html
    const outputDir = route.path === '/'
      ? DIST_DIR
      : join(DIST_DIR, route.path);

    if (route.path !== '/') {
      mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = join(outputDir, 'index.html');
    writeFileSync(outputPath, html);
    count++;

    console.log(`  ✅ ${route.path} → ${outputPath.replace(DIST_DIR, 'dist')}`);
  }

  console.log(`\n  Generated ${count}/${ROUTES.length} SEO pages.\n`);
}

prerender();
