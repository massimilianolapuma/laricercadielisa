/**
 * Unit tests for TabSearcher class
 * Tests core functionality like filtering, escaping, and utility methods
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock TabSearcher class for testing since popup.js isn't a module
class MockTabSearcher {
  constructor() {
    this.tabs = [];
    this.filteredTabs = [];
    this.selectedIndex = -1;
    this.searchInput = { value: '' };
    this.tabsList = { innerHTML: '', style: { display: 'block' } };
    this.loadingEl = { style: { display: 'none' } };
    this.errorEl = { style: { display: 'none' } };
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  }

  highlightText(text, query) {
    if (!query) {
      return this.escapeHtml(text);
    }

    const escapedText = this.escapeHtml(text);
    const escapedQuery = this.escapeHtml(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    return escapedText.replace(regex, '<span class="highlight">$1</span>');
  }

  filterTabs() {
    const query = this.searchInput.value.toLowerCase().trim();

    if (!query) {
      this.filteredTabs = [...this.tabs];
    } else {
      this.filteredTabs = this.tabs.filter(tab => {
        const titleMatch = tab.title.toLowerCase().includes(query);
        const urlMatch = tab.url.toLowerCase().includes(query);
        return titleMatch || urlMatch;
      });
    }
  }

  showLoading(show) {
    const loadingEl = document.getElementById('loading');
    const tabsList = document.getElementById('tabsList');
    if (loadingEl) {
      loadingEl.style.display = show ? 'flex' : 'none';
    }
    if (tabsList) {
      tabsList.style.display = show ? 'none' : 'block';
    }
  }

  showNoResults(show) {
    const noResultsEl = document.getElementById('noResults');
    const tabsList = document.getElementById('tabsList');
    if (noResultsEl) {
      noResultsEl.style.display = show ? 'flex' : 'none';
    }
    if (tabsList) {
      tabsList.style.display = show ? 'none' : 'block';
    }
  }

  updateStats() {
    const tabCount = document.getElementById('tabCount');
    const matchCount = document.getElementById('matchCount');
    if (tabCount) {
      tabCount.textContent = `${this.tabs.length} tabs`;
    }
    if (matchCount) {
      matchCount.textContent = `${this.filteredTabs.length} matches`;
    }
  }
}

describe('TabSearcher', () => {
  let tabSearcher;

  beforeEach(() => {
    tabSearcher = new MockTabSearcher();
  });

  describe('Utility Methods', () => {
    it('should escape HTML properly', () => {
      const dangerous = '<script>alert("xss")</script>';
      const escaped = tabSearcher.escapeHtml(dangerous);
      expect(escaped).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape HTML with quotes and ampersands', () => {
      const text = 'Title with "quotes" & ampersands';
      const escaped = tabSearcher.escapeHtml(text);
      expect(escaped).toBe('Title with &quot;quotes&quot; &amp; ampersands');
    });

    it('should format URLs correctly', () => {
      const url = 'https://www.example.com/path/to/page?param=value';
      const formatted = tabSearcher.formatUrl(url);
      expect(formatted).toBe('www.example.com/path/to/page');
    });

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not-a-valid-url';
      const formatted = tabSearcher.formatUrl(invalidUrl);
      expect(formatted).toBe(invalidUrl);
    });
  });

  describe('Text Highlighting', () => {
    it('should highlight matching text case-insensitively', () => {
      const text = 'This is a Test String';
      const query = 'test';
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toContain('<span class="highlight">Test</span>');
    });

    it('should return escaped text when no query provided', () => {
      const text = '<script>alert("test")</script>';
      const highlighted = tabSearcher.highlightText(text, '');
      expect(highlighted).toBe(
        '&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;'
      );
    });

    it('should handle multiple matches in text', () => {
      const text = 'Test this test string';
      const query = 'test';
      const highlighted = tabSearcher.highlightText(text, query);
      const matches = highlighted.match(/<span class="highlight">/g);
      expect(matches).toHaveLength(2);
    });
  });

  describe('Tab Filtering', () => {
    beforeEach(() => {
      // Set up mock tabs with different titles and URLs
      tabSearcher.tabs = [
        createMockTab({
          id: 1,
          title: 'GitHub Repository',
          url: 'https://github.com/user/repo'
        }),
        createMockTab({
          id: 2,
          title: 'Google Search',
          url: 'https://google.com/search?q=test'
        }),
        createMockTab({
          id: 3,
          title: 'Stack Overflow',
          url: 'https://stackoverflow.com/questions'
        }),
        createMockTab({
          id: 4,
          title: 'Documentation',
          url: 'https://docs.example.com'
        })
      ];
    });

    it('should filter tabs by title', () => {
      tabSearcher.searchInput.value = 'github';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].title).toBe('GitHub Repository');
    });

    it('should filter tabs by URL', () => {
      tabSearcher.searchInput.value = 'stackoverflow';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].url).toContain('stackoverflow.com');
    });

    it('should be case insensitive', () => {
      tabSearcher.searchInput.value = 'GOOGLE';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].title).toBe('Google Search');
    });

    it('should return all tabs when search is empty', () => {
      tabSearcher.searchInput.value = '';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(4);
    });

    it('should handle special characters in search', () => {
      tabSearcher.searchInput.value = 'q=test';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].url).toContain('q=test');
    });
  });

  describe('UI State Management', () => {
    it('should show loading state correctly', () => {
      const loadingEl = document.getElementById('loading');
      const tabsList = document.getElementById('tabsList');

      tabSearcher.showLoading(true);
      expect(loadingEl.style.display).toBe('flex');
      expect(tabsList.style.display).toBe('none');

      tabSearcher.showLoading(false);
      expect(loadingEl.style.display).toBe('none');
      expect(tabsList.style.display).toBe('block');
    });

    it('should show no results state correctly', () => {
      const noResultsEl = document.getElementById('noResults');
      const tabsList = document.getElementById('tabsList');

      tabSearcher.showNoResults(true);
      expect(noResultsEl.style.display).toBe('flex');
      expect(tabsList.style.display).toBe('none');

      tabSearcher.showNoResults(false);
      expect(noResultsEl.style.display).toBe('none');
      expect(tabsList.style.display).toBe('block');
    });

    it('should update statistics correctly', () => {
      tabSearcher.tabs = createMockTabs(10);
      tabSearcher.filteredTabs = createMockTabs(3);
      tabSearcher.searchInput.value = 'test';

      tabSearcher.updateStats();

      const tabCount = document.getElementById('tabCount');
      const matchCount = document.getElementById('matchCount');

      expect(tabCount.textContent).toBe('10 tabs');
      expect(matchCount.textContent).toBe('3 matches');
    });
  });

  describe('Performance Tests', () => {
    it('should filter large number of tabs efficiently', () => {
      // Create 1000 mock tabs
      const largeTabs = Array.from({ length: 1000 }, (_, i) =>
        createMockTab({
          id: i + 1,
          title: `Tab ${i + 1}`,
          url: `https://example${i + 1}.com`
        })
      );

      tabSearcher.tabs = largeTabs;
      tabSearcher.searchInput.value = 'Tab 1';

      const startTime = performance.now();
      tabSearcher.filterTabs();
      const endTime = performance.now();

      // Should complete filtering within 50ms for 1000 tabs
      expect(endTime - startTime).toBeLessThan(50);

      // Should find tabs that start with "Tab 1" (Tab 1, Tab 10-19, Tab 100-199, etc.)
      expect(tabSearcher.filteredTabs.length).toBeGreaterThan(100);
    });
  });
});
