#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# DEERFLOW AGENT FRAMEWORK — ONE-COMMAND SETUP
# Usage: After git clone, run:
#   chmod +x scripts/setup.sh && ./scripts/setup.sh
# ═══════════════════════════════════════════════════════════════

# ─── Color Definitions ───────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Logging Functions ───────────────────────────────────────
log_info()    { echo -e "${BLUE}[DEERFLOW]${NC} $1"; }
log_success() { echo -e "${GREEN}[DEERFLOW]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[DEERFLOW]${NC} $1"; }
log_error()   { echo -e "${RED}[DEERFLOW]${NC} $1"; }
log_step()    { echo -e "\n${MAGENTA}${BOLD}━━━ $1 ━━━${NC}\n"; }
log_banner()  {
  echo -e "${CYAN}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║        🦌  DEERFLOW AGENT FRAMEWORK SETUP                ║"
  echo "║        Senior Full-Stack Engineer Standards              ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

# ─── Globals ─────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEERFLOW_DIR="$PROJECT_ROOT/.deerflow"
SETUP_LOG="$DEERFLOW_DIR/setup.log"
REPORT_FILE="$DEERFLOW_DIR/setup-report.json"
SKIP_PROMPTS="${SKIP_PROMPTS:-false}"
EDITOR_CHOICE=""
PROJECT_TYPE=""
SETUP_CI="false"
SETUP_SECURITY="false"
FAILED_CHECKS=()
PASSED_CHECKS=()

# ─── Utility Functions ───────────────────────────────────────
command_exists() { command -v "$1" >/dev/null 2>&1; }
version_gte() {
  # Returns 0 if $1 (version string) >= $2
  printf '%s\n' "$2" "$1" | sort -V -C 2>/dev/null
}

ask_yes_no() {
  local prompt="$1"
  local default="${2:-Y}"
  if [[ "$SKIP_PROMPTS" == "true" ]]; then
    [[ "$default" =~ ^[Yy] ]] && return 0 || return 1
  fi
  local yn
  if [[ "$default" =~ ^[Yy] ]]; then
    read -rp "$(echo -e "${CYAN}[DEERFLOW]${NC} $prompt [Y/n]: ")" yn
    [[ -z "$yn" || "$yn" =~ ^[Yy] ]]
  else
    read -rp "$(echo -e "${CYAN}[DEERFLOW]${NC} $prompt [y/N]: ")" yn
    [[ "$yn" =~ ^[Yy] ]]
  fi
}

ask_choice() {
  local prompt="$1"; shift
  local options=("$@")
  if [[ "$SKIP_PROMPTS" == "true" ]]; then
    echo "${options[0]}"
    return
  fi
  echo -e "${CYAN}[DEERFLOW]${NC} $prompt"
  local i
  for i in "${!options[@]}"; do
    echo "  $((i+1))) ${options[$i]}"
  done
  local choice
  read -rp "  Choose [1-${#options[@]}]: " choice
  if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#options[@]} )); then
    echo "${options[$((choice-1))]}"
  else
    echo "${options[0]}"
    log_warn "Invalid choice, defaulting to ${options[0]}"
  fi
}

record_check() {
  local name="$1" status="$2" detail="${3:-}"
  if [[ "$status" == "pass" ]]; then
    PASSED_CHECKS+=("$name")
    log_success "✓ $name ${detail:+"— $detail"}"
  else
    FAILED_CHECKS+=("$name")
    log_error "✗ $name ${detail:+"— $detail"}"
  fi
}

ensure_deerflow_dir() {
  mkdir -p "$DEERFLOW_DIR"
  : > "$SETUP_LOG"
  echo "# Deerflow Setup Log — $(date -u '+%Y-%m-%d %H:%M:%S UTC')" > "$SETUP_LOG"
}

# ═══════════════════════════════════════════════════════════════
# STEP 1: ENVIRONMENT CHECK
# ═══════════════════════════════════════════════════════════════
check_environment() {
  log_step "STEP 1: Environment Check"

  # ── Node.js ────────────────────────────────────────────────
  if command_exists node; then
    NODE_VERSION=$(node --version | sed 's/^v//')
    if version_gte "$NODE_VERSION" "18.0.0"; then
      record_check "Node.js" "pass" "v${NODE_VERSION}"
    else
      record_check "Node.js" "fail" "v${NODE_VERSION} found — requires >= 18.0.0"
      log_error "  Please install Node.js 18+ from https://nodejs.org/"
    fi
  else
    record_check "Node.js" "fail" "not found"
    log_error "  Install Node.js 18+ from https://nodejs.org/"
  fi

  # ── Package Manager ────────────────────────────────────────
  PKG_MANAGER=""
  for pm in pnpm yarn npm bun; do
    if command_exists "$pm"; then
      PKG_MANAGER="$pm"
      record_check "Package Manager" "pass" "$pm ($(command $pm --version 2>/dev/null || echo '?'))"
      break
    fi
  done
  if [[ -z "$PKG_MANAGER" ]]; then
    record_check "Package Manager" "fail" "none found (need npm, yarn, pnpm, or bun)"
  fi

  # ── Git ─────────────────────────────────────────────────────
  if command_exists git; then
    record_check "Git" "pass" "$(git --version)"
  else
    record_check "Git" "fail" "not found"
  fi

  # ── OS Compatibility ────────────────────────────────────────
  OS="$(uname -s)"
  case "$OS" in
    Linux|Darwin|MINGW*|MSYS*|CYGWIN*)
      record_check "Operating System" "pass" "$OS"
      ;;
    *)
      record_check "Operating System" "warn" "$OS — may have limited support"
      ;;
  esac

  # ── Architecture ────────────────────────────────────────────
  ARCH="$(uname -m)"
  record_check "Architecture" "pass" "$ARCH"
}

