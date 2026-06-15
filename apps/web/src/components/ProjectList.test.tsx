import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectList } from './ProjectList';
import type { ProjectRecord } from '@ai-radar/shared';

const mockItems: ProjectRecord[] = [
  {
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
    createdAt: '2023-06-01T00:00:00Z',
    last30dStars: 500,
    starGrowthRate: 0.09,
    activityScore: 85.5,
    recommendationScore: 90.0,
    recommendationReason: 'High quality project with excellent community engagement',
  },
  {
    repoId: '2',
    name: 'another-repo',
    owner: 'another-owner',
    url: 'https://github.com/another-owner/another-repo',
    summary: 'Another test repository',
    language: 'Python',
    license: 'Apache-2.0',
    topics: ['python', 'ml'],
    stars: 1200,
    forks: 300,
    pushedAt: '2024-02-15T00:00:00Z',
    createdAt: '2023-10-01T00:00:00Z',
    last30dStars: 50,
    starGrowthRate: 0.5,
    activityScore: 70.0,
    recommendationScore: 75.0,
    recommendationReason: 'Rising star in the ML community',
  },
];

describe('ProjectList', () => {
  it('should render project cards with recommendation reasons', () => {
    render(<ProjectList items={mockItems} />);

    expect(screen.getByText('test-repo')).toBeDefined();
    expect(screen.getByText('another-repo')).toBeDefined();
    expect(screen.getByText('High quality project with excellent community engagement')).toBeDefined();
    expect(screen.getByText('Rising star in the ML community')).toBeDefined();
  });

  it('should render project cards with formatted stars', () => {
    render(<ProjectList items={mockItems} />);

    expect(screen.getByText('65k stars')).toBeDefined();
    expect(screen.getByText('1k stars')).toBeDefined();
  });

  it('should render languages', () => {
    render(<ProjectList items={mockItems} />);

    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('Python')).toBeDefined();
  });

  it('should call onSelect when detail button is clicked', () => {
    const handleSelect = vi.fn();
    render(<ProjectList items={mockItems} onSelect={handleSelect} />);

    const buttons = screen.getAllByText('查看详情');
    buttons[0].click();
    expect(handleSelect).toHaveBeenCalledWith(mockItems[0]);
  });

  it('should call onCompare when compare button is clicked', () => {
    const handleCompare = vi.fn();
    render(<ProjectList items={mockItems} onCompare={handleCompare} />);

    const buttons = screen.getAllByText('加入对比');
    buttons[1].click();
    expect(handleCompare).toHaveBeenCalledWith(mockItems[1]);
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const handleDismiss = vi.fn();
    render(<ProjectList items={mockItems} onDismiss={handleDismiss} />);

    const buttons = screen.getAllByText('不感兴趣');
    buttons[0].click();
    expect(handleDismiss).toHaveBeenCalledWith(mockItems[0]);
  });
});
