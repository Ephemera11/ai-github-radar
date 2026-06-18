import type { ReactNode } from 'react';
import type { ProjectRecord } from '@ai-radar/shared';
import { formatStars } from '../lib/format';

export interface ProjectCardProps {
  item: ProjectRecord;
  onSelect?: (item: ProjectRecord) => void;
  onCompare?: (item: ProjectRecord) => void;
  onDismiss?: (item: ProjectRecord) => void;
  onFavorite?: (item: ProjectRecord) => void;
  isFavorited?: boolean;
  isCompared?: boolean;
}

export function ProjectCard({ item, onSelect, onCompare, onDismiss, onFavorite, isFavorited, isCompared }: ProjectCardProps): ReactNode {
  return (
    <div className="project-card">
      <div className="project-card-header">
        <span className="project-card-name">{item.name}</span>
        <span className="project-card-stars">{formatStars(item.stars)} stars</span>
      </div>
      <p className="project-card-summary">{item.summary}</p>
      <div className="project-card-meta">
        <span className="project-card-language">{item.language}</span>
      </div>
      {item.recommendationReason && (
        <div className="project-card-reason">{item.recommendationReason}</div>
      )}
      <div className="project-card-actions">
        <button
          className="project-card-btn project-card-btn-primary"
          onClick={() => onSelect?.(item)}
        >
          查看详情
        </button>
        <button
          className={`project-card-btn ${isCompared ? 'project-card-btn-compared' : ''}`}
          onClick={() => onCompare?.(item)}
        >
          {isCompared ? '✓ 已加入对比' : '加入对比'}
        </button>
        <button
          className={`project-card-btn project-card-btn-fav ${isFavorited ? 'favorited' : ''}`}
          onClick={() => onFavorite?.(item)}
          title={isFavorited ? '取消收藏' : '收藏'}
        >
          {isFavorited ? '★' : '☆'}
        </button>
        <button
          className="project-card-btn project-card-btn-dismiss"
          onClick={() => onDismiss?.(item)}
          title="不再显示此项目"
        >
          不感兴趣
        </button>
      </div>
    </div>
  );
}
