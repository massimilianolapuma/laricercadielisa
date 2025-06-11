import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabSearcher } from '../../popup.js';

/**
 * Test coverage for popup-init.js initialization logic
 * This ensures the initialization file is tested to achieve required coverage
 */
describe('popup-init.js Coverage Tests', () => {
  beforeEach(() => {
    // Clear the DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    global.window.tabSearcher = undefined;

    // Mock document.readyState
    Object.defineProperty(document, 'readyState', {
      writable: true,
      value: 'complete'
    });
  });

  it('should add keyboard navigation CSS to document head', async () => {
    // Import the popup-init module to trigger execution
    await import('../../popup-init.js');
    
    // Check that CSS was added to head
    const styleElements = document.head.querySelectorAll('style');
    expect(styleElements.length).toBeGreaterThan(0);
    
    // Find the style element with keyboard navigation CSS
    const keyboardStyleElement = Array.from(styleElements).find(style => 
      style.textContent.includes('.tab-item.keyboard-active')
    );
    
    expect(keyboardStyleElement).toBeTruthy();
    expect(keyboardStyleElement.textContent).toContain('.tab-item.keyboard-active');
    expect(keyboardStyleElement.textContent).toContain('background: linear-gradient');
    expect(keyboardStyleElement.textContent).toContain('border-left-color: #667eea');
  });

  it('should initialize TabSearcher when DOM is ready (loading state)', async () => {
    // Set readyState to loading to test DOMContentLoaded path
    Object.defineProperty(document, 'readyState', {
      writable: true,
      value: 'loading'
    });

    // Mock addEventListener to capture the event listener
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    
    // Import the popup-init module
    await import('../../popup-init.js');
    
    // Verify DOMContentLoaded event listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
    
    // Get the callback function and execute it
    const domContentLoadedCallback = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'DOMContentLoaded'
    )[1];
    
    // Execute the callback
    domContentLoadedCallback();
    
    // Check that TabSearcher was initialized
    expect(global.window.tabSearcher).toBeInstanceOf(TabSearcher);
  });

  it('should initialize TabSearcher immediately when DOM is already ready', async () => {
    // Set readyState to complete (already ready)
    Object.defineProperty(document, 'readyState', {
      writable: true,
      value: 'complete'
    });

    // Import the popup-init module
    await import('../../popup-init.js');
    
    // Check that TabSearcher was initialized immediately
    expect(global.window.tabSearcher).toBeInstanceOf(TabSearcher);
  });

  it('should handle interactive document state', async () => {
    // Set readyState to interactive (DOM ready but resources loading)
    Object.defineProperty(document, 'readyState', {
      writable: true,
      value: 'interactive'
    });

    // Import the popup-init module
    await import('../../popup-init.js');
    
    // Should initialize immediately since DOM is ready
    expect(global.window.tabSearcher).toBeInstanceOf(TabSearcher);
  });
});
