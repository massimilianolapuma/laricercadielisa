/**
 * Browser initialization for Tab Search Extension
 * This file handles the browser-specific initialization and styling
 */

import { TabSearcher } from './popup.js';

// Add CSS for keyboard navigation
const style = document.createElement('style');
style.textContent = `
  .tab-item.keyboard-active {
    background: linear-gradient(90deg, rgba(26, 27, 32, 0.2) 0%, rgba(102, 126, 234, 0.1) 100%);
    border-left-color: #667eea;
  }
`;
document.head.appendChild(style);

const applyI18n = () => {
  const t = key => chrome.i18n.getMessage(key) || key;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)); });
  document.title = t('appName');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyI18n();
    window.tabSearcher = new TabSearcher();
    window.tabSearcher.init();
  });
} else {
  applyI18n();
  window.tabSearcher = new TabSearcher();
  window.tabSearcher.init();
}
