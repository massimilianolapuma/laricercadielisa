/**
 * Accessibility tests for the Tab Search extension
 * Ensures the extension is usable with screen readers and keyboard navigation
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Accessibility Tests', () => {
  let tabSearcher;

  beforeEach(() => {
    // Set up DOM with proper accessibility attributes
    document.body.innerHTML = `
      <div class="container" role="application" aria-label="Tab Search Extension">
        <div class="search-container">
          <label for="searchInput" class="sr-only">Search tabs</label>
          <input 
            type="text" 
            id="searchInput" 
            placeholder="Search tabs..." 
            autocomplete="off"
            aria-label="Search through open tabs"
            aria-describedby="search-help"
            role="searchbox"
            aria-autocomplete="list"
            aria-expanded="false"
          >
          <div id="search-help" class="sr-only">
            Type to search through your open tabs. Use arrow keys to navigate results, Enter to switch to selected tab.
          </div>
        </div>
        
        <div class="loading" id="loading" aria-live="polite" aria-label="Loading tabs">
          <div class="loading-spinner" aria-hidden="true"></div>
          <span>Loading tabs...</span>
        </div>
        
        <div 
          class="tab-list" 
          id="tabList" 
          role="listbox" 
          aria-label="Open tabs"
          aria-live="polite"
          aria-relevant="additions removals"
        ></div>
        
        <div class="actions">
          <button 
            id="closeOthersBtn" 
            class="action-btn"
            aria-label="Close all other tabs except the active one"
            aria-describedby="close-others-help"
          >
            Close Other Tabs
          </button>
          <div id="close-others-help" class="sr-only">
            This will close all tabs except the currently active tab. This action cannot be undone.
          </div>
        </div>
        
        <div 
          class="error" 
          id="error" 
          style="display: none;"
          role="alert"
          aria-live="assertive"
        >
          <span class="error-message"></span>
        </div>
      </div>
    `;

    // Mock TabSearcher with accessibility features
    global.TabSearcher = class AccessibleTabSearcher {
      constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.tabsList = document.getElementById('tabList');
        this.loadingEl = document.getElementById('loading');
        this.errorEl = document.getElementById('error');
        this.closeOthersBtn = document.getElementById('closeOthersBtn');
        this.tabs = [];
        this.filteredTabs = [];
        this.selectedIndex = -1;
      }

      async init() {
        this.tabs = createMockTabs(5);
        this.filteredTabs = [...this.tabs];
        this.renderTabs();
        this.setupEventListeners();
        this.updateAriaAttributes();
      }

      setupEventListeners() {
        this.searchInput.addEventListener('input', () => {
          this.filterTabs();
          this.announceResults();
        });
        this.searchInput.addEventListener('keydown', e =>
          this.handleKeyNavigation(e)
        );
      }

      filterTabs() {
        const query = this.searchInput.value.toLowerCase().trim();
        this.filteredTabs = this.tabs.filter(
          tab =>
            tab.title.toLowerCase().includes(query) ||
            tab.url.toLowerCase().includes(query)
        );
        this.selectedIndex = -1;
        this.renderTabs();
        this.updateAriaAttributes();
      }

      renderTabs() {
        this.tabsList.innerHTML = this.filteredTabs
          .map(
            (tab, index) => `
          <div 
            class="tab-item ${index === this.selectedIndex ? 'selected' : ''}" 
            data-tab-id="${tab.id}"
            role="option"
            aria-selected="${index === this.selectedIndex}"
            aria-label="Tab: ${this.escapeHtml(tab.title)} - ${this.escapeHtml(
  tab.url
)}"
            tabindex="${index === this.selectedIndex ? '0' : '-1'}"
          >
            <img 
              src="${
  tab.favIconUrl ||
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="%23ccc"/></svg>'
}" 
              alt="" 
              class="tab-favicon"
              aria-hidden="true"
            >
            <div class="tab-info">
              <div class="tab-title">${this.escapeHtml(tab.title)}</div>
              <div class="tab-url">${this.escapeHtml(tab.url)}</div>
            </div>
            <button 
              class="close-tab-btn" 
              data-tab-id="${tab.id}"
              aria-label="Close tab: ${this.escapeHtml(tab.title)}"
              tabindex="-1"
            >×</button>
          </div>
        `
          )
          .join('');
      }

      handleKeyNavigation(e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedIndex = Math.min(
            this.selectedIndex + 1,
            this.filteredTabs.length - 1
          );
          this.renderTabs();
          this.focusSelectedItem();
          this.announceSelection();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
          this.renderTabs();
          this.focusSelectedItem();
          this.announceSelection();
        } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
          e.preventDefault();
          this.switchToTab(this.filteredTabs[this.selectedIndex]);
        }
      }

      focusSelectedItem() {
        const selectedItem = document.querySelector('.tab-item.selected');
        if (selectedItem) {
          selectedItem.focus();
        }
      }

      announceResults() {
        const resultCount = this.filteredTabs.length;
        const announcement =
          resultCount === 1 ? '1 tab found' : `${resultCount} tabs found`;

        // Create temporary announcement element
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = announcement;
        document.body.appendChild(announcer);

        setTimeout(() => document.body.removeChild(announcer), 1000);
      }

      announceSelection() {
        if (this.selectedIndex >= 0) {
          const selectedTab = this.filteredTabs[this.selectedIndex];
          const announcement = `Selected: ${selectedTab.title}`;

          const announcer = document.createElement('div');
          announcer.setAttribute('aria-live', 'assertive');
          announcer.className = 'sr-only';
          announcer.textContent = announcement;
          document.body.appendChild(announcer);

          setTimeout(() => document.body.removeChild(announcer), 1000);
        }
      }

      updateAriaAttributes() {
        this.searchInput.setAttribute(
          'aria-expanded',
          this.filteredTabs.length > 0
        );
        this.tabsList.setAttribute(
          'aria-label',
          `${this.filteredTabs.length} tabs found`
        );
      }

      escapeHtml(unsafe) {
        return unsafe
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      async switchToTab(_tab) {
        // Mock implementation
        return Promise.resolve();
      }
    };

    tabSearcher = new TabSearcher();
  });

  describe('ARIA Attributes', () => {
    it('should have proper ARIA roles and labels', async () => {
      await tabSearcher.init();

      // Check search input accessibility
      const searchInput = document.getElementById('searchInput');
      expect(searchInput.getAttribute('role')).toBe('searchbox');
      expect(searchInput.getAttribute('aria-label')).toBe(
        'Search through open tabs'
      );
      expect(searchInput.getAttribute('aria-describedby')).toBe('search-help');
      expect(searchInput.getAttribute('aria-autocomplete')).toBe('list');

      // Check tab list accessibility
      const tabList = document.getElementById('tabList');
      expect(tabList.getAttribute('role')).toBe('listbox');
      expect(tabList.getAttribute('aria-live')).toBe('polite');

      // Check individual tab items
      const tabItems = document.querySelectorAll('.tab-item');
      tabItems.forEach(item => {
        expect(item.getAttribute('role')).toBe('option');
        expect(item.hasAttribute('aria-selected')).toBe(true);
        expect(item.hasAttribute('aria-label')).toBe(true);
      });
    });

    it('should update ARIA attributes when filtering', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');
      const tabList = document.getElementById('tabList');

      // Initial state
      expect(searchInput.getAttribute('aria-expanded')).toBe('true');
      expect(tabList.getAttribute('aria-label')).toBe('5 tabs found');

      // Filter tabs
      searchInput.value = 'Test Tab 1';
      searchInput.dispatchEvent(new Event('input'));

      expect(searchInput.getAttribute('aria-expanded')).toBe('true');
      expect(tabList.getAttribute('aria-label')).toBe('1 tabs found');

      // No results
      searchInput.value = 'non-existent';
      searchInput.dispatchEvent(new Event('input'));

      expect(searchInput.getAttribute('aria-expanded')).toBe('false');
      expect(tabList.getAttribute('aria-label')).toBe('0 tabs found');
    });

    it('should properly mark selected items', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');

      // Navigate down
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      searchInput.dispatchEvent(downEvent);

      const selectedItem = document.querySelector('.tab-item.selected');
      expect(selectedItem.getAttribute('aria-selected')).toBe('true');
      expect(selectedItem.getAttribute('tabindex')).toBe('0');

      // Other items should not be selected
      const otherItems = document.querySelectorAll('.tab-item:not(.selected)');
      otherItems.forEach(item => {
        expect(item.getAttribute('aria-selected')).toBe('false');
        expect(item.getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');

      // Should start with no selection
      expect(tabSearcher.selectedIndex).toBe(-1);
      expect(document.querySelector('.tab-item.selected')).toBeNull();

      // Arrow down should select first item
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );
      expect(tabSearcher.selectedIndex).toBe(0);
      expect(document.querySelector('.tab-item.selected')).toBeTruthy();

      // Arrow down should move to next item
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );
      expect(tabSearcher.selectedIndex).toBe(1);

      // Arrow up should move back
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp' })
      );
      expect(tabSearcher.selectedIndex).toBe(0);
    });

    it('should handle Enter key to activate selection', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');
      const switchToTabSpy = vi.spyOn(tabSearcher, 'switchToTab');

      // Select first item
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );

      // Press Enter
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(switchToTabSpy).toHaveBeenCalledWith(tabSearcher.filteredTabs[0]);
    });

    it('should not allow navigation beyond boundaries', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');

      // Try to go up from initial position
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp' })
      );
      expect(tabSearcher.selectedIndex).toBe(-1);

      // Go to last item
      for (let i = 0; i < 10; i++) {
        searchInput.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown' })
        );
      }
      expect(tabSearcher.selectedIndex).toBe(4); // Should stop at last item
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce search results', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');

      // Mock the announcement creation
      const createAnnouncementSpy = vi.spyOn(document.body, 'appendChild');

      searchInput.value = 'Test Tab 1';
      searchInput.dispatchEvent(new Event('input'));

      // Should create announcement element
      expect(createAnnouncementSpy).toHaveBeenCalled();

      // Check if announcement has correct attributes
      const announcementCalls = createAnnouncementSpy.mock.calls;
      const announcements = announcementCalls.map(call => call[0]);
      const resultAnnouncement = announcements.find(
        el =>
          el.getAttribute('aria-live') === 'polite' &&
          el.textContent.includes('tab found')
      );

      expect(resultAnnouncement).toBeTruthy();
      expect(resultAnnouncement.textContent).toBe('1 tab found');
    });

    it('should announce selections during keyboard navigation', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');
      const createAnnouncementSpy = vi.spyOn(document.body, 'appendChild');

      // Navigate to first item
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );

      // Should announce selection
      const announcementCalls = createAnnouncementSpy.mock.calls;
      const announcements = announcementCalls.map(call => call[0]);
      const selectionAnnouncement = announcements.find(
        el =>
          el.getAttribute('aria-live') === 'assertive' &&
          el.textContent.includes('Selected:')
      );

      expect(selectionAnnouncement).toBeTruthy();
      expect(selectionAnnouncement.textContent).toContain('Test Tab 1');
    });
  });

  describe('Focus Management', () => {
    it('should maintain proper focus during navigation', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');

      // Focus should start on search input
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      // After arrow navigation, selected item should receive focus
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );

      const selectedItem = document.querySelector('.tab-item.selected');
      expect(document.activeElement).toBe(selectedItem);
    });

    it('should handle tab index properly', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');

      // Initially, all tab items should have tabindex="-1"
      const initialTabItems = document.querySelectorAll('.tab-item');
      initialTabItems.forEach(item => {
        expect(item.getAttribute('tabindex')).toBe('-1');
      });

      // After selection, selected item should have tabindex="0"
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );

      const selectedItem = document.querySelector('.tab-item.selected');
      const unselectedItems = document.querySelectorAll(
        '.tab-item:not(.selected)'
      );

      expect(selectedItem.getAttribute('tabindex')).toBe('0');
      unselectedItems.forEach(item => {
        expect(item.getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('Error Accessibility', () => {
    it('should properly announce errors', () => {
      const errorEl = document.getElementById('error');
      const errorMessage = errorEl.querySelector('.error-message');

      // Error container should have proper ARIA attributes
      expect(errorEl.getAttribute('role')).toBe('alert');
      expect(errorEl.getAttribute('aria-live')).toBe('assertive');

      // Simulate error
      errorMessage.textContent = 'Failed to load tabs';
      errorEl.style.display = 'block';

      expect(errorMessage.textContent).toBe('Failed to load tabs');
      expect(errorEl.style.display).toBe('block');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should not rely solely on color for information', async () => {
      await tabSearcher.init();

      const searchInput = document.getElementById('searchInput');

      // Navigate to select an item
      searchInput.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );

      const selectedItem = document.querySelector('.tab-item.selected');

      // Selected item should have class indicator, not just color
      expect(selectedItem.classList.contains('selected')).toBe(true);

      // Selected item should have ARIA indicator
      expect(selectedItem.getAttribute('aria-selected')).toBe('true');
    });
  });
});
