import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { URLTeamProvider } from '../../contexts/URLTeamContext';
import Navigation from '../Navigation';
import Footer from '../Footer';

interface LayoutProps {
  /** Set false for pages that intentionally render no footer (e.g. the gallery). */
  withFooter?: boolean;
}

/**
 * The single page shell: nav, main landmark, footer.
 *
 * Used as a React Router layout route, so pages render only their own content
 * and never import Navigation or Footer themselves.
 *
 * Why this exists: Navigation and Footer were previously imported
 * independently by 21 page components, and each page applied its own `pt-20`
 * to clear the fixed nav. Changing the nav height meant editing 21 files and
 * hoping none were missed. The offset now comes from the `nav` spacing token
 * (src/design/tokens.js) in exactly one place.
 *
 * URLTeamProvider also lives here. It used to be mounted inside TeamSite only,
 * so `useTeam()` threw or fell back on every other route.
 */
export default function Layout({ withFooter = true }: LayoutProps) {
  return (
    <URLTeamProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main id="main-content" className="pt-nav flex-1">
          {/*
            Suspense sits INSIDE the shell, not around it. Previously the only
            boundary was in App.tsx wrapping <Routes>, so loading a lazy page
            chunk replaced the entire page — nav included — with a full-screen
            spinner. Now the nav and footer stay painted and only the content
            area swaps.
          */}
          {/*
            The fallback reserves a full viewport, not 60vh, because that is
            what the incoming content actually occupies — every page here opens
            with a `min-h-screen` hero.

            At 60vh (564px) the footer landed at ~628px, inside a 940px
            viewport, and was then pushed below the fold once the real page
            rendered. Lighthouse attributed 0.315 of the page's 0.330 CLS to
            that single footer movement — 95% of the total (measured
            2026-08-23). Reserving 100vh keeps the footer below the fold from
            the first paint, so it never shifts anywhere the user can see.
          */}
          <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
            <Outlet />
          </Suspense>
        </main>
        {withFooter && <Footer />}
      </div>
    </URLTeamProvider>
  );
}
