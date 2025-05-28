# GitHub Copilot Instructions for Tab Search Chrome Extension

## Environment Configuration

### Terminal & Build Environment

- **Operating System**: macOS with zsh shell
- **Terminal Commands**:
  - DO NOT use `timeout` command (not available in macOS by default)
  - Use standard Unix commands or `gtimeout` if timeout functionality is needed
  - Always wait for build and test completion - they typically take 3-10 seconds
  - Do not interrupt or timeout test runs prematurely

### Testing & Build Guidelines

- **Test Execution**: Always allow tests to complete fully before proceeding
- **Build Process**: Wait for compilation and bundling to finish completely
- **Coverage Reports**: Allow time for coverage generation (can take several seconds)
- **Performance**: Tests may take longer with large tab datasets or complex scenarios

## Project Overview

This is a Chrome Extension called "Tab Search" (internal name: laricercadielisa) that allows users to search through all opened browser tabs quickly and efficiently. The extension provides a modern, intuitive interface for tab management with real-time search capabilities.

## Project Structure

This is the project structure, updated every time new files are added.

```
laricercadielisa/
├── manifest.json          # Chrome extension manifest (v3)
├── popup.html             # Main popup interface
├── popup.css              # Styling for the popup
├── popup.js               # Main functionality and tab management
├── icons/
│   └── icon16.svg         # Extension icon
├── README.md              # Project documentation
├── .github/               # GitHub configuration
│   ├── copilot-instructions.md  # GitHub Copilot instructions
│   └── feature.prompt     # Feature development prompt
└── LICENSE                # Project license
```

## Technology Stack & Conventions

### Core Technologies

- **Chrome Extension Manifest V3** - Modern extension API
- **Vanilla JavaScript** - No frameworks, ES6+ features
- **Modern CSS** - Flexbox, Grid, CSS Variables, Gradients
- **HTML5** - Semantic markup

### Code Style & Conventions

#### JavaScript

- Use ES6+ features (async/await, arrow functions, destructuring)
- Class-based architecture for main components
- Async/await for Chrome API calls
- Error handling with try/catch blocks
- Use `const` and `let`, avoid `var`
- Descriptive variable and function names
- JSDoc comments for complex functions

#### CSS

- Modern CSS features (Grid, Flexbox, CSS Variables)
- BEM-like naming convention for classes
- Mobile-first responsive design
- Use of CSS custom properties for theming
- Smooth transitions and animations
- Consistent spacing using rem/em units

#### HTML

- Semantic HTML5 elements
- Proper accessibility attributes (ARIA labels, roles)
- Data attributes for JavaScript hooks
- Clean, readable structure

### Chrome Extension Specific Guidelines

#### Manifest V3 Best Practices

- Use minimal permissions required
- Prefer `activeTab` over broad `tabs` permission when possible
- Use service workers instead of background pages
- Follow Chrome Web Store policies

#### Security

- Content Security Policy compliance
- No inline scripts or styles
- Sanitize user inputs
- Escape HTML content properly

#### Performance

- Lazy load content when possible
- Debounce search inputs
- Minimize DOM manipulations
- Use efficient event handling

## Feature Implementation Guidelines

### Tab Search Functionality

- Real-time search as user types
- Search both tab titles and URLs
- Case-insensitive matching
- Highlight matching terms in results
- Support for keyboard navigation

### UI/UX Patterns

