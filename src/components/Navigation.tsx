import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

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

  const megaMenuItems = [
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
            { name: 'Practice Schedule', href: '/practice-schedule', isHashLink: false, description: 'All practice times' },
            { name: 'Pizza, Pins & Pop', href: '/pizza-pins-pop', isHashLink: false, description: 'Fundraiser event Oct 26', highlight: true }
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
    { name: 'Golf Outing', href: '/golf-outing', isHashLink: false, standalone: true, highlight: true },
    { name: '🎳 Pizza & Pins', href: '/pizza-pins-pop', isHashLink: false, standalone: true, highlight: true, cta: true }
  ];

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
                    alt="Wings of Steel Logo" 
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
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-steel-blue/20 rounded-md transition-all duration-200 font-sport tracking-wider"
                    >
                      {item.name}
                      <FaChevronDown className="ml-2 text-xs" />
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

              {/* CTA Button */}
              <Link
                to="/store"
                className="ml-4 px-6 py-2 bg-steel-blue text-white rounded-full hover:bg-steel-blue/80 transition-all duration-200 font-sport tracking-wider shadow-lg"
              >
                Shop
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white focus:outline-none focus:text-white p-2"
                aria-label="Toggle menu"
              >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
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
                
                {/* Mobile CTA */}
                <Link
                  to="/store"
                  onClick={() => setIsOpen(false)}
                  className="block mt-4 px-6 py-3 bg-steel-blue text-white text-center rounded-full hover:bg-steel-blue/80 transition-all duration-200 font-sport tracking-wider"
                >
                  Visit Team Store
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navigation;