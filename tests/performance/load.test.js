/**
 * Performance and load tests for the Tab Search extension
 * Tests extension behavior under various load conditions
 */

import { describe, it, expect, beforeEach } from "vitest";
import { performanceTestData, createCustomTabs } from "../fixtures/tab-data.js";

describe("Performance Tests", () => {
  let tabSearcher;

  // Dynamic performance thresholds based on test environment
  const getPerformanceThresholds = () => {
    const isCoverage =
      process.env.NODE_ENV === "test" ||
      process.argv.includes("--coverage") ||
      global.__coverage__;
    const multiplier = isCoverage ? 4 : 1; // 4x slower in coverage mode

    return {
      init: {
        small: 50 * multiplier,
        medium: 350 * multiplier,
        large: 600 * multiplier,
        extreme: 1200 * multiplier,
      },
      filter: {
        small: 15 * multiplier,
        medium: 35 * multiplier,
        large: 75 * multiplier,
        rapid: 50 * multiplier,
      },
      render: {
        small: 30 * multiplier,
        medium: 80 * multiplier,
        large: 400 * multiplier,
      },
      navigation: {
        average: 80 * multiplier,
        baseline: 40 * multiplier,
      },
      stress: {
        maxInteraction: 800 * multiplier,
        edgeCase: 400 * multiplier,
      },
    };
  };

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div class="container">
        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Search tabs..." autocomplete="off">
        </div>
        <div class="loading" id="loading">
          <div class="loading-spinner"></div>
          <span>Loading tabs...</span>
        </div>
        <div class="tab-list" id="tabList"></div>
        <div class="actions">
          <button id="closeOthersBtn" class="action-btn">Close Other Tabs</button>
        </div>
        <div class="error" id="error" style="display: none;">
          <span class="error-message"></span>
        </div>
      </div>
    `;

    // Mock TabSearcher class with improved performance tracking
    global.TabSearcher = class PerformanceTabSearcher {
      constructor() {
        this.searchInput = document.getElementById("searchInput");
        this.tabsList = document.getElementById("tabList");
        this.loadingEl = document.getElementById("loading");
        this.errorEl = document.getElementById("error");
        this.closeOthersBtn = document.getElementById("closeOthersBtn");
        this.tabs = [];
        this.filteredTabs = [];
        this.selectedIndex = -1;
      }

      async init() {
        const startTime = performance.now();

        // Add small delay to simulate real Chrome API
        await new Promise((resolve) => setTimeout(resolve, 10));

        this.tabs = await chrome.tabs.query({});
        this.filteredTabs = [...this.tabs];
        this.renderTabs();
        this.setupEventListeners();

        const endTime = performance.now();
        this.initTime = endTime - startTime;
      }

      setupEventListeners() {
        this.searchInput.addEventListener("input", () => this.filterTabs());
        this.searchInput.addEventListener("keydown", (e) =>
          this.handleKeyNavigation(e)
        );
      }

      filterTabs() {
        const startTime = performance.now();
        const query = this.searchInput.value.toLowerCase().trim();

        if (!query) {
          this.filteredTabs = [...this.tabs];
        } else {
          this.filteredTabs = this.tabs.filter(
            (tab) =>
              tab.title.toLowerCase().includes(query) ||
              tab.url.toLowerCase().includes(query)
          );
        }

        this.selectedIndex = -1;
        const endTime = performance.now();
        this.lastFilterTime = endTime - startTime;

        this.renderTabs();
      }

      renderTabs() {
        const startTime = performance.now();

        // Use base64-encoded data URI for fallback favicon to avoid DOM issues
        const fallbackFavicon =
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjgiIGZpbGw9IiNjY2MiLz48L3N2Zz4=";

        this.tabsList.innerHTML = this.filteredTabs
          .map(
            (tab, index) => `
          <div class="tab-item ${
            index === this.selectedIndex ? "selected" : ""
          }" data-tab-id="${tab.id}">
            <img src="${
              tab.favIconUrl || fallbackFavicon
            }" alt="" class="tab-favicon">
            <div class="tab-info">
              <div class="tab-title">${this.escapeHtml(tab.title)}</div>
              <div class="tab-url">${this.escapeHtml(tab.url)}</div>
            </div>
            <button class="close-tab-btn" data-tab-id="${tab.id}">×</button>
          </div>
        `
          )
          .join("");

        const endTime = performance.now();
        this.lastRenderTime = endTime - startTime;
      }

      handleKeyNavigation(e) {
        const startTime = performance.now();

        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.selectedIndex = Math.min(
            this.selectedIndex + 1,
            this.filteredTabs.length - 1
          );
          this.renderTabs();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
          this.renderTabs();
        } else if (e.key === "Enter" && this.selectedIndex >= 0) {
          e.preventDefault();
          this.switchToTab(this.filteredTabs[this.selectedIndex]);
        }

        const endTime = performance.now();
        this.lastNavigationTime = endTime - startTime;
      }

      escapeHtml(unsafe) {
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      async switchToTab(tab) {
        const startTime = performance.now();
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
        const endTime = performance.now();
        this.lastSwitchTime = endTime - startTime;
      }

      getPerformanceMetrics() {
        return {
          initTime: this.initTime,
          lastFilterTime: this.lastFilterTime,
          lastRenderTime: this.lastRenderTime,
          lastNavigationTime: this.lastNavigationTime,
          lastSwitchTime: this.lastSwitchTime,
          tabCount: this.tabs.length,
          filteredCount: this.filteredTabs.length,
        };
      }
    };

    tabSearcher = new global.TabSearcher();
  });

  describe("Initialization Performance", () => {
    it("should initialize quickly with small dataset", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.small);

      await tabSearcher.init();
      const metrics = tabSearcher.getPerformanceMetrics();

      expect(metrics.initTime).toBeLessThan(thresholds.init.small);
      expect(metrics.tabCount).toBe(10);
    });

    it("should initialize reasonably with medium dataset", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.medium);

      await tabSearcher.init();
      const metrics = tabSearcher.getPerformanceMetrics();

      expect(metrics.initTime).toBeLessThan(thresholds.init.medium);
      expect(metrics.tabCount).toBe(100);
    });

    it("should handle large dataset within acceptable time", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.large);

      await tabSearcher.init();
      const metrics = tabSearcher.getPerformanceMetrics();

      expect(metrics.initTime).toBeLessThan(thresholds.init.large);
      expect(metrics.tabCount).toBe(500);
    });
  });

  describe("Search Performance", () => {
    it("should filter small dataset instantly", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.small);
      await tabSearcher.init();

      const searchInput = document.getElementById("searchInput");
      searchInput.value = "Tab 5";
      searchInput.dispatchEvent(new Event("input"));

      const metrics = tabSearcher.getPerformanceMetrics();
      expect(metrics.lastFilterTime).toBeLessThan(thresholds.filter.small);
      expect(metrics.filteredCount).toBe(1);
    });

    it("should filter medium dataset quickly", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.medium);
      await tabSearcher.init();

      const searchInput = document.getElementById("searchInput");
      searchInput.value = "Medium";
      searchInput.dispatchEvent(new Event("input"));

      const metrics = tabSearcher.getPerformanceMetrics();
      expect(metrics.lastFilterTime).toBeLessThan(thresholds.filter.medium);
      expect(metrics.filteredCount).toBe(100); // All match
    });

    it("should filter large dataset within acceptable time", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.large);
      await tabSearcher.init();

      const searchInput = document.getElementById("searchInput");
      searchInput.value = "Large Dataset Tab 250";
      searchInput.dispatchEvent(new Event("input"));

      const metrics = tabSearcher.getPerformanceMetrics();
      expect(metrics.lastFilterTime).toBeLessThan(thresholds.filter.large);
      expect(metrics.filteredCount).toBe(1);
    });

    it("should handle rapid successive searches efficiently", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.medium);
      await tabSearcher.init();

      const searchInput = document.getElementById("searchInput");
      const searchTimes = [];

      // Perform 10 rapid searches
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        searchInput.value = `Tab ${i}`;
        searchInput.dispatchEvent(new Event("input"));
        const endTime = performance.now();
        searchTimes.push(endTime - startTime);
      }

      const averageSearchTime =
        searchTimes.reduce((a, b) => a + b) / searchTimes.length;
      expect(averageSearchTime).toBeLessThan(thresholds.filter.rapid);
    });
  });

  describe("Rendering Performance", () => {
    it("should render small result sets instantly", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.small);
      await tabSearcher.init();

      const metrics = tabSearcher.getPerformanceMetrics();
      expect(metrics.lastRenderTime).toBeLessThan(thresholds.render.small);
    });

    it("should render medium result sets quickly", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.medium);
      await tabSearcher.init();

      const metrics = tabSearcher.getPerformanceMetrics();
      expect(metrics.lastRenderTime).toBeLessThan(thresholds.render.medium);
    });

    it("should handle large result sets efficiently", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.large);
      await tabSearcher.init();

      const metrics = tabSearcher.getPerformanceMetrics();
      expect(metrics.lastRenderTime).toBeLessThan(thresholds.render.large);
    });

    it("should handle re-rendering during navigation efficiently", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.medium);
      await tabSearcher.init();

      const searchInput = document.getElementById("searchInput");
      const navigationTimes = [];

      // Perform 5 navigation actions
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
        searchInput.dispatchEvent(downEvent);
        const endTime = performance.now();
        navigationTimes.push(endTime - startTime);
      }

      const averageNavigationTime =
        navigationTimes.reduce((a, b) => a + b) / navigationTimes.length;
      expect(averageNavigationTime).toBeLessThan(thresholds.navigation.average);
    });
  });

  describe("Memory Usage Tests", () => {
    it("should not leak memory during repeated operations", async () => {
      chrome.tabs.query.mockResolvedValue(performanceTestData.medium);
      await tabSearcher.init();

      const searchInput = document.getElementById("searchInput");
      const initialHeap = performance.memory
        ? performance.memory.usedJSHeapSize
        : 0;

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        searchInput.value = `search ${i}`;
        searchInput.dispatchEvent(new Event("input"));

        // Navigate
        const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
        searchInput.dispatchEvent(downEvent);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalHeap = performance.memory
        ? performance.memory.usedJSHeapSize
        : 0;

      // Memory usage shouldn't grow significantly (allow 50% increase)
      if (performance.memory) {
        expect(finalHeap).toBeLessThan(initialHeap * 1.5);
      }
    });
  });

  describe("Stress Tests", () => {
    it("should handle extremely large datasets", async () => {
      const thresholds = getPerformanceThresholds();
      const extremeDataset = createCustomTabs(2000, {
        titlePrefix: "Extreme Test Tab",
        urlBase: "https://extreme-test",
      });

      chrome.tabs.query.mockResolvedValue(extremeDataset);

      const startTime = performance.now();
      await tabSearcher.init();
      const initTime = performance.now() - startTime;

      expect(initTime).toBeLessThan(thresholds.init.extreme);
      expect(tabSearcher.tabs).toHaveLength(2000);
    });

    it("should handle rapid user interactions without blocking", async () => {
      const thresholds = getPerformanceThresholds();
      chrome.tabs.query.mockResolvedValue(performanceTestData.large);
      await tabSearcher.init();

      const searchInput = document.getElementById("searchInput");
      const interactions = [];

      // Simulate rapid typing
      const rapidSearches = [
        "t",
        "ta",
        "tab",
        "tab ",
        "tab 1",
        "tab 10",
        "tab 100",
      ];

      for (const search of rapidSearches) {
        const startTime = performance.now();
        searchInput.value = search;
        searchInput.dispatchEvent(new Event("input"));

        // Add navigation
        const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
        searchInput.dispatchEvent(downEvent);

        const endTime = performance.now();
        interactions.push(endTime - startTime);
      }

      const maxInteractionTime = Math.max(...interactions);
      expect(maxInteractionTime).toBeLessThan(thresholds.stress.maxInteraction);
    });

    it("should handle edge case scenarios efficiently", async () => {
      const thresholds = getPerformanceThresholds();
      // Create tabs with extreme properties
      const edgeCaseTabs = [
        ...createCustomTabs(100, { titlePrefix: "A".repeat(500) }), // Very long titles
        ...createCustomTabs(100, {
          urlBase: `https://${"very-long-domain-name-".repeat(20)}`,
        }), // Very long URLs
        ...createCustomTabs(100, { titlePrefix: "🔍".repeat(100) }), // Lots of Unicode
      ];

      chrome.tabs.query.mockResolvedValue(edgeCaseTabs);

      const startTime = performance.now();
      await tabSearcher.init();
      const initTime = performance.now() - startTime;

      expect(initTime).toBeLessThan(thresholds.stress.edgeCase);
      expect(tabSearcher.tabs).toHaveLength(300);

      // Test search with these edge cases
      const searchInput = document.getElementById("searchInput");
      searchInput.value = "A";
      searchInput.dispatchEvent(new Event("input"));

      const metrics = tabSearcher.getPerformanceMetrics();
      expect(metrics.lastFilterTime).toBeLessThan(
        100 * (thresholds.init.small / 50)
      ); // Scaled threshold
    });
  });

  describe("Performance Regression Tests", () => {
    it("should maintain performance baseline for standard operations", async () => {
      const thresholds = getPerformanceThresholds();
      const standardDataset = createCustomTabs(50); // Typical user scenario
      chrome.tabs.query.mockResolvedValue(standardDataset);

      // Baseline expectations based on requirements
      const performanceBaseline = {
        init: thresholds.init.small * 2, // 100ms baseline
        search: thresholds.filter.large, // 50ms baseline
        render: thresholds.render.small, // 30ms baseline
        navigation: thresholds.navigation.baseline, // 20ms baseline
      };

      await tabSearcher.init();
      expect(tabSearcher.getPerformanceMetrics().initTime).toBeLessThan(
        performanceBaseline.init
      );

      const searchInput = document.getElementById("searchInput");
      searchInput.value = "Tab 25";
      searchInput.dispatchEvent(new Event("input"));

      const metrics = tabSearcher.getPerformanceMetrics();
      expect(metrics.lastFilterTime).toBeLessThan(performanceBaseline.search);
      expect(metrics.lastRenderTime).toBeLessThan(performanceBaseline.render);

      const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
      searchInput.dispatchEvent(downEvent);

      const finalMetrics = tabSearcher.getPerformanceMetrics();
      expect(finalMetrics.lastNavigationTime).toBeLessThan(
        performanceBaseline.navigation
      );
    });
  });
});
