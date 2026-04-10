#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# DEERFLOW AGENT FRAMEWORK — PROJECT INITIALIZATION
# Creates a new project with all Deerflow standards pre-configured
# Usage: ./scripts/init-project.sh <project-name> <type>
# Types: nextjs, react, node, python, fullstack
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

log_info()    { echo -e "${BLUE}[DEERFLOW INIT]${NC} $1"; }
log_success() { echo -e "${GREEN}[DEERFLOW INIT]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[DEERFLOW INIT]${NC} $1"; }
log_error()   { echo -e "${RED}[DEERFLOW INIT]${NC} $1"; }
log_step()    { echo -e "\n${MAGENTA}${BOLD}━━━ $1 ━━━${NC}\n"; }

# ─── Globals ─────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRAMEWORK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_NAME=""
PROJECT_TYPE=""
PROJECT_DIR=""

# ─── Usage ────────────────────────────────────────────────────
usage() {
  echo "Usage: ./scripts/init-project.sh <project-name> <type>"
  echo ""
  echo "Creates a new project with all Deerflow Agent Framework standards."
  echo ""
  echo "Arguments:"
  echo "  project-name   Name of the new project directory"
  echo "  type           Project type: nextjs | react | node | python | fullstack"
  echo ""
  echo "Examples:"
  echo "  ./scripts/init-project.sh my-app nextjs"
  echo "  ./scripts/init-project.sh my-api node"
  echo "  ./scripts/init-project.sh my-service python"
  exit 1
}

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════
validate_inputs() {
  if [[ $# -lt 2 ]]; then
    usage
  fi

  PROJECT_NAME="$1"
  PROJECT_TYPE="$2"

  # Validate type
  case "$PROJECT_TYPE" in
    nextjs|react|node|python|fullstack) ;;
    *)
      log_error "Invalid project type: '$PROJECT_TYPE'"
      log_error "Valid types: nextjs, react, node, python, fullstack"
      exit 1
      ;;
  esac

  # Validate name
  if [[ -z "$PROJECT_NAME" ]]; then
    log_error "Project name cannot be empty"
    exit 1
  fi

  PROJECT_DIR="$(pwd)/$PROJECT_NAME"

  if [[ -d "$PROJECT_DIR" ]]; then
    log_error "Directory '$PROJECT_DIR' already exists"
    exit 1
  fi
}

# ═══════════════════════════════════════════════════════════════
# NEXT.JS SCAFFOLD
# ═══════════════════════════════════════════════════════════════
scaffold_nextjs() {
  log_step "Scaffolding Next.js Project"

  log_info "Creating Next.js project with TypeScript..."
  npx create-next-app@latest "$PROJECT_DIR" \
    --typescript --eslint --tailwind --app \
    --src-dir --import-alias "@/*" \
    --use-npm --no-turbopack 2>&1 | tail -5 || {
    log_error "Failed to create Next.js project"
    exit 1
  }

  cd "$PROJECT_DIR"

  # ── Directory Structure ─────────────────────────────────────
  mkdir -p src/{components/{ui,layout,forms,feedback},lib/{utils,hooks,api},types,config,services,stores,styles}

  # ── Copy Deerflow Config ────────────────────────────────────
  if [[ -f "$FRAMEWORK_DIR/templates/nextjs/.eslintrc.deerflow.js" ]]; then
    cp "$FRAMEWORK_DIR/templates/nextjs/.eslintrc.deerflow.js" .eslintrc.js
    log_info "Copied Deerflow ESLint config"
  fi

  if [[ -f "$FRAMEWORK_DIR/templates/nextjs/tsconfig.deerflow.json" ]]; then
    cp "$FRAMEWORK_DIR/templates/nextjs/tsconfig.deerflow.json" tsconfig.deerflow.json
    log_info "Copied Deerflow TypeScript config"
  fi

  if [[ -f "$FRAMEWORK_DIR/templates/nextjs/vitest.config.ts" ]]; then
    cp "$FRAMEWORK_DIR/templates/nextjs/vitest.config.ts" vitest.config.ts
    log_info "Copied Vitest config"
  fi

  # ── Install Deerflow dependencies ───────────────────────────
  log_info "Installing Deerflow quality dependencies..."
  npm install --save-dev \
    @typescript-eslint/parser @typescript-eslint/eslint-plugin \
    eslint-plugin-import eslint-plugin-jsdoc eslint-plugin-security \
    eslint-plugin-sonarjs eslint-plugin-boundaries \
    prettier eslint-config-prettier eslint-plugin-prettier \
    vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom \
    @testing-library/user-event jsdom \
    madge dependency-cruiser \
    husky lint-staged 2>&1 | tail -3

  # ── Deerflow config ─────────────────────────────────────────
  cp "$FRAMEWORK_DIR/config/deerflow.config.json" deerflow.config.json

  # ── Base component template ─────────────────────────────────
  cat > src/components/ui/Button.example.tsx << 'BTN_EOF'
/**
 * @file Button component — Deerflow standard template
 * @description Demonstrates proper component structure:
 *   - Props interface with JSDoc
 *   - TypeScript strict typing (no 'any')
 *   - Proper accessibility attributes
 *   - Single responsibility
 *   - Under 200 lines
 */

import { type ButtonHTMLAttributes, forwardRef } from 'react';

/** Size variants for the Button component */
type ButtonSize = 'sm' | 'md' | 'lg';

/** Visual variants for the Button component */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  isLoading?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
};

