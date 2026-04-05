class TabSearcher {
  constructor() {
    this.tabs = [];
    this.filteredTabs = [];
    this.currentTabId = null;
    this.exactMatch = false;
  }

  async init() {
    // Get DOM elements
    this.searchInput = document.getElementById('searchInput');
    this.tabsList = document.getElementById('tabsList');
    this.tabCountEl = document.getElementById('tabCount');
    this.matchCountEl = document.getElementById('matchCount');
    this.noResultsEl = document.getElementById('noResults');
    this.loadingEl = document.getElementById('loading');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.closeOthersBtn = document.getElementById('closeOthersBtn');
    this.exactMatchBtn = document.getElementById('exactMatchBtn');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');

    // Set up event listeners
    this.setupEventListeners();

    // Load tabs
    await this.loadTabs();

    // Restore persisted search query from previous popup session
    await this.restoreSearchQuery();
  }

  setupEventListeners() {
    // Search input
    this.searchInput.addEventListener('input', () => {
      this.filterTabs();
      this.toggleClearBtn();
    });

    // Keyboard navigation
    this.searchInput.addEventListener('keydown', e => {
      this.handleKeyNavigation(e);
    });

    // Refresh button
    this.refreshBtn.addEventListener('click', () => {
      this.loadTabs();
    });

    // Close others button
    this.closeOthersBtn.addEventListener('click', () => {
      this.closeOtherTabs();
    });

    // Exact match button
    this.exactMatchBtn.addEventListener('click', () => {
      this.exactMatch = !this.exactMatch;
      this.exactMatchBtn.setAttribute('aria-pressed', this.exactMatch ? 'true' : 'false');
      this.exactMatchBtn.classList.toggle('active', this.exactMatch);
      this.filterTabs();
    });

    // Clear search button
    this.clearSearchBtn.addEventListener('click', () => {
      this.clearSearch();
    });
  }

  async loadTabs() {
    this.showLoading(true);

    try {
      // Get all tabs
      const tabs = await chrome.tabs.query({});

      // Get current active tab
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });
      this.currentTabId = activeTab?.id || null;

      this.tabs = tabs.map(tab => ({
        id: tab.id,
        title: tab.title || 'Untitled',
        url: tab.url || '',
        favIconUrl: tab.favIconUrl,
        windowId: tab.windowId,
        active: tab.active,
        pinned: tab.pinned
      }));

      this.filteredTabs = [...this.tabs];
      this.updateUI();
    } catch (error) {
      console.error('Error loading tabs:', error);
      this.showError('Failed to load tabs');
    } finally {
      this.showLoading(false);
    }
  }

  filterTabs() {
    const rawQuery = this.searchInput.value.trim();
    const exact = this.exactMatch;
    this.saveSearchQuery(this.searchInput.value);

    console.log('=== filterTabs DEBUG ===');
    console.log('rawQuery:', rawQuery);
    console.log('this.tabs.length:', this.tabs.length);

    if (!rawQuery) {
      this.filteredTabs = [...this.tabs];
      console.log('No query, returning all tabs:', this.filteredTabs.length);
    } else {
      const queryLower = rawQuery.toLowerCase();
      // FIX v1.0.12: split into tokens for AND-logic multi-word search
      // e.g. 'pivello 5' -> ['pivello','5'], each must match somewhere
      const tokens = queryLower.split(/\s+/).filter(Boolean);
      console.log('queryLower:', queryLower);
      console.log('tokens:', tokens);

      this.filteredTabs = this.tabs.filter(tab => {
        const title = (tab.title || '').toLowerCase();
        const rawUrl = (tab.url || '').toLowerCase();
        // FIX v1.0.12: decode URL so 'pivello+5'/'pivello%205' match 'pivello 5'
        const decodedUrl = this.safeDecodeUrl(rawUrl);

        if (exact) {
          const wordRegex = new RegExp(`\\b${this.escapeRegExp(queryLower)}\\b`, 'i');
          const result = wordRegex.test(title) || wordRegex.test(rawUrl) || wordRegex.test(decodedUrl);
          console.log(`  Tab "${tab.title}" (exact): ${result}`);
          return result;
        }

        const result = tokens.every(token =>
          title.includes(token) ||
          rawUrl.includes(token) ||
          decodedUrl.includes(token)
        );
        console.log(`  Tab "${tab.title}": ${result}`, { title, rawUrl, decodedUrl, tokens });
        return result;
      });
      console.log('Filtered tabs:', this.filteredTabs.length);
    }

    console.log('filteredTabs.length:', this.filteredTabs.length);
    console.log('=== END filterTabs DEBUG ===\n');
    this.updateUI();
  }

  /**
   * Safely decode a URL for searching.
   * Handles + (form-encoding) and %XX (percent-encoding).
   * @param {string} url - Lowercased raw URL
   * @returns {string}
   */
  safeDecodeUrl(url) {
    try {
      const decoded = decodeURIComponent(url.replace(/\+/g, ' '));
      if (decoded !== url) {
        console.log(`  safeDecodeUrl: "${url}" -> "${decoded}"`);
      }
      return decoded;
    } catch (error) {
      console.warn('URL decode error:', { url, errorMessage: error.message });
      return url;
    }
  }

  /**
   * Escape RegExp special characters for exact match
   * @param {string} s
   * @returns {string}
   */
  escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  updateUI() {
    this.updateStats();
    this.renderTabs();
  }

  updateStats() {
    this.tabCountEl.textContent = `${this.filteredTabs.length} tab${
      this.filteredTabs.length !== 1 ? 's' : ''
    }`;

    const query = this.searchInput.value.trim();
    if (query && this.filteredTabs.length !== this.tabs.length) {
      this.matchCountEl.textContent = `${this.filteredTabs.length} match${
        this.filteredTabs.length !== 1 ? 'es' : ''
      }`;
      this.matchCountEl.style.display = 'inline';
    } else {
      this.matchCountEl.style.display = 'none';
    }
  }

  renderTabs() {
    if (this.filteredTabs.length === 0 && this.searchInput.value.trim()) {
      this.showNoResults(true);
      return;
    }

    this.showNoResults(false);

    try {
      const tabsHtml = this.filteredTabs
        .map(tab => this.createTabHTML(tab))
        .join('');
      this.tabsList.innerHTML = tabsHtml;

      // Add click event listeners
      this.tabsList.querySelectorAll('.tab-item').forEach(tabEl => {
        const tabId = parseInt(tabEl.dataset.tabId, 10);

        tabEl.addEventListener('click', e => {
          if (!e.target.classList.contains('close-tab')) {
            this.switchToTab(tabId);
          }
        });

        const closeBtn = tabEl.querySelector('.close-tab');
        if (closeBtn) {
          closeBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.closeTab(tabId);
          });
        }
      });
    } catch (error) {
      console.error('Error rendering tabs:', error);
      this.tabsList.innerHTML = `
        <div style="padding: 20px; color: #e53e3e; text-align: center; font-size: 12px;">
          <p>⚠️ Error rendering tabs. Please try refreshing.</p>
          <p style="font-size: 10px; color: #a0aec0; margin-top: 8px;">${error.message}</p>
        </div>
      `;
    }
  }

  createTabHTML(tab) {
    const isActive = tab.id === this.currentTabId;
    const query = this.searchInput.value.toLowerCase().trim();

    const title = tab.title || 'Untitled';
    const url = tab.url || '';

    const highlightedTitle = this.highlightText(title, query);
    const highlightedUrl = this.highlightText(this.formatUrl(url), query);

    const favicon = tab.favIconUrl
      ? `<img src="${tab.favIconUrl}" class="tab-favicon" alt="favicon">`
      : '<div class="tab-favicon default">🌐</div>';

    return `
      <div class="tab-item ${isActive ? 'active' : ''}" data-tab-id="${tab.id}">
        ${favicon}
        <div class="tab-info">
          <div class="tab-title">${highlightedTitle}</div>
          <div class="tab-url">${highlightedUrl}</div>
        </div>
        <div class="tab-actions">
          <button class="close-tab" title="Close tab">×</button>
        </div>
      </div>
    `;
  }

  highlightText(text, query) {
    if (!text) {
      return '';
    }

    if (!query) {
      return this.escapeHtml(text);
    }

    const escapedText = this.escapeHtml(text);
    // FIX v1.0.13: split into tokens, escape for regex only (not HTML)
    // HTML escaping is already done on escapedText, tokens are raw query text
    const tokens = query.split(/\s+/).filter(Boolean);
    const pattern = tokens
      .map(token => this.escapeRegExp(token))
      .join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    return escapedText.replace(regex, '<span class="highlight">$1</span>');
  }

  formatUrl(url) {
    if (!url) {
      return '';
    }

    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  }

  escapeHtml(text) {
    if (typeof text !== 'string') {
      text = String(text);
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  async switchToTab(tabId) {
    try {
      await chrome.tabs.update(tabId, { active: true });

      // Get the tab to switch to its window
      const tab = await chrome.tabs.get(tabId);
      await chrome.windows.update(tab.windowId, { focused: true });

      window.close();
    } catch (error) {
      console.error('Error switching to tab:', error);
    }
  }

  async closeTab(tabId) {
    try {
      await chrome.tabs.remove(tabId);

      // Remove from local arrays
      this.tabs = this.tabs.filter(tab => tab.id !== tabId);
      this.filteredTabs = this.filteredTabs.filter(tab => tab.id !== tabId);

      this.updateUI();
    } catch (error) {
      console.error('Error closing tab:', error);
    }
  }

  async closeOtherTabs() {
    // eslint-disable-next-line no-alert
    if (!confirm('Close all other tabs? This action cannot be undone.')) {
      return;
    }

    try {
      const tabsToClose = this.tabs
        .filter(tab => tab.id !== this.currentTabId && !tab.pinned)
        .map(tab => tab.id);

      if (tabsToClose.length > 0 && this.currentTabId !== null) {
        await chrome.tabs.remove(tabsToClose);
        await this.loadTabs();
      }
    } catch (error) {
      console.error('Error closing other tabs:', error);
    }
  }

  handleKeyNavigation(e) {
    const tabItems = this.tabsList.querySelectorAll('.tab-item');
    const activeItem = this.tabsList.querySelector('.tab-item.keyboard-active');
    let currentIndex = activeItem
      ? Array.from(tabItems).indexOf(activeItem)
      : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, tabItems.length - 1);
        this.highlightTab(tabItems, currentIndex);
        break;

      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        this.highlightTab(tabItems, currentIndex);
        break;

      case 'Enter':
        e.preventDefault();
        if (activeItem) {
          const tabId = parseInt(activeItem.dataset.tabId, 10);
          this.switchToTab(tabId);
        } else if (tabItems.length > 0) {
          const tabId = parseInt(tabItems[0].dataset.tabId, 10);
          this.switchToTab(tabId);
        }
        break;

      case 'Escape':
        window.close();
        break;
    }
  }

  highlightTab(tabItems, index) {
    // Remove previous highlight
    tabItems.forEach(item => item.classList.remove('keyboard-active'));

    // Add new highlight
    if (tabItems[index]) {
      tabItems[index].classList.add('keyboard-active');
      tabItems[index].scrollIntoView({ block: 'nearest' });
    }
  }

  showLoading(show) {
    this.loadingEl.style.display = show ? 'flex' : 'none';
    this.tabsList.style.display = show ? 'none' : 'block';
  }

  showNoResults(show) {
    this.noResultsEl.style.display = show ? 'flex' : 'none';
    this.tabsList.style.display = show ? 'none' : 'block';
  }

  showError(message) {
    this.tabsList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #e53e3e;">
        <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
        <div>${message}</div>
      </div>
    `;
  }

  toggleClearBtn() {
    this.clearSearchBtn.style.display = this.searchInput.value.length > 0 ? 'flex' : 'none';
  }

  clearSearch() {
    this.searchInput.value = '';
    this.clearSearchBtn.style.display = 'none';
    this.saveSearchQuery('');
    this.filterTabs();
    this.searchInput.focus();
  }

  saveSearchQuery(value) {
    try {
      chrome.storage.session.set({ searchQuery: value });
    } catch (e) {
      console.warn('Storage session unavailable (saveSearchQuery):', e);
    }
  }

  async restoreSearchQuery() {
    try {
      const result = await chrome.storage.session.get('searchQuery');
      if (result.searchQuery) {
        this.searchInput.value = result.searchQuery;
        this.toggleClearBtn();
        this.filterTabs();
      }
    } catch (e) {
      console.warn('Storage session unavailable (restoreSearchQuery):', e);
    }
  }
}

// Export for testing
export { TabSearcher };
