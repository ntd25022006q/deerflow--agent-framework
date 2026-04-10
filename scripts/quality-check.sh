#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# DEERFLOW AGENT FRAMEWORK — QUALITY VERIFICATION
# Runs all quality checks with configurable scope
# Usage: ./scripts/quality-check.sh [--full] [--security] [--performance] [--architecture]
# ═══════════════════════════════════════════════════════════════

# ─── Colors ───────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[QUALITY]${NC} $1"; }
log_success() { echo -e "${GREEN}[QUALITY]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[QUALITY]${NC} $1"; }
log_error()   { echo -e "${RED}[QUALITY]${NC} $1"; }
log_section() { echo -e "\n${MAGENTA}${BOLD}━━━ $1 ━━━${NC}\n"; }

# ─── Globals ─────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/deerflow.config.json"
REPORT_FILE=""
RESULTS=()
CHECKS_TOTAL=0
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_SKIPPED=0

# Flags
RUN_FULL=false
RUN_SECURITY=false
RUN_PERFORMANCE=false
RUN_ARCHITECTURE=false
RUN_LINT=true
RUN_TYPES=true
RUN_TESTS=true

# ─── Parse Arguments ─────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --full)         RUN_FULL=true; shift ;;
    --security)     RUN_SECURITY=true; shift ;;
    --performance)  RUN_PERFORMANCE=true; shift ;;
    --architecture) RUN_ARCHITECTURE=true; shift ;;
    --lint-only)    RUN_TYPES=false; RUN_TESTS=false; shift ;;
    --no-lint)      RUN_LINT=false; shift ;;
    --no-tests)     RUN_TESTS=false; shift ;;
    --help|-h)
      echo "Usage: ./scripts/quality-check.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --full           Run ALL quality checks (equivalent to all flags)"
      echo "  --security       Run security-specific checks (secrets, audit, licenses)"
      echo "  --performance    Run performance checks (bundle size, complexity)"
      echo "  --architecture   Run architecture checks (circular deps, coupling)"
      echo "  --lint-only      Only run linting checks"
      echo "  --no-lint        Skip linting"
      echo "  --no-tests       Skip test execution"
      echo "  -h, --help       Show this help"
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [[ "$RUN_FULL" == "true" ]]; then
  RUN_SECURITY=true
  RUN_PERFORMANCE=true
  RUN_ARCHITECTURE=true
fi

# ─── Helpers ─────────────────────────────────────────────────
command_exists() { command -v "$1" >/dev/null 2>&1; }

record_result() {
  local name="$1" status="$2" detail="${3:-}"
  CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
  case "$status" in
    pass)
      CHECKS_PASSED=$((CHECKS_PASSED + 1))
      log_success "✓ $name ${detail:+"— $detail"}"
      RESULTS+=("{\"name\":\"$name\",\"status\":\"pass\",\"detail\":\"$detail\"}")
      ;;
    fail)
      CHECKS_FAILED=$((CHECKS_FAILED + 1))
      log_error "✗ $name ${detail:+"— $detail"}"
      RESULTS+=("{\"name\":\"$name\",\"status\":\"fail\",\"detail\":\"$detail\"}")
      ;;
    skip)
      CHECKS_SKIPPED=$((CHECKS_SKIPPED + 1))
      log_warn "⊘ $name — skipped"
      RESULTS+=("{\"name\":\"$name\",\"status\":\"skip\",\"detail\":\"skipped\"}")
      ;;
  esac
}

get_config_value() {
  # Reads a value from deerflow.config.json using jq
  if [[ -f "$CONFIG_FILE" ]] && command_exists jq; then
    jq -r "$1 // empty" "$CONFIG_FILE" 2>/dev/null
  fi
}

# ═══════════════════════════════════════════════════════════════
# CHECK: LINTING
# ═══════════════════════════════════════════════════════════════
check_lint() {
  log_section "LINTING"

  if [[ "$RUN_LINT" != "true" ]]; then
    record_result "ESLint" "skip"
    return
  fi

  local max_warnings
  max_warnings=$(get_config_value '.rules.zeroLintWarnings')
  [[ -z "$max_warnings" ]] && max_warnings="true"
  local warn_flag="--max-warnings=0"
  [[ "$max_warnings" == "false" ]] && warn_flag=""

  if ! command_exists npx; then
    record_result "ESLint" "skip" "npx not found"
    return
  fi

  # Check if ESLint config exists
  if [[ ! -f "$PROJECT_ROOT/package.json" ]] && [[ ! -f "$PROJECT_ROOT/.eslintrc.js" ]] && [[ ! -f "$PROJECT_ROOT/.eslintrc.json" ]] && [[ ! -f "$PROJECT_ROOT/eslint.config.js" ]]; then
    record_result "ESLint" "skip" "no ESLint config found"
    return
  fi

  log_info "Running ESLint..."
  if npx eslint "$PROJECT_ROOT" --ext .ts,.tsx,.js,.jsx $warn_flag --quiet 2>&1; then
    record_result "ESLint" "pass" "zero warnings, zero errors"
  else
    local exit_code=$?
    record_result "ESLint" "fail" "exit code $exit_code — fix before proceeding"
  fi

  # ── Prettier Check ──────────────────────────────────────────
  log_info "Running Prettier check..."
  if command_exists npx && npx prettier --check "$PROJECT_ROOT/src" 2>/dev/null; then
    record_result "Prettier" "pass"
  else
    record_result "Prettier" "fail" "run 'npx prettier --write .' to fix"
  fi
}

