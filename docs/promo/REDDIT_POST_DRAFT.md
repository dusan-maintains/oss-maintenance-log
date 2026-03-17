**Title:** I built a CLI that scans your package.json for dying npm dependencies — health scores 0-100, zero deps, one command

**Body:**

21% of the top 50k npm packages depend on deprecated packages. `npm audit` catches CVEs — but not abandoned ones. So I built a scanner.

```
npx github:dusan-maintains/oss-maintenance-log express lodash moment request
```

It scores every dependency 0–100 based on:
- **Maintenance (40%)** — last push, last publish, open issues
- **Community (25%)** — stars, forks (log-scaled)
- **Popularity (20%)** — npm downloads/week
- **Risk (15%)** — inactivity penalty, issue backlog

DEPRECATED = instant 5/100. ARCHIVED = 8/100.

Output is terminal-friendly with colored bars, or `--json` for CI pipelines. Exits with code 1 if any critical packages found — works as a PR gate.

**Zero npm dependencies.** Uses only Node.js built-ins. A scanner for unhealthy dependencies shouldn't itself be a supply chain risk.

The tool is part of a bigger system I built after I started maintaining 7 abandoned packages (1.4M npm downloads/week combined). The full system auto-tracks PRs, review SLA, generates health trend charts, and fires alerts when packages degrade. There's a live dark-mode dashboard too:

Dashboard: https://dusan-maintains.github.io/oss-maintenance-log
Repo: https://github.com/dusan-maintains/oss-maintenance-log

Happy to answer questions about the scoring algorithm or the broader problem of abandoned OSS packages.

---

**Subreddits:**
- r/node — primary target (npm-focused)
- r/javascript — broad JS audience
- r/opensource — OSS health angle
- r/webdev — dependency management pain
- r/SideProject — for "Show Off Saturday" thread

**Best posting time:** Tuesday–Thursday, 9–11am US Eastern
