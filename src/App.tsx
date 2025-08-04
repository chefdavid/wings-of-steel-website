import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import About from './components/About'
import Team from './components/Team'
import Schedule from './components/Schedule'
import Location from './components/Location'
import GetInvolved from './components/GetInvolved'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Admin from './components/Admin'

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check if we're on the admin route
    const isAdminRoute = window.location.pathname === '/admin' || window.location.hash === '#admin';
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

  if (showAdmin) {
    return <Admin />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Team />
      <Schedule />
      <Location />
      <GetInvolved />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