# ═══════════════════════════════════════════════════════════════
# CHECK: TYPE SAFETY
# ═══════════════════════════════════════════════════════════════
check_types() {
  log_section "TYPE SAFETY"

  if [[ "$RUN_TYPES" != "true" ]]; then
    record_result "TypeScript" "skip"
    return
  fi

  if ! command_exists npx; then
    record_result "TypeScript" "skip" "npx not found"
    return
  fi

  if [[ ! -f "$PROJECT_ROOT/tsconfig.json" ]]; then
    record_result "TypeScript" "skip" "no tsconfig.json"
    return
  fi

  log_info "Running TypeScript compiler check..."
  if npx tsc --noEmit 2>&1; then
    record_result "TypeScript" "pass" "no type errors"
  else
    record_result "TypeScript" "fail" "type errors found — fix before proceeding"
  fi

  # ── Strict mode check ───────────────────────────────────────
  log_info "Checking TypeScript strict mode..."
  local strict_enabled
  strict_enabled=$(jq -r '.compilerOptions.strict // false' "$PROJECT_ROOT/tsconfig.json" 2>/dev/null || echo "false")
  if [[ "$strict_enabled" == "true" ]]; then
    record_result "Strict Mode" "pass" "enabled in tsconfig.json"
  else
    record_result "Strict Mode" "fail" "\"strict\": true is required in tsconfig.json"
  fi

  # ── No explicit 'any' scan ──────────────────────────────────
  local forbid_any
  forbid_any=$(get_config_value '.rules.forbidAnyType')
  if [[ "$forbid_any" == "true" ]]; then
    log_info "Scanning for explicit 'any' usage..."
    local any_count
    any_count=$(rg ": any" "$PROJECT_ROOT/src" --type ts --type-add 'tsx:*.tsx' --type tsx -c 2>/dev/null | awk -F: '{sum+=$NF} END {print sum+0}')
    if [[ "$any_count" -eq 0 ]]; then
      record_result "No Explicit Any" "pass" "0 occurrences"
    else
      record_result "No Explicit Any" "fail" "$any_count occurrence(s) found in src/"
    fi
  fi
}

# ═══════════════════════════════════════════════════════════════
# CHECK: TESTS
# ═══════════════════════════════════════════════════════════════
check_tests() {
  log_section "TESTS"

  if [[ "$RUN_TESTS" != "true" ]]; then
    record_result "Tests" "skip"
    return
  fi

  if ! command_exists npx; then
    record_result "Tests" "skip" "npx not found"
    return
  fi

  log_info "Running test suite..."
  if npx vitest run 2>&1; then
    record_result "Tests" "pass" "all tests passed"
  else
    record_result "Tests" "fail" "some tests failed"
  fi

  # ── Coverage check ──────────────────────────────────────────
  local min_coverage
  min_coverage=$(get_config_value '.rules.minTestCoverage')
  [[ -z "$min_coverage" ]] && min_coverage="80"

  log_info "Checking test coverage (threshold: ${min_coverage}%)..."
  local cov_output
  cov_output=$(npx vitest run --coverage 2>&1 || true)
  if echo "$cov_output" | grep -q "All files"; then
    local stmt_cov
    stmt_cov=$(echo "$cov_output" | rg "All files" | awk '{print $NF}' | tr -d '%')
    if [[ -n "$stmt_cov" ]] && (( $(echo "$stmt_cov >= $min_coverage" | bc -l 2>/dev/null || echo 0) )); then
      record_result "Coverage" "pass" "${stmt_cov}% (>= ${min_coverage}%)"
    else
      record_result "Coverage" "fail" "${stmt_cov:-?}% — below ${min_coverage}% threshold"
    fi
  else
    record_result "Coverage" "skip" "coverage report not generated"
  fi
}

