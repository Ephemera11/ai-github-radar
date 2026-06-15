import { useState, type ReactNode } from 'react';

export interface FiltersPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddProject: (data: { repoId: string; name: string; url: string; summary?: string; language?: string }) => Promise<void>;
}

const tabs = [
  { key: 'recommended', label: '综合推荐' },
  { key: 'trending', label: '本周热度' },
  { key: 'stars', label: '历史高赞' },
  { key: 'rising', label: '新上升项目' },
  { key: 'favorites', label: '★ 我的收藏' },
];

export function FiltersPanel({ activeTab, onTabChange, onAddProject }: FiltersPanelProps): ReactNode {
  const [showAddForm, setShowAddForm] = useState(false);
  const [gitUrl, setGitUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!gitUrl.trim()) return;
    setAdding(true);
    try {
      const match = gitUrl.match(/github\.com\/([^/]+)\/([^/\s]+)/);
      if (!match) {
        alert('请输入有效的 GitHub 仓库链接，如 https://github.com/owner/repo');
        return;
      }
      const owner = match[1];
      const name = match[2].replace(/\.git$/, '');
      const repoId = `${owner}/${name}`;
      await onAddProject({ repoId, name, owner, url: gitUrl.trim() });
      setGitUrl('');
      setShowAddForm(false);
      onTabChange('favorites');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="filters-panel">
      <div className="filters-title">发现控制</div>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`filter-btn ${activeTab === tab.key ? 'filter-btn-active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
      <div style={{ marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
        <button
          className="filter-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '取消添加' : '+ 添加项目链接'}
        </button>
        {showAddForm && (
          <div style={{ marginTop: 8 }}>
            <input
              className="add-project-input"
              placeholder="https://github.com/owner/repo"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              className="project-card-btn project-card-btn-primary"
              style={{ marginTop: 4, width: '100%' }}
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? '添加中...' : '收藏此项目'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
