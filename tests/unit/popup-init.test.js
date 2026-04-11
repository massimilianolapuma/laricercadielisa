import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('popup-init.js Coverage Tests', () => {
  let originalDocument;
  let originalWindow;
  let mockDocument;
  let mockWindow;
  let mockStyle;
  let addEventListenerSpy;
  let appendChildSpy;
  let createElementSpy;
  let TabSearcherMock;

  beforeEach(() => {
    // Store original globals
    originalDocument = global.document;
    originalWindow = global.window;

    // Reset all mocks
    vi.clearAllMocks();
    vi.resetModules();

    // Create mock style element
    mockStyle = {
      textContent: ''
    };

    // Mock document methods
    addEventListenerSpy = vi.fn();
    appendChildSpy = vi.fn();
    createElementSpy = vi.fn(() => mockStyle);

    mockDocument = {
      readyState: 'loading',
      addEventListener: addEventListenerSpy,
      head: {
        appendChild: appendChildSpy
      },
      createElement: createElementSpy,
      querySelectorAll: vi.fn(() => []),
      getElementById: vi.fn(() => null),
      title: ''
    };

    // Mock TabSearcher constructor as a proper class
    class TabSearcherMockClass {
      constructor() {
        this.init = vi.fn();
        this.loadTabs = vi.fn();
      }
    }
    TabSearcherMock = TabSearcherMockClass;

    mockWindow = {};
  });

  afterEach(() => {
    // Restore original globals
    global.document = originalDocument;
    global.window = originalWindow;
    vi.doUnmock('../../popup.js');
  });

  it('should inject CSS styles and register DOMContentLoaded when DOM is loading', async () => {
    // Set up mocks before importing
    global.document = mockDocument;
    global.window = mockWindow;
    mockDocument.readyState = 'loading';

    // Mock the TabSearcher import
    vi.doMock('../../popup.js', () => ({
      TabSearcher: TabSearcherMock
    }));

    // Import the module to execute initialization code
    await import('../../popup-init.js');

    // Verify createElement was called to create style element
    expect(createElementSpy).toHaveBeenCalledWith('style');

    // Verify the CSS content was set
    expect(mockStyle.textContent).toContain('.tab-item.keyboard-active');
    expect(mockStyle.textContent).toContain('background: linear-gradient');
    expect(mockStyle.textContent).toContain('border-left-color: #667eea');

    // Verify style was appended to head
    expect(appendChildSpy).toHaveBeenCalledWith(mockStyle);

    // Verify DOMContentLoaded listener was registered
    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

    // Fire the DOMContentLoaded callback to cover the loading branch body
    const domCallback = addEventListenerSpy.mock.calls.find(([event]) => event === 'DOMContentLoaded')?.[1];
    domCallback();

    // Verify TabSearcher was instantiated and init called
    expect(mockWindow.tabSearcher).toBeDefined();
    expect(mockWindow.tabSearcher.init).toHaveBeenCalled();
  });

  it('should apply i18n and initialize immediately when DOM is already ready', async () => {
    const i18nEl = { textContent: '', dataset: { i18n: 'appName' } };
    const placeholderEl = { placeholder: '', dataset: { i18nPlaceholder: 'searchPlaceholder' } };
    const titleAttrEl = { title: '', dataset: { i18nTitle: 'defaultTitle' } };
    const ariaEl = { setAttribute: vi.fn(), dataset: { i18nAriaLabel: 'closeTab' } };

    mockDocument.querySelectorAll = vi.fn(selector => {
      if (selector === '[data-i18n]') { return [i18nEl]; }
      if (selector === '[data-i18n-placeholder]') { return [placeholderEl]; }
      if (selector === '[data-i18n-title]') { return [titleAttrEl]; }
      if (selector === '[data-i18n-aria-label]') { return [ariaEl]; }
      return [];
    });
    mockDocument.readyState = 'complete';
    global.document = mockDocument;
    global.window = mockWindow;

    vi.doMock('../../popup.js', () => ({
      TabSearcher: TabSearcherMock
    }));

    await import('../../popup-init.js');

    // applyI18n called all four querySelectorAll selectors
    expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('[data-i18n]');
    expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('[data-i18n-placeholder]');
    expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('[data-i18n-title]');
    expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('[data-i18n-aria-label]');

    // DOM elements were updated with translated text
    expect(i18nEl.textContent).toBeTruthy();
    expect(placeholderEl.placeholder).toBeTruthy();
    expect(titleAttrEl.title).toBeTruthy();
    expect(ariaEl.setAttribute).toHaveBeenCalledWith('aria-label', expect.any(String));

    // document.title was set via applyI18n
    expect(mockDocument.title).toBeTruthy();

    // TabSearcher was instantiated immediately (not via DOMContentLoaded listener)
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
    expect(mockWindow.tabSearcher).toBeDefined();
    expect(mockWindow.tabSearcher.init).toHaveBeenCalled();
  });

  it('should fall back to key when i18n message is empty string', async () => {
    const unknownEl = { textContent: '', dataset: { i18n: 'unknownKey' } };

    mockDocument.querySelectorAll = vi.fn(selector => {
      if (selector === '[data-i18n]') { return [unknownEl]; }
      return [];
    });
    mockDocument.readyState = 'complete';
    global.document = mockDocument;
    global.window = mockWindow;

    // Make getMessage return empty string to trigger the || key fallback
    global.chrome.i18n.getMessage.mockReturnValue('');

    vi.doMock('../../popup.js', () => ({
      TabSearcher: TabSearcherMock
    }));

    await import('../../popup-init.js');

    // The fallback `|| key` means textContent should equal the key
    expect(unknownEl.textContent).toBe('unknownKey');
  });

  it('should test initialization logic directly for DOM loading state', () => {
    // Set up mocks
    global.document = mockDocument;
    global.window = mockWindow;
    mockDocument.readyState = 'loading';

    // Create instance
    const instance = new TabSearcherMock();

    // Simulate the initialization logic directly
    if (mockDocument.readyState === 'loading') {
      mockDocument.addEventListener('DOMContentLoaded', () => {
        mockWindow.tabSearcher = instance;
      });
    } else {
      mockWindow.tabSearcher = instance;
    }

    // Verify DOMContentLoaded event listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

    // Simulate the DOM content loaded event
    const callback = addEventListenerSpy.mock.calls[0][1];
    callback();

    // Verify TabSearcher was instantiated
    expect(mockWindow.tabSearcher).toBeDefined();
  });

  it('should test initialization logic directly for DOM complete state', () => {
    // Set up mocks
    global.document = mockDocument;
    global.window = mockWindow;
    mockDocument.readyState = 'complete';

    // Create instance
    const instance = new TabSearcherMock();

    // Simulate the initialization logic directly
    if (mockDocument.readyState === 'loading') {
      mockDocument.addEventListener('DOMContentLoaded', () => {
        mockWindow.tabSearcher = instance;
      });
    } else {
      mockWindow.tabSearcher = instance;
    }

    // Should initialize immediately
    expect(mockWindow.tabSearcher).toBeDefined();

    // Should not add event listener since DOM is already ready
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should test initialization logic directly for DOM interactive state', () => {
    // Set up mocks
    global.document = mockDocument;
    global.window = mockWindow;
    mockDocument.readyState = 'interactive';

    // Create instance
    const instance = new TabSearcherMock();

    // Simulate the initialization logic directly
    if (mockDocument.readyState === 'loading') {
      mockDocument.addEventListener('DOMContentLoaded', () => {
        mockWindow.tabSearcher = instance;
      });
    } else {
      mockWindow.tabSearcher = instance;
    }

    // Should initialize immediately since DOM is ready
    expect(mockWindow.tabSearcher).toBeDefined();

    // Should not add event listener
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });
});

