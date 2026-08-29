import type { ReactNode } from "react";
import type { Catalog, RouteId } from "../types";
import { ROUTES } from "../types";
import { CommandPalette } from "./CommandPalette";
import type { Listing } from "../types";

interface Props {
  catalog: Catalog;
  route: RouteId;
  navigate: (id: RouteId) => void;
  onOpen: (listing: Listing) => void;
  children: ReactNode;
}

export function AppShell({ catalog, route, navigate, onOpen, children }: Props) {
  const groups = [...new Set(ROUTES.map((item) => item.group))];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark">A</span>
          <span>
            Amazon Researcher
            <small>Roore · pickleball</small>
          </span>
        </a>
        <CommandPalette listings={catalog.listings} onOpen={onOpen} />
        {groups.map((group) => (
          <div key={group} className="nav-group">
            <div className="nav-group-label">{group}</div>
            {ROUTES.filter((item) => item.group === group).map((item) => (
              <button
                key={item.id}
                className={`nav-link ${route === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
        <div className="sidebar-stamp">{catalog.meta.source}</div>
      </aside>
      <div className="workspace">
        <main>{children}</main>
        <footer className="footer">{catalog.meta.feeAssumptions.monthlyProfitNote}</footer>
      </div>
    </div>
  );
}
