import { useState, type ReactNode } from 'react';
import type { ProjectRecord } from '@ai-radar/shared';

export interface ResearchSidebarProps {
  project: ProjectRecord | null;
  note: string;
  tags: string[];
  onSaveNote: (repoId: string, note: string) => void;
  onToggleTag: (repoId: string, tag: string) => void;
}

const TAG_OPTIONS = ['Agent', 'RAG', 'Infra', '值得跟进'];

export function ResearchSidebar({
  project,
  note,
  tags,
  onSaveNote,
  onToggleTag,
}: ResearchSidebarProps): ReactNode {
  const [localNote, setLocalNote] = useState(note);

  if (!project) {
    return (
      <div className="sidebar-placeholder">
        请选择一个项目查看详情
      </div>
    );
  }

  const handleSave = () => {
    onSaveNote(project.repoId, localNote);
  };

  return (
    <div className="research-sidebar">
      <h2 className="research-sidebar-title">{project.name}</h2>
      <div className="research-sidebar-reason">
        <strong>推荐理由：</strong>
        <p>{project.recommendationReason}</p>
      </div>

      <div className="research-sidebar-section">
        <label className="research-sidebar-label" htmlFor="research-note">
          备注
        </label>
        <textarea
          id="research-note"
          className="research-sidebar-textarea"
          rows={4}
          value={localNote}
          onChange={(e) => setLocalNote(e.target.value)}
        />
        <button className="project-card-btn project-card-btn-primary" onClick={handleSave}>
          保存备注
        </button>
      </div>

      <div className="research-sidebar-section">
        <span className="research-sidebar-label">标签</span>
        <div className="research-sidebar-tags">
          {TAG_OPTIONS.map((tag) => {
            const isPressed = tags.includes(tag);
            return (
              <button
                key={tag}
                className={`research-sidebar-tag${isPressed ? ' research-sidebar-tag-active' : ''}`}
                aria-pressed={isPressed}
                onClick={() => onToggleTag(project.repoId, tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
