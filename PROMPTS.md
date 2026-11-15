# PROMPTS.md

Project: Offline Safety Checklist (Warehouse Crew)
Stack: Vanilla JavaScript (ES6+), HTML, CSS. No framework.
AI assistant used: Claude

This is the actual sequence of prompts I used, in order, with the wording I typed. I have not added or cleaned up any prompts after the fact.

---

## Prompt 1: understanding the ticket

I pasted the Slack message, the TRD and the Definition of Done, then asked:

```
explain this what to do in this
```

**Why:** I wanted to understand the scope before building anything: what the client needs, which edge cases are mandatory, and what is actually graded (the PROMPTS.md log and the DoD checklist).

**Result:** I got a plain summary of the happy path, the unhappy path, the NFRs and the delivery steps. It confirmed the order of work: tests first, then code, then verification, then deploy.

---

## Prompt 2: turning the ticket into one build prompt

```
give the complete prompt to make the complete project give only one prompt
```

**Why:** The brief says to act as the product manager, so I wanted a single detailed spec instead of many small requests. One prompt keeps the requirements together and leaves less room for the AI to guess.

**Result:** A long structured prompt (Prompt 3 below) covering the stack, features, edge cases, NFRs, TDD order, file structure and deliverables.

---

## Prompt 3: the full build prompt

This is the prompt produced by Prompt 2 and then used for the build.

~~~text
You are a senior front-end engineer. Build a complete, production-quality "Offline Safety Checklist" web app for a client called Warehouse Crew, whose floor staff currently use paper and Excel checklists and lose data. Work test-first (TDD) and follow every requirement below.

## TECH STACK AND CONSTRAINTS
- Vanilla JavaScript (ES6+ modules) only. NO React or any UI framework.
- Plain HTML + CSS + JS that runs directly in the browser (static site, deployable to Netlify/Vercel/GitHub Pages).
- Manage state in a single internal state object. Re-render the DOM with createElement or innerHTML (via a render() function).
- Tests: Vitest (with jsdom) or Jest. Linting: ESLint with zero warnings and no unused imports/variables.
- Include package.json with scripts: "test", "lint", "dev"/"start" (a simple static server such as vite or http-server).

## FEATURES (HAPPY PATH)
1. A clear, easy-to-open checklist interface for warehouse floor staff:
   - A list of safety checklist items (for example: PPE worn, fire exits clear, forklift inspected, spill hazards cleaned, pallets stacked safely, emergency equipment accessible).
   - Mark items complete/incomplete with a checkbox.
   - Add a new checklist item via a form (title, category, priority, optional notes).
   - Delete an item.
   - Search/filter by text, category and status, plus a progress summary (for example "5 of 8 complete").
   - A "Submit Checklist" action that saves a completed checklist report (inspector name, shift, date, item results).
2. Respond immediately to input with no long loading screens.
3. Store data in a consistent structure so a manager can rely on it, for example:
   { id, title, category, priority, notes, completed, createdAt }
   and report: { id, inspector, shift, submittedAt, items[] }
4. Persist data in localStorage so it works OFFLINE and survives reloads. Wrap all storage reads/writes in try/catch and recover safely from corrupted or unavailable storage.
5. Simulate fetching the initial checklist from an async source (a mock API function with a delay and a random/forced failure option) to demonstrate loading and error handling, falling back to cached localStorage data when the "network" fails.

## UNHAPPY PATH (EDGE CASES, MUST BE HANDLED)
- Empty states: if the list or a search/filter result is empty, show a friendly "No data found" message. Never show a blank screen.
- Bad connectivity: show a visible loading indicator (spinner with text and aria-live) during any async operation, simulating slow 3G. Show an offline/online banner using navigator.onLine and the online/offline events. On fetch failure, show a clear error message with a "Retry" button and fall back to cached data.
- Invalid inputs: if required fields are missing or malformed (empty or whitespace-only title, over-long text, invalid inspector name, no shift), block submission, highlight the offending fields in red (class + aria-invalid="true"), and show an inline error message linked via aria-describedby.
- Handle corrupted localStorage JSON, duplicate items, and double-click/double-submit safely.

## NON-FUNCTIONAL REQUIREMENTS
- Accessibility: target a 100% Lighthouse accessibility score. Semantic HTML (header, main, section, form, ul/li), a visible <label> for every input, ARIA labels on all buttons and inputs, aria-live regions for status, loading and error messages, a visible focus style, full keyboard navigation, a skip-to-content link, sufficient colour contrast, and a lang attribute on <html>.
- Telemetry simulation: create an analytics module with trackEvent(action). Every time a primary action completes (item added, item completed, item deleted, checklist submitted, retry clicked), log to the console in this format:
  [Analytics] User interacted with Offline Safety Checklist - <action>
