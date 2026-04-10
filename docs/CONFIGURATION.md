# DEERFLOW AGENT FRAMEWORK — Configuration Reference

> **Version:** 1.0.0  
> **Last Updated:** 2025-01-10  
> **Audience:** Developers, DevOps engineers, team leads  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Main Configuration File](#2-main-configuration-file)
3. [Rule Configuration](#3-rule-configuration)
4. [Security Configuration](#4-security-configuration)
5. [Workflow Configuration](#5-workflow-configuration)
6. [AI Agent Configuration](#6-ai-agent-configuration)
7. [CI/CD Configuration](#7-cicd-configuration)
8. [ESLint Configuration](#8-eslint-configuration)
9. [TypeScript Configuration](#9-typescript-configuration)
10. [Testing Configuration](#10-testing-configuration)
11. [MCP Server Configuration](#11-mcp-server-configuration)
12. [Git Hooks Configuration](#12-git-hooks-configuration)
13. [Editor Configuration](#13-editor-configuration)

---

## 1. Overview

Deerflow uses a layered configuration system where values cascade from the main configuration file to individual tool configurations. This ensures consistency across all enforcement mechanisms.

### Configuration Hierarchy

```
deerflow.config.json          ← Primary configuration (source of truth)
    │
    ├──→ pipeline-config.json  ← CI/CD thresholds (derived)
    ├──→ eslint-rules.js       ← ESLint rules (derived)
    ├──→ tsconfig-strict.json  ← TypeScript options (derived)
    ├──→ vitest.config.ts      ← Test thresholds (derived)
    ├──→ mcp-tools/config.json ← MCP env variables (derived)
    └──→ Tool rule files       ← Agent rules (derived)
```

### Configuration Modes

| Mode | Description | Behavior |
|------|-------------|----------|
| **Strict** (`strictMode: true`) | Default mode | All violations are errors, blocking commits and merges |
| **Advisory** (`strictMode: false`) | Lenient mode | Violations produce warnings but don't block progress |

---

## 2. Main Configuration File

The main configuration file is `config/deerflow.config.json`. This is the single source of truth for all quality thresholds and enforcement settings.

### Full Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "Framework version",
      "default": "1.0.0"
    },
    "framework": {
      "type": "string",
      "const": "deerflow",
      "description": "Framework identifier"
    },
    "strictMode": {
      "type": "boolean",
      "description": "Enable strict enforcement (true) or advisory mode (false)",
      "default": true
    },
    "rules": {
      "type": "object",
      "description": "Code quality rules and thresholds"
    },
    "security": {
      "type": "object",
      "description": "Security enforcement settings"
    },
    "workflow": {
      "type": "object",
      "description": "Workflow enforcement settings"
    },
    "ai": {
      "type": "object",
      "description": "AI agent-specific settings"
    }
  }
}
```

### Default Configuration

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

---

## 3. Rule Configuration

The `rules` section controls code quality thresholds.

### File and Function Size Limits

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxFileLines` | number | 300 | Maximum lines per file (excluding tests) |
| `maxFunctionLines` | number | 50 | Maximum lines per function |
| `maxComponentLines` | number | 200 | Maximum lines per React component |
| `maxCyclomaticComplexity` | number | 10 | Maximum cyclomatic complexity per function |
| `maxNestingDepth` | number | 4 | Maximum nesting depth in code |
| `maxCoupling` | number | 5 | Maximum dependencies per module |

### Type Safety Rules

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `forbidAnyType` | boolean | true | Prohibit `any` type usage |
| `forbidMockData` | boolean | true | Prohibit mock data in non-test files |
| `requireJSDoc` | boolean | true | Require JSDoc on public APIs |

### Architecture Rules

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enforceSolid` | boolean | true | Enforce SOLID principles |
| `enforceCleanArchitecture` | boolean | true | Enforce Clean Architecture layer boundaries |

### Testing Rules

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `minTestCoverage` | number | 80 | Minimum test coverage percentage |
| `zeroLintWarnings` | boolean | true | Require zero ESLint warnings |

### Example: Relaxed Configuration

```json
{
  "rules": {
    "maxFileLines": 500,
    "maxFunctionLines": 75,
    "maxCyclomaticComplexity": 15,
    "maxNestingDepth": 5,
    "maxComponentLines": 300,
    "minTestCoverage": 70,
    "requireJSDoc": false
  }
}
```

### Example: Ultra-Strict Configuration

```json
{
  "rules": {
    "maxFileLines": 200,
    "maxFunctionLines": 30,
    "maxCyclomaticComplexity": 7,
    "maxNestingDepth": 3,
    "maxComponentLines": 150,
    "minTestCoverage": 90,
    "forbidAnyType": true,
    "enforceSolid": true,
    "enforceCleanArchitecture": true,
    "zeroLintWarnings": true
  }
}
```

---

## 4. Security Configuration

The `security` section controls security enforcement.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `owaspCompliance` | boolean | true | Enforce OWASP Top 10 compliance |
| `secretsDetection` | boolean | true | Enable secret scanning in pre-commit and CI/CD |
| `dependencyAudit` | boolean | true | Run npm audit on every install and CI run |
| `licenseCompliance` | boolean | true | Block dependencies with GPL/AGPL licenses |

### Disabling Specific Security Features

```json
{
  "security": {
    "owaspCompliance": true,
    "secretsDetection": true,
    "dependencyAudit": true,
    "licenseCompliance": false  // Allow any license
  }
}
```

---

## 5. Workflow Configuration

The `workflow` section controls the agentic workflow enforcement.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `mandatoryPhases` | boolean | true | Require agents to follow all 8 workflow phases |
| `qualityGates` | boolean | true | Require quality gate passage between phases |
| `requireDocumentation` | boolean | true | Require documentation in Phase 7 |
| `requireTesting` | boolean | true | Require tests in Phase 5 |

### Disabling Workflow for Quick Prototypes

```json
{
  "workflow": {
    "mandatoryPhases": false,
    "qualityGates": false,
    "requireDocumentation": false,
    "requireTesting": true  // Keep testing even in prototype mode
  }
}
```

---

## 6. AI Agent Configuration

The `ai` section controls AI agent-specific behavior.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enforceWorkflow` | boolean | true | Agents must follow the 8-phase workflow |
| `requireDeepAnalysis` | boolean | true | Agents must read all files before coding |
| `verifyBeforeWrite` | boolean | true | Agents must verify changes compile/lint before writing |
| `atomicChanges` | boolean | true | Agents make one change at a time |
| `maxBatchEdits` | number | 5 | Maximum files an agent can edit in one batch |

### Adjusting AI Agent Settings

```json
{
  "ai": {
    "enforceWorkflow": true,
    "requireDeepAnalysis": true,
    "verifyBeforeWrite": true,
    "atomicChanges": true,
    "maxBatchEdits": 3  // More conservative batching
  }
}
```

---

## 7. CI/CD Configuration

The CI/CD pipeline is configured via `quality-gates/ci-cd/pipeline-config.json`.

### Quality Thresholds

| Category | Metric | Default | Description |
|----------|--------|---------|-------------|
| Code Quality | `maxWarnings` | 0 | Maximum ESLint warnings |
| Code Quality | `maxErrors` | 0 | Maximum ESLint errors |
| Code Quality | `strictTypes` | true | TypeScript strict mode |
| Testing | `unitCoverage` | 80 | Unit test coverage % |
| Testing | `integrationCoverage` | 60 | Integration test coverage % |
| Testing | `mutationScore` | 70 | Mutation testing score % |
| Security | `maxCriticalVulns` | 0 | Maximum critical vulnerabilities |
| Security | `maxHighVulns` | 0 | Maximum high vulnerabilities |
| Build | `maxFileSizeKB` | 500 | Maximum single file size (KB) |
| Build | `maxInitialLoadKB` | 200 | Maximum initial JS load (KB) |
| Architecture | `maxCircularDeps` | 0 | Maximum circular dependencies |
| Architecture | `maxFileLines` | 300 | Maximum file lines |
| Architecture | `maxComplexity` | 10 | Maximum cyclomatic complexity |

### Customizing CI/CD Thresholds

Edit `quality-gates/ci-cd/pipeline-config.json`:

```json
{
  "quality": {
    "codeQuality": {
      "maxWarnings": 0,
      "maxErrors": 0
    },
    "testing": {
      "unitCoverage": 80,
      "integrationCoverage": 60,
      "e2eRequired": true,
      "mutationScore": 70
    },
    "security": {
      "maxCriticalVulns": 0,
      "maxHighVulns": 0,
      "maxMediumVulns": 5
    },
    "build": {
      "maxFileSizeKB": 500,
      "maxInitialLoadKB": 200,
      "requireTreeShaking": true
    },
    "architecture": {
      "maxCircularDeps": 0,
      "maxFileLines": 300,
      "maxComplexity": 10,
      "maxNestingDepth": 4,
      "maxCoupling": 5
    }
  }
}
```

---

## 8. ESLint Configuration

The ESLint configuration is defined in `quality-gates/linters/eslint-rules.js`.

### Key Rule Categories

| Category | Rules | Enforcement |
|----------|-------|-------------|
| **TypeScript** | `no-explicit-any`, `no-unsafe-*`, `consistent-type-imports` | Error |
| **Security** | `no-eval`, `no-implied-eval`, `detect-unsafe-regex` | Error |
| **React** | `no-danger`, `exhaustive-deps`, `jsx-a11y/*` | Error |
| **Complexity** | `max-lines`, `max-lines-per-function`, `complexity` | Error |
| **Import** | `no-cycle`, `no-extraneous-dependencies`, `ordering` | Error |
| **Best Practices** | `eqeqeq`, `curly`, `no-nested-ternary` | Error |

### Extending the ESLint Configuration

In your project, extend the Deerflow ESLint config:

```javascript
// .eslintrc.js
const deerflowRules = require('./quality-gates/linters/eslint-rules');

module.exports = {
  ...deerflowRules,
  rules: {
    ...deerflowRules.rules,
    // Your project-specific overrides
    'no-console': 'warn', // Relax to warning instead of error
  },
  overrides: [
    // Your project-specific overrides
    {
      files: ['src/legacy/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Allow in legacy code
      },
    },
  ],
};
```

---

## 9. TypeScript Configuration

The TypeScript configuration is defined in `quality-gates/linters/tsconfig-strict.json`.

### Strict Options Enabled

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Extending the TypeScript Configuration

In your project's `tsconfig.json`:

```json
{
  "extends": "./quality-gates/linters/tsconfig-strict.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 10. Testing Configuration

The testing configuration is defined in `quality-gates/testers/vitest.config.ts`.

### Coverage Thresholds

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Test Templates

Deerflow provides 10 comprehensive test templates in `quality-gates/testers/test-templates.ts`:

| Template | Purpose | Use Case |
|----------|---------|----------|
| Unit Test | Constructor, happy path, edge cases, error handling | Business logic, utilities |
| Integration Test | Multi-module workflows, data consistency | API routes, services |
| E2E Test | HTTP API testing, status codes, auth | User flows |
| Component Test | Rendering, interactions, a11y | React components |
| API Test | CRUD endpoints, validation, rate limiting | REST APIs |
| Hook Test | State, async updates, cleanup | Custom React hooks |
| Utility Test | Type safety, parameterized tests | Pure functions |
| Error Scenario | Parameterized error scenarios | Error handling |
| Edge Case | Boundary values, race conditions | Complex logic |
| Security Test | Injection, XSS, auth, encryption | Security-critical code |

---

## 11. MCP Server Configuration

MCP servers are configured in `mcp-tools/config.json`.

### Available Servers

| Server | Purpose | Key Environment Variables |
|--------|---------|--------------------------|
| `deerflow-enforcer` | Real-time rule enforcement | `DEERFLOW_STRICT_MODE`, `DEERFLOW_MAX_CYCLOMATIC` |
| `deerflow-linter` | Extended linting | `RULES_PATH`, `STRICT_MODE`, `AUTO_FIX` |
| `deerflow-tester` | Automated testing | `FRAMEWORK`, `COVERAGE_THRESHOLD`, `RUN_ON_CHANGE` |
| `deerflow-dependency-guard` | Dependency safety | `AUDIT_ON_INSTALL`, `BLOCK_VULNERABLE`, `LOCK_VERSIONS` |
| `deerflow-architecture` | Architecture enforcement | `ENFORCE_CLEAN_ARCH`, `DETECT_CYCLES`, `MAX_COUPLING` |

### Customizing MCP Server Configuration

```json
{
  "mcpServers": {
    "deerflow-enforcer": {
      "command": "npx",
      "args": ["-y", "deerflow-mcp-server"],
      "env": {
        "DEERFLOW_STRICT_MODE": "true",
        "DEERFLOW_MAX_CYCLOMATIC": "10",
        "DEERFLOW_MAX_FILE_LINES": "300",
        "DEERFLOW_MIN_TEST_COVERAGE": "80"
      }
    }
  }
}
```

---

## 12. Git Hooks Configuration

### Pre-commit Hook

The pre-commit hook runs 6 stages:
1. File safety (dangerous file blocking)
2. Secrets detection (21 patterns)
3. ESLint (0 warnings/errors)
4. TypeScript (0 errors)
5. Prettier (auto-format)
6. File size (300 line limit)

### Pre-push Hook

The pre-push hook runs 7 stages:
1. Full lint
2. Full type check
3. Tests with coverage (≥80%)
4. Build verification
5. npm audit
6. Gitleaks scan
7. Architecture check (circular deps, complexity)

### Commit-msg Hook

Enforces Conventional Commits format:
```
<type>(<scope>): <description>

Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

### Disabling Specific Hooks

To temporarily bypass a hook (not recommended):

```bash
# Skip pre-commit
git commit --no-verify -m "feat: emergency fix"

# Skip pre-push
git push --no-verify
```

---

## 13. Editor Configuration

### .editorconfig

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2
```

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### .prettierignore

```
node_modules
dist
build
coverage
.next
.turbo
*.min.js
*.min.css
CHANGELOG.md
package-lock.json
pnpm-lock.yaml
yarn.lock
```

---

## Environment Variables

Deerflow scripts support the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DEERFLOW_STRICT_MODE` | Enable strict enforcement | `true` |
| `DEERFLOW_CONFIG_PATH` | Path to config file | `./config/deerflow.config.json` |
| `DEERFLOW_SKIP_HOOKS` | Skip git hooks | `false` |
| `DEERFLOW_REPORT_DIR` | Directory for quality reports | `./.deerflow/reports` |
| `DEERFLOW_LOG_LEVEL` | Logging verbosity | `info` |

---

*This document is part of the Deerflow Agent Framework. For quick setup instructions, see [docs/QUICK_START.md](QUICK_START.md).*
