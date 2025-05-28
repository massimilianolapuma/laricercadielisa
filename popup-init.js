/**
 * Browser initialization for Tab Search Extension
 * This file handles the browser-specific initialization and styling
 */

import { TabSearcher } from "./popup.js";

// Add CSS for keyboard navigation
const style = document.createElement("style");
style.textContent = `
  .tab-item.keyboard-active {
    background: linear-gradient(90deg, rgba(26, 27, 32, 0.2) 0%, rgba(102, 126, 234, 0.1) 100%);
    border-left-color: #667eea;
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.tabSearcher = new TabSearcher();
  });
} else {
  window.tabSearcher = new TabSearcher();
}
