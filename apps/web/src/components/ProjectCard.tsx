import { useState, type ReactNode } from 'react';
import type { ProjectRecord } from '@ai-radar/shared';
import { formatStars } from '../lib/format';

export interface ProjectCardProps {
  item: ProjectRecord;
  onSelect?: (item: ProjectRecord) => void;
  onCompare?: (item: ProjectRecord) => void;
  onDismiss?: (item: ProjectRecord) => void;
  onFavorite?: (item: ProjectRecord) => void;
  onSummarize?: (item: ProjectRecord) => Promise<string>;
  isFavorited?: boolean;
  isCompared?: boolean;
}

export function ProjectCard({ item, onSelect, onCompare, onDismiss, onFavorite, onSummarize, isFavorited, isCompared }: ProjectCardProps): ReactNode {
  const [showReason, setShowReason] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!onSummarize || summarizing) return;
    setSummarizing(true);
    try {
      const result = await onSummarize(item);
      setSummary(result);
    } catch {
      setSummary('AI 总结生成失败，请稍后重试');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <a
          className="project-card-name"
          href={item.url}
          target="_blank"
          rel="noreferrer"
        >
          {item.name}
        </a>
        <span className="project-card-stars">{formatStars(item.stars)} stars</span>
      </div>
      <p className="project-card-summary">{item.summary}</p>
      <div className="project-card-meta">
        <span className="project-card-language">{item.language}</span>
      </div>
      {item.recommendationReason && (
        <div>
          <button
            className="reason-toggle-btn"
            onClick={() => setShowReason(!showReason)}
          >
            {showReason ? '▾ 收起理由' : '▸ 上榜理由'}
          </button>
          {showReason && (
            <div className="project-card-reason">{item.recommendationReason}</div>
          )}
        </div>
      )}
      {summary && (
        <div className="project-card-ai-summary">
          <div className="ai-summary-label">🤖 AI 简介</div>
          <p>{summary}</p>
        </div>
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
        {onSummarize && (
          <button
            className="project-card-btn project-card-btn-ai"
            onClick={handleSummarize}
            disabled={summarizing}
          >
            {summarizing ? '⏳ 生成中…' : summary ? '✓ 重新生成' : '🤖 AI 总结'}
          </button>
        )}
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
