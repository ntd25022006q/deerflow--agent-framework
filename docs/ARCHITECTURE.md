# DEERFLOW AGENT FRAMEWORK — Architecture Document

> **Version:** 1.0.0  
> **Last Updated:** 2025-01-10  
> **Author:** Deerflow Agent Framework Team  
> **Classification:** Technical Reference  
> **Audience:** Framework contributors, system integrators, DevOps engineers

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Principles](#2-design-principles)
3. [System Architecture](#3-system-architecture)
4. [Core Modules](#4-core-modules)
5. [Enforcement Pipeline](#5-enforcement-pipeline)
6. [Data Flow](#6-data-flow)
7. [Integration Points](#7-integration-points)
8. [Technology Stack](#8-technology-stack)
9. [Extensibility](#9-extensibility)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. Overview

The Deerflow Agent Framework is a multi-layered enforcement system designed to transform any AI coding agent into a disciplined, quality-focused engineer. The architecture follows a **defense-in-depth** model where multiple independent enforcement layers work together to prevent, detect, and remediate code quality problems.

### Architecture Goals

| Goal | Description |
|------|-------------|
| **Universal Compatibility** | Work with any AI coding agent (Cursor, Windsurf, Claude Code, Copilot, Codex, etc.) |
| **Zero Runtime Overhead** | No runtime dependencies in the target project — enforcement is at generation/CI time |
| **Progressive Strictness** | Configurable from advisory to strict enforcement modes |
| **Fail-Safe Defaults** | Default configuration blocks all known problem categories |
| **Minimal Intrusion** | Agents can use their normal workflow — Deerflow constrains, not replaces |

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI CODING AGENT LAYER                        │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐   │
│  │ Cursor  │ │Windsurf │ │Claude Code│ │ Copilot │ │  Codex   │   │
│  └────┬────┘ └────┬────┘ └────┬─────┘ └────┬────┘ └────┬─────┘   │
│       │           │           │             │           │          │
│  ┌────▼───────────▼───────────▼─────────────▼───────────▼─────┐   │
│  │              AGENT RULE FILES (Point of Generation)          │   │
│  │  .cursorrules │ .windsurfrules │ .clinerules │ copilot │ codex│   │
│  └──────────────────────────┬─────────────────────────────────┘   │
└─────────────────────────────┼─────────────────────────────────────┘
                              │ derives from
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE ENGINE                                  │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   MASTER RULES   │  │  AGENTIC WORKFLOW│  │   SKILL SYSTEM   │  │
│  │                  │  │                  │  │                  │  │
│  │ • 34 Problem     │  │ • 8 Phases       │  │ • 5 Tiers        │  │
│  │   Categories     │  │ • 7 Quality Gates│  │ • 17 Skills      │  │
│  │ • 4 Severity     │  │ • 24 Anti-patterns│ │ • Registry +     │  │
│  │   Levels         │  │ • 5 Templates    │  │   Gating        │  │
│  │ • 15 Prohibitions│  │ • State Machine  │  │ • 35 Anti-patterns│ │
│  │ • Governance     │  │ • Checkpoint/RB  │  │ • Verification   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    SHARED TYPES & UTILITIES                    │  │
│  │  Severity Enums │ Phase Types │ Task Interfaces │ Error Classes │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ configures
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ENFORCEMENT LAYER                               │
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │MCP SERVERS │  │GIT HOOKS   │  │QUALITY GATES│  │SECURITY    │  │
│  │            │  │            │  │            │  │            │  │
│  │• Enforcer  │  │• pre-commit│  │• ESLint    │  │• Gitleaks  │  │
│  │• Linter    │  │• pre-push  │  │• TypeScript│  │• Pre-commit│  │
│  │• Tester    │  │• commit-msg│  │• Vitest    │  │• Dep audit │  │
│  │• Dep-Guard │  │• post-merge│  │• Bundle    │  │• OWASP     │  │
│  │• Architect │  │            │  │• Madge     │  │• Headers   │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE (GitHub Actions)                   │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  Code    │ │ Security │ │   Test   │ │  Build   │               │
│  │  Quality │ │  Audit   │ │  Suite   │ │  Verify  │               │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘               │
│       │            │            │            │                       │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐               │
│  │  Arch    │ │    A11y  │ │  Perf    │ │   Docs   │               │
│  │  Check   │ │  Check   │ │  Check   │ │  Check   │               │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘               │
│       └────────────┴────────────┴────────────┘                       │
│                         │                                           │
│                   ┌─────▼─────┐                                     │
│                   │  SUMMARY  │                                     │
│                   │   GATE    │                                     │
│                   └───────────┘                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Principles

### 2.1 Defense in Depth

No single enforcement mechanism is sufficient. Deerflow uses five independent layers, each capable of catching problems independently. A problem that slips through one layer is likely caught by the next.

```
Layer 1: Agent Rules (point of generation)     → Prevents 60-80% of problems
Layer 2: Workflow Process (phase gates)         → Prevents 10-20% of problems
Layer 3: Git Hooks (pre-commit/pre-push)        → Catches 5-15% of problems
Layer 4: CI/CD Pipeline (comprehensive gates)   → Catches 5-15% of problems
Layer 5: Code Review (human judgment)           → Catches remaining edge cases
```

### 2.2 Fail-Safe Defaults

All default configurations are set to the most restrictive option. This means new projects get maximum protection out of the box. Teams can relax specific rules after careful consideration, but they must explicitly opt out of protection.

### 2.3 Single Source of Truth

All tool-specific rule files (`.cursorrules`, `.windsurfrules`, etc.) are derived from `core/rules/master-rules.md`. Changes to the master rules must be propagated to all derived files. In case of conflict, the master rules take precedence.

### 2.4 Zero Runtime Overhead

Deerflow does not inject runtime dependencies into the target project. All enforcement happens at:
- **Generation time** (agent rules)
- **Commit time** (git hooks)
- **Build time** (CI/CD)
- **Review time** (human code review)

This means Deerflow has zero impact on production performance, bundle size, or application behavior.

### 2.5 Progressive Strictness

Deerflow supports two enforcement modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Strict** (default) | All rules enforced as errors, CI/CD blocks on any violation | Production projects, teams |
| **Advisory** | Rules generate warnings but don't block | Prototyping, learning, migration |

---

## 3. System Architecture

### 3.1 Module Organization

The framework is organized into seven top-level modules, each with a clear responsibility:

```
deerflow-agent-framework/
│
├── core/                    # Framework brain — rules, workflow, skills
│   ├── rules/               # Rule definitions (single source of truth)
│   ├── workflows/           # Workflow engine and templates
│   └── skills/              # Skill system and anti-pattern catalog
│
├── mcp-tools/               # MCP server integrations (real-time enforcement)
├── quality-gates/           # Quality enforcement pipeline
│   ├── ci-cd/               # GitHub Actions workflows
│   ├── linters/             # ESLint, TypeScript configs
│   ├── testers/             # Vitest, test templates
│   └── guards/              # Quality guard definitions
│
├── security/                # Security enforcement
├── templates/               # Project scaffolding templates
├── scripts/                 # Setup and quality scripts
├── hooks/                   # Git hooks
├── config/                  # Framework configuration
├── docs/                    # Documentation
└── examples/                # Agent-specific examples
```

### 3.2 Rule Derivation Hierarchy

```
┌─────────────────────────────────┐
│     MASTER RULES (SSOT)         │  core/rules/master-rules.md
│     34 problems, 4 severities   │  678 lines, version-controlled
├─────────────────────────────────┤
│  ┌─────────┐ ┌────────┐ ┌─────┐│
│  │.cursor  │ │.windsurf│ │.cline││  Tool-specific rule files
│  │ rules   │ │ rules   │ │rules││  447-470 lines each
│  └─────────┘ └────────┘ └─────┘│
│  ┌─────────┐ ┌────────────────┐│
│  │copilot  │ │.codex          ││
│  │instr.   │ │instructions    ││
│  └─────────┘ └────────────────┘│
├─────────────────────────────────┤
│  PROJECT-SPECIFIC OVERRIDES     │  .deerflow/rules.local.json
│  (optional, documented)         │  Per-project customization
├─────────────────────────────────┤
│  AUTOMATED ENFORCEMENT          │  ESLint, TypeScript, Prettier
│  (derived from rules)           │  Enforced in CI/CD and hooks
└─────────────────────────────────┘
```

### 3.3 Configuration Flow

```
deerflow.config.json
       │
       ├──→ scripts/setup.sh      (setup uses config values)
       ├──→ scripts/quality-check.sh (quality thresholds from config)
       ├──→ quality-gates/ci-cd/pipeline-config.json (CI/CD thresholds)
       ├──→ mcp-tools/config.json (MCP server environment variables)
       └──→ All rule files        (quality metrics embedded)
```

---

## 4. Core Modules

### 4.1 Master Rules (`core/rules/`)

The master rules module is the single source of truth for all quality standards, problem definitions, and enforcement policies.

**Key Components:**

| Component | File | Purpose |
|-----------|------|---------|
| Master Rules | `master-rules.md` | 34 problem categories, severity framework, enforcement mechanisms |
| Governance | Within master-rules.md | Rule hierarchy, amendment process, compliance monitoring |

**Key Data Structures:**

- **Problem Category** (PC-001 through PC-034): Each category includes severity, description, root cause, prevention strategy
- **Severity Level** (Critical/High/Medium/Low): Each with specific SLAs and response requirements
- **Enforcement Mechanism** (5 levels): Automated → Pre-commit → CI/CD → Human Review → AI Agent

### 4.2 Workflow Engine (`core/workflows/`)

The workflow engine implements the 8-phase agentic workflow as a TypeScript state machine.

**Key Components:**

| Component | File | Purpose |
|-----------|------|---------|
| Workflow Document | `agentic-workflow.md` | Complete workflow specification (8 phases, 7 gates, 24 anti-patterns) |
| Workflow Engine | `workflow-engine.ts` | TypeScript state machine implementation (1,342 lines) |
| Task Decomposition | `task-decomposition.md` | Complexity scoring and sub-task management |

**State Machine:**

```typescript
enum WorkflowPhase {
  CONTEXT_ACQUISITION = 0,  // Read everything
  REQUIREMENT_ANALYSIS = 1, // FR/NFR, use cases
  ARCHITECTURE_DESIGN = 2,  // Components, interfaces
  IMPLEMENTATION_PLANNING = 3, // Task decomposition
  CODE_IMPLEMENTATION = 4,  // Write code
  VERIFICATION_TESTING = 5, // Test and verify
  INTEGRATION_CHECK = 6,    // Cross-component verification
  DOCUMENTATION = 7,        // Docs and changelog
}

enum PhaseStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED_GATE = 'passed_gate',
  FAILED_GATE = 'failed_gate',
  ROLLED_BACK = 'rolled_back',
}
```

**Quality Gates:**

Each transition between phases requires passing a quality gate. Gates have severity-based criteria:

- **CRITICAL criteria**: Must pass — blocking failure
- **HIGH criteria**: Must pass — blocking failure
- **MEDIUM criteria**: Should pass — warning tracked

### 4.3 Skill System (`core/skills/`)

The skill system defines competencies required for AI agents to perform tasks at different complexity levels.

**Key Components:**

| Component | File | Purpose |
|-----------|------|---------|
| Skill Definitions | `agent-skills.md` | 17 skills across 5 tiers (756 lines) |
| Skill Registry | `skill-registry.ts` | TypeScript implementation with gating and verification (878 lines) |
| Anti-Pattern Catalog | `anti-patterns.md` | 35 anti-patterns with detection and correction (1,125 lines) |

**Tier System:**

```
Tier 5 (Master)    ←─ SK-016, SK-017 (Technical Leadership, Innovation)
Tier 4 (Expert)    ←─ SK-013, SK-014, SK-015 (System Architecture, Real-time, Advanced Testing)
Tier 3 (Advanced)  ←─ SK-009, SK-010, SK-011, SK-012 (Performance, Security, Database, DevOps)
Tier 2 (Intermediate) ←─ SK-005, SK-006, SK-007, SK-008 (Components, API, State, Testing)
Tier 1 (Foundation) ←─ SK-001, SK-002, SK-003, SK-004 (File Safety, Deps, Error Prevention, Verification)
```

**Skill Gating:**

The registry enforces skill prerequisites using a topological sort of the skill dependency graph:

```typescript
interface GatingResult {
  allowed: boolean;
  missingSkills: string[];
  warnings: string[]; // Optional skills not yet verified
}
```

---

## 5. Enforcement Pipeline

### 5.1 Five-Level Enforcement Model

```
Developer writes code
        │
        ▼
┌───────────────────────────────────────────┐
│ Level 1: AI AGENT RULES                   │
│ Point of generation enforcement            │
│ Prevents: 60-80% of problems               │
│ Latency: 0ms (rules are consulted by agent)│
├───────────────────────────────────────────┤
│ Level 2: WORKFLOW PROCESS                  │
│ Phase gates block premature progression    │
│ Prevents: 10-20% of problems               │
│ Latency: Seconds (agent processes phases)  │
├───────────────────────────────────────────┤
│ Level 3: GIT HOOKS                         │
│ Pre-commit and pre-push gates              │
│ Catches: 5-15% of problems                 │
│ Latency: < 5 seconds (pre-commit)          │
├───────────────────────────────────────────┤
│ Level 4: CI/CD PIPELINE                    │
│ 8 parallel jobs + summary gate             │
│ Catches: 5-15% of problems                 │
│ Latency: 10-15 minutes                     │
├───────────────────────────────────────────┤
│ Level 5: CODE REVIEW                       │
│ Human validation of all PRs                │
│ Catches: Remaining edge cases              │
│ Latency: Hours (review cycle)              │
└───────────────────────────────────────────┘
```

### 5.2 Pre-commit Hook Pipeline

```
Staged Files
    │
    ▼
┌─────────────────────┐
│  1. FILE SAFETY     │  Check for dangerous files (.exe, .pem, .key)
│     (~0.1s)         │  Verify no protected directory deletions
├─────────────────────┤
│  2. SECRETS DETECT  │  Scan for 21 secret patterns
│     (~0.5s)         │  AWS, GitHub, Stripe, Google, generic creds
├─────────────────────┤
│  3. ESLINT          │  Lint staged files with 0 warnings tolerance
│     (~2s)           │  200+ rules including security and complexity
├─────────────────────┤
│  4. TYPESCRIPT      │  Type check staged files
│     (~2s)           │  Strict mode with zero errors
├─────────────────────┤
│  5. PRETTIER        │  Format staged files
│     (~0.5s)         │  Auto-fix with consistent configuration
├─────────────────────┤
│  6. FILE SIZE       │  Check for files exceeding 300 lines
│     (~0.1s)         │  Flag oversized files
└─────────────────────┘
    │
    ▼
  COMMIT ALLOWED
```

### 5.3 Pre-push Hook Pipeline

```
Push Attempt
    │
    ▼
┌─────────────────────┐
│  1. LINT            │  Full ESLint on entire project
│     (~3s)           │  0 warnings, 0 errors
├─────────────────────┤
│  2. TYPE CHECK      │  Full TypeScript compilation
│     (~5s)           │  Strict mode, zero errors
├─────────────────────┤
│  3. TESTS           │  Unit + integration tests
│     (~30s)          │  Coverage ≥ 80%, no skipped tests
├─────────────────────┤
│  4. BUILD           │  Production build
│     (~30s)          │  Zero errors, bundle size check
├─────────────────────┤
│  5. SECURITY AUDIT  │  npm audit + gitleaks
│     (~10s)          │  0 critical/high vulnerabilities
├─────────────────────┤
│  6. ARCHITECTURE    │  Circular deps + complexity
│     (~5s)           │  Madge + dependency-cruiser
├─────────────────────┤
│  7. BUNDLE SIZE     │  Per-file and total size
│     (~5s)           │  Max 500KB per file, 500MB total
└─────────────────────┘
    │
    ▼
  PUSH ALLOWED
```

---

## 6. Data Flow

### 6.1 Configuration Data Flow

```
deerflow.config.json (source of truth)
         │
         ├──→ setup.sh ──→ Copies rule files, installs tools
         │
         ├──→ quality-gates/ci-cd/pipeline-config.json ──→ GitHub Actions thresholds
         │
         ├──→ quality-gates/linters/eslint-rules.js ──→ ESLint rule values
         │
         ├──→ quality-gates/linters/tsconfig-strict.json ──→ TypeScript compiler options
         │
         ├──→ quality-gates/testers/vitest.config.ts ──→ Coverage thresholds
         │
         ├──→ mcp-tools/config.json ──→ MCP server environment variables
         │
         └──→ All rule files ──→ Quality metric values embedded in agent rules
```

### 6.2 Enforcement Data Flow

```
AI Agent generates code
         │
         ▼
Agent Rule Files (consulted during generation)
         │
         ▼
Developer stages files (git add)
         │
         ▼
Pre-commit Hook
    ├── Reads: staged file list
    ├── Runs: ESLint, TypeScript, Prettier, secrets scan
    ├── Generates: pass/fail with error details
    └── Blocks: commit on failure
         │
         ▼ (commit succeeds)
Developer pushes (git push)
         │
         ▼
Pre-push Hook
    ├── Reads: project files
    ├── Runs: Full lint, types, tests, build, security, architecture
    ├── Generates: pass/fail with detailed report
    └── Blocks: push on failure
         │
         ▼ (push succeeds)
GitHub Actions CI/CD
    ├── Reads: project files + config
    ├── Runs: 8 parallel jobs (quality, security, tests, build, arch, a11y, perf, docs)
    ├── Aggregates: Summary gate
    ├── Generates: Artifacts + reports
    └── Blocks: merge on failure
         │
         ▼ (all checks pass)
Code Review + Merge
```

---

## 7. Integration Points

### 7.1 AI Agent Integration

Each AI agent integrates through a dedicated rule file placed in the project root:

| Agent | Integration Point | Format |
|-------|------------------|--------|
| Cursor | `.cursorrules` | Markdown with special directives |
| Windsurf | `.windsurfrules` | Markdown with Cascade directives |
| Claude Code | `.clinerules` | Markdown with tool-specific directives |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| OpenAI Codex | `.codex/instructions.md` | Markdown |

### 7.2 MCP Server Integration

MCP (Model Context Protocol) servers provide real-time enforcement during AI agent sessions. Servers are configured in `mcp-tools/config.json`:

```json
{
  "mcpServers": {
    "deerflow-enforcer": { "command": "npx", "args": ["-y", "deerflow-mcp-server"] },
    "deerflow-linter": { "command": "npx", "args": ["-y", "deerflow-mcp-linter"] },
    "deerflow-tester": { "command": "npx", "args": ["-y", "deerflow-mcp-tester"] },
    "deerflow-dependency-guard": { "command": "npx", "args": ["-y", "deerflow-mcp-dep-guard"] },
    "deerflow-architecture": { "command": "npx", "args": ["-y", "deerflow-mcp-arch"] }
  }
}
```

### 7.3 CI/CD Integration

The GitHub Actions workflow (`quality-gates/ci-cd/github-actions.yml`) is designed to be:

- **Self-contained**: Runs on any GitHub repository with Node.js
- **Parallel**: 8 jobs run concurrently for speed
- **Configurable**: All thresholds in `pipeline-config.json`
- **Report-generating**: Produces artifacts for every check

---

## 8. Technology Stack

### 8.1 Framework Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.0.0 | Runtime for all scripts and tools |
| ESLint | 9.x | Static analysis and linting |
| TypeScript | 5.x | Type checking |
| Prettier | 3.x | Code formatting |
| Vitest | 1.x | Testing framework |
| Husky | 9.x | Git hooks management |
| lint-staged | 15.x | Staged file linting |
| Madge | 6.x | Circular dependency detection |
| dependency-cruiser | 16.x | Architecture enforcement |
| gitleaks | 8.x | Secret detection |

### 8.2 Security Tools

| Tool | Purpose |
|------|---------|
| gitleaks | Git history secret scanning (32 patterns) |
| detect-secrets | Yelp's secret detection baseline |
| npm audit | Node.js dependency vulnerability scanning |
| @security | ESLint security plugin family |

### 8.3 CI/CD Stack

| Component | Technology |
|-----------|-----------|
| CI/CD Platform | GitHub Actions |
| Artifact Storage | GitHub Actions Artifacts |
| Coverage | V8 (via Vitest) |
| Code Coverage Reports | Codecov (optional) |
| Notifications | Slack / GitHub (optional) |

---

## 9. Extensibility

### 9.1 Adding New Problem Categories

New problem categories can be added to `core/rules/master-rules.md`:

1. Assign the next PC-NNN identifier
2. Define severity level
3. Document symptom, root cause, impact, frequency
4. Define prevention strategy
5. Map to enforcement mechanism(s)
6. Propagate to all tool-specific rule files

### 9.2 Adding New MCP Servers

New MCP servers can be added to `mcp-tools/config.json`:

1. Create the MCP server package
2. Add configuration to `config.json`
3. Document in `mcp-tools/tools/README.md`
4. Add to setup script installation

### 9.3 Adding New Project Templates

New project templates can be added to `templates/`:

1. Create template directory (e.g., `templates/vue/`)
2. Add ESLint, TypeScript, and testing configurations
3. Add template to `scripts/init-project.sh`
4. Document the template

### 9.4 Custom Rules

Teams can add project-specific rules by:

1. Creating `.deerflow/rules.local.json`
2. Adding project-specific ESLint rules
3. Extending the CI/CD pipeline with custom jobs
4. Adding custom pre-commit hooks

---

## 10. Deployment Architecture

### 10.1 Framework Distribution

Deerflow is distributed as a Git repository that teams clone and configure:

```
git clone → setup.sh → configured project
```

The framework itself has zero runtime dependencies in the target project. All enforcement is at generation/CI time.

### 10.2 Recommended Project Integration

```
your-project/
├── .cursorrules          ← Copied from Deerflow during setup
├── .windsurfrules        ← Copied from Deerflow during setup
├── .clinerules           ← Copied from Deerflow during setup
├── .github/
│   ├── copilot-instructions.md  ← Copied from Deerflow during setup
│   └── workflows/
│       └── deerflow-quality.yml ← Copied from Deerflow CI/CD
├── .husky/               ← Configured by Deerflow setup
│   ├── pre-commit        ← Deerflow pre-commit hook
│   ├── pre-push          ← Deerflow pre-push hook
│   ├── commit-msg        ← Deerflow commit-msg hook
│   └── post-merge        ← Deerflow post-merge hook
├── .eslintrc.js          ← Extended with Deerflow config
├── tsconfig.json         ← Extended with Deerflow strict config
├── vitest.config.ts      ← Extended with Deerflow test config
├── .prettierrc           ← Deerflow formatting rules
├── .pre-commit-config.yaml  ← Deerflow pre-commit hooks
├── deerflow.config.json  ← Deerflow configuration (optional)
└── .deerflow/            ← Deerflow state directory
    ├── quality-gates.json ← Quality gate results
    ├── reports/           ← Quality check reports
    └── metrics/           ← Baseline metrics
```

### 10.3 Maintenance Model

| Activity | Frequency | Responsibility |
|----------|-----------|---------------|
| Rule updates | As needed | Framework maintainers |
| Template updates | Quarterly | Framework maintainers |
| Tool version updates | Monthly | Team (via setup.sh) |
| Quality metric review | Quarterly | Team lead |
| Security audit | Monthly | Security team |

---

*This document is part of the Deerflow Agent Framework. For the rule definitions referenced in this architecture, see `core/rules/master-rules.md`. For the workflow specification, see `core/workflows/agentic-workflow.md`.*
