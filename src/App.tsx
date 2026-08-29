import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { DetailDrawer } from "./components/DetailDrawer";
import { useCatalog } from "./hooks/useCatalog";
import { useClusters } from "./hooks/useClusters";
import { useHashRoute } from "./hooks/useHashRoute";
import { useKeywords } from "./hooks/useKeywords";
import { useSettings } from "./hooks/useSettings";
import { useKeywordRanks } from "./hooks/useKeywordRanks";
import { useWatchlist } from "./hooks/useWatchlist";
import { Competitors } from "./pages/Competitors";
import { Keywords } from "./pages/Keywords";
import { Mine } from "./pages/Mine";
import { Overview } from "./pages/Overview";
import { Profit } from "./pages/Profit";
import { Research } from "./pages/Research";
import { SettingsPage } from "./pages/SettingsPage";
import { Sourcing } from "./pages/Sourcing";
import { Studio } from "./pages/Studio";
import { Track } from "./pages/Track";
import type { Listing } from "./types";

export default function App() {
  const [route, navigate] = useHashRoute();
  const { catalog, error } = useCatalog();
  const keywords = useKeywords();
  const watch = useWatchlist();
  const [open, setOpen] = useState<Listing | null>(null);

  if (error) return <div className="error">{error}</div>;
  if (!catalog) return <div className="loading">Loading Roore catalog…</div>;

  return (
    <AppReady
      catalog={catalog}
      route={route}
      navigate={navigate}
      keywords={keywords}
      watch={watch}
      open={open}
      setOpen={setOpen}
    />
  );
}

function AppReady({
  catalog,
  route,
  navigate,
  keywords,
  watch,
  open,
  setOpen,
}: {
  catalog: NonNullable<ReturnType<typeof useCatalog>["catalog"]>;
  route: ReturnType<typeof useHashRoute>[0];
  navigate: ReturnType<typeof useHashRoute>[1];
  keywords: ReturnType<typeof useKeywords>;
  watch: ReturnType<typeof useWatchlist>;
  open: Listing | null;
  setOpen: (listing: Listing | null) => void;
}) {
  const settings = useSettings(catalog.meta.feeAssumptions);
  const clusters = useClusters(catalog.listings);
  const { ranks } = useKeywordRanks();

  return (
    <AppShell catalog={catalog} route={route} navigate={navigate} onOpen={setOpen}>
      {route === "overview" && <Overview catalog={catalog} onOpen={setOpen} />}
      {route === "research" && <Research catalog={catalog} onOpen={setOpen} />}
      {route === "mine" && <Mine catalog={catalog} onOpen={setOpen} />}
      {route === "competitors" && (
        <Competitors listings={catalog.listings} onOpen={setOpen} ranks={ranks} {...clusters} />
      )}
      {route === "keywords" && <Keywords listings={catalog.listings} ranks={ranks} {...keywords} />}
      {route === "studio" && (
        <Studio
          listings={catalog.listings}
          onTrack={(phrase) => {
            keywords.addKeyword(phrase);
            navigate("keywords");
          }}
        />
      )}
      {route === "profit" && <Profit listings={catalog.listings} fees={settings.fees} />}
      {route === "sourcing" && <Sourcing listings={catalog.listings} onOpen={setOpen} />}
      {route === "track" && (
        <Track listings={catalog.listings} onOpen={setOpen} {...watch} />
      )}
      {route === "settings" && (
        <SettingsPage meta={catalog.meta} fees={settings.fees} update={settings.update} reset={settings.reset} />
      )}
      {open && (
        <DetailDrawer
          listing={open}
          onClose={() => setOpen(null)}
          onTrack={(asin) => watch.pin(asin)}
        />
      )}
    </AppShell>
  );
}
