/**
 * Unit tests for TabSearcher class
 * Tests core functionality like filtering, escaping, and utility methods
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabSearcher } from '../../popup.js';

/**
 * Helper function to create a mock tab object
 * @param {Object} options - Tab properties to override
 * @returns {Object} Mock tab object
 */
function createMockTab(options = {}) {
  return {
    id: 1,
    title: 'Test Tab',
    url: 'https://example.com',
    favIconUrl: 'https://example.com/favicon.ico',
    active: false,
    windowId: 1,
    ...options
  };
}

/**
 * Helper function to create multiple mock tabs
 * @param {number} count - Number of tabs to create
 * @returns {Array} Array of mock tab objects
 */
function createMockTabs(count) {
  return Array.from({ length: count }, (_, i) =>
    createMockTab({
      id: i + 1,
      title: `Test Tab ${i + 1}`,
      url: `https://example${i + 1}.com`
    })
  );
}

/**
 * Unit tests for TabSearcher class
 * Tests core functionality like filtering, escaping, and utility methods
 * Includes fix for multi-word search bug (v1.0.13)
 */

describe('TabSearcher Unit Tests', () => {
  let tabSearcher;

  beforeEach(() => {
    // Create a new instance for each test
    tabSearcher = new TabSearcher();

    // Mock DOM elements that TabSearcher expects
    tabSearcher.searchInput = { value: '', focus: vi.fn() };
    tabSearcher.tabsList = {
      innerHTML: '',
      style: { display: 'block' },
      querySelectorAll: () => []
    };
    tabSearcher.tabCountEl = { textContent: '' };
    tabSearcher.matchCountEl = { textContent: '', style: { display: 'none' } };
    tabSearcher.noResultsEl = { style: { display: 'none' } };
    tabSearcher.loadingEl = { style: { display: 'none' } };
    tabSearcher.clearSearchBtn = { style: { display: 'none' } };
    tabSearcher.refreshBtn = {
      addEventListener: () => {
        /* mock - intentionally empty */
      }
    };
    tabSearcher.closeOthersBtn = {
      addEventListener: () => {
        /* mock - intentionally empty */
      }
    };
  });

  describe('Core Functionality', () => {
    it('should filter tabs by title', () => {
      // Setup test data
      tabSearcher.tabs = createMockTabs(3);
      tabSearcher.searchInput.value = 'Test Tab 1';

      // Execute filter
      tabSearcher.filterTabs();

      // Verify results
      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].title).toBe('Test Tab 1');
    });

    it('should filter tabs by URL', () => {
      tabSearcher.tabs = [
        createMockTab({ id: 1, title: 'Test', url: 'https://example.com' }),
        createMockTab({ id: 2, title: 'Another', url: 'https://github.com' }),
        createMockTab({
          id: 3,
          title: 'Third',
          url: 'https://stackoverflow.com'
        })
      ];
      tabSearcher.searchInput.value = 'github';

      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].url).toBe('https://github.com');
    });

    it('should return all tabs when search is empty', () => {
      tabSearcher.tabs = createMockTabs(5);
      tabSearcher.searchInput.value = '';

      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(5);
    });

    it('should return empty array when no matches', () => {
      tabSearcher.tabs = createMockTabs(3);
      tabSearcher.searchInput.value = 'nonexistent';

      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(0);
    });
  });

  describe('HTML Escaping', () => {
    it('should escape HTML characters correctly', () => {
      const testCases = [
        {
          input: '<script>alert("xss")</script>',
          expected: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
        },
        { input: 'AT&T', expected: 'AT&amp;T' },
        { input: 'Hello "World"', expected: 'Hello &quot;World&quot;' },
        { input: "It's working", expected: 'It&#x27;s working' },
        { input: 'Normal text', expected: 'Normal text' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(tabSearcher.escapeHtml(input)).toBe(expected);
      });
    });
  });

  describe('URL Formatting', () => {
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

    it('should filter tabs by title case-insensitively', () => {
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
    it('should update statistics correctly', () => {
      tabSearcher.tabs = createMockTabs(10);
      tabSearcher.filteredTabs = createMockTabs(3);
      tabSearcher.searchInput.value = 'test';

      tabSearcher.updateStats();

      // updateStats shows the count of filtered tabs, not total tabs
      expect(tabSearcher.tabCountEl.textContent).toBe('3 tabs');
      expect(tabSearcher.matchCountEl.textContent).toBe('3 matches');
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

      // Should complete filtering within 150ms for 1000 tabs (allowing for CI/test environment variability)
      expect(endTime - startTime).toBeLessThan(150);

      // Should find tabs that start with "Tab 1" (Tab 1, Tab 10-19, Tab 100-199, etc.)
      expect(tabSearcher.filteredTabs.length).toBeGreaterThan(100);
    });
  });

  describe('Multi-word Search (Bug Fix v1.0.13)', () => {
    it('should correctly filter tabs with multi-word query "pivello 5"', () => {
      tabSearcher.tabs = [
        createMockTab({
          id: 1,
          title: 'Gmail - Search pivello 5',
          url: 'https://mail.google.com/search?q=pivello%205'
        }),
        createMockTab({
          id: 2,
          title: 'Gmail - Search pivello',
          url: 'https://mail.google.com/search?q=pivello'
        }),
        createMockTab({
          id: 3,
          title: 'Document pivello 5',
          url: 'https://docs.google.com/doc'
        }),
        createMockTab({
          id: 4,
          title: 'Test page 5',
          url: 'https://example.com/test5'
        })
      ];

      tabSearcher.searchInput.value = 'pivello 5';
      tabSearcher.filterTabs();

      // Should find tabs with BOTH "pivello" AND "5"
      expect(tabSearcher.filteredTabs).toHaveLength(2);
      expect(tabSearcher.filteredTabs[0].id).toBe(1);
      expect(tabSearcher.filteredTabs[1].id).toBe(3);
    });

    it('should correctly highlight multi-word text "pivello 5"', () => {
      const text = 'Gmail - Search pivello 5';
      const query = 'pivello 5';
      const highlighted = tabSearcher.highlightText(text, query);

      // Should contain highlight spans for both "pivello" and "5"
      expect(highlighted).toContain('<span class="highlight">pivello</span>');
      expect(highlighted).toContain('<span class="highlight">5</span>');

      // Should not have unescaped HTML
      expect(highlighted).not.toContain('<script>');

      // Should preserve original text structure
      expect(highlighted).toContain('Gmail - Search');
    });

    it('should handle multi-word search with special characters', () => {
      tabSearcher.tabs = [
        createMockTab({
          id: 1,
          title: 'Search & Filter test',
          url: 'https://example.com/search?q=filter&test=1'
        }),
        createMockTab({
          id: 2,
          title: 'Normal page',
          url: 'https://example.com/page'
        })
      ];

      tabSearcher.searchInput.value = 'search filter';
      tabSearcher.filterTabs();

      // Should find tab 1 (has both "search" and "filter")
      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].id).toBe(1);
    });

    it('should correctly highlight special characters without XSS', () => {
      const text = 'Test & Alert <script>';
      const query = 'test alert';
      const highlighted = tabSearcher.highlightText(text, query);

      // Should escape HTML entities
      expect(highlighted).toContain('&amp;');
      expect(highlighted).toContain('&lt;script&gt;');

      // Should NOT contain actual script tag
      expect(highlighted).not.toContain('<script>');
    });
  });

  describe('Search Persistence', () => {
    beforeEach(() => {
      tabSearcher.tabs = createMockTabs(3);
      tabSearcher.filteredTabs = [...tabSearcher.tabs];
      tabSearcher.searchInput = { value: '', focus: vi.fn() };
      tabSearcher.clearSearchBtn = { style: { display: 'none' } };
    });

    describe('toggleClearBtn', () => {
      it('should show the button when input has a value', () => {
        tabSearcher.searchInput.value = 'git';
        tabSearcher.toggleClearBtn();
        expect(tabSearcher.clearSearchBtn.style.display).toBe('flex');
      });

      it('should hide the button when input is empty', () => {
        tabSearcher.clearSearchBtn.style.display = 'flex';
        tabSearcher.searchInput.value = '';
        tabSearcher.toggleClearBtn();
        expect(tabSearcher.clearSearchBtn.style.display).toBe('none');
      });
    });

    describe('clearSearch', () => {
      it('should reset input value to empty string', () => {
        tabSearcher.searchInput.value = 'github';
        tabSearcher.clearSearch();
        expect(tabSearcher.searchInput.value).toBe('');
      });

      it('should hide the clear button', () => {
        tabSearcher.clearSearchBtn.style.display = 'flex';
        tabSearcher.clearSearch();
        expect(tabSearcher.clearSearchBtn.style.display).toBe('none');
      });

      it('should persist empty string to session storage', () => {
        tabSearcher.clearSearch();
        expect(global.chrome.storage.session.set).toHaveBeenCalledWith({ searchQuery: '' });
      });

      it('should restore all tabs after clearing', () => {
        tabSearcher.searchInput.value = 'github';
        tabSearcher.filterTabs();
        tabSearcher.clearSearch();
        expect(tabSearcher.filteredTabs).toHaveLength(3);
      });

      it('should focus the search input after clearing', () => {
        tabSearcher.clearSearch();
        expect(tabSearcher.searchInput.focus).toHaveBeenCalled();
      });
    });

    describe('saveSearchQuery', () => {
      it('should save the query to session storage', () => {
        tabSearcher.saveSearchQuery('github');
        expect(global.chrome.storage.session.set).toHaveBeenCalledWith({ searchQuery: 'github' });
      });

      it('should save an empty string to clear the persisted query', () => {
        tabSearcher.saveSearchQuery('');
        expect(global.chrome.storage.session.set).toHaveBeenCalledWith({ searchQuery: '' });
      });

      it('should handle storage errors gracefully', () => {
        global.chrome.storage.session.set.mockImplementationOnce(() => {
          throw new Error('Storage unavailable');
        });
        expect(() => tabSearcher.saveSearchQuery('test')).not.toThrow();
        expect(global.console.warn).toHaveBeenCalled();
      });
    });

    describe('restoreSearchQuery', () => {
      it('should restore the saved query and show clear button', async () => {
        global.chrome.storage.session.get.mockResolvedValueOnce({ searchQuery: 'github' });
        await tabSearcher.restoreSearchQuery();
        expect(tabSearcher.searchInput.value).toBe('github');
        expect(tabSearcher.clearSearchBtn.style.display).toBe('flex');
      });

      it('should filter tabs using the restored query', async () => {
        tabSearcher.tabs = [
          createMockTab({ id: 1, title: 'GitHub', url: 'https://github.com' }),
          createMockTab({ id: 2, title: 'Google', url: 'https://google.com' })
        ];
        global.chrome.storage.session.get.mockResolvedValueOnce({ searchQuery: 'github' });
        await tabSearcher.restoreSearchQuery();
        expect(tabSearcher.filteredTabs).toHaveLength(1);
        expect(tabSearcher.filteredTabs[0].title).toBe('GitHub');
      });

      it('should not change the input when storage is empty', async () => {
        global.chrome.storage.session.get.mockResolvedValueOnce({});
        await tabSearcher.restoreSearchQuery();
        expect(tabSearcher.searchInput.value).toBe('');
      });

      it('should handle storage errors gracefully', async () => {
        global.chrome.storage.session.get.mockRejectedValueOnce(new Error('Storage unavailable'));
        await expect(tabSearcher.restoreSearchQuery()).resolves.not.toThrow();
        expect(global.console.warn).toHaveBeenCalled();
      });
    });
  });
});
