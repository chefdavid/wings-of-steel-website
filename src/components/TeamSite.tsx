import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { URLTeamProvider } from '../contexts/URLTeamContext';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import Navigation from './Navigation';
import Hero from './Hero';
import Footer from './Footer';
import Admin from './Admin';
import type { TeamType } from '../types/team';

// Lazy load sections that are below the fold
const TodayGameCard = lazy(() => import('./TodayGameCard'));
const About = lazy(() => import('./About'));
const Team = lazy(() => import('./Team'));
const Schedule = lazy(() => import('./Schedule'));
const Location = lazy(() => import('./Location'));
const GetInvolved = lazy(() => import('./GetInvolved'));
const Contact = lazy(() => import('./Contact'));
const FeaturedHighlights = lazy(() => import('./FeaturedHighlights'));
const DonationSlideOut = lazy(() => import('./DonationSlideOut'));

const TeamSite: React.FC = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPracticeAlert, setShowPracticeAlert] = useState(false);
  const { team } = useParams<{ team: TeamType }>();
  
  // Default to 'youth' team if no team is specified (for root route)
  const currentTeam = team || 'youth';

  useEffect(() => {
    // Check if we're on the admin route
    const isAdminRoute = window.location.pathname.includes('/admin') || window.location.hash === '#admin';
    if (isAdminRoute) {
      setShowAdmin(true);
    }

    // Listen for hash changes
    const handleHashChange = () => {
      setShowAdmin(window.location.hash === '#admin');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Show practice schedule change popup (auto-disable after 4/23/2026)
  useEffect(() => {
    const now = new Date();
    const cutoff = new Date('2026-04-24T00:00:00');
    if (now < cutoff) {
      const dismissed = sessionStorage.getItem('practiceAlertDismissed');
      if (!dismissed) {
        setShowPracticeAlert(true);
      }
    }
  }, []);

  // Only youth team is currently active
  if (currentTeam !== 'youth' && currentTeam !== 'adult') {
    return null; // Let React Router handle the redirect
  }

  if (showAdmin) {
    return <Admin />;
  }

  return (
    <URLTeamProvider>
      <div className="min-h-screen">
        <Navigation />
        <main id="main-content" className="pt-20">
          <Hero />
          <Suspense fallback={<div className="h-32" />}>
            <TodayGameCard />
            <FeaturedHighlights />
            <About />
            <Team />
            <Schedule />
            <Location />
            <GetInvolved />
            <Contact />
          </Suspense>
          <Footer />
        </main>
        <Suspense fallback={null}>
          <DonationSlideOut />
        </Suspense>

        {/* Practice Schedule Change Popup */}
        {showPracticeAlert && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-amber-400 px-6 py-4 flex items-center gap-3">
                <FaExclamationTriangle className="text-white text-2xl flex-shrink-0" />
                <h3 className="text-xl font-bold text-white">Practice Schedule Change</h3>
                <button
                  onClick={() => {
                    setShowPracticeAlert(false);
                    sessionStorage.setItem('practiceAlertDismissed', 'true');
                  }}
                  className="ml-auto text-white/80 hover:text-white transition-colors"
                  aria-label="Close alert"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <div className="px-6 py-5">
                <p className="text-lg font-bold text-gray-800 mb-2">
                  Thursday, April 23rd
                </p>
                <p className="text-gray-700 mb-1">
                  Practice will start at <span className="font-bold text-amber-700 text-lg">7:10 PM</span> instead of the regular time.
                </p>
                <p className="text-gray-500 text-sm mt-3">
                  Please plan to arrive accordingly.
                </p>
              </div>
              <div className="px-6 pb-5 flex gap-3">
                <Link
                  to="/practice-schedule"
                  className="flex-1 text-center bg-steel-blue text-white py-2.5 rounded-lg font-bold hover:bg-dark-steel transition-colors"
                  onClick={() => {
                    setShowPracticeAlert(false);
                    sessionStorage.setItem('practiceAlertDismissed', 'true');
                  }}
                >
                  View Schedule
                </Link>
                <button
                  onClick={() => {
                    setShowPracticeAlert(false);
                    sessionStorage.setItem('practiceAlertDismissed', 'true');
                  }}
                  className="flex-1 text-center bg-gray-100 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </URLTeamProvider>
  );
};

export default TeamSite;