import type { ReactNode } from 'react';

export interface LayoutShellProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export function LayoutShell({ left, center, right }: LayoutShellProps): ReactNode {
  return (
    <div className="app-layout">
      <aside className="left-panel">{left}</aside>
      <main className="center-content">{center}</main>
      <aside className="right-panel">{right}</aside>
    </div>
  );
}
