    // Mock document.getElementById
    global.document = {
      getElementById: vi.fn(id => {
        const elementMap = {
          'search-input': mockElements.searchInput,
          'tabs-list': mockElements.tabsList,
          'loading': mockElements.loadingEl,
          'error': mockElements.errorEl,
          'no-tabs': mockElements.noTabsEl,
          'close-all-btn': mockElements.closeAllBtn