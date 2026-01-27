import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaHockeyPuck, FaCalendarAlt, FaCog, FaSignOutAlt, FaBars, FaTimes, FaClock, FaImage, FaGolfBall, FaPizzaSlice, FaTrophy, FaEye, FaHeart, FaChartLine } from 'react-icons/fa';
import { Users } from 'lucide-react';
import PlayerManagement from './PlayerManagement';
import CoachManagement from './CoachManagement';
import HeroSectionEditor from './HeroSectionEditor';
import GameScheduleManagement from './GameScheduleManagement';
import GameHighlightsManagement from './GameHighlightsManagement';
import OpponentTeamsManagement from './OpponentTeamsManagement';
import PracticeScheduleManagement from './PracticeScheduleManagement';
import ImageBatchUpdate from './ImageBatchUpdate';
import GolfOutingAdmin from './GolfOutingAdmin';
import PizzaPinsDashboard from '../../pages/PizzaPinsDashboard';
import EventVisibilityManagement from './EventVisibilityManagement';
import DonationManagement from './DonationManagement';
import DonationGoalManagement from './DonationGoalManagement';

type AdminSection = 'players' | 'coaches' | 'site-sections' | 'schedule' | 'game-highlights' | 'practice' | 'opponents' | 'settings' | 'batch-images' | 'golf-outing' | 'pizza-pins' | 'event-visibility' | 'donations' | 'donation-goals';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('players');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'pizza-pins' as AdminSection, label: 'Pizza Pins Sales', icon: FaPizzaSlice },
    { id: 'golf-outing' as AdminSection, label: 'Golf Outing', icon: FaGolfBall },
    { id: 'event-visibility' as AdminSection, label: 'Event Visibility', icon: FaEye },
    { id: 'donations' as AdminSection, label: 'Donations', icon: FaHeart },
    { id: 'donation-goals' as AdminSection, label: 'Donation Goals', icon: FaChartLine },
    { id: 'players' as AdminSection, label: 'Team Roster', icon: FaUsers },
    { id: 'coaches' as AdminSection, label: 'Coaching Staff', icon: FaHockeyPuck },
    { id: 'opponents' as AdminSection, label: 'Opponent Teams', icon: Users },
    { id: 'practice' as AdminSection, label: 'Practice Schedule', icon: FaClock },
    { id: 'schedule' as AdminSection, label: 'Game Schedule', icon: FaCalendarAlt },
    { id: 'game-highlights' as AdminSection, label: 'Game Highlights', icon: FaTrophy },
    { id: 'site-sections' as AdminSection, label: 'Site Content', icon: FaCog },
    { id: 'batch-images' as AdminSection, label: 'Batch Update Images', icon: FaImage },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'pizza-pins':
        return <div className="-m-6"><PizzaPinsDashboard /></div>;
      case 'golf-outing':
        return <GolfOutingAdmin />;
      case 'event-visibility':
        return <EventVisibilityManagement />;
      case 'donations':
        return <DonationManagement />;
      case 'donation-goals':
        return <DonationGoalManagement />;
      case 'players':
        return <PlayerManagement />;
      case 'coaches':
        return <CoachManagement />;
      case 'opponents':
        return <OpponentTeamsManagement />;
      case 'practice':
        return <PracticeScheduleManagement />;
      case 'site-sections':
        return <HeroSectionEditor />;
      case 'schedule':
        return <GameScheduleManagement />;
      case 'game-highlights':
        return <GameHighlightsManagement />;
      case 'batch-images':
        return <ImageBatchUpdate />;
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
      <div className="hidden lg:flex lg:flex-col w-64 bg-dark-steel shadow-lg h-screen">
        <div className="flex items-center justify-between p-6 border-b border-steel-gray">
          <h1 className="text-xl font-bold text-white">Wings Admin</h1>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
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

        <div className="mt-auto p-6 border-t border-steel-gray">
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
        className="fixed lg:hidden inset-y-0 left-0 z-50 w-64 bg-dark-steel shadow-lg flex flex-col h-screen"
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

        <nav className="flex-1 mt-6 overflow-y-auto">
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

        <div className="p-6 border-t border-steel-gray">
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
}

export default AdminDashboard;