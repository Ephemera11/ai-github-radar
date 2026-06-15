import type { ReactNode } from 'react';

export type StatusType = 'idle' | 'loading' | 'error';

export interface StatusBannerProps {
  status: StatusType;
  updatedAt?: string;
  errorMessage?: string;
}

export function StatusBanner({ status, updatedAt, errorMessage }: StatusBannerProps): ReactNode {
  if (status === 'idle' && !updatedAt) return null;

  const loadingMessage = '刷新中...';
  const defaultError = '加载失败，请稍后重试';

  return (
    <div className={`status-banner status-${status}`}>
      {status === 'loading' && <span>{loadingMessage}</span>}
      {status === 'error' && <span>加载失败：{errorMessage || defaultError}</span>}
      {status === 'idle' && updatedAt && <span>最近更新时间：{updatedAt}</span>}
    </div>
  );
}
