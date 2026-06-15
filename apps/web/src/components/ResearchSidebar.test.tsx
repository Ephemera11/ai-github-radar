import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearchSidebar } from './ResearchSidebar';
import type { ProjectRecord } from '@ai-radar/shared';

const mockProject: ProjectRecord = {
  repoId: '1',
  name: 'test-repo',
  owner: 'test-owner',
  url: 'https://github.com/test-owner/test-repo',
  summary: 'A test repository',
  language: 'TypeScript',
  license: 'MIT',
  topics: ['testing', 'typescript'],
  stars: 65000,
  forks: 1000,
  pushedAt: '2024-01-01T00:00:00Z',
  last30dStars: 500,
  activityScore: 85.5,
  recommendationScore: 90.0,
  recommendationReason: 'High quality project',
};

describe('ResearchSidebar', () => {
  it('should call onSaveNote with updated text when saving note', () => {
    const handleSaveNote = vi.fn();
    render(
      <ResearchSidebar
        project={mockProject}
        note=""
        tags={[]}
        onSaveNote={handleSaveNote}
        onToggleTag={vi.fn()}
      />,
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a research note' } });

    const saveButton = screen.getByText('保存备注');
    fireEvent.click(saveButton);

    expect(handleSaveNote).toHaveBeenCalledWith('1', 'This is a research note');
  });
});
