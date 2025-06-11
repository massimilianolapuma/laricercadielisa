# Tab Search Chrome Extension

A modern Chrome extension for quickly searching through all opened browser tabs with an intuitive, fast interface.

## 🚀 Features

- **Real-time Tab Search**: Search through all open tabs by title or URL as you type
- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, and Escape
- **Modern UI**: Clean, responsive design with smooth animations and gradients
- **Fast Performance**: Optimized for handling hundreds of tabs efficiently
- **Tab Management**: Switch to tabs, close individual tabs, or close all other tabs
- **Visual Indicators**: Shows favicons, active tab highlighting, and loading states
- **Accessibility**: Full screen reader support and ARIA compliance

## 📥 Installation

### From Chrome Web Store

_Coming soon - extension will be published to the Chrome Web Store_

### Manual Installation (Development)

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/laricercadielisa.git
   cd laricercadielisa
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked" and select the project folder

5. The Tab Search extension should now appear in your browser toolbar

## 🎯 Usage

1. **Open Extension**: Click the Tab Search icon in your browser toolbar or use `Ctrl+Shift+F` (customizable)

2. **Search Tabs**: Start typing to search through tab titles and URLs in real-time

3. **Navigate Results**:

   - Use arrow keys (↑/↓) to navigate through search results
   - Press `Enter` to switch to the selected tab
   - Press `Escape` to close the popup

4. **Tab Actions**:
   - **Click tab**: Switch to that tab
   - **Click × button**: Close individual tab
   - **Click "Close Others"**: Close all tabs except the selected one (with confirmation)

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Chrome/Chromium browser

### Setup Development Environment

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Tests**:

   ```bash
   # Run all tests
   npm test

   # Run tests with coverage
   npm run test:coverage

   # Run tests in CI mode
   npm run test:coverage:ci

   # Run specific test suites
   npm run test:unit
   npm run test:integration
   npm run test:e2e
   npm run test:accessibility
   npm run test:performance
   ```

3. **Code Quality**:

   ```bash
   # Run ESLint
   npm run lint

   # Fix ESLint issues automatically
   npm run lint:fix
   ```

4. **Load Extension for Testing**:
   - Follow the manual installation steps above
   - Reload the extension in `chrome://extensions/` after making changes

### Project Structure

```
laricercadielisa/
├── manifest.json          # Chrome extension manifest (v3)
├── popup.html             # Main popup interface
├── popup.css              # Styling for the popup
├── popup.js               # Main functionality and tab management
├── icons/
│   └── icon16.svg         # Extension icon
├── tests/                 # Test suites
│   ├── setup.js           # Test configuration and mocks
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # End-to-end tests
│   ├── accessibility/     # Accessibility tests
│   ├── performance/       # Performance tests
│   └── fixtures/          # Test data
├── coverage/              # Test coverage reports
├── .github/
│   └── workflows/         # CI/CD pipelines
└── README.md              # This file
```

### Technology Stack

- **Chrome Extension Manifest V3**: Modern extension API
- **Vanilla JavaScript**: ES6+, no frameworks for optimal performance
- **Modern CSS**: Flexbox, Grid, CSS Variables, smooth animations
- **Testing**: Vitest, JSDOM, Chrome API mocking
- **Code Quality**: ESLint, SonarCloud integration
- **CI/CD**: GitHub Actions with automated testing and quality gates

## 🧪 Testing

The project includes comprehensive testing infrastructure:

### Test Suites

- **Unit Tests** (`tests/unit/`): Test individual components and functions
- **Integration Tests** (`tests/integration/`): Test Chrome API interactions
- **End-to-End Tests** (`tests/e2e/`): Test complete user workflows
- **Accessibility Tests** (`tests/accessibility/`): Verify WCAG compliance
- **Performance Tests** (`tests/performance/`): Ensure fast load and search times

### Test Commands

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:e2e              # End-to-end tests only
npm run test:accessibility    # Accessibility tests only
npm run test:performance      # Performance tests only

