import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompareTray } from './CompareTray';
import type { CompareItem } from './CompareTray';

const mockItems: CompareItem[] = [
  { repoId: '1', name: 'test-repo', url: 'https://github.com/test-owner/test-repo' },
  { repoId: '2', name: 'another-repo', url: 'https://github.com/another-owner/another-repo' },
];

describe('CompareTray', () => {
  it('should trigger onExport when export button is clicked', () => {
    const handleExport = vi.fn();
    const handleRemove = vi.fn();
    render(
      <CompareTray
        items={mockItems}
        onRemove={handleRemove}
        onExport={handleExport}
      />,
    );

    const exportButton = screen.getByText('导出研究清单');
    exportButton.click();

    expect(handleExport).toHaveBeenCalledTimes(1);
  });

  it('should call onRemove when remove button is clicked', () => {
    const handleExport = vi.fn();
    const handleRemove = vi.fn();
    render(
      <CompareTray
        items={mockItems}
        onRemove={handleRemove}
        onExport={handleExport}
      />,
    );

    const removeButtons = screen.getAllByText('移除');
    removeButtons[0].click();

    expect(handleRemove).toHaveBeenCalledWith('1');
  });
});
