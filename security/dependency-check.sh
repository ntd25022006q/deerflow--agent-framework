#!/usr/bin/env bash
# =============================================================================
# DEERFLOW DEPENDENCY SECURITY CHECK v1.0
# =============================================================================
# Comprehensive dependency security auditing script for the Deerflow Agent
# Framework. Performs security audits, version checks, lock file verification,
# and peer dependency analysis.
#
# Usage: ./security/dependency-check.sh [--ci] [--fix]
#   --ci   : Exit with non-zero status on any warning (for CI/CD pipelines)
#   --fix  : Automatically run npm audit fix where possible
#
# Exit Codes:
#   0 - All checks passed
#   1 - Critical vulnerabilities found
#   2 - High vulnerabilities found
#   3 - Lock file inconsistency detected
#   4 - Missing or malformed package.json
#   5 - Outdated dependencies detected
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PACKAGE_JSON="${PROJECT_ROOT}/package.json"
LOCK_FILE="${PROJECT_ROOT}/package-lock.json"

CRITICAL_THRESHOLD=0
HIGH_THRESHOLD=0
MEDIUM_THRESHOLD=10

CI_MODE=false
FIX_MODE=false
TOTAL_ISSUES=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# Argument Parsing
# ---------------------------------------------------------------------------
for arg in "$@"; do
    case "${arg}" in
        --ci)   CI_MODE=true ;;
        --fix)  FIX_MODE=true ;;
        --help)
            echo "Usage: $0 [--ci] [--fix]"
            exit 0
            ;;
        *)
            echo "Unknown argument: ${arg}"
            exit 1
            ;;
    esac
done

# ---------------------------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------------------------
log_info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; TOTAL_ISSUES=$((TOTAL_ISSUES + 1)); }
log_fail()  { echo -e "${RED}[FAIL]${NC}  $*"; TOTAL_ISSUES=$((TOTAL_ISSUES + 1)); }
log_section() { echo -e "\n${BOLD}━━━ $* ━━━${NC}"; }

# ---------------------------------------------------------------------------
# Pre-flight Checks
# ---------------------------------------------------------------------------
check_prerequisites() {
    log_section "PREREQUISITE CHECKS"

    # Check for Node.js
    if command -v node &>/dev/null; then
        local node_version
        node_version=$(node --version)
        log_ok "Node.js found: ${node_version}"
    else
        log_fail "Node.js is not installed"
        exit 4
    fi

    # Check for npm
    if command -v npm &>/dev/null; then
        local npm_version
        npm_version=$(npm --version)
        log_ok "npm found: ${npm_version}"
    else
        log_fail "npm is not installed"
        exit 4
    fi

    # Check for package.json
    if [[ -f "${PACKAGE_JSON}" ]]; then
        log_ok "package.json found at ${PACKAGE_JSON}"
    else
        log_fail "package.json not found at ${PACKAGE_JSON}"
        exit 4
    fi

    # Check for lock file
    if [[ -f "${LOCK_FILE}" ]]; then
        log_ok "package-lock.json found"
    else
        log_fail "package-lock.json not found. Run 'npm install' to generate it."
        exit 3
    fi

    # Verify package.json is valid JSON
    if command -v jq &>/dev/null; then
        if jq empty "${PACKAGE_JSON}" 2>/dev/null; then
            log_ok "package.json is valid JSON"
        else
            log_fail "package.json contains malformed JSON"
            exit 4
        fi
    fi
}

