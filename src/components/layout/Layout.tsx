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
          <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <Outlet />
          </Suspense>
        </main>
        {withFooter && <Footer />}
      </div>
    </URLTeamProvider>
  );
}