/**
 * Accessible button component with variant and size support.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Submit
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', disabled, children, ...props }, ref) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-md font-medium
          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
BTN_EOF

  log_success "Next.js project scaffolded with Deerflow standards"
}

# ═══════════════════════════════════════════════════════════════
# REACT SCAFFOLD
# ═══════════════════════════════════════════════════════════════
scaffold_react() {
  log_step "Scaffolding React Project"

  log_info "Creating React project with Vite + TypeScript..."
  npm create vite@latest "$PROJECT_DIR" -- --template react-ts 2>&1 | tail -5 || {
    log_error "Failed to create React project"
    exit 1
  }

  cd "$PROJECT_DIR"

  mkdir -p src/{components/{ui,layout},lib/{utils,hooks,api},types,config,services,stores,styles}

  # ── Install quality dependencies ────────────────────────────
  log_info "Installing Deerflow quality dependencies..."
  npm install --save-dev \
    @typescript-eslint/parser @typescript-eslint/eslint-plugin \
    eslint-plugin-import eslint-plugin-jsdoc eslint-plugin-security \
    eslint-plugin-sonarjs eslint-plugin-boundaries \
    prettier eslint-config-prettier eslint-plugin-prettier \
    vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom \
    @testing-library/user-event jsdom tailwindcss postcss autoprefixer \
    madge dependency-cruiser \
    husky lint-staged 2>&1 | tail -3

  cp "$FRAMEWORK_DIR/config/deerflow.config.json" deerflow.config.json

  log_success "React project scaffolded with Deerflow standards"
}

# ═══════════════════════════════════════════════════════════════
# NODE.JS SCAFFOLD
# ═══════════════════════════════════════════════════════════════
scaffold_node() {
  log_step "Scaffolding Node.js Project"

  mkdir -p "$PROJECT_DIR"
  cd "$PROJECT_DIR"

  # ── Initialize ──────────────────────────────────────────────
  log_info "Initializing Node.js project..."
  npm init -y >/dev/null 2>&1

  # ── Directory Structure (Clean Architecture) ────────────────
  mkdir -p \
    src/{domain/{entities,value-objects,repositories,events},\
        application/{use-cases,dtos,interfaces,ports},\
        infrastructure/{database,external,config},\
        presentation/{controllers,middleware,routes,validators},\
        shared/{errors,logging,utils,types,constants}} \
    tests/{unit,integration,e2e,fixtures} \
    docs

  # ── Install core deps ───────────────────────────────────────
  log_info "Installing runtime dependencies..."
  npm install express zod helmet cors dotenv 2>&1 | tail -3

  # ── Install dev deps ────────────────────────────────────────
  log_info "Installing Deerflow quality dependencies..."
  npm install --save-dev \
    typescript @types/node @types/express @types/cors \
    @typescript-eslint/parser @typescript-eslint/eslint-plugin \
    eslint-plugin-import eslint-plugin-jsdoc eslint-plugin-security \
    eslint-plugin-sonarjs eslint-plugin-boundaries \
    prettier eslint-config-prettier eslint-plugin-prettier \
    vitest @vitest/coverage-v8 supertest @types/supertest \
    tsx ts-node nodemon \
    madge dependency-cruiser \
    husky lint-staged 2>&1 | tail -3

  # ── TypeScript config ───────────────────────────────────────
  cat > tsconfig.json << 'TS_EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@domain/*": ["./src/domain/*"],
      "@application/*": ["./src/application/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@presentation/*": ["./src/presentation/*"],
      "@shared/*": ["./src/shared/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
TS_EOF

  # ── Vitest config ───────────────────────────────────────────
  cat > vitest.config.ts << 'VITEST_EOF'
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts', 'src/**/*.interface.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});
VITEST_EOF

  # ── Update package.json scripts ─────────────────────────────
  if command_exists jq; then
    local pkg="package.json"
    local tmp
    tmp=$(jq '.scripts = {
      "dev": "tsx watch src/index.ts",
      "build": "tsc",
      "start": "node dist/index.js",
      "test": "vitest run",
      "test:watch": "vitest",
      "test:coverage": "vitest run --coverage",
      "lint": "eslint src/ tests/ --max-warnings=0",
      "lint:fix": "eslint src/ tests/ --fix --max-warnings=0",
      "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
      "format:check": "prettier --check \"src/**/*.ts\" \"tests/**/*.ts\"",
      "typecheck": "tsc --noEmit",
      "check:arch": "madge --circular --extensions ts src/",
      "check:deps": "depcruise src/ --config .dependency-cruiser.json"
    }' "$pkg")
    echo "$tmp" > "$pkg"
  fi

  cp "$FRAMEWORK_DIR/config/deerflow.config.json" deerflow.config.json

  log_success "Node.js project scaffolded with Clean Architecture"
}

