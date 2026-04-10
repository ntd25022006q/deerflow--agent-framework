# ═══════════════════════════════════════════════════════════════
# DEERFLOW AGENT FRAMEWORK v1.0
# MASTER RULES — SINGLE SOURCE OF TRUTH
# ═══════════════════════════════════════════════════════════════

**Version:** 1.0.0
**Last Updated:** 2025-01-10
**Status:** ACTIVE — ENFORCEMENT ENABLED
**Classification:** Mandatory for all AI agents operating within the Deerflow ecosystem

---

## TABLE OF CONTENTS

1. [Purpose & Scope](#1-purpose--scope)
2. [Governance Model](#2-governance-model)
3. [Violation Severity Framework](#3-violation-severity-framework)
4. [Problem Categories & Root Cause Analysis](#4-problem-categories--root-cause-analysis)
5. [Enforcement Mechanisms](#5-enforcement-mechanisms)
6. [Remediation Procedures](#6-remediation-procedures)
7. [Core Rules Reference](#7-core-rules-reference)
8. [Appendix: Quick Reference Card](#8-appendix-quick-reference-card)

---

## 1. PURPOSE & SCOPE

### 1.1 Purpose

This document serves as the **single source of truth** for all coding standards, architectural rules, and quality gates enforced across the Deerflow Agent Framework. It is designed to prevent the recurring quality, security, and maintainability problems commonly observed in AI-generated code.

The Deerflow Agent Framework was created in response to a systematic analysis of 29+ categories of problems that AI coding assistants consistently introduce into production codebases. This document codifies the rules, root causes, enforcement strategies, and remediation procedures for each identified problem category.

### 1.2 Scope

These rules apply to:

- **All AI agents** operating within the Deerflow ecosystem, including but not limited to: Cursor, Windsurf (Cascade), Claude Code, GitHub Copilot, and OpenAI Codex.
- **All code** generated, modified, or reviewed by AI agents within Deerflow projects.
- **All languages and frameworks** used within Deerflow projects, with specific provisions for TypeScript, JavaScript, React, Node.js, and related ecosystems.
- **All project phases** from initial scaffolding through production deployment and maintenance.

### 1.3 Philosophy

The Deerflow Framework operates on four foundational principles:

1. **Zero Compromise Quality:** Quality is not a trade-off against speed or cost. Every line of code must meet senior engineer standards.
2. **Prevention Over Detection:** Rules are designed to prevent problems at the point of generation, not catch them after the fact.
3. **Explicit Over Implicit:** Nothing should be assumed. Every convention, pattern, and standard is documented and enforceable.
4. **Accountability:** Every AI agent is accountable for the code it produces. There are no "good enough" exceptions.

---

## 2. GOVERNANCE MODEL

### 2.1 Rule Hierarchy

```
┌─────────────────────────────────────────┐
│         MASTER RULES (this document)     │  ← Single Source of Truth
│         core/rules/master-rules.md       │
├─────────────────────────────────────────┤
│       TOOL-SPECIFIC RULE FILES           │  ← Derived from Master Rules
│  .cursorrules / .windsurfrules / etc.   │
├─────────────────────────────────────────┤
│       PROJECT-SPECIFIC RULES             │  ← Local overrides (documented)
│       .deerflow/rules.local.json         │
├─────────────────────────────────────────┤
│       AUTOMATED ENFORCEMENT              │  ← CI/CD, Linters, Pre-commit
│       (eslintrc, tsconfig, etc.)         │
└─────────────────────────────────────────┘
```

### 2.2 Amendment Process

1. Proposed changes must be submitted as a PR against `core/rules/master-rules.md`
2. Changes require review by at least two framework maintainers
3. Breaking rule changes require a 30-day deprecation notice
4. All rule changes must be reflected in derived tool-specific files
5. Version number must be incremented following SemVer

### 2.3 Compliance Monitoring

Compliance is monitored through:

- **Static Analysis:** ESLint rules, TypeScript strict mode, custom linter plugins
- **Dynamic Analysis:** Runtime type checking, test coverage enforcement
- **CI/CD Gates:** All quality checks must pass before merge
- **Manual Review:** Senior engineer review for all PRs touching critical paths
- **Automated Scanning:** Regular dependency audits, security scans, and code quality reports

---

## 3. VIOLATION SEVERITY FRAMEWORK

Every rule violation is classified into one of four severity levels. The severity determines the required response and the urgency of remediation.

### 3.1 Critical (Severity 4)

**Definition:** Violations that pose an immediate threat to security, data integrity, or system stability.

**Response:** IMMEDIATE BLOCK. The violating code MUST NOT be committed, deployed, or merged under any circumstances. The violation must be resolved before any further work proceeds.

**Examples:**
- Hardcoded secrets or credentials in source code
- SQL injection vulnerabilities
- Unhandled errors that could crash the production system
- Authentication/authorization bypasses
- Data corruption risks from race conditions

**SLA:** Must be resolved within 0 minutes (blocking). No code with Critical violations may exist in any branch.

### 3.2 High (Severity 3)

**Definition:** Violations that significantly impact code quality, maintainability, or security but do not pose an immediate threat.

**Response:** BLOCK until resolved. The violating code MUST be fixed before merging to any protected branch. Temporary workarounds are not permitted.

**Examples:**
- Use of `any` type in TypeScript
- Missing error handling in business logic
- Circular dependencies
- Functions exceeding complexity thresholds
- Missing input validation
- Incomplete test coverage (< 80% for affected module)

**SLA:** Must be resolved within the current PR/merge cycle. No exceptions.

### 3.3 Medium (Severity 2)

**Definition:** Violations that degrade code quality or deviate from best practices but do not pose immediate risks.

**Response:** WARN with remediation tracking. The violating code should be fixed within a defined timeframe. A tracked issue MUST be created.

**Examples:**
- Missing JSDoc comments on public APIs
- File length approaching but not exceeding limits
- Non-optimal naming conventions
- Missing CHANGELOG entries
- Inconsistent formatting (fixable by Prettier)

**SLA:** Must be resolved within 5 business days. A tracking issue is mandatory.

### 3.4 Low (Severity 1)

**Definition:** Minor deviations from conventions or suggestions that improve code clarity.

**Response:** NOTE for awareness. The violation is logged but does not block progress. Should be addressed during regular maintenance cycles.

**Examples:**
- Comment style inconsistencies
- Minor import ordering issues
- Suggesting alternative approaches in code review
- Documentation formatting improvements

**SLA:** Should be addressed during the next scheduled maintenance window.

### 3.5 Severity Matrix

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Security | Hardcoded secrets, Injection, Auth bypass | Missing validation, Weak headers | Incomplete CSP, Missing audit | Log verbosity |
| Quality | Data corruption, Crashes | Type errors, Complexity violations | Missing docs, Formatting | Style inconsistencies |
| Architecture | Circular deps in core | Circular deps in features | Tight coupling suggestions | Import ordering |
| Testing | No tests for critical paths | Coverage < 80%, Skipped tests | Missing edge case tests | Test naming style |
| Performance | Memory leaks, Infinite loops | N+1 queries, Bundle bloat | Unoptimized renders | Minor perf hints |
| Dependencies | Vulnerable packages (Critical CVE) | Vulnerable packages (High CVE) | Outdated packages | Version pin style |

---

## 4. PROBLEM CATEGORIES & ROOT CAUSE ANALYSIS

The following 34 problem categories have been identified through systematic analysis of AI-generated code across hundreds of projects. Each category includes a root cause analysis to enable effective prevention.

### 4.1 Code Generation Problems

#### PC-001: Unsafe File/Directory Deletion
- **Severity:** Critical
- **Description:** AI agents delete directories or files without user confirmation, destroying work-in-progress, configuration files, or critical project structure.
- **Root Cause:** AI agents optimize for task completion speed without understanding the human cost of lost work. The absence of an explicit confirmation gate in the agent's decision process leads to destructive actions being taken without oversight.
- **Prevention:** Mandatory user confirmation before any destructive file system operation.

#### PC-002: Mock/Placeholder Data in Production Code
- **Severity:** High
- **Description:** AI agents insert fake data, Lorem Ipsum, or placeholder objects into production code instead of connecting to real data sources.
- **Root Cause:** AI agents lack context about data sources, database schemas, and API contracts. They fill gaps with synthetic data to produce "working" code without understanding that this data is meaningless in production.
- **Prevention:** Require explicit data source identification before writing data-handling code. Mock data ONLY in test files.

#### PC-003: Infinite Loops and Unbounded Recursion
- **Severity:** Critical
- **Description:** Generated code contains loops or recursive functions that may never terminate under certain input conditions.
- **Root Cause:** AI agents reason about control flow abstractly without considering edge cases that lead to non-termination. Boundary conditions, especially those involving user input, are frequently overlooked.
- **Prevention:** Every loop must have a provable upper bound. Every recursive function must have an explicit base case and maximum depth.

#### PC-004: Fabricated API Information
- **Severity:** Critical
- **Description:** AI agents use incorrect method names, parameters, or return types from libraries, leading to runtime errors.
- **Root Cause:** AI models are trained on historical code that may reference outdated API versions. They generate plausible-looking but incorrect API usage without verification against current documentation.
- **Prevention:** Require explicit API verification against official documentation. When uncertain, use documented fallback approaches.

#### PC-005: Quality Shortcuts
- **Severity:** High
- **Description:** AI agents skip tests, use type assertions to silence errors, bypass linting rules, or leave incomplete implementations.
- **Root Cause:** AI agents are optimized to produce output quickly. Quality assurance steps (testing, linting, type checking) are perceived as optional add-ons rather than integral components of the development process.
- **Prevention:** Define quality as a non-negotiable constraint, not an optimization target.

### 4.2 Type System Problems

#### PC-006: Overuse of `any` Type
- **Severity:** High
- **Description:** TypeScript files use `any` instead of proper types, defeating the purpose of static type checking.
- **Root Cause:** AI agents use `any` as a convenience mechanism to avoid reasoning about complex type relationships. This is especially prevalent when dealing with generic functions, third-party library types, or data transformation pipelines.
- **Prevention:** Replace `any` with `unknown`, generics, union types, or specific interfaces. Every `any` is a design decision that should be explicitly justified.

#### PC-007: Type Assertion Abuse (`as` keyword)
- **Severity:** High
- **Description:** AI agents use `as Type` assertions to coerce types instead of properly narrowing or validating types.
- **Root Cause:** Similar to `any` usage, type assertions are a shortcut that avoids proper type narrowing. The AI agent produces code that compiles but may fail at runtime.
- **Prevention:** Use type guards, type narrowing, and proper validation. Assertions are only acceptable when the surrounding code guarantees the type invariant.

#### PC-008: Missing Generic Constraints
- **Severity:** Medium
- **Description:** Generic functions lack proper constraints (`extends`), leading to overly permissive type signatures.
- **Root Cause:** AI agents define generics without constraining them, allowing any type to be passed. This reduces the effectiveness of type checking and can lead to runtime errors when incompatible types are used.
- **Prevention:** All generic type parameters must have appropriate constraints.

### 4.3 Architecture Problems

#### PC-009: Circular Dependencies
- **Severity:** High
- **Description:** Module import graph contains cycles, causing initialization issues, memory leaks, and unpredictable behavior.
- **Root Cause:** AI agents add imports to make code compile without considering the module dependency graph. Cross-cutting concerns (logging, configuration, shared types) are particularly prone to creating cycles.
- **Prevention:** Module dependency graphs must form a DAG. Use dependency inversion and barrel exports to manage cross-cutting concerns.

#### PC-010: God Components / Files
- **Severity:** High
- **Description:** Single files or components exceed size limits (300 lines for files, 200 lines for components), handling too many responsibilities.
- **Root Cause:** AI agents tend to add functionality to existing files rather than creating new ones with proper separation of concerns. This leads to monolithic files that are difficult to test, maintain, and understand.
- **Prevention:** Enforce strict file and component size limits. When a file approaches the limit, plan a decomposition.

#### PC-011: Prop Drilling
- **Severity:** Medium
- **Description:** Data is passed through multiple levels of component hierarchy via props instead of using state management or context.
- **Root Cause:** AI agents follow the simplest path to make data available to a component: threading props through parent components. This creates brittle coupling and makes refactoring difficult.
- **Prevention:** Maximum 3 levels of prop passing. Beyond that, use Context, state management, or composition.

#### PC-012: Tight Coupling
- **Severity:** High
- **Description:** Modules depend on concrete implementations rather than abstractions, making testing and modification difficult.
- **Root Cause:** AI agents import concrete classes and functions directly, creating hard dependencies. This makes it impossible to swap implementations (e.g., for testing) without modifying the consuming code.
- **Prevention:** Use dependency injection, interfaces, and inversion of control containers.

### 4.4 Error Handling Problems

#### PC-013: Silent Error Swallowing
- **Severity:** Critical
- **Description:** Errors are caught but not handled, logged, or re-thrown, making debugging impossible.
- **Root Cause:** AI agents add try-catch blocks to satisfy type checkers or to prevent crashes, but do not implement meaningful error handling. The `catch {}` pattern is especially common and dangerous.
- **Prevention:** Every catch block must either handle the error, log it with context, or re-throw it. Empty catch blocks are a Critical violation.

#### PC-014: Bare try-catch Blocks
- **Severity:** High
- **Description:** Errors are caught using broad `catch (error)` without distinguishing between error types.
- **Root Cause:** AI agents use broad catch blocks as a safety net without differentiating between expected operational errors and unexpected programmer errors.
- **Prevention:** Catch specific error types. Use a typed error hierarchy with proper inheritance.

#### PC-015: Missing Error Boundaries
- **Severity:** High
- **Description:** React applications lack error boundaries, causing entire application crashes from component-level errors.
- **Root Cause:** AI agents focus on happy-path rendering without considering component failure scenarios. Error boundaries are often perceived as an "advanced" pattern that gets skipped.
- **Prevention:** Implement error boundaries at every major section boundary. Provide meaningful fallback UI.

### 4.5 Security Problems

#### PC-016: Hardcoded Secrets
- **Severity:** Critical
- **Description:** API keys, passwords, tokens, or other credentials are embedded directly in source code.
- **Root Cause:** AI agents generate code with hardcoded values as the simplest approach to making code "work." They do not have context about secret management infrastructure.
- **Prevention:** All sensitive values MUST use environment variables or secret management services.

#### PC-017: SQL/NoSQL Injection
- **Severity:** Critical
- **Description:** User input is concatenated into database queries without parameterization.
- **Root Cause:** AI agents may generate string-interpolated queries when the ORM or query builder pattern is not clearly established in the project.
- **Prevention:** Use parameterized queries or ORM exclusively. Never concatenate user input into queries.

#### PC-018: Cross-Site Scripting (XSS)
- **Severity:** Critical
- **Description:** User input is rendered without proper encoding, enabling script injection.
- **Root Cause:** AI agents use `dangerouslySetInnerHTML`, `innerHTML`, or string interpolation in templates without sanitization.
- **Prevention:** Use framework escaping mechanisms. Never render raw user input.

#### PC-019: Missing Input Validation
- **Severity:** High
- **Description:** User inputs are processed without validation on server side.
- **Root Cause:** AI agents may rely on client-side validation only, or skip validation entirely when generating quick implementations.
- **Prevention:** Validate ALL inputs on server side using a validation library with explicit schemas.

#### PC-020: Weak Security Headers
- **Severity:** Medium
- **Description:** HTTP responses lack recommended security headers (CSP, HSTS, X-Frame-Options, etc.).
- **Root Cause:** AI agents focus on application logic without considering HTTP security headers, which are an infrastructure concern.
- **Prevention:** Implement a comprehensive security header middleware with all recommended headers.

#### PC-021: Insecure Authentication/Authorization
- **Severity:** Critical
- **Description:** Authentication tokens stored in localStorage, authorization checks missing on endpoints, or JWT handling errors.
- **Root Cause:** AI agents implement authentication using patterns from tutorials that may not follow current best practices (e.g., storing JWTs in localStorage instead of HTTP-only cookies).
- **Prevention:** Follow OWASP authentication and authorization best practices. Use established libraries.

### 4.6 Testing Problems

#### PC-022: Missing Tests for New Code
- **Severity:** High
- **Description:** New functions, components, or services are added without corresponding tests.
- **Root Cause:** AI agents optimize for feature completion and may not generate tests unless explicitly instructed. Tests are perceived as secondary to the "main" code.
- **Prevention:** Every new function, component, and service MUST have corresponding tests. Tests are not optional.

#### PC-023: Low Test Coverage
- **Severity:** High
- **Description:** Test coverage falls below the minimum threshold (80% unit, 60% integration).
- **Root Cause:** AI agents may write tests that only cover the happy path, leaving edge cases and error scenarios untested.
- **Prevention:** Enforce coverage thresholds via CI. Tests must cover happy paths, edge cases, and error scenarios.

#### PC-024: Skipped or Disabled Tests
- **Severity:** High
- **Description:** Tests are written with `.skip()`, `.only()`, or are commented out.
- **Root Cause:** AI agents may encounter failing tests and disable them rather than fixing the underlying issue.
- **Prevention:** `.skip()` and `.only()` are only permissible with a documented, tracked issue. CI must fail on skipped tests.

#### PC-025: Meaningless Test Descriptions
- **Severity:** Low
- **Description:** Test descriptions like "it works" or "test 1" that provide no information about what is being tested.
- **Root Cause:** AI agents generate generic test names to quickly produce passing test suites.
- **Prevention:** Test descriptions must follow the pattern: "should [expected behavior] when [condition]".

### 4.7 Performance Problems

#### PC-026: Bundle Bloat
- **Severity:** Medium
- **Description:** Unnecessary dependencies or poor tree-shaking result in excessively large bundles.
- **Root Cause:** AI agents may import entire libraries instead of specific sub-paths, or add dependencies without evaluating their bundle impact.
- **Prevention:** Monitor bundle size. Import specific sub-paths. Run bundle analysis regularly.

#### PC-027: N+1 Query Problem
- **Severity:** High
- **Description:** Database queries are executed in loops instead of using batch operations.
- **Root Cause:** AI agents may not recognize N+1 patterns, especially when queries are abstracted behind repository methods.
- **Prevention:** Use eager loading, batch queries, or DataLoader patterns. Review all loops that contain database calls.

#### PC-028: Memory Leaks
- **Severity:** Critical
- **Description:** Event listeners, timers, or subscriptions are not cleaned up, causing memory growth over time.
- **Root Cause:** AI agents add event listeners, intervals, or subscriptions without implementing cleanup logic (e.g., `return () => cleanup()` in React effects).
- **Prevention:** Every side effect that allocates resources MUST have corresponding cleanup logic.

### 4.8 Maintainability Problems

#### PC-029: Dead Code
- **Severity:** Medium
- **Description:** Unused functions, variables, imports, or files remain in the codebase.
- **Root Cause:** AI agents may generate utility functions that end up unused, or leave behind code from refactoring iterations.
- **Prevention:** Use tree-shaking analysis and linter rules (`no-unused-vars`, `no-unused-imports`). Remove dead code immediately.

#### PC-030: Magic Numbers and Strings
- **Severity:** Medium
- **Description:** Unnamed numeric or string literals are used directly in code without named constants.
- **Root Cause:** AI agents use literal values for clarity in generated code but fail to extract them into named constants for maintainability.
- **Prevention:** Extract all literals into named constants with semantic names. Exception: 0 and 1 may be used directly in obvious contexts.

#### PC-031: Copy-Paste Duplication
- **Severity:** Medium
- **Description:** The same or similar code blocks appear in multiple locations.
- **Root Cause:** AI agents may generate similar code for similar features without extracting shared logic into reusable utilities.
- **Prevention:** Apply the Rule of Three: if code appears three times, extract it. Prefer composition and shared utilities over duplication.

#### PC-032: Inconsistent Naming
- **Severity:** Low
- **Description:** Variables, functions, or files do not follow the established naming conventions.
- **Root Cause:** AI agents may not pick up on the project's naming conventions, especially in large codebases with mixed styles.
- **Prevention:** Enforce naming conventions via ESLint rules. Use consistent casing (camelCase, PascalCase, SCREAMING_SNAKE_CASE).

### 4.9 Dependency Problems

#### PC-033: Unpinned Dependencies
- **Severity:** Medium
- **Description:** Dependencies use version ranges (`^`, `~`) instead of exact versions, leading to non-reproducible builds.
- **Root Cause:** AI agents follow npm's default behavior of prefixing versions, which can introduce breaking changes in minor/patch updates.
- **Prevention:** Lock all dependency versions exactly. Use lockfiles (package-lock.json, yarn.lock).

#### PC-034: Vulnerable Dependencies
- **Severity:** Critical (if Critical CVE), High (if High CVE)
- **Description:** Project dependencies contain known security vulnerabilities.
- **Root Cause:** AI agents may suggest packages with known vulnerabilities, especially older or less-maintained packages.
- **Prevention:** Run `npm audit` after every dependency change. Block merges with Critical/High CVEs.

---

## 5. ENFORCEMENT MECHANISMS

### 5.1 Automated Enforcement (Level 1 — Continuous)

These mechanisms run automatically without human intervention:

| Mechanism | Tool | Enforcement Point | Action on Failure |
|-----------|------|-------------------|-------------------|
| TypeScript Compilation | `tsc --noEmit` | Pre-commit, CI | BLOCK |
| ESLint | eslint | Pre-commit, CI | BLOCK |
| Prettier | prettier | Pre-commit | AUTO-FIX or BLOCK |
| Test Execution | jest/vitest | CI | BLOCK |
| Coverage Enforcement | istanbul/c8 | CI | BLOCK (below threshold) |
| Dependency Audit | npm audit | CI, Post-install | BLOCK (Critical/High) |
| Circular Dependency Check | madge | CI | BLOCK |
| Bundle Size Check | webpack-bundle-analyzer | CI | WARN (> 500KB) |
| Secret Detection | git-secrets | Pre-commit | BLOCK |
| Security Headers Check | security-headers (Lighthouse) | CI | WARN |

### 5.2 Pre-commit Hooks (Level 2 — Developer Gate)

Using Husky + lint-staged:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write",
      "tsc --noEmit"
    ],
    "*.{json,md,mdx}": [
      "prettier --write"
    ]
  }
}
```

### 5.3 CI/CD Pipeline (Level 3 — Merge Gate)

All CI checks must pass before merging to any protected branch:

1. **Build:** `npm run build` must succeed
2. **Lint:** `npm run lint` with zero warnings
3. **Type Check:** `tsc --noEmit` with zero errors
4. **Unit Tests:** All tests pass, coverage >= 80%
5. **Integration Tests:** All tests pass
6. **Security Audit:** No Critical or High vulnerabilities
7. **Bundle Analysis:** Report generated, alert if > 500KB
8. **Circular Dependency Check:** No cycles detected

### 5.4 Code Review (Level 4 — Human Gate)

All PRs require review with focus on:

- Architecture decisions and their justification
- Error handling completeness
- Test quality and coverage
- Security implications
- Performance considerations
- Adherence to all Deerflow rules

### 5.5 AI Agent Gate (Level 5 — Generation Gate)

AI agents are configured to self-enforce rules via:

- Tool-specific rule files (`.cursorrules`, `.windsurfrules`, `CLAUDE.md`, etc.)
- Master rules document (`core/rules/master-rules.md`)
- Pre-generation checklists
- Post-generation verification steps

---

## 6. REMEDIATION PROCEDURES

### 6.1 Critical Violations

**Timeline:** Immediate (0 minutes — blocking)

1. **Identify:** Automated tool or review flags the violation
2. **Block:** All progress on the affected PR/branch is halted
3. **Fix:** The violating code must be corrected immediately
4. **Verify:** All automated checks must pass after the fix
5. **Review:** A senior engineer must review the fix
6. **Document:** Add a note to the PR explaining the violation and the fix

**Escalation:** If the same Critical violation occurs more than once in a 30-day period, a root cause analysis is triggered and the AI agent configuration is reviewed.

### 6.2 High Violations

**Timeline:** Current PR/merge cycle (same day)

1. **Identify:** Automated tool or review flags the violation
2. **Track:** Create a GitHub issue with the `violation:high` label if not already tracked
3. **Fix:** The violating code must be corrected in the same PR
4. **Verify:** All automated checks must pass after the fix
5. **Review:** Standard PR review process

**Escalation:** Repeated High violations trigger a review of the AI agent's rule configuration and the project's automated enforcement gaps.

### 6.3 Medium Violations

**Timeline:** 5 business days

1. **Identify:** Automated tool or review flags the violation
2. **Track:** Create a GitHub issue with the `violation:medium` label, assign to the responsible party
3. **Schedule:** Add to the current sprint backlog
4. **Fix:** Implement the fix within the SLA
5. **Verify:** Automated checks confirm the fix
6. **Close:** Close the tracking issue

### 6.4 Low Violations

**Timeline:** Next scheduled maintenance window

1. **Identify:** Automated tool or review flags the violation
2. **Log:** Record in the project's technical debt register
3. **Batch:** Group similar Low violations for efficient remediation
4. **Fix:** Address during regular maintenance
5. **Verify:** Automated checks confirm the fix

### 6.5 Remediation Pattern Library

For each problem category, the following remediation patterns are maintained:

| Problem Category | Detection | Immediate Fix | Systemic Fix |
|-----------------|-----------|---------------|--------------|
| Hardcoded Secrets | git-secrets, manual review | Move to env var, rotate secret | Add pre-commit hook, audit all files |
| SQL Injection | SQL parsing, review | Use parameterized query | Add ORM layer, security training |
| `any` Type | TypeScript --noEmit | Replace with proper type | Add `no-explicit-any` ESLint rule |
| Missing Tests | Coverage report | Write tests for affected code | Add coverage enforcement to CI |
| Circular Dependencies | madge --circular | Refactor to break cycle | Add CI check, architectural review |
| Silent Errors | ESLint no-empty | Add error handling/logging | Add custom error classes |
| God Components | File length analysis | Split into smaller components | Add size limits to CI |
| Bundle Bloat | Bundle analyzer | Tree-shake, code split | Set bundle size budget |

---

## 7. CORE RULES REFERENCE

### 7.1 Absolute Prohibitions (15 Rules)

1. Never delete directories without explicit user confirmation
2. Never use mock/placeholder data in production code
3. Never create infinite loops or unbounded recursion
4. Never fabricate library API information
5. Never take quality shortcuts
6. Never modify files outside project scope
7. Never ignore TypeScript/ESLint errors
8. Never use `any` type
9. Never hardcode secrets
10. Never create circular dependencies
11. Never use `eval()`/`innerHTML`/`dangerouslySetInnerHTML`
12. Never swallow errors silently
13. Never commit with console.log/debugger
14. Never assume the environment
15. Never use deprecated APIs

### 7.2 Workflow Phases (5 Phases)

1. Deep Analysis — Read everything, understand architecture
2. Planning — TODO list, risk assessment, backward compatibility
3. Implementation — Clean, typed, documented code following SOLID
4. Verification — All tests, zero regressions, lint/type checks
5. Documentation — JSDoc, CHANGELOG, README updates

### 7.3 Quality Metrics (12 Metrics)

- TypeScript strict mode: ALWAYS
- ESLint: ZERO warnings
- Function length: max 50 lines
- File length: max 300 lines
- Component length: max 200 lines
- Unit test coverage: min 80%
- Integration test coverage: min 60%
- Cyclomatic complexity: max 10
- Nesting depth: max 4
- Parameters per function: max 5
- Lighthouse score: > 90
- Bundle size initial load: < 500KB

### 7.4 Anti-Patterns (15 Patterns)

1. God Components
2. Magic Numbers
3. Callback Hell
4. Prop Drilling
5. Tight Coupling
6. Premature Optimization
7. Copy-Paste Code
8. Comments That Explain WHAT
9. Shotgun Surgery
10. Dead Code
11. Stringly Typed
12. Boolean Traps
13. Error Masking
14. Premature Abstraction
15. Mutable Default Parameters

---

## 8. APPENDIX: QUICK REFERENCE CARD

```
┌──────────────────────────────────────────────────────────────┐
│                DEERFLOW QUICK REFERENCE v1.0                 │
├──────────────────────────────────────────────────────────────┤
│ STOP — Before writing ANY code:                              │
│  1. Read all existing files in affected directories          │
│  2. Understand the complete architecture                     │
│  3. Identify all dependencies and versions                   │
│  4. Plan changes with a TODO list                            │
│                                                              │
│ WHILE — Writing code:                                        │
│  1. TypeScript strict mode — ALWAYS                          │
│  2. No `any` types — use proper types                        │
│  3. Functions: max 50 lines, max 10 complexity               │
│  4. Files: max 300 lines, Components: max 200 lines          │
│  5. SOLID principles — no exceptions                         │
│  6. Proper error handling — never silent                     │
│  7. No console.log, debugger, or commented code              │
│  8. No hardcoded secrets — use env vars                      │
│  9. No circular dependencies                                 │
│ 10. No eval, innerHTML, dangerouslySetInnerHTML              │
│                                                              │
│ AFTER — Completing code:                                     │
│  1. All tests pass (not just related ones)                   │
│  2. New tests for new functionality                          │
│  3. TypeScript: zero errors                                  │
│  4. ESLint: zero warnings                                    │
│  5. No circular dependencies                                 │
│  6. No security vulnerabilities                              │
│  7. Documentation updated                                    │
│  8. CHANGELOG updated                                        │
│                                                              │
│ SECURITY — Always:                                           │
│  1. Validate ALL inputs (server + client)                    │
│  2. Parameterized queries only                               │
│  3. Encode all outputs (prevent XSS)                         │
│  4. Auth: HTTP-only cookies, short-lived tokens              │
│  5. Rate limiting on public endpoints                        │
│  6. Security headers on all responses                        │
│  7. Never log sensitive data                                 │
│                                                              │
│ TESTING — Always:                                            │
│  1. Unit: ALL business logic (80%+ coverage)                 │
│  2. Integration: ALL API endpoints (60%+ coverage)           │
│  3. E2E: Critical user flows                                 │
│  4. Edge cases + error scenarios                             │
│  5. Meaningful test names                                    │
│                                                              │
│ GIT — Always:                                                │
│  1. Conventional Commits: type(scope): description           │
│  2. Branch: feature/fix/chore/refactor/<description>         │
│  3. Never commit secrets                                     │
│  4. Squash before merge to main                              │
└──────────────────────────────────────────────────────────────┘
```

---

## DOCUMENT METADATA

| Field | Value |
|-------|-------|
| Document ID | DAF-MASTER-RULES-001 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Classification | MANDATORY |
| Applicable To | All AI agents, all Deerflow projects |
| Review Cycle | Quarterly |
| Next Review | 2025-04-10 |
| Maintainer | Deerflow Framework Team |
| Approved By | Deerflow Technical Steering Committee |

---

**END OF MASTER RULES DOCUMENT**

*This document is the single source of truth for the Deerflow Agent Framework. All derived rule files must be consistent with this document. In case of conflict, this document takes precedence.*