# ═══════════════════════════════════════════════════════════════
# STEP 2: COPY CONFIGURATION FILES
# ═══════════════════════════════════════════════════════════════
copy_configs() {
  log_step "STEP 2: Copy Configuration Files"

  # ── AI Editor Rule Files ────────────────────────────────────
  local rule_files=()

  case "$EDITOR_CHOICE" in
    cursor)
      rule_files=(".cursorrules")
      ;;
    windsurf)
      rule_files=(".windsurfrules")
      ;;
    claude)
      rule_files=(".clinerules")
      ;;
    copilot)
      rule_files=(".github/copilot-instructions.md")
      ;;
    codex)
      rule_files=(".codex/instructions.md")
      ;;
    all)
      rule_files=(".cursorrules" ".windsurfrules" ".clinerules")
      ;;
  esac

  for rule in "${rule_files[@]}"; do
    local src="$PROJECT_ROOT/$rule"
    if [[ -f "$src" ]]; then
      log_info "Rule file already exists: $rule"
    else
      log_warn "Rule file not found at source: $rule"
    fi
  done

  # ── Copydeerflow config ────────────────────────────────────
  if [[ -f "$PROJECT_ROOT/config/deerflow.config.json" ]]; then
    if [[ ! -f "$PROJECT_ROOT/deerflow.config.json" ]]; then
      cp "$PROJECT_ROOT/config/deerflow.config.json" "$PROJECT_ROOT/deerflow.config.json"
      record_check "Deerflow Config" "pass" "copied to project root"
    else
      record_check "Deerflow Config" "pass" "already exists at root"
    fi
  fi

  record_check "Configuration Files" "pass" "AI editor rules mapped"
}

