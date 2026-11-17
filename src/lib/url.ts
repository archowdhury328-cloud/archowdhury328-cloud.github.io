/** Base-path-safe URL for files in /public. Works under "/" and under project sites such as "/research-portfolio/". */
export function assetUrl(path: string, base: string = import.meta.env.BASE_URL): string {
  const b = base.endsWith('/') ? base : `${base}/`;
  return `${b}${path.replace(/^\/+/, '')}`;
}

const ALLOWED_HOSTS = new Set([
  'scholar.google.com',
  'github.com',
  'doi.org',
  'api.crossref.org',
]);

/** True only for https URLs on the small allow-list of hosts this site links to. */
export function isSafeExternalUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && ALLOWED_HOSTS.has(u.hostname) && !u.username && !u.password;
  } catch {
    return false;
  }
}

/** Attributes every external link must carry. */
export const EXTERNAL_LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** Open an allow-listed external URL from a deliberate user gesture (never from timers or scroll). */
export function openExternal(raw: string): boolean {
  if (!isSafeExternalUrl(raw)) return false;
  const w = window.open(raw, '_blank', 'noopener,noreferrer');
  return w !== undefined;
}