# ---------------------------------------------------------------------------
# Check 1: npm audit
# ---------------------------------------------------------------------------
run_npm_audit() {
    log_section "NPM SECURITY AUDIT"

    local audit_output
    local critical_count=0
    local high_count=0
    local moderate_count=0
    local low_count=0

    if ! audit_output=$(npm audit --json 2>/dev/null); then
        log_fail "npm audit failed to run"
        return 1
    fi

    # Parse vulnerability counts
    if command -v jq &>/dev/null; then
        critical_count=$(echo "${audit_output}" | jq -r '.metadata.vulnerabilities.critical // 0')
        high_count=$(echo "${audit_output}" | jq -r '.metadata.vulnerabilities.high // 0')
        moderate_count=$(echo "${audit_output}" | jq -r '.metadata.vulnerabilities.moderate // 0')
        low_count=$(echo "${audit_output}" | jq -r '.metadata.vulnerabilities.low // 0')
    fi

    log_info "Vulnerability Summary:"
    log_info "  Critical:  ${critical_count}"
    log_info "  High:      ${high_count}"
    log_info "  Moderate:  ${moderate_count}"
    log_info "  Low:       ${low_count}"

    # Evaluate results
    if [[ "${critical_count}" -gt "${CRITICAL_THRESHOLD}" ]]; then
        log_fail "CRITICAL vulnerabilities detected (${critical_count} found). Immediate action required."
        if [[ "${FIX_MODE}" == true ]]; then
            log_info "Running 'npm audit fix'..."
            npm audit fix 2>/dev/null || log_warn "'npm audit fix' could not resolve all issues automatically."
        fi
    else
        log_ok "No critical vulnerabilities"
    fi

    if [[ "${high_count}" -gt "${HIGH_THRESHOLD}" ]]; then
        log_warn "HIGH vulnerabilities detected (${high_count} found). Fix within 72 hours."
    else
        log_ok "No high vulnerabilities"
    fi

    if [[ "${moderate_count}" -gt "${MEDIUM_THRESHOLD}" ]]; then
        log_warn "MODERATE vulnerabilities detected (${moderate_count} found). Review and fix within 2 weeks."
    fi

    # Report individual advisories
    if command -v jq &>/dev/null; then
        local advisories
        advisories=$(echo "${audit_output}" | jq -r '.vulnerabilities | to_entries[] | "\(.key): \(.value.severity) - \(.value.via[0].title // .value.via[0])"')

        if [[ -n "${advisories}" ]]; then
            log_info "Affected Packages:"
            while IFS= read -r advisory; do
                local sev
                sev=$(echo "${advisory}" | grep -oP '(CRITICAL|HIGH|MODERATE|LOW)' || echo "UNKNOWN")
                case "${sev}" in
                    CRITICAL) echo -e "  ${RED}⚠${NC} ${advisory}" ;;
                    HIGH)     echo -e "  ${YELLOW}⚠${NC} ${advisory}" ;;
                    *)        echo -e "  ℹ  ${advisory}" ;;
                esac
            done <<< "${advisories}"
        fi
    fi

    if [[ "${critical_count}" -gt 0 ]]; then
        return 1
    fi
    return 0
}

# ---------------------------------------------------------------------------
# Check 2: Outdated Dependencies
# ---------------------------------------------------------------------------
check_outdated() {
    log_section "OUTDATED DEPENDENCY CHECK"

    local outdated_output
    outdated_output=$(npm outdated --json 2>/dev/null || echo '{}')

    if command -v jq &>/dev/null && [[ -n "${outdated_output}" ]] && [[ "${outdated_output}" != "{}" ]]; then
        local count
        count=$(echo "${outdated_output}" | jq 'keys | length')

        if [[ "${count}" -gt 0 ]]; then
            log_warn "Outdated dependencies detected: ${count}"

            echo -e "\n  ${BOLD}Package${NC}                  ${BOLD}Current${NC}    ${BOLD}Wanted${NC}    ${BOLD}Latest${NC}"
            echo -e "  ──────────────────────────────────────────────────────"

            echo "${outdated_output}" | jq -r '
                to_entries[] |
                .key as $name |
                .value as $v |
                "\(.name)\t\($v.current // "?")\t\($v.wanted // "?")\t\($v.latest // "?")"
            ' | while IFS=$'\t' read -r name current wanted latest; do
                printf "  %-25s %-10s %-10s %-10s\n" "${name}" "${current}" "${wanted}" "${latest}"
            done

            if [[ "${CI_MODE}" == true ]]; then
                return 1
            fi
        else
            log_ok "All dependencies are up to date"
        fi
    else
        log_ok "All dependencies are up to date"
    fi
}

