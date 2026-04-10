# DEERFLOW MCP TOOLS v1.0
## Model Context Protocol Integration for AI-Agent Enforced Code Quality

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tool 1: deerflow-enforcer](#tool-1-deerflow-enforcer)
4. [Tool 2: deerflow-linter](#tool-2-deerflow-linter)
5. [Tool 3: deerflow-tester](#tool-3-deerflow-tester)
6. [Tool 4: deerflow-dependency-guard](#tool-4-deerflow-dependency-guard)
7. [Tool 5: deerflow-architecture](#tool-5-deerflow-architecture)
8. [Installation Instructions](#installation-instructions)
9. [Configuration Guide](#configuration-guide)
10. [Troubleshooting](#troubleshooting)
11. [Extending the Toolchain](#extending-the-toolchain)
12. [Version History](#version-history)

---

## Overview

The Deerflow MCP Tools suite is a collection of five Model Context Protocol (MCP) servers that work in concert to enforce the Deerflow Agent Framework's rigorous code quality, security, and architectural standards. Unlike traditional linters or CI/CD pipelines that operate as post-hoc checks, these MCP tools integrate directly into the AI agent's development loop, providing real-time feedback and enforcement at the moment of code generation and modification.

MCP (Model Context Protocol) is a standardized protocol that enables AI coding assistants — such as Claude, Cursor, Windsurf, and GitHub Copilot — to communicate with external tools and services. By packaging our enforcement rules as MCP servers, we ensure that every AI agent operating within the Deerflow framework has immediate, programmatic access to all quality gates, security checks, and architectural validations without relying on the agent's internal knowledge or instruction-following capability.

### How MCP Tools Enforce Deerflow Framework Rules

The enforcement model follows a multi-layered approach:

1. **Proactive Enforcement**: The enforcer server intercepts file operations before they complete, validating each change against the full rule set in real time.
2. **Static Analysis**: The linter server performs deep code analysis beyond what standard ESLint or TypeScript compiler checks provide, detecting anti-patterns specific to AI-generated code.
3. **Verification**: The tester server automatically generates and executes tests, verifying that every change meets coverage thresholds and behavioral expectations.
4. **Supply Chain Security**: The dependency-guard server monitors and validates every dependency in the project, blocking vulnerable or non-compliant packages.
5. **Architectural Integrity**: The architecture server continuously validates the project's dependency graph against Clean Architecture principles, detecting coupling violations and circular dependencies.

Each tool operates independently but shares a common configuration schema, logging format, and violation reporting standard. Violations are classified using the four-tier severity framework defined in the Deerflow master rules: Critical, High, Medium, and Low.

### Why MCP Instead of Traditional Tooling?

Traditional enforcement relies on linting rules, pre-commit hooks, and CI/CD pipelines. While these remain important, they share a fundamental limitation: they operate on code that has already been written. An AI agent generating code through an MCP-connected tool, however, receives feedback *during* the generation process. This means violations can be corrected before they ever reach the file system, dramatically reducing iteration cycles and improving overall code quality from the first draft.

---

## Architecture

The Deerflow MCP Tools follow a microservice-inspired architecture:

```
┌─────────────────────────────────────────────────────┐
│                  AI Coding Agent                     │
│         (Claude / Cursor / Windsurf / Copilot)       │
└──────────────────┬──────────────────────────────────┘
                   │  MCP Protocol (JSON-RPC over stdio)
       ┌───────────┼───────────┬───────────┬──────────┐
       ▼           ▼           ▼           ▼          ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
  │Enforcer │ │ Linter  │ │ Tester  │ │DepGuard│ │Architect │
  └────┬────┘ └────┬────┘ └────┬────┘ └───┬────┘ └────┬─────┘
       │           │           │           │           │
       ▼           ▼           ▼           ▼           ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
  │ Rules   │ │ AST     │ │ Vitest  │ │ npm    │ │ Dep      │
  │ Engine  │ │ Parser  │ │ Runner  │ │ Audit  │ │ Graph    │
  └─────────┘ └─────────┘ └─────────┘ └────────┘ └──────────┘
```

All servers communicate over the MCP protocol using JSON-RPC 2.0 over standard input/output (stdio). This design ensures compatibility with any MCP-compliant client and allows the tools to run in sandboxed environments without network access requirements.

---

## Tool 1: deerflow-enforcer

### Purpose

The deerflow-enforcer is the primary enforcement mechanism for the Deerflow framework. It serves as the gatekeeper for all file operations, ensuring that every line of code generated or modified by an AI agent adheres to the complete set of Deerflow rules before it is committed to the file system.

### How It Works

The enforcer operates through a hook-based interception model:

1. **File Read Hooks**: When an agent requests to read a file, the enforcer first validates that the file exists within the permitted project structure and that its current state complies with framework rules. This prevents agents from unknowingly basing their work on non-compliant code.

2. **File Write Hooks**: Before any file is created or modified, the enforcer performs a comprehensive validation pass:
   - **Structural Validation**: Checks file length against the 300-line maximum, verifies directory placement matches architectural layer conventions, and ensures file naming follows the framework's kebab-case convention.
   - **Content Validation**: Scans for forbidden patterns including `any` types, `eval()` calls, `innerHTML` assignments, console.log statements, TODO/FIXME/HACK comments, mock data hardcoded in source files, and missing JSDoc on exported functions.
   - **Metric Validation**: Calculates cyclomatic complexity for each function (max 10), function length (max 50 lines), and parameter count (max 5), rejecting any function that exceeds thresholds.
   - **Pattern Validation**: Verifies that error handling follows the typed error hierarchy, that dependency injection patterns are used correctly, and that SOLID principles are maintained.

3. **Violation Reporting**: When a rule is violated, the enforcer returns a structured violation object to the AI agent with the rule ID, severity level, description, location, and suggested remediation. The agent is expected to fix the violation and resubmit.

### Rules Enforced (34+ Categories)

The enforcer enforces all 34 problem categories defined in the Deerflow master rules:

| Category | ID | Severity | Description |
|----------|----|----------|-------------|
| Missing TypeScript Types | PC-001 | Critical | Any parameter, return type, or variable lacking explicit type annotation |
| Excessive File Length | PC-002 | High | Files exceeding 300 lines of code |
| High Cyclomatic Complexity | PC-003 | High | Functions with cyclomatic complexity > 10 |
| Missing Error Handling | PC-004 | Critical | Unhandled promise rejections, missing try/catch blocks |
| Hardcoded Configuration | PC-005 | High | Secrets, URLs, or magic numbers in source code |
| Missing JSDoc Documentation | PC-006 | Medium | Exported functions lacking documentation |
| Inconsistent Naming | PC-007 | Medium | Non-standard naming conventions |
| Poor Import Organization | PC-008 | Low | Imports not grouped by category |
| Missing Unit Tests | PC-009 | Critical | Functions without corresponding test coverage |
| SOLID Violations | PC-010 | High | Violations of Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, or Dependency Inversion |
| Architecture Layer Violation | PC-011 | Critical | Import from incorrect architectural layer |
| Circular Dependencies | PC-012 | Critical | Cyclic import chains between modules |
| Excessive Function Length | PC-013 | High | Functions exceeding 50 lines |
| Too Many Parameters | PC-014 | Medium | Functions accepting more than 5 parameters |
| God Object Pattern | PC-015 | High | Classes or modules handling too many responsibilities |
| Magic Numbers | PC-016 | Medium | Unnamed numeric or string literals in logic |
| Missing Input Validation | PC-017 | Critical | Public APIs not validating their inputs |
| Insecure Data Handling | PC-018 | Critical | PII exposed in logs, unencrypted sensitive data |
| Missing Rate Limiting | PC-019 | High | Public endpoints without rate limiting |
| Poor Error Messages | PC-020 | Medium | Generic or unhelpful error messages |
| Missing Retry Logic | PC-021 | Medium | External API calls without retry/backoff |
| Incomplete Types | PC-022 | High | Using `any`, `unknown` without proper narrowing |
| Missing Accessibility | PC-023 | High | UI components lacking ARIA attributes or keyboard support |
| Performance Anti-Patterns | PC-024 | Medium | N+1 queries, missing memoization, unnecessary re-renders |
| Missing Transaction Safety | PC-025 | Critical | Database operations lacking proper transaction handling |
| Improper State Management | PC-026 | High | Global mutable state, prop drilling beyond 2 levels |
| Missing CORS Configuration | PC-027 | High | APIs without proper CORS headers |
| Insecure Authentication | PC-028 | Critical | Weak password hashing, missing token validation |
| Missing Content Security | PC-029 | High | Missing CSP headers, XSS vulnerabilities |
| Improper Logging | PC-030 | Medium | Sensitive data in logs, missing correlation IDs |
| Missing Health Checks | PC-031 | Medium | Services without health check endpoints |
| Poor Docker Practices | PC-032 | High | Running as root, missing multi-stage builds |
| Missing Backup Strategy | PC-033 | Medium | No automated database backups |
| Missing Monitoring | PC-034 | Medium | No metrics, alerts, or observability setup |

### Configuration Options

| Environment Variable | Type | Default | Description |
|---------------------|------|---------|-------------|
| `DEERFLOW_STRICT_MODE` | boolean | `true` | When true, all violations block file operations. When false, Medium and Low violations are reported but not blocking. |
| `DEERFLOW_MAX_CYCLOMATIC` | number | `10` | Maximum allowed cyclomatic complexity per function |
| `DEERFLOW_MAX_FILE_LINES` | number | `300` | Maximum allowed lines per file (excluding blank lines and comments) |
| `DEERFLOW_MAX_FUNCTION_LINES` | number | `50` | Maximum allowed lines per function body |
| `DEERFLOW_MIN_TEST_COVERAGE` | number | `80` | Minimum percentage test coverage required |
| `DEERFLOW_FORBID_ANY_TYPE` | boolean | `true` | Whether to reject any usage of the `any` type |
| `DEERFLOW_FORBID_MOCK_DATA` | boolean | `true` | Whether to reject hardcoded mock or placeholder data |
| `DEERFLOW_REQUIRE_JSDOC` | boolean | `true` | Whether to require JSDoc on all exported functions |
| `DEERFLOW_ENFORCE_SOLID` | boolean | `true` | Whether to enforce SOLID principles |
| `DEERFLOW_SECURITY_SCAN` | boolean | `true` | Whether to run security pattern detection |

### Integration with IDE

The enforcer integrates with popular AI-powered IDEs through their MCP client support:

- **Cursor**: Add the MCP server configuration to `.cursor/mcp.json`. Cursor will automatically connect on workspace load.
- **Windsurf**: Add the configuration to `.windsurf/mcp.json`. Cascade flows will enforce rules in real time.
- **Claude Code**: Pass the configuration via `claude mcp add deerflow-enforcer`.
- **VS Code with Copilot**: Add the configuration to `.vscode/mcp.json`.

---

## Tool 2: deerflow-linter

### Purpose

The deerflow-linter extends standard linting capabilities with custom rules specifically designed to detect anti-patterns common in AI-generated code. While ESLint and TypeScript's compiler catch many issues, they lack awareness of architectural patterns, domain-driven design conventions, and the specific quality standards enforced by the Deerflow framework.

### Custom Rules for Agent Patterns

The linter includes rules tailored to code generated by AI agents:

1. **`deerflow/no-hallucinated-imports`**: Detects imports from packages that do not exist in the project's `package.json` or are not part of the TypeScript standard library. AI agents frequently hallucinate package names or import paths that look plausible but do not exist.

2. **`deerflow/no-generic-error-catch`**: Catches `catch (e)` or `catch (error)` blocks that do not narrow the error type or log it with sufficient context. Requires either a typed catch clause or explicit error classification.

3. **`deerflow/require-domain-types`**: Enforces that business logic uses domain types rather than primitive types. For example, an `Order` object's ID must be typed as `OrderId` (a branded type), not `string`.

4. **`deerflow/no-commented-code`**: Flags any block of three or more consecutive commented-out lines. AI agents sometimes generate code, encounter issues, and comment out sections rather than properly removing them.

5. **`deerflow/consistent-error-messages`**: Ensures that error messages follow the Deerflow error message format: `"[Context] Operation failed: specific reason"`.

6. **`deerflow/no-boolean-parameter`**: Flags boolean parameters in function signatures, recommending an options object or enum instead for improved readability.

7. **`deerflow/max-nested-callbacks`**: Limits callback nesting to 3 levels, requiring async/await or promise chaining for deeper flows.

8. **`deerflow/require-transaction-wrapper`**: Ensures that any function performing multiple database writes wraps them in a transaction.

### Anti-Pattern Detection

The linter identifies common anti-patterns that standard tools miss:

- **Callback Hell**: Deeply nested callbacks instead of async/await
- **Prop Drilling**: Passing props through more than 2 intermediate components
- **Service Locator Anti-Pattern**: Direct container.resolve() calls outside of composition roots
- **Anemic Domain Models**: Domain objects that are purely data containers without behavior
- **Leaky Abstractions**: Implementation details exposed through interfaces
- **Premature Optimization**: Memoization or caching added without profiling evidence
- **Shotgun Surgery**: Changes required in multiple unrelated files for a single feature

### Code Smell Identification

Additional code smells detected include:

- Long parameter lists (> 5 parameters)
- Feature envy (methods that use more data from other classes than their own)
- Data clumps (groups of parameters that appear together across multiple functions)
- Divergent change (modules that change for multiple unrelated reasons)
- Refused bequest (subclasses that override parent methods with empty implementations)

---

## Tool 3: deerflow-tester

### Purpose

The deerflow-tester automates test generation, execution, and coverage enforcement. When an AI agent modifies a file, the tester automatically generates corresponding test cases, executes them, and reports coverage metrics. If coverage falls below the configured threshold, the modification is flagged for additional tests.

### Test Coverage Enforcement

The tester enforces the Deerflow testing standards:

- **Minimum Coverage**: 80% line coverage across the entire project
- **Critical Path Coverage**: 100% coverage for authentication, authorization, payment processing, and data persistence modules
- **Branch Coverage**: All conditional branches must be exercised
- **Edge Case Coverage**: At least one test per function covering null, empty, and boundary inputs

### Mutation Testing

The tester integrates with mutation testing frameworks (such as Stryker) to verify test quality:

- **Mutant Generation**: Creates mutated versions of source code (changing operators, return values, and conditions)
- **Mutant Execution**: Runs the test suite against each mutant
- **Kill Rate Threshold**: Requires a minimum 80% mutation kill rate, proving that tests genuinely verify behavior rather than merely executing code paths
- **Surviving Mutant Reporting**: Identifies specific mutants that survive, indicating gaps in test assertions

### Property-Based Testing

The tester supports property-based testing for critical business logic:

- **Invariant Verification**: Generates random inputs to verify that business invariants always hold
- **Shrink-Based Debugging**: When a property fails, the tester shrinks the failing input to the minimal case that triggers the failure
- **Stateful Property Testing**: For stateful systems, verifies that sequences of operations maintain consistent state
- **Custom Arbitraries**: Domain-specific random data generators for entity types defined in the project

### Configuration

| Environment Variable | Type | Default | Description |
|---------------------|------|---------|-------------|
| `FRAMEWORK` | string | `vitest` | Testing framework to use (`vitest`, `jest`) |
| `COVERAGE_THRESHOLD` | number | `80` | Minimum coverage percentage required |
| `RUN_ON_CHANGE` | boolean | `true` | Automatically run affected tests when files change |
| `MAX_TEST_TIME` | number | `30000` | Maximum time in milliseconds for a single test file |

---

## Tool 4: deerflow-dependency-guard

### Purpose

The deerflow-dependency-guard protects the project's supply chain by monitoring, auditing, and validating every dependency throughout its lifecycle. From installation to runtime, the guard ensures that no vulnerable, incompatible, or non-compliant package enters the project.

### Version Conflict Detection

The guard analyzes the full dependency tree to identify:

- **Semver Conflicts**: When two packages require incompatible versions of a shared dependency
- **Peer Dependency Mismatches**: Missing or incompatible peer dependencies that may cause runtime failures
- **Duplicate Packages**: When the same package appears at multiple versions in the dependency tree
- **Phantom Dependencies**: When packages import modules that are not declared as dependencies (common with npm's flat node_modules)

### Security Audit Automation

The guard integrates with npm audit and Snyk for continuous vulnerability scanning:

- **Pre-Install Audit**: Runs `npm audit` before any new dependency is installed
- **Post-Install Verification**: Scans the resolved dependency tree after installation completes
- **Daily Scheduled Audits**: Runs a full audit on a schedule and reports new vulnerabilities
- **Severity-Based Blocking**: Configurable thresholds for blocking installation based on vulnerability severity

### License Compliance Checking

The guard validates that all dependencies comply with the project's license policy:

- **License Detection**: Identifies the license of each dependency using SPDX identifiers
- **Policy Enforcement**: Blocks dependencies with licenses that conflict with the project's license (e.g., GPL in an MIT-licensed project)
- **License Whitelist**: Only permits explicitly approved licenses
- **Orphan Detection**: Flags dependencies that do not declare a license in their `package.json`

### Configuration

| Environment Variable | Type | Default | Description |
|---------------------|------|---------|-------------|
| `AUDIT_ON_INSTALL` | boolean | `true` | Run security audit before and after every npm install |
| `BLOCK_VULNERABLE` | boolean | `true` | Block installation of packages with known vulnerabilities |
| `LOCK_VERSIONS` | boolean | `true` | Require exact version matches in lock file |
| `CHECK_PEER_DEPS` | boolean | `true` | Validate all peer dependency requirements |

---

## Tool 5: deerflow-architecture

### Purpose

The deerflow-architecture server enforces structural and architectural rules that static analysis alone cannot verify. It builds and continuously updates a dependency graph of the entire project, validating it against Clean Architecture principles and detecting structural degradation.

### Dependency Graph Analysis

The architecture server maintains a real-time dependency graph:

- **Module-Level Graph**: Maps all imports between files, showing which modules depend on which
- **Package-Level Aggregation**: Groups file-level dependencies into logical modules (domains, use cases, infrastructure)
- **Layer-Level View**: Provides a high-level view of dependencies between architectural layers (presentation, application, domain, infrastructure)
- **Change Impact Analysis**: When a file is modified, the server identifies all files that may be affected by the change

### Circular Dependency Detection

Circular dependencies are one of the most insidious architectural problems. The architecture server detects:

- **Direct Cycles**: File A imports File B which imports File A
- **Transitive Cycles**: Longer circular chains involving three or more files
- **Cross-Layer Cycles**: Cycles that span architectural layers (most severe)
- **Dynamic Import Cycles**: Circular dependencies introduced through dynamic `import()` calls

### Layer Violation Detection

The server enforces the dependency direction rules of Clean Architecture:

- **Inward Dependencies Only**: Dependencies must always point inward, from outer layers (infrastructure) to inner layers (domain). The domain layer must have zero outgoing dependencies.
- **Application Layer Isolation**: The application (use case) layer may depend on the domain layer but not on infrastructure.
- **Infrastructure Layer Freedom**: The infrastructure layer may depend on both the domain and application layers.
- **Presentation Layer Constraints**: The presentation layer may only depend on the application layer through ports/interfaces.

### Configuration

| Environment Variable | Type | Default | Description |
|---------------------|------|---------|-------------|
| `ENFORCE_CLEAN_ARCH` | boolean | `true` | Enable Clean Architecture enforcement |
| `MAX_COUPLING` | number | `5` | Maximum number of modules a single module may depend on |
| `DETECT_CYCLES` | boolean | `true` | Enable circular dependency detection |
| `CHECK_LAYER_VIOLATIONS` | boolean | `true` | Enable layer dependency direction enforcement |

---

## Installation Instructions

### Prerequisites

- Node.js 18 or later
- An MCP-compatible AI coding assistant (Cursor, Claude Code, Windsurf, or VS Code with Copilot)
- The Deerflow Agent Framework project cloned locally

### Step 1: Install the MCP Tools

Each MCP server is distributed as an npm package and runs via `npx` without global installation:

```bash
# Verify Node.js version
node --version  # Must be >= 18

# Verify MCP tools are accessible (they will be auto-installed via npx)
npx -y deerflow-mcp-server --version
npx -y deerflow-mcp-linter --version
npx -y deerflow-mcp-tester --version
npx -y deerflow-mcp-dep-guard --version
npx -y deerflow-mcp-arch --version
```

### Step 2: Configure Your AI Assistant

Copy the `config.json` file to your assistant's configuration directory:

**For Cursor:**
```bash
mkdir -p .cursor
cp mcp-tools/config.json .cursor/mcp.json
```

**For Claude Code:**
```bash
# Register each server individually
claude mcp add deerflow-enforcer -- npx -y deerflow-mcp-server
claude mcp add deerflow-linter -- npx -y deerflow-mcp-linter
claude mcp add deerflow-tester -- npx -y deerflow-mcp-tester
claude mcp add deerflow-dependency-guard -- npx -y deerflow-mcp-dep-guard
claude mcp add deerflow-architecture -- npx -y deerflow-mcp-arch
```

**For Windsurf:**
```bash
mkdir -p .windsurf
cp mcp-tools/config.json .windsurf/mcp.json
```

**For VS Code with Copilot:**
```bash
mkdir -p .vscode
cp mcp-tools/config.json .vscode/mcp.json
```

### Step 3: Verify Connection

After configuration, restart your AI assistant and verify that all MCP servers are connected:

- Open the assistant's MCP status panel
- Confirm all five servers show as "Connected" or "Running"
- Run a test query: ask the assistant to create a small TypeScript file and verify that the enforcer reports any violations

---

## Configuration Guide

### Environment Variables

All MCP servers accept configuration through environment variables, as defined in the `config.json` file. These can be overridden per-environment using `.env.local` files or system environment variables.

### Strict Mode vs. Advisory Mode

- **Strict Mode** (`DEERFLOW_STRICT_MODE=true`): All violations block the AI agent from proceeding. The agent must fix the violation before continuing.
- **Advisory Mode** (`DEERFLOW_STRICT_MODE=false`): Critical and High violations block, but Medium and Low violations are reported as warnings. The agent may proceed but is expected to address warnings before finalizing.

### Selective Rule Enforcement

You can disable specific rules by adding them to an exceptions file at `.deerflow/exceptions.json`:

```json
{
  "disabledRules": ["PC-006", "PC-023"],
  "disabledPatterns": ["deerflow/no-commented-code"],
  "fileExceptions": {
    "src/test/**": ["PC-006"],
    "src/migrations/**": ["PC-003"]
  }
}
```

### Per-Directory Configuration

Each directory can override the global configuration with a `.deerflow.json` file:

```json
{
  "maxFileLines": 500,
  "maxCyclomatic": 15,
  "requireJSDoc": false
}
```

---

## Troubleshooting

### MCP Server Fails to Start

**Symptom**: The AI assistant shows the MCP server as "Error" or "Disconnected".

**Solution**:
1. Verify Node.js is installed and accessible: `node --version`
2. Check that the npm package exists: `npm view deerflow-mcp-server`
3. Try running the server manually: `npx -y deerflow-mcp-server`
4. Check the assistant's logs for specific error messages

### False Positive Violations

**Symptom**: The enforcer reports violations on valid code.

**Solution**:
1. Review the specific rule in `core/rules/master-rules.md` to understand its intent
2. If the rule is too aggressive, add an exception in `.deerflow/exceptions.json`
3. Report the false positive with the violating code and expected behavior

### Performance Issues

**Symptom**: The AI assistant is slow when generating code.

**Solution**:
1. Disable `RUN_ON_CHANGE` in the tester configuration for faster iteration
2. Reduce `DEERFLOW_MAX_FILE_LINES` temporarily during large refactoring
3. Use advisory mode for exploratory development phases

### Circular Dependency Errors in New Code

**Symptom**: The architecture server detects circular dependencies in code that should be acyclic.

**Solution**:
1. Check for type-only imports that should use `import type`
2. Verify that interfaces and types are placed in a shared types module
3. Consider using dependency injection to break the cycle
4. Use barrel exports (`index.ts`) cautiously as they can create implicit cycles

---

## Extending the Toolchain

### Creating Custom MCP Tools

Deerflow MCP tools follow a standard structure. To create a new tool:

1. Create a new npm package following the naming convention `deerflow-mcp-<tool-name>`
2. Implement the MCP server using the `@modelcontextprotocol/sdk` package
3. Register tool capabilities using the `tools/list` and `tools/call` MCP methods
4. Add the server configuration to `mcp-tools/config.json`
5. Document the tool in this README

### Contributing Rules

New rules can be added to the enforcer and linter without modifying the server code. Rules are defined in JSON files and loaded at startup:

```json
{
  "id": "deerflow/no-unvalidated-email",
  "severity": "Critical",
  "pattern": "(?<!\\.validate)email(?!Validation|Validator|Regex)",
  "message": "Email input must be validated using EmailValidator class",
  "category": "Input Validation",
  "ruleId": "PC-017-sub"
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-10 | Initial release with five MCP tools |

---

*This document is part of the Deerflow Agent Framework. For the complete rule set, see `core/rules/master-rules.md`.*
