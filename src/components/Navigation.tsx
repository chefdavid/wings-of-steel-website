import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown, FaFacebook } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useEventVisibility } from '../hooks/useEventVisibility';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { isEventVisible, loading: visibilityLoading } = useEventVisibility();

  const handleHashLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const isHomePage = location.pathname === '/' || location.pathname === '/team/youth';
    
    // If href starts with '/#', we always need to go to home page first
    if (href.startsWith('/#')) {
      const hash = href.substring(2); // Remove the '/#' prefix
      if (!isHomePage) {
        // Navigate to home page with hash
        window.location.href = href;
      } else {
        // Already on home page, just scroll
        setTimeout(() => {
          const element = document.querySelector('#' + hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else if (!isHomePage) {
      // Old behavior for regular hash links
      window.location.href = '/' + href;
    } else {
      // Old behavior for scrolling on same page
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setActiveDropdown(null);
    setIsOpen(false);
  };

  // Filter menu items based on event visibility
  const megaMenuItems = useMemo(() => {
    const allItems = [
      { name: 'Home', href: '/', isHashLink: false, standalone: true, forceReload: true },
      {
        name: 'Team',
        key: 'team',
        sections: [
          {
            title: 'About Us',
            items: [
              { name: 'Our Mission', href: '/#about', isHashLink: true, description: 'Learn about Wings of Steel' },
              { name: 'Location', href: '/#location', isHashLink: true, description: 'Find our practice facility' }
            ]
          },
          {
            title: 'Roster',
            items: [
              { name: 'Players', href: '/#team-players', isHashLink: true, description: 'Meet our athletes' },
              { name: 'Coaches', href: '/#team-coaches', isHashLink: true, description: 'Our coaching staff' }
            ]
          }
        ]
      },
      {
        name: 'Schedule',
        key: 'schedule',
        sections: [
          {
            title: 'Events',
            items: [
              { name: 'Game Schedule', href: '/#schedule', isHashLink: true, description: '2025-2026 season games' },
              { name: 'Game Highlights', href: '/game-highlights', isHashLink: false, description: 'Recaps, photos & moments' },
              { name: 'Practice Schedule', href: '/practice-schedule', isHashLink: false, description: 'All practice times' },
              { name: 'Pizza, Pins & Pop', href: '/pizza-pins-pop', isHashLink: false, description: 'Fundraiser event Oct 26', highlight: true, eventKey: 'pizza-pins-pop' }
            ]
          }
        ]
      },
      {
        name: 'Experience',
        key: 'experience',
        sections: [
          {
            title: 'Media',
            items: [
              { name: 'Photo Gallery', href: '/gallery', isHashLink: false, description: 'Tournament photos & memories' },
              { name: 'Team Store', href: '/store', isHashLink: false, description: 'Official merchandise' }
            ]
          },
          {
            title: 'Competition',
            items: [
              { name: 'Opponents', href: '/opponents', isHashLink: false, description: 'Teams we compete against' }
            ]
          }
        ]
      },
      {
        name: 'Connect',
        key: 'connect',
        sections: [
          {
            title: 'Get Involved',
            items: [
              { name: 'Join the Team', href: '/join-team', isHashLink: false, description: 'Become a player or volunteer' },
              { name: 'Support Us', href: '/#get-involved', isHashLink: true, description: 'Ways to help our mission' }
            ]
          },
          {
            title: 'Contact',
            items: [
              { name: 'Contact Us', href: '/#contact', isHashLink: true, description: 'Get in touch with our team' }
            ]
          }
        ]
      },
      { name: 'Golf Outing', href: '/golf-outing', isHashLink: false, standalone: true, highlight: true, eventKey: 'golf-outing' },
      { name: '🎳 Pizza & Pins', href: '/pizza-pins-pop', isHashLink: false, standalone: true, highlight: true, cta: true, eventKey: 'pizza-pins-pop' }
    ];

    // Filter out events that are not visible (unless still loading)
    if (visibilityLoading) {
      return allItems; // Show all items while loading
    }

    return allItems.filter(item => {
      // If item has an eventKey, check visibility
      if (item.eventKey) {
        return isEventVisible(item.eventKey);
      }
      
      // If item has sections, filter items within sections
      if (item.sections) {
        const filteredSections = item.sections.map(section => ({
          ...section,
          items: section.items.filter(subItem => {
            // If subItem has eventKey, check visibility
            if (subItem.eventKey) {
              return isEventVisible(subItem.eventKey);
            }
            return true;
          })
        })).filter(section => section.items.length > 0); // Remove empty sections
        
        // Only include the item if it has at least one section with items
        return filteredSections.length > 0;
      }
      
      // Include all other items
      return true;
    }).map(item => {
      // Rebuild sections with filtered items
      if (item.sections) {
        return {
          ...item,
          sections: item.sections.map(section => ({
            ...section,
            items: section.items.filter(subItem => {
              if (subItem.eventKey) {
                return isEventVisible(subItem.eventKey);
              }
              return true;
            })
          })).filter(section => section.items.length > 0)
        };
      }
      return item;
    });
  }, [isEventVisible, visibilityLoading]);

  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-steel-blue text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      
      <nav className="fixed top-0 w-full bg-dark-steel/95 backdrop-blur-sm z-50 shadow-lg" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <Link to="/" className="flex items-center min-w-0 group">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center min-w-0"
                >
                  <img
                    src="/assets/wings-logo.webp"
                    alt="Wings of Steel Youth Sled Hockey Team Logo - Home" 
                    className="h-12 w-auto mr-4 group-hover:scale-105 transition-transform duration-200"
                    width="48"
                    height="48"
                    loading="eager"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xl md:text-2xl font-sport text-white leading-tight whitespace-nowrap group-hover:text-ice-blue transition-colors duration-200">WINGS OF STEEL</span>
                    <span className="text-xs text-ice-blue font-medium truncate">Youth Sled Hockey</span>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {megaMenuItems.map((item) => (
                item.standalone ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 ${
                      item.cta
                        ? 'bg-yellow-500 text-black rounded-full hover:bg-yellow-400 shadow-lg px-6 font-bold animate-pulse'
                        : item.highlight
                        ? 'text-championship-gold hover:text-yellow-300 hover:bg-championship-gold/20'
                        : 'text-gray-300 hover:text-white hover:bg-steel-blue/20'
                    } rounded-md transition-all duration-200 font-sport tracking-wider`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.key || null)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-steel-blue/20 rounded-md transition-all duration-200 font-sport tracking-wider focus:outline-none focus:ring-2 focus:ring-ice-blue"
                      aria-expanded={activeDropdown === item.key}
                      aria-haspopup="true"
                      aria-label={`${item.name} menu`}
                      onClick={() => setActiveDropdown(activeDropdown === item.key ? null : item.key || null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setActiveDropdown(null);
                      }}
                    >
                      {item.name}
                      <FaChevronDown className="ml-2 text-xs" aria-hidden="true" />
                    </button>

                    {/* Mega Menu Dropdown */}
                    <AnimatePresence>
                      {activeDropdown === item.key && item.sections && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-screen max-w-3xl"
                        >
                          <div className="bg-dark-steel backdrop-blur-md rounded-lg shadow-2xl shadow-black/50 border border-steel-blue/30 p-6 ring-1 ring-black/20">
                            <div className="grid grid-cols-3 gap-6">
                              {item.sections.map((section, idx) => (
                                <div key={idx}>
                                  <h3 className="text-ice-blue font-sport text-sm uppercase tracking-wider mb-3">
                                    {section.title}
                                  </h3>
                                  <ul className="space-y-2">
                                    {section.items.map((subItem) => (
                                      <li key={subItem.name}>
                                        {subItem.isHashLink ? (
                                          <a
                                            href={subItem.href}
                                            onClick={(e) => handleHashLinkClick(e, subItem.href)}
                                            className="block group hover:bg-steel-blue/20 rounded-md p-2 transition-all duration-200"
                                          >
                                            <div className="text-gray-100 group-hover:text-ice-blue font-medium">
                                              {subItem.name}
                                            </div>
                                            {subItem.description && (
                                              <div className="text-gray-300 text-xs mt-1 group-hover:text-gray-200">
                                                {subItem.description}
                                              </div>
                                            )}
                                          </a>
                                        ) : (
                                          <Link
                                            to={subItem.href}
                                            className="block group hover:bg-steel-blue/20 rounded-md p-2 transition-all duration-200"
                                            onClick={() => setActiveDropdown(null)}
                                          >
                                            <div className="text-gray-100 group-hover:text-ice-blue font-medium">
                                              {subItem.name}
                                            </div>
                                            {subItem.description && (
                                              <div className="text-gray-300 text-xs mt-1 group-hover:text-gray-200">
                                                {subItem.description}
                                              </div>
                                            )}
                                          </Link>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              ))}

              {/* Social & CTA Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href="https://www.facebook.com/wingsofsteel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-ice-blue hover:text-blue-400 hover:bg-steel-blue/20 rounded-full transition-all duration-200"
                  aria-label="Follow us on Facebook"
                >
                  <FaFacebook className="text-2xl" />
                </a>
                <Link
                  to="/store"
                  className="px-6 py-2 bg-steel-blue text-white rounded-full hover:bg-steel-blue/80 transition-all duration-200 font-sport tracking-wider shadow-lg"
                >
                  Shop
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-ice-blue focus:text-white p-2 rounded-md"
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen ? <FaTimes size={24} aria-hidden="true" /> : <FaBars size={24} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-dark-steel/98 backdrop-blur-md border-t border-steel-blue/20"
              id="mobile-menu"
              role="region"
              aria-label="Mobile navigation menu"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {megaMenuItems.map((item) => (
                  item.standalone ? (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 ${
                        item.cta
                          ? 'bg-yellow-500 text-black rounded-full hover:bg-yellow-400 shadow-lg font-bold text-center animate-pulse'
                          : item.highlight
                          ? 'text-championship-gold hover:text-yellow-300'
                          : 'text-gray-300 hover:text-white hover:bg-steel-blue/20'
                      } rounded-md font-sport tracking-wider`}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <div key={item.key}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.key ? null : (item.key || null))}
                        className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-steel-blue/20 rounded-md font-sport tracking-wider"
                      >
                        {item.name}
                        <FaChevronDown 
                          className={`transform transition-transform ${activeDropdown === item.key ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {/* Mobile Dropdown */}
                      <AnimatePresence>
                        {activeDropdown === item.key && item.sections && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-4 mt-2 space-y-2"
                          >
                            {item.sections.map((section) => (
                              <div key={section.title}>
                                <div className="text-ice-blue text-xs uppercase tracking-wider mb-1 pl-3">
                                  {section.title}
                                </div>
                                {section.items.map((subItem) => (
                                  subItem.isHashLink ? (
                                    <a
                                      key={subItem.name}
                                      href={subItem.href}
                                      onClick={(e) => handleHashLinkClick(e, subItem.href)}
                                      className="block pl-6 pr-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-steel-blue/10 rounded-md"
                                    >
                                      {subItem.name}
                                    </a>
                                  ) : (
                                    <Link
                                      key={subItem.name}
                                      to={subItem.href}
                                      onClick={() => setIsOpen(false)}
                                      className="block pl-6 pr-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-steel-blue/10 rounded-md"
                                    >
                                      {subItem.name}
                                    </Link>
                                  )
                                ))}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                ))}

                {/* Mobile Social & CTA */}
                <div className="mt-4 space-y-2">
                  <a
                    href="https://www.facebook.com/wingsofsteel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white text-center rounded-full hover:bg-blue-700 transition-all duration-200 font-sport tracking-wider"
                    aria-label="Follow us on Facebook"
                  >
                    <FaFacebook className="text-xl" />
                    Follow on Facebook
                  </a>
                  <Link
                    to="/store"
                    onClick={() => setIsOpen(false)}
                    className="block px-6 py-3 bg-steel-blue text-white text-center rounded-full hover:bg-steel-blue/80 transition-all duration-200 font-sport tracking-wider"
                  >
                    Visit Team Store
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navigation;