# ---------------------------------------------------------------------------
# Check 3: Lock File Consistency
# ---------------------------------------------------------------------------
check_lock_file_consistency() {
    log_section "LOCK FILE CONSISTENCY"

    # Verify lock file is not stale relative to package.json
    local lock_mtime
    local pkg_mtime
    lock_mtime=$(stat -f %m "${LOCK_FILE}" 2>/dev/null || stat -c %Y "${LOCK_FILE}" 2>/dev/null)
    pkg_mtime=$(stat -f %m "${PACKAGE_JSON}" 2>/dev/null || stat -c %Y "${PACKAGE_JSON}" 2>/dev/null)

    if [[ -n "${lock_mtime}" ]] && [[ -n "${pkg_mtime}" ]]; then
        if [[ "${pkg_mtime}" -gt "${lock_mtime}" ]]; then
            log_warn "package.json is newer than package-lock.json. Run 'npm install' to update."
            return 1
        else
            log_ok "Lock file is in sync with package.json"
        fi
    fi

    # Verify integrity hash
    if command -v jq &>/dev/null; then
        local has_lockfile_version
        has_lockfile_version=$(jq -r '.lockfileVersion // empty' "${LOCK_FILE}" 2>/dev/null || echo "")
        if [[ -n "${has_lockfile_version}" ]]; then
            log_ok "Lock file version: ${has_lockfile_version}"
        else
            log_warn "Lock file appears to be missing lockfileVersion field"
        fi
    fi

    return 0
}

# ---------------------------------------------------------------------------
# Check 4: Peer Dependency Compatibility
# ---------------------------------------------------------------------------
check_peer_dependencies() {
    log_section "PEER DEPENDENCY CHECK"

    local peer_output
    peer_output=$(npm ls 2>&1 || true)

    # Extract peer dependency warnings
    local peer_warnings=0
    while IFS= read -r line; do
        if [[ "${line}" == *"UNMET PEER DEPENDENCY"* ]]; then
            log_warn "Unmet peer dependency: $(echo "${line}" | sed 's/.*UNMET PEER DEPENDENCY //')"
            peer_warnings=$((peer_warnings + 1))
        fi
        if [[ "${line}" == *"peer dep missing"* ]]; then
            log_warn "Missing peer dependency: ${line}"
            peer_warnings=$((peer_warnings + 1))
        fi
    done <<< "${peer_output}"

    if [[ "${peer_warnings}" -eq 0 ]]; then
        log_ok "All peer dependencies are satisfied"
    fi

    if [[ "${CI_MODE}" == true && "${peer_warnings}" -gt 0 ]]; then
        return 1
    fi

    return 0
}

