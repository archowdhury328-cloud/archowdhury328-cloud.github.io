import { afterEach, describe, expect, it, vi } from 'vitest';
import { assetUrl, EXTERNAL_LINK_PROPS, isSafeExternalUrl, openExternal } from '../lib/url';

describe('assetUrl', () => {
  it('works at the site root', () => {
    expect(assetUrl('favicon.svg', '/')).toBe('/favicon.svg');
    expect(assetUrl('/social-preview/og.png', '/')).toBe('/social-preview/og.png');
  });
  it('respects a project-site base path with or without trailing slash', () => {
    expect(assetUrl('assets/x.png', '/research-portfolio/')).toBe('/research-portfolio/assets/x.png');
    expect(assetUrl('assets/x.png', '/research-portfolio')).toBe('/research-portfolio/assets/x.png');
  });
});

describe('external links', () => {
  afterEach(() => vi.restoreAllMocks());

  it('allows only https URLs on known hosts without credentials', () => {
    expect(isSafeExternalUrl('https://github.com/archowdhury328-cloud')).toBe(true);
    expect(isSafeExternalUrl('http://github.com/x')).toBe(false);
    expect(isSafeExternalUrl('https://evil.example/x')).toBe(false);
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeExternalUrl('https://user:pw@github.com/x')).toBe(false);
    expect(isSafeExternalUrl('not a url')).toBe(false);
  });

  it('carries noopener/noreferrer and opens in a new tab', () => {
    expect(EXTERNAL_LINK_PROPS).toEqual({ target: '_blank', rel: 'noopener noreferrer' });
  });

  it('openExternal refuses unsafe URLs and opens safe ones with noopener', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null);
    expect(openExternal('https://evil.example')).toBe(false);
    expect(spy).not.toHaveBeenCalled();
    expect(openExternal('https://scholar.google.com/citations?user=x')).toBe(true);
    expect(spy).toHaveBeenCalledWith('https://scholar.google.com/citations?user=x', '_blank', 'noopener,noreferrer');
  });
});
