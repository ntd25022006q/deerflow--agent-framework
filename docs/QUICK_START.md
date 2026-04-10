# DEERFLOW AGENT FRAMEWORK — Quick Start Guide

> **Version:** 1.0.0  
> **Last Updated:** 2025-01-10  
> **Estimated Setup Time:** 5-10 minutes  

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Configuration](#3-configuration)
4. [Setting Up Your AI Agent](#4-setting-up-your-ai-agent)
5. [Creating a New Project](#5-creating-a-new-project)
6. [Adding Deerflow to an Existing Project](#6-adding-deerflow-to-an-existing-project)
7. [Running Quality Checks](#7-running-quality-checks)
8. [Daily Workflow](#8-daily-workflow)
9. [Troubleshooting](#9-troubleshooting)
10. [Next Steps](#10-next-steps)

---

## 1. Prerequisites

Before installing Deerflow, ensure your system meets these requirements:

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| **Node.js** | 18.0.0 | `node --version` |
| **npm** (or pnpm/yarn) | 9.0.0 | `npm --version` |
| **git** | 2.30.0 | `git --version` |
| **Operating System** | macOS, Linux, or WSL on Windows | — |
| **AI Editor** | Cursor, Windsurf, Claude Code, Copilot, or Codex | — |

### Installing Prerequisites

If you don't have Node.js installed:

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Using Homebrew (macOS)
brew install node@18
```

If you don't have git installed:

```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt update && sudo apt install git

# Windows (use WSL)
wsl --install
```

---

## 2. Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/deerflow-agent-framework.git
cd deerflow-agent-framework
```

### Step 2: Run the Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The setup script will walk you through an interactive configuration wizard. Here's what you'll see:

```
🦌 DEERFLOW AGENT FRAMEWORK — Setup Wizard
═════════════════════════════════════════════

Step 1/8: Checking environment...
  ✅ Node.js v20.10.0 (>= 18.0.0)
  ✅ npm 10.2.3 (>= 9.0.0)
  ✅ git 2.43.0 (>= 2.30.0)
  ✅ OS: macOS (supported)

Step 2/8: Select your AI editor(s)
  ? Which AI editor(s) do you use? (Use arrow keys, space to select)
  ❯ ◉ Cursor
    ◉ Windsurf
    ◉ Claude Code
    ◉ GitHub Copilot
    ◉ OpenAI Codex
    ◉ All of the above
```

### Step 3: Follow the Prompts

The setup wizard will guide you through:

1. **Editor Selection** — Choose which AI editor(s) you use
2. **Project Type** — Next.js, React, Node.js, Python, or Fullstack
3. **CI/CD Setup** — Enable GitHub Actions pipeline (optional)
4. **Security Setup** — Enable security hooks and scanning (optional)
5. **Template Copying** — Copy framework-specific templates

### Step 4: Verify Installation

After setup completes, verify everything is working:

```bash
./scripts/quality-check.sh
```

You should see output like:

```
🦌 DEERFLOW QUALITY CHECK
═════════════════════════

🔍 Running quality checks...

  ✅ ESLint: 0 errors, 0 warnings
  ✅ TypeScript: 0 errors
  ✅ Prettier: All files formatted
  ✅ Security: No secrets detected
  ✅ Architecture: No circular dependencies

═════════════════════════
✅ ALL CHECKS PASSED
```

---

## 3. Configuration

### Default Configuration

Deerflow ships with a sensible default configuration in `config/deerflow.config.json`:

```json
{
  "version": "1.0.0",
  "strictMode": true,
  "rules": {
    "maxFileLines": 300,
    "maxFunctionLines": 50,
    "maxCyclomaticComplexity": 10,
    "minTestCoverage": 80,
    "zeroLintWarnings": true
  }
}
```

### Customizing Configuration

You can customize the configuration by editing `config/deerflow.config.json` directly or by using the setup script with flags:

```bash
# Non-interactive setup with specific options
./scripts/setup.sh --editor=cursor --type=nextjs --ci --security --skip-prompts

# Re-run setup to change configuration
./scripts/setup.sh
```

For the complete configuration reference, see [docs/CONFIGURATION.md](CONFIGURATION.md).

---

## 4. Setting Up Your AI Agent

Deerflow provides dedicated rule files for each supported AI editor. After running the setup script, the appropriate rule files are automatically copied to your project root.

### Cursor

The `.cursorrules` file is automatically placed in your project root. Cursor reads this file when you open the project. No additional configuration needed.

**Verification:** Open your project in Cursor and check that the rule file is recognized:
1. Open Cursor Settings → Rules
2. Confirm `.cursorrules` is loaded
3. Start a chat and ask: "What are your coding rules?"

### Windsurf

The `.windsurfrules` file is automatically placed in your project root. Windsurf reads this file when you open the project.

**Verification:** Open your project in Windsurf and start a Cascade session. The rules will be automatically applied.

### Claude Code

The `CLAUDE.md` file is automatically placed in your project root. Claude Code reads this file at session start.

**Verification:** Start a Claude Code session in your project directory and ask: "What rules do you follow?"

### GitHub Copilot

The `.github/copilot-instructions.md` file is automatically placed in your project. Copilot reads this file for both code completion and Copilot Chat.

**Verification:** Open your project in VS Code with Copilot enabled. Start Copilot Chat and ask about your coding standards.

### OpenAI Codex

The `.codex/instructions.md` file is automatically placed in your project. Codex reads this file for code generation tasks.

**Verification:** Use Codex in your project and verify generated code follows the rules.

### For Any Other AI Agent

Copy the master rules and paste them into your AI agent's configuration:

```bash
# View the master rules
cat core/rules/master-rules.md

# Copy to clipboard
cat core/rules/master-rules.md | pbcopy  # macOS
cat core/rules/master-rules.md | xclip -selection clipboard  # Linux
```

---

## 5. Creating a New Project

Deerflow can scaffold new projects with full enforcement pre-configured:

### Next.js Project

```bash
./scripts/init-project.sh --type nextjs --name my-nextjs-app
cd my-nextjs-app
```

This creates a Next.js project with:
- TypeScript strict mode
- Tailwind CSS
- ESLint with Deerflow rules
- Vitest with 80% coverage thresholds
- Husky git hooks
- Clean Architecture directory structure
- Example Button component with JSDoc

### React + Vite Project

```bash
./scripts/init-project.sh --type react --name my-react-app
cd my-react-app
```

### Node.js API Project

```bash
./scripts/init-project.sh --type node --name my-api
cd my-api
```

This creates a Node.js project with:
- Clean Architecture (domain/application/infrastructure/presentation)
- Express + Zod + Helmet
- TypeScript path aliases
- Vitest with supertest

### Python Project

```bash
./scripts/init-project.sh --type python --name my-python-app
cd my-python-app
```

### Fullstack Project

```bash
./scripts/init-project.sh --type fullstack --name my-fullstack
cd my-fullstack
```

This creates a Next.js frontend + Node.js API backend.

---

## 6. Adding Deerflow to an Existing Project

To add Deerflow to an existing project that's already in development:

### Step 1: Clone Deerflow Alongside Your Project

```bash
# Your existing project is in ~/my-project
cd ~
git clone https://github.com/your-username/deerflow-agent-framework.git

# Run setup with your project path
cd deerflow-agent-framework
./scripts/setup.sh --editor=cursor
```

### Step 2: Copy Rule Files Manually

If you prefer manual setup:

```bash
# Copy rule files to your project
cp deerflow-agent-framework/.cursorrules ~/my-project/
cp deerflow-agent-framework/CLAUDE.md ~/my-project/

# Copy configuration
cp deerflow-agent-framework/config/deerflow.config.json ~/my-project/

# Copy ESLint config (merge with your existing)
# Copy TypeScript config (merge with your existing)
```

### Step 3: Install Git Hooks

```bash
cd ~/my-project

# Install husky
npm install --save-dev husky lint-staged
npx husky init

# Copy Deerflow hooks
cp ~/deerflow-agent-framework/hooks/pre-commit .husky/
cp ~/deerflow-agent-framework/hooks/pre-push .husky/
cp ~/deerflow-agent-framework/hooks/commit-msg .husky/
cp ~/deerflow-agent-framework/hooks/post-merge .husky/

# Make hooks executable
chmod +x .husky/pre-commit .husky/pre-push .husky/commit-msg .husky/post-merge
```

### Step 4: Add CI/CD Pipeline

```bash
# Copy GitHub Actions workflow
mkdir -p .github/workflows
cp ~/deerflow-agent-framework/quality-gates/ci-cd/github-actions.yml .github/workflows/
```

### Step 5: Fix Existing Violations

After adding Deerflow, you'll likely have existing violations. Fix them:

```bash
# Run quality check to see violations
~/deerflow-agent-framework/scripts/quality-check.sh

# Auto-fix what's possible
npx eslint --fix .

# Format all files
npx prettier --write .

# Fix remaining issues manually based on the quality check output
```

---

## 7. Running Quality Checks

### Basic Quality Check

```bash
./scripts/quality-check.sh
```

Runs: ESLint, TypeScript, Prettier, basic security scan.

### Full Quality Audit

```bash
./scripts/quality-check.sh --full
```

Runs all checks: lint, types, tests, security, performance, architecture.

### Security-Only Audit

```bash
./scripts/quality-check.sh --security
```

Runs: secret scanning (21 patterns), npm audit, gitleaks, dependency check.

### Architecture-Only Check

```bash
./scripts/quality-check.sh --architecture
```

Runs: circular dependency detection (madge), layer violations, complexity analysis.

### Understanding the Output

```
🦌 DEERFLOW QUALITY CHECK
═════════════════════════

🔍 Running quality checks...

  ────────────────────────
  📋 CODE QUALITY
  ────────────────────────
  ✅ ESLint: 0 errors, 0 warnings
  ✅ TypeScript: 0 errors (strict mode)
  ✅ Prettier: All files formatted
  ⚠️  File Sizes: 2 files approaching limit
     - src/components/Dashboard.tsx (287/300 lines)
     - src/services/api.ts (295/300 lines)

  ────────────────────────
  🧪 TESTING
  ────────────────────────
  ✅ Unit Tests: 142/142 passed (coverage: 87.3%)
  ✅ Integration Tests: 23/23 passed (coverage: 65.1%)

  ────────────────────────
  🔒 SECURITY
  ────────────────────────
  ✅ Secrets: No secrets detected (21 patterns scanned)
  ✅ npm audit: 0 vulnerabilities
  ✅ gitleaks: Clean

  ────────────────────────
  🏗️ ARCHITECTURE
  ────────────────────────
  ✅ Circular Dependencies: None detected
  ✅ Layer Violations: None detected
  ✅ Complexity: All functions within limits

═════════════════════════
✅ ALL CHECKS PASSED (2 warnings)

📊 Report saved to: .deerflow/reports/quality-check-2025-01-10.json
```

---

## 8. Daily Workflow

Here's how Deerflow fits into your daily development workflow:

### Starting a New Task

1. **Describe the task** to your AI agent (Cursor, Claude Code, etc.)
2. **The agent follows the 8-phase workflow:**
   - Phase 0: Reads existing files, understands architecture
   - Phase 1: Analyzes requirements, identifies edge cases
   - Phase 2: Designs architecture, defines interfaces
   - Phase 3: Plans implementation, decomposes into tasks
   - Phase 4: Writes code, one file at a time
   - Phase 5: Writes tests, verifies everything works
   - Phase 6: Checks integration, resolves imports
   - Phase 7: Updates documentation

### During Development

- **Pre-commit hook** runs automatically when you `git commit` (< 5 seconds)
- Fix any issues and commit again
- **Pre-push hook** runs automatically when you `git push` (~1-2 minutes)
- Fix any issues and push again

### After Pushing

- **CI/CD pipeline** runs automatically on GitHub (~10-15 minutes)
- All 8 parallel jobs must pass
- Merge is blocked until all checks pass

### Code Review

- Review focuses on architecture decisions and business logic
- Quality issues are already caught by automated tools
- Review is faster and more effective

---

## 9. Troubleshooting

### Common Issues

#### "Permission denied" on scripts

```bash
chmod +x scripts/*.sh hooks/*
```

#### "Node.js version too old"

```bash
nvm install 18
nvm use 18
```

#### "ESLint errors after setup"

This is expected if your existing code doesn't meet Deerflow standards. Fix them:

```bash
# Auto-fix what's possible
npx eslint --fix .

# See what remains
npx eslint . --max-warnings 0
```

#### "Pre-commit hook fails on secrets"

If legitimate strings are being flagged as secrets, add them to the allowlist:

```bash
# Edit security/.gitleaks.toml and add to the [allowlist] section
```

#### "CI/CD pipeline fails on coverage"

Increase test coverage to meet the 80% threshold, or adjust the threshold in `config/deerflow.config.json` and `quality-gates/ci-cd/pipeline-config.json`.

#### "Husky hooks not running"

```bash
# Reinstall husky
npx husky init

# Verify hooks are executable
ls -la .husky/
chmod +x .husky/*
```

#### "Agent ignores the rules"

Make sure the rule file is in the project root:
- Cursor: `.cursorrules` in project root
- Windsurf: `.windsurfrules` in project root
- Claude Code: `CLAUDE.md` in project root
- Copilot: `.github/copilot-instructions.md`
- Codex: `.codex/instructions.md`

Restart your AI editor after copying rule files.

### Getting Help

If you encounter issues not covered here:

1. Check the [Configuration Guide](CONFIGURATION.md) for detailed settings
2. Check the [Architecture Document](ARCHITECTURE.md) for technical details
3. Check the [Problem Analysis](PROBLEM_ANALYSIS.md) for understanding specific issues
4. Open an issue on the GitHub repository

---

## 10. Next Steps

After completing the setup, here's what to do next:

### Immediate (Day 1)

- [ ] Verify your AI agent recognizes the rule files
- [ ] Run a full quality check: `./scripts/quality-check.sh --full`
- [ ] Fix any existing violations in your code
- [ ] Make your first commit (verify pre-commit hook works)

### Short-term (Week 1)

- [ ] Set up CI/CD pipeline: `./scripts/setup.sh --ci`
- [ ] Review and customize `deerflow.config.json` thresholds
- [ ] Train your team on Deerflow rules and workflow
- [ ] Establish a code review process that leverages Deerflow

### Medium-term (Month 1)

- [ ] Monitor quality metrics over time
- [ ] Customize rules for project-specific needs
- [ ] Add custom pre-commit hooks if needed
- [ ] Integrate with your team's existing DevOps tooling

### Long-term (Ongoing)

- [ ] Review and update Deerflow configuration quarterly
- [ ] Update to latest Deerflow version regularly
- [ ] Contribute improvements back to the framework
- [ ] Share learnings with the community

---

*This document is part of the Deerflow Agent Framework. For the complete configuration reference, see [docs/CONFIGURATION.md](CONFIGURATION.md).*
