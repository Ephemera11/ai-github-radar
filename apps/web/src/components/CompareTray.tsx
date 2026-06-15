import type { ReactNode } from 'react';

export interface CompareItem {
  repoId: string;
  name: string;
  url: string;
}

export interface CompareTrayProps {
  items: CompareItem[];
  onRemove: (repoId: string) => void;
  onExport: () => void;
}

export function CompareTray({ items, onRemove, onExport }: CompareTrayProps): ReactNode {
  return (
    <div className="compare-tray">
      <div className="compare-tray-header">
        <span className="compare-tray-title">
          研究对比清单 ({items.length}/4)
        </span>
        {items.length > 0 && (
          <button
            className="project-card-btn project-card-btn-primary"
            onClick={onExport}
          >
            导出研究清单
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="compare-tray-empty">
          点击项目卡片上的"加入对比"按钮添加项目
        </div>
      ) : (
        <div className="compare-tray-list">
          {items.map((item) => (
            <div key={item.repoId} className="compare-tray-item">
              <a
                className="compare-tray-item-name"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
              </a>
              <button
                className="compare-tray-remove-btn"
                onClick={() => onRemove(item.repoId)}
                aria-label={`移除 ${item.name}`}
              >
                移除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
