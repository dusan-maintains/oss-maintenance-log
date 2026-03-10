**Title:** I built a system that publicly tracks my OSS maintenance work — auto-updates every 6 hours

**Body:**

I maintain 5 npm packages that were abandoned but still serve ~1.6M downloads/week combined. The problem: there's no standard way to prove ongoing maintenance work to upstream maintainers or grant committees.

So I built this: https://github.com/dusan-maintains/oss-maintenance-log

Every 6 hours, GitHub Actions polls GitHub API + npm, tracks PR states and review SLA, and commits machine-readable JSON + Markdown snapshots. Zero manual updates. README stats update automatically too.

**What it tracks:**
- `rrule` — 1.37M npm downloads/week, 210 open issues
- `python-shell` — 195k downloads/week, maintainer publicly looking for help
- `jquery-modal` / `jquery-tablesort` — both have "Maintainers Wanted" in their READMEs
- `react-hexgrid` — maintainer-needed signal in issues
- `grafana` — large-repo signal PR (privacy hardening)

**Why public?** Accountability. Anyone can verify the work without trusting me. The evidence files are auditable JSON.

It's also a template repo — fork it, update 3 scripts, push. Done.

Live dashboard: https://dusan-maintains.github.io/oss-maintenance-log

---

**Suggested subreddits:**
- r/opensource
- r/github
- r/devops
- r/node (for the npm angle)
- r/javascript

**Best posting time:** Tuesday–Thursday, 9–11am US Eastern
