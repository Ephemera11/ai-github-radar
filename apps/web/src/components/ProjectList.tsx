import type { ReactNode } from 'react';
import type { ProjectRecord } from '@ai-radar/shared';
import { ProjectCard } from './ProjectCard';

export interface ProjectListProps {
  items: ProjectRecord[];
  onSelect?: (item: ProjectRecord) => void;
  onCompare?: (item: ProjectRecord) => void;
  onDismiss?: (item: ProjectRecord) => void;
  onFavorite?: (item: ProjectRecord) => void;
  favoritedSet?: Set<string>;
  comparedSet?: Set<string>;
}

export function ProjectList({ items, onSelect, onCompare, onDismiss, onFavorite, favoritedSet, comparedSet }: ProjectListProps): ReactNode {
  if (items.length === 0) {
    return <div className="project-list-empty">暂无项目数据</div>;
  }

  return (
    <div className="project-list">
      {items.map((item) => (
        <ProjectCard
          key={item.repoId}
          item={item}
          onSelect={onSelect}
          onCompare={onCompare}
          onDismiss={onDismiss}
          onFavorite={onFavorite}
          isFavorited={favoritedSet?.has(item.repoId)}
          isCompared={comparedSet?.has(item.repoId)}
        />
      ))}
    </div>
  );
}
