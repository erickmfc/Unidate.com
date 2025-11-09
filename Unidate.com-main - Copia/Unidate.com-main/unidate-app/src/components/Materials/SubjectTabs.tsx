import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface SubjectTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const SubjectTabs: React.FC<SubjectTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap
            ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 shadow-lg transform scale-105'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }
          `}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default SubjectTabs;

