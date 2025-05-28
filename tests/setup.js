/**
 * Test setup file - runs before all tests
 * Sets up Chrome API mocks and global test utilities
 */
import { vi, beforeEach, afterEach } from "vitest";

// Global mock functions for creating test data
global.createMockTab = (overrides = {}) => ({
  id: 1,
  title: "Mock Tab",
  url: "https://example.com",
  favIconUrl: "https://example.com/favicon.ico",
  windowId: 1,
  active: false,
  pinned: false,
  ...overrides,
});

global.createMockTabs = (count = 3) =>
  Array.from({ length: count }, (_, i) =>
    global.createMockTab({
      id: i + 1,
      title: `Mock Tab ${i + 1}`,
      url: `https://example${i + 1}.com`,
      favIconUrl: `https://example${i + 1}.com/favicon.ico`,
      active: i === 0,
    })
  );

// Mock Chrome APIs
global.chrome = {
  tabs: {
    query: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    get: vi.fn(),
    getCurrent: vi.fn(),
  },
  windows: {
    update: vi.fn(),
  },
  runtime: {
    lastError: null,
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

// Mock DOM methods that might not be available in test environment
Object.defineProperty(window, "close", {
  value: vi.fn(),
  writable: true,
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};

// Helper function to create mock tab data
global.createMockTab = (overrides = {}) => ({
  id: 1,
  title: "Test Tab",
  url: "https://example.com",
  favIconUrl: "https://example.com/favicon.ico",
  windowId: 1,
  active: false,
  pinned: false,
  ...overrides,
});

// Helper function to create multiple mock tabs
global.createMockTabs = (count = 5) =>
  Array.from({ length: count }, (_, i) =>
    global.createMockTab({
      id: i + 1,
      title: `Test Tab ${i + 1}`,
      url: `https://example${i + 1}.com`,
      active: i === 0, // First tab is active
    })
  );

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

// Enhanced DOM setup for comprehensive testing
beforeEach(() => {
  // Reset DOM
  document.body.innerHTML = "";

  // Create basic popup structure that tests expect
  const popupHTML = `
    <div class="popup-container">
      <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search tabs..." />
      </div>
      <div class="loading" id="loading" style="display: none;">
        <div>Loading tabs...</div>
      </div>
      <div class="no-results" id="noResults" style="display: none;">
        <div>No tabs found</div>
      </div>
      <div class="stats">
        <span id="tabCount">0 tabs</span>
        <span id="matchCount">0 matches</span>
      </div>
      <div class="tabs-list" id="tabsList"></div>
    </div>
  `;

  document.body.innerHTML = popupHTML;

  // Reset Chrome API mocks with default successful responses
  const mockTabs = [
    {
      id: 1,
      title: "Google",
      url: "https://google.com",
      favIconUrl: "https://google.com/favicon.ico",
      windowId: 1,
      active: true,
    },
    {
      id: 2,
      title: "GitHub",
      url: "https://github.com",
      favIconUrl: "https://github.com/favicon.ico",
      windowId: 1,
      active: false,
    },
    {
      id: 3,
      title: "Stack Overflow",
      url: "https://stackoverflow.com",
      favIconUrl: "https://stackoverflow.com/favicon.ico",
      windowId: 1,
      active: false,
    },
  ];

  global.chrome.tabs.query.mockResolvedValue(mockTabs);
  global.chrome.tabs.update.mockResolvedValue({});
  global.chrome.tabs.remove.mockResolvedValue({});
  global.chrome.windows.update.mockResolvedValue({});
  global.chrome.runtime.lastError = null;

  // Clear all mocks
  vi.clearAllMocks();
});
