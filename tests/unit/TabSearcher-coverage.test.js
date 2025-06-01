/**
 * Comprehensive coverage tests for TabSearcher class
 * Tests all methods, edge cases, and error scenarios for maximum code coverage
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
      url: `https://example${i + 1}.com`,
      active: i === 0 // First tab is active
    })
  );
}

/**
 * Create mock DOM element with basic properties
 * @param {string} innerHTML - Initial innerHTML
 * @returns {Object} Mock DOM element
 */
function createMockElement(innerHTML = '') {
  return {
    innerHTML,
    style: { display: '' },
    value: '',
    textContent: '',
    addEventListener: vi.fn(),
    click: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    scrollIntoView: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    querySelector: vi.fn(() => null),
    dataset: {},
    classList: {
      contains: vi.fn(),
      add: vi.fn(),
      remove: vi.fn()
    }
  };
}

describe('TabSearcher Coverage Tests', () => {
  let tabSearcher;
  let mockChrome;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create TabSearcher instance
    tabSearcher = new TabSearcher();

    // Mock DOM elements
    tabSearcher.searchInput = createMockElement();
    tabSearcher.tabsList = createMockElement();
    tabSearcher.tabCountEl = createMockElement();
    tabSearcher.matchCountEl = createMockElement();
    tabSearcher.noResultsEl = createMockElement();
    tabSearcher.loadingEl = createMockElement();
    tabSearcher.refreshBtn = createMockElement();
    tabSearcher.closeOthersBtn = createMockElement();

    // Mock Chrome API
    mockChrome = {
      tabs: {
        query: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        get: vi.fn()
      },
      windows: {
        update: vi.fn()
      }
    };
    global.chrome = mockChrome;

    // Mock window.close
    global.window = {
      close: vi.fn()
    };

    // Mock console methods
    global.console = {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize with empty arrays and null currentTabId', () => {
      const searcher = new TabSearcher();
      expect(searcher.tabs).toEqual([]);
      expect(searcher.filteredTabs).toEqual([]);
      expect(searcher.currentTabId).toBeNull();
    });
  });

  describe('loadTabs method', () => {
    it('should load tabs successfully', async () => {
      const mockTabs = createMockTabs(3);
      mockChrome.tabs.query.mockResolvedValue(mockTabs);
      mockChrome.tabs.query.mockResolvedValueOnce(mockTabs).mockResolvedValueOnce([mockTabs[0]]);

      await tabSearcher.loadTabs();

      expect(mockChrome.tabs.query).toHaveBeenCalledWith({});
      expect(tabSearcher.tabs.length).toBe(3);
      expect(tabSearcher.currentTabId).toBe(1); // First active tab
    });

    it('should handle Chrome API errors gracefully', async () => {
      const error = new Error('Chrome API error');
      mockChrome.tabs.query.mockRejectedValue(error);

      await tabSearcher.loadTabs();

      expect(console.error).toHaveBeenCalledWith('Error loading tabs:', error);
      expect(tabSearcher.loadingEl.style.display).toBe('none');
    });

    it('should handle tabs without active tab', async () => {
      const mockTabs = createMockTabs(2).map(tab => ({ ...tab, active: false }));
      mockChrome.tabs.query.mockResolvedValueOnce(mockTabs).mockResolvedValueOnce([]);

      await tabSearcher.loadTabs();

      expect(tabSearcher.currentTabId).toBeNull();
    });

    it('should handle empty tabs array', async () => {
      mockChrome.tabs.query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      await tabSearcher.loadTabs();

      expect(tabSearcher.tabs).toEqual([]);
      expect(tabSearcher.filteredTabs).toEqual([]);
      expect(tabSearcher.currentTabId).toBeNull();
    });
  });

  describe('filterTabs method', () => {
    beforeEach(() => {
      tabSearcher.tabs = [
        createMockTab({ id: 1, title: 'GitHub - Tab Search', url: 'https://github.com/project' }),
        createMockTab({ id: 2, title: 'Google Search', url: 'https://google.com/search?q=test' }),
        createMockTab({ id: 3, title: 'Stack Overflow', url: 'https://stackoverflow.com/questions' }),
        createMockTab({ id: 4, title: 'MDN Web Docs', url: 'https://developer.mozilla.org' })
      ];
    });

    it('should filter tabs by title', () => {
      tabSearcher.searchInput.value = 'github';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].title).toBe('GitHub - Tab Search');
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

    it('should handle empty search query', () => {
      tabSearcher.searchInput.value = '';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(4);
    });

    it('should handle whitespace-only search query', () => {
      tabSearcher.searchInput.value = '   ';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(4);
    });

    it('should return empty array for no matches', () => {
      tabSearcher.searchInput.value = 'nonexistent';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(0);
    });

    it('should filter by partial matches', () => {
      tabSearcher.searchInput.value = 'web';
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].title).toBe('MDN Web Docs');
    });
  });

  describe('renderTabs method', () => {
    beforeEach(() => {
      tabSearcher.filteredTabs = [
        createMockTab({ id: 1, title: 'Test Tab 1', url: 'https://example1.com' }),
        createMockTab({ id: 2, title: 'Test Tab 2', url: 'https://example2.com', active: true })
      ];
    });

    it('should render tabs correctly', () => {
      tabSearcher.renderTabs();

      expect(tabSearcher.tabsList.innerHTML).toContain('Test Tab 1');
      expect(tabSearcher.tabsList.innerHTML).toContain('Test Tab 2');
      expect(tabSearcher.tabsList.innerHTML).toContain('example1.com');
      expect(tabSearcher.tabsList.innerHTML).toContain('example2.com');
    });

    it('should handle tabs without favicon', () => {
      tabSearcher.filteredTabs = [
        createMockTab({ id: 1, title: 'No Favicon Tab', favIconUrl: undefined })
      ];

      tabSearcher.renderTabs();

      expect(tabSearcher.tabsList.innerHTML).toContain('No Favicon Tab');
    });

    it('should handle tabs with empty favicon', () => {
      tabSearcher.filteredTabs = [
        createMockTab({ id: 1, title: 'Empty Favicon Tab', favIconUrl: '' })
      ];

      tabSearcher.renderTabs();

      expect(tabSearcher.tabsList.innerHTML).toContain('Empty Favicon Tab');
    });

    it('should mark active tab', () => {
      tabSearcher.currentTabId = 2;
      tabSearcher.renderTabs();

      expect(tabSearcher.tabsList.innerHTML).toContain('tab-item active');
    });
  });

  describe('switchToTab method', () => {
    it('should switch to tab successfully', async () => {
      const mockTab = createMockTab({ id: 5, windowId: 2 });
      mockChrome.tabs.update.mockResolvedValue();
      mockChrome.tabs.get.mockResolvedValue(mockTab);
      mockChrome.windows.update.mockResolvedValue();

      await tabSearcher.switchToTab(5);

      expect(mockChrome.tabs.update).toHaveBeenCalledWith(5, { active: true });
      expect(mockChrome.tabs.get).toHaveBeenCalledWith(5);
      expect(mockChrome.windows.update).toHaveBeenCalledWith(2, { focused: true });
    });

    it('should handle tab switching errors', async () => {
      const error = new Error('Tab switch error');
      mockChrome.tabs.update.mockRejectedValue(error);

      await tabSearcher.switchToTab(5);

      expect(console.error).toHaveBeenCalledWith('Error switching to tab:', error);
    });

    it('should handle tab get errors', async () => {
      mockChrome.tabs.update.mockResolvedValue();
      mockChrome.tabs.get.mockRejectedValue(new Error('Tab get error'));

      await tabSearcher.switchToTab(5);

      expect(mockChrome.tabs.update).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('closeTab method', () => {
    it('should close tab successfully', async () => {
      mockChrome.tabs.remove.mockResolvedValue();
      tabSearcher.tabs = createMockTabs(3);

      await tabSearcher.closeTab(2);

      expect(mockChrome.tabs.remove).toHaveBeenCalledWith(2);
      expect(tabSearcher.tabs).toHaveLength(2);
    });

    it('should handle tab closing errors', async () => {
      const error = new Error('Close tab error');
      mockChrome.tabs.remove.mockRejectedValue(error);

      await tabSearcher.closeTab(2);

      expect(console.error).toHaveBeenCalledWith('Error closing tab:', error);
    });

    it('should not remove tab from array if Chrome API fails', async () => {
      mockChrome.tabs.remove.mockRejectedValue(new Error('API Error'));
      tabSearcher.tabs = createMockTabs(3);

      await tabSearcher.closeTab(2);

      expect(tabSearcher.tabs).toHaveLength(3); // Should remain unchanged
    });
  });

  describe('closeOtherTabs method', () => {
    beforeEach(() => {
      tabSearcher.tabs = createMockTabs(5);
      tabSearcher.currentTabId = 3;
    });

    it('should close other tabs successfully', async () => {
      mockChrome.tabs.remove.mockResolvedValue();
      global.confirm = vi.fn().mockReturnValue(true);

      await tabSearcher.closeOtherTabs();

      expect(global.confirm).toHaveBeenCalled();
      expect(mockChrome.tabs.remove).toHaveBeenCalledWith([1, 2, 4, 5]);
    });

    it('should not close tabs if user cancels', async () => {
      global.confirm = vi.fn().mockReturnValue(false);

      await tabSearcher.closeOtherTabs();

      expect(mockChrome.tabs.remove).not.toHaveBeenCalled();
    });

    it('should handle no current tab', async () => {
      tabSearcher.currentTabId = null;
      global.confirm = vi.fn().mockReturnValue(true);

      await tabSearcher.closeOtherTabs();

      expect(mockChrome.tabs.remove).not.toHaveBeenCalled();
    });

    it('should handle Chrome API errors', async () => {
      global.confirm = vi.fn().mockReturnValue(true);
      const error = new Error('Close tabs error');
      mockChrome.tabs.remove.mockRejectedValue(error);

      await tabSearcher.closeOtherTabs();

      expect(console.error).toHaveBeenCalledWith('Error closing other tabs:', error);
    });

    it('should not close pinned tabs', async () => {
      // Create tabs with some pinned
      tabSearcher.tabs = [
        createMockTab({ id: 1, pinned: true }),
        createMockTab({ id: 2, pinned: false }),
        createMockTab({ id: 3, pinned: false }), // current tab
        createMockTab({ id: 4, pinned: true }),
        createMockTab({ id: 5, pinned: false })
      ];
      tabSearcher.currentTabId = 3;

      mockChrome.tabs.remove.mockResolvedValue();
      global.confirm = vi.fn().mockReturnValue(true);

      await tabSearcher.closeOtherTabs();

      expect(mockChrome.tabs.remove).toHaveBeenCalledWith([2, 5]); // Only non-pinned, non-current tabs
    });
  });

  describe('updateStats method', () => {
    it('should update tab stats correctly', () => {
      tabSearcher.tabs = createMockTabs(10);
      tabSearcher.filteredTabs = createMockTabs(3);
      tabSearcher.searchInput.value = 'test';

      tabSearcher.updateStats();

      expect(tabSearcher.tabCountEl.textContent).toBe('10 tabs');
      expect(tabSearcher.matchCountEl.textContent).toBe('3 matches');
    });

    it('should handle zero tabs', () => {
      tabSearcher.tabs = [];
      tabSearcher.filteredTabs = [];

      tabSearcher.updateStats();

      expect(tabSearcher.tabCountEl.textContent).toBe('0 tabs');
      expect(tabSearcher.matchCountEl.style.display).toBe('none');
    });

    it('should handle single tab', () => {
      tabSearcher.tabs = createMockTabs(1);
      tabSearcher.filteredTabs = createMockTabs(1);

      tabSearcher.updateStats();

      expect(tabSearcher.tabCountEl.textContent).toBe('1 tab');
    });
  });

  describe('showNoResults method', () => {
    it('should show no results when true', () => {
      tabSearcher.showNoResults(true);
      expect(tabSearcher.noResultsEl.style.display).toBe('flex');
      expect(tabSearcher.tabsList.style.display).toBe('none');
    });

    it('should hide no results when false', () => {
      tabSearcher.showNoResults(false);
      expect(tabSearcher.noResultsEl.style.display).toBe('none');
      expect(tabSearcher.tabsList.style.display).toBe('block');
    });
  });

  describe('showLoading method', () => {
    it('should show loading when true', () => {
      tabSearcher.showLoading(true);
      expect(tabSearcher.loadingEl.style.display).toBe('flex');
      expect(tabSearcher.tabsList.style.display).toBe('none');
    });

    it('should hide loading when false', () => {
      tabSearcher.showLoading(false);
      expect(tabSearcher.loadingEl.style.display).toBe('none');
      expect(tabSearcher.tabsList.style.display).toBe('block');
    });
  });

  describe('escapeHtml method', () => {
    it('should escape HTML entities', () => {
      const html = '<script>alert("xss")</script>';
      const escaped = tabSearcher.escapeHtml(html);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should escape ampersands', () => {
      const html = 'Tom & Jerry';
      const escaped = tabSearcher.escapeHtml(html);
      expect(escaped).toBe('Tom &amp; Jerry');
    });

    it('should handle empty string', () => {
      const escaped = tabSearcher.escapeHtml('');
      expect(escaped).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(tabSearcher.escapeHtml(null)).toBe('null');
      expect(tabSearcher.escapeHtml(undefined)).toBe('undefined');
    });

    it('should handle strings without special characters', () => {
      const text = 'Normal text';
      const escaped = tabSearcher.escapeHtml(text);
      expect(escaped).toBe('Normal text');
    });

    it('should escape all HTML entities', () => {
      const html = '&<>"\'';
      const escaped = tabSearcher.escapeHtml(html);
      expect(escaped).toBe('&amp;&lt;&gt;&quot;&#x27;');
    });
  });

  describe('highlightText method', () => {
    it('should highlight single match', () => {
      const text = 'Hello World';
      const query = 'world';
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toBe('Hello <span class="highlight">World</span>');
    });

    it('should highlight multiple matches', () => {
      const text = 'test test test';
      const query = 'test';
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toBe('<span class="highlight">test</span> <span class="highlight">test</span> <span class="highlight">test</span>');
    });

    it('should be case insensitive', () => {
      const text = 'JavaScript';
      const query = 'SCRIPT';
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toBe('Java<span class="highlight">Script</span>');
    });

    it('should handle empty query', () => {
      const text = 'Hello World';
      const query = '';
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toBe('Hello World');
    });

    it('should handle empty text', () => {
      const text = '';
      const query = 'test';
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toBe('');
    });

    it('should handle no matches', () => {
      const text = 'Hello World';
      const query = 'xyz';
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toBe('Hello World');
    });

    it('should escape HTML in text', () => {
      const text = '<script>alert("test")</script>';
      const query = 'script';
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toContain('&lt;');
      expect(highlighted).toContain('&gt;');
      expect(highlighted).toContain('<span class="highlight">script</span>');
    });
  });

  describe('formatUrl method', () => {
    it('should format valid URLs correctly', () => {
      const url = 'https://www.example.com/path/to/page?query=value';
      const formatted = tabSearcher.formatUrl(url);
      expect(formatted).toBe('www.example.com/path/to/page');
    });

    it('should handle invalid URLs', () => {
      const invalidUrl = 'not-a-valid-url';
      const formatted = tabSearcher.formatUrl(invalidUrl);
      expect(formatted).toBe(invalidUrl);
    });

    it('should handle URLs without path', () => {
      const url = 'https://example.com';
      const formatted = tabSearcher.formatUrl(url);
      expect(formatted).toBe('example.com/');
    });
  });

  describe('createTabHTML method', () => {
    it('should create HTML for tab with favicon', () => {
      const tab = createMockTab({ id: 1, title: 'Test Tab', url: 'https://example.com' });
      tabSearcher.currentTabId = null;
      tabSearcher.searchInput.value = '';

      const html = tabSearcher.createTabHTML(tab);

      expect(html).toContain('Test Tab');
      expect(html).toContain('data-tab-id="1"');
      expect(html).toContain('img src=');
    });

    it('should create HTML for tab without favicon', () => {
      const tab = createMockTab({ id: 1, title: 'Test Tab', favIconUrl: null });
      tabSearcher.currentTabId = null;
      tabSearcher.searchInput.value = '';

      const html = tabSearcher.createTabHTML(tab);

      expect(html).toContain('Test Tab');
      expect(html).toContain('🌐');
    });

    it('should mark active tab', () => {
      const tab = createMockTab({ id: 1, title: 'Test Tab' });
      tabSearcher.currentTabId = 1;
      tabSearcher.searchInput.value = '';

      const html = tabSearcher.createTabHTML(tab);

      expect(html).toContain('tab-item active');
    });
  });

  describe('updateUI method', () => {
    it('should call updateStats and renderTabs', () => {
      const updateStatsSpy = vi.spyOn(tabSearcher, 'updateStats');
      const renderTabsSpy = vi.spyOn(tabSearcher, 'renderTabs');

      tabSearcher.updateUI();

      expect(updateStatsSpy).toHaveBeenCalled();
      expect(renderTabsSpy).toHaveBeenCalled();
    });
  });

  describe('showError method', () => {
    it('should display error message', () => {
      const errorMessage = 'Test error message';

      tabSearcher.showError(errorMessage);

      expect(tabSearcher.tabsList.innerHTML).toContain(errorMessage);
      expect(tabSearcher.tabsList.innerHTML).toContain('⚠️');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle malformed tab objects', () => {
      const malformedTab = { id: 1 }; // Missing required properties
      tabSearcher.tabs = [malformedTab];

      expect(() => tabSearcher.filterTabs()).not.toThrow();
      expect(() => tabSearcher.renderTabs()).not.toThrow();
    });

    it('should handle very long tab titles', () => {
      const longTitle = 'A'.repeat(1000);
      tabSearcher.tabs = [createMockTab({ title: longTitle })];
      tabSearcher.searchInput.value = 'A';

      expect(() => tabSearcher.filterTabs()).not.toThrow();
      expect(() => tabSearcher.renderTabs()).not.toThrow();
    });

    it('should handle special characters in search', () => {
      tabSearcher.tabs = [createMockTab({ title: 'Test [Special] (Characters)' })];
      tabSearcher.searchInput.value = '[Special]';

      expect(() => tabSearcher.filterTabs()).not.toThrow();
      expect(tabSearcher.filteredTabs).toHaveLength(1);
    });

    it('should handle null tab properties', () => {
      const tabWithNulls = createMockTab({
        title: null,
        url: null,
        favIconUrl: null
      });
      tabSearcher.tabs = [tabWithNulls];

      expect(() => tabSearcher.filterTabs()).not.toThrow();
      expect(() => tabSearcher.renderTabs()).not.toThrow();
    });
  });
});