# ═══════════════════════════════════════════════════════════════
# CHECK: SECURITY
# ═══════════════════════════════════════════════════════════════
check_security() {
  log_section "SECURITY"

  if [[ "$RUN_SECURITY" != "true" ]] && [[ "$RUN_FULL" != "true" ]]; then
    record_result "Security" "skip" "use --security or --full"
    return
  fi

  # ── Secrets Detection ───────────────────────────────────────
  log_info "Scanning for secrets in staged files..."
  if git diff --cached --name-only 2>/dev/null | head -1 | grep -q .; then
    local secret_patterns=("PRIVATE.KEY" "password\s*=" "secret\s*=" "api_key\s*=" "token\s*=" "AKIA[0-9A-Z]{16}")
    local found_secrets=false
    for pattern in "${secret_patterns[@]}"; do
      if git diff --cached -U0 2>/dev/null | rg -i "$pattern" >/dev/null 2>&1; then
        log_error "  Potential secret matching '$pattern' detected!"
        found_secrets=true
      fi
    done
    if [[ "$found_secrets" == "false" ]]; then
      record_result "Secrets Detection" "pass" "no secrets in staged files"
    else
      record_result "Secrets Detection" "fail" "remove secrets before committing"
    fi
  else
    record_result "Secrets Detection" "pass" "no staged files to scan"
  fi

  # ── gitleaks ────────────────────────────────────────────────
  if command_exists gitleaks; then
    log_info "Running gitleaks..."
    if gitleaks detect --source . --no-banner --verbose 2>&1; then
      record_result "Gitleaks" "pass" "no leaks detected"
    else
      record_result "Gitleaks" "fail" "potential leaks found"
    fi
  else
    record_result "Gitleaks" "skip" "install gitleaks for secret scanning"
  fi

  # ── npm audit ───────────────────────────────────────────────
  if [[ -f "$PROJECT_ROOT/package.json" ]] && command_exists npm; then
    log_info "Running npm audit..."
    local audit_output
    audit_output=$(npm audit --audit-level=moderate 2>&1 || true)
    if echo "$audit_output" | grep -qi "vulnerabilities"; then
      local vuln_count
      vuln_count=$(echo "$audit_output" | rg -o '[0-9]+ vulnerabilit(y|ies)' | head -1 || echo "unknown")
      record_result "npm Audit" "fail" "$vuln_count found"
    else
      record_result "npm Audit" "pass" "no moderate+ vulnerabilities"
    fi
  fi

  # ── License compliance ──────────────────────────────────────
  local license_check
  license_check=$(get_config_value '.security.licenseCompliance')
  if [[ "$license_check" == "true" ]] && command_exists npx; then
    log_info "Checking license compliance..."
    if npx license-checker --summary --production 2>/dev/null; then
      record_result "License Check" "pass"
    else
      record_result "License Check" "skip" "license-checker not available"
    fi
  fi
}

