import { useState } from "react";
import { DetailDrawer } from "./components/DetailDrawer";
import { useCatalog } from "./hooks/useCatalog";
import { useHashRoute } from "./hooks/useHashRoute";
import { useKeywords } from "./hooks/useKeywords";
import { Audit } from "./pages/Audit";
import { Keywords } from "./pages/Keywords";
import { Mine } from "./pages/Mine";
import { Research } from "./pages/Research";
import { ROUTES, type Listing } from "./types";

export default function App() {
  const [route, navigate] = useHashRoute();
  const { catalog, error } = useCatalog();
  const keywords = useKeywords();
  const [open, setOpen] = useState<Listing | null>(null);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!catalog) {
    return <div className="loading">Loading catalog…</div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#research">
          <span className="brand-mark">A</span>
          Amazon Researcher
        </a>
        <nav className="nav">
          {ROUTES.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${route === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="top-meta">{catalog.meta.source}</div>
      </header>

      <main>
        {route === "research" && <Research catalog={catalog} onOpen={setOpen} />}
        {route === "mine" && <Mine catalog={catalog} onOpen={setOpen} />}
        {route === "keywords" && (
          <Keywords listings={catalog.listings} {...keywords} />
        )}
        {route === "audit" && (
          <Audit
            listings={catalog.listings}
            onTrack={(phrase) => {
              keywords.trackPhrase(phrase);
              navigate("keywords");
            }}
          />
        )}
      </main>

      <footer className="footer">
        Amazon Researcher · Roore pickleball · {catalog.meta.source} · catalog reviews{" "}
        {catalog.meta.catalogReviews} · weighted {catalog.meta.weightedRating.toFixed(2)}
      </footer>

      {open && <DetailDrawer listing={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
