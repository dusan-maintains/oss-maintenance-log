# Maintainer Reply Templates

Use these as copy/paste responses on PRs `#315`, `#316`, `#317`.

## 1) First maintainer response (general)

Thanks for reviewing this. I appreciate the feedback.
I can adjust scope quickly if you prefer this split differently (or narrowed further).
I will keep backward compatibility and update docs/tests accordingly.

## 2) “Please reduce scope”

Makes sense. I will reduce this to the minimal fix and move unrelated changes into a separate PR.
I’ll push an update shortly and summarize exactly what changed.

## 3) “Need tests / repro”

Good point. I’m adding a focused repro/test path for this behavior and will link the exact steps in the PR body.
If you prefer a specific test style for this repo, I can match it.

## 4) “Behavior change concern”

Agreed. I’ll keep behavior unchanged for normal paths and limit this fix to the edge case only.
I’ll update the PR description with compatibility notes so this is explicit.

## 5) “Please rebase / resolve conflicts”

Done, I rebased onto latest `master` and resolved conflicts.
No functional changes beyond what is listed in this PR summary.

## 6) “Not the preferred approach”

Understood. Thanks for clarifying direction.
I’ll rework this using your suggested approach and post an updated diff.

## 7) “Can you close this PR?”

Sure, I’ll close this PR and open a fresh one with the requested shape.
Thanks for the guidance.

## 8) Follow-up after pushing changes

I pushed the requested updates.
Summary of follow-up changes:
- [item 1]
- [item 2]
- [item 3]

Please take another look when convenient.
