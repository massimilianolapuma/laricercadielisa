/**
 * Test fixtures for various tab scenarios
 * Provides realistic test data for different edge cases
 */

export const basicTabs = [
  {
    id: 1,
    title: "GitHub - Tab Search Extension",
    url: "https://github.com/user/tab-search",
    favIconUrl: "https://github.com/favicon.ico",
    windowId: 1,
    active: true,
    pinned: false,
  },
  {
    id: 2,
    title: "Chrome Extension Documentation",
    url: "https://developer.chrome.com/docs/extensions/",
    favIconUrl: "https://developer.chrome.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: false,
  },
  {
    id: 3,
    title: "Stack Overflow - JavaScript Questions",
    url: "https://stackoverflow.com/questions/tagged/javascript",
    favIconUrl: "https://stackoverflow.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: true,
  },
];

export const tabsWithLongTitles = [
  {
    id: 1,
    title:
      "This is an extremely long tab title that should test how the extension handles very long text content and whether it truncates properly or causes layout issues",
    url: "https://example.com/very-long-url-path/that-might-also-cause-issues/with-layout-and-display/in-the-extension-popup",
    favIconUrl: "https://example.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: false,
  },
  {
    id: 2,
    title: "A".repeat(500), // 500 character title
    url: "https://example.com/" + "path/".repeat(50), // Very long URL
    favIconUrl: "https://example.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: false,
  },
];

export const tabsWithoutFavicons = [
  {
    id: 1,
    title: "Local Development Server",
    url: "http://localhost:3000",
    favIconUrl: null,
    windowId: 1,
    active: false,
    pinned: false,
  },
  {
    id: 2,
    title: "File System",
    url: "file:///Users/username/Documents/index.html",
    favIconUrl: undefined,
    windowId: 1,
    active: false,
    pinned: false,
  },
  {
    id: 3,
    title: "Internal Chrome Page",
    url: "chrome://settings/",
    favIconUrl: "",
    windowId: 1,
    active: false,
    pinned: false,
  },
];

export const specialCharacterTabs = [
  {
    id: 1,
    title: "Special Characters: <>&\"'`{}[]()#@!$%^*+=|\\:;?/~",
    url: 'https://example.com/search?q=<script>alert("xss")</script>',
    favIconUrl: "https://example.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: false,
  },
  {
    id: 2,
    title: "Unicode Test: 🔍 🌟 ✨ 📱 💻 🎯 ⚡ 🚀",
    url: "https://example.com/unicode/test?emoji=🔍&star=⭐",
    favIconUrl: "https://example.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: false,
  },
  {
    id: 3,
    title: "Multi-language: English 中文 日本語 العربية русский",
    url: "https://example.com/multilang",
    favIconUrl: "https://example.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: false,
  },
];

export const multipleWindowTabs = [
  // Window 1 tabs
  {
    id: 1,
    title: "Window 1 - Tab 1",
    url: "https://window1-tab1.com",
    favIconUrl: "https://window1-tab1.com/favicon.ico",
    windowId: 1,
    active: true,
    pinned: false,
  },
  {
    id: 2,
    title: "Window 1 - Tab 2",
    url: "https://window1-tab2.com",
    favIconUrl: "https://window1-tab2.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: false,
  },
  // Window 2 tabs
  {
    id: 3,
    title: "Window 2 - Tab 1",
    url: "https://window2-tab1.com",
    favIconUrl: "https://window2-tab1.com/favicon.ico",
    windowId: 2,
    active: false,
    pinned: false,
  },
  {
    id: 4,
    title: "Window 2 - Tab 2",
    url: "https://window2-tab2.com",
    favIconUrl: "https://window2-tab2.com/favicon.ico",
    windowId: 2,
    active: true,
    pinned: false,
  },
];

export const pinnedTabs = [
  {
    id: 1,
    title: "Gmail",
    url: "https://mail.google.com",
    favIconUrl: "https://mail.google.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: true,
  },
  {
    id: 2,
    title: "Calendar",
    url: "https://calendar.google.com",
    favIconUrl: "https://calendar.google.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: true,
  },
  {
    id: 3,
    title: "Regular Tab",
    url: "https://example.com",
    favIconUrl: "https://example.com/favicon.ico",
    windowId: 1,
    active: true,
    pinned: false,
  },
];

