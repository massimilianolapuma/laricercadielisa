import { describe, it, expect } from 'vitest';

describe('TabSearcher Initialization Tests', () => {
  it('should have DOM elements available', () => {
    expect(document.getElementById('searchInput')).toBeTruthy();
    expect(document.getElementById('tabsList')).toBeTruthy();
    expect(document.getElementById('loading')).toBeTruthy();
    expect(document.getElementById('noResults')).toBeTruthy();
    expect(document.getElementById('tabCount')).toBeTruthy();
  });

  it('should have Chrome APIs mocked', () => {
    expect(chrome).toBeDefined();
    expect(chrome.tabs).toBeDefined();
    expect(chrome.tabs.query).toBeDefined();
    expect(chrome.tabs.update).toBeDefined();
    expect(chrome.tabs.remove).toBeDefined();
  });

  it('should initialize basic tab searcher functionality', async () => {
    const tabs = await chrome.tabs.query({});
    expect(tabs).toHaveLength(3);
    expect(tabs[0].title).toBe('Google');
  });
});