# ═══════════════════════════════════════════════════════════════
# PYTHON SCAFFOLD
# ═══════════════════════════════════════════════════════════════
scaffold_python() {
  log_step "Scaffolding Python Project"

  mkdir -p "$PROJECT_DIR"
  cd "$PROJECT_DIR"

  # ── Directory Structure ─────────────────────────────────────
  mkdir -p \
    src/{domain/{entities,value_objects,repositories,events},\
        application/{use_cases,dtos,interfaces,ports},\
        infrastructure/{database,external,config},\
        presentation/{controllers,middleware,routes,schemas},\
        shared/{errors,logging,utils,types}} \
    tests/{unit,integration,e2e,fixtures,conftest} \
    docs scripts

  # ── Python boilerplate ──────────────────────────────────────
  for dir in src/domain src/application src/infrastructure src/presentation src/shared tests; do
    touch "$dir/__init__.py"
  done

  # ── Copy Deerflow Python config ─────────────────────────────
  if [[ -f "$FRAMEWORK_DIR/templates/python/pyproject.deerflow.toml" ]]; then
    cp "$FRAMEWORK_DIR/templates/python/pyproject.deerflow.toml" pyproject.toml
    log_info "Copied Deerflow Python config"
  fi

  # ── .gitignore ──────────────────────────────────────────────
  cat > .gitignore << 'GITIGNORE_EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.egg-info/
dist/
build/
.eggs/
*.egg

# Virtual environments
venv/
.venv/
ENV/

# Testing
.coverage
htmlcov/
.pytest_cache/
.mypy_cache/
.ruff_cache/

# IDE
.vscode/
.idea/

# Deerflow
.deerflow/
GITIGNORE_EOF

  # ── Domain entity template ──────────────────────────────────
  cat > src/domain/entities/base.py << 'ENTITY_EOF'
"""Base entity module for Deerflow Clean Architecture.

Provides the abstract base class that all domain entities must extend.
"""


from __future__ import annotations

import uuid
from abc import ABC
from datetime import datetime
from typing import Any


class BaseEntity(ABC):
    """Abstract base class for all domain entities.

    Every entity has a unique identifier and creation/update timestamps.
    Subclasses must implement domain-specific behavior.

    Attributes:
        id: Unique identifier (UUID4).
        created_at: Timestamp when the entity was created.
        updated_at: Timestamp of the last modification.
    """

    def __init__(self, id: uuid.UUID | None = None) -> None:
        self.id: uuid.UUID = id or uuid.uuid4()
        self.created_at: datetime = datetime.utcnow()
        self.updated_at: datetime = self.created_at

    def update_timestamp(self) -> None:
        """Set updated_at to the current UTC time."""
        self.updated_at = datetime.utcnow()

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, BaseEntity):
            return NotImplemented
        return self.id == other.id

    def __hash__(self) -> int:
        return hash(self.id)

    def __repr__(self) -> str:
        cls_name = self.__class__.__name__
        return f"{cls_name}(id={self.id!s})"

    def to_dict(self) -> dict[str, Any]:
        """Serialize entity to dictionary."""
        return {
            "id": str(self.id),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
ENTITY_EOF

  cp "$FRAMEWORK_DIR/config/deerflow.config.json" deerflow.config.json

  log_success "Python project scaffolded with Clean Architecture"
}