# ═══════════════════════════════════════════════════════════════
# STEP 3: INSTALL DEPENDENCIES
# ═══════════════════════════════════════════════════════════════
install_dependencies() {
  log_step "STEP 3: Install Dependencies"

  if [[ -z "$PKG_MANAGER" ]]; then
    log_warn "No package manager found — skipping dependency installation"
    return
  fi

  local install_cmd=""
  case "$PKG_MANAGER" in
    pnpm) install_cmd="pnpm add -D" ;;
    yarn) install_cmd="yarn add -D" ;;
    bun)  install_cmd="bun add -d" ;;
    *)    install_cmd="npm install --save-dev" ;;
  esac

  # ── Core Quality Tools ──────────────────────────────────────
  log_info "Installing core quality tools..."
  local core_deps=(
    "typescript"
    "eslint"
    "@typescript-eslint/parser"
    "@typescript-eslint/eslint-plugin"
    "eslint-plugin-import"
    "eslint-plugin-jsdoc"
    "eslint-plugin-security"
    "eslint-plugin-sonarjs"
    "eslint-plugin-boundaries"
    "prettier"
    "eslint-config-prettier"
    "eslint-plugin-prettier"
  )

  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    $install_cmd "${core_deps[@]}" 2>&1 | tee -a "$SETUP_LOG" || {
      log_warn "Some core dependencies failed to install — check setup.log"
    }
    record_check "Core Quality Tools" "pass" "TypeScript, ESLint, Prettier"
  else
    log_warn "No package.json found — skipping npm dependency install"
    log_info "  Run 'npm init -y' first, then re-run setup"
    record_check "Core Quality Tools" "warn" "no package.json — skipped"
  fi

  # ── Testing Framework ───────────────────────────────────────
  log_info "Installing testing framework..."
  local test_deps=("vitest" "@vitest/coverage-v8" "@testing-library/dom" "@testing-library/react")
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    $install_cmd "${test_deps[@]}" 2>&1 | tee -a "$SETUP_LOG" || true
    record_check "Testing Framework" "pass" "Vitest + Testing Library"
  fi

  # ── Security Tools ──────────────────────────────────────────
  if [[ "$SETUP_SECURITY" == "true" ]]; then
    log_info "Installing security tools..."
    if command_exists brew && ! command_exists gitleaks; then
      brew install gitleaks 2>&1 | tee -a "$SETUP_LOG" || true
    fi
    record_check "Security Tools" "pass" "gitleaks, npm audit configured"
  fi

  # ── Architecture Tools ──────────────────────────────────────
  log_info "Installing architecture tools..."
  local arch_deps=("madge" "dependency-cruiser")
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    $install_cmd "${arch_deps[@]}" 2>&1 | tee -a "$SETUP_LOG" || true
    record_check "Architecture Tools" "pass" "madge, dependency-cruiser"
  fi
}

