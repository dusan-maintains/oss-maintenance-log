# Show HN: I built an automated public log to prove I'm actively maintaining OSS packages

**Title:** Show HN: Automated public evidence log for OSS maintenance — self-updates every 6h via GitHub Actions

---

I maintain 5 npm packages that were effectively abandoned but still serve ~1.6M downloads/week combined. The problem: there's no standard way to prove ongoing maintenance work to upstream maintainers, grant committees, or employers.

So I built this: https://github.com/dusan-maintains/oss-maintenance-log

Every 6 hours, GitHub Actions polls the GitHub API and npm, tracks PR states and review SLA, and commits machine-readable JSON + Markdown snapshots. Zero manual updates. The README stats update automatically too.

**What it tracks:**
- `rrule` — 1.37M npm downloads/week, 210 open issues, my PR fixing WeekdayStr serialization
- `python-shell` — 195k downloads/week, maintainer publicly looking for help
- `jquery-modal` / `jquery-tablesort` — both have "Maintainers Wanted" in their READMEs
- `react-hexgrid` — maintainer-needed signal in issues
- `grafana` — large-repo signal PR (privacy hardening for email templates)

**Why public?** Accountability. Anyone can verify the work without private context. The evidence files are auditable JSON.

**Use as template:** It's marked as a template repo. Fork it, update the package list in 3 scripts, push — done.

Live dashboard: https://dusan-maintains.github.io/oss-maintenance-log

Curious if others have built similar systems, or if there's prior art I missed.
