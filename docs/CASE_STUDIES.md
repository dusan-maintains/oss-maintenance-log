# Case Studies

*Per-package deep dives: what the package is, why it matters, what was broken, and what the remediation PR does.*

For pipeline-level summary see `docs/IMPACT.md`. For real-time state see the [live dashboard](https://dusan-maintains.github.io/oss-maintenance-log).

---

## `rrule` — Recurring-event rule parser

**Upstream:** [jkbrzt/rrule](https://github.com/jkbrzt/rrule) · 3,692 stars · 1,643,561 weekly npm downloads

### What it does

`rrule` parses and serializes RFC 5545 recurrence rules — the iCalendar spec for repeating events. If your calendar software understands "every second Tuesday except December", it is almost certainly running `rrule` somewhere in its stack. Major calendaring libraries, meeting-scheduler SaaS, and every open-source iCalendar tool built in the Node ecosystem depend on it.

### Maintenance status

Long-lived open maintenance backlog. The upstream repo has accumulated bug reports and PRs without recent release activity. No archive banner, no official handoff announcement — just the long slow drift into unattended maintenance.

### Tracked contribution

[**#664 — fix: handle WeekdayStr arrays when serializing BYDAY**](https://github.com/jkbrzt/rrule/pull/664)

When a user passes an array of weekday strings (`['MO', 'WE', 'FR']`) into an RRULE's `BYDAY` field, the serializer silently accepts the input but emits an invalid RRULE string that downstream calendar clients either reject or misinterpret. The fix corrects the array-aware branch in the string-serialization path so the output round-trips through a parse-serialize-parse cycle without loss. Regression test included.

### Why this matters downstream

Calendar software built on `rrule` is often behind some of the most "how is this still broken in 2026" support tickets in productivity tooling. A recurrence rule that emits invalid iCalendar text will, for example, cause Apple Calendar and Google Calendar to silently disagree on the next occurrence of a recurring event. The user experience of this failure mode is: "the meeting reminder fired at the wrong time." The root cause is invisible. This PR closes one of those failure domains at the source.

---

## `python-shell` — Node ↔ Python bridge

**Upstream:** [extrabacon/python-shell](https://github.com/extrabacon/python-shell) · 2,169 stars · 250,094 weekly npm downloads

### What it does

`python-shell` lets a Node.js process spawn a Python interpreter, pipe data to it, and read results back. It is the go-to library for Electron apps that need to call scientific Python code (ML inference, image processing, PDF manipulation, scientific computation), and for Node-based data pipelines that need to shell out to Python for a specific capability that does not exist in JavaScript.

### Maintenance status

Explicit maintainer gap — [issue #290](https://github.com/extrabacon/python-shell/issues/290) is a pinned "looking for maintainer" request. The upstream author has been transparent about limited bandwidth.

### Tracked contribution

[**#320 — Fix `runString` temp path to use `tmpdir()` and add regression test**](https://github.com/extrabacon/python-shell/pull/320)

`python-shell` exposes a `runString` method that lets callers execute an inline Python snippet. Internally it writes the snippet to a temporary file, executes it, and cleans up. The current implementation constructs the temp-file path using a hardcoded directory assumption that breaks on Windows and on Linux environments where the process working directory is read-only (common in sandboxed CI runners and some Electron builds). The fix switches the path to `os.tmpdir()` — the platform-correct temp-directory lookup — and adds a regression test that writes, executes, and verifies cleanup across platforms.

### Why this matters downstream

Silent failure of `runString` in a sandboxed or Windows context produces mysterious "Python couldn't execute" errors in downstream software. Electron developers report this specific failure mode when shipping to non-development-machine deployment targets. The fix is a two-line change and a new test — minimal surface area, maximum correctness.

---

## `jquery-modal` — Lightweight jQuery modal plugin

**Upstream:** [kylefox/jquery-modal](https://github.com/kylefox/jquery-modal) · 2,615 stars · 26,411 weekly npm downloads

### What it does

A minimal modal dialog plugin for jQuery-era web applications. Predates the React/Vue/Svelte ecosystem entirely but still ships on an enormous number of WordPress themes, legacy admin dashboards, and long-running production applications whose authors left the company years ago.

### Maintenance status

README-level "Maintainers Wanted" banner. Upstream author explicit about stepping back. The install base refuses to shrink meaningfully even though the jQuery era is over — migration is expensive and working software is not a maintenance priority.

### Tracked contributions (three)

**[#315 — fix: harden close button rendering and refresh docs/examples](https://github.com/kylefox/jquery-modal/pull/315)**

The close button's event binding and DOM-generation path has an edge case where the button is not regenerated when a modal is detached and re-attached to the DOM — behavior seen in single-page apps that reuse modal containers. The fix ensures the button element is rebuilt on each `open()` call and refreshes the example documentation to match current plugin behavior.

**[#316 — fix: keep ajax callbacks scoped to their originating modal](https://github.com/kylefox/jquery-modal/pull/316)**

When two modals are open simultaneously and both contain forms, the ajax `success` and `error` callbacks are dispatched against a shared context rather than the modal instance that originated the request. Result: form submissions mysteriously close the wrong modal or update the wrong DOM region. The fix captures the originating modal reference via closure at request time.

**[#317 — fix: make plugin initialization idempotent for multiple imports](https://github.com/kylefox/jquery-modal/pull/317)**

In webpack/rollup bundles that pull `jquery-modal` in through multiple dependency paths (common in large applications with vendored code), the plugin's `$.fn.modal` extension runs multiple times and the second run either silently fails or duplicates event handlers. The fix adds a sentinel check so re-initialization is a no-op.

### Why this matters downstream

Each of these three fixes addresses a failure mode that produces confusing user-facing behavior (wrong modal closing, double form submissions, mysterious event handler duplication) whose root cause is unreachable without reading plugin internals. The install base is large and invisible — fixes here are felt across thousands of production sites that the downstream authors do not control.

---

## `jquery-tablesort` — Client-side table sorting

**Upstream:** [kylefox/jquery-tablesort](https://github.com/kylefox/jquery-tablesort) · 258 stars · 6,924 weekly npm downloads

### What it does

Sort an HTML `<table>` client-side by clicking a column header. Small, focused plugin, still widely embedded in admin dashboards and CMS reporting screens.

### Maintenance status

README-level "Maintainers Wanted" banner, same author as `jquery-modal`.

### Tracked contribution

[**#49 — Fix stale `tablesort.$th` reference after header clicks**](https://github.com/kylefox/jquery-tablesort/pull/49)

The plugin caches the clicked header cell in `tablesort.$th`. If the table's header row is re-rendered (which happens when the table contents change dynamically — common in live-updating dashboards), the cached `$th` reference points to a DOM node no longer in the document. Subsequent sort clicks silently target the detached node and do nothing. The fix re-resolves the reference on each click.

### Why this matters downstream

The failure mode is "the column sort stopped working after I filtered the data." Users blame the dashboard; the root cause is a stale jQuery reference in a plugin nobody owns anymore. Two-line fix.

---

## `react-hexgrid` — React hexagon grid primitive

**Upstream:** [Hellenic/react-hexgrid](https://github.com/Hellenic/react-hexgrid) · 351 stars · 1,606 weekly npm downloads

### What it does

React component library for rendering hexagon grids. Used in geographic hex-binning visualizations, hex-grid puzzle games, and a narrow but structurally important set of data-viz tools where hex grids are the natural geometric unit.

### Maintenance status

[Issue #72 — "Maintainers wanted"](https://github.com/Hellenic/react-hexgrid/issues/72). Upstream author has stepped back.

### Tracked contribution

[**#123 — test: add coverage for `GridGenerator.ring` and `.spiral`**](https://github.com/Hellenic/react-hexgrid/pull/123)

The `GridGenerator` utility has two geometrically tricky methods — `ring(center, radius)` returns all hex cells at a given distance from a center cell, and `spiral(center, radius)` returns all cells within a given distance. These functions had no test coverage and had silently drifted between releases. The PR adds unit tests that lock down the current expected output across a set of known geometric configurations so future changes cannot regress the behavior without the tests noticing.

### Why this matters downstream

Geometric correctness in hex-grid math is easy to break in subtle ways — off-by-one on radius, wrong handedness, inconsistent coordinate system between `ring` and `spiral`. Downstream visualization code trusts this library to get hex geometry right. The added tests codify the contract so the next maintainer (or the next remediation PR) has a guardrail.

---

## Signal Contributions

These are contributions to **actively-maintained** flagship repositories, logged as a range check alongside the primary abandoned-package work.

### `grafana/grafana`

**Upstream:** [grafana/grafana](https://github.com/grafana/grafana) · 73,241 stars

[**#119212 — Email template privacy hardening**](https://github.com/grafana/grafana/pull/119212)

Active upstream under review. This PR touches Grafana's email notification templates to reduce the amount of environment information and potentially sensitive context accidentally leaked into outbound email bodies. The fix is scoped to template-level sanitization and does not touch Grafana's auth surface. Included in this tracker as evidence that the same contributor posture applies to large living codebases, not just to small abandoned ones.

### `lingdojo/kana-dojo`

**Upstream:** [lingdojo/kana-dojo](https://github.com/lingdojo/kana-dojo) · 2,074 stars

[**#6309 — Add new Japanese idiom (merged 2026-02-27)**](https://github.com/lingdojo/kana-dojo/pull/6309) ✅

Content contribution to a language-learning project: added a new Japanese idiom entry with correct furigana, translation, and usage notes. Merged cleanly. Included as a worked example of non-code contributions — maintenance is not always code.

---

## Outcomes Tracked

All PR outcomes are tracked automatically via `scripts/update-all-evidence.ps1` every 6 hours:

- **Merged**: documented in `evidence/ecosystem-status.json` with `merged_at` timestamp
- **Closed without merge**: documented with reason when available
- **Still open**: SLA timer running, surfaced in `evidence/action-queue.md`
- **Superseded**: documented with link to replacement PR

No PR in this tracker is considered "done" just because it was filed. The tracker's job is to know the state of every filed PR today, not on the day it was filed.
