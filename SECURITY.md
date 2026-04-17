# Security Policy

## Scope

This repository ships two attack surfaces:

1. **Automation pipeline** — PowerShell scripts (`scripts/`), the reusable GitHub Action (`action.yml`), and evidence generation logic.
2. **`oss-health-scan` CLI** — the npm package in `cli/` published to the public registry.

Evidence data (`evidence/`) is generated output and not considered an attack surface itself, though data integrity (tamper-resistance) is covered below.

## Supported Versions

| Component | Supported |
|-----------|-----------|
| `oss-health-scan` latest minor on npm | ✅ Patches accepted |
| `oss-health-scan` latest major, prior minor | ✅ Critical fixes only |
| `oss-health-scan` older majors | ❌ Upgrade required |
| PowerShell automation on `main` | ✅ Patches accepted |
| PowerShell automation on forks | ❌ Unsupported — sync with upstream |

## Reporting a Vulnerability

**Do not open a public issue for security reports.**

Preferred channel: **[GitHub private vulnerability reporting](https://github.com/dusan-maintains/oss-maintenance-log/security/advisories/new)**. Alternative: contact the maintainer directly via the email listed on the GitHub profile.

### What to include

- Component affected (CLI, automation script, GitHub Action, evidence integrity)
- Reproduction steps or proof-of-concept
- Versions tested
- Your disclosure preferences (credit, embargo window)

### Our response targets

| Phase | Target |
|-------|--------|
| Initial acknowledgement | 48 hours |
| Triage decision (accept / duplicate / out-of-scope) | 7 days |
| Fix available for high/critical severity | 30 days |
| Public disclosure | After fix ships, coordinated with reporter |

We follow the [CVSS 3.1](https://www.first.org/cvss/v3.1/) rubric for severity ratings.

## In-Scope Vulnerability Classes

We are specifically interested in reports covering:

- **Command injection** in `scripts/*.ps1` through untrusted config or environment values
- **Path traversal** in evidence writing or config file loading
- **Credential leakage** of `GITHUB_TOKEN` or other secrets in logs, evidence output, or error messages
- **Prototype pollution** in `cli/lib/*.js` JSON parsing paths
- **SSRF** through the GraphQL batcher or OSV.dev client when given crafted package names
- **Evidence tampering** — ways to forge or corrupt evidence commits without the bot account
- **Supply-chain compromise** — publishing flow in `publish-cli.yml` or build-time injection
- **ReDoS** in `cli/lib/*.js` regex paths used for parsing package manifests

## Out of Scope

- Rate limiting of the GitHub API from the Action itself (by design, we accept 429s and retry)
- Self-XSS on the GitHub Pages dashboard (static site with no user input)
- Social-engineering attacks against tracked upstream maintainers
- Denial-of-service on publicly available npm / GitHub APIs

## Dependencies

`oss-health-scan` has **zero runtime npm dependencies**. This is intentional — a dependency health scanner that ships 40 transitive dependencies cannot credibly audit its own tree. PRs that add runtime dependencies are rejected unless they fix a security issue no built-in Node module can address.

Dev dependencies (test harness) are tracked by Dependabot and updated on a weekly cadence.

## Evidence Integrity

Every evidence refresh produces a signed Git commit from the `dusan-maintains-bot` account via the GitHub Actions `GITHUB_TOKEN`. The full commit history is the audit trail. If you suspect an evidence commit has been tampered with:

1. Check the commit signature on GitHub — bot commits are verified.
2. Compare `evidence/manifest.json` `run_status` with the GitHub Actions run log linked from the workflow badge.
3. Report any discrepancy via the private vulnerability reporting channel.

## Credit

We publish a `SECURITY-ACKNOWLEDGEMENTS.md` file crediting reporters who follow this policy, unless you prefer to remain anonymous. Credit is issued after the fix ships and the embargo window expires.
