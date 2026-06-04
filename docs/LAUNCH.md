# Launch Kit — Show HN

Everything needed to launch `oss-health-scan` + the **State of npm Abandonment 2026** study. The study is the hook; the tool is the payoff.

> Reality check (HN data, 2026): ~200 Show HN/day, median **2** points, ~**1.4 GitHub stars per upvote**, 92% of the star impact lands in the first 48h. 50 points ≈ top 6% ≈ ~70 stars. You get **one** good window — make the artifact carry it.

## Title (pick one — first is the lead)

1. `Show HN: I scanned 50 of npm's most-used packages – 8 are deprecated, 46M downloads/week`
2. `Show HN: State of npm Abandonment 2026 – the dead packages still in your lockfile`
3. `Show HN: oss-health-scan – find abandoned dependencies that npm audit ignores`

Lead with the **finding**, not the tool. A concrete number in the title is the whole game.

## The post body

> I kept hitting dependencies that were quietly deprecated or archived but still everywhere, so I built a scanner for it and pointed it at 50 of npm's most iconic packages.
>
> 8 of the 50 are formally deprecated or archived — and still pull a **combined ~46M downloads/week**. `request` (deprecated since 2020) does 14.6M/week on its own. `left-pad` is deprecated, archived, 7 years cold, and still ships 1.25M/week. Only 1 of the 8 trips a CVE — which is the point: `npm audit` is blind to abandonment.
>
> The tool is `oss-health-scan` — zero deps, no account, one command:
>
>     npx oss-health-scan        # scans your package.json
>
> It scores each package 0–100 (deprecated→5, archived→8 are hard flags), checks libyear drift and OSV CVEs, and emits SARIF for GitHub Code Scanning.
>
> Full study + method + limitations: <link to docs/STATE_OF_NPM_ABANDONMENT.md>
> Repo: <link>
>
> It's a probe, not a census (hand-picked sample, unauthenticated run — caveats in the writeup). Happy to run it against your dependency tree in the comments.

## Author's first comment (post immediately, pin the honesty)

> Author here. Method: live npm + GitHub metadata via the CLI, deprecation/archive flags are straight from the registry (not inference). Two things I want to be upfront about: (1) the 50 are hand-picked household names, not the statistical top-N by dependents, and (2) it was an unauthenticated run so ~12 download counts didn't resolve and I excluded them. Next step is an authenticated census across the actually-most-depended-on packages.
>
> The scoring is deliberately conservative — popularity keeps a stale-but-massive package out of the red until there's a real signal, so it won't cry wolf. Criticism on the weighting very welcome; it's all in `lib/scoring.js`.

## Cross-post (stagger over the 48h window)

- **Hacker News** — Tue–Thu, ~14:00–16:00 UTC (9–11am ET). Submit, then immediately post the author comment.
- **r/node**, **r/javascript** — same finding, link the study not the repo root.
- **lobste.rs** — if you have an invite (`devtools`/`security` tags).
- **tldr-sec / Console.dev / Node Weekly** — email the study as a tip; supply-chain framing lands right now.
- **X / Mastodon** — lead post = the 46M-downloads stat + the `request` line; thread the table.
- **GitHub Marketplace** — list the composite action (`action.yml`) so the repo gets a second discovery surface.

## 48-hour playbook

- Be at the keyboard for the first 3–4 hours. Reply to **every** comment; the ranking rewards engagement velocity (24h half-life).
- Don't get defensive on the scoring — concede fair hits, fix small things live, link the commit. HN respects that more than the tool.
- When someone pastes their `package.json` woes, run it and reply with the result. Live demos convert lurkers to stargazers.

## Do not

- No asking for upvotes/stars anywhere. HN auto-penalizes vote-begging and ring voting; it will tank the post and the account.
- No bought stars. On a young repo it's detectable, it's the opposite of "critics rate it," and it poisons the exact credibility this study is built to earn.
- Earn the curve with the artifact. The data is the growth engine.