export const largeMockDataset = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  title: `Tab ${i + 1} - ${
    ["GitHub", "Stack Overflow", "MDN", "Chrome Docs", "VS Code"][i % 5]
  }`,
  url: `https://example${i + 1}.com/path/to/resource`,
  favIconUrl: `https://example${i + 1}.com/favicon.ico`,
  windowId: Math.floor(i / 50) + 1, // 50 tabs per window
  active: i === 0,
  pinned: i < 5, // First 5 tabs are pinned
}));

export const edgeCaseTabs = [
  // Empty title
  {
    id: 1,
    title: "",
    url: "https://example.com",
    favIconUrl: "https://example.com/favicon.ico",
    windowId: 1,
    active: false,
    pinned: false,
  },
  // Empty URL (shouldn't happen but test anyway)
  {
    id: 2,
    title: "Tab with empty URL",
    url: "",
    favIconUrl: null,
    windowId: 1,
    active: false,
    pinned: false,
  },
  // Null values
  {
    id: 3,
    title: null,
    url: "https://example.com",
    favIconUrl: null,
    windowId: 1,
    active: false,
    pinned: false,
  },
  // Undefined values
  {
    id: 4,
    title: undefined,
    url: undefined,
    favIconUrl: undefined,
    windowId: 1,
    active: false,
    pinned: false,
  },
];

export const searchTestCases = [
  {
    query: "github",
    tabs: basicTabs,
    expectedResults: 1,
    description: "Basic search should find GitHub tab",
  },
  {
    query: "GITHUB",
    tabs: basicTabs,
    expectedResults: 1,
    description: "Case insensitive search should work",
  },
  {
    query: "chrome",
    tabs: basicTabs,
    expectedResults: 1,
    description: "Should find tabs by URL domain",
  },
  {
    query: "javascript",
    tabs: basicTabs,
    expectedResults: 1,
    description: "Should find tabs by URL path",
  },
  {
    query: "nonexistent",
    tabs: basicTabs,
    expectedResults: 0,
    description: "Should return no results for non-matching query",
  },
  {
    query: "",
    tabs: basicTabs,
    expectedResults: 3,
    description: "Empty query should return all tabs",
  },
  {
    query: "   ",
    tabs: basicTabs,
    expectedResults: 3,
    description: "Whitespace-only query should return all tabs",
  },
];

export const performanceTestData = {
  small: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `Small Dataset Tab ${i + 1}`,
    url: `https://small${i + 1}.com`,
    favIconUrl: `https://small${i + 1}.com/favicon.ico`,
    windowId: 1,
    active: i === 0,
    pinned: false,
  })),

  medium: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `Medium Dataset Tab ${i + 1}`,
    url: `https://medium${i + 1}.com`,
    favIconUrl: `https://medium${i + 1}.com/favicon.ico`,
    windowId: Math.floor(i / 20) + 1,
    active: i === 0,
    pinned: i < 3,
  })),

  large: Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    title: `Large Dataset Tab ${i + 1}`,
    url: `https://large${i + 1}.com`,
    favIconUrl: `https://large${i + 1}.com/favicon.ico`,
    windowId: Math.floor(i / 50) + 1,
    active: i === 0,
    pinned: i < 5,
  })),
};

// Helper function to create custom tab datasets
export function createCustomTabs(count, options = {}) {
  const {
    titlePrefix = "Tab",
    urlBase = "https://example",
    windowId = 1,
    pinnedCount = 0,
    activeIndex = 0,
  } = options;

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `${titlePrefix} ${i + 1}`,
    url: `${urlBase}${i + 1}.com`,
    favIconUrl: `${urlBase}${i + 1}.com/favicon.ico`,
    windowId: windowId,
    active: i === activeIndex,
    pinned: i < pinnedCount,
  }));
}

// Mock Chrome API responses
export const chromeApiMocks = {
  querySuccess: (tabs) => ({
    success: true,
    data: tabs,
  }),

  queryError: {
    success: false,
    error: new Error("Permission denied"),
  },

  updateSuccess: (tabId) => ({
    success: true,
    tabId: tabId,
  }),

  updateError: {
    success: false,
    error: new Error("Tab not found"),
  },

  removeSuccess: (tabIds) => ({
    success: true,
    removedTabIds: Array.isArray(tabIds) ? tabIds : [tabIds],
  }),

  removeError: {
    success: false,
    error: new Error("Cannot close tab"),
  },
};

export default {
  basicTabs,
  tabsWithLongTitles,
  tabsWithoutFavicons,
  specialCharacterTabs,
  multipleWindowTabs,
  pinnedTabs,
  largeMockDataset,
  edgeCaseTabs,
  searchTestCases,
  performanceTestData,
  createCustomTabs,
  chromeApiMocks,
};
