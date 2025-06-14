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

    // Set up event listeners
    this.setupEventListeners();

    // Load tabs
    await this.loadTabs();
  }

  setupEventListeners() {
    // Search input
    this.searchInput.addEventListener('input', () => {
      this.filterTabs();
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
    const query = this.searchInput.value.toLowerCase().trim();
    const exact = this.exactMatch;

    if (!query) {
      this.filteredTabs = [...this.tabs];
    } else {
      this.filteredTabs = this.tabs.filter(tab => {
        const title = tab.title || '';
        const url = tab.url || '';
        if (exact) {
          // Match whole word (case-insensitive)
          const wordRegex = new RegExp(`\\b${this.escapeRegExp(query)}\\b`, 'i');
          return wordRegex.test(title) || wordRegex.test(url);
        }
        const titleMatch = title.toLowerCase().includes(query);
        const urlMatch = url.toLowerCase().includes(query);
        return titleMatch || urlMatch;
      });
    }

    this.updateUI();
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
    const escapedQuery = this.escapeHtml(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

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
}

// Export for testing
export { TabSearcher };
