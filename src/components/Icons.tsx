import type { SVGProps } from 'react';

/** Small inline icon set (24px grid, 1.75 stroke). Decorative by default: the adjacent text carries the meaning. */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="icon"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** GitHub mark, used only to label links that go to GitHub. */
export const IconGitHub = ({ size = 18, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="icon" fill="currentColor" {...rest}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

/** Graduation cap, used for Google Scholar links (generic symbol, not the Scholar logo). */
export const IconScholar = (p: P) => (
  <Base {...p}>
    <path d="M2 9.5 12 4l10 5.5L12 15 2 9.5Z" />
    <path d="M6 11.7V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.3" />
    <path d="M22 9.5V15" />
  </Base>
);
export const IconArrowUpRight = (p: P) => (
  <Base {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Base>
);
export const IconArrowDown = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14" />
    <path d="m6 13 6 6 6-6" />
  </Base>
);
export const IconBook = (p: P) => (
  <Base {...p}>
    <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22.5Z" />
    <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5a2.5 2.5 0 0 1 2.5 2.5Z" />
  </Base>
);
export const IconQuote = (p: P) => (
  <Base {...p}>
    <path d="M7 7h4v4c0 3-1.5 5-4 6" />
    <path d="M15 7h4v4c0 3-1.5 5-4 6" />
  </Base>
);
export const IconCode = (p: P) => (
  <Base {...p}>
    <path d="m8 7-5 5 5 5" />
    <path d="m16 7 5 5-5 5" />
  </Base>
);
export const IconSearch = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);
export const IconPause = (p: P) => (
  <Base {...p}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </Base>
);
export const IconPlay = (p: P) => (
  <Base {...p}>
    <path d="M7 4.5v15l12-7.5L7 4.5Z" />
  </Base>
);
export const IconCube = (p: P) => (
  <Base {...p}>
    <path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9L12 2.5Z" />
    <path d="M3 7.5 12 12.5l9-5" />
    <path d="M12 12.5v9" />
  </Base>
);
export const IconList = (p: P) => (
  <Base {...p}>
    <path d="M9 6h12M9 12h12M9 18h12" />
    <circle cx="4.5" cy="6" r="1" />
    <circle cx="4.5" cy="12" r="1" />
    <circle cx="4.5" cy="18" r="1" />
  </Base>
);
export const IconPin = (p: P) => (
  <Base {...p}>
    <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Base>
);
export const IconReset = (p: P) => (
  <Base {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3 3.5V8h4.5" />
  </Base>
);
export const IconHand = (p: P) => (
  <Base {...p}>
    <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5" />
    <path d="M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.6-2.2L3.3 16a1.6 1.6 0 0 1 2.4-2l2.3 2" />
  </Base>
);
export const IconCopy = (p: P) => (
  <Base {...p}>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
  </Base>
);
export const IconChevron = (p: P) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);
export const IconSpark = (p: P) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </Base>
);

/* Research-interest icons */
export const IconBrain = (p: P) => (
  <Base {...p}>
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h0a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
    <path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h0a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  </Base>
);
export const IconChart = (p: P) => (
  <Base {...p}>
    <path d="M3 3v18h18" />
    <path d="m7 15 4-4 3 3 6-7" />
  </Base>
);
export const IconPulse = (p: P) => (
  <Base {...p}>
    <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
  </Base>
);
export const IconShield = (p: P) => (
  <Base {...p}>
    <path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);
export const IconScale = (p: P) => (
  <Base {...p}>
    <path d="M12 3v18M5 21h14M6 7h12" />
    <path d="m6 7-3 7a3 3 0 0 0 6 0L6 7ZM18 7l-3 7a3 3 0 0 0 6 0l-3-7Z" />
  </Base>
);
export const IconFactory = (p: P) => (
  <Base {...p}>
    <path d="M3 21V10l6 4V10l6 4V5h6v16H3Z" />
    <path d="M7 17h2M12 17h2M17 17h1" />
  </Base>
);
