import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabSearcher } from '../../popup.js';

/**
 * Tests for currently uncovered methods in TabSearcher
 * These will be expanded as coverage increases
 */

describe('TabSearcher Uncovered Methods', () => {
  let tabSearcher;
  let mockElements;

  beforeEach(() => {
    // Setup mock DOM elements
    mockElements = {
      searchInput: {
        value: '',
        addEventListener: vi.fn(),
        focus: vi.fn()
      },
      tabsList: {
        innerHTML: '',
        querySelectorAll: vi.fn(() => []),
        style: { display: 'block' }
      },
      tabCountEl: {
        textContent: ''
      },
      matchCountEl: {
        textContent: '',
        style: { display: 'none' }
      },
      noResultsEl: {
        style: { display: 'none' }
      },
      loadingEl: {
        style: { display: 'none' }
      },
      refreshBtn: {
        addEventListener: vi.fn()
      },
      closeOthersBtn: {
        addEventListener: vi.fn()
      },
      exactMatchBtn: {
        addEventListener: vi.fn(),
        setAttribute: vi.fn(),
        classList: {
          toggle: vi.fn()
        }
      }
    };

    global.document = {
      getElementById: id => {
        const idMap = {
          searchInput: mockElements.searchInput,
          tabsList: mockElements.tabsList,
          tabCount: mockElements.tabCountEl,
          matchCount: mockElements.matchCountEl,
          noResults: mockElements.noResultsEl,
          loading: mockElements.loadingEl,
          refreshBtn: mockElements.refreshBtn,
          closeOthersBtn: mockElements.closeOthersBtn,
          exactMatchBtn: mockElements.exactMatchBtn
        };
        return idMap[id] || null;
      }
    };

    global.chrome = {
      tabs: {
        query: vi.fn(() => Promise.resolve([])),
        update: vi.fn(() => Promise.resolve()),
        remove: vi.fn(() => Promise.resolve())
      },
      windows: {
        update: vi.fn(() => Promise.resolve())
      },
      i18n: {
        getMessage: vi.fn(key => key)
      }
    };

    tabSearcher = new TabSearcher();
  });

  it('should be defined', () => {
    expect(tabSearcher).toBeDefined();
  });

  it('should have all required properties', () => {
    expect(tabSearcher.tabs).toEqual([]);
    expect(tabSearcher.filteredTabs).toEqual([]);
    expect(tabSearcher.currentTabId).toBeNull();
    expect(tabSearcher.exactMatch).toBe(false);
  });
});
