# DEERFLOW AGENTIC WORKFLOW SYSTEM v1.0

## Complete Workflow Orchestration for AI Agents

> **Document Version:** 1.0
> **Last Updated:** 2025-01-10
> **Owner:** Deerflow Agent Framework — Core Workflow Team
> **Compliance:** IEEE 830, ISO/IEC 25010, Clean Code Principles
> **Status:** ACTIVE — All agents MUST comply

---

### Table of Contents

1. [Workflow Philosophy](#1-workflow-philosophy)
2. [Workflow Phases (Detailed)](#2-workflow-phases-detailed)
3. [Quality Gates](#3-quality-gates-between-each-phase)
4. [Rollback Procedures](#4-rollback-procedures)
5. [Complexity Management](#5-complexity-management)
6. [Anti-Pattern Detection](#6-anti-pattern-detection)
7. [Workflow Templates](#7-workflow-templates)

---

## 1. WORKFLOW PHILOSOPHY

### 1.1 The "Think First, Code Later" Paradigm

The Deerflow Agentic Workflow System is built upon a fundamental principle that distinguishes professional AI-assisted software engineering from ad-hoc code generation: **Think First, Code Later**.

This paradigm mandates that every agent must invest significant effort in understanding, analyzing, and planning before producing a single line of code. The rationale is grounded in decades of software engineering research and industry experience:

- **Cost of correction increases exponentially with phase.** A defect caught during requirement analysis costs 1x to fix. The same defect caught during testing costs 10x. In production, it costs 100x. (Reference: Barry Boehm, "Software Engineering Economics," 1981)
- **AI agents lack persistent memory across sessions.** Without upfront planning, agents lose context and introduce inconsistencies. The thinking phase creates durable artifacts (specifications, architecture documents, checklists) that persist even when the agent's context window resets.
- **Premature optimization and implementation leads to technical debt.** Agents that jump to coding often produce solutions that work for the happy path but fail under edge cases, load, or maintenance scenarios.

The "Think First, Code Later" paradigm is enforced through the 7-Layer Verification Model (Section 1.2) and mandatory phase transitions (Section 3).

**Rule: An agent must spend at least 30% of its total interaction budget on Phases 0–3 (thinking) before entering Phase 4 (coding).**

### 1.2 The 7-Layer Verification Model

Every piece of work produced by an agent must pass through seven verification layers before it is considered complete. These layers are cumulative — each layer builds on the previous one.

| Layer | Name | Scope | Verification Method |
|-------|------|-------|-------------------|
| L1 | **Syntax Verification** | Single file / expression | TypeScript compiler, ESLint |
| L2 | **Unit Verification** | Individual functions / modules | Unit tests (Jest / Vitest) |
| L3 | **Integration Verification** | Module-to-module interactions | Integration tests |
| L4 | **System Verification** | End-to-end feature flows | E2E tests (Playwright / Cypress) |
| L5 | **Performance Verification** | Response time, throughput | Benchmarking, Lighthouse |
| L6 | **Security Verification** | Vulnerability, data protection | npm audit, OWASP checks |
| L7 | **Regression Verification** | No existing features broken | Full test suite, manual smoke test |

**Agent Mandate:** No work is considered complete until it passes Layers 1–5 at minimum. Layers 6 and 7 are mandatory for any change that touches authentication, data handling, payment, or user-facing API surfaces.

### 1.3 Why Agents Must Follow Formal Engineering Processes

AI agents are powerful but fundamentally different from human engineers. They lack:
- **Intuition about code smells** — they can generate syntactically correct but architecturally unsound code.
- **Long-term project memory** — they forget earlier decisions unless explicitly documented.
- **Implicit stakeholder understanding** — they don't know business context unless it's codified.
- **Self-awareness of scope creep** — they tend to over-engineer or under-engineer unless bounded.

Formal engineering processes compensate for these limitations by providing:

1. **Explicit structure** — phases, gates, and checklists prevent the agent from drifting.
2. **Durable artifacts** — specifications and architecture documents survive context resets.
3. **Verification discipline** — each phase has objective pass/fail criteria.
4. **Traceability** — every code change can be traced back to a requirement.

### 1.4 Standards Reference

This workflow system draws from and complies with the following industry standards:

- **IEEE 830-1998:** Software Requirements Specification format for formal requirement documentation.
- **ISO/IEC 25010:2011:** Software quality model defining 8 quality characteristics (Functional Suitability, Performance Efficiency, Compatibility, Interaction Capability, Reliability, Security, Maintainability, Flexibility).
- **Clean Code (Robert C. Martin):** SOLID principles, naming conventions, function complexity rules.
- **SOLID Principles:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- **OWASP Top 10 (2021):** Security vulnerability categories and prevention techniques.
- **Conventional Commits 1.0.0:** Structured commit message format for changelog generation.

---

## 2. WORKFLOW PHASES (DETAILED)

### Phase 0: CONTEXT ACQUISITION (MANDATORY — Before ANY Code)

**Purpose:** Build a comprehensive mental model of the existing project before making any changes.

**Duration:** This phase must not be rushed. For large codebases, it may consume 20–40% of the total interaction budget.

#### Step 0.1: Read ALL Project Files (Use Glob/LS First)

Before reading any file, the agent must first map the project structure using glob and directory listing tools. This prevents blind file reading and ensures complete coverage.

```
MANDATORY SEQUENCE:
1. List root directory → understand top-level structure
2. List src/ or equivalent → understand source organization
3. Glob for *.ts, *.tsx, *.js, *.jsx → identify all source files
4. Glob for *.test.*, *.spec.* → identify test files
5. Glob for *.json, *.yaml, *.yml → identify configuration files
6. Glob for *.md → identify documentation files
```

**Output:** A file tree map stored in the agent's working context.

#### Step 0.2: Understand package.json Dependencies and Versions

The agent must read `package.json` and analyze:

| Field | What to Check |
|-------|--------------|
| `dependencies` | Runtime libraries — note versions and potential conflicts |
| `devDependencies` | Build tools, test frameworks, linters — understand the toolchain |
| `scripts` | Available npm scripts — use these, don't reinvent commands |
| `engines` | Node.js version requirements |
| `peerDependencies` | Host environment expectations |
| `resolutions` | Forced dependency versions (indicates known conflicts) |
| `type` | Module system ("module" = ESM, absent = CJS) |

**Key Checks:**
- Is this an ESM or CJS project? This affects import syntax.
- What test framework is used? (Jest, Vitest, Mocha, etc.)
- What bundler is used? (Webpack, Vite, Rollup, esbuild, etc.)
- Is there a monorepo setup? (workspaces, turborepo, nx)

#### Step 0.3: Map the Component Hierarchy

For frontend projects, map the component tree:
- Identify the root application component
- Trace the component hierarchy (layout → page → feature → UI)
- Identify shared components and their consumers
- Map the routing structure
- Identify state management patterns (Redux, Zustand, Context, etc.)

For backend projects, map the module structure:
- Identify the entry point
- Trace the request lifecycle (middleware → controller → service → repository)
- Identify shared utilities and their consumers
- Map API route structure

#### Step 0.4: Identify Data Flow Patterns

Trace how data moves through the system:

```
User Action → Event Handler → State Update → Re-render → DOM Update
API Request → Controller → Validation → Service → Repository → Database
WebSocket → Connection Handler → Message Parser → State Manager → Subscribers
```

Document:
- Primary data stores and their schemas
- Data transformation pipelines
- Caching strategies
- Optimistic update patterns

#### Step 0.5: Check Existing Tests and Their Coverage

The agent must:
1. Identify all test files and their locations
2. Note the testing patterns used (describe/it blocks, custom matchers, test utilities)
3. Check for test configuration files (jest.config.ts, vitest.config.ts, etc.)
4. Identify which modules have tests and which are uncovered
5. Note any test utilities, factories, or fixtures that exist

**Rule:** If the project has existing tests, new code MUST follow the same testing patterns.

#### Step 0.6: Review Git Log for Recent Changes

```
MANDATORY:
1. git log --oneline -20 → Recent commit messages and patterns
2. git log --stat -5 → Files changed in recent commits
3. git branch -a → Active branches (understand team workflow)
4. git status → Current working tree state (uncommitted changes!)
```

This helps the agent understand:
- Recent development activity and direction
- Files that are actively being modified (avoid conflicts)
- Commit message conventions in use
- Whether there are uncommitted changes that must be preserved

#### Step 0.7: Read Existing Documentation and Comments

The agent must read:
- README.md for project overview and setup instructions
- CONTRIBUTING.md for contribution guidelines
- Any ADR (Architecture Decision Records) files
- Inline JSDoc / TSDoc comments on key modules
- API documentation if available

**⛔ PROHIBITION:** An agent MUST NOT write a single line of code before completing ALL steps of Phase 0. Violation of this rule is a CRITICAL defect.

---

### Phase 1: REQUIREMENT ANALYSIS

**Purpose:** Transform the user's request into a formal, unambiguous specification.

#### Step 1.1: Parse User Requirements into Formal Specification

Take the user's natural language request and decompose it into structured requirements. Identify:
- **Primary goal:** What is the core deliverable?
- **Scope boundaries:** What is explicitly in scope? What is out of scope?
- **Constraints:** Technical, business, or temporal constraints.
- **Assumptions:** What assumptions is the agent making?

#### Step 1.2: Identify Functional Requirements (FR-001, FR-002...)

Each functional requirement must be numbered and follow this format:

```
FR-XXX: [Requirement Title]
  Description: [Clear, testable statement]
  Priority: MUST | SHOULD | COULD | WON'T (MoSCoW)
  Rationale: [Why this requirement exists]
  Verification: [How to verify this requirement is met]
```

**Rules for Functional Requirements:**
- Each requirement must be independently testable
- Each requirement must have exactly one responsibility
- Use active voice and precise language
- Avoid ambiguous terms ("fast," "user-friendly," "similar to")
- Include both happy path and error path requirements

#### Step 1.3: Identify Non-Functional Requirements (NFR-001, NFR-002...)

Non-functional requirements define quality attributes per ISO/IEC 25010:

| Category | Example NFR |
|----------|------------|
| Performance | NFR-001: API response time < 200ms for p95 |
| Reliability | NFR-002: System must handle 1000 concurrent connections |
| Security | NFR-003: All user inputs must be sanitized |
| Maintainability | NFR-004: Code coverage must not decrease below 80% |
| Accessibility | NFR-005: All interactive elements must be keyboard-navigable |
| Compatibility | NFR-006: Must work on Chrome, Firefox, Safari, Edge latest 2 versions |

#### Step 1.4: Create Use Case Diagrams (Text-Based)

For each functional requirement, create a text-based use case:

```
USE CASE: UC-XXX — [Name]
  Actor: [Who initiates this use case]
  Preconditions: [What must be true before this use case starts]
  Main Flow:
    1. [Actor performs action]
    2. [System responds]
    3. [Actor performs next action]
    ...
  Alternative Flows:
    Alt-1: [If condition X, then Y instead of step N]
    Alt-2: [If condition Z, then W instead of step M]
  Postconditions: [What is true after successful completion]
  Exceptions:
    EX-1: [If error E occurs, system does F]
```

#### Step 1.5: Identify Edge Cases and Error Scenarios

For each use case, systematically enumerate edge cases:

- **Boundary conditions:** Empty input, maximum length, minimum value, zero, negative
- **Null/undefined handling:** What if required data is missing?
- **Concurrent access:** What if two requests modify the same resource?
- **Network failures:** What if API calls timeout or return errors?
- **Permission errors:** What if the user lacks required permissions?
- **Data integrity:** What if referenced entities don't exist?
- **Encoding issues:** What if input contains special characters, Unicode, or binary data?

#### Step 1.6: Define Acceptance Criteria for Each Requirement

Each requirement must have objective, measurable acceptance criteria:

```
ACCEPTANCE CRITERIA: AC-XXX — [Requirement Ref]
  Given: [Initial context/state]
  When: [Action performed]
  Then: [Observable result]
  And: [Additional constraints]
```

**OUTPUT:** Formal Requirements Document (inline within the agent's response, before any code is written)

---

### Phase 2: ARCHITECTURE DESIGN

**Purpose:** Create a technical blueprint that satisfies all requirements.

#### Step 2.1: Design Component Architecture

Define the component/module structure that will implement the requirements:

```
For each component:
  Component: [Name]
  Type: Page | Feature | UI Primitive | Service | Utility | Hook | Middleware
  Responsibilities: [What this component does]
  Dependencies: [What it depends on]
  Consumers: [Who uses this component]
  Location: [File path suggestion]
```

**Architectural Principles to Follow:**
- **Single Responsibility:** Each component has one reason to change
- **Dependency Inversion:** High-level modules don't depend on low-level modules; both depend on abstractions
- **Interface Segregation:** Clients don't depend on methods they don't use
- **Composition over Inheritance:** Prefer composing behavior over class hierarchies

#### Step 2.2: Define Interfaces and Contracts

For every module boundary, define explicit TypeScript interfaces:

```typescript
// Example interface contract
interface IAuthService {
  authenticate(credentials: AuthCredentials): Promise<AuthResult>;
  refreshToken(token: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
}
```

**Rules for Interface Design:**
- All interfaces must be defined BEFORE implementation
- Interfaces must be minimal but complete (Interface Segregation)
- Use the `I` prefix for interface names (project convention)
- Document each property and method with JSDoc
- Define input/output types explicitly — never use `any`

#### Step 2.3: Plan Data Models and Relationships

Define all data structures that the feature will use:

```
Entity: [Name]
  Fields:
    - [field]: [type] — [description] — [constraints]
  Relationships:
    - [relationship type] → [related entity]
  Validation Rules:
    - [rule]: [constraint]
  Index Requirements:
    - [index]: [fields] — [reason]
```

**Data Modeling Rules:**
- Use TypeScript interfaces/types for all data models
- Define Zod or similar schemas for runtime validation
- Consider immutability — prefer `readonly` fields
- Plan for pagination if dealing with collections
- Consider soft-delete vs hard-delete strategies

#### Step 2.4: Design API Contracts (Request/Response Schemas)

For every API endpoint or public function:

```
Endpoint: [METHOD] /path
  Request:
    Headers: { [header]: [value] }
    Body: { [field]: [type] — [validation] }
  Response (200):
    Body: { [field]: [type] }
  Response (4xx):
    Body: { error: { code: string, message: string } }
  Authentication: [method]
  Rate Limit: [limit]
```

#### Step 2.5: Plan State Management Strategy

Define how application state will flow:

| State Category | Storage | Lifetime | Access Pattern |
|---------------|---------|----------|---------------|
| UI State | Component state / useState | Component lifetime | Local only |
| Feature State | Zustand / Redux store | Feature lifetime | Multiple components |
| Server State | React Query / SWR | Cache-controlled | API-driven |
| Auth State | Secure cookie / httpOnly | Session lifetime | Global |
| Form State | React Hook Form / Formik | Form lifetime | Validation-driven |

#### Step 2.6: Design Error Handling Architecture

Define the error handling strategy:

```
Error Hierarchy:
  AppError (base)
    ├── ValidationError (400)
    ├── AuthenticationError (401)
    ├── AuthorizationError (403)
    ├── NotFoundError (404)
    ├── ConflictError (409)
    ├── RateLimitError (429)
    └── InternalError (500)

Error Handling Rules:
  1. All errors must be typed — never throw raw strings or numbers
  2. Errors must preserve context (what operation failed, what input)
  3. Errors must be logged with correlation IDs
  4. User-facing errors must be actionable
  5. Errors must not leak sensitive information in production
```

#### Step 2.7: Security Architecture Review

Check against OWASP Top 10:

- [ ] **A01 — Broken Access Control:** Are all endpoints properly authenticated and authorized?
- [ ] **A02 — Cryptographic Failures:** Is sensitive data encrypted at rest and in transit?
- [ ] **A03 — Injection:** Are all inputs sanitized and parameterized?
- [ ] **A04 — Insecure Design:** Does the architecture follow security-by-design?
- [ ] **A05 — Security Misconfiguration:** Are defaults secure? Are debug modes off?
- [ ] **A06 — Vulnerable Components:** Are all dependencies free of known vulnerabilities?
- [ ] **A07 — Auth Failures:** Is authentication robust? Are sessions properly managed?
- [ ] **A08 — Data Integrity Failures:** Is data validated on both client and server?
- [ ] **A09 — Logging Failures:** Are security events properly logged without sensitive data?
- [ ] **A10 — SSRF:** Are outgoing requests validated against internal resources?

**OUTPUT:** Architecture Decision Record (ADR) documenting all decisions, alternatives considered, and rationale.

---

### Phase 3: IMPLEMENTATION PLANNING

**Purpose:** Break the architecture into atomic, executable tasks.

#### Step 3.1: Break Down into Atomic Tasks

Each task must be:
- **Atomic:** Completable in a single file or small set of related files
- **Verifiable:** Has clear pass/fail criteria
- **Independent:** Can be implemented without blocking on other tasks (except dependencies)
- **Descriptive:** Clear enough that another agent or engineer could execute it

```
TASK: TASK-XXX — [Title]
  Type: CREATE | MODIFY | DELETE | CONFIG | TEST | DOC
  Files: [List of files affected]
  Dependencies: [TASK-YYY, TASK-ZZZ]
  Estimated Complexity: LOW | MEDIUM | HIGH | CRITICAL
  Verification:
    - [ ] [Criterion 1]
    - [ ] [Criterion 2]
  Risks: [What could go wrong]
  Rollback: [How to undo if something goes wrong]
```

#### Step 3.2: Define Task Dependencies (DAG)

Create a Directed Acyclic Graph of task dependencies:

```
TASK-001 (Create types) ──→ TASK-003 (Create service)
TASK-002 (Create interfaces) ──→ TASK-003 (Create service)
TASK-003 (Create service) ──→ TASK-004 (Create component)
TASK-003 (Create service) ──→ TASK-005 (Create tests)
TASK-004 (Create component) ──→ TASK-006 (Integration)
TASK-005 (Create tests) ──→ TASK-006 (Integration)
```

**Dependency Rules:**
- No circular dependencies allowed
- Tasks with no dependencies go first (usually types, interfaces, utilities)
- Integration tasks always go last
- Test tasks depend on the code they test but can run in parallel with unrelated tasks

#### Step 3.3: Order Tasks by Dependency and Risk

Sort tasks using topological sort based on dependencies, then apply risk-based prioritization:

1. **Foundation tasks first:** Types, interfaces, constants, utilities
2. **Core logic next:** Services, repositories, data access
3. **UI/Integration third:** Components, pages, API routes
4. **Polish last:** Tests, documentation, error handling refinements

**Risk Ordering:** High-risk tasks should be executed earlier so failures are discovered sooner.

#### Step 3.4: For Each Task — Define Inputs, Outputs, Verification Criteria

```
TASK: TASK-XXX
  Inputs:
    - [Existing type/interface that this task uses]
    - [Data source or dependency]
  Outputs:
    - [New file or modified file]
    - [New type or interface exposed]
  Verification Criteria:
    1. TypeScript compilation succeeds
    2. ESLint passes with zero warnings
    3. Unit tests pass (if test task)
    4. No new circular dependencies introduced
    5. Import paths resolve correctly
```

#### Step 3.5: Identify Shared Utilities Needed

Before starting implementation, identify utilities that multiple tasks will need:
- Type guards and validators
- Error handling helpers
- Formatting utilities
- Test factories and fixtures
- Constants and enums

Create these utilities FIRST to avoid duplication and ensure consistency.

#### Step 3.6: Plan Backward-Compatible Migration (If Needed)

If modifying existing code:
- Identify all consumers of the code being modified
- Plan a migration path if the interface changes
- Consider using the "old API calls new API internally" pattern during transition
- Document breaking changes explicitly
- Plan for feature flags if the change is optional or experimental

**OUTPUT:** Implementation Plan with ordered TODO list — this becomes the agent's execution checklist.

---

### Phase 4: CODE IMPLEMENTATION (With Micro-Verification)

**Purpose:** Write the code following the plan, with continuous verification.

#### Step 4.1: Create/Modify Files ONE AT A TIME

The agent must work on one file (or one tightly related group of files) at a time. Do not attempt to modify 10 files simultaneously.

**File Modification Order:**
1. Types and interfaces (`.types.ts`, `.interfaces.ts`)
2. Constants and enums (`.constants.ts`)
3. Utility functions (`.utils.ts`, `.helpers.ts`)
4. Services and data access (`.service.ts`, `.repository.ts`)
5. Custom hooks (`use*.ts`)
6. Components (from leaf components to composite components)
7. Pages and routes
8. Tests (matching the source file order)

#### Step 4.2: After EACH File Change — Verify Compilation

After every file is created or modified:

```bash
npx tsc --noEmit
# OR if the project uses a build command:
npm run build
```

**Rule:** If compilation fails, fix it IMMEDIATELY. Never proceed with a broken build.

#### Step 4.3: After EACH File Change — Run Related Tests

After every source file change, run the tests associated with that file:

```bash
# Run tests for the specific file
npx jest path/to/file.test.ts
# OR
npx vitest run path/to/file.test.ts
```

#### Step 4.4: Maintain Import Consistency

Import rules:
- Use path aliases defined in `tsconfig.json` (e.g., `@/components/...`)
- Never use relative imports that go beyond two levels (e.g., `../../..` is forbidden)
- Group imports: external packages → internal packages → relative imports
- Order within groups: alphabetically
- Remove unused imports immediately

#### Step 4.5: Follow Naming Conventions Strictly

| Entity | Convention | Example |
|--------|-----------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Functions | camelCase | `getUserProfile()` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Interfaces | PascalCase with `I` prefix | `IUserService` |
| Types | PascalCase with `T` suffix or descriptive name | `UserProfile` |
| Enums | PascalCase (values SCREAMING) | `UserRole { ADMIN }` |
| Files (components) | PascalCase | `Button.tsx` |
| Files (utilities) | camelCase | `formatDate.ts` |
| Files (tests) | camelCase with `.test` | `formatDate.test.ts` |
| Directories | kebab-case | `user-profile/` |

#### Step 4.6: Add Inline Documentation as You Code

Every exported function, class, interface, and type must have JSDoc/TSDoc:

```typescript
/**
 * Retrieves a user profile by their unique identifier.
 *
 * @param id - The unique user identifier (UUID v4)
 * @returns The user profile, or null if not found
 * @throws {AuthenticationError} If the current user lacks read permission
 * @throws {NotFoundError} If the user does not exist
 *
 * @example
 * const profile = await userService.getById('550e8400-e29b-41d4-a716-446655440000');
 */
async getById(id: string): Promise<User | null> {
  // ...
}
```

#### Integration Check: Every 3–5 Files, Run Full Test Suite

After every 3 to 5 file modifications, run the complete test suite:

```bash
npm run test          # Full test suite
npm run lint          # Full lint
npm run type-check    # Full type check (if separate from build)
```

**⛔ PROHIBITION:** An agent MUST NOT batch-edit more than 5 files without intermediate verification. If you need to modify more than 5 files, break the work into checkpoint groups of 3–5 files each.

---

### Phase 5: VERIFICATION & TESTING

**Purpose:** Ensure the implementation is correct, complete, and meets all quality standards.

#### Step 5.1: Run Full Test Suite

```bash
npm run test
```

**Expected Result:** All tests pass. Zero failures. Zero skipped tests (unless explicitly documented with reason).

**If tests fail:**
1. Read the test output carefully
2. Identify if the failure is in new code, existing code, or test setup
3. Fix the root cause, not the test
4. Re-run the specific test
5. Re-run the full suite

#### Step 5.2: Check TypeScript Compilation

```bash
npx tsc --noEmit
```

**Expected Result:** Zero errors. Zero warnings.

Common issues:
- Implicit `any` types
- Missing return types on exported functions
- Unused variables or imports
- Type assertion misuse (`as any`)

#### Step 5.3: Run ESLint with Zero-Warning Policy

```bash
npm run lint
```

**Expected Result:** Zero errors. Zero warnings.

**Rule:** ESLint warnings are treated as errors. Fix every warning before proceeding.

#### Step 5.4: Check Bundle Size Impact

If the project has bundle analysis configured:

```bash
npm run analyze    # If available
# OR
npx vite-bundle-visualizer
```

**Threshold:** New code should not increase bundle size by more than 50KB gzipped for a single feature.

#### Step 5.5: Verify No Circular Dependencies (Madge)

```bash
npx madge --circular --extensions ts,tsx src/
```

**Expected Result:** Zero circular dependencies.

If circular dependencies are detected:
1. Identify the dependency cycle
2. Extract shared logic into a separate utility module
3. Use dependency injection to break the cycle
4. Re-verify

#### Step 5.6: Check for Security Vulnerabilities (npm audit)

```bash
npm audit --production
```

**Expected Result:** Zero critical vulnerabilities. Zero high vulnerabilities.

Medium vulnerabilities must be documented with a remediation timeline.

#### Step 5.7: Verify Responsive Design (If Applicable)

For UI changes:
- Check that the layout works on mobile (320px), tablet (768px), and desktop (1280px+)
- Verify that text is readable at all breakpoints
- Check that interactive elements are reachable on touch devices
- Verify that images scale properly

#### Step 5.8: Verify Accessibility (If Applicable)

For UI changes, verify WCAG 2.1 AA compliance:
- All images have alt text
- All form inputs have associated labels
- Color contrast ratio is at least 4.5:1 for normal text
- All interactive elements are keyboard accessible
- Focus indicators are visible
- ARIA attributes are correct

#### Step 5.9: Run lint:types for Type Safety

```bash
npm run lint:types    # If available
# OR
npx tsc --noEmit --strict
```

**Expected Result:** Zero type errors under strict mode.

**OUTPUT:** Verification Report — a structured summary of all checks performed, results, and any issues found.

---

### Phase 6: INTEGRATION CHECK

**Purpose:** Ensure the new code integrates cleanly with the existing codebase.

#### Step 6.1: Verify All Imports Resolve Correctly

For every new or modified file, verify that:
- All import paths are valid
- No barrel exports are broken (index.ts re-exports)
- No default/named export mismatches
- No circular import chains

#### Step 6.2: Verify No Orphaned Files

Check that:
- No files were created but never imported
- No dead code was introduced
- No commented-out blocks that should be removed
- No TODO comments without associated task tracking

#### Step 6.3: Verify No Missing Dependencies

Check that:
- All npm packages imported in code are listed in package.json
- No `npm install` was run during implementation without documenting the addition
- All peer dependencies are satisfied
- No version conflicts exist

#### Step 6.4: Cross-Component Integration Test

Manually verify (or write tests for):
- Components render without errors when composed together
- Data flows correctly between parent and child components
- State changes propagate correctly through the system
- API calls from UI components reach the backend correctly

#### Step 6.5: End-to-End Flow Verification

Trace the complete user flow:
1. User performs the initial action
2. System processes the request
3. Data is correctly stored/retrieved
4. UI updates to reflect the result
5. Error conditions are handled gracefully
6. Edge cases produce correct behavior

**OUTPUT:** Integration Report — documenting all integration checks performed and their results.

---

### Phase 7: DOCUMENTATION

**Purpose:** Ensure the work is properly documented for future maintainers.

#### Step 7.1: Update API Documentation

- Update any API reference documents if endpoints were added/modified
- Update JSDoc/TSDoc for all new public APIs
- Document any breaking changes with migration instructions

#### Step 7.2: Update Component Documentation

- Add JSDoc comments to all new components
- Document props with their types and defaults
- Add usage examples in component files
- Update any Storybook stories if applicable

#### Step 7.3: Update CHANGELOG

Follow the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Unreleased]
### Added
- New feature description (FR-001)
### Changed
- Modified behavior description
### Fixed
- Bug fix description
### Deprecated
- Deprecated feature with migration path
```

#### Step 7.4: Add Migration Notes (If Needed)

If the change requires migration:
- Document what changed and why
- Provide step-by-step migration instructions
- Include before/after code examples
- Estimate the effort required for migration

**OUTPUT:** Updated documentation in all relevant files.

---

## 3. QUALITY GATES (Between Each Phase)

Quality gates are mandatory checkpoints between phases. An agent MUST NOT proceed to the next phase until the current gate is PASSED.

### Gate 0→1: Project Structure Understood?

| Criterion | Severity | Check |
|-----------|----------|-------|
| File tree mapped | CRITICAL | Agent can describe project structure without reading files |
| Dependencies analyzed | CRITICAL | Agent can list all key dependencies and their purposes |
| Component hierarchy identified | HIGH | Agent can describe the component/module relationships |
| Data flow understood | HIGH | Agent can trace a request from entry to exit |
| Tests reviewed | MEDIUM | Agent knows which modules have tests and which don't |
| Git history reviewed | MEDIUM | Agent knows recent changes and commit conventions |
| **Verdict:** ALL CRITICAL criteria must pass | — | — |

### Gate 1→2: All Requirements Specified?

| Criterion | Severity | Check |
|-----------|----------|-------|
| Functional requirements numbered | CRITICAL | FR-001 through FR-NNN defined |
| Non-functional requirements defined | CRITICAL | NFR-001 through NFR-NNN defined |
| Acceptance criteria written | CRITICAL | Each FR has at least one AC |
| Edge cases identified | HIGH | At least 5 edge cases documented |
| Use cases documented | HIGH | Each FR has a use case |
| Scope boundaries defined | HIGH | In-scope and out-of-scope explicitly stated |
| **Verdict:** ALL CRITICAL criteria must pass | — | — |

### Gate 2→3: Architecture Reviewed?

| Criterion | Severity | Check |
|-----------|----------|-------|
| Components defined | CRITICAL | All new components/modules identified with responsibilities |
| Interfaces designed | CRITICAL | All public interfaces have TypeScript definitions |
| Data models defined | CRITICAL | All data structures have type definitions |
| Error handling planned | HIGH | Error hierarchy and handling strategy documented |
| State management planned | HIGH | State storage and access patterns defined |
| Security review done | HIGH | OWASP Top 10 checklist completed |
| **Verdict:** ALL CRITICAL criteria must pass | — | — |

### Gate 3→4: Implementation Plan Approved?

| Criterion | Severity | Check |
|-----------|----------|-------|
| Tasks decomposed | CRITICAL | All tasks are atomic and verifiable |
| Dependencies mapped | CRITICAL | Task DAG has no cycles |
| Execution order defined | HIGH | Tasks are ordered by dependency and risk |
| Verification criteria defined | HIGH | Each task has clear pass/fail criteria |
| Shared utilities identified | MEDIUM | Common utilities extracted before implementation |
| **Verdict:** ALL CRITICAL criteria must pass | — | — |

### Gate 4→5: Code Compiles and Basic Tests Pass?

| Criterion | Severity | Check |
|-----------|----------|-------|
| TypeScript compiles | CRITICAL | `tsc --noEmit` passes |
| No ESLint errors | CRITICAL | `eslint` passes |
| New tests pass | CRITICAL | Tests for new code pass |
| Existing tests pass | CRITICAL | No regressions introduced |
| Import consistency maintained | HIGH | No broken imports |
| **Verdict:** ALL CRITICAL criteria must pass | — | — |

### Gate 5→6: All Tests Pass?

| Criterion | Severity | Check |
|-----------|----------|-------|
| Full test suite passes | CRITICAL | 100% of tests pass |
| No type errors | CRITICAL | Strict mode compilation passes |
| No lint warnings | CRITICAL | ESLint zero-warning policy met |
| No circular dependencies | HIGH | Madge reports zero cycles |
- No critical vulnerabilities | HIGH | npm audit clean |
| **Verdict:** ALL CRITICAL criteria must pass | — | — |

### Gate 6→7: Integration Verified?

| Criterion | Severity | Check |
|-----------|----------|-------|
| All imports resolve | CRITICAL | No broken import paths |
| No orphaned files | HIGH | Every file is imported somewhere |
| No missing dependencies | HIGH | package.json matches imports |
| Cross-component test passes | HIGH | Integration tests pass |
| E2E flow verified | MEDIUM | Manual trace of complete user flow succeeds |
| **Verdict:** ALL CRITICAL criteria must pass | — | — |

**⛔ RULE: If a gate is FAILED, the agent MUST go back to the appropriate phase and fix the issue before proceeding. Never skip a failed gate.**

---

## 4. ROLLBACK PROCEDURES

### 4.1 Git Checkpoint Before Each Phase

**MANDATORY:** Before starting each phase, the agent MUST create a git commit (or at minimum a stash) to preserve the current state:

```bash
# Before Phase 0:
git add -A && git commit -m "checkpoint: before Phase 0 - context acquisition"

# Before Phase 1:
git add -A && git commit -m "checkpoint: before Phase 1 - requirement analysis"

# Before Phase 2:
git add -A && git commit -m "checkpoint: before Phase 2 - architecture design"

# Before Phase 3:
git add -A && git commit -m "checkpoint: before Phase 3 - implementation planning"

# Before Phase 4:
git add -A && git commit -m "checkpoint: before Phase 4 - code implementation"
```

### 4.2 How to Identify What Went Wrong

When a quality gate fails, use this systematic diagnosis:

1. **Compilation failure:** Check the TypeScript error messages. Most common causes:
   - Missing type definitions (`@types/*`)
   - Incorrect import paths
   - Type mismatches
   - Missing exported symbols

2. **Test failure:** Read the assertion error. Common causes:
   - Implementation doesn't match the expected behavior
   - Test setup is incorrect
   - Async timing issues
   - Mock data doesn't match real data shape

3. **Integration failure:** Check the interaction between modules. Common causes:
   - Interface contract mismatch
   - Missing dependency injection
   - Incorrect event/data flow
   - State synchronization issue

4. **Performance regression:** Use profiling tools. Common causes:
   - Unnecessary re-renders (React)
   - Missing memoization
   - N+1 query patterns
   - Large bundle size from tree-shaking failures

### 4.3 Systematic Rollback Steps

```
STEP 1: Identify the checkpoint to roll back to
  - Look at git log to find the last successful checkpoint commit
  - git log --oneline -10

STEP 2: Assess what to preserve
  - Are there any valuable insights from the failed attempt?
  - Document them before rolling back

STEP 3: Perform the rollback
  git reset --soft <commit-hash>    # Preserves changes as staged
  # OR
  git reset --hard <commit-hash>    # Discards all changes (CAUTION)

STEP 4: Analyze the failure
  - What was the root cause?
  - Which phase did the failure originate from?
  - What assumptions were wrong?

STEP 5: Re-plan from the failing phase
  - Go back to the phase where the error originated
  - Update the plan based on lessons learned
  - Proceed forward with corrected approach
```

### 4.4 Recovery Patterns

| Failure Type | Recovery Pattern |
|-------------|-----------------|
| Compilation failure after file creation | Delete the file, verify build, recreate with correct types |
| Test failure after implementation | Review test expectations, fix implementation, not the test (unless test was wrong) |
| Circular dependency introduced | Extract shared code into a new utility module |
| Bundle size regression | Analyze with bundle visualizer, replace heavy dependencies, add lazy loading |
| Performance degradation | Profile with DevTools, identify hot path, optimize or memoize |
| Git conflict during implementation | Stash current work, pull latest, rebase, resolve conflicts, continue |
| Context window exhaustion | Save current state to a documentation file, start new session referencing the docs |

---

## 5. COMPLEXITY MANAGEMENT

### 5.1 Token Budget Management

The agent's context window is a finite resource. Managing it effectively is critical for long tasks:

**Budget Allocation Formula:**

| Phase | % of Total Budget | Notes |
|-------|------------------|-------|
| Phase 0: Context Acquisition | 15–25% | Scale with codebase size |
| Phase 1: Requirements | 10–15% | Scale with requirement complexity |
| Phase 2: Architecture | 10–15% | Scale with system complexity |
| Phase 3: Planning | 5–10% | Minimal but essential |
| Phase 4: Implementation | 30–40% | Largest phase |
| Phase 5–7: Verification/Documentation | 10–15% | Don't skimp on verification |

### 5.2 Context Window Optimization

**Strategies to maximize effective context usage:**

1. **Read files lazily:** Don't read the entire codebase upfront. Read files as needed based on the task plan.
2. **Summarize large files:** When a file is read, create a mental (or written) summary of its exports and key logic. Don't re-read the entire file later.
3. **Use glob patterns:** Instead of reading individual files to find something, use glob and grep to locate relevant code efficiently.
4. **Document intermediate state:** Write key decisions and progress to a file so they can be referenced if context is lost.
5. **Compress repetitive code:** When reviewing similar files, note the pattern once and skip identical sections in subsequent files.

### 5.3 When to Create Sub-Tasks

**Create sub-tasks when:**

- A single task requires modifying more than 10 files
- The implementation spans multiple logical subsystems
- The task complexity score (see Section 6) exceeds a threshold
- Context window usage exceeds 70% of the available budget
- The task involves multiple unrelated concerns (e.g., backend + frontend + database)

**Sub-Task Structure:**

```
Parent Task: Implement User Authentication System
  Sub-Task A: Create authentication types and interfaces
  Sub-Task B: Implement JWT service
  Sub-Task C: Create login/logout API endpoints
  Sub-Task D: Create authentication middleware
  Sub-Task E: Build login page component
  Sub-Task F: Write tests for authentication flow
  Sub-Task G: Update documentation
```

Each sub-task should be independently completable and verifiable.

### 5.4 How to Maintain Consistency Across Long Sessions

1. **Create a session state file:** Write progress, decisions, and next steps to a markdown file.
2. **Use consistent naming:** Once a naming pattern is established, document it and follow it strictly.
3. **Reference the task plan:** Always check the task list before starting new work to avoid duplication.
4. **Re-verify assumptions:** Periodically re-read key files to ensure earlier assumptions are still valid.
5. **Git commits as checkpoints:** Commit frequently with descriptive messages that summarize progress.

---

## 6. ANTI-PATTERN DETECTION

### 6.1 Comprehensive Anti-Pattern Catalog

The following anti-patterns are commonly exhibited by AI agents. Each is described with detection heuristics and correction strategies.

#### AP-001: Premature Implementation

**Description:** The agent starts writing code before understanding the existing codebase or requirements.

**Detection:**
- Code is produced within the first 3 messages
- No questions are asked about existing patterns
- File structure is not explored before implementation

**Correction:** Enforce Phase 0 completion. Require the agent to produce a project summary before any code.

#### AP-002: Shotgun Surgery

**Description:** The agent modifies many files simultaneously without verifying intermediate states.

**Detection:**
- More than 5 files modified in a single response
- No compilation checks between file modifications
- No test runs between changes

**Correction:** Enforce the "one file at a time" rule with micro-verification after each change.

#### AP-003: Hallucinated Dependencies

**Description:** The agent imports or uses packages that don't exist in the project.

**Detection:**
- Import statements reference packages not in package.json
- API methods are called that don't exist in the imported library
- Configuration options are used that aren't supported

**Correction:** Before using any package, verify it exists in package.json. Before using any API, verify it exists in the library's type definitions.

#### AP-004: Copy-Paste Programming

**Description:** The agent duplicates code instead of extracting shared logic into reusable utilities.

**Detection:**
- Similar code blocks appear in multiple files
- The same utility function is defined in multiple places
- No shared utility module exists when it should

**Correction:** When similar code is detected, extract it into a shared utility. Apply the DRY (Don't Repeat Yourself) principle.

#### AP-005: Ignore Existing Patterns

**Description:** The agent introduces new patterns, conventions, or structures that differ from the existing codebase.

**Detection:**
- New files use different naming conventions than existing files
- New code uses a different state management approach
- New tests follow a different pattern than existing tests
- New directory structure doesn't match existing organization

**Correction:** In Phase 0, document all existing patterns and conventions. Reference them during implementation.

#### AP-006: Over-Engineering

**Description:** The agent creates abstractions, layers, or generality that isn't needed for the current task.

**Detection:**
- Generic interfaces for one-off implementations
- Configuration objects for values that will never change
- Plugin architectures for simple features
- Abstract base classes with single concrete implementations

**Correction:** Apply the YAGNI principle (You Aren't Gonna Need It). Build for the current requirement, not hypothetical future requirements.

#### AP-007: Under-Engineering

**Description:** The agent produces a minimal solution that doesn't handle edge cases, errors, or future maintainability.

**Detection:**
- No error handling
- No input validation
- No TypeScript types (everything is `any`)
- No tests
- No documentation

**Correction:** Enforce the quality gates. Each gate requires specific quality criteria.

#### AP-008: Test Theater

**Description:** The agent writes tests that pass but don't actually verify meaningful behavior.

**Detection:**
- Tests that only check if a function doesn't throw
- Tests that assert `true` or `1 === 1`
- Tests that mock everything and test nothing
- Tests with no assertions at all

**Correction:** Require meaningful assertions. Each test must verify at least one behavior.

#### AP-009: Silent Failure

**Description:** Errors are caught and swallowed without logging or reporting.

**Detection:**
- Empty catch blocks
- Errors caught but no user notification
- `catch (e) { /* do nothing */ }`

**Correction:** Every catch block must either: (a) log the error, (b) re-throw it, (c) show a user-facing error message, or (d) document why silent handling is intentional.

#### AP-010: Golden Path Only

**Description:** The implementation only handles the happy path and ignores all error scenarios.

**Detection:**
- No error handling in async functions
- No null/undefined checks
- No validation of API responses
- No handling of network failures

**Correction:** For every code path, identify the error scenarios and handle them explicitly.

#### AP-011: Hardcoded Values

**Description:** Magic numbers, strings, or configuration values are embedded directly in code.

**Detection:**
- Numbers like `86400`, `1000`, `200` appearing in code without explanation
- API URLs written as string literals
- Color values or dimensions hardcoded in components

**Correction:** Extract all magic values into named constants with descriptive names.

#### AP-012: Missing Types

**Description:** The agent uses `any` or avoids TypeScript type annotations.

**Detection:**
- `any` type usage
- Missing return types on functions
- Missing parameter types
- Type assertions (`as` operator) used to bypass type checking

**Correction:** Every value must have a type. If the type isn't known, define it. Use Zod or similar for runtime validation.

#### AP-013: Broken Imports

**Description:** The agent creates import statements that reference non-existent files or exports.

**Detection:**
- TypeScript compilation fails with "Cannot find module" errors
- Named imports that don't exist in the target module
- Default imports when the target uses named exports

**Correction:** After creating a new file, verify that all importers can resolve the new exports. After modifying exports, verify all consumers.

#### AP-014: Missing Dependency Installation

**Description:** The agent uses a new npm package without adding it to package.json.

**Detection:**
- Code imports a package not listed in dependencies
- Runtime errors: "Cannot find module 'package-name'"
- CI/CD pipeline failures

**Correction:** Always run `npm install <package>` when introducing a new dependency. Always specify `--save` or `--save-dev` as appropriate.

#### AP-015: Inconsistent Error Messages

**Description:** Error messages don't follow a consistent format or use inconsistent terminology.

**Detection:**
- Some errors are strings, some are Error objects, some are objects with `message`
- Error messages use different casing styles
- Error codes are inconsistent

**Correction:** Define a standard error format and error codes. Use the typed error hierarchy from Phase 2.

#### AP-016: Monolithic Components

**Description:** A single component or function handles too many responsibilities.

**Detection:**
- Components longer than 200 lines
- Functions longer than 30 lines
- Files with more than 500 lines
- Cyclomatic complexity above 10

**Correction:** Break large components into smaller, focused components. Extract logic into custom hooks or utility functions.

#### AP-017: Uncontrolled Re-Renders

**Description:** React components re-render unnecessarily, causing performance issues.

**Detection:**
- Objects or arrays created inline in JSX or render functions
- Functions defined inline in JSX without useCallback
- Context consumers that don't need to re-render
- Missing React.memo on pure components

**Correction:** Use React DevTools Profiler to identify unnecessary re-renders. Apply memoization where appropriate. Split contexts by concern.

#### AP-018: Insecure Defaults

**Description:** Security settings are left at their default (insecure) values.

**Detection:**
- CORS configured as `*` for all origins
- Cookies without `httpOnly` and `secure` flags
- JWTs without expiration
- Passwords stored without hashing
- Debug mode enabled in production

**Correction:** Apply security hardening as a default. Review against OWASP Top 10.

#### AP-019: God Object / God Service

**Description:** A single class or service accumulates too many methods and responsibilities.

**Detection:**
- Services with more than 10 public methods
- Classes that depend on more than 5 other services
- Files that are imported by more than 10 other files

**Correction:** Split the service along domain boundaries. Apply Single Responsibility Principle.

#### AP-020: Unnecessary Abstraction

**Description:** Abstraction layers are added that don't provide meaningful separation.

**Detection:**
- Service classes that only delegate to another service
- Repository classes that only wrap a single ORM call
- Adapter layers with no transformation logic

**Correction:** Remove unnecessary layers. Only abstract when there's a clear reason (multiple implementations, testability, decoupling).

#### AP-021: Forgotten Cleanup

**Description:** Event listeners, timers, subscriptions, or connections are created but never cleaned up.

**Detection:**
- Event listeners added without corresponding removeEventListener
- setInterval without clearInterval
- WebSocket connections without close handlers
- useEffect without cleanup function

**Correction:** Every resource allocation must have a corresponding deallocation. Use cleanup functions in React effects.

#### AP-022: Non-Deterministic Tests

**Description:** Tests that pass sometimes and fail sometimes due to timing, randomness, or external dependencies.

**Detection:**
- Tests using `setTimeout` without proper mocking
- Tests depending on current date/time
- Tests with random data generation
- Tests that depend on execution order

**Correction:** Use fake timers. Seed random generators. Avoid time-dependent assertions. Make tests independent of execution order.

#### AP-023: Missing Loading/Error States

**Description:** UI components don't handle loading or error states from async operations.

**Detection:**
- API calls without loading spinners
- Form submissions without disabled state during submission
- Data fetching without error boundaries
- No skeleton screens or placeholder content

**Correction:** Every async operation in the UI must have corresponding loading, error, and success states.

#### AP-024: Incorrect Assumptions About Existing Code

**Description:** The agent assumes existing code works a certain way without verifying.

**Detection:**
- Code that calls non-existent methods on existing classes
- Assumptions about data format that don't match reality
- Imports from modules that don't export the expected symbols

**Correction:** Phase 0 exists for this exact reason. Always read the actual code before making assumptions.

---

## 7. WORKFLOW TEMPLATES

### 7.1 Template: New Feature Development

```
=== NEW FEATURE: [Feature Name] ===

PHASE 0: CONTEXT ACQUISITION
  [ ] Map project structure
  [ ] Read package.json
  [ ] Identify related components
  [ ] Trace data flow
  [ ] Review existing tests
  [ ] Check git log
  [ ] Read documentation

PHASE 1: REQUIREMENTS
  FR-001: [Primary feature behavior]
  FR-002: [Secondary behavior]
  NFR-001: [Performance requirement]
  NFR-002: [Security requirement]
  AC-001: [Acceptance criterion]
  Edge cases: [List 5+]

PHASE 2: ARCHITECTURE
  New files:
    - src/features/[feature]/[feature].types.ts
    - src/features/[feature]/[feature].service.ts
    - src/features/[feature]/[feature].component.tsx
    - src/features/[feature]/[feature].test.ts
    - src/features/[feature]/index.ts
  Interfaces: [Define]
  Data models: [Define]

PHASE 3: PLANNING
  TASK-001: Create types and interfaces
  TASK-002: Create service
  TASK-003: Create component
  TASK-004: Write tests
  TASK-005: Integration and documentation

PHASE 4: IMPLEMENTATION
  [Execute tasks sequentially with micro-verification]

PHASE 5: VERIFICATION
  [ ] TypeScript compiles
  [ ] ESLint passes
  [ ] All tests pass
  [ ] No circular dependencies
  [ ] npm audit clean

PHASE 6: INTEGRATION
  [ ] All imports resolve
  [ ] No orphaned files
  [ ] Cross-component test

PHASE 7: DOCUMENTATION
  [ ] JSDoc updated
  [ ] CHANGELOG updated
```

### 7.2 Template: Bug Fix

```
=== BUG FIX: [Bug Description] ===

PHASE 0: CONTEXT ACQUISITION
  [ ] Map affected files (using git log, git diff, grep)
  [ ] Understand the current behavior
  [ ] Identify the expected behavior
  [ ] Check if related tests exist

PHASE 1: REQUIREMENTS
  FR-001 (Bug): [What's broken]
  FR-001 (Fix): [What should happen instead]
  Root Cause Analysis: [Why the bug exists]
  Reproduction Steps: [How to reproduce]

PHASE 2: ARCHITECTURE
  [ ] Identify the minimal change needed
  [ ] Check if fix affects other components
  [ ] Plan regression risk

PHASE 3: PLANNING
  TASK-001: Write regression test that reproduces the bug (RED)
  TASK-002: Fix the bug (GREEN)
  TASK-003: Verify fix doesn't break existing tests
  TASK-004: Update documentation if needed

PHASE 4–7: [Follow standard process, but streamlined for small scope]
```

### 7.3 Template: Refactoring

```
=== REFACTORING: [Description] ===

PHASE 0: CONTEXT ACQUISITION
  [ ] Map the code being refactored
  [ ] Identify all consumers
  [ ] Run existing tests (establish baseline)
  [ ] Note test coverage for affected code

PHASE 1: REQUIREMENTS
  FR-001: Behavior MUST remain identical after refactoring
  FR-002: Code quality metrics MUST improve (complexity, duplication, etc.)
  NFR-001: Test coverage MUST NOT decrease

PHASE 2: ARCHITECTURE
  [ ] Define the target structure
  [ ] Plan the migration path (if breaking)
  [ ] Identify intermediate states

PHASE 3: PLANNING
  TASK-001: Extract shared logic into utilities
  TASK-002: Simplify component structure
  TASK-003: Update imports and consumers
  TASK-004: Remove dead code
  TASK-005: Verify all tests still pass
  TASK-006: Update documentation

PHASE 4–7: [Follow standard process]
  CRITICAL: After EACH step, run the full test suite to verify no behavior changed.
```

### 7.4 Template: API Endpoint Creation

```
=== API ENDPOINT: [METHOD] /path ===

PHASE 0: CONTEXT ACQUISITION
  [ ] Map existing API structure (routes, controllers, middleware)
  [ ] Understand authentication/authorization patterns
  [ ] Review request validation patterns (Zod, Joi, etc.)
  [ ] Check existing error response format

PHASE 1: REQUIREMENTS
  FR-001: [Endpoint behavior]
  FR-002: [Input validation rules]
  FR-003: [Error responses]
  FR-004: [Authentication requirement]
  NFR-001: [Response time requirement]
  NFR-002: [Rate limit requirement]

PHASE 2: ARCHITECTURE
  Files:
    - src/routes/[route].ts (or add to existing)
    - src/controllers/[controller].ts (or add to existing)
    - src/validators/[validator].ts
    - src/types/[endpoint].types.ts
    - tests/api/[endpoint].test.ts
  Contract:
    Request: [Schema]
    Response 200: [Schema]
    Response 4xx: [Schema]

PHASE 3: PLANNING
  TASK-001: Define request/response types
  TASK-002: Create validation schema
  TASK-003: Implement controller logic
  TASK-004: Register route
  TASK-005: Write API tests
  TASK-006: Integration verification

PHASE 4–7: [Follow standard process]
```

### 7.5 Template: Component Creation

```
=== COMPONENT: [ComponentName] ===

PHASE 0: CONTEXT ACQUISITION
  [ ] Map existing component library/patterns
  [ ] Identify styling system (Tailwind, CSS Modules, Styled Components)
  [ ] Review component naming conventions
  [ ] Check for existing similar components

PHASE 1: REQUIREMENTS
  FR-001: [Component visual behavior]
  FR-002: [Component interactive behavior]
  FR-003: [Component API (props)]
  NFR-001: [Accessibility requirement]
  NFR-002: [Responsive behavior]
  NFR-003: [Performance requirement]

PHASE 2: ARCHITECTURE
  Props interface:
    - [prop]: [type] — [description]
  State:
    - [state]: [type] — [initial value] — [purpose]
  Files:
    - src/components/[ComponentName]/[ComponentName].tsx
    - src/components/[ComponentName]/[ComponentName].test.tsx
    - src/components/[ComponentName]/[ComponentName].stories.tsx (if Storybook)
    - src/components/[ComponentName]/index.ts

PHASE 3: PLANNING
  TASK-001: Define props interface and types
  TASK-002: Implement component structure (skeleton)
  TASK-003: Implement component logic and state
  TASK-004: Style the component
  TASK-005: Add accessibility attributes
  TASK-006: Write component tests
  TASK-007: Export and integrate

PHASE 4–7: [Follow standard process]
```

---

## Appendix A: Quick Reference Card

### Phase Order (MUST follow strictly)

```
PHASE 0 → PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5 → PHASE 6 → PHASE 7
Context   Reqs      Arch      Plan      Code      Verify   Integrate  Document
```

### 5 Absolute Rules

1. **NEVER write code before Phase 0 is complete**
2. **NEVER skip a quality gate**
3. **NEVER modify more than 5 files without intermediate verification**
4. **NEVER proceed with a broken build**
5. **NEVER introduce a failing test without fixing it before moving on**

### Verification Commands

```bash
npx tsc --noEmit              # Type check
npm run lint                   # Lint
npm run test                   # Test
npx madge --circular src/      # Circular dependencies
npm audit --production         # Security
npm run build                  # Build
```

---

*This document is the single source of truth for the Deerflow Agentic Workflow System. All agents operating within the Deerflow Agent Framework must comply with every rule, gate, and procedure defined herein.*
