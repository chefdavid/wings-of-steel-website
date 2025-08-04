import { FaTh, FaList, FaThLarge } from 'react-icons/fa';

type LayoutType = 'grid' | 'list' | 'compact';

interface LayoutToggleProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

const LayoutToggle = ({ currentLayout, onLayoutChange }: LayoutToggleProps) => {
  const layouts = [
    { id: 'grid' as LayoutType, icon: FaTh, label: 'Grid' },
    { id: 'compact' as LayoutType, icon: FaThLarge, label: 'Compact' },
    { id: 'list' as LayoutType, icon: FaList, label: 'List' }
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {layouts.map((layout) => (
        <button
          key={layout.id}
          onClick={() => onLayoutChange(layout.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentLayout === layout.id
              ? 'bg-white text-steel-blue shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          title={layout.label}
        >
          <layout.icon className="text-sm" />
          <span className="hidden sm:inline">{layout.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LayoutToggle;
export type { LayoutType };