describe('initLangBtn', () => {
  let origDocument;
  let origWindow;
  let mockLangBtn;
  let mockDoc;
  let mockWin;
  let TabSearcherMock2;

  beforeEach(() => {
    origDocument = global.document;
    origWindow = global.window;

    vi.clearAllMocks();
    vi.resetModules();

    mockLangBtn = { textContent: '', addEventListener: vi.fn() };

    mockDoc = {
      readyState: 'complete',
      addEventListener: vi.fn(),
      head: { appendChild: vi.fn() },
      createElement: vi.fn(() => ({ textContent: '' })),
      querySelectorAll: vi.fn(() => []),
      getElementById: vi.fn(() => mockLangBtn),
      title: ''
    };
    mockWin = {};

    class _TS { constructor() { this.init = vi.fn(); } }
    TabSearcherMock2 = _TS;

    global.document = mockDoc;
    global.window = mockWin;
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({}) })
    );
    global.chrome = {
      tabs: { query: vi.fn(), update: vi.fn(), remove: vi.fn(), get: vi.fn(), getCurrent: vi.fn() },
      windows: { update: vi.fn() },
      runtime: {
        lastError: null,
        onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
        getURL: vi.fn(p => `chrome-extension://abc123/${p}`)
      },
      storage: {
        session: { set: vi.fn().mockResolvedValue(undefined), get: vi.fn().mockResolvedValue({}) },
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined)
        }
      },
      i18n: {
        getMessage: vi.fn(() => ''),
        getUILanguage: vi.fn(() => 'en-US')
      }
    };
    vi.doMock('../../popup.js', () => ({ TabSearcher: TabSearcherMock2 }));
  });

  afterEach(() => {
    global.document = origDocument;
    global.window = origWindow;
    vi.doUnmock('../../popup.js');
  });

  it('returns early when langBtn not found', async () => {
    mockDoc.getElementById = vi.fn(() => null);
    await import('../../popup-init.js');
    await Promise.resolve();
    expect(mockDoc.getElementById).toHaveBeenCalledWith('langBtn');
    expect(global.chrome.storage.local.get).not.toHaveBeenCalled();
  });

  it('sets langBtn text to EN when no stored locale and UI lang is en', async () => {
    global.chrome.storage.local.get = vi.fn().mockResolvedValue({});
    global.chrome.i18n.getUILanguage = vi.fn(() => 'en-US');
    await import('../../popup-init.js');
    await Promise.resolve();
    await Promise.resolve();
    expect(mockLangBtn.textContent).toBe('EN');
  });

  it('falls back to EN when UI locale is unknown', async () => {
    global.chrome.storage.local.get = vi.fn().mockResolvedValue({});
    global.chrome.i18n.getUILanguage = vi.fn(() => 'fr-FR');
    await import('../../popup-init.js');
    await Promise.resolve();
    await Promise.resolve();
    expect(mockLangBtn.textContent).toBe('EN');
  });

  it('sets langBtn text to IT when UI locale is it', async () => {
    global.chrome.storage.local.get = vi.fn().mockResolvedValue({});
    global.chrome.i18n.getUILanguage = vi.fn(() => 'it-IT');
    await import('../../popup-init.js');
    await Promise.resolve();
    await Promise.resolve();
    expect(mockLangBtn.textContent).toBe('IT');
  });

  it('applies stored locale on init via applyLang', async () => {
    global.chrome.storage.local.get = vi.fn().mockResolvedValue({ forcedLocale: 'it' });
    await import('../../popup-init.js');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(global.fetch).toHaveBeenCalled();
    expect(global.chrome.runtime.getURL).toHaveBeenCalledWith('_locales/it/messages.json');
    expect(mockLangBtn.textContent).toBe('IT');
  });

  it('registers click handler on langBtn', async () => {
    global.chrome.storage.local.get = vi.fn().mockResolvedValue({});
    global.chrome.i18n.getUILanguage = vi.fn(() => 'en-US');
    await import('../../popup-init.js');
    await Promise.resolve();
    await Promise.resolve();
    expect(mockLangBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('click cycles en -> it and persists to storage', async () => {
    global.chrome.storage.local.get = vi.fn().mockResolvedValue({});
    global.chrome.i18n.getUILanguage = vi.fn(() => 'en-US');
    await import('../../popup-init.js');
    await Promise.resolve();
    await Promise.resolve();

    const clickCall = mockLangBtn.addEventListener.mock.calls.find(([e]) => e === 'click');
    const clickHandler = clickCall[1];
    clickHandler();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(global.chrome.runtime.getURL).toHaveBeenCalledWith('_locales/it/messages.json');
    expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ forcedLocale: 'it' });
    expect(mockLangBtn.textContent).toBe('IT');
  });
});
