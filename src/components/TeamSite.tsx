import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from './Navigation';
import HeroLight from './HeroLight';
import Footer from './Footer';
import Admin from './Admin';
import type { TeamType } from '../types/team';

// Lazy load sections that are below the fold
const About = lazy(() => import('./About'));
const Team = lazy(() => import('./Team'));
const Schedule = lazy(() => import('./Schedule'));
const Location = lazy(() => import('./Location'));
const GetInvolved = lazy(() => import('./GetInvolved'));
const Contact = lazy(() => import('./Contact'));

const TeamSite: React.FC = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const { team } = useParams<{ team: TeamType }>();
  
  console.log('TeamSite rendering, team:', team);

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

  // Only youth team is currently active
  if (!team || team !== 'youth') {
    console.log('Invalid team, returning null');
    return null; // Let React Router handle the redirect
  }
  
  console.log('Team is valid, rendering site');

  if (showAdmin) {
    return <Admin />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-20">
        <HeroLight />
        <Suspense fallback={<div className="h-32" />}>
          <About />
          <Team />
          <Schedule />
          <Location />
          <GetInvolved />
          <Contact />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
};

export default TeamSite;