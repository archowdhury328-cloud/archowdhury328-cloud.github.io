import { About, ResearchMetrics } from './components/Sections';
import { Connect, CodeLinks, Footer } from './components/Connect';
import { EarthSection } from './components/EarthSection';
import { Hero } from './components/Hero';
import { Navigation } from './components/Navigation';
import { PublicationDirectory } from './components/PublicationDirectory';
import { SolarSection } from './components/SolarSection';
import { PreferencesProvider } from './hooks/useMotionPreference';
import { SelectionProvider, useSelection } from './lib/selection';

function Announcer() {
  const { announcement } = useSelection();
  return <p className="sr-only" role="status" aria-live="polite" data-testid="announcer">{announcement}</p>;
}

export default function App() {
  return (
    <PreferencesProvider>
      <SelectionProvider>
        <a className="skip-link" href="#main">Skip to content</a>
        <Navigation />
        <main id="main">
          <Hero />
          <ResearchMetrics />
          <About />
          <EarthSection />
          <SolarSection />
          <PublicationDirectory />
          <CodeLinks />
          <Connect />
        </main>
        <Footer />
        <Announcer />
      </SelectionProvider>
    </PreferencesProvider>
  );
}