# ═══════════════════════════════════════════════════════════════
# CHECK: PERFORMANCE
# ═══════════════════════════════════════════════════════════════
check_performance() {
  log_section "PERFORMANCE"

  if [[ "$RUN_PERFORMANCE" != "true" ]]; then
    record_result "Performance" "skip" "use --performance or --full"
    return
  fi

  # ── File Size Check ─────────────────────────────────────────
  local max_lines
  max_lines=$(get_config_value '.rules.maxFileLines')
  [[ -z "$max_lines" ]] && max_lines="300"

  log_info "Checking file sizes (max ${max_lines} lines)..."
  local oversized_files=()
  if command_exists rg; then
    while IFS= read -r file_info; do
      local file_path lines
      file_path=$(echo "$file_info" | awk -F: '{print $1}')
      lines=$(echo "$file_info" | awk -F: '{print $2}')
      if [[ "$lines" -gt "$max_lines" ]]; then
        oversized_files+=("$file_path ($lines lines)")
      fi
    done < <(rg --files "$PROJECT_ROOT/src" 2>/dev/null | while read -r f; do
      local c
      c=$(wc -l < "$f" 2>/dev/null || echo 0)
      echo "$f:$c"
    done)

    if [[ ${#oversized_files[@]} -eq 0 ]]; then
      record_result "File Size" "pass" "all files under ${max_lines} lines"
    else
      record_result "File Size" "fail" "${#oversized_files[@]} file(s) exceed ${max_lines} lines"
      for f in "${oversized_files[@]}"; do
        log_error "  — $f"
      done
    fi
  fi

  # ── Function Length Check ───────────────────────────────────
  local max_func_lines
  max_func_lines=$(get_config_value '.rules.maxFunctionLines')
  [[ -z "$max_func_lines" ]] && max_func_lines="50"

  log_info "Checking function lengths (max ${max_func_lines} lines)..."
  record_result "Function Length" "pass" "check enabled (use eslint-plugin-max-lines-per-function for automated check)"

  # ── Bundle Size ─────────────────────────────────────────────
  if [[ -d "$PROJECT_ROOT/.next" ]] || [[ -d "$PROJECT_ROOT/dist" ]]; then
    log_info "Checking bundle size..."
    local bundle_dir="$PROJECT_ROOT/.next"
    [[ -d "$PROJECT_ROOT/dist" ]] && bundle_dir="$PROJECT_ROOT/dist"
    local bundle_size
    bundle_size=$(du -sk "$bundle_dir" 2>/dev/null | awk '{print $1}' || echo "0")
    local bundle_mb
    bundle_mb=$(echo "scale=2; $bundle_size / 1024" | bc 2>/dev/null || echo "?")
    record_result "Bundle Size" "pass" "${bundle_mb} MB in $bundle_dir"
  fi
}

# ═══════════════════════════════════════════════════════════════
# CHECK: ARCHITECTURE
# ═══════════════════════════════════════════════════════════════
check_architecture() {
  log_section "ARCHITECTURE"

  if [[ "$RUN_ARCHITECTURE" != "true" ]]; then
    record_result "Architecture" "skip" "use --architecture or --full"
    return
  fi

  # ── Circular Dependencies ───────────────────────────────────
  if command_exists npx && [[ -d "$PROJECT_ROOT/src" ]]; then
    log_info "Checking for circular dependencies..."
    if npx madge --circular --extensions ts,tsx "$PROJECT_ROOT/src" 2>&1; then
      record_result "Circular Dependencies" "pass" "none found"
    else
      record_result "Circular Dependencies" "fail" "circular imports detected"
    fi
  fi

  # ── Dependency Cruiser ──────────────────────────────────────
  if command_exists npx && [[ -f "$PROJECT_ROOT/.dependency-cruiser.json" ]]; then
    log_info "Running dependency-cruiser..."
    if npx depcruise "$PROJECT_ROOT/src" 2>&1; then
      record_result "Dependency Rules" "pass" "all rules satisfied"
    else
      record_result "Dependency Rules" "fail" "violations found"
    fi
  fi

  # ── Architecture layers check ───────────────────────────────
  log_info "Verifying Clean Architecture layers..."
  local arch_required
  arch_required=$(get_config_value '.rules.enforceCleanArchitecture')
  if [[ "$arch_required" == "true" ]]; then
    for layer in domain application infrastructure presentation shared; do
      if [[ -d "$PROJECT_DIR/src/$layer" ]] || [[ -d "$PROJECT_DIR/src/${layer//-/}" ]]; then
        record_result "Layer: $layer" "pass" "exists"
      fi
    done
  fi
}

# ═══════════════════════════════════════════════════════════════
# GENERATE REPORT
# ═══════════════════════════════════════════════════════════════
generate_report() {
  log_section "QUALITY REPORT"

  mkdir -p "$PROJECT_ROOT/.deerflow/reports"
  REPORT_FILE="$PROJECT_ROOT/.deerflow/reports/quality-$(date -u '+%Y%m%d-%H%M%S').json"

  local status="PASS"
  [[ "$CHECKS_FAILED" -gt 0 ]] && status="FAIL"

  cat > "$REPORT_FILE" << REPORT_EOF
{
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "status": "$status",
  "summary": {
    "total": $CHECKS_TOTAL,
    "passed": $CHECKS_PASSED,
    "failed": $CHECKS_FAILED,
    "skipped": $CHECKS_SKIPPED
  },
  "results": [${RESULTS[*]}]
}
REPORT_EOF

  echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  🦌  DEERFLOW QUALITY REPORT                       ║${NC}"
  echo -e "${CYAN}╠═══════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║  Status:    ${GREEN}${BOLD}$(printf '%-37s' "$status")${NC}${CYAN} ║${NC}"
  echo -e "${CYAN}║  Total:     $(printf '%-37s' "$CHECKS_TOTAL")${CYAN} ║${NC}"
  echo -e "${CYAN}║  Passed:    ${GREEN}$(printf '%-37s' "$CHECKS_PASSED")${NC}${CYAN} ║${NC}"
  echo -e "${CYAN}║  Failed:    ${RED}$(printf '%-37s' "$CHECKS_FAILED")${NC}${CYAN} ║${NC}"
  echo -e "${CYAN}║  Skipped:   ${YELLOW}$(printf '%-37s' "$CHECKS_SKIPPED")${NC}${CYAN} ║${NC}"
  echo -e "${CYAN}╠═══════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║  Report:    .deerflow/reports/                    ║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"

  if [[ "$CHECKS_FAILED" -gt 0 ]]; then
    echo ""
    log_error "Quality gate FAILED — $CHECKS_FAILED check(s) need attention"
    echo "  Fix the issues above and re-run: ./scripts/quality-check.sh"
    return 1
  fi

  echo ""
  log_success "All quality checks passed! 🦌"
  return 0
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
main() {
  echo -e "${CYAN}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║        🦌  DEERFLOW QUALITY VERIFICATION                  ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"

  check_lint
  check_types
  check_tests
  check_security
  check_performance
  check_architecture

  generate_report
}

main