- Modern, clean design with gradients
- Consistent color scheme (#667eea primary)
- Smooth animations and transitions
- Loading states and error handling
- Responsive design for different screen sizes

### Tab Management Features

- Switch to tab on click
- Close individual tabs
- Close all other tabs (with confirmation)
- Visual indication of active tab
- Tab favicon display with fallbacks

## Code Examples & Patterns

### Chrome API Usage

```javascript
// Query tabs
const tabs = await chrome.tabs.query({});

// Switch to tab
await chrome.tabs.update(tabId, { active: true });
await chrome.windows.update(tab.windowId, { focused: true });

// Close tabs
await chrome.tabs.remove(tabId);
```

### Event Handling Pattern

```javascript
setupEventListeners() {
  this.searchInput.addEventListener('input', () => {
    this.filterTabs();
  });

  this.searchInput.addEventListener('keydown', (e) => {
    this.handleKeyNavigation(e);
  });
}
```

### Error Handling Pattern

```javascript
async loadTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    // Process tabs...
  } catch (error) {
    console.error('Error loading tabs:', error);
    this.showError('Failed to load tabs');
  }
}
```

## Quality Assurance & Best Practices

### Documentation Requirements

Every feature addition MUST include:

#### Code Documentation

- JSDoc comments for all public methods and complex functions
- Inline comments explaining business logic and Chrome API usage
- README updates for new user-facing features
- Architecture decisions documented in comments

```javascript
/**
 * Filters tabs based on search query with debouncing
 * @param {string} query - Search term to filter by
 * @param {boolean} [caseSensitive=false] - Whether search is case sensitive
 * @returns {Array<Tab>} Filtered array of tab objects
 */
async filterTabs(query, caseSensitive = false) {
  // Implementation with proper error handling
}
```

#### Feature Documentation

- Update README.md with new features and usage instructions
- Document any new keyboard shortcuts or UI interactions
- Include screenshots for visual changes
- Update permissions documentation if new Chrome APIs are used

### Version Control Best Practices

#### Commit Standards

- Use conventional commit format: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`
- Include issue/feature references in commit messages
- Keep commits atomic and focused on single changes
- Write descriptive commit messages explaining the "why" not just "what"

#### Code Review Requirements

- All features must be reviewed before merging
- Review checklist includes security, performance, and accessibility
- Test coverage must be maintained or improved
- Documentation must be updated for user-facing changes

### Performance Monitoring

#### Metrics to Track

- Popup load time (target: <100ms)
- Search response time (target: <50ms for 100+ tabs)
- Memory usage with large tab counts
- CPU usage during intensive filtering

#### Performance Testing

```javascript
// Example performance test pattern
console.time("tab-filter");
const results = await this.filterTabs(query);
console.timeEnd("tab-filter");
console.log(`Filtered ${this.tabs.length} tabs to ${results.length} results`);
```

### Security & Privacy Guidelines

#### Data Handling

- Never store sensitive tab information persistently
- Minimize data retention in memory
- Clear search history and cached data appropriately
- Follow principle of least privilege for permissions

#### Content Security

- All dynamic content must be sanitized
- No eval() or similar unsafe patterns
- Validate all Chrome API responses
- Handle permission errors gracefully

### Release Process

#### Pre-Release Checklist

- [ ] All tests pass (manual and automated)
- [ ] Performance benchmarks meet targets
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Version number incremented appropriately
- [ ] Change log updated with new features/fixes

#### Post-Release Monitoring

- Monitor extension performance metrics
- Track user feedback and error reports
- Plan hotfixes for critical issues
- Document lessons learned for future releases

## Development Guidelines

### Feature Development Workflow

#### Before Starting Any Feature

1. **Plan & Document**: Write feature specification with user stories
2. **Design Review**: Create UI mockups and get feedback
3. **Test Planning**: Define test scenarios and acceptance criteria
4. **Security Assessment**: Identify potential security implications
5. **Performance Impact**: Consider effects on extension performance

#### During Development

1. **Follow TDD**: Write tests before implementing features
2. **Incremental Commits**: Make small, focused commits with clear messages
3. **Code Reviews**: Get feedback early and often
4. **Documentation**: Update docs as you code, not after
5. **Manual Testing**: Test continuously during development

#### Before Merging

1. **Full Test Suite**: Run all automated and manual tests
2. **Performance Check**: Verify no performance regressions
3. **Security Review**: Check for potential vulnerabilities
4. **Documentation Review**: Ensure all docs are updated
5. **Accessibility Audit**: Verify keyboard navigation and screen reader support

### When Adding New Features

1. Follow the existing class-based architecture
2. Add proper error handling and loading states
3. Include keyboard accessibility
4. Update the UI to match the existing design system
5. Test with various numbers of tabs and edge cases
6. Consider performance implications

### When Modifying Existing Code

1. Maintain backward compatibility
2. Follow existing naming conventions
3. Update related documentation
4. Test thoroughly across different scenarios
5. Preserve the modern, clean UI aesthetic

### Testing Requirements

Every feature addition MUST include comprehensive testing:

#### Testing Environment Guidelines

- **Wait for Completion**: Always allow tests to complete fully (typically 3-10 seconds)
- **No Timeouts**: Do not use `timeout` command on macOS - use `gtimeout` if needed
- **Coverage Generation**: Allow extra time for coverage reports to generate
- **Test Commands**: Use `npm test` or `npx vitest run --coverage` and wait for completion

#### Manual Testing Checklist

- [ ] Test with 1, 10, 50, and 100+ tabs
- [ ] Test with tabs having no favicons or broken favicon URLs
- [ ] Test with very long tab titles and URLs (500+ characters)
- [ ] Test keyboard navigation (Tab, Arrow keys, Enter, Escape)
- [ ] Test edge cases (no tabs, network errors, permission denied)
- [ ] Test across different Chrome versions and window states
- [ ] Test with pinned tabs, grouped tabs, and incognito windows
- [ ] Test performance with rapid user interactions
- [ ] Test accessibility with screen readers

#### Automated Testing

- Write unit tests for core logic functions
- Create integration tests for Chrome API interactions
- Test error handling and recovery scenarios
- Performance benchmarks for search filtering
- Cross-browser compatibility tests

#### Security Testing

- Validate all user inputs are properly escaped
- Test CSP compliance
- Verify no sensitive data leakage
- Test permission scope limitations

## Common Patterns to Follow

### DOM Manipulation

```javascript
// Create elements with proper escaping
createTabHTML(tab) {
  const escapedTitle = this.escapeHtml(tab.title);
  return `<div class="tab-item">${escapedTitle}</div>`;
}
```

### Search and Filtering

```javascript
filterTabs() {
  const query = this.searchInput.value.toLowerCase().trim();
  this.filteredTabs = this.tabs.filter(tab =>
    tab.title.toLowerCase().includes(query) ||
    tab.url.toLowerCase().includes(query)
  );
}
```

### UI State Management

```javascript
showLoading(show) {
  this.loadingEl.style.display = show ? 'flex' : 'none';
  this.tabsList.style.display = show ? 'none' : 'block';
}
```

## Extension-Specific Considerations

### Permissions

- Only request necessary permissions
- Document why each permission is needed
- Consider user privacy implications

### Performance

- Extension popup should load quickly
- Minimize memory usage
- Handle large numbers of tabs efficiently

### User Experience

- Provide clear feedback for all actions
- Handle edge cases gracefully
- Maintain consistent behavior across different browser states

## File-Specific Notes

### popup.js

- Main application logic in `TabSearcher` class
- All Chrome API interactions
- Event handling and UI updates

### popup.css

- Modern design system
- Responsive layout
- Smooth animations and hover effects

### manifest.json

- Minimal required permissions
- Proper icon and popup configuration
- Version 3 manifest structure

When working on this project, prioritize user experience, performance, and maintainability. The extension should feel fast, responsive, and integrate seamlessly with the browser experience.