# ═══════════════════════════════════════════════════════════════
# FULLSTACK SCAFFOLD
# ═══════════════════════════════════════════════════════════════
scaffold_fullstack() {
  log_step "Scaffolding Full-Stack Project (Next.js + Node API)"

  log_info "Creating Next.js frontend..."
  npx create-next-app@latest "$PROJECT_DIR" \
    --typescript --eslint --tailwind --app \
    --src-dir --import-alias "@/*" \
    --use-npm --no-turbopack 2>&1 | tail -5 || {
    log_error "Failed to create Next.js project"
    exit 1
  }

  cd "$PROJECT_DIR"

  # ── Backend directory ───────────────────────────────────────
  mkdir -p \
    server/{src/{domain,application,infrastructure,presentation,shared},tests} \
    src/{components/{ui,layout,forms,feedback},lib/{utils,hooks,api,client},types,config,services,stores}

  # ── Install all quality deps ────────────────────────────────
  log_info "Installing full-stack dependencies..."
  npm install --save-dev \
    @typescript-eslint/parser @typescript-eslint/eslint-plugin \
    eslint-plugin-import eslint-plugin-jsdoc eslint-plugin-security \
    eslint-plugin-sonarjs eslint-plugin-boundaries \
    prettier eslint-config-prettier eslint-plugin-prettier \
    vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom \
    jsdom madge dependency-cruiser \
    husky lint-staged 2>&1 | tail -3

  cp "$FRAMEWORK_DIR/config/deerflow.config.json" deerflow.config.json

  log_success "Full-stack project scaffolded with Deerflow standards"
}