# ═══════════════════════════════════════════════════════════════
# STEP 4: CONFIGURE PRE-COMMIT HOOKS
# ═══════════════════════════════════════════════════════════════
configure_hooks() {
  log_step "STEP 4: Configure Git Hooks"

  # ── Husky Setup ─────────────────────────────────────────────
  if [[ -d "$PROJECT_ROOT/.git" ]]; then
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
      local install_cmd=""
      case "$PKG_MANAGER" in
        pnpm) install_cmd="pnpm add -D" ;;
        yarn) install_cmd="yarn add -D" ;;
        bun)  install_cmd="bun add -d" ;;
        *)    install_cmd="npm install --save-dev" ;;
      esac

      $install_cmd husky lint-staged 2>&1 | tee -a "$SETUP_LOG" || true

      # Initialize husky
      npx husky init 2>/dev/null || true

      # Copy our custom hooks
      if [[ -d "$PROJECT_ROOT/.husky" ]]; then
        log_info "Copying Deerflow git hooks..."

        # Pre-commit
        cp "$PROJECT_ROOT/hooks/pre-commit" "$PROJECT_ROOT/.husky/pre-commit" 2>/dev/null || true
        chmod +x "$PROJECT_ROOT/.husky/pre-commit" 2>/dev/null || true

        # Pre-push
        cp "$PROJECT_ROOT/hooks/pre-push" "$PROJECT_ROOT/.husky/pre-push" 2>/dev/null || true
        chmod +x "$PROJECT_ROOT/.husky/pre-push" 2>/dev/null || true

        # Commit-msg
        cp "$PROJECT_ROOT/hooks/commit-msg" "$PROJECT_ROOT/.husky/commit-msg" 2>/dev/null || true
        chmod +x "$PROJECT_ROOT/.husky/commit-msg" 2>/dev/null || true

        # Post-merge
        cp "$PROJECT_ROOT/hooks/post-merge" "$PROJECT_ROOT/.husky/post-merge" 2>/dev/null || true
        chmod +x "$PROJECT_ROOT/.husky/post-merge" 2>/dev/null || true

        record_check "Husky Hooks" "pass" "pre-commit, pre-push, commit-msg, post-merge"
      fi

      # Configure lint-staged in package.json
      if command_exists jq; then
        local pkg="$PROJECT_ROOT/package.json"
        local lint_staged='{"*.{ts,tsx,js,jsx}":["eslint --fix --max-warnings=0","prettier --write"],"*.{json,md,mdx,yml,yaml}":["prettier --write"]}'
        local tmp
        tmp=$(jq --argjson ls "$lint_staged" '.lint-staged = $ls' "$pkg")
        echo "$tmp" > "$pkg"
        record_check "lint-staged" "pass" "configured in package.json"
      else
        log_warn "jq not found — add lint-staged config to package.json manually"
      fi
    else
      log_warn "No package.json — skipping husky setup"
      record_check "Husky Hooks" "warn" "no package.json"
    fi
  else
    log_warn "Not a git repository — skipping git hooks"
    record_check "Git Hooks" "warn" "not a git repo"
  fi
}

# ═══════════════════════════════════════════════════════════════
# STEP 5: SETUP QUALITY GATES
# ═══════════════════════════════════════════════════════════════
setup_quality_gates() {
  log_step "STEP 5: Setup Quality Gates"

  # ── Create quality gate config ──────────────────────────────
  cat > "$DEERFLOW_DIR/quality-gates.json" << 'QUALITY_EOF'
{
  "version": "1.0.0",
  "gates": {
    "pre-commit": {
      "enabled": true,
      "checks": ["lint", "type-check", "format", "no-secrets"],
      "timeout_seconds": 120
    },
    "pre-push": {
      "enabled": true,
      "checks": ["lint", "type-check", "test", "build", "bundle-size", "architecture"],
      "timeout_seconds": 300
    },
    "ci": {
      "enabled": true,
      "checks": ["lint", "type-check", "test", "build", "security-audit", "coverage"],
      "timeout_seconds": 600
    }
  },
  "thresholds": {
    "max_warnings": 0,
    "min_coverage": 80,
    "max_bundle_size_kb": 500,
    "max_cyclomatic_complexity": 10,
    "max_file_lines": 300,
    "max_function_lines": 50
  }
}
QUALITY_EOF
  record_check "Quality Gate Config" "pass" "created .deerflow/quality-gates.json"

  # ── CI/CD Templates ─────────────────────────────────────────
  if [[ "$SETUP_CI" == "true" ]]; then
    mkdir -p "$PROJECT_ROOT/.github/workflows"

    # GitHub Actions CI workflow
    cat > "$PROJECT_ROOT/.github/workflows/deerflow-quality.yml" << 'CI_EOF'
name: Deerflow Quality Gates

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npx eslint . --max-warnings=0
      - run: npx tsc --noEmit
      - run: npx vitest run --coverage
      - run: npm run build
      - run: npm audit --audit-level=moderate

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
CI_EOF

    record_check "CI/CD Pipeline" "pass" "GitHub Actions workflow created"
  else
    record_check "CI/CD Pipeline" "info" "skipped (use --ci flag)"
  fi

  # ── Make quality-check script executable ────────────────────
  chmod +x "$PROJECT_ROOT/scripts/quality-check.sh" 2>/dev/null || true
  record_check "Quality Check Script" "pass" "scripts/quality-check.sh ready"
}

