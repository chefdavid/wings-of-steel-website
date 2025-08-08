import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from './Navigation';
import Hero from './Hero';
import About from './About';
import Team from './Team';
import Schedule from './Schedule';
import Location from './Location';
import GetInvolved from './GetInvolved';
import Contact from './Contact';
import Footer from './Footer';
import Admin from './Admin';
import type { TeamType } from '../types/team';

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
        <Hero />
        <About />
        <Team />
        <Schedule />
        <Location />
        <GetInvolved />
        <Contact />
        <Footer />
      </div>
    </div>
  );
};

export default TeamSite;