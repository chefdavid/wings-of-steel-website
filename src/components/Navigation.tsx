import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [showRosterDropdown, setShowRosterDropdown] = useState(false);
  const location = useLocation();

  const handleHashLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    if (location.pathname !== '/team/youth') {
      window.location.href = '/team/youth' + href;
    } else {
      // Small delay to ensure dropdown closes before scrolling
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const navItems = [
    { name: 'Home', href: '#home', isHashLink: true },
    { name: 'About', href: '#about', isHashLink: true },
    { 
      name: 'Roster', 
      href: '#team',
      isHashLink: true,
      hasDropdown: true,
      dropdownKey: 'roster',
      dropdownItems: [
        { name: 'Players', href: '#team-players', isHashLink: true },
        { name: 'Coaches', href: '#team-coaches', isHashLink: true }
      ]
    },
    { 
      name: 'Schedule', 
      href: '#schedule',
      isHashLink: true,
      hasDropdown: true,
      dropdownKey: 'schedule',
      dropdownItems: [
        { name: 'Practice Schedule', href: '#location', isHashLink: true },
        { name: 'Game Schedule', href: '#schedule', isHashLink: true }
      ]
    },
    { name: 'Location', href: '#location', isHashLink: true },
    { name: 'Store', href: '/team/youth/store', isHashLink: false },
    { name: 'Opponents', href: '/team/youth/opponents', isHashLink: false },
    { name: 'Get Involved', href: '#get-involved', isHashLink: true },
    { name: 'Contact', href: '#contact', isHashLink: true },
  ];

  return (
    <nav className="fixed top-0 w-full bg-dark-steel/95 backdrop-blur-sm z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 max-w-full">
          <div className="flex items-center min-w-0 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center min-w-0"
            >
              <img 
                src="/assets/wings-logo.png" 
                alt="Wings of Steel Logo" 
                className="h-12 w-auto mr-4"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xl md:text-2xl font-sport text-white leading-tight whitespace-nowrap">WINGS OF STEEL</span>
                <span className="text-xs text-ice-blue font-medium truncate">Youth Sled Hockey</span>
              </div>
            </motion.div>
          </div>

          <div className="hidden md:flex items-center">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item, index) => (
                item.hasDropdown ? (
                  (() => {
                    const showDropdown = item.dropdownKey === 'roster' ? showRosterDropdown : showScheduleDropdown;
                    const setShowDropdown = item.dropdownKey === 'roster' ? setShowRosterDropdown : setShowScheduleDropdown;
                    
                    return (
                      <div
                        key={item.name}
                        className="relative"
                        onMouseEnter={() => setShowDropdown(true)}
                        onMouseLeave={() => setShowDropdown(false)}
                      >
                        <motion.button
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="text-gray-300 hover:bg-steel-blue hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-1"
                        >
                          {item.name}
                          <FaChevronDown className="text-xs" />
                        </motion.button>
                        
                        {/* Invisible bridge to prevent gap */}
                        {showDropdown && (
                          <div className="absolute top-full left-0 w-full h-2" />
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ 
                            opacity: showDropdown ? 1 : 0,
                            y: showDropdown ? 0 : -10,
                            display: showDropdown ? 'block' : 'none'
                          }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 pt-2 w-48 z-10"
                        >
                          <div className="bg-white rounded-md shadow-lg py-1">
                            {item.dropdownItems?.map((dropdownItem) => (
                              <a
                                key={dropdownItem.name}
                                href={dropdownItem.href}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-steel-blue hover:text-white transition-colors"
                                onClick={(e) => {
                                  handleHashLinkClick(e, dropdownItem.href);
                                  setShowDropdown(false);
                                }}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })()
                ) : item.isHashLink ? (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-gray-300 hover:bg-steel-blue hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300"
                    onClick={(e) => handleHashLinkClick(e, item.href)}
                  >
                    {item.name}
                  </motion.a>
                ) : (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:bg-steel-blue hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 inline-block"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                )
              ))}
              <motion.a
                href="#donate"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
                className="bg-steel-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-all duration-300"
                onClick={(e) => handleHashLinkClick(e, '#donate')}
              >
                Donate
              </motion.a>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-steel-blue focus:outline-none"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-dark-steel"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div key={item.name}>
                  <a
                    href={item.href}
                    className="text-gray-300 hover:bg-steel-blue hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.dropdownKey === 'roster') {
                        setShowRosterDropdown(!showRosterDropdown);
                      } else if (item.dropdownKey === 'schedule') {
                        setShowScheduleDropdown(!showScheduleDropdown);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {item.name}
                      <FaChevronDown className={`text-xs transition-transform ${
                        (item.dropdownKey === 'roster' && showRosterDropdown) || 
                        (item.dropdownKey === 'schedule' && showScheduleDropdown) 
                          ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </a>
                  {((item.dropdownKey === 'roster' && showRosterDropdown) || 
                    (item.dropdownKey === 'schedule' && showScheduleDropdown)) && (
                    <div className="pl-6 space-y-1">
                      {item.dropdownItems?.map((dropdownItem) => (
                        <a
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="text-gray-400 hover:bg-steel-blue hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                          onClick={(e) => {
                            setIsOpen(false);
                            setShowRosterDropdown(false);
                            setShowScheduleDropdown(false);
                            handleHashLinkClick(e, dropdownItem.href);
                          }}
                        >
                          {dropdownItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : item.isHashLink ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:bg-steel-blue hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={(e) => {
                    setIsOpen(false);
                    handleHashLinkClick(e, item.href);
                  }}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-300 hover:bg-steel-blue hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
            <a
              href="#donate"
              className="bg-steel-blue text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
              onClick={(e) => {
                setIsOpen(false);
                handleHashLinkClick(e, '#donate');
              }}
            >
              Donate
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;