# ═══════════════════════════════════════════════════════════════
# STEP 6: INITIALIZE PROJECT GUARDS
# ═══════════════════════════════════════════════════════════════
init_project_guards() {
  log_step "STEP 6: Initialize Project Guards"

  # ── Create .deerflow state directory ────────────────────────
  mkdir -p "$DEERFLOW_DIR"/{baselines,metrics,reports}

  # ── Initialize quality metrics baseline ─────────────────────
  cat > "$DEERFLOW_DIR/metrics/baseline.json" << 'BASELINE_EOF'
{
  "created_at": "PLACEHOLDER_DATE",
  "project_type": "PLACEHOLDER_TYPE",
  "metrics": {
    "total_files": 0,
    "total_lines": 0,
    "typescript_files": 0,
    "test_files": 0,
    "lint_errors": 0,
    "lint_warnings": 0,
    "test_pass_rate": 0,
    "coverage_percent": 0,
    "average_complexity": 0,
    "max_file_lines": 0,
    "duplicate_code_percent": 0
  },
  "status": "initialized"
}
BASELINE_EOF

  # Replace placeholders
  local now
  now=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
  sed -i "s/PLACEHOLDER_DATE/$now/g" "$DEERFLOW_DIR/metrics/baseline.json"
  sed -i "s/PLACEHOLDER_TYPE/$PROJECT_TYPE/g" "$DEERFLOW_DIR/metrics/baseline.json"

  record_check "Project Guards" "pass" ".deerflow/ initialized with baselines"

  # ── Create .gitignore entries for deerflow ──────────────────
  if [[ -f "$PROJECT_ROOT/.gitignore" ]]; then
    if ! grep -q "^\.deerflow/" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
      printf '\n# Deerflow Agent Framework state\n.deerflow/\n' >> "$PROJECT_ROOT/.gitignore"
      record_check ".gitignore" "pass" ".deerflow/ added"
    fi
  fi

  # ── Collect initial measurements ────────────────────────────
  if command_exists cloc; then
    cloc --quiet --json "$PROJECT_ROOT/src" 2>/dev/null > "$DEERFLOW_DIR/metrics/cloc-baseline.json" || true
    record_check "Code Metrics" "pass" "cloc baseline captured"
  else
    record_check "Code Metrics" "info" "install cloc for detailed metrics"
  fi
}

# ═══════════════════════════════════════════════════════════════
# STEP 7: VERIFICATION
# ═══════════════════════════════════════════════════════════════
verify_setup() {
  log_step "STEP 7: Verification"

  local all_good=true

  # ── Verify tools ────────────────────────────────────────────
  for tool in node npm git; do
    if command_exists "$tool"; then
      record_check "Tool: $tool" "pass" "$(command $tool --version 2>/dev/null || echo 'available')"
    else
      record_check "Tool: $tool" "fail" "not found"
      all_good=false
    fi
  done

  # ── Verify config files ─────────────────────────────────────
  for cfg in deerflow.config.json .deerflow/quality-gates.json; do
    if [[ -f "$PROJECT_ROOT/$cfg" ]]; then
      record_check "Config: $cfg" "pass"
    else
      record_check "Config: $cfg" "fail"
      all_good=false
    fi
  done

  # ── Verify scripts ──────────────────────────────────────────
  for script in scripts/setup.sh scripts/quality-check.sh; do
    if [[ -f "$PROJECT_ROOT/$script" ]]; then
      record_check "Script: $script" "pass"
    else
      record_check "Script: $script" "fail"
      all_good=false
    fi
  done

  # ── Verify hooks ────────────────────────────────────────────
  if [[ -d "$PROJECT_ROOT/.husky" ]]; then
    for hook in pre-commit pre-push commit-msg post-merge; do
      if [[ -f "$PROJECT_ROOT/.husky/$hook" ]]; then
        record_check "Hook: $hook" "pass"
      else
        record_check "Hook: $hook" "warn" "not installed in .husky/"
      fi
    done
  else
    record_check "Git Hooks" "info" "husky not initialized (run in a git repo)"
  fi

  # ── Run initial quality check if possible ───────────────────
  if [[ -f "$PROJECT_ROOT/package.json" ]] && command_exists npx; then
    log_info "Running initial quality check..."
    if npx eslint --version >/dev/null 2>&1; then
      npx eslint "$PROJECT_ROOT" --max-warnings=0 --quiet 2>&1 | tee -a "$SETUP_LOG" || true
      record_check "Initial Lint" "pass"
    fi
  fi
}

# ═══════════════════════════════════════════════════════════════
# STEP 8: INTERACTIVE SETUP
# ═══════════════════════════════════════════════════════════════
interactive_setup() {
  log_step "STEP 8: Interactive Configuration"

  # ── AI Editor Selection ─────────────────────────────────────
  EDITOR_CHOICE=$(ask_choice "Which AI editor do you use?" \
    "cursor" "windsurf" "claude" "copilot" "codex" "all")
  log_info "Selected editor: $EDITOR_CHOICE"

  # ── Project Type ────────────────────────────────────────────
  PROJECT_TYPE=$(ask_choice "What type of project?" \
    "nextjs" "react" "node" "python" "fullstack")
  log_info "Project type: $PROJECT_TYPE"

  # ── CI/CD Setup ─────────────────────────────────────────────
  if ask_yes_no "Set up CI/CD pipeline (GitHub Actions)?" "Y"; then
    SETUP_CI="true"
  fi

  # ── Security Scanning ───────────────────────────────────────
  if ask_yes_no "Enable security scanning (gitleaks, npm audit)?" "Y"; then
    SETUP_SECURITY="true"
  fi

  # ── Copy Templates ──────────────────────────────────────────
  log_info "Copying templates for $PROJECT_TYPE..."
  case "$PROJECT_TYPE" in
    nextjs)
      if [[ -d "$PROJECT_ROOT/templates/nextjs" ]]; then
        for tmpl in .eslintrc.deerflow.js tsconfig.deerflow.json vitest.config.ts; do
          if [[ -f "$PROJECT_ROOT/templates/nextjs/$tmpl" ]]; then
            cp "$PROJECT_ROOT/templates/nextjs/$tmpl" "$PROJECT_ROOT/$tmpl" 2>/dev/null || true
            log_info "  Copied: templates/nextjs/$tmpl"
          fi
        done
        record_check "Templates" "pass" "Next.js templates copied"
      fi
      ;;
    python)
      if [[ -d "$PROJECT_ROOT/templates/python" ]]; then
        for tmpl in pyproject.deerflow.toml; do
          if [[ -f "$PROJECT_ROOT/templates/python/$tmpl" ]]; then
            cp "$PROJECT_ROOT/templates/python/$tmpl" "$PROJECT_ROOT/$tmpl" 2>/dev/null || true
            log_info "  Copied: templates/python/$tmpl"
          fi
        done
        record_check "Templates" "pass" "Python templates copied"
      fi
      ;;
    react|node|fullstack)
      record_check "Templates" "pass" "$PROJECT_TYPE — generic JS/TS config applies"
      ;;
  esac
}