- Security: sanitize ALL text inputs against XSS before storing them in state (escape or strip <, >, &, quotes, and script/event-handler patterns; trim and enforce max lengths). Never insert unsanitized user input via innerHTML. Prefer textContent, or escape before templating.
- Design system: a clean, monochromatic corporate design (black, white and shades of grey only). Define the grey shades once as CSS custom properties in :root, and use ONLY those variables (no rogue hex colours anywhere else). The sole exception is a single error/validation red defined as one CSS variable. Use consistent spacing in 16px/32px steps. Make the layout responsive and mobile-first for phones and tablets.
- Performance: lightweight, no heavy dependencies, no layout thrash.

## TDD PROCESS (follow this order)
1. FIRST write the full test suite and run it to show the tests failing. Tests must cover:
   - Rendering the checklist; add, toggle and delete item logic.
   - Sanitization against XSS payloads (<script>, <img onerror>, "><svg onload>).
   - Validation (empty, whitespace, too long, malformed) and red highlighting with aria-invalid.
   - The "No data found" empty state for an empty list and for empty search results.
   - The loading indicator appearing and disappearing during async operations; the error + retry + cache fallback flow.
   - localStorage persistence and corrupted-storage recovery.
   - Analytics console log on every primary action (spy on console.log).
   - Basic accessibility checks: every input has a label, every button has an accessible name, aria-live regions exist.
2. THEN write the implementation to make all tests pass.
3. Run lint and tests, and fix every failure and warning until all tests pass and ESLint reports zero warnings.

## SUGGESTED FILE STRUCTURE
index.html
styles.css
src/main.js (bootstrap)
src/state.js (state + actions)
src/render.js (DOM rendering)
src/validation.js (validation)
src/sanitize.js (XSS sanitization)
src/storage.js (safe localStorage wrapper)
src/api.js (mock async fetch with delay/failure)
src/analytics.js (console telemetry)
tests/*.test.js
eslint.config.js (or .eslintrc), package.json, README.md, PROMPTS.md

## ITERATION RULE
If anything you produce causes an error, I will paste the error and say: "That approach caused an error. Let's revert and try a different method." When that happens, revert and try a different approach instead of patching blindly.

## DELIVERABLES
- The complete, working code, with all tests passing and ESLint at zero warnings and no unused imports.
- A README.md with setup, run, test, lint and deploy instructions.
- A PROMPTS.md file in the repo root, containing the exact sequence of prompts used in this session, in order.
- No real API keys or sensitive PII hardcoded anywhere.
- At the end, give me a short checklist confirming each Happy Path, Unhappy Path, NFR and Definition-of-Done item is satisfied, and tell me how to deploy the site to Netlify or Vercel.

Begin now with Step 1: write the failing test suite and the project scaffolding.
~~~

**Why it is written this way:**
- The requirements are grouped under headings so none of the TRD points get lost.
- The unhappy path and NFRs are stated as rules the code must follow, not as suggestions.
- The TDD order is spelled out so the tests come before the implementation.
- The file structure is fixed so the project comes out organised and easy to review.

---

## Prompt 4: building the project

```
make the project according to this donot check any test only make the project i will check by myself
```

**Why:** I wanted the full project first and planned to run the tests, lint and Lighthouse myself afterwards, so I told the AI to skip running them.

**Result:** A working project with these parts: `index.html`, `styles.css`, the `src/` modules (state, render, validation, sanitize, storage, api, analytics), a small test file, `package.json`, the ESLint config and the README.

---

## Prompt 5: preview

```
i want to see the preiview of this
```

**Why:** To check the layout and behaviour in the browser before pushing anything to GitHub.

**Result:** A single-file version of the app that runs in the browser, which I used to try the loading state, the failure and retry flow, the empty state and the form errors.

---

## Prompt 6: repo name and description

```
suggest the github repo name and description also
```

**Result:** Repo name `offline-safety-checklist`, a short description and a set of topics for the repository.

---

## Notes and known gaps

- The brief asks for tests first and then the implementation. In this build the code was written first and the test file came after, so the strict TDD order was not followed.
- The current test file only covers sanitizing, validation and the analytics log. Tests for rendering, empty states, the loading and retry flow, storage recovery and accessibility still need to be added.
- Prompt 4 told the AI not to run the tests, so the tests, ESLint and Lighthouse results are not recorded here. Run them before submitting and update this section with the real results.
- Anything I change after this (fixes, reverts, tweaks) will be added below as new prompts, in order.