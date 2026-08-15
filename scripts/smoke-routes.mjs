#!/usr/bin/env node
/**
 * Route smoke test
 *
 * Boots `vite preview` against the production build and visits every public
 * route in a headless browser. Fails the build if a route renders the
 * ErrorBoundary fallback or throws an uncaught exception during render.
 *
 * Trigger: catches the class of bugs where a route renders blank or
 * "Something went wrong" only in production (e.g. supabase realtime
 * channel collisions, lazy-chunk import errors, hook misuse).
 */

import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';

const PORT = Number(process.env.SMOKE_PORT) || 4173;
const BASE = `http://localhost:${PORT}`;

const ROUTES = [
  '/',
  '/opponents',
  '/store',
  '/gallery',
  '/golf-outing',
  '/hockey-for-a-cause',
  '/topgolf',
  '/join-team',
  '/practice-schedule',
  '/events',
  '/accessibility',
  '/game-highlights',
  '/stats',
  '/donate',
  '/what-is-sled-hockey',
  '/sled-hockey-nj',
  '/sled-hockey-teams',
  '/free-youth-hockey',
  '/sled-hockey-equipment-guide',
];

function startPreview() {
  const child = spawn(
    'npx',
    ['vite', 'preview', '--port', String(PORT), '--strictPort'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      env: { ...process.env },
    }
  );
  return child;
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await sleep(300);
  }
  throw new Error(`preview server at ${url} did not become ready in ${timeoutMs}ms`);
}

async function checkRoute(browser, route) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.stack || err.message));

  const url = BASE + route;
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 20000 });
  } catch (err) {
    await context.close();
    return { route, ok: false, reason: `navigation failed: ${err.message}` };
  }

  // Give React a moment to render and hooks to settle
  await sleep(1500);

  const body = await page.evaluate(() => document.body.innerText);
  await context.close();

  if (body.includes('Something went wrong')) {
    return {
      route,
      ok: false,
      reason: 'ErrorBoundary fallback rendered',
      pageErrors,
      bodySnippet: body.slice(0, 200),
    };
  }
  if (!body.trim()) {
    return { route, ok: false, reason: 'body is empty', pageErrors };
  }
  if (pageErrors.length > 0) {
    return { route, ok: false, reason: 'uncaught exception', pageErrors };
  }
  return { route, ok: true };
}

async function main() {
  console.log(`\n🔍 Smoke testing ${ROUTES.length} routes against ${BASE}\n`);

  const preview = startPreview();
  let killed = false;
  const cleanup = () => {
    if (killed || !preview.pid) return;
    killed = true;
    if (process.platform === 'win32') {
      // SIGTERM doesn't reliably stop child node processes on Windows;
      // taskkill /T cascades to the whole tree.
      try { spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
    } else {
      try { preview.kill('SIGTERM'); } catch {}
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(130); });
  process.on('SIGTERM', () => { cleanup(); process.exit(143); });

  // Surface preview output if it dies early
  let previewOut = '';
  preview.stdout.on('data', (d) => { previewOut += d.toString(); });
  preview.stderr.on('data', (d) => { previewOut += d.toString(); });
  preview.on('exit', (code) => {
    if (code !== null && code !== 0 && !killed) {
      console.error('preview server exited unexpectedly with code', code);
      console.error(previewOut);
    }
  });

  try {
    await waitForServer(BASE + '/', 30000);
  } catch (err) {
    cleanup();
    console.error(err.message);
    console.error(previewOut);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const results = [];
  try {
    for (const route of ROUTES) {
      const r = await checkRoute(browser, route);
      results.push(r);
      if (r.ok) {
        console.log(`  ✅ ${route}`);
      } else {
        console.log(`  ❌ ${route}  — ${r.reason}`);
      }
    }
  } finally {
    await browser.close();
    cleanup();
  }

  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length}/${results.length} route(s) failed smoke test:\n`);
    for (const f of failures) {
      console.error(`  ${f.route}: ${f.reason}`);
      if (f.bodySnippet) console.error(`    body: ${JSON.stringify(f.bodySnippet)}`);
      if (f.pageErrors?.length) {
        console.error(`    pageErrors:`);
        for (const e of f.pageErrors.slice(0, 2)) {
          console.error(`      ${e.split('\n').slice(0, 5).join('\n      ')}`);
        }
      }
    }
    process.exit(1);
  }

  console.log(`\n✅ All ${results.length} routes rendered without errors.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