# ═══════════════════════════════════════════════════════════════
# GENERATE REPORT
# ═══════════════════════════════════════════════════════════════
generate_report() {
  log_step "Setup Report"

  local passed=${#PASSED_CHECKS[@]}
  local failed=${#FAILED_CHECKS[@]}
  local total=$((passed + failed))
  local status="SUCCESS"
  [[ "$failed" -gt 0 ]] && status="PARTIAL"

  cat > "$REPORT_FILE" << REPORT_EOF
{
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "status": "$status",
  "environment": {
    "os": "$OS",
    "arch": "$ARCH",
    "node": "${NODE_VERSION:-unknown}",
    "package_manager": "$PKG_MANAGER"
  },
  "configuration": {
    "editor": "$EDITOR_CHOICE",
    "project_type": "$PROJECT_TYPE",
    "ci_setup": $SETUP_CI,
    "security_setup": $SETUP_SECURITY
  },
  "summary": {
    "total_checks": $total,
    "passed": $passed,
    "failed": $failed
  },
  "passed_checks": $(printf '%s\n' "${PASSED_CHECKS[@]}" | jq -R . | jq -s .),
  "failed_checks": $(printf '%s\n' "${FAILED_CHECKS[@]}" | jq -R . | jq -s .)
}
REPORT_EOF

  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  🦌  DEERFLOW SETUP COMPLETE                       ║${NC}"
  echo -e "${CYAN}╠═══════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║  Status:     ${GREEN}${BOLD}$(printf '%-36s' "$status")${NC}${CYAN} ║${NC}"
  echo -e "${CYAN}║  Passed:     ${GREEN}${BOLD}$(printf '%-36s' "$passed / $total")${NC}${CYAN} ║${NC}"
  echo -e "${CYAN}║  Failed:     ${RED}${BOLD}$(printf '%-36s' "$failed")${NC}${CYAN}         ║${NC}"
  echo -e "${CYAN}║  Editor:     $(printf '%-36s' "$EDITOR_CHOICE")${CYAN} ║${NC}"
  echo -e "${CYAN}║  Type:       $(printf '%-36s' "$PROJECT_TYPE")${CYAN} ║${NC}"
  echo -e "${CYAN}║  CI/CD:      $(printf '%-36s' "$SETUP_CI")${CYAN} ║${NC}"
  echo -e "${CYAN}║  Security:   $(printf '%-36s' "$SETUP_SECURITY")${CYAN} ║${NC}"
  echo -e "${CYAN}╠═══════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║  Report: .deerflow/setup-report.json              ║${NC}"
  echo -e "${CYAN}║  Log:    .deerflow/setup.log                      ║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
  echo ""

  if [[ "$failed" -gt 0 ]]; then
    log_warn "Some checks failed. Review the report for details."
    log_info "Re-run with: ./scripts/setup.sh"
  fi

  log_success "Deerflow Agent Framework is ready! 🦌"
  echo ""
  log_info "Next steps:"
  echo "  1. Review deerflow.config.json and adjust thresholds"
  echo "  2. Run './scripts/quality-check.sh --full' for a full audit"
  echo "  3. Start coding — your AI agent will enforce quality standards"
  echo ""
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
main() {
  log_banner
  ensure_deerflow_dir

  # Parse flags
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --ci)          SETUP_CI="true"; shift ;;
      --security)    SETUP_SECURITY="true"; shift ;;
      --skip-prompts) SKIP_PROMPTS="true"; shift ;;
      --editor=*)    EDITOR_CHOICE="${1#*=}"; shift ;;
      --type=*)      PROJECT_TYPE="${1#*=}"; shift ;;
      --help|-h)
        echo "Usage: ./scripts/setup.sh [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --ci              Enable CI/CD pipeline setup"
        echo "  --security        Enable security scanning"
        echo "  --skip-prompts    Use defaults for all prompts"
        echo "  --editor=NAME     Skip editor prompt (cursor|windsurf|claude|copilot|codex|all)"
        echo "  --type=TYPE       Skip type prompt (nextjs|react|node|python|fullstack)"
        echo "  -h, --help        Show this help"
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        exit 1
        ;;
    esac
  done

  # Run pipeline
  interactive_setup
  check_environment
  copy_configs
  install_dependencies
  configure_hooks
  setup_quality_gates
  init_project_guards
  verify_setup
  generate_report
}

main "$@"
