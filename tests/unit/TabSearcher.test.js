/**
 * Unit tests for TabSearcher class
 * Tests core functionality like filtering, escaping, and utility methods
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TabSearcher } from "../../popup.js";

describe("TabSearcher Unit Tests", () => {
  let tabSearcher;

  beforeEach(() => {
    // Create a new instance for each test
    tabSearcher = new TabSearcher();

    // Mock DOM elements that TabSearcher expects
    tabSearcher.searchInput = { value: "" };
    tabSearcher.tabsList = {
      innerHTML: "",
      style: { display: "block" },
      querySelectorAll: () => [],
    };
    tabSearcher.tabCountEl = { textContent: "" };
    tabSearcher.matchCountEl = { textContent: "", style: { display: "none" } };
    tabSearcher.noResultsEl = { style: { display: "none" } };
    tabSearcher.loadingEl = { style: { display: "none" } };
    tabSearcher.refreshBtn = { addEventListener: () => {} };
    tabSearcher.closeOthersBtn = { addEventListener: () => {} };
  });

  describe("Core Functionality", () => {
    it("should filter tabs by title", () => {
      // Setup test data
      tabSearcher.tabs = createMockTabs(3);
      tabSearcher.searchInput.value = "Test Tab 1";

      // Execute filter
      tabSearcher.filterTabs();

      // Verify results
      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].title).toBe("Test Tab 1");
    });

    it("should filter tabs by URL", () => {
      tabSearcher.tabs = [
        createMockTab({ id: 1, title: "Test", url: "https://example.com" }),
        createMockTab({ id: 2, title: "Another", url: "https://github.com" }),
        createMockTab({
          id: 3,
          title: "Third",
          url: "https://stackoverflow.com",
        }),
      ];
      tabSearcher.searchInput.value = "github";

      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].url).toBe("https://github.com");
    });

    it("should return all tabs when search is empty", () => {
      tabSearcher.tabs = createMockTabs(5);
      tabSearcher.searchInput.value = "";

      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(5);
    });

    it("should return empty array when no matches", () => {
      tabSearcher.tabs = createMockTabs(3);
      tabSearcher.searchInput.value = "nonexistent";

      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(0);
    });
  });

  describe("HTML Escaping", () => {
    it("should escape HTML characters correctly", () => {
      const testCases = [
        {
          input: '<script>alert("xss")</script>',
          expected: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
        },
        { input: "AT&T", expected: "AT&amp;T" },
        { input: 'Hello "World"', expected: "Hello &quot;World&quot;" },
        { input: "It's working", expected: "It&#x27;s working" },
        { input: "Normal text", expected: "Normal text" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(tabSearcher.escapeHtml(input)).toBe(expected);
      });
    });
  });

  describe("URL Formatting", () => {
    it("should format URLs correctly", () => {
      const url = "https://www.example.com/path/to/page?param=value";
      const formatted = tabSearcher.formatUrl(url);
      expect(formatted).toBe("www.example.com/path/to/page");
    });

    it("should handle invalid URLs gracefully", () => {
      const invalidUrl = "not-a-valid-url";
      const formatted = tabSearcher.formatUrl(invalidUrl);
      expect(formatted).toBe(invalidUrl);
    });
  });

  describe("Utility Methods", () => {
    it("should escape HTML properly", () => {
      const dangerous = '<script>alert("xss")</script>';
      const escaped = tabSearcher.escapeHtml(dangerous);
      expect(escaped).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
      );
    });

    it("should escape HTML with quotes and ampersands", () => {
      const text = 'Title with "quotes" & ampersands';
      const escaped = tabSearcher.escapeHtml(text);
      expect(escaped).toBe("Title with &quot;quotes&quot; &amp; ampersands");
    });
  });

  describe("Text Highlighting", () => {
    it("should highlight matching text case-insensitively", () => {
      const text = "This is a Test String";
      const query = "test";
      const highlighted = tabSearcher.highlightText(text, query);
      expect(highlighted).toContain('<span class="highlight">Test</span>');
    });

    it("should return escaped text when no query provided", () => {
      const text = '<script>alert("test")</script>';
      const highlighted = tabSearcher.highlightText(text, "");
      expect(highlighted).toBe(
        "&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;"
      );
    });

    it("should handle multiple matches in text", () => {
      const text = "Test this test string";
      const query = "test";
      const highlighted = tabSearcher.highlightText(text, query);
      const matches = highlighted.match(/<span class="highlight">/g);
      expect(matches).toHaveLength(2);
    });
  });

  describe("Tab Filtering", () => {
    beforeEach(() => {
      // Set up mock tabs with different titles and URLs
      tabSearcher.tabs = [
        createMockTab({
          id: 1,
          title: "GitHub Repository",
          url: "https://github.com/user/repo",
        }),
        createMockTab({
          id: 2,
          title: "Google Search",
          url: "https://google.com/search?q=test",
        }),
        createMockTab({
          id: 3,
          title: "Stack Overflow",
          url: "https://stackoverflow.com/questions",
        }),
        createMockTab({
          id: 4,
          title: "Documentation",
          url: "https://docs.example.com",
        }),
      ];
    });

    it("should filter tabs by title case-insensitively", () => {
      tabSearcher.searchInput.value = "github";
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].title).toBe("GitHub Repository");
    });

    it("should filter tabs by URL", () => {
      tabSearcher.searchInput.value = "stackoverflow";
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].url).toContain("stackoverflow.com");
    });

    it("should be case insensitive", () => {
      tabSearcher.searchInput.value = "GOOGLE";
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].title).toBe("Google Search");
    });

    it("should return all tabs when search is empty", () => {
      tabSearcher.searchInput.value = "";
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(4);
    });

    it("should handle special characters in search", () => {
      tabSearcher.searchInput.value = "q=test";
      tabSearcher.filterTabs();

      expect(tabSearcher.filteredTabs).toHaveLength(1);
      expect(tabSearcher.filteredTabs[0].url).toContain("q=test");
    });
  });

  describe("UI State Management", () => {
    it("should update statistics correctly", () => {
      tabSearcher.tabs = createMockTabs(10);
      tabSearcher.filteredTabs = createMockTabs(3);
      tabSearcher.searchInput.value = "test";

      tabSearcher.updateStats();

      expect(tabSearcher.tabCountEl.textContent).toBe("10 tabs");
      expect(tabSearcher.matchCountEl.textContent).toBe("3 matches");
    });
  });

  describe("Performance Tests", () => {
    it("should filter large number of tabs efficiently", () => {
      // Create 1000 mock tabs
      const largeTabs = Array.from({ length: 1000 }, (_, i) =>
        createMockTab({
          id: i + 1,
          title: `Tab ${i + 1}`,
          url: `https://example${i + 1}.com`,
        })
      );

      tabSearcher.tabs = largeTabs;
      tabSearcher.searchInput.value = "Tab 1";

      const startTime = performance.now();
      tabSearcher.filterTabs();
      const endTime = performance.now();

      // Should complete filtering within 100ms for 1000 tabs (50ms target is for 100+ tabs)
      expect(endTime - startTime).toBeLessThan(100);

      // Should find tabs that start with "Tab 1" (Tab 1, Tab 10-19, Tab 100-199, etc.)
      expect(tabSearcher.filteredTabs.length).toBeGreaterThan(100);
    });
  });
});
