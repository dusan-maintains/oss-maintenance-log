# Launch Kit — Show HN

Launch `oss-health-scan` on the back of the **State of npm Abandonment 2026** census. The finding sells itself; the tool is "and here's how I found it / how you check your own."

> Reality check (HN data, 2026): ~200 Show HN/day, median **2** points, ~**1.4 GitHub stars per upvote**, 92% of the star impact lands in the first 48h. 50 points ≈ top 6% ≈ ~70 stars. You get **one** good window — the artifact has to carry it. It now does.

## Strategy in one line

Lead with the **number**, not the tool. The data is strong enough that any spin would only hurt you on HN — so the title states a fact and the first comment is relentlessly honest about scope. Three angles, strongest first.

## Title (pick one)

1. **Aggregate (lead):** `Show HN: 20 of the most-depended-on npm packages are deprecated – still 297M downloads/week`
2. **Irony (most viral):** `Show HN: npm's own deprecated packages (inflight, npmlog, gauge) still ship ~158M downloads/week`
3. **Absurd specific:** `Show HN: path-is-absolute is deprecated, archived, and still downloaded 86M times a week`

#2 is the most likely to take off — it's a story, not a statistic — but #1 is the safest defensible headline. Avoid putting the tool name first; the finding is the hook.

## The post body

> npm is in the middle of a supply-chain panic (debug/chalk, the "2B downloads weaponized" incident). The packages that get hijacked are almost always **abandoned but still trusted** — so I scanned 123 of the most-depended-on npm packages to measure how much of the foundation is already unmaintained.
>
> **20 of the 123 are formally deprecated or archived — and still pull a combined ~297M downloads/week.** A few that surprised me:
>
> - `path-is-absolute` — a 4-line wrapper made obsolete by `path.isAbsolute()`. Deprecated, archived, **86M downloads/week.**
> - `inflight` — a known memory leak npm itself deprecated. **85M/week.**
> - `gauge` / `npmlog` / `are-we-there-yet` — npm's *own* deprecated internals, ~24M/week each.
> - Another 21 are "cold": no upstream commit in 1–7 years. `readable-stream` (303M/wk, 1.4y), `util-deprecate` (135M/wk, **7.6 years** since a commit).
>
> Only one of the deprecated set even trips a CVE (`request`, GHSA-p8p7-x288-28g6). That's the point: `npm audit` is blind to abandonment — it's not a CVE until the day it becomes one.
>
> The tool is `oss-health-scan` — zero deps, no account, one command:
>
>     npx oss-health-scan        # scans your package.json
>
> It scores each package 0–100 (deprecated→5, archived→8 are hard flags), checks libyear drift + OSV CVEs, and emits SARIF for GitHub Code Scanning. The whole census is reproducible: `scripts/abandonment-study.js`.
>
> Full writeup + method + limitations: <link to docs/STATE_OF_NPM_ABANDONMENT.md>
> Repo: <link>

## Author's first comment (post immediately — this is what wins HN)

> Author here. Three things I want to be upfront about, because they're the first objections:
>
> **1. "These are transitive — you didn't choose them."** Exactly the point. You didn't add `path-is-absolute`; it's in your lockfile via something else. npm only warns on *direct* installs of a deprecated package — it says nothing about abandoned packages buried deeper in the graph. This scans the whole tree.
>
> **2. "Deprecated ≠ broken."** True. But deprecated means no more security patches are coming. `request` is deprecated *and* carries a known SSRF advisory; `inflight` is a known memory leak. When the maintainer has left, you inherit whatever's next.
>
> **3. "npm metadata, big deal."** The value isn't the metadata, it's pulling abandonment + libyear drift + OSV CVEs into one 0–100 score you can gate CI on, across your whole graph, with zero deps and no account.
>
> Method: live npm + GitHub APIs via the CLI on 2026-06-04, 123 packages, downloads resolved 123/123. Limitation: the 123 are a curated representative slice (household names + the most-depended-on micro-utility layer), not a live statistical top-N by dependents. The script is in the repo — rerun it, swap the list, tell me what I missed.

## Cross-post (stagger over the 48h window)

- **Hacker News** — Tue–Thu, ~14:00–16:00 UTC (9–11am ET). Submit, then immediately post the author comment.
- **r/node**, **r/javascript** — link the writeup, not the repo root.
- **lobste.rs** — if you have an invite (`devtools` / `security` tags).
- **tldr-sec / Console.dev / Node Weekly** — email the census as a tip; supply-chain framing lands right now.
- **X / Mastodon** — lead post = the 297M number + the `inflight` / `path-is-absolute` lines; thread the table.
- **GitHub Marketplace** — list the composite action so the repo gets a second discovery surface.

## 48-hour playbook

- Be at the keyboard the first 3–4 hours. Reply to **every** comment; ranking rewards engagement velocity (24h half-life).
- Don't defend the scoring — concede fair hits, fix small things live, link the commit. HN respects that more than the tool.
- When someone pastes their dependency woes, run it and reply with the result. Live demos convert lurkers to stargazers.

## Do not

- No asking for upvotes/stars anywhere. HN auto-penalizes vote-begging and ring voting; it tanks the post and the account.
- No bought stars. On a young repo it's detectable, it's the opposite of "critics rate it," and it poisons the credibility this census is built to earn.
- Earn the curve with the artifact. The data is the growth engine.

---

## Track B — launch the tool itself (second wave, ~1 week after the census)

Once the census post has done its work, launch the CLI on its own merits to a tool-hungry audience.

**Titles:**
1. `Show HN: oss-health-scan – find abandoned dependencies before they become a CVE`
2. `Show HN: a --paranoid mode that scores your npm deps by "blast radius if compromised"`

**Post body:**

> `npm audit` tells you what's already vulnerable. I wanted to see what's *becoming* dangerous — abandoned packages, single-maintainer deps with millions of downloads, packages that run install scripts. So I built `oss-health-scan`:
>
>     npx oss-health-scan --paranoid
>
> It scores every dependency 0–100, rates each by **blast radius** (reach × install-scripts × single-maintainer × abandonment × CVEs), explains *why* in plain English, and suggests a replacement. Zero deps, no account. There's a GitHub Action that comments the report on PRs and fails on critical, a `diff <ref>` mode for "did this PR make my deps worse", `--html` reports, and a machine-readable OSS Health Manifest via `--json`.

**First comment:** lead with the honest limits — the score is opinionated (weights live in `lib/scoring.js`), blast radius is a heuristic, and it complements rather than replaces `npm audit` / Snyk. Invite people to run it on their own tree and paste results.

## Demo GIF (record this — animation can't be generated headless)

A terminal GIF on the README roughly doubles "I'll try it" intent. Record the `--paranoid` run:

```bash
# option A — asciinema + agg
npm i -g asciinema agg
asciinema rec demo.cast --command "npx oss-health-scan core-js node-sass request left-pad express moment --paranoid"
agg demo.cast docs/paranoid-demo.gif

# option B — terminalizer
npm i -g terminalizer
terminalizer record demo -d "npx oss-health-scan core-js node-sass request --paranoid"
terminalizer render demo -o docs/paranoid-demo.gif
```

Then embed near the top of the README: `![oss-health-scan --paranoid](docs/paranoid-demo.gif)`. Keep it under ~15s — the EXTREME/HIGH blast lines and the `request → undici` suggestion are the moneyshots.
