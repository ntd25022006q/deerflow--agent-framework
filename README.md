<div align="center">

# 🦌 DEERFLOW AGENT FRAMEWORK

### The Strict Enforcement Protocol for ALL AI Coding Agents

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ntd25022006q/deerflow--agent-framework)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![AI Agents](https://img.shields.io/badge/supports-Cursor%20%7C%20Windsurf%20%7C%20Claude%20Code%20%7C%20Copilot%20%7C%20Codex%20%7C%20ALL-purple.svg)]
[![Strict Mode](https://img.shields.io/badge/strict%20mode-ON-red.svg)]
[![Quality Gates](https://img.shields.io/badge/quality%20gates-8%20stages-orange.svg)]
[![Problems Solved](https://img.shields.io/badge/problems%20solved-34%2B-critical.svg)]
[![Anti-Patterns](https://img.shields.io/badge/anti--patterns-35%20cataloged-red.svg)]

**One clone. Zero violations. Every agent follows the rules.**

[Quick Start](#-quick-start) · [Why Deerflow](#-why-deerflow) · [Architecture](#-architecture) · [Documentation](#-documentation) · [Contributing](#-contributing)

</div>

---

## Table of Contents

- [What is Deerflow?](#-what-is-deerflow)
- [Quick Start](#-quick-start)
- [Why Deerflow?](#-why-deerflow)
  - [The 34+ Problems AI Agents Cause](#the-34-problems-ai-agents-cause)
- [How Deerflow Solves These Problems](#-how-deerflow-solves-these-problems)
- [Architecture](#-architecture)
- [Supported AI Agents](#-supported-ai-agents)
- [Quality Metrics](#-quality-metrics)
- [Key Features](#-key-features)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 What is Deerflow?

**Deerflow** is a comprehensive enforcement framework that transforms **any** AI coding agent — Cursor, Windsurf, Claude Code, GitHub Copilot, OpenAI Codex, or any other — from a reckless code generator into a **disciplined senior engineer**.

Built from a systematic analysis of **34+ problem categories** that AI agents consistently introduce into production codebases, Deerflow provides a multi-layered defense system that prevents code destruction, quality failure, security vulnerabilities, and architectural collapse before they happen.

### Core Philosophy

| Principle | Description |
|-----------|-------------|
| 🛡️ **Zero Compromise Quality** | Quality is not a trade-off against speed. Every line meets senior engineer standards. |
| 🔒 **Prevention Over Detection** | Rules prevent problems at the point of generation, not after the fact. |
| 📋 **Explicit Over Implicit** | Every convention, pattern, and standard is documented and enforceable. |
| 🔍 **Accountability** | Every AI agent is accountable for the code it produces. No "good enough" exceptions. |

### What Makes Deerflow Different?

Most "AI coding rules" are simple `.cursorrules` files with a few guidelines. Deerflow is a **complete enforcement system** with:

- **5 dedicated rule files** for different AI agents, all derived from a single master source of truth
- **8-phase agentic workflow** that agents must follow for every task
- **17 skill tiers** with verification and gating requirements
- **35 anti-patterns** cataloged with detection and correction procedures
- **5 MCP server integrations** for real-time enforcement
- **8 parallel CI/CD jobs** with comprehensive quality gates
- **10+ pre-commit hooks** for shift-left quality
- **10 comprehensive test templates** covering unit, integration, E2E, security, and more

---

## ⚡ Quick Start

Get Deerflow running in your project with a single command:

```bash
# Clone the framework
git clone https://github.com/ntd25022006q/deerflow--agent-framework.git
cd deerflow--agent-framework

# Run setup — detects your AI editor and configures everything
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

### That's it. Your AI agent is now bound by Deerflow's strict enforcement protocol.

The setup script will:

1. ✅ Detect your Node.js version and package manager
2. ✅ Detect and configure your AI editor (Cursor, Windsurf, Claude Code, Copilot, Codex)
3. ✅ Install quality tools (ESLint, TypeScript, Prettier, Vitest)
4. ✅ Install security tools (gitleaks, detect-secrets)
5. ✅ Configure git hooks (pre-commit, pre-push, commit-msg, post-merge)
6. ✅ Set up quality gates and baseline metrics
7. ✅ Optionally configure GitHub Actions CI/CD pipeline

### Scaffolding a New Project

```bash
# Create a new Next.js project with full Deerflow enforcement
./scripts/init-project.sh --type nextjs --name my-app

# Create a React + Vite project
./scripts/init-project.sh --type react --name my-react-app

# Create a Node.js API project
./scripts/init-project.sh --type node --name my-api

# Create a Python project
./scripts/init-project.sh --type python --name my-python-app

# Create a fullstack project (Next.js + API)
./scripts/init-project.sh --type fullstack --name my-fullstack
```

### Running Quality Checks

```bash
# Run all quality checks
./scripts/quality-check.sh

# Run full audit (lint + tests + security + performance + architecture)
./scripts/quality-check.sh --full

# Run security-only audit
./scripts/quality-check.sh --security

# Run architecture-only check
./scripts/quality-check.sh --architecture
```

---

## 🔥 Why Deerflow?

AI coding agents are powerful, but they suffer from **systematic, reproducible problems** that make them unreliable for real production projects. Through extensive analysis of AI-generated code across hundreds of projects, we identified **34 distinct problem categories** organized into 8 severity domains.

### The 34 Problems AI Agents Cause

#### 🔴 Category 1: Code Destruction (Critical — 5 problems)

| ID | Problem | Impact | Frequency |
|----|---------|--------|-----------|
| PC-001 | **Silent directory deletion** — Agents delete directories without asking | Complete project breakage, data loss | Very common |
| PC-002 | **Mock/placeholder data in production** — Fake data instead of real sources | Meaningless UI, broken user experience | Common |
| PC-003 | **Infinite loops & unbounded recursion** — Non-terminating control flow | Application hangs, server crashes | Common |
| PC-004 | **Fabricated API information** — Wrong method names, parameters, types | Runtime errors, broken integrations | Very common |
| PC-005 | **Quality shortcuts** — No tests, type assertions, skipped linting | Accumulated technical debt | Ubiquitous |

#### 🔴 Category 2: Type System Failures (High — 3 problems)

| ID | Problem | Impact | Frequency |
|----|---------|--------|-----------|
| PC-006 | **Overuse of `any` type** — Defeats TypeScript's purpose | Runtime type errors, lost safety | Ubiquitous |
| PC-007 | **Type assertion abuse** — `as Type` instead of proper narrowing | Hidden bugs, false type safety | Very common |
| PC-008 | **Missing generic constraints** — Overly permissive type signatures | Runtime errors from wrong types | Common |

#### 🟠 Category 3: Architecture Collapse (High — 4 problems)

| ID | Problem | Impact | Frequency |
|----|---------|--------|-----------|
| PC-009 | **Circular dependencies** — Import cycles causing crashes | Unpredictable behavior, memory leaks | Common |
| PC-010 | **God components/files** — 1000+ line monoliths | Untestable, unmaintainable code | Very common |
| PC-011 | **Prop drilling** — Data threaded through 5+ component levels | Brittle coupling, refactoring nightmare | Common |
| PC-012 | **Tight coupling** — Concrete dependencies, no DI | Impossible to test or modify | Very common |

#### 🔴 Category 4: Error Handling Failures (Critical — 3 problems)

| ID | Problem | Impact | Frequency |
|----|---------|--------|-----------|
| PC-013 | **Silent error swallowing** — Empty catch blocks | Impossible debugging, cascading failures | Ubiquitous |
| PC-014 | **Bare try-catch blocks** — No error type differentiation | Wrong error handling, masked bugs | Very common |
| PC-015 | **Missing error boundaries** — React crashes propagate | Entire application crashes | Common |

#### 🔴 Category 5: Security Vulnerabilities (Critical — 6 problems)

| ID | Problem | Impact | Frequency |
|----|---------|--------|-----------|
| PC-016 | **Hardcoded secrets** — API keys in source code | Credential exposure, account takeover | Common |
| PC-017 | **SQL/NoSQL injection** — String-concatenated queries | Data breach, database compromise | Common |
| PC-018 | **Cross-site scripting (XSS)** — Unsanitized user input | Session hijacking, data theft | Common |
| PC-019 | **Missing input validation** — No server-side validation | Data corruption, injection attacks | Very common |
| PC-020 | **Weak security headers** — Missing CSP, HSTS, X-Frame | Transport-layer vulnerabilities | Common |
| PC-021 | **Insecure auth** — JWTs in localStorage, broken RBAC | Authentication bypass | Very common |

#### 🟠 Category 6: Testing Failures (High — 4 problems)

| ID | Problem | Impact | Frequency |
|----|---------|--------|-----------|
| PC-022 | **Missing tests for new code** — No tests generated | Undetected regressions | Ubiquitous |
| PC-023 | **Low test coverage** — Only happy path tested | Edge cases cause production bugs | Very common |
| PC-024 | **Skipped/disabled tests** — `.skip()` and `.only()` | Hidden failures, false confidence | Common |
| PC-025 | **Meaningless test names** — "it works", "test 1" | Unmaintainable test suites | Common |

#### 🟡 Category 7: Performance Problems (Medium-High — 3 problems)

| ID | Problem | Impact | Frequency |
|----|---------|--------|-----------|
| PC-026 | **Bundle bloat** — Entire libraries instead of sub-paths | Slow page loads, poor UX | Common |
| PC-027 | **N+1 query problem** — Queries in loops | Exponential database load | Common |
| PC-028 | **Memory leaks** — Uncleaned listeners, subscriptions | App crashes over time | Common |

#### 🟡 Category 8: Maintainability & Dependency Problems (Medium — 6 problems)

| ID | Problem | Impact | Frequency |
|----|---------|--------|-----------|
| PC-029 | **Dead code** — Unused functions, imports, files | Bloated codebase, confusion | Very common |
| PC-030 | **Magic numbers/strings** — Unnamed literals | Maintenance difficulty | Common |
| PC-031 | **Copy-paste duplication** — Same logic in multiple files | Bug fix nightmare | Common |
| PC-032 | **Inconsistent naming** — Mixed conventions | Readability degradation | Common |
| PC-033 | **Unpinned dependencies** — Version ranges, no lockfiles | Non-reproducible builds | Common |
| PC-034 | **Vulnerable dependencies** — Known CVEs in packages | Security compromise | Common |

### Impact Summary

```
┌──────────────────────────────────────────────────────────────┐
│              AI AGENT PROBLEM SEVERITY DISTRIBUTION           │
├──────────────────────────────────────────────────────────────┤
│  CRITICAL (12): Secrets, Injection, XSS, Auth, Loops,       │
│                 Silent Errors, Input Validation,             │
│                 Missing Tests for Critical Paths              │
│                                                              │
│  HIGH (15):     any type, Circular Deps, God Components,     │
│                 Tight Coupling, Low Coverage, N+1 Queries,   │
│                 Memory Leaks, Fabricated APIs                 │
│                                                              │
│  MEDIUM (7):    Mock Data, Prop Drilling, Dead Code,         │
│                 Bundle Bloat, Magic Numbers, Duplication      │
│                                                              │
│  LOW (0):       —                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛡️ How Deerflow Solves These Problems

Deerflow deploys a **five-layer defense-in-depth system** that catches and prevents problems at every stage of the development lifecycle.

### Layer 1: Rule Enforcement (Point of Generation)

The first line of defense. AI agents are configured with comprehensive rule files that embed quality standards directly into the generation process.

| Component | What It Does |
|-----------|-------------|
| `.cursorrules` | 470 lines of Cursor-specific enforcement rules |
| `.windsurfrules` | 456 lines of Windsurf Cascade-specific rules |
| `CLAUDE.md` | 414 lines of Claude Code-specific rules |
| `.github/copilot-instructions.md` | 447 lines of GitHub Copilot rules |
| `.codex/instructions.md` | 460 lines of OpenAI Codex rules |
| `core/rules/master-rules.md` | 678-line single source of truth with 34 problem categories |

**What's enforced:**
- 15 absolute prohibitions (zero-tolerance rules)
- 5-phase mandatory workflow (Analysis → Planning → Implementation → Verification → Documentation)
- 12 quality metrics with specific thresholds
- Architecture rules (Clean Architecture, SOLID, DI)
- Error handling standards (typed error hierarchy)
- Security standards (OWASP Top 10 compliance)
- 17-item verification checklist

### Layer 2: Agentic Workflow System (Process Enforcement)

A structured 8-phase workflow that agents must follow for every task, with quality gates between each phase.

```
Phase 0: Context Acquisition → Phase 1: Requirement Analysis
    ↓ [Gate 0→1: Requirements Complete]
Phase 2: Architecture Design → Phase 3: Implementation Planning
    ↓ [Gate 2→3: Design Approved]
Phase 4: Code Implementation → Phase 5: Verification & Testing
    ↓ [Gate 4→5: All Tests Pass]
Phase 6: Integration Check → Phase 7: Documentation
    ↓ [Gate 6→7: Docs Complete]
DONE
```

**Key features:**
- **7 quality gates** with pass/fail criteria tables
- **Rollback procedures** with git checkpoints per phase
- **Complexity scoring** for task decomposition
- **Token budget management** for long sessions
- **5 workflow templates** (New Feature, Bug Fix, Refactoring, API Endpoint, Component)

### Layer 3: Skill Verification System (Competency Gating)

A 5-tier skill classification system that ensures agents only work on tasks they're qualified for.

| Tier | Skills | Scope | Verification |
|------|--------|-------|-------------|
| **Tier 1: Foundation** | SK-001 to SK-004 | File safety, dependency management, error prevention, code verification | Automated checks |
| **Tier 2: Intermediate** | SK-005 to SK-008 | Component architecture, API design, state management, testing | Code review |
| **Tier 3: Advanced** | SK-009 to SK-012 | Performance optimization, security, database design, DevOps | Manual audit |
| **Tier 4: Expert** | SK-013 to SK-015 | System architecture, real-time systems, advanced testing | Expert panel |
| **Tier 5: Master** | SK-016 to SK-017 | Technical leadership, innovation | Architecture board |

### Layer 4: MCP Tools Integration (Real-Time Enforcement)

5 Model Context Protocol servers that provide real-time quality enforcement during AI agent sessions.

| Server | Purpose | Key Features |
|--------|---------|-------------|
| `deerflow-enforcer` | Real-time rule enforcement | 10 configurable rules, 34 problem categories |
| `deerflow-linter` | Extended linting | Custom AI-agent anti-pattern rules |
| `deerflow-tester` | Automated testing | Coverage thresholds, mutation testing |
| `deerflow-dependency-guard` | Dependency safety | Version conflicts, license compliance |
| `deerflow-architecture` | Architecture enforcement | Circular dependency detection, layer violations |

### Layer 5: Quality Gates Pipeline (CI/CD Enforcement)

8 parallel CI/CD jobs plus a summary gate that block merging of any code that doesn't meet quality standards.

| Job | What It Checks | Time |
|-----|---------------|------|
| Code Quality | ESLint (0 warnings), Prettier, TypeScript strict | ~3 min |
| Security Audit | npm audit, gitleaks, dependency review, licenses | ~2 min |
| Test Suite | Unit + integration + E2E, 80% coverage | ~10 min |
| Build Verification | Production build, 500KB file limit, tree-shaking | ~5 min |
| Architecture Check | Circular deps (0), layer violations, complexity | ~2 min |
| Accessibility Check | WCAG 2.1 AA, axe-core, image alt, form labels | ~3 min |
| Performance Check | Lighthouse CI, performance budgets | ~5 min |
| Documentation Check | API docs, README consistency, JSDoc coverage | ~2 min |

**Total pipeline time: ~10-15 minutes** (all jobs run in parallel)

### Anti-Pattern Catalog (35 Patterns)

Deerflow catalogs 35 common anti-patterns with detection heuristics, correction procedures, and prevention strategies. Each includes before/after code examples.

| Severity | Count | Examples |
|----------|-------|---------|
| CRITICAL | 8 | Silent file deletion, hardcoded secrets, SQL injection, missing input validation |
| HIGH | 19 | `any` type usage, empty catch blocks, God components, N+1 queries, missing auth |
| MEDIUM | 7 | Prop drilling, over-mocking, unnecessary re-renders, copy-paste duplication |
| LOW | 1 | Premature optimization |

---

## 📐 Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEERFLOW AGENT FRAMEWORK                          │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  AI Agent    │  │  MCP Servers │  │  Quality Gate Pipeline   │   │
│  │  Rules       │──│  (Real-Time) │──│  (CI/CD Enforcement)     │   │
│  │  (.cursor,   │  │              │  │                          │   │
│  │   .windsurf, │  │  • Enforcer  │  │  ┌──────┐ ┌──────┐      │   │
│  │   claude.md)  │  │  • Linter    │  │  │ Lint │ │ Test │ ...  │   │
│  │   .copilot)  │  │  • Tester    │  │  └──────┘ └──────┘      │   │
│  └──────┬──────┘  │  • Dep-Guard  │  └──────────┬───────────────┘   │
│         │         │  • Architect  │             │                   │
│         │         └──────────────┘             │                   │
│         ▼                                      ▼                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    CORE ENGINE                                │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐ │   │
│  │  │ Master     │ │ 8-Phase    │ │ 17 Skills  │ │ 35 Anti-  │ │   │
│  │  │ Rules      │ │ Workflow   │ │ Registry   │ │ Patterns  │ │   │
│  │  │ (34 probs) │ │ Engine     │ │ (5 tiers)  │ │ Catalog   │ │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └───────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│         │                          │                               │
│         ▼                          ▼                               │
│  ┌─────────────┐          ┌────────────────┐                       │
│  │  Security   │          │   Git Hooks    │                       │
│  │  Layer      │          │   (Shift-Left) │                       │
│  │             │          │                │                       │
│  │ • Pre-commit│          │ • pre-commit   │                       │
│  │ • OWASP     │          │ • pre-push     │                       │
│  │ • Gitleaks  │          │ • commit-msg   │                       │
│  │ • Dep audit │          │ • post-merge   │                       │
│  └─────────────┘          └────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
deerflow--agent-framework/
├── .cursorrules                    # Cursor AI rules (470 lines)
├── .windsurfrules                  # Windsurf rules (456 lines)
├── CLAUDE.md                       # Claude Code rules (414 lines)
├── .cursor/rules/                  # Cursor 2026 rules (MDC format)
│   ├── deerflow-core.mdc           # Core rules for Cursor
│   ├── deerflow-security.mdc       # Security rules for Cursor
│   └── deerflow-workflow.mdc       # Workflow rules for Cursor
├── .github/
│   ├── copilot-instructions.md     # GitHub Copilot rules (447 lines)
│   ├── workflows/
│   │   ├── ci.yml                  # Main CI/CD pipeline (8 parallel jobs)
│   │   └── security.yml            # Security scanning workflow
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md           # Bug report template
│   │   ├── feature_request.md      # Feature request template
│   │   └── rule_issue.md           # Agent rule issue template
│   └── PULL_REQUEST_TEMPLATE.md    # PR template
├── .codex/
│   └── instructions.md             # OpenAI Codex rules (460 lines)
├── .editorconfig                   # Editor configuration
├── .prettierrc                     # Prettier configuration
├── .prettierignore                 # Prettier ignore patterns
├── .gitignore                      # Git ignore rules
├── .npmignore                      # npm ignore rules
│
├── core/                           # Core framework modules
│   ├── rules/
│   │   └── master-rules.md         # Single source of truth (678 lines)
│   ├── workflows/
│   │   ├── agentic-workflow.md     # 8-phase workflow system (1,050 lines)
│   │   ├── workflow-engine.ts      # TypeScript workflow state machine (1,342 lines)
│   │   └── task-decomposition.md   # Task decomposition guide (410 lines)
│   ├── skills/
│   │   ├── agent-skills.md         # 17 skills, 5 tiers (756 lines)
│   │   ├── skill-registry.ts       # Skill registry implementation (878 lines)
│   │   └── anti-patterns.md        # 35 anti-patterns catalog (1,125 lines)
│   └── guards/                     # (reserved for future guard modules)
│
├── mcp-tools/                      # Model Context Protocol integrations
│   ├── config.json                 # MCP server configuration (5 servers)
│   └── tools/
│       └── README.md               # MCP tools documentation (528 lines)
│
├── quality-gates/                  # Quality enforcement pipeline
│   ├── ci-cd/
│   │   ├── github-actions.yml      # 8 parallel CI/CD jobs (703 lines)
│   │   └── pipeline-config.json    # Central pipeline configuration (233 lines)
│   ├── linters/
│   │   ├── eslint-rules.js         # Comprehensive ESLint config (420 lines)
│   │   └── tsconfig-strict.json    # Strict TypeScript config (34 lines)
│   ├── testers/
│   │   ├── vitest.config.ts        # Vitest with 80% coverage (50 lines)
│   │   └── test-templates.ts       # 10 test templates (818 lines)
│   └── guards/
│       └── quality-guards.md       # Complete guard reference (529 lines)
│
├── security/                       # Security enforcement
│   ├── security-rules.md           # Security policy (935 lines)
│   ├── pre-commit-config.yaml      # 10 custom + 14 pre-commit hooks (219 lines)
│   ├── .gitleaks.toml              # 32 secret detection rules (234 lines)
│   └── dependency-check.sh         # Dependency audit script (439 lines)
│
├── templates/                      # Project templates
│   ├── nextjs/
│   │   ├── .eslintrc.deerflow.js   # Next.js ESLint config (332 lines)
│   │   ├── tsconfig.deerflow.json  # Next.js TypeScript config (82 lines)
│   │   └── vitest.config.ts        # Next.js Vitest config (110 lines)
│   └── python/
│       └── pyproject.deerflow.toml # Python project template (314 lines)
│
├── scripts/                        # Setup and quality scripts
│   ├── setup.sh                    # Main setup script (739 lines)
│   ├── init-project.sh             # Project scaffolding (713 lines)
│   └── quality-check.sh            # Quality verification (504 lines)
│
├── hooks/                          # Git hooks
│   ├── pre-commit                  # 6-stage pre-commit gate (195 lines)
│   ├── pre-push                    # 7-stage pre-push gate (221 lines)
│   ├── commit-msg                  # Conventional commits enforcement (120 lines)
│   └── post-merge                  # Post-merge quality re-verification (132 lines)
│
├── config/
│   └── deerflow.config.json        # Main configuration (39 lines)
│
├── docs/                           # Documentation
│   ├── PROBLEM_ANALYSIS.md         # Comprehensive problem analysis
│   ├── ARCHITECTURE.md             # Technical architecture document
│   ├── QUICK_START.md              # Step-by-step quick start guide
│   └── CONFIGURATION.md            # Complete configuration reference
│
├── examples/                       # Usage examples
│   ├── CLAUDE.md                   # Claude Code integration example
│   ├── CURSOR.md                   # Cursor integration example
│   └── WINDSURF.md                 # Windsurf integration example
│
├── CHANGELOG.md                    # Version history
├── LICENSE                         # MIT License
└── README.md                       # This file
```

---

## 🤖 Supported AI Agents

**Deerflow works with EVERY AI coding agent — no exceptions.** The framework provides dedicated rule files for the most popular agents, plus a universal master rules document that works with any current or future AI agent.

| Agent | Rule File | Lines | Status | Features |
|-------|-----------|-------|--------|----------|
| **Cursor** | `.cursorrules` + `.cursor/rules/*.mdc` | 470 + 3 MDC | ✅ Full Support | File operations, multi-file editing, agent mode, Cursor 2026 |
| **Windsurf** | `.windsurfrules` | 456 | ✅ Full Support | Cascade flow rules, context management |
| **Claude Code** | `CLAUDE.md` | 414 | ✅ Full Support | Tool usage rules, file operation safety |
| **GitHub Copilot** | `.github/copilot-instructions.md` | 447 | ✅ Full Support | Code completion rules, chat rules |
| **OpenAI Codex** | `.codex/instructions.md` | 460 | ✅ Full Support | Code generation rules, context awareness |
| **Any Other Agent** | `core/rules/master-rules.md` | 678 | ✅ Universal | Paste into ANY agent's system prompt |

> **Not limited to the list above.** The `master-rules.md` is the single source of truth containing all 34 problem categories, quality standards, and enforcement rules. It works with **any** AI coding agent — Zed, Void, PearAI, Amp, Cline, Continue.dev, Tabnine, Codeium, Amazon Q, or any future agent. Simply paste it into the agent's system prompt or rules configuration.

### Agent-Specific Highlights

**Cursor**: Includes rules for multi-file editing sessions, agent mode constraints, `.cursorrules`-specific directives, and Cursor 2026 MDC format rules (`.cursor/rules/*.mdc`).

**Windsurf (Cascade)**: Includes Cascade Flow Rules that enforce phase-by-phase progression, Context Management directives for long sessions, and Cascade-specific anti-patterns.

**Claude Code**: Includes Tool Usage Rules that govern how Claude interacts with the file system, Terminal Rules for command execution safety, and Response Quality directives.

**GitHub Copilot**: Includes Code Completion Rules that ensure inline suggestions meet quality standards, Copilot Chat Rules for interactive sessions, and workspace-wide enforcement directives.

**OpenAI Codex**: Includes Code Generation Rules with API-specific constraints, Context Awareness directives for maintaining consistency across generations, and Sandbox execution rules.

**Any Other Agent**: Simply paste the contents of `core/rules/master-rules.md` into the agent's system prompt, instructions, or rules configuration. All 34 problem categories, quality gates, and enforcement rules apply universally.

---

## 📊 Quality Metrics

Deerflow enforces these quality metrics across all projects. These are not suggestions — they are **hard requirements** enforced by automated tools.

### Code Quality

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| TypeScript strict mode | ALWAYS enabled | Compiler |
| ESLint warnings | 0 | Pre-commit + CI |
| ESLint errors | 0 | Pre-commit + CI |
| Function length | Max 50 lines | ESLint |
| File length | Max 300 lines | ESLint + CI |
| Component length | Max 200 lines | ESLint + CI |
| Cyclomatic complexity | Max 10 | ESLint |
| Nesting depth | Max 4 | ESLint |
| Parameters per function | Max 5 | ESLint |

### Testing

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Unit test coverage | ≥ 80% (all metrics) | CI/CD |
| Integration test coverage | ≥ 60% | CI/CD |
| E2E tests | Critical user flows | CI/CD |
| Mutation testing score | ≥ 70% | CI/CD |
| Skipped tests | 0 | CI/CD |

### Security

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Critical vulnerabilities | 0 | CI/CD + pre-commit |
| High vulnerabilities | 0 | CI/CD |
| Secrets in code | 0 | Pre-commit (gitleaks) |
| OWASP Top 10 compliance | 100% | Rules + CI |

### Performance

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Lighthouse Performance | ≥ 90 | CI/CD (PR) |
| Lighthouse Accessibility | ≥ 90 | CI/CD (PR) |
| Bundle size (per file) | Max 500KB | CI/CD |
| Initial JS load | Max 200KB gzipped | CI/CD |
| Largest Contentful Paint | < 2,500ms | CI/CD (PR) |

### Architecture

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Circular dependencies | 0 | CI/CD (madge) |
| Layer violations | 0 | CI/CD |
| Coupling (module deps) | Max 5 | CI/CD |
| Classes per file | Max 1 | ESLint |

---

## 🚀 Key Features

### 1. Five-Level Enforcement Hierarchy

```
Level 1: Automated Tools   → ESLint, TypeScript, Prettier (continuous)
Level 2: Pre-commit Hooks  → Shift-left quality (< 5 seconds)
Level 3: CI/CD Pipeline    → Comprehensive gates (~10 minutes)
Level 4: Code Review       → Human validation
Level 5: AI Agent Rules    → Point-of-generation enforcement
```

### 2. 8-Phase Agentic Workflow

```
Phase 0: Context Acquisition → Read everything, understand architecture
Phase 1: Requirement Analysis → FR/NFR numbering, use cases, acceptance criteria
Phase 2: Architecture Design → Component architecture, interfaces, data models
Phase 3: Implementation Planning → Atomic task decomposition, dependency mapping
Phase 4: Code Implementation → One file at a time, micro-verification
Phase 5: Verification & Testing → 9-step verification, all checks pass
Phase 6: Integration Check → Import resolution, orphaned files, cross-component tests
Phase 7: Documentation → API docs, CHANGELOG, migration notes
```

### 3. Workflow Engine (TypeScript)

A full state machine implementation (`core/workflows/workflow-engine.ts`) with:

- Phase transitions with status tracking (PENDING → IN_PROGRESS → PASSED_GATE → COMPLETED)
- Quality gate evaluation with severity-based criteria
- Task management with topological sorting and dependency resolution
- Complexity scoring for task decomposition
- Checkpoint and rollback capabilities
- JSON serialization for session persistence

### 4. Skill Registry (TypeScript)

A comprehensive skill management system (`core/skills/skill-registry.ts`) with:

- Skill registration with circular dependency detection
- Verification with automatic status determination
- Hard gates, soft gates, and tier gates
- Proficiency scoring with per-tier breakdowns
- Degradation detection (time-based, audit-based)
- Learning path generation

### 5. Security at Every Layer

- **Pre-commit**: 21 secret patterns, dangerous file blocking, gitleaks integration
- **CI/CD**: npm audit, dependency review, license compliance
- **Code Level**: OWASP Top 10 ESLint rules, no-unsafe-regex, no-child-process
- **Infrastructure**: Docker best practices, Vault integration, mTLS
- **Incident Response**: 4-level classification (SEV-1 to SEV-4), response procedures

### 6. Comprehensive Pre-commit Hooks

- **Pre-commit** (6 stages): File safety → Secrets → ESLint → TypeScript → Prettier → File size
- **Pre-push** (7 stages): Lint → Types → Tests (80% coverage) → Build → Audit → Gitleaks → Architecture
- **Commit-msg**: Conventional Commits format with 11 valid types
- **Post-merge**: Full quality re-verification after merge

---

## 📚 Documentation

| Document | Description | Words |
|----------|-------------|-------|
| [README.md](README.md) | Main project documentation (this file) | 3,500+ |
| [Problem Analysis](docs/PROBLEM_ANALYSIS.md) | Comprehensive analysis of all 34+ problems | 3,000+ |
| [Architecture](docs/ARCHITECTURE.md) | Technical architecture deep-dive | 2,000+ |
| [Quick Start](docs/QUICK_START.md) | Step-by-step setup guide | 1,500+ |
| [Configuration](docs/CONFIGURATION.md) | Complete configuration reference | 1,500+ |
| [Claude Example](examples/CLAUDE.md) | Using Deerflow with Claude Code | — |
| [Cursor Example](examples/CURSOR.md) | Using Deerflow with Cursor | — |
| [Windsurf Example](examples/WINDSURF.md) | Using Deerflow with Windsurf | — |

---

## ⚙️ Configuration

Deerflow is configured through `config/deerflow.config.json`:

```json
{
  "version": "1.0.0",
  "framework": "deerflow",
  "strictMode": true,
  "rules": {
    "maxFileLines": 300,
    "maxFunctionLines": 50,
    "maxCyclomaticComplexity": 10,
    "maxNestingDepth": 4,
    "maxCoupling": 5,
    "maxComponentLines": 200,
    "forbidAnyType": true,
    "forbidMockData": true,
    "requireJSDoc": true,
    "enforceSolid": true,
    "enforceCleanArchitecture": true,
    "minTestCoverage": 80,
    "zeroLintWarnings": true
  },
  "security": {
    "owaspCompliance": true,
    "secretsDetection": true,
    "dependencyAudit": true,
    "licenseCompliance": true
  },
  "workflow": {
    "mandatoryPhases": true,
    "qualityGates": true,
    "requireDocumentation": true,
    "requireTesting": true
  },
  "ai": {
    "enforceWorkflow": true,
    "requireDeepAnalysis": true,
    "verifyBeforeWrite": true,
    "atomicChanges": true,
    "maxBatchEdits": 5
  }
}
```

See the [Configuration Guide](docs/CONFIGURATION.md) for full details on all options.

---

## 🛠️ Development

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0 (or pnpm/yarn)
- **git** ≥ 2.30.0

### Setup

```bash
# Clone the repository
git clone https://github.com/ntd25022006q/deerflow--agent-framework.git
cd deerflow--agent-framework

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Verify the installation
./scripts/quality-check.sh
```

### Scripts

| Script | Description |
|--------|-------------|
| `./scripts/setup.sh` | Main setup — configures everything for your AI editor |
| `./scripts/init-project.sh` | Scaffold new projects with Deerflow enforcement |
| `./scripts/quality-check.sh` | Run all quality checks |
| `./scripts/quality-check.sh --full` | Full audit with all checks |
| `./scripts/quality-check.sh --security` | Security-only audit |
| `./scripts/quality-check.sh --architecture` | Architecture-only check |

### CLI Flags (setup.sh)

| Flag | Description |
|------|-------------|
| `--ci` | Configure GitHub Actions CI/CD pipeline |
| `--security` | Enable security hooks and scanning |
| `--skip-prompts` | Skip interactive prompts, use defaults |
| `--editor=<name>` | Specify AI editor (cursor/windsurf/claude/copilot/codex/all) |
| `--type=<name>` | Project type for init (nextjs/react/node/python/fullstack) |
| `--help` | Show help message |

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Contribution Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Make** your changes following all Deerflow rules
4. **Run** quality checks: `./scripts/quality-check.sh --full`
5. **Commit** using Conventional Commits: `feat(scope): description`
6. **Push** to your fork: `git push origin feature/your-feature-name`
7. **Open** a Pull Request with a clear description

### Commit Convention

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Code Review Requirements

- All PRs require at least 1 approval
- All quality gates must pass
- No Critical or High severity violations
- Changes must include tests where applicable
- Documentation must be updated for user-facing changes

### Reporting Issues

When reporting issues, please include:

- Deerflow version
- AI agent and version
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Relevant log output

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Deerflow Agent Framework

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

**Built with strict standards for reliable AI-assisted development.**

[⬆ Back to Top](#-deerflow-agent-framework)

</div>
