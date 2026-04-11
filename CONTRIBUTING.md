# Contributing to Tab Search

Grazie per voler contribuire! Questa guida descrive tutto ciò che serve per
lavorare sul progetto in modo coerente con il processo di release automatico.

---

## Indice

- [Setup](#setup)
- [Struttura del progetto](#struttura-del-progetto)
- [Sviluppo](#sviluppo)
- [Test](#test)
- [Linting](#linting)
- [Conventional Commits ← leggilo bene](#conventional-commits)
- [Branch naming](#branch-naming)
- [Pull Request](#pull-request)
- [Come funziona il release automatico](#come-funziona-il-release-automatico)

---

## Setup

```bash
git clone https://github.com/massimilianolapuma/tab-search.git
cd tab-search
npm ci
```

Carica l'estensione in Chrome:

1. Apri `chrome://extensions`
2. Abilita **Modalità sviluppatore**
3. Clicca **Carica estensione non pacchettizzata** → seleziona la cartella del repo

---

## Struttura del progetto

```
tab-search/
├── popup.html          # UI dell'estensione
├── popup.js            # Logica principale (classe TabSearcher)
├── popup.css           # Stili (WCAG AA — non abbassare il contrasto)
├── manifest.json       # Manifest Chrome Manifest V3
├── build.js            # Script di build + bump di versione
├── tests/
│   ├── setup.js        # Mock globali (chrome API, DOM)
│   ├── unit/           # Test unitari (TabSearcher)
│   ├── integration/    # Test integrazione popup
│   ├── e2e/            # Test end-to-end workflow
│   └── performance/    # Test di performance
└── .github/
    └── workflows/      # CI/CD GitHub Actions
```

---

## Sviluppo

```bash
npm test              # Vitest in watch mode
npm run test:run      # Vitest single run
npm run test:coverage # Coverage report
npm run lint          # ESLint
npm run lint:fix      # ESLint con autofix
npm run build         # Build + bump patch (default)
npm run build:minor   # Build + bump minor
npm run build:major   # Build + bump major
npm run local         # CI completo in locale: install + coverage + lint
```

---

## Test

Ogni modifica a `popup.js` deve essere accompagnata da test.

- **Nuovi metodi** → aggiungi test in `tests/unit/tabSearcher.test.js`
- **Path critici** (`init`, `setupEventListeners`) → aggiungi in `tests/unit/TabSearcher-coverage.test.js`
- **Coverage minima richiesta da SonarCloud: 80% sul nuovo codice**

I mock di Chrome sono definiti in `tests/setup.js`. Per `chrome.storage.session`
il mock è già disponibile come `global.chrome.storage.session.{set,get}`.

Per testare callback di event listener:

```js
tabSearcher.setupEventListeners();
const [, cb] = tabSearcher.searchInput.addEventListener.mock.calls
  .find(([event]) => event === 'input');
cb(); // invoca direttamente la callback
```

---

## Linting

Il progetto usa ESLint con regole strict. Regole rilevanti:

| Regola | Dettaglio |
|---|---|
| `prefer-const` | Usa sempre `const`, mai `var` |
| `no-unused-vars` | Variabili inutilizzate → errore. Prefix `_` solo per parametri ignorati intenzionalmente |
| `no-console` | Warning in prod, OFF in test e `popup.js` |
| `eqeqeq` | Sempre `===`, mai `==` |
| `prefer-template` | Template literals, non concatenazione |
| `quotes` | Single quotes `'` |
| `indent` | 2 spazi |

---

## Conventional Commits

> ⚠️ **Critico**: il processo di release automatico legge i messaggi di commit
> per decidere se e come fare bump di versione. Un commit con il prefisso
> sbagliato non produce nessuna release.

### Formato

```
<tipo>(<scope opzionale>): <descrizione breve>

[corpo opzionale]

[footer opzionale]
```

### Tipi e impatto sulla versione

| Tipo | Produce bump | Quando usarlo |
|---|---|---|
| `feat` | **minor** `1.1.0 → 1.2.0` | Nuova funzionalità visibile all'utente |
| `fix` | **patch** `1.1.0 → 1.1.1` | Bug corretto, regressione risolta |
| `perf` | **patch** `1.1.0 → 1.1.1` | Miglioramento prestazioni misurabile |
| `feat!` oppure `BREAKING CHANGE:` nel footer | **major** `1.1.0 → 2.0.0` | Cambia comportamento incompatibile con versioni precedenti |
| `chore(deps)` / `chore(ci)` / `build(deps)` | **patch** `1.1.0 → 1.1.1` | Aggiornamento dipendenze (Dependabot) |
| `chore` | ❌ nessuno | Manutenzione infrastruttura |
| `ci` | ❌ nessuno | Modifiche ai workflow CI/CD |
| `docs` | ❌ nessuno | Solo documentazione |
| `test` | ❌ nessuno | Solo test, nessun impatto sull'utente |
| `style` | ❌ nessuno | Formattazione, spazi, lint |
| `refactor` | ❌ nessuno | Refactoring senza cambio funzionale |

### Esempi corretti

```bash
# Nuova funzionalità → minor bump
feat(popup): add clear search button with session persistence

# Bug fix → patch bump
fix(css): resolve WCAG AA contrast violations on 9 elements

# Performance → patch bump
perf(filter): cache regex compilation across searches

# Breaking change → major bump
feat!: drop support for Chrome < 116

# Solo test → nessun bump
test(coverage): add unit tests for search persistence methods

# Solo CI → nessun bump
ci: add sonarcloud quality gate

# Dipendenze → patch bump (gestito da Dependabot)
chore(deps): bump vitest from 4.0.0 to 4.1.2
```

### Scope consigliati

`popup`, `css`, `manifest`, `build`, `ci`, `deps`, `coverage`, `filter`, `tabs`

---

## Branch naming

```
feat/<issue-id>-<descrizione-breve>     # nuova funzionalità
fix/<issue-id>-<descrizione-breve>      # bug fix
chore/<descrizione-breve>               # manutenzione
ci/<descrizione-breve>                  # CI/CD
docs/<descrizione-breve>                # documentazione
```

Esempi:

```
feat/12-persist-search-query-when-closing-the-panel
fix/sonarsource-coverage-threshold
chore/update-vitest-to-4.1
```

---

## Pull Request

1. Crea il branch dal nome `main` aggiornato
2. Scrivi i commit con Conventional Commits (vedi sopra)
3. Verifica in locale con `npm run local`
4. Apri la PR verso `main`
5. La CI esegue automaticamente: lint, test, coverage, SonarCloud, CodeQL
6. Il merge su `main` triggera il release automatico **solo se** c'è almeno
   un commit con `feat:`, `fix:`, `perf:`, o `chore(deps):`

### Checklist PR

- [ ] Commit scritti con Conventional Commits
- [ ] `npm run local` passa senza errori
- [ ] Coverage ≥ 80% sul nuovo codice
- [ ] Nessuna nuova violazione SonarCloud
- [ ] Contrasto WCAG AA rispettato se modifichi `popup.css` (contrasto minimo 4.5:1)

---

## Come funziona il release automatico

```
commit su main
     │
     ▼
CI Gate (lint + test + coverage)
     │ verde
     ▼
rel-direct-tag.yml
     │
     ├── rw-detect-semver-bump.yml
     │       legge i commit dall'ultimo tag
     │       applica le regole Conventional Commits
     │       → bump-type: major | minor | patch | none
     │
     ├── se bump-type = none → stop, nessuna release
     │
     └── se bump-type ≠ none
             crea tag annotato vX.Y.Z
             pusha il tag
                  │
                  ▼
             rel-release.yml
                  crea GitHub Release
                  allega il pacchetto ZIP dell'estensione
```

La versione è letta da `manifest.json` e sincronizzata con `package.json`
tramite `build.js`. Non modificare manualmente il campo `version` nei file:
usa `npm run build:patch|minor|major` o lascia fare al processo automatico.
