# 7-Day Approval Plan (Post-Submission)

Objective: increase approval probability through consistent, verifiable maintainer behavior without spam.

## Day 1 (today)

1. Submit Claude for OSS form using `claude-for-oss-form-fill.md`.
2. Confirm all tracked PRs are public and clean:
   - https://github.com/kylefox/jquery-modal/pull/315
   - https://github.com/kylefox/jquery-modal/pull/316
   - https://github.com/kylefox/jquery-modal/pull/317
   - https://github.com/kylefox/jquery-tablesort/pull/49
   - https://github.com/extrabacon/python-shell/pull/320
   - https://github.com/jkbrzt/rrule/pull/664
   - https://github.com/Hellenic/react-hexgrid/pull/123
   - https://github.com/lingdojo/kana-dojo/pull/6309
3. Keep profile stable (username/email unchanged).

## Day 2

1. Check all tracked PRs for maintainer feedback.
2. If feedback exists, respond within 24h using `maintainer-reply-templates.md`.
3. If no feedback, avoid bump noise and keep signal high.

## Day 3

1. Triage one open issue in an active track with a reproducible note.
2. Add one evidence line in `README.md` only if activity is meaningful.

## Day 4

1. Push only requested follow-ups from maintainers (minimal diffs).
2. Update PR body with exact change summary after follow-up push.

## Day 5

1. Re-check mergeability for all tracked PRs.
2. Close/replace a PR only if maintainer explicitly asks for scope change.

## Day 6

1. Add one small docs or compatibility contribution in an active track.
2. Keep commit messages and PR descriptions factual and scoped.

## Day 7

1. Review inbox + spam for Anthropic response.
2. Update `oss-maintenance-log` with weekly outcomes:
   - review comments
   - follow-up commits
   - merged/closed states

## 3-Day Away Mode

1. Keep `.github/workflows/evidence-daily.yml` schedule active (every 6 hours).
2. Let `evidence/action-queue.md` accumulate pending maintainer replies.
3. On return, process queue top-to-bottom and answer oldest external feedback first.

## Hard Rules

1. No metric inflation or unverifiable claims.
2. No mass bump comments.
3. No unrelated mega-PRs; keep changes scoped.
