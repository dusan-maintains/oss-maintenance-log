# Show HN: oss-health-scan — find abandoned npm dependencies before they become risks

**Title:** Show HN: Scan your package.json for abandoned npm packages — health scores 0-100

---

21% of the top 50k npm packages depend on deprecated packages. npm audit catches security vulnerabilities, but not abandoned dependencies.

I built a zero-dependency Node.js CLI that scores every dependency 0–100:

    npx github:dusan-maintains/oss-maintenance-log lodash moment request

It checks:
- When the repo was last pushed to
- When the package was last published to npm
- Open issues ratio
- GitHub stars and forks (log-scaled)
- npm download trends
- Deprecated/archived flags (instant critical score)

Scored using a weighted model: Maintenance 40%, Community 25%, Popularity 20%, Risk 15%. Exponential decay for time-based metrics, logarithmic scaling for count-based ones.

The tool is part of a larger system I built to track my own OSS maintenance work — I actively maintain 7 abandoned npm packages with 1.4M combined weekly downloads. The full system includes automated evidence collection, review SLA tracking, health trend analysis (180-day rolling window), and auto-alerts via GitHub Issues.

Zero external npm dependencies — a health scanner shouldn't be a supply chain risk.

Repo: https://github.com/dusan-maintains/oss-maintenance-log
Dashboard: https://dusan-maintains.github.io/oss-maintenance-log
CLI README: https://github.com/dusan-maintains/oss-maintenance-log/tree/main/cli

Curious about prior art in this space. I know about socket.dev (supply chain) and Snyk (CVEs), but I haven't found anything that specifically scores maintenance health of npm packages.
