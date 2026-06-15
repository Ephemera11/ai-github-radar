import type { ReactNode } from 'react';

export interface ProjectTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: 'recommended', label: '综合推荐' },
  { key: 'trending', label: '本周热度' },
  { key: 'stars', label: '历史高赞' },
  { key: 'rising', label: '新上升项目' },
];

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps): ReactNode {
  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
