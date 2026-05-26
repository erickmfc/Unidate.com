import React from 'react';

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
    <div className="flex flex-wrap justify-center gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 shadow-lg shadow-yellow-500/25'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
          }`}
        >
          <span className="flex items-center space-x-2">
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            <span>{tab.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default SubjectTabs;