# ═══════════════════════════════════════════════════════════════
# POST-SCAFFOLD SETUP
# ═══════════════════════════════════════════════════════════════
post_scaffold_setup() {
  log_step "Post-Scaffold Setup"

  cd "$PROJECT_DIR"

  # ── Git Init ────────────────────────────────────────────────
  if [[ ! -d ".git" ]]; then
    git init
    git add -A
    git commit -m "chore: initial project scaffold with Deerflow standards

- Project type: $PROJECT_TYPE
- Clean Architecture structure
- Quality gates configured
- Pre-commit hooks ready"
    log_success "Git repository initialized with initial commit"
  fi

  # ── Install husky hooks ─────────────────────────────────────
  if [[ -f "package.json" ]]; then
    npx husky init 2>/dev/null || true

    # Copy Deerflow hooks
    if [[ -d ".husky" ]]; then
      for hook in pre-commit pre-push commit-msg post-merge; do
        if [[ -f "$FRAMEWORK_DIR/hooks/$hook" ]]; then
          cp "$FRAMEWORK_DIR/hooks/$hook" ".husky/$hook"
          chmod +x ".husky/$hook"
        fi
      done
      log_success "Git hooks installed"
    fi
  fi

  # ── Copy quality-check script ───────────────────────────────
  mkdir -p scripts
  cp "$FRAMEWORK_DIR/scripts/quality-check.sh" "scripts/quality-check.sh"
  chmod +x "scripts/quality-check.sh"

  # ── Copy rule files ─────────────────────────────────────────
  for rule in .cursorrules .windsurfrules .clinerules; do
    if [[ -f "$FRAMEWORK_DIR/$rule" ]]; then
      cp "$FRAMEWORK_DIR/$rule" "$rule"
    fi
  done
  if [[ -f "$FRAMEWORK_DIR/.github/copilot-instructions.md" ]]; then
    mkdir -p .github
    cp "$FRAMEWORK_DIR/.github/copilot-instructions.md" .github/copilot-instructions.md
  fi

  # ── Create README section ───────────────────────────────────
  cat > DEERFLOW.md << 'README_EOF'
# 🦌 Deerflow Agent Framework

This project follows **Deerflow Agent Framework** standards for AI-assisted development.

## Quality Standards

- **Max file length:** 300 lines
- **Max function length:** 50 lines
- **Max cyclomatic complexity:** 10
- **Min test coverage:** 80%
- **Zero lint warnings** policy

## Architecture

- Clean Architecture / Domain-Driven Design
- Dependency Injection
- Repository Pattern
- SOLID Principles

## Commands

```bash
npm run lint          # ESLint with zero warnings
npm run typecheck     # TypeScript strict check
npm run test          # Run all tests
npm run test:coverage # Tests with coverage report
npm run format        # Prettier formatting
npm run check:arch    # Architecture validation (madge)
```

## AI Workflow

This project enforces a 5-phase AI development workflow:
1. **Analysis** — Deep codebase understanding
2. **Planning** — Task decomposition with impact analysis
3. **Implementation** — Atomic, verified changes
4. **Verification** — Full quality gate check
5. **Documentation** — Updated docs and changelog
README_EOF

  log_success "Post-scaffold setup complete"
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
main() {
  echo -e "${CYAN}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║        🦌  DEERFLOW PROJECT INITIALIZER                  ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"

  validate_inputs "$@"

  log_info "Creating project: $PROJECT_NAME (type: $PROJECT_TYPE)"
  log_info "Target directory: $PROJECT_DIR"
  echo ""

  # Check prerequisites
  if ! command_exists node; then
    log_error "Node.js is required. Install from https://nodejs.org/"
    exit 1
  fi

  if ! command_exists git; then
    log_error "Git is required. Install from https://git-scm.com/"
    exit 1
  fi

  # Scaffold based on type
  case "$PROJECT_TYPE" in
    nextjs)    scaffold_nextjs ;;
    react)     scaffold_react ;;
    node)      scaffold_node ;;
    python)    scaffold_python ;;
    fullstack) scaffold_fullstack ;;
  esac

  # Common post-setup
  post_scaffold_setup

  echo ""
  echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  🦌  Project '$PROJECT_NAME' created successfully!         ║${NC}"
  echo -e "${GREEN}╠═══════════════════════════════════════════════════════════╣${NC}"
  echo -e "${GREEN}║  cd $PROJECT_NAME                                       ║${NC}"
  echo -e "${GREEN}║  npm run dev                                           ║${NC}"
  echo -e "${GREEN}║  See DEERFLOW.md for quality standards                  ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

main "$@"
