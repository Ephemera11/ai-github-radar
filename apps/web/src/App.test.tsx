import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App.js';

vi.mock('./lib/api', () => ({
  getProjects: vi.fn().mockResolvedValue({ items: [], updatedAt: '2026-06-15T00:00:00.000Z' }),
  refreshProjects: vi.fn().mockResolvedValue({ queued: true }),
}));

describe('App', () => {
  it('should render the title', async () => {
    render(<App />);
    expect(await screen.findByText('AI GitHub 热门项目推荐研究台')).toBeDefined();
  });

  it('should show loading status when clicking manual refresh button', async () => {
    render(<App />);
    const button = await screen.findByText('手动刷新');
    fireEvent.click(button);
    expect(await screen.findByText('刷新中...')).toBeDefined();
  });
});
