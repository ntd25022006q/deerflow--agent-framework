# DEERFLOW QUALITY GUARDS — Complete Reference Guide

> **Version:** 1.0  
> **Last Updated:** 2025-01-10  
> **Enforcement Level:** Automated → CI/CD → Human Review → AI Agent

---

## Table of Contents

1. [Overview](#1-overview)
2. [Quality Gate Categories](#2-quality-gate-categories)
3. [Code Quality Guards](#3-code-quality-guards)
4. [Testing Guards](#4-testing-guards)
5. [Security Guards](#5-security-guards)
6. [Build Guards](#6-build-guards)
7. [Architecture Guards](#7-architecture-guards)
8. [Accessibility Guards](#8-accessibility-guards)
9. [Performance Guards](#9-performance-guards)
10. [Documentation Guards](#10-documentation-guards)
11. [Enforcement Mechanisms](#11-enforcement-mechanisms)
12. [Violation Severity & Remediation](#12-violation-severity--remediation)
13. [Pre-Commit Hook Configuration](#13-pre-commit-hook-configuration)
14. [CI/CD Pipeline Integration](#14-cicd-pipeline-integration)
15. [AI Agent Enforcement Rules](#15-ai-agent-enforcement-rules)

---

## 1. Overview

The Deerflow Agent Framework enforces quality through a multi-layered system of automated guards. These guards act as **non-negotiable checkpoints** that every piece of code must pass before it reaches production. Quality is not optional — it is a fundamental requirement built into the development workflow from the first keystroke to the final deployment.

The quality guard system operates on the principle of **shift-left quality**: catching defects, vulnerabilities, and anti-patterns as early as possible in the development lifecycle. This reduces remediation costs, minimizes technical debt, and ensures consistent codebase health.

### Design Principles

- **Zero Tolerance for Critical Issues**: Any critical or high-severity violation immediately blocks progress.
- **Automated First**: All guards are automated — no manual intervention required for standard checks.
- **Fast Feedback**: Pre-commit hooks provide sub-second feedback; CI/CD provides comprehensive feedback within minutes.
- **Configurable Thresholds**: All thresholds are centrally managed in `pipeline-config.json`.
- **Progressive Enforcement**: Development branches have lighter checks; main branch requires all gates.

### Quality Gate Flow

```
Developer writes code
        │
        ▼
┌──────────────────┐    FAIL     ┌──────────────┐
│  Pre-Commit Hook │────────────▶│ Fix & Resubmit│
│  (lint, format)  │             └──────────────┘
└────────┬─────────┘
         │ PASS
         ▼
┌──────────────────┐    FAIL     ┌──────────────┐
│    Push to PR    │────────────▶│ CI Feedback  │
│                  │             └──────────────┘
└────────┬─────────┘
         │ PASS
         ▼
┌──────────────────┐    FAIL     ┌──────────────┐
│   CI/CD Pipeline │────────────▶│ Block Merge  │
│  (all gates)     │             └──────────────┘
└────────┬─────────┘
         │ PASS
         ▼
┌──────────────────┐
│   Merge to Main  │
│  (production)    │
└──────────────────┘
```

---

## 2. Quality Gate Categories

Quality guards are organized into eight distinct categories, each with specific thresholds and enforcement rules:

| Category | Threshold | Enforcement | Artifact Retention |
|----------|-----------|-------------|-------------------|
| Code Quality | 0 errors, 0 warnings | Pre-commit + CI/CD | 14 days |
| Testing | 80% coverage (all metrics) | CI/CD | 14 days |
| Security | 0 critical/high vulnerabilities | CI/CD | 30 days |
| Build | Max 500KB single file | CI/CD | 7 days |
| Architecture | Max 300 lines/file | CI/CD | 14 days |
| Accessibility | WCAG 2.1 AA | CI/CD | 14 days |
| Performance | Lighthouse score ≥ 90 | CI/CD (PR only) | 14 days |
| Documentation | Required sections present | CI/CD | 14 days |

---

## 3. Code Quality Guards

### 3.1 ESLint Enforcement

The ESLint configuration (`eslint-rules.js`) enforces a strict zero-tolerance policy:

- **Maximum Warnings**: 0 — No warnings are permitted in any circumstance.
- **Maximum Errors**: 0 — All errors must be resolved before merge.

#### Critical Rules (Block Pipeline)

These rules are enforced as errors and will block the entire CI/CD pipeline:

- `@typescript-eslint/no-explicit-any`: All types must be explicitly defined. No `any` types are permitted.
- `no-console`: Production code must use structured logging (winston/pino), not `console.log`.
- `no-eval` / `no-implied-eval`: Dynamic code execution is strictly prohibited.
- `import/no-cycle`: Circular dependencies are not permitted at any depth.
- `security/detect-unsafe-regex`: Regular expressions must be safe from ReDoS attacks.
- `security/detect-child-process`: Child process spawning requires explicit security review.

#### Code Complexity Limits

| Metric | Maximum | Rationale |
|--------|---------|-----------|
| Lines per file | 300 | Maintainability and navigability |
| Lines per function | 50 | Testability and readability |
| Cyclomatic complexity | 10 | Reduces branch-based defects |
| Nesting depth | 4 | Prevents deeply nested logic |
| Parameters per function | 5 | Encourages object parameters |
| Classes per file | 1 | Single Responsibility Principle |

### 3.2 TypeScript Strict Mode

The TypeScript configuration (`tsconfig-strict.json`) enables every strict compiler option:

- `strict: true` — Enables all strict type-checking options.
- `noUncheckedIndexedAccess` — Array/object index access returns `T | undefined`.
- `noPropertyAccessFromIndexSignature` — Forces bracket notation for dynamic keys.
- `exactOptionalPropertyTypes` — Distinguishes between `undefined` and missing properties.
- `noImplicitReturns` — All code paths must return a value.
- `noUnusedLocals` / `noUnusedParameters` — No unused declarations permitted.

### 3.3 Prettier Formatting

Prettier is configured as a non-negotiable formatting standard:

- Files are checked (not auto-formatted) in CI/CD.
- Pre-commit hooks automatically format staged files.
- Configuration must match the project's `.prettierrc` exactly.

---

## 4. Testing Guards

### 4.1 Coverage Thresholds

The framework mandates comprehensive test coverage using Vitest with V8 coverage provider:

| Metric | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| Lines | 80% | 60% |
| Functions | 80% | 60% |
| Branches | 80% | 60% |
| Statements | 80% | 60% |

**Enforcement**: Any metric falling below the threshold causes the CI/CD pipeline to fail immediately.

### 4.2 Test Organization Requirements

All tests must follow the templates defined in `test-templates.ts`:

- **Unit tests**: Isolated, fast (< 10ms per test), mock all external dependencies.
- **Integration tests**: Test module interactions, only mock external services.
- **E2E tests**: Test complete user journeys, no mocking of internal services.
- **Component tests**: Test rendering, interactions, accessibility, and state management.
- **Security tests**: Verify input validation, authentication, authorization, and data protection.

### 4.3 Test Quality Standards

- Each test must follow the Arrange-Act-Assert pattern.
- Test names must be descriptive sentences explaining expected behavior.
- Each `describe` block must contain at minimum one happy path and one error path test.
- Mocks must be reset between tests using `beforeEach`.
- Async tests must have explicit timeout handling.
- Snapshot tests must be reviewed manually before approval.

### 4.4 Mutation Testing

Mutation testing is required for critical business logic modules:

- **Minimum Mutation Score**: 70%
- **High Priority Modules**: 80% mutation score (payment processing, authentication, data validation)
- **Tool**: Stryker Mutator
- **Purpose**: Validates that tests actually detect code changes — not just achieve coverage numbers.

---

## 5. Security Guards

### 5.1 Vulnerability Scanning

| Severity | Maximum Allowed | Action on Detection |
|----------|----------------|---------------------|
| Critical | 0 | Block pipeline immediately |
| High | 0 | Block pipeline immediately |
| Medium | 5 | Warning + issue creation |
| Low | 10 | Logged, no block |

### 5.2 Secret Detection

- **Tool**: Gitleaks
- **Policy**: Zero secrets allowed in the repository at any point in history.
- **Scan Scope**: Full repository scan on PR, incremental scan on push.
- **Detected Secrets**: Pipeline fails immediately; secret must be rotated.

### 5.3 Dependency Security

- `npm audit` runs at the `high` level — no critical or high vulnerabilities permitted.
- Dependency review checks for known CVEs in newly introduced dependencies.
- License compliance denies GPL-3.0 and AGPL-3.0 licensed packages.
- Lock file must be committed and used (`npm ci --frozen-lockfile`).

### 5.4 Code-Level Security

The ESLint security plugin enforces:

- No dynamic file system access with user-controlled paths.
- No unsafe regular expressions susceptible to denial-of-service.
- No `eval()`, `new Function()`, or implied eval patterns.
- No child process spawning without explicit security review.
- No disabled mustache escape in templates.
- Detection of potential timing attack vectors.
- Buffer safety enforcement (no `Buffer` constructor without explicit size).

---

## 6. Build Guards

### 6.1 Bundle Size Limits

| Metric | Maximum | Purpose |
|--------|---------|---------|
| Single JS file | 500KB | Prevents excessive bundle bloat |
| Total initial JS load | 200KB | Ensures fast page load |
| Total CSS | 100KB | Maintains style efficiency |
| Total assets | No hard limit | Monitored and warned |

### 6.2 Build Verification

- Production build must complete without errors or warnings.
- Tree-shaking must be enabled and verified — no dead code in production bundles.
- Source maps must be generated for development builds; disabled for production.
- Code splitting must be configured for routes and large components.
- Minification and mangling must be enabled for production.

### 6.3 Output Validation

- Build output must match expected file structure.
- Entry point must be correctly configured.
- All static assets must be present and correctly referenced.
- No console statements in production build output.

---

## 7. Architecture Guards

### 7.1 Layer Dependency Rules

The framework enforces Clean Architecture with strict layer boundaries:

| Layer | May Import From | Must NOT Import From |
|-------|----------------|---------------------|
| Domain | Domain only | Application, Infrastructure, Presentation |
| Application | Domain, Application | Infrastructure, Presentation |
| Infrastructure | Domain, Application, Infrastructure | Presentation |
| Presentation | All layers | None |

**Enforcement**: CI/CD runs automated checks using static analysis to detect violations. Any layer violation blocks the pipeline.

### 7.2 Structural Rules

- **Maximum file length**: 300 lines (excluding test files).
- **Maximum function length**: 50 lines.
- **Maximum cyclomatic complexity**: 10 per function.
- **Maximum coupling**: Each module may depend on at most 5 other modules.
- **Maximum nesting depth**: 4 levels.
- **Single class per file**: Enforces Single Responsibility Principle.

### 7.3 Circular Dependency Detection

- **Tool**: Madge
- **Policy**: Zero circular dependencies permitted.
- **Detection**: Runs on every push and PR.
- **Resolution**: Must be refactored before merge; dependency injection or event-based communication are preferred solutions.

### 7.4 Naming Conventions

- **Interfaces**: PascalCase with `I` prefix (e.g., `IUserService`).
- **Types**: PascalCase with `T` prefix for generics (e.g., `TEntity`).
- **Enums**: UPPER_CASE members.
- **Variables**: camelCase or UPPER_CASE for constants.
- **Private members**: camelCase with `_` prefix.
- **Files**: kebab-case (e.g., `user-service.ts`).

---

## 8. Accessibility Guards

### 8.1 WCAG 2.1 AA Compliance

All UI components must meet WCAG 2.1 AA standards:

- **Alternative text**: All `<img>` elements must have meaningful `alt` attributes.
- **Form labels**: All form inputs must have associated `<label>` elements.
- **Color contrast**: Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text.
- **Keyboard navigation**: All interactive elements must be keyboard accessible.
- **ARIA attributes**: Must be valid and correctly applied.
- **Focus management**: Focus must be visible and logically ordered.
- **No distracting elements**: No blinking, scrolling, or auto-updating content.

### 8.2 Automated Accessibility Testing

- **Static analysis**: ESLint `jsx-a11y` plugin runs on every build.
- **Runtime testing**: axe-core runs against rendered components in tests.
- **Lighthouse accessibility audit**: Scores below 90 trigger warnings.

---

## 9. Performance Guards

### 9.1 Lighthouse CI Scores

| Category | Minimum Score | Target Score |
|----------|--------------|-------------|
| Performance | 90 | 95 |
| Accessibility | 90 | 95 |
| Best Practices | 90 | 95 |
| SEO | 80 | 90 |

### 9.2 Core Web Vitals

| Metric | Maximum | Measurement |
|--------|---------|------------|
| Largest Contentful Paint (LCP) | 2,500ms | Real User Monitoring |
| First Input Delay (FID) | 100ms | Real User Monitoring |
| Cumulative Layout Shift (CLS) | 0.1 | Lab + Field Data |
| Time to First Byte (TTFB) | 800ms | Server Response Time |

### 9.3 Bundle Performance

- Code splitting must be configured for lazy-loaded routes.
- Dynamic imports (`import()`) required for modules exceeding 50KB.
- Image optimization required for all bitmap images (WebP/AVIF with fallbacks).
- Font loading must be optimized (preconnect, font-display: swap).

---

## 10. Documentation Guards

### 10.1 Required Documentation

All modules must have the following documentation:

- **README.md**: Must include Installation, Usage, Contributing, and License sections.
- **API Documentation**: Generated via TypeDoc — all public exports must be documented.
- **JSDoc Comments**: Required on all exported functions, classes, interfaces, and types.
- **CHANGELOG.md**: Must follow Keep a Changelog format.
- **Inline Comments**: Required for complex logic (cyclomatic complexity > 5).

### 10.2 Documentation Quality

- All code examples in documentation must be syntactically correct and executable.
- README links must be valid (no broken internal or external links).
- API documentation must reflect the actual codebase state.
- Type definitions must have descriptive comments explaining their purpose and usage.

---

## 11. Enforcement Mechanisms

### Level 1: Pre-Commit Hooks (Immediate Feedback)

- **Lint-staged**: Runs ESLint and Prettier on staged files only.
- **Type checking**: Runs TypeScript compiler on changed files.
- **Speed**: < 5 seconds for typical changes.

### Level 2: CI/CD Pipeline (Comprehensive Validation)

All quality gates run in parallel for maximum speed:

```
Push/PR → [Code Quality] [Security Audit] [Test Suite] [Build Check] [Architecture] [Docs]
                ↓               ↓               ↓             ↓              ↓           ↓
            Results collected → Quality Gate Summary → PASS/FAIL
```

### Level 3: Branch Protection (Merge Gate)

- `main` branch requires all quality gates to pass.
- `develop` branch requires code quality and test suite.
- Feature branches require code quality checks only.

### Level 4: Code Review (Human Validation)

- At least 1 approval required for merge to main.
- Maximum 400 files changed per PR (prevents mega-PRs).
- PR description is required with clear summary of changes.

### Level 5: AI Agent (Real-Time Assistance)

- AI coding assistants are configured via `.cursorrules`, `.windsurfrules`, `.clinerules`, and `copilot-instructions.md`.
- All quality thresholds are embedded in AI assistant rules.
- AI agents are instructed to enforce quality standards during code generation.

---

## 12. Violation Severity & Remediation

### Severity Levels

| Level | Description | Response Time | Resolution |
|-------|-------------|---------------|------------|
| **Critical** | Security vulnerability, data loss risk | Immediate | Block pipeline, hotfix required |
| **High** | Quality gate failure, broken build | Within 4 hours | Block pipeline, must fix before merge |
| **Medium** | Warning, threshold miss, non-compliance | Within 24 hours | Warning in PR, tracked in issue |
| **Low** | Style issue, minor improvement | Within 1 sprint | Logged, tracked in backlog |

### Escalation Path

1. **Automated**: CI/CD blocks merge → developer fixes and pushes again.
2. **Team Lead**: If critical issues persist for > 4 hours, team lead is notified.
3. **Architecture Review**: If architectural violations recur, an architecture review is triggered.
4. **Tech Debt Sprint**: Accumulated low/medium issues are addressed in dedicated tech debt sprints.

---

## 13. Pre-Commit Hook Configuration

The pre-commit hook uses lint-staged for fast, focused checks:

```json
{
  "*.{ts,tsx}": [
    "eslint --config quality-gates/linters/eslint-rules.js --fix --max-warnings 0",
    "prettier --write"
  ],
  "*.{js,jsx,json,md,yml,yaml,css,scss}": [
    "prettier --write"
  ]
}
```

### Installation

```bash
npm install --save-dev husky lint-staged
npx husky init
echo 'npx lint-staged' > .husky/pre-commit
```

---

## 14. CI/CD Pipeline Integration

The complete pipeline is defined in `quality-gates/ci-cd/github-actions.yml` and configured via `pipeline-config.json`.

### Pipeline Architecture

The pipeline runs **8 parallel jobs** plus a **summary job** that depends on all others:

1. **Code Quality**: ESLint, Prettier, TypeScript — ~3 minutes
2. **Security Audit**: npm audit, gitleaks, dependency review — ~2 minutes
3. **Test Suite**: Unit, integration, E2E with coverage — ~10 minutes
4. **Build Verification**: Build, bundle analysis, tree-shaking — ~5 minutes
5. **Architecture Check**: Circular deps, layer violations, complexity — ~2 minutes
6. **Accessibility Check**: WCAG compliance, axe-core — ~3 minutes (UI projects)
7. **Performance Check**: Lighthouse CI — ~5 minutes (PR only, UI projects)
8. **Documentation Check**: API docs, README consistency — ~2 minutes
9. **Quality Gate Summary**: Aggregates all results, produces final PASS/FAIL — ~1 minute

### Total Pipeline Time

- **Best case** (parallel execution): ~10 minutes
- **Typical case**: ~15 minutes
- **Worst case** (with retries): ~30 minutes

---

## 15. AI Agent Enforcement Rules

All AI coding assistants are configured to enforce quality guards in real-time:

- **Cursor** (`.cursorrules`): Full quality standards embedded in master rules.
- **Windsurf** (`.windsurfrules`): Cascade flow rules include quality checkpoints.
- **Claude Code** (`.clinerules`): Tool-specific quality enforcement directives.
- **GitHub Copilot** (`copilot-instructions.md`): Completion and chat quality rules.
- **OpenAI Codex** (`codex/instructions.md`): Code generation quality constraints.

### AI Agent Quality Directives

1. **Never generate code that violates ESLint rules** — AI must produce lint-clean code.
2. **Always include test files** — AI must generate corresponding tests for new code.
3. **Never introduce circular dependencies** — AI must verify import graph.
4. **Always follow naming conventions** — AI must use the specified naming patterns.
5. **Never use `any` type** — AI must provide explicit types for all declarations.
6. **Always respect layer boundaries** — AI must follow Clean Architecture rules.
7. **Never skip error handling** — AI must implement proper typed error handling.
8. **Always document public APIs** — AI must include JSDoc for all exports.

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DEERFLOW QUALITY GATES — QUICK REF             │
├──────────────┬──────────────────────────────────────────────────────┤
│ ESLint       │ 0 errors, 0 warnings                                │
│ TypeScript   │ Strict mode, all checks enabled                     │
│ Test Coverage│ 80% lines/functions/branches/statements              │
│ Security     │ 0 critical/high vulnerabilities                     │
│ Secrets      │ 0 allowed                                           │
│ Bundle Size  │ Max 500KB per file, 200KB initial load              │
│ File Length  │ Max 300 lines (non-test)                            │
│ Complexity   │ Max 10 cyclomatic, 4 nesting depth                  │
│ A11y Score   │ Lighthouse ≥ 90, WCAG 2.1 AA                       │
│ Perf Score   │ Lighthouse ≥ 90, LCP < 2.5s                        │
├──────────────┴──────────────────────────────────────────────────────┤
│ CI/CD: 8 parallel jobs + summary gate                              │
│ Pre-commit: lint-staged (ESLint + Prettier)                        │
│ Branch protection: main (all gates), develop (quality + tests)     │
│ AI agents: all configured with quality standards                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

*This document is part of the Deerflow Agent Framework quality governance system. For rule definitions and problem categories, see `core/rules/master-rules.md`.*