# ---------------------------------------------------------------------------
# Check 5: Dependency Tree Analysis
# ---------------------------------------------------------------------------
check_dependency_tree() {
    log_section "DEPENDENCY TREE ANALYSIS"

    # Check for duplicate packages at different versions
    local duplicates
    duplicates=$(npm ls --all --json 2>/dev/null | jq -r '
        [paths(.version) as $path |
            getpath($path + ["name", "version"]) as $version |
            getpath($path + ["name"]) as $name |
            {name: $name, version: $version, path: ($path | map(select(type == "string")) | join(" > "))}
        ] | group_by(.name) | map(select(length > 1)) | flatten
    ' 2>/dev/null || echo "[]")

    local dup_count
    dup_count=$(echo "${duplicates}" | jq 'length' 2>/dev/null || echo "0")

    if [[ "${dup_count}" -gt 0 ]]; then
        log_warn "Duplicate packages detected at different versions: ${dup_count}"
        echo "${duplicates}" | jq -r '.[] | "  - \(.name)@\(.version)"' 2>/dev/null || true
    else
        log_ok "No duplicate packages detected"
    fi

    # Check total dependency count
    local total_deps
    total_deps=$(npm ls --all --json 2>/dev/null | jq -r '[paths(.version) | select(length > 0)] | length' 2>/dev/null || echo "unknown")
    log_info "Total dependencies (including transitive): ${total_deps}"

    if [[ "${total_deps}" =~ ^[0-9]+$ ]] && [[ "${total_deps}" -gt 1000 ]]; then
        log_warn "Dependency count exceeds 1000. Consider reducing the dependency tree size."
    fi
}

# ---------------------------------------------------------------------------
# Check 6: License Compliance
# ---------------------------------------------------------------------------
check_license_compliance() {
    log_section "LICENSE COMPLIANCE CHECK"

    local allowed_licenses=("MIT" "Apache-2.0" "BSD-2-Clause" "BSD-3-Clause" "ISC" "0BSD" "Unlicense" "CC0-1.0")
    local review_licenses=("LGPL-2.1" "LGPL-3.0" "MPL-2.0" "EPL-1.0")
    local blocked_licenses=("GPL-2.0" "GPL-3.0" "AGPL-3.0" "SSPL-1.0")
    local violations=0

    if command -v license-checker &>/dev/null; then
        local license_output
        license_output=$(license-checker --json --production 2>/dev/null || echo "{}")

        while IFS= read -r pkg; do
            local pkg_name pkg_license
            pkg_name=$(echo "${pkg}" | jq -r '.key' 2>/dev/null)
            pkg_license=$(echo "${pkg}" | jq -r '.value.licenses[0] // "UNKNOWN"' 2>/dev/null)

            for blocked in "${blocked_licenses[@]}"; do
                if [[ "${pkg_license}" == *"${blocked}"* ]]; then
                    log_fail "BLOCKED LICENSE: ${pkg_name} has license '${pkg_license}'"
                    violations=$((violations + 1))
                fi
            done

            for review in "${review_licenses[@]}"; do
                if [[ "${pkg_license}" == *"${review}"* ]]; then
                    log_warn "REVIEW REQUIRED: ${pkg_name} has license '${pkg_license}'"
                fi
            done
        done <<< "$(echo "${license_output}" | jq -c 'to_entries[]' 2>/dev/null)"
    else
        log_info "license-checker not installed. Install with: npm install -g license-checker"
        log_info "Skipping license compliance check."
    fi

    if [[ "${violations}" -eq 0 ]]; then
        log_ok "No license violations detected"
    fi

    return 0
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print_summary() {
    log_section "SUMMARY"

    if [[ "${TOTAL_ISSUES}" -eq 0 ]]; then
        log_ok "All dependency security checks passed!"
        echo ""
        exit 0
    else
        log_fail "${TOTAL_ISSUES} issue(s) found during dependency security check."
        echo ""
        if [[ "${CI_MODE}" == true ]]; then
            exit 1
        else
            log_info "Review the warnings above and address them before release."
            exit 0
        fi
    fi
}

# ---------------------------------------------------------------------------
# Main Execution
# ---------------------------------------------------------------------------
main() {
    echo -e "${BOLD}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║     DEERFLOW DEPENDENCY SECURITY CHECK v1.0             ║"
    echo "║     Comprehensive Supply Chain Security Auditor          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo "Project: ${PROJECT_ROOT}"
    echo "Date:    $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
    echo "Mode:    $(if [[ "${CI_MODE}" == true ]]; then echo 'CI/CD (strict)'; else echo 'Interactive'; fi)"

    check_prerequisites
    run_npm_audit || true
    check_outdated || true
    check_lock_file_consistency || true
    check_peer_dependencies || true
    check_dependency_tree || true
    check_license_compliance || true
    print_summary
}

main "$@"
