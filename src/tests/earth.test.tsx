import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { EarthSection } from '../components/EarthSection';
import { Hero } from '../components/Hero';
import { PublicationDirectory } from '../components/PublicationDirectory';
import { PreferencesProvider } from '../hooks/useMotionPreference';
import { SelectionProvider } from '../lib/selection';

const wrap = (ui: React.ReactNode) => render(<PreferencesProvider><SelectionProvider>{ui}</SelectionProvider></PreferencesProvider>);

describe('EarthSection', () => {
  it('reveals the supplied affiliation through an accessible disclosure', async () => {
    const user = userEvent.setup();
    wrap(<EarthSection />);
    const btn = screen.getByRole('button', { name: 'Show affiliation' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const card = document.getElementById('affil-card')!;
    expect(card).toBeVisible();
    expect(within(card).getByText('International American University')).toBeInTheDocument();
    expect(card.textContent).toContain('School of Business, Los Angeles, CA, USA');
  });

  it('labels decorative connections as a conceptual network, not collaborations', () => {
    wrap(<EarthSection />);
    expect(screen.getByText(/decorative, conceptual research network/)).toBeInTheDocument();
    expect(screen.getByText(/do not depict collaborations, partners or travel/)).toBeInTheDocument();
  });

  it('topic buttons are toggles that drive the shared directory filter', async () => {
    const user = userEvent.setup();
    wrap(
      <>
        <EarthSection />
        <PublicationDirectory />
      </>,
    );
    const eco = screen.getAllByRole('button', { name: /Economics & Society/ })[0]!;
    await user.click(eco);
    expect(eco).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Showing 2 of 15 publications')).toBeInTheDocument();
    await user.click(eco);
    expect(screen.getByText('Showing 15 of 15 publications')).toBeInTheDocument();
  });

  it('offers an explicit globe-interaction mode on touch-first devices', async () => {
    const user = userEvent.setup();
    wrap(<EarthSection />);
    const btn = screen.getByRole('button', { name: 'Interact with globe' });
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveTextContent('Exit globe interaction');
    await user.click(screen.getByRole('button', { name: 'Reset view' }));
  });
});

describe('Hero', () => {
  it('has HTML equivalents for every in-scene shortcut and a reset control', async () => {
    const user = userEvent.setup();
    wrap(<Hero />);
    const shortcuts = screen.getByRole('list', { name: 'Workstation shortcuts' });
    expect(within(shortcuts).getByRole('link', { name: 'Publications' })).toHaveAttribute('href', '#publications');
    expect(within(shortcuts).getByRole('link', { name: /Scholar/ })).toHaveAttribute('href', expect.stringContaining('scholar.google.com'));
    expect(within(shortcuts).getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/archowdhury328-cloud');
    await user.click(screen.getByRole('button', { name: 'Reset view' }));
  });
});
