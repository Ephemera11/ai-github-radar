import { useEffect, useState, useCallback, useMemo } from 'react';
import type { ProjectRecord } from '@ai-radar/shared';
import { LayoutShell } from './components/LayoutShell';
import { FiltersPanel } from './components/FiltersPanel';
import { ProjectTabs } from './components/ProjectTabs';
import { ProjectList } from './components/ProjectList';
import { StatusBanner } from './components/StatusBanner';
import { ResearchSidebar } from './components/ResearchSidebar';
import { CompareTray } from './components/CompareTray';
import { useResearchStore } from './store/useResearchStore';
import { downloadTextFile } from './lib/export';
import type { StatusType } from './components/StatusBanner';
import { getProjects, refreshProjects, hideProject, toggleFavorite, getFavorites, addProject as addProjectApi } from './lib/api';
import './styles.css';

export function App() {
  const [activeTab, setActiveTab] = useState('recommended');
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [status, setStatus] = useState<StatusType>('idle');
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [favoritedRepos, setFavoritedRepos] = useState<Set<string>>(new Set());

  const { compareItems, notes, tags, addCompare, removeCompare, saveNote, toggleTag } =
    useResearchStore();

  const loadFavorites = useCallback(async () => {
    try {
      const data = await getFavorites();
      setProjects(data.items ?? []);
      setUpdatedAt(new Date().toLocaleString());
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '加载收藏失败');
      setStatus('error');
    }
  }, []);

  const loadProjects = useCallback(async () => {
    if (activeTab === 'favorites') {
      await loadFavorites();
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      const data = await getProjects();
      setProjects(data.items ?? []);
      setUpdatedAt(new Date().toLocaleString());
      setStatus('idle');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '未知错误');
      setStatus('error');
    }
  }, [activeTab, loadFavorites]);

  const loadFavoritedSet = useCallback(async () => {
    try {
      const data = await getFavorites();
      setFavoritedRepos(new Set(data.items.map((p: ProjectRecord) => p.repoId)));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadFavoritedSet();
  }, [loadFavoritedSet]);

  const handleRefresh = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      await refreshProjects();
      const data = await getProjects();
      setProjects(data.items ?? []);
      setUpdatedAt(new Date().toLocaleString());
      setStatus('idle');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '刷新失败');
      setStatus('error');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'favorites') {
      loadFavorites();
    } else {
      loadProjects();
    }
  };

  const handleSelect = (item: ProjectRecord) => {
    setSelectedProject(item);
  };

  const handleCompare = (item: ProjectRecord) => {
    addCompare(item);
  };

  const handleDismiss = async (item: ProjectRecord) => {
    try {
      await hideProject(item.repoId);
      setProjects((current) => current.filter((p) => p.repoId !== item.repoId));
      if (selectedProject?.repoId === item.repoId) {
        setSelectedProject(null);
      }
    } catch {
      // 静默失败
    }
  };

  const handleFavorite = async (item: ProjectRecord) => {
    const isFav = favoritedRepos.has(item.repoId);
    try {
      await toggleFavorite(item.repoId, !isFav);
      const next = new Set(favoritedRepos);
      if (isFav) {
        next.delete(item.repoId);
      } else {
        next.add(item.repoId);
      }
      setFavoritedRepos(next);
    } catch {
      // 静默
    }
  };

  const handleAddProject = async (data: { repoId: string; name: string; url: string; summary?: string; language?: string }) => {
    await addProjectApi(data);
    await toggleFavorite(data.repoId, true);
    setFavoritedRepos((prev) => new Set(prev).add(data.repoId));
    await loadFavorites();
  };

  const handleExport = () => {
    const lines = compareItems.map(
      (item) => `${item.name} - ${item.url}`,
    );
    const content = `研究对比清单\n${'='.repeat(20)}\n\n${lines.join('\n')}\n`;
    downloadTextFile('研究对比清单.txt', content);
  };

  return (
    <LayoutShell
      left={
        <FiltersPanel
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAddProject={handleAddProject}
        />
      }
      center={
        <>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            AI GitHub 热门项目推荐研究台
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <ProjectTabs activeTab={activeTab} onTabChange={handleTabChange} />
            <button
              className="project-card-btn project-card-btn-primary"
              style={{ flexShrink: 0, height: 36 }}
              onClick={handleRefresh}
            >
              手动刷新
            </button>
          </div>
          <StatusBanner status={status} updatedAt={updatedAt} errorMessage={errorMessage} />
          <ProjectList
            items={projects}
            onSelect={handleSelect}
            onCompare={handleCompare}
            onDismiss={handleDismiss}
            onFavorite={handleFavorite}
            favoritedSet={favoritedRepos}
          />
          <CompareTray
            items={compareItems}
            onRemove={removeCompare}
            onExport={handleExport}
          />
        </>
      }
      right={
        <ResearchSidebar
          project={selectedProject}
          note={selectedProject ? notes[selectedProject.repoId] ?? '' : ''}
          tags={selectedProject ? tags[selectedProject.repoId] ?? [] : []}
          onSaveNote={saveNote}
          onToggleTag={toggleTag}
        />
      }
    />
  );
}
