import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import App from '../App';
import { Navigation } from '../components/Navigation';
import { PublicationDetails } from '../components/PublicationDetails';
import { PublicationDirectory } from '../components/PublicationDirectory';
import { SolarSection } from '../components/SolarSection';
import { publicationById } from '../data/publications';
import { PreferencesProvider, usePreferences } from '../hooks/useMotionPreference';
import { SelectionProvider, useSelection } from '../lib/selection';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <SelectionProvider>{children}</SelectionProvider>
    </PreferencesProvider>
  );
}
const renderWith = (ui: React.ReactNode) => render(<Providers>{ui}</Providers>);

describe('Navigation', () => {
  it('exposes the four required anchors and a keyboard-operable mobile menu', async () => {
    const user = userEvent.setup();
    renderWith(<Navigation />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    ['About', 'Research', 'Publications', 'Connect'].forEach((l) => expect(within(nav).getByRole('link', { name: l })).toBeInTheDocument());

    const btn = screen.getByRole('button', { name: /menu/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(nav).toHaveClass('open');
    await user.keyboard('{Escape}');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).toHaveFocus(); // focus returns to the trigger
  });

  it('closes after choosing a destination', async () => {
    const user = userEvent.setup();
    renderWith(<Navigation />);
    await user.click(screen.getByRole('button', { name: /menu/i }));
    await user.click(screen.getByRole('link', { name: 'Connect' }));
    expect(screen.getByRole('button', { name: /menu/i })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('display preferences', () => {
  beforeEach(() => window.localStorage.clear());

  it('persists the pause and simple-view choices', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWith(<Navigation />);
    await user.click(screen.getByRole('button', { name: 'Pause animation' }));
    await user.click(screen.getByRole('button', { name: 'Switch to simple view' }));
    expect(window.localStorage.getItem('ru.paused')).toBe('1');
    expect(window.localStorage.getItem('ru.view')).toBe('simple');
    unmount();
    renderWith(<Navigation />);
    expect(screen.getByRole('button', { name: 'Resume animation' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Switch to 3D view' })).toBeInTheDocument();
  });

  it('works when storage is blocked', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    renderWith(<Navigation />);
    await user.click(screen.getByRole('button', { name: 'Pause animation' }));
    expect(screen.getByRole('button', { name: 'Resume animation' })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('disables automatic motion when the system requests reduced motion', () => {
    const mm = vi.fn().mockImplementation((q: string) => ({
      matches: q.includes('prefers-reduced-motion'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', { value: mm, configurable: true, writable: true });
    let animate: boolean | undefined;
    function Probe() {
      animate = usePreferences().animate;
      return null;
    }
    renderWith(<Probe />);
    expect(animate).toBe(false);
    renderWith(<Navigation />);
    expect(screen.getByRole('button', { name: 'Motion off (system)' })).toBeDisabled();
    Reflect.deleteProperty(window, 'matchMedia');
  });
});

describe('PublicationDirectory', () => {
  it('lists all 15 publications and the featured four', () => {
    const { container } = renderWith(<PublicationDirectory />);
    expect(screen.getByText('Showing 15 of 15 publications')).toBeInTheDocument();
    expect(container.querySelectorAll('ol.pub-list > li')).toHaveLength(15);
    expect(screen.getByRole('heading', { name: 'Featured research' })).toBeInTheDocument();
  });

  it('filters by search text, shows an empty state, and resets', async () => {
    const user = userEvent.setup();
    renderWith(<PublicationDirectory />);
    await user.type(screen.getByLabelText(/search title/i), 'churn');
    expect(screen.getByText('Showing 1 of 15 publications')).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/search title/i));
    await user.type(screen.getByLabelText(/search title/i), 'qqqqzz');
    expect(screen.getByText('No publications match these filters.')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Reset filters' })[0]!);
    expect(screen.getByText('Showing 15 of 15 publications')).toBeInTheDocument();
    expect(screen.getByLabelText(/search title/i)).toHaveValue('');
  });

  it('filters by year and topic and sorts by snapshot citations', async () => {
    const user = userEvent.setup();
    renderWith(<PublicationDirectory />);
    await user.selectOptions(screen.getByLabelText('Year'), '2025');
    expect(screen.getByText('Showing 1 of 15 publications')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Year'), 'all');
    await user.selectOptions(screen.getByLabelText('Topic'), 'Security & Privacy');
    expect(screen.getByText('Showing 4 of 15 publications')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Sort'), 'citations');
    const first = screen.getAllByRole('article').filter((a) => !a.classList.contains('featured-card'))[0]!;
    expect(within(first).getByRole('heading', { level: 3 }).textContent).toMatch(/AI-augmented big data analytics/);
  });

  it('gives every external link rel=noopener noreferrer and a new-tab target', () => {
    renderWith(<PublicationDirectory />);
    const external = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('http'));
    expect(external.length).toBeGreaterThan(30);
    external.forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
      expect(a.getAttribute('rel')).toContain('noreferrer');
    });
  });
});

describe('selection is shared between the list and the solar-system panel', () => {
  it('selecting in the list shows the details panel; clearing hides it; list view works without 3D', async () => {
    const user = userEvent.setup();
    renderWith(
      <>
        <SolarSection />
        <PublicationDirectory />
      </>,
    );
    expect(screen.getByText(/Select a publication satellite/)).toBeInTheDocument();
    // jsdom has no WebGL, so the scene falls back; the list view is still reachable.
    await user.click(screen.getByRole('button', { name: 'List view' }));
    const pick = screen.getByRole('button', { name: /Explainable churn prediction/ });
    await user.click(pick);
    const panel = screen.getByTestId('details');
    expect(within(panel).getByRole('link', { name: /Read publication/ })).toHaveAttribute('href', 'https://doi.org/10.1007/s44163-026-00983-0');
    expect(within(panel).getByRole('link', { name: /View on Scholar/ })).toHaveAttribute('href', expect.stringContaining('Se3iqnhoufwC'));
    expect(pick).toHaveAttribute('aria-pressed', 'true');

    // switching views keeps the selection
    await user.click(screen.getByRole('button', { name: '3D scene' }));
    expect(screen.getByTestId('details')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'List view' }));
    await user.click(within(screen.getByTestId('details')).getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByTestId('details')).not.toBeInTheDocument();
  });

  it('topic buttons filter the directory and "View all publications" resets', async () => {
    const user = userEvent.setup();
    renderWith(
      <>
        <SolarSection />
        <PublicationDirectory />
      </>,
    );
    const group = screen.getByRole('group', { name: 'Filter by topic' });
    await user.click(within(group).getByRole('button', { name: /Healthcare AI/ }));
    expect(screen.getByText('Showing 3 of 15 publications')).toBeInTheDocument();
    await user.click(within(group).getByRole('button', { name: 'View all publications' }));
    expect(screen.getByText('Showing 15 of 15 publications')).toBeInTheDocument();
  });

  it('represents all 15 publications exactly once in the list view', async () => {
    const user = userEvent.setup();
    renderWith(<SolarSection />);
    await user.click(screen.getByRole('button', { name: 'List view' }));
    const list = screen.getByRole('list', { name: 'Publications grouped by topic' });
    expect(within(list).getAllByRole('button')).toHaveLength(15);
  });

  it('announces selection changes for screen readers', async () => {
    const user = userEvent.setup();
    function Probe() {
      const s = useSelection();
      return (
        <>
          <button onClick={() => s.selectPublication('p01')}>pick</button>
          <p data-testid="live">{s.announcement}</p>
        </>
      );
    }
    renderWith(<Probe />);
    await user.click(screen.getByText('pick'));
    expect(screen.getByTestId('live').textContent).toMatch(/^Selected: A compact texture/);
  });
});

describe('PublicationDetails', () => {
  it('omits Read publication when no DOI exists is not applicable here, but never invents authors', () => {
    const p10 = publicationById('p10')!;
    render(<PublicationDetails pub={p10} onClear={() => undefined} />);
    expect(screen.getByText(/Author list not shown/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy BibTeX' })).not.toBeInTheDocument();
  });

  it('copies a citation and reports failure gracefully', async () => {
    const user = userEvent.setup();
    const p = publicationById('p03')!;
    render(<PublicationDetails pub={p} onClear={() => undefined} />);
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: write }, configurable: true });
    await user.click(screen.getByRole('button', { name: 'Copy citation' }));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('Explainable churn prediction'));
    expect(await screen.findByText('Citation copied.')).toBeInTheDocument();
    write.mockRejectedValueOnce(new Error('denied'));
    await user.click(screen.getByRole('button', { name: 'Copy BibTeX' }));
    expect(await screen.findByText(/Could not copy bibtex/i)).toBeInTheDocument();
  });
});

describe('App', () => {
  it('renders every required section with the exact name and affiliation and no fake extras', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByRole('heading', { level: 1, name: 'Md Asikur Rahman Chy' })).toBeInTheDocument();
    expect(screen.getAllByText(/School of Business, International American University, Los Angeles, CA, USA/).length).toBeGreaterThan(0);
    ['#snapshot', '#about', '#research', '#solar-system', '#publications', '#code', '#connect'].forEach((id) => expect(document.querySelector(id)).not.toBeNull());
    expect(screen.getByRole('link', { name: 'Explore publications' })).toHaveAttribute('href', '#publications');
    expect(screen.queryByText(/download cv/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('form', { name: /contact/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Google Scholar snapshot supplied by the author\./)).toBeInTheDocument();
    expect(screen.getAllByText('146').length).toBeGreaterThan(0);
    expect(screen.getByText('15 listed publications')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });

  it('shows polished fallbacks (not blank boxes) when WebGL is unavailable', async () => {
    await act(async () => {
      render(<App />);
    });
    const notes = screen.getAllByText(/Interactive 3D preview unavailable/);
    expect(notes).toHaveLength(3); // hero, earth, solar system
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(3);
  });
});