# CI/CD test command (used in GitHub Actions)
npm run test:coverage:ci
```

### Test Coverage

The project maintains high test coverage with reports generated in multiple formats:

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Format**: `coverage/lcov.info` (for SonarCloud integration)
- **JSON Report**: `coverage/coverage-final.json`

## 🔧 Code Quality & CI/CD

### ESLint Configuration

- Modern ES6+ rules
- Chrome extension specific globals
- Accessibility best practices
- Performance optimizations

### SonarCloud Integration

The project uses SonarCloud for continuous code quality monitoring:

- **Quality Gates**: Automated checks for code coverage, duplications, and maintainability
- **Security Analysis**: Vulnerability detection and security hotspots
- **Technical Debt**: Code smell detection and refactoring suggestions
- **Coverage Tracking**: Integration with test coverage reports

### GitHub Actions Pipeline

Automated CI/CD pipeline runs on every push and PR:

1. **Setup**: Node.js 18, dependency installation
2. **Testing**: Full test suite with coverage generation
3. **Linting**: ESLint code quality checks
4. **Analysis**: SonarCloud code quality analysis
5. **Coverage**: LCOV report generation for quality tracking

## 🏗️ Build & Packaging

You can use the provided `build.js` script to increment the extension version, copy all necessary files to a `build/` directory, and create a distributable zip file for upload or sharing.

### Build Steps

1. **Run the build script:**

   ```bash
   node build.js [patch|minor|major]
   ```
   - The optional argument controls version bumping (default: `patch`).
   - This will:
     - Increment the version in `manifest.json`
     - Copy all extension files to a `build/` directory
     - Create a zip file (e.g. `tab-search-v1.2.3.zip`) in the project root
     - Log the build in `version-log.txt`

2. **Load the built extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked" and select the `build/` directory

3. **Distribute or upload:**
   - Use the generated zip file for Chrome Web Store submission or sharing.

---

## 📋 API Reference

### Chrome Extension APIs Used

- `chrome.tabs.query()`: Get list of all open tabs
- `chrome.tabs.update()`: Switch to a specific tab
- `chrome.windows.update()`: Focus tab's window
- `chrome.tabs.remove()`: Close tabs

### Main Classes

#### `TabSearcher`

Main application class that handles tab management and UI interactions.

**Key Methods**:

- `loadTabs()`: Fetch all open tabs from Chrome API
- `filterTabs()`: Filter tabs based on search query
- `switchToTab(tabId)`: Switch to specified tab
- `closeTab(tabId)`: Close specified tab
- `setupEventListeners()`: Initialize UI event handlers

## 🎨 Design System

### Color Scheme

- **Primary**: `#667eea` (Modern blue gradient)
- **Secondary**: `#764ba2` (Purple accent)
- **Background**: `#f8fafc` (Light gray)
- **Text**: `#1a202c` (Dark gray)
- **Border**: `#e2e8f0` (Light border)

### Typography

- **Font Family**: System fonts (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`)
- **Font Sizes**: `12px` to `16px` with consistent line heights
- **Font Weights**: `400` (normal), `500` (medium), `600` (semibold)

### Animations

- **Transitions**: `0.2s ease` for hover effects
- **Loading**: Smooth spinner animations
- **Hover States**: Subtle color and shadow changes

## 🛡️ Security

### Content Security Policy

- No inline scripts or styles
- Restricted to essential Chrome APIs
- XSS protection through HTML escaping

### Permissions

- **activeTab**: Access to currently active tab
- **tabs**: Access to tab information (title, URL, favicon)

_Minimal permissions following the principle of least privilege_

## 🔧 Performance

### Optimization Strategies

- **Debounced Search**: 150ms delay to prevent excessive filtering
- **Virtual Scrolling**: Efficient rendering for large tab lists
- **Lazy Loading**: Icons and favicons loaded on demand
- **Memory Management**: Proper cleanup of event listeners

### Performance Targets

- **Popup Load Time**: < 100ms
- **Search Response**: < 50ms for 100+ tabs
- **Memory Usage**: < 10MB for 500+ tabs

## 📝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/your-feature-name`
3. **Make changes** following the coding guidelines
4. **Add tests** for new functionality
5. **Run test suite**: `npm run test:coverage`
6. **Check code quality**: `npm run lint`
7. **Commit changes**: Use conventional commit format
8. **Push and create PR**

### Coding Guidelines

#### JavaScript

- Use ES6+ features (async/await, arrow functions, destructuring)
- Follow class-based architecture for components
- Include JSDoc comments for complex functions
- Use `const` and `let`, avoid `var`
- Implement proper error handling

#### CSS

- Use modern features (Grid, Flexbox, CSS Variables)
- Follow BEM-like naming convention
- Mobile-first responsive design
- Consistent spacing with rem/em units

#### Testing

- Write tests for all new features
- Maintain or improve test coverage
- Include edge cases and error scenarios
- Test accessibility and performance

### Commit Message Format

```
feat: add new search filtering feature
fix: resolve tab switching bug
docs: update installation instructions
style: improve button hover animations
test: add accessibility test coverage
refactor: optimize tab loading performance
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/laricercadielisa/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/laricercadielisa/discussions)
- **Email**: your.email@example.com

## 🙏 Acknowledgments

- Chrome Extensions team for the excellent Manifest V3 APIs
- Vitest team for the fast and modern testing framework
- SonarCloud for code quality analysis
- The open source community for inspiration and best practices

---

**Made with ❤️ for better tab management**
