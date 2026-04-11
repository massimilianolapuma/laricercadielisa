# Design Spec — Issue #15: Re-design Panel Interface

> **Source**: Figma Make — [https://www.figma.com/make/9ZRIXoBTNbWbLaLEqzaZMR/Chrome-Extension-Tab-Search](https://www.figma.com/make/9ZRIXoBTNbWbLaLEqzaZMR/Chrome-Extension-Tab-Search)
> **Extracted via**: Figma MCP (`get_design_context`) — App.tsx + theme.css
> **Status**: Complete

---

## Design Direction Summary

The new design replaces the current purple gradient header UI with a **clean, minimal, flat design**
using Tailwind CSS utility classes. Key differences:

| Aspect | Current (old) | New (Figma) |
| -------- | -------------- | ------------- |
| Header | Purple/indigo gradient, centered emoji+title | Flat white/dark, left-aligned title, theme toggle on right |
| Search | Input + absolute-positioned buttons | Input with inline search icon + X, full-width Exact Match button below |
| Stats bar | Shows tab count / match count | **Removed** |
| Tab items | Left-border accent on hover | Subtle `hover:bg-gray-50` (light) / `hover:bg-gray-800` (dark), no accent border |
| Tab separators | None (items are separate blocks) | `divide-y divide-gray-100` thin lines between items |
| Favicon | 16×16px fixed size | Displayed as emoji/image, text-xl (20px+), flex-shrink-0, mt-0.5 |
| Footer | Gray bg + gradient buttons | Flat white/dark, outlined + blue filled buttons |
| Theme | Light only | **Light / Dark / System** toggle (new feature) |
| Max width | 400px fixed | `max-w-[500px]` |
| Container shadow | Heavy box-shadow | **None** |
| Container gradient bg | Purple gradient on body | **None** — plain white or gray-900 |

---

## Color Tokens

### Light Mode

| Token | Tailwind class | Hex value | Usage |
| ------- | --------------- | ----------- | ------- |
| bg-white | `bg-white` | `#ffffff` | Main container, input, footer |
| gray-900 | `text-gray-900` | `#111827` | Page title, tab title |
| gray-700 | `text-gray-700` | `#374151` | Close Others Tabs button text |
| gray-600 | `text-gray-600` | `#4b5563` | Theme toggle icon |
| gray-500 | `text-gray-500` | `#6b7280` | Tab URL, input placeholder text |
| gray-400 | `text-gray-400` | `#9ca3af` | Search icon in input |
| gray-300 | `border-gray-300` | `#d1d5db` | Input border, Close Others border |
| gray-200 | `border-gray-200` | `#e5e7eb` | Header border-b, footer border-t |
| gray-100 | `divide-gray-100` | `#f3f4f6` | Tab list dividers |
| gray-50 | `hover:bg-gray-50` | `#f9fafb` | Tab hover bg, Exact Match hover |
| blue-700 | `text-blue-700` | `#1d4ed8` | Exact Match active text |
| blue-600 | `bg-blue-600` | `#2563eb` | Refresh button bg |
| blue-500 | `focus:ring-blue-500` | `#3b82f6` | Input focus ring |
| blue-300 | `border-blue-300` | `#93c5fd` | Exact Match active border |
| blue-50 | `bg-blue-50` | `#eff6ff` | Exact Match active bg |
| hover:blue-700 | `hover:bg-blue-700` | `#1d4ed8` | Refresh button hover |

### Dark Mode

| Token | Tailwind class | Usage |
| ------- | --------------- | ------- |
| gray-900 | `bg-gray-900` | Main container bg |
| gray-800 | `bg-gray-800` | Input bg, Close Others bg, Exact Match inactive bg |
| gray-700 | `bg-gray-700` | Hover states, Close Others hover |
| gray-700 | `border-gray-700` | Header border-b, footer border-t |
| gray-600 | `border-gray-600` | Input border, Close Others border, Exact Match inactive border |
| gray-500 | `text-gray-500` | Search icon |
| gray-400 | `text-gray-400` | Tab URL, input placeholder |
| gray-300 | `text-gray-300` | Close Others text, Exact Match inactive text |
| white | `text-white` | Title, tab title |
| blue-900 | `bg-blue-900` | Exact Match active bg |
| blue-700 | `border-blue-700` | Exact Match active border |
| blue-200 | `text-blue-200` | Exact Match active text |

---

## Typography

| Role | Tailwind classes | Notes |
| ------ | ----------------- | ------- |
| Page title | `text-lg font-semibold` | ~18px, weight 600 |
| Tab title | `text-sm font-medium truncate` | 14px, weight 500, single line |
| Tab URL | `text-xs truncate mt-0.5` | 12px, single line, ellipsis |
| Input text | `text-sm` | 14px |
| Input placeholder | `placeholder-gray-500` (light) / `placeholder-gray-400` (dark) | |
| Exact Match button | `text-xs` | 12px |
| Footer button | `text-sm font-medium` | 14px, weight 500 |
| No-results text | `text-sm` | 14px |

**Font family**: System stack (browser default, no custom font)

---

## Spacing & Sizing

| Area | Tailwind | px value |
| ------ | --------- | --------- |
| Container max-width | `max-w-[500px]` | 500px |
| Container height | `h-screen` | 100% viewport height |
| Header padding | `px-4 py-3` | 16px / 12px |
| Search section padding | `px-4 py-3` | 16px / 12px |
| Search section gap | `space-y-2` | 8px between input and Exact Match |
| Tab item padding | `px-4 py-3` | 16px / 12px |
| Tab favicon gap | `gap-3` | 12px |
| Tab favicon size | `text-xl` explicit; use `w-4 h-4` (16×16) for real img | |
| Tab favicon top offset | `mt-0.5` | 2px |
| Footer padding | `px-4 py-3` | 16px / 12px |
| Footer gap | `gap-3` | 12px |
| Input padding | `pl-9 pr-9 py-2` | left/right 36px, top/bottom 8px |
| Input border-radius | `rounded-md` | ~6px |
| Footer button radius | `rounded` | ~4px |
| Exact Match button radius | `rounded` | ~4px |
| Exact Match button padding | `py-1.5 px-3` | 6px / 12px |
| Theme icon button padding | `p-2` | 8px |
| Theme icon size | `w-4 h-4` | 16×16px |
| Search icon size | `w-4 h-4` | 16×16px |
| Clear X icon size | `w-4 h-4` | 16×16px |
| Footer button padding | `py-2 px-4` | 8px / 16px |

---

## Border & Radius

| Element | Tailwind | Value |
| --------- | --------- | ------- |
| Search input | `rounded-md` | 6px |
| Exact Match button | `rounded` | 4px |
| Footer buttons | `rounded` | 4px |
| Theme toggle button | `rounded` | 4px |
| Clear button | `rounded` | 4px |
| No other border-radius declarations | — | — |

---

## Component Specs

### Main Container

```css
flex flex-col h-screen w-full max-w-[500px] mx-auto
light: bg-white
dark:  bg-gray-900
```

### Header Bar

```css
px-4 py-3 border-b flex items-center justify-between
light: border-gray-200
dark:  border-gray-700
```

- Left: `<h1 class="text-lg font-semibold text-gray-900 dark:text-white">Tab Search</h1>`
- Right: Theme toggle icon button (`Monitor` / `Sun` / `Moon` icon from lucide)
  - Button: `p-2 rounded hover:bg-opacity-10 transition-colors`
  - Light: `text-gray-600 hover:bg-black/10`
  - Dark: `text-gray-300 hover:bg-white/10`
  - Icon size: `w-4 h-4`
  - title attribute cycles: `"Theme: system"` → `"Theme: light"` → `"Theme: dark"`

### Search Section

```css
px-4 py-3 border-b space-y-2
light: border-gray-200
dark:  border-gray-700
```

#### Search Input (relative wrapper)

```text
relative flex items-center gap-2
  └── div.relative.flex-1
        ├── Search icon: absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
        │   light: text-gray-400 | dark: text-gray-500
        ├── <input>:
        │   w-full pl-9 pr-9 py-2 border rounded-md text-sm
        │   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        │   light: bg-white border-gray-300 text-gray-900 placeholder-gray-500
        │   dark:  bg-gray-800 border-gray-600 text-white placeholder-gray-400
        └── Clear X button (shown only when searchQuery non-empty):
            absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded
            light: hover:bg-gray-100 | dark: hover:bg-gray-700
            icon: w-4 h-4 text-gray-500 (light) / text-gray-400 (dark)
```

#### Exact Match Button

```css
w-full py-1.5 px-3 text-xs rounded border transition-colors

Inactive:
  light: bg-white border-gray-300 text-gray-700 hover:bg-gray-50
  dark:  bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700

Active (exactMatch=true):
  light: bg-blue-50 border-blue-300 text-blue-700
  dark:  bg-blue-900 border-blue-700 text-blue-200

Label: "Exact Match" (inactive) | "✓ Exact Match" (active)
```

> **Note**: The `aria-pressed` attribute should be added for accessibility.

### Tab List Container

```text
flex-1 overflow-y-auto
Child wrapper: divide-y
  light: divide-gray-100
  dark:  divide-gray-700
```

### Tab Item

```css
w-full px-4 py-3 transition-colors text-left flex items-start gap-3
light: hover:bg-gray-50
dark:  hover:bg-gray-800
```

- **Favicon**: `text-xl flex-shrink-0 mt-0.5`
  - Use `<img class="w-4 h-4 flex-shrink-0 mt-0.5 rounded-sm">` for real favicons
  - Fallback: globe SVG icon or emoji placeholder
- **Title**: `text-sm font-medium truncate` — gray-900 (light) / white (dark)
- **URL**: `text-xs truncate mt-0.5` — gray-500 (light) / gray-400 (dark)
- **Close button**: NOT visible in Figma design screenshots — omit or keep hidden
  - If kept: `opacity-0 group-hover:opacity-1` pattern

### No-results State

```css
flex items-center justify-center h-full text-sm
light: text-gray-500
dark:  text-gray-400
Text: "No matching tabs found"
```

> No emoji icon in Figma version — just centered text.

### Footer

```css
px-4 py-3 border-t flex items-center justify-between gap-3
light: border-gray-200
dark:  border-gray-700
```

#### Close Other Tabs Button

```css
flex-1 py-2 px-4 text-sm font-medium rounded transition-colors border
light: text-gray-700 bg-white border-gray-300 hover:bg-gray-50
dark:  text-gray-300 bg-gray-800 border-gray-600 hover:bg-gray-700
```

#### Refresh Button

```css
flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors
(same in both light and dark modes)
```

---

## Icons Required

| Icon | Usage | Source |
| ------ | ------- | -------- |
| `Search` (magnifying glass) | Inside search input (left) | lucide-icons SVG or inline SVG |
| `X` (close) | Clear search button (right of input) | lucide-icons SVG or inline SVG |
| `Monitor` | Theme toggle — system mode | lucide-icons SVG or inline SVG |
| `Sun` | Theme toggle — light mode | lucide-icons SVG or inline SVG |
| `Moon` | Theme toggle — dark mode | lucide-icons SVG or inline SVG |

> **Important**: Chrome Extension CSP forbids remote SVG injection. Use **inline SVG** for all icons.
> Font Awesome CDN is currently used in the project — check if it covers Search/Monitor/Sun/Moon,
> or replace all FA icons with inline SVGs for the 5 icons above.

**Recommended inline SVG approach** (Lucide icons, MIT license):

```html
<!-- Search -->
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
</svg>

<!-- X (close) -->
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
</svg>

<!-- Monitor (system theme) -->
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
</svg>

<!-- Sun (light theme) -->
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
</svg>

<!-- Moon (dark theme) -->
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
</svg>
```

---

## Animations & Transitions

| Element | Transition |
| --------- | ----------- |
| Tab item hover | `transition-colors` |
| Exact Match button | `transition-colors` |
| Footer buttons | `transition-colors` |
| Theme toggle | `transition-colors` |
| Clear button hover | `transition-colors` |
| Input focus | `focus:ring-2 focus:ring-blue-500` |

All transitions use Tailwind's default `transition-colors` (150ms ease).

---

## Theme Toggle Implementation

The Figma design includes a cycling theme toggle in the header:

```text
system → light → dark → system → ...
```

Storage key: `chrome.storage.session` — key `themeMode` with values `'light' | 'dark' | 'system'`

Apply dark class to root container:

```js
// Apply dark mode:  container.classList.toggle('dark', isDark)
// isDark = (themeMode === 'dark') || (themeMode === 'system' && mediaQuery.matches)
```

Or use `prefers-color-scheme` media query listener + session storage persistence.

---

## What to Keep (DOM IDs & Accessibility)

These IDs and attributes must NOT change (used by `popup.js`):

| ID | Element |
| ---- | --------- |
| `#searchInput` | `<input>` search field |
| `#tabsList` | Tab list container |
| `#noResults` | No-results state |
| `#loadingState` | Loading state |
| `#clearSearchBtn` | Clear X button |
| `#exactMatchBtn` | Exact Match toggle |
| `#tabCount` | Tab count span |
| `#matchCount` | Match count span (if kept) |
| `#closeOtherTabsBtn` | Close Other Tabs button |
| `#refreshBtn` | Refresh button |

All `aria-label`, `aria-pressed`, `role` attributes must be preserved or improved.

---

## Implementation Notes for UI Implementer

1. **No Tailwind CLI/CDN needed**: Keep existing hand-written CSS in `popup.css`. Translate the Figma Tailwind classes to equivalent CSS custom properties and rules — do NOT add a Tailwind build step (violates the "no bundler" architecture).

2. **Remove**: gradient body background, heavy container shadow, stats bar (`#tabCount`/`#matchCount` spans are OK to keep hidden or remove from HTML if `popup.js` handles null gracefully).

3. **Add**: theme toggle button with `id="themeBtn"` in the header. Implement `cycleTheme()` logic in `popup.js` or as a small addition to `TabSearcher`.

4. **Font Awesome**: Current icons (`fa-xmark`, `fa-i-cursor`) can be replaced with the inline SVGs above. Or keep FA for xmark/cursor and add new inline SVGs for search/monitor/sun/moon.

5. **Dark mode**: Add `.dark` class support in `popup.css` using CSS custom properties. No separate stylesheet needed.

6. **Popup dimensions**: Change body `width/height` from 400×600 to `width: 500px; height: 100vh` (or keep 500px fixed height — Chrome popups have a max height).
   > Recommended: keep `width: 500px; max-height: 600px` since Chrome enforces popup limits.
