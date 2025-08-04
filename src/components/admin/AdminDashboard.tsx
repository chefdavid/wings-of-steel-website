import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaHockeyPuck, FaCalendarAlt, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import PlayerManagement from './PlayerManagement';
import CoachManagement from './CoachManagement';
import SiteSectionsEditor from './SiteSectionsEditor';
import GameScheduleManagement from './GameScheduleManagement';

type AdminSection = 'players' | 'coaches' | 'site-sections' | 'schedule' | 'settings';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('players');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'players' as AdminSection, label: 'Team Roster', icon: FaUsers },
    { id: 'coaches' as AdminSection, label: 'Coaching Staff', icon: FaHockeyPuck },
    { id: 'site-sections' as AdminSection, label: 'Site Content', icon: FaCog },
    { id: 'schedule' as AdminSection, label: 'Game Schedule', icon: FaCalendarAlt },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'players':
        return <PlayerManagement />;
      case 'coaches':
        return <CoachManagement />;
      case 'site-sections':
        return <SiteSectionsEditor />;
      case 'schedule':
        return <GameScheduleManagement />;
      default:
        return <PlayerManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="hidden lg:block w-64 bg-dark-steel shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-steel-gray">
          <h1 className="text-xl font-bold text-white">Wings Admin</h1>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-steel-blue text-white'
                  : 'text-gray-300 hover:bg-steel-gray hover:text-white'
              }`}
            >
              <item.icon className="text-lg" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-steel-gray">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed lg:hidden inset-y-0 left-0 z-50 w-64 bg-dark-steel shadow-lg"
      >
        <div className="flex items-center justify-between p-6 border-b border-steel-gray">
          <h1 className="text-xl font-bold text-white">Wings Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-steel-blue text-white'
                  : 'text-gray-300 hover:bg-steel-gray hover:text-white'
              }`}
            >
              <item.icon className="text-lg" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-steel-gray">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <FaBars className="text-xl" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Admin Dashboard
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;