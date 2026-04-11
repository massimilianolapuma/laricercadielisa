# GitHub Copilot Instructions — Tab Search

Questo file descrive il contesto, le convenzioni e le regole del progetto
per guidare GitHub Copilot in modo coerente con il codebase esistente.

---

## Panoramica del progetto

**Tab Search** è un'estensione Chrome (Manifest V3) che permette di cercare
tra tutti i tab aperti nel browser. L'interfaccia è una popup con un campo
di ricerca, un pulsante "exact match" e un pulsante per cancellare la ricerca.

- **Linguaggio**: JavaScript ES2022, ES Modules (`type: "module"` in package.json)
- **Test**: Vitest + jsdom
- **Linting**: ESLint (regole strict, vedi `.eslintrc.cjs`)
- **CI/CD**: GitHub Actions (SonarCloud, CodeQL, release automatico)
- **Nessun framework**: vanilla JS, nessun bundler in runtime

---

## Architettura

Tutto il codice funzionale è in `popup.js`, organizzato come **singola classe**:

```
class TabSearcher
  ├── init()                    ← entry point, chiamato all'avvio
  ├── setupEventListeners()     ← registra tutti gli event listener
  ├── loadTabs()                ← carica i tab via chrome.tabs.query
  ├── filterTabs()              ← filtra + salva query in storage
  ├── renderTabs()              ← genera l'HTML dei tab filtrati
  ├── updateUI() / updateStats()
  ├── switchToTab(id)
  ├── closeTab(id)
  ├── closeOtherTabs()
  ├── toggleClearBtn()          ← mostra/nasconde il bottone X
  ├── clearSearch()             ← svuota campo + storage + focus
  ├── saveSearchQuery(value)    ← persiste in chrome.storage.session
  ├── restoreSearchQuery()      ← ripristina la query alla riapertura
  ├── escapeHtml(str)
  ├── highlightText(text, query)
  ├── formatUrl(url)
  ├── createTabHTML(tab, query)
  ├── showNoResults(bool)
  ├── showLoading(bool)
  └── showError(message)
```

---

## Regole di codice

### JavaScript

- **Sempre `const`**, mai `let` se il valore non cambia, mai `var`
- **Arrow functions** per callback: `() => {}`, non `function() {}`
- **Template literals** per stringhe con variabili: `` `ciao ${nome}` ``
- **`===`** sempre, mai `==`
- **Single quotes** `'` per le stringhe
- **2 spazi** di indentazione
- **Punto e virgola** obbligatorio
- **`async/await`** per le chiamate asincrone, non `.then().catch()`
- Variabili inutilizzate vietate. Se un parametro è intenzionalmente ignorato, prefix `_`
- Nei `catch` block: gestisci sempre l'errore (es. `console.warn(...)`) —
  i catch vuoti o con solo un commento vengono rifiutati da SonarCloud

### CSS

- Contrasto minimo **4.5:1** (WCAG AA) per tutto il testo normale
- Contrasto minimo **3:1** per componenti UI non-testo
- Non usare `#667eea` come background con testo bianco (contrasto 3.66:1, non sufficiente)
  → usa `#4854c8` (6.22:1)
- Testo grigio secondario: usa `#4a5568` (7.53:1 su bianco, 5.94:1 su #e1e5e9)
- Il `color` applicato ad un elemento di testo non può essere `#6c757d` su sfondo
  chiaro come `#e1e5e9` (3.70:1 — non sufficiente per testo < 18px)

### HTML

- Usa HTML semantico: `<button>` per azioni, `<input>` per input
- Ogni `<button>` interattivo deve avere testo accessibile (testo visibile
  o `aria-label`)
- Mantieni `class="sr-only"` per contenuto solo-screen-reader

---

## Pattern di test

### Setup mock DOM

```js
// In TabSearcher-coverage.test.js: usa createMockElement()
tabSearcher.searchInput = createMockElement();
tabSearcher.clearSearchBtn = createMockElement();
```

### Mock Chrome API

```js
// chrome.storage.session è sempre mockato in tests/setup.js
global.chrome.storage.session.set.mockResolvedValue(undefined);
global.chrome.storage.session.get.mockResolvedValue({ searchQuery: 'valore' });
```

### Testare callback di event listener

```js
// NON usare fireEvent o dispatchEvent
// Cattura la callback da addEventListener.mock.calls
tabSearcher.setupEventListeners();
const [, cb] = tabSearcher.searchInput.addEventListener.mock.calls
  .find(([event]) => event === 'input');
cb(); // invoca direttamente
```

### Testare metodi asincroni con storage

```js
global.chrome.storage.session.get.mockResolvedValueOnce({ searchQuery: 'test' });
await tabSearcher.restoreSearchQuery();
expect(tabSearcher.searchInput.value).toBe('test');
```

### Coverage minima

SonarCloud richiede ≥ 80% di coverage sul **nuovo codice**.
Ogni metodo pubblico aggiunto deve avere almeno:
- Test del happy path
- Test del caso vuoto/errore
- Test che eserciti ogni branch `if/else`

---

## ⚠️ Conventional Commits — Critico per il release automatico

Il workflow `rw-detect-semver-bump.yml` legge i commit dall'ultimo tag
per determinare il bump di versione. **Usa sempre il prefisso corretto**.

### Prefissi che producono una release

| Prefisso | Bump | Esempio |
|---|---|---|
| `feat:` o `feat(<scope>):` | **minor** | `feat(popup): add keyboard shortcut` |
| `fix:` o `fix(<scope>):` | **patch** | `fix(css): correct button contrast ratio` |
| `perf:` o `perf(<scope>):` | **patch** | `perf(filter): optimize regex caching` |
| `feat!:` o `BREAKING CHANGE:` nel footer | **major** | `feat!: require Chrome 120+` |
| `chore(deps):` / `build(deps):` / `chore(ci):` | **patch** | `chore(deps): bump vitest to 4.1.2` |

### Prefissi che NON producono release

`chore:` `ci:` `docs:` `test:` `style:` `refactor:`

### Regola pratica

> Se stai aggiungendo una funzionalità all'utente → `feat:`
> Se stai correggendo un bug → `fix:`
> Se stai solo scrivendo test o refactoring → `test:` / `refactor:`
> Se stai modificando CI o dipendenze → `ci:` / `chore(deps):`

---

## Chrome API disponibili

```js
chrome.tabs.query({})         // tutti i tab
chrome.tabs.update(id, {...}) // attiva un tab
chrome.tabs.remove(id)        // chiude un tab
chrome.tabs.get(id)           // dettagli di un tab
chrome.windows.update(id, {focused: true}) // porta in primo piano
chrome.storage.session.set({ key: value }) // persiste nella sessione
chrome.storage.session.get('key')          // legge dalla sessione
```

Permissions dichiarate in `manifest.json`: `tabs`, `activeTab`, `windows`, `storage`.

---

## Cosa evitare

- Non usare `localStorage` o `sessionStorage`: l'estensione usa
  `chrome.storage.session` (il browser li blocca nelle popup)
- Non usare `document.write`, `eval`, `innerHTML` con dati non sanitizzati
  (usa sempre `escapeHtml()` prima di inserire contenuto utente nell'HTML)
- Non abbassare i valori di contrasto in `popup.css` sotto WCAG AA
- Non committare senza prefisso Conventional Commits se vuoi che venga
  incluso nella release
- Non modificare manualmente il campo `version` in `manifest.json` o
  `package.json`: usa `npm run build:patch|minor|major`
