import type { ReactNode } from "react";

export type PageId = "today" | "roadmap" | "projects" | "notes" | "progress";

interface AppShellProps { activePage: PageId; children: ReactNode; }

const navigation: Array<{ id: PageId; href: string; label: string }> = [
  { id: "today", href: "#/", label: "TODAY" },
  { id: "roadmap", href: "#/roadmap", label: "MAP" },
  { id: "projects", href: "#/projects", label: "PROJECTS" },
  { id: "notes", href: "#/notes", label: "NOTES" },
  { id: "progress", href: "#/progress", label: "PROGRESS" },
];

export function AppShell({ activePage, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar"><div className="topbar-inner"><a className="brand" href="#/" aria-label="IC Verify 首页"><span className="brand-mark" aria-hidden="true" />IC VERIFY</a><span className="version-label">LOCAL / V0.1</span></div></header>
      <main className="page-content">{children}</main>
      <nav className="bottom-nav" aria-label="主导航"><div className="bottom-nav-inner">
        {navigation.map((item) => <a aria-current={item.id === activePage ? "page" : undefined} className={`nav-link${item.id === activePage ? " active" : ""}`} href={item.href} key={item.id}>{item.label}</a>)}
      </div></nav>
    </div>
  );
}
