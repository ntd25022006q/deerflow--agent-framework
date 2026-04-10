# DEERFLOW AGENT SKILL SYSTEM v1.0
## Required Competencies for AI Agents

> **Document Version:** 1.0.0
> **Last Updated:** 2025-01-10
> **Owner:** Deerflow Agent Framework — Core Skills Module
> **Status:** Active

---

## 1. SKILL CLASSIFICATION

All skills in the Deerflow Agent Framework are organized into a five-tier hierarchy that reflects increasing complexity, scope, and impact. Each tier builds upon the competencies established in the previous tier. An agent operating at a given tier must demonstrate verified proficiency in all skills at that tier and every tier below it.

### Tier Definitions

| Tier | Level | Scope | Typical Tasks | Verification Rigor |
|------|-------|-------|---------------|---------------------|
| **Tier 1** | Foundation | Individual file/module | Basic CRUD, file operations, dependency installs | Automated checks only |
| **Tier 2** | Intermediate | Feature-level components | API routes, component creation, state management, tests | Automated + code review |
| **Tier 3** | Advanced | Multi-feature systems | Performance tuning, security hardening, database design, deployment | Code review + manual audit |
| **Tier 4** | Expert | Cross-system integration | Distributed systems, real-time features, advanced testing methodologies | Expert panel review |
| **Tier 5** | Master | Organizational/strategic | Architecture decisions, technology adoption, team guidance | Architecture review board |

### Skill ID Convention

Every skill has a unique identifier following the pattern `SK-NNN` where NNN is a three-digit zero-padded number. Skills are numbered sequentially within each tier. The tier can be derived from the skill number:

- **SK-001 to SK-004**: Tier 1 — Foundation
- **SK-005 to SK-008**: Tier 2 — Intermediate
- **SK-009 to SK-012**: Tier 3 — Advanced
- **SK-013 to SK-015**: Tier 4 — Expert
- **SK-016 to SK-017**: Tier 5 — Master

---

## 2. FOUNDATION SKILLS (TIER 1)

Tier 1 skills are mandatory for every agent operating within the Deerflow Agent Framework. No task may be assigned to an agent that has not verified Tier 1 proficiency. These skills form the safety and quality baseline upon which all other work depends.

### SK-001: File System Safety

**Category:** Operations Safety
**Prerequisites:** None
**Required For:** ALL tasks

File system operations are among the most consequential actions an AI agent can perform. A single misplaced deletion or overwrite can destroy hours of work or corrupt critical configuration. This skill establishes the inviolable safety protocols that must govern every file operation.

#### Core Competencies

1. **NEVER delete without explicit confirmation** — Before any file deletion, the agent must present the exact list of files to be deleted, explain why each deletion is necessary, and wait for explicit user approval. This applies to `rm`, `fs.unlink`, and any other deletion mechanism. The confirmation must be specific: "Are you sure you want to delete `src/config/settings.ts`?" is acceptable; "Delete old files?" is not.

2. **ALWAYS verify path exists before writing** — Before writing to any file path, the agent must verify that the target directory exists and that the path is within the project scope. If the path does not exist, the agent must create the directory structure first using a non-destructive operation (e.g., `mkdir -p`). Writing to non-existent paths without directory creation will result in cryptic errors and wasted cycles.

3. **ALWAYS backup before modifying critical files** — Files classified as "critical" (configuration files, database schemas, environment files, build scripts, lock files) must be backed up before modification. The backup should preserve the original file with a timestamp suffix (e.g., `package.json.backup-20250110-143000`). After successful modification, the backup may be retained for a configurable number of days.

4. **NEVER modify files outside project scope** — The agent must never modify files outside the project directory tree. This includes system files, global configuration files, and files belonging to other projects. If a task requires modifying a file outside the project scope, the agent must escalate to human review and explicitly flag the boundary violation.

5. **Atomic file operations (write-complete-verify)** — File writes must be treated as atomic operations. The agent must write the complete file content in a single operation, verify the write succeeded (check file size, hash, or read-back), and only then proceed. Partial writes must be detected and retried. This prevents corrupted files that contain only a portion of the intended content.

#### Verification Criteria

- [ ] Zero unconfirmed deletions in a 50-operation sample
- [ ] Zero writes to non-existent directories without prior creation
- [ ] 100% backup compliance on critical file modifications
- [ ] Zero project scope violations in a 50-operation sample
- [ ] All file writes pass post-write verification

---

### SK-002: Dependency Management

**Category:** Project Integrity
**Prerequisites:** None
**Required For:** ALL tasks

Dependencies are the foundation of every software project, and mismanagement of dependencies leads to version conflicts, security vulnerabilities, bloated bundles, and broken builds. This skill ensures that every dependency decision is deliberate, documented, and verified.

#### Core Competencies

1. **Check compatibility BEFORE install** — Before installing any package, the agent must verify that the package is compatible with the project's runtime (Node.js version, browser targets), framework version (Next.js, React, etc.), and existing dependencies. This includes checking peer dependency requirements, engine requirements, and any known breaking changes in the target version. The agent must read the package's `package.json` metadata and changelog before proceeding.

2. **Lock versions precisely** — After installing any dependency, the agent must ensure that exact versions are recorded in the lock file (`package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`). Floating version ranges (`^1.2.3`) in `package.json` are acceptable for development dependencies, but production dependencies should be pinned to exact versions when stability is critical. The agent must never modify a lock file manually — all changes must go through the package manager.

3. **Audit security AFTER install** — After every dependency installation or update, the agent must run a security audit (`npm audit`, `pnpm audit`, or equivalent). Any critical or high severity vulnerabilities must be reported to the user with a recommended remediation plan. The agent must not proceed with other tasks until known critical vulnerabilities are addressed or explicitly accepted by the user.

4. **Document purpose of each dependency** — Every dependency added to the project must be accompanied by a brief justification documenting what it does, why it was chosen over alternatives, and what feature or fix it enables. This documentation should be placed in the commit message and, for significant dependencies, in the project's `DEPENDENCIES.md` or equivalent tracking document.

5. **Detect and prevent version conflicts** — The agent must proactively detect version conflicts between dependencies. This includes checking for duplicate package instances (caused by semver range mismatches), incompatible peer dependency requirements, and packages that depend on conflicting versions of shared transitive dependencies. When conflicts are detected, the agent must propose a resolution strategy before proceeding.

#### Verification Criteria

- [ ] Zero incompatible installations in a 20-install sample
- [ ] Lock files always consistent with package.json
- [ ] Security audit run after every install with documented results
- [ ] Every dependency addition includes justification documentation
- [ ] Zero unresolved version conflicts at project build time

---

### SK-003: Error Prevention

**Category:** Code Quality
**Prerequisites:** None
**Required For:** ALL tasks

Errors are inevitable in software development, but many common error classes can be prevented entirely through disciplined coding practices. This skill establishes the error prevention mindset and specific techniques that agents must employ at all times.

#### Core Competencies

1. **Validate all inputs at system boundaries** — Data entering the system from external sources (HTTP requests, environment variables, user input, file reads, API responses) must be validated at the point of entry. Validation must use a typed schema validator (Zod, Yup, Joi, or Valibot) and must reject invalid data with descriptive error messages. The agent must never trust external data without validation, even if the source is considered trusted.

2. **Use proper TypeScript types (no `any`)** — The `any` type is prohibited in all new code. When dealing with data whose type is not known at compile time, the agent must use `unknown` and narrow the type through runtime checks. When interfacing with untyped libraries, the agent must create proper type definitions (declarations or assertion functions) rather than falling back to `any`. The only exception is in test files where `any` may be used for mock objects, and even then it should be avoided when possible.

3. **Implement proper error boundaries** — Applications must implement error boundaries at every level where failures can be isolated. In React applications, this means using Error Boundaries for component trees. In server code, this means wrapping route handlers in try-catch blocks and providing structured error responses. In async operations, this means proper `.catch()` handling and `await` error propagation. Error boundaries must not silently swallow errors — they must log the error and provide user-facing feedback.

4. **Never silently swallow errors** — Empty catch blocks (`catch (e) {}`) or catch blocks that merely log without action are prohibited. Every caught error must either be handled (recovered from), re-thrown (with context added), or reported (to logging/monitoring). The agent must explicitly decide what to do with every error and document that decision.

5. **Use result/option patterns instead of exceptions** — For operations that can fail in expected ways (file not found, network timeout, parse error), the agent should prefer the Result pattern (returning `{ ok: true, value: T } | { ok: false, error: E }`) over throwing exceptions. This makes error handling explicit and composable. Exceptions should be reserved for truly exceptional conditions that indicate a bug or unrecoverable state.

#### Verification Criteria

- [ ] Zero unvalidated external inputs in a 50-function sample
- [ ] Zero `any` type usage in non-test code
- [ ] Error boundaries present at all isolation points
- [ ] Zero empty catch blocks in the entire codebase
- [ ] Result/option pattern used for all expected failure modes

---

### SK-004: Code Verification

**Category:** Build Integrity
**Prerequisites:** SK-001, SK-002
**Required For:** ALL tasks

Every code change must be verified to ensure it compiles, lints, and does not introduce regressions. This skill defines the mandatory verification cadence that agents must follow to maintain code quality at all times.

#### Core Competencies

1. **Compile check after EVERY change** — After every code modification (no matter how small), the agent must run the TypeScript compiler (`tsc --noEmit`) or equivalent build check to ensure the change does not introduce type errors or compilation failures. This is non-negotiable. Even a one-line fix can introduce a type error if it changes the inferred types of downstream code.

2. **Run lint after EVERY change** — After every code modification, the agent must run the project's linter (ESLint, Biome, or equivalent) to catch style violations, unused variables, and potential bugs. Lint errors must be fixed before the agent proceeds to the next task. Warnings should be addressed when they relate to the code being modified.

3. **Run tests after EVERY 3-5 changes** — After every 3 to 5 code modifications, the agent must run the project's test suite to ensure no regressions have been introduced. If the agent is working on a specific feature, it should run the tests most relevant to that feature after each change, and the full test suite after completing the feature. Test failures must be resolved before proceeding.

4. **Check imports resolve correctly** — After adding or modifying imports, the agent must verify that all imports resolve to valid modules. Broken imports (referencing non-existent files or non-exported symbols) are a common source of runtime errors that the compiler may not always catch (especially with dynamic imports or default export mismatches).

5. **Verify no type errors** — In addition to compilation, the agent must verify that there are no TypeScript strict mode errors, no implicit `any` types, and no type assertions that could mask errors. The agent must use the strictest possible TypeScript configuration that the project allows.

#### Verification Criteria

- [ ] Compilation check passed after 100% of changes in a 50-change sample
- [ ] Lint check passed after 100% of changes
- [ ] Tests run at minimum every 5 changes with documented results
- [ ] Zero unresolved import errors in the codebase
- [ ] TypeScript strict mode enabled with zero errors

---

## 3. INTERMEDIATE SKILLS (TIER 2)

Tier 2 skills are required for feature-level development tasks. An agent working on API routes, React components, state management, or test writing must demonstrate proficiency in these skills.

### SK-005: Component Architecture

**Category:** Frontend Development
**Prerequisites:** SK-001, SK-003, SK-004
**Required For:** UI component creation, feature development

#### Core Competencies

1. **Single Responsibility Principle** — Every component must have a single, well-defined responsibility. If a component is doing more than one thing (e.g., fetching data AND rendering a form AND handling complex business logic), it must be decomposed into smaller, focused components. The agent must be able to articulate each component's responsibility in a single sentence.

2. **Component composition over inheritance** — The agent must favor composition patterns (children, render props, compound components, hooks) over class inheritance hierarchies. Shared behavior must be extracted into custom hooks, utility functions, or higher-order components — not into deep inheritance chains.

3. **Proper prop interface design** — Component props must be defined using TypeScript interfaces with clear, descriptive names. Props should be as narrow and specific as possible. Optional props must have sensible defaults. Prop interfaces must be exported for reuse in testing and documentation. Boolean props must use descriptive names (e.g., `isLoading` not `loading`).

4. **State management patterns** — The agent must correctly choose between local state (`useState`), shared state (context, Zustand, Jotai), server state (TanStack Query), and form state (React Hook Form, Zod). Each state type has a specific use case and the agent must not conflate them. Global state must be minimized — if state is only used by one component subtree, it should be local.

5. **Component lifecycle management** — The agent must understand and correctly implement component lifecycle patterns using hooks (`useEffect` with proper dependency arrays, `useRef` for mutable values that don't trigger re-renders, `useMemo`/`useCallback` for performance-critical computations). The agent must avoid common lifecycle anti-patterns: missing dependencies, infinite loops in effects, stale closures, and memory leaks from uncleaned subscriptions.

#### Verification Criteria

- [ ] Every component has a clearly defined single responsibility
- [ ] Zero inheritance-based component hierarchies (composition only)
- [ ] All component props have exported TypeScript interfaces
- [ ] State management type correctly matches usage pattern
- [ ] Zero lifecycle anti-patterns detected by linting rules

---

### SK-006: API Design

**Category:** Backend Development
**Prerequisites:** SK-001, SK-002, SK-003, SK-004
**Required For:** API route creation, endpoint development

#### Core Competencies

1. **RESTful conventions** — API endpoints must follow RESTful conventions: nouns for resources, HTTP methods for operations (`GET` for reads, `POST` for creates, `PUT`/`PATCH` for updates, `DELETE` for removals). URLs must be pluralized resource names (`/users` not `/getUsers`). Nested resources must follow the pattern `/users/:userId/posts`. Query parameters must be used for filtering, sorting, and pagination — never for specifying the action.

2. **Proper HTTP status codes** — The agent must use correct HTTP status codes for all responses: `200` for success, `201` for created, `204` for no content, `400` for bad request, `401` for unauthorized, `403` for forbidden, `404` for not found, `409` for conflict, `422` for validation error, `429` for rate limited, `500` for server error, `503` for service unavailable. The agent must never return `200` with an error body — the status code must accurately reflect the response semantics.

3. **Request/response validation (Zod)** — All API request bodies, query parameters, and path parameters must be validated using Zod schemas before processing. Response bodies must be typed and validated before sending. Validation errors must be returned with a `422` status code and a structured error body listing all validation failures with field names and descriptions.

4. **Error response formatting** — All error responses must follow a consistent format that includes: an error code (machine-readable string), a human-readable message, a timestamp, and optionally a request ID for tracing. The agent must define and use a standard error response type across all endpoints.

5. **API versioning strategy** — APIs must be versioned from the start. The recommended approach is URL-based versioning (`/api/v1/...`). The agent must plan for backward compatibility and define a deprecation strategy for old versions. Breaking changes must never be introduced without a version bump.

#### Verification Criteria

- [ ] 100% RESTful compliance in endpoint design
- [ ] Correct HTTP status codes in all endpoints
- [ ] All endpoints have Zod validation schemas
- [ ] Consistent error response format across all endpoints
- [ ] API versioning implemented from the first endpoint

---

### SK-007: State Management

**Category:** Application Architecture
**Prerequisites:** SK-005
**Required For:** Feature development, application architecture

#### Core Competencies

1. **Select appropriate state type** — The agent must classify all state into one of four categories and use the appropriate tool for each: (a) Server state → TanStack Query / SWR, (b) Global UI state → Zustand / Jotai, (c) Local UI state → `useState` / `useReducer`, (d) Form state → React Hook Form. Misclassifying state leads to unnecessary complexity and bugs.

2. **Proper state initialization** — All state must be initialized to a well-defined default value. The agent must never leave state in an `undefined` or `null` state unless that is semantically meaningful and handled. Loading states must be explicitly represented (e.g., `status: 'loading' | 'success' | 'error'`), not inferred from data presence.

3. **State update immutability** — All state updates must be immutable. The agent must never mutate state directly. When updating nested state, the agent must use proper immutable update patterns (spread operator, `immer`, or structuredClone). Mutation detection must be enabled in development mode.

4. **State persistence strategy** — When state needs to persist across page navigations or sessions, the agent must choose and implement the appropriate persistence mechanism: URL state for shareable state, localStorage for user preferences, cookies for auth tokens, IndexedDB for large datasets, server-side for critical data. Each persistence mechanism has trade-offs that must be explicitly considered.

5. **State debugging patterns** — The agent must implement state debugging capabilities: React DevTools integration, state change logging in development mode, time-travel debugging for complex state machines, and state snapshot comparison for debugging unexpected behavior. These patterns must be non-invasive in production builds.

#### Verification Criteria

- [ ] All state correctly classified into one of four types
- [ ] Zero uninitialized or undefined state at render time
- [ ] Zero direct state mutations detected in development
- [ ] All persisted state uses appropriate storage mechanism
- [ ] State debugging enabled in development mode

---

### SK-008: Testing Strategy

**Category:** Quality Assurance
**Prerequisites:** SK-004
**Required For:** Feature development, bug fixing, refactoring

#### Core Competencies

1. **Unit testing (vitest/jest)** — The agent must write unit tests for all business logic, utility functions, and pure functions. Tests must follow the Arrange-Act-Assert pattern and use descriptive test names that explain the expected behavior. Each test must test exactly one behavior. Tests must be independent and not rely on execution order.

2. **Integration testing** — The agent must write integration tests for component interactions, API route handlers, and database operations. Integration tests verify that multiple units work together correctly. They should use real dependencies where practical and mock only external services (APIs, databases in some cases).

3. **E2E testing (Playwright)** — The agent must write end-to-end tests for critical user flows. E2E tests simulate real user behavior and verify the complete system works as expected. Tests must be resilient to timing issues (using proper waits and selectors), and must clean up test data after execution.

4. **Mocking strategies (when allowed)** — Mocking is a tool, not a default. The agent must prefer testing against real implementations and only mock external dependencies (third-party APIs, file system in unit tests, time-dependent code). Mocks must be type-safe and must accurately represent the mocked dependency's behavior. Over-mocking leads to tests that pass but mask real bugs.

5. **Test organization patterns** — Tests must be organized to mirror the source code structure. Test files must be colocated with source files or in a dedicated `__tests__` directory. Test suites must be grouped by feature/module. Shared test utilities and fixtures must be extracted into reusable modules. Tests must follow the testing trophy pattern: many integration tests, fewer unit tests for complex logic, some E2E tests for critical paths.

#### Verification Criteria

- [ ] 80%+ code coverage on business logic
- [ ] All critical user flows have E2E tests
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Mocking used only for external dependencies
- [ ] Test organization mirrors source structure

---

## 4. ADVANCED SKILLS (TIER 3)

Tier 3 skills are required for complex, multi-faceted tasks that impact the entire application. Agents demonstrating these skills are trusted to make significant architectural and performance decisions.

### SK-009: Performance Optimization

**Category:** Performance Engineering
**Prerequisites:** SK-005, SK-007, SK-008
**Required For:** Performance tuning, optimization tasks

#### Core Competencies

1. **Bundle analysis and optimization** — The agent must be able to analyze the production bundle (using `@next/bundle-analyzer`, `webpack-bundle-analyzer`, or `vite-plugin-visualizer`) and identify optimization opportunities. Common optimizations include: tree-shaking unused code, replacing heavy libraries with lighter alternatives, code splitting by route, and eliminating duplicate dependencies.

2. **Code splitting strategies** — The agent must implement code splitting at appropriate boundaries: route-based splitting (each page loads only its own code), component-based splitting (heavy components loaded on demand), and library-based splitting (large third-party libraries split into separate chunks). Dynamic imports (`import()`) must be used with proper loading states (Suspense boundaries with fallback UI).

3. **Lazy loading patterns** — The agent must implement lazy loading for images (`next/image`, `loading="lazy"`), components (`React.lazy`, `next/dynamic`), and data (TanStack Query prefetching, incremental loading). Lazy loading must improve initial page load time without degrading user experience (proper skeleton screens, progressive loading).

4. **Memory leak detection** — The agent must be able to identify and fix memory leaks: event listeners not cleaned up, subscriptions not unsubscribed, intervals/timeouts not cleared, DOM references retained after unmount, and closures capturing large objects. The agent must use Chrome DevTools Memory profiler and React DevTools to detect leaks.

5. **Rendering optimization** — The agent must apply rendering optimizations judiciously: `React.memo` for components that re-render with the same props, `useMemo` for expensive computations that don't need to recompute on every render, and `useCallback` for functions passed as props that would cause child re-renders. The agent must profile before and after optimization to verify the optimization is beneficial — premature optimization is worse than no optimization.

#### Verification Criteria

- [ ] Bundle size within defined budget (< 200KB initial JS gzipped)
- [ ] All routes code-split with independent chunks
- [ ] Lighthouse performance score >= 90
- [ ] Zero memory leaks detected in 30-minute stress test
- [ ] All optimizations verified with before/after profiling

---

### SK-010: Security Implementation

**Category:** Security Engineering
**Prerequisites:** SK-006, SK-003
**Required For:** Authentication, authorization, data protection

#### Core Competencies

1. **OWASP Top 10 prevention** — The agent must implement defenses against all OWASP Top 10 vulnerabilities: injection (parameterized queries, input validation), broken authentication (secure session management, MFA support), sensitive data exposure (encryption at rest and in transit), XML external entities (disable DTD processing), broken access control (proper authorization checks), misconfigured security (security headers, CORS), cross-site scripting (output encoding, CSP), insecure deserialization (type validation), known vulnerabilities (dependency scanning), and insufficient logging (audit trails).

2. **Authentication/Authorization patterns** — The agent must implement authentication using established libraries (NextAuth.js, Passport, etc.) with proper session management, token rotation, and secure storage. Authorization must be implemented using role-based or attribute-based access control (RBAC/ABAC) with checks at every layer: middleware, route handlers, API routes, and component level.

3. **Input sanitization** — All user input must be sanitized before processing and rendering. HTML content must be sanitized (DOMPurify). SQL queries must use parameterized statements. Shell commands must never be constructed from user input. URLs must be validated and encoded. File uploads must be validated for type, size, and content.

4. **CSRF/XSS/SQLi prevention** — The agent must implement CSRF protection (tokens, SameSite cookies), XSS prevention (output encoding, Content Security Policy, HttpOnly cookies), and SQLi prevention (parameterized queries, ORM usage, input validation). These must be implemented by default on every project, not added as an afterthought.

5. **Secure data handling** — Sensitive data (passwords, tokens, PII) must be encrypted at rest and in transit. Passwords must be hashed with bcrypt or argon2. API keys and secrets must be stored in environment variables, never committed to version control. Logs must not contain sensitive data. Data retention policies must be implemented and enforced.

#### Verification Criteria

- [ ] OWASP Top 10 checklist 100% compliant
- [ ] Authentication flow passes security audit
- [ ] All user inputs sanitized before processing
- [ ] CSRF/XSS/SQLi protections verified with penetration tests
- [ ] Zero secrets or sensitive data in git history

---

### SK-011: Database Design

**Category:** Data Engineering
**Prerequisites:** SK-006, SK-010
**Required For:** Database operations, schema design, data migration

#### Core Competencies

1. **Schema design principles** — The agent must design database schemas following normalization principles (3NF for OLTP, denormalized for read-heavy OLAP). Entities must have proper primary keys (UUID or ULID recommended for distributed systems). Relationships must be properly modeled with foreign keys and junction tables. Schema must support the application's query patterns efficiently.

2. **Index optimization** — The agent must create indexes based on actual query patterns, not guesses. Every index must serve a verified query. The agent must understand and balance the trade-off between read performance (more indexes) and write performance (fewer indexes). Composite indexes must be ordered correctly for the query patterns they serve. The agent must regularly review and remove unused indexes.

3. **Query optimization** — The agent must write efficient queries that leverage indexes, avoid N+1 patterns (using eager loading or DataLoader), limit result sets with pagination, and use appropriate join strategies. The agent must be able to read and interpret query execution plans. Slow queries (> 100ms) must be identified and optimized.

4. **Migration strategies** — Database schema changes must be managed through versioned migrations. Migrations must be reversible (down migrations). Destructive changes (dropping columns, renaming tables) must use a multi-step deployment strategy: add new → migrate data → update code → remove old. Migrations must be tested against production-like data volumes.

5. **Data integrity constraints** — The agent must implement data integrity at the database level, not just the application level. This includes: NOT NULL constraints on required fields, UNIQUE constraints on natural keys, CHECK constraints for data validation, FOREIGN KEY constraints for referential integrity, and appropriate ON DELETE behavior (CASCADE, SET NULL, RESTRICT). Application-level validation is a complement to, not a replacement for, database constraints.

#### Verification Criteria

- [ ] Schema normalization verified with dependency analysis
- [ ] All query paths covered by indexes
- [ ] Zero N+1 queries detected with query logging
- [ ] All migrations reversible with tested down paths
- [ ] Data integrity constraints match application validation rules

---

### SK-012: DevOps & Deployment

**Category:** Infrastructure
**Prerequisites:** SK-009, SK-010, SK-011
**Required For:** Deployment, CI/CD, infrastructure tasks

#### Core Competencies

1. **Docker containerization** — The agent must create production-ready Dockerfiles following best practices: multi-stage builds (build stage, production stage), minimal base images (Alpine, distroless), non-root user, proper layer caching, and deterministic builds. Docker Compose must be provided for local development with hot-reload support.

2. **CI/CD pipeline design** — The agent must design CI/CD pipelines that include: lint and type-check on every commit, unit and integration tests on every pull request, E2E tests on merge to main, security scanning, build and deploy on release. Pipelines must be fast (target: < 10 minutes for PR checks) and provide clear, actionable feedback on failures.

3. **Environment management** — The agent must implement a multi-environment strategy (development, staging, production) with proper environment variable management. Environment-specific configuration must be externalized (not hardcoded). Secrets must be managed through a secrets manager (Vault, AWS Secrets Manager, etc.) or, at minimum, encrypted environment variables.

4. **Health monitoring** — The agent must implement health check endpoints (`/health`, `/ready`) that verify application health (database connectivity, external service availability, memory usage). Applications must expose metrics (Prometheus format) for monitoring. Structured logging must be implemented with correlation IDs for request tracing.

5. **Rollback strategies** — Every deployment must have a documented rollback procedure. The agent must implement blue-green or canary deployment strategies when possible. Database migrations must support rollback. Feature flags must be used to enable/disable features without deployment. Rollback must be achievable in < 5 minutes.

#### Verification Criteria

- [ ] Docker builds produce minimal, secure images
- [ ] CI/CD pipeline passes all stages in < 10 minutes
- [ ] Environment configuration fully externalized
- [ ] Health checks verify all critical dependencies
- [ ] Rollback tested and achievable in < 5 minutes

---

## 5. EXPERT SKILLS (TIER 4)

Tier 4 skills are required for cross-system integration and specialized engineering challenges. Agents at this level are trusted to make decisions that affect the entire system architecture.

### SK-013: System Architecture

**Category:** Architecture
**Prerequisites:** SK-009, SK-010, SK-011, SK-012
**Required For:** Architecture decisions, system design, scalability planning

#### Core Competencies

1. **Microservices patterns** — The agent must understand when to apply microservices (and when not to). Services must have clear boundaries based on domain-driven design (bounded contexts). Communication patterns must be chosen deliberately: synchronous (REST/gRPC) for real-time requirements, asynchronous (message queues, event buses) for decoupled workflows. The agent must implement service discovery, circuit breakers, and bulkheads.

2. **Event-driven architecture** — The agent must design event-driven systems using domain events, integration events, and event sourcing where appropriate. Events must be immutable, well-typed, and versioned. The agent must handle event ordering (where it matters), idempotency, and exactly-once delivery semantics. Dead letter queues must be implemented for failed event processing.

3. **CQRS patterns** — The agent must implement Command Query Responsibility Segregation where the read and write models have significantly different requirements. Commands must be validated and produce events. Queries must be optimized for the specific read patterns they serve. The agent must handle eventual consistency and synchronization between the write and read models.

4. **Distributed systems** — The agent must handle the complexities of distributed systems: network partitions, clock skew, partial failures, and consistency trade-offs (CAP theorem). The agent must implement distributed tracing, correlation IDs, and circuit breakers. The agent must design for graceful degradation — the system must remain partially functional even when individual components fail.

5. **Scalability patterns** — The agent must design systems that scale horizontally. This includes: stateless services, shared-nothing architecture, partitioning strategies (sharding), caching layers (Redis, CDN), and load balancing. The agent must identify bottlenecks through load testing and implement targeted scaling solutions.

#### Verification Criteria

- [ ] Architecture documented with clear service boundaries
- [ ] Event-driven patterns implement idempotency and ordering
- [ ] CQRS read/write models independently scalable
- [ ] Distributed failure scenarios tested with chaos engineering
- [ ] System handles 10x load increase gracefully

---

### SK-014: Real-time Systems

**Category:** Real-time Engineering
**Prerequisites:** SK-013
**Required For:** WebSocket features, live updates, collaborative editing

#### Core Competencies

1. **WebSocket implementation** — The agent must implement WebSocket connections using established patterns: connection management (connect, disconnect, reconnect with exponential backoff), heartbeat/ping-pong for connection health, message framing and serialization (JSON or binary protocols), and proper resource cleanup on disconnect. WebSocket servers must handle connection limits and DoS protection.

2. **Server-Sent Events** — The agent must understand when to use Server-Sent Events (SSE) instead of WebSockets. SSE is preferred for unidirectional real-time updates (notifications, stock prices, live feeds). The agent must implement proper SSE handling: auto-reconnection, event ID tracking for resume, and graceful degradation for browsers that don't support SSE.

3. **Optimistic updates** — For real-time collaborative applications, the agent must implement optimistic updates: apply changes locally immediately, sync with server in the background, and roll back if the server rejects the change. The user must be informed of the sync status (pending, synced, failed). Conflict resolution must be implemented when concurrent modifications occur.

4. **Conflict resolution** — The agent must implement conflict resolution strategies for concurrent edits: last-writer-wins (for simple cases), operational transformation (for text editing), or CRDTs (for complex collaborative data structures). The chosen strategy must be documented and its limitations understood.

5. **Connection management** — The agent must manage real-time connections efficiently: connection pooling, multiplexing over a single connection, bandwidth-aware throttling, offline queuing and sync, and graceful degradation when connection quality is poor. The agent must handle edge cases: tab switching, device sleep, network roaming, and server restarts.

#### Verification Criteria

- [ ] WebSocket connections handle 10,000+ concurrent connections
- [ ] Reconnection works correctly after network interruption
- [ ] Optimistic updates roll back correctly on server rejection
- [ ] Conflict resolution handles concurrent edits without data loss
- [ ] Connection recovery works after server restart

---

### SK-015: Advanced Testing

**Category:** Quality Engineering
**Prerequisites:** SK-008, SK-013
**Required For:** Complex system testing, quality assurance leadership

#### Core Competencies

1. **Property-based testing** — The agent must implement property-based tests (using fast-check or jsverify) for critical business logic. Instead of testing specific examples, property-based tests verify that properties hold for a wide range of randomly generated inputs. This catches edge cases that example-based tests miss.

2. **Chaos engineering** — The agent must design and execute chaos engineering experiments to verify system resilience. This includes: network latency injection, dependency failure simulation, resource exhaustion testing, and data corruption testing. Experiments must be conducted in staging environments first, with clear rollback procedures.

3. **Load testing** — The agent must conduct load testing (using k6, Artillery, or Locust) to verify system performance under expected and peak loads. Tests must measure: response time percentiles (p50, p95, p99), throughput (requests per second), error rates, and resource utilization (CPU, memory, network). Results must be compared against defined SLOs.

4. **Mutation testing** — The agent must use mutation testing (using Stryker or PITest) to verify test quality. Mutation testing introduces small code changes (mutations) and verifies that tests fail. If tests pass despite mutations, the tests are not adequately covering the code. The agent must achieve a mutation score of 80%+ on critical business logic.

5. **Contract testing** — The agent must implement contract testing (using Pact) for services that communicate via APIs. Consumer-driven contracts define the expected API shape from the consumer's perspective. Provider verification ensures the provider meets all consumer contracts. This enables independent deployment of services while maintaining compatibility.

#### Verification Criteria

- [ ] Critical business logic has property-based tests
- [ ] System survives 3 chaos engineering scenarios
- [ ] Load tests confirm SLO compliance at peak traffic
- [ ] Mutation score >= 80% on critical modules
- [ ] All service contracts verified before deployment

---

## 6. MASTER SKILLS (TIER 5)

Tier 5 skills are required for organizational-level impact. Agents at this level shape the technical direction of projects and mentor other agents and developers.

### SK-016: Technical Leadership

**Category:** Leadership
**Prerequisites:** All Tier 1-4 skills
**Required For:** Architecture decisions, code review, team guidance

#### Core Competencies

1. **Code review methodology** — The agent must conduct thorough code reviews that evaluate: correctness, performance, security, maintainability, test coverage, and adherence to project conventions. Reviews must provide actionable feedback with specific suggestions, not vague criticism. The agent must balance thoroughness with turnaround time — reviews should be completed within 4 hours of request.

2. **Architecture decision records** — Every significant architectural decision must be documented in an Architecture Decision Record (ADR). The ADR must include: context (why the decision was needed), decision (what was decided), consequences (positive and negative), and alternatives considered. ADRs provide a decision trail that helps future developers understand the rationale behind current architecture.

3. **Technical debt management** — The agent must maintain a technical debt register that catalogs known debt items with: description, impact assessment, estimated effort to fix, and priority. Technical debt must be addressed proactively — a fixed percentage of each sprint (recommended: 20%) must be allocated to debt reduction. The agent must distinguish between prudent debt (deliberate trade-offs) and reckless debt (unnecessary shortcuts).

4. **Team knowledge sharing** — The agent must contribute to team knowledge through documentation, technical blog posts, lunch-and-learn sessions, and pair programming. Complex systems must have architecture overviews, flow diagrams, and onboarding documentation. Knowledge must not be siloed — every critical system must have at least two team members who understand it deeply.

5. **Mentoring patterns** — The agent must actively mentor less experienced team members through code review feedback, pair programming sessions, and guided problem-solving. The agent must adapt mentoring style to the mentee's experience level: more directive for beginners, more collaborative for intermediate developers, and more consultative for advanced developers.

#### Verification Criteria

- [ ] Code reviews completed within 4 hours with actionable feedback
- [ ] ADRs documented for all significant architectural decisions
- [ ] Technical debt register maintained with regular reduction
- [ ] All critical systems have architecture documentation
- [ ] Mentoring sessions conducted and documented

---

### SK-017: Innovation

**Category:** Research & Development
**Prerequisites:** All Tier 1-4 skills
**Required For:** Technology evaluation, prototyping, R&D initiatives

#### Core Competencies

1. **Research new technologies** — The agent must continuously evaluate emerging technologies, frameworks, and patterns. Research must be structured: define the problem space, survey available solutions, evaluate against selection criteria (performance, maturity, community, licensing), and document findings. Research must be objective — the agent must not be biased toward familiar technologies.

2. **Evaluate trade-offs** — Every technology decision involves trade-offs. The agent must explicitly identify and document trade-offs for each option. Trade-off analysis must consider: short-term vs. long-term impact, simplicity vs. capability, speed vs. quality, cost vs. benefit, and risk vs. reward. The agent must present trade-offs clearly so that stakeholders can make informed decisions.

3. **Prototype validation** — New technologies or approaches must be validated through prototyping before adoption. Prototypes must be time-boxed (recommended: 2-5 days), must test the most risky assumptions, and must produce a clear go/no-go recommendation. Prototypes must be disposable — they validate concepts, not production code.

4. **Proof of concept development** — For significant technical decisions, the agent must develop proof-of-concept implementations that demonstrate feasibility and estimate implementation effort. PoCs must be realistic (using production-like constraints), measurable (with defined success criteria), and presentable (with clear documentation of findings and recommendations).

5. **Technology adoption strategy** — The agent must plan technology adoption as a structured process: evaluation (research and prototype), pilot (limited-scope deployment), scaling (incremental rollout), and maturity (full integration with documentation and training). Each phase must have defined exit criteria. Rollback plans must be prepared at each stage.

#### Verification Criteria

- [ ] Technology evaluations follow structured process
- [ ] Trade-off analysis documented for all major decisions
- [ ] Prototypes time-boxed with clear recommendations
- [ ] PoCs test riskiest assumptions with measurable criteria
- [ ] Technology adoption follows phased rollout plan

---

## 7. SKILL VERIFICATION

Each skill in the framework has a defined verification process to ensure that agents possess the competencies they claim. Verification is not a one-time event — it is an ongoing process that ensures skills remain current and accurate.

### Verification Methods

| Method | Description | When Used | Validity Period |
|--------|-------------|-----------|-----------------|
| **Automated Test** | Lint rules, type checks, build verification | Tier 1 skills | Continuous |
| **Code Review** | Peer review of code changes | Tier 2-3 skills | 30 days |
| **Checklist** | Self-assessment against defined criteria | All tiers | 14 days |
| **Manual Audit** | Expert review of specific skill artifacts | Tier 3-4 skills | 90 days |
| **Architecture Review** | Board-level review of decisions | Tier 5 skills | 180 days |

### Minimum Proficiency Levels

| Tier | Minimum Score | Required For |
|------|---------------|--------------|
| Tier 1 | 90% | All agents |
| Tier 2 | 80% | Feature development |
| Tier 3 | 70% | Complex tasks |
| Tier 4 | 60% | Specialized tasks |
| Tier 5 | 50% | Leadership tasks |

> Note: Higher tiers have lower minimum scores because the skills are inherently more complex and difficult to assess. A lower score at Tier 5 still represents a very high level of competence.

### Required Artifacts

Each skill verification requires the agent to produce specific artifacts as evidence of proficiency:

- **Tier 1**: Automated test passes, build logs, lint reports
- **Tier 2**: Code samples with review comments, test coverage reports
- **Tier 3**: Performance benchmarks, security audit reports, migration plans
- **Tier 4**: Architecture documents, load test results, chaos experiment reports
- **Tier 5**: ADRs, technology evaluation reports, mentoring session records

### Evaluation Criteria

Evaluation is based on four dimensions, each weighted equally:

1. **Correctness** — Does the agent's output meet the functional requirements?
2. **Quality** — Does the agent's output follow best practices and conventions?
3. **Completeness** — Does the agent's output cover all required aspects?
4. **Consistency** — Is the agent's output consistent across multiple evaluations?

### Remediation Path

When an agent fails a skill verification, the following remediation process is initiated:

1. **Diagnosis** — Identify the specific competencies that were not demonstrated
2. **Learning Plan** — Create a focused learning plan targeting the weak areas
3. **Practice** — The agent completes practice exercises targeting the weak areas
4. **Re-verification** — The agent is re-evaluated after the learning plan is complete
5. **Escalation** — If the agent fails re-verification, the matter is escalated to the framework maintainers for additional support or skill scope adjustment

---

## 8. SKILL GATING SYSTEM

The skill gating system ensures that tasks are only assigned to agents with verified proficiency in the required skills. This prevents agents from attempting tasks beyond their current capability, which leads to poor quality output, wasted effort, and potential harm to the codebase.

### Task-to-Skill Mapping

Every task must declare its required skills before assignment. The task definition must include:

```typescript
interface TaskSkillRequirements {
  taskId: string;
  requiredSkills: {
    skillId: string;
    minimumStatus: SkillStatus;
  }[];
  optionalSkills: string[];
  estimatedComplexity: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'low' | 'medium' | 'high';
}
```

### Assignment Rules

1. **Hard Gate** — If a task requires a skill and the agent's status for that skill is below the minimum required, the task MUST NOT be assigned. The agent must be directed to develop the required skill first.

2. **Soft Gate** — If a task lists optional skills, the agent may accept the task but must explicitly acknowledge which optional skills they do not possess and describe how they will compensate (e.g., asking for guidance, following templates more closely, spending extra time on verification).

3. **Tier Gate** — Tasks with a complexity of "high" or "critical" must be assigned to agents with verified Tier 3+ skills. Tasks with a risk level of "high" must be assigned to agents with verified Tier 4+ skills.

### Self-Certification Process

Agents must self-certify their skill proficiency using the following process:

1. Review the skill's verification criteria
2. Complete the self-assessment checklist
3. Provide evidence of proficiency (code samples, test results, documentation)
4. Submit for automated verification (Tier 1) or peer review (Tier 2+)
5. Receive verification status update

### Random Skill Audits

To ensure ongoing accuracy of skill certifications, the framework conducts random audits:

- **Frequency**: 5% of verified skills audited per week
- **Selection**: Random selection weighted toward recently verified skills
- **Method**: Re-run verification criteria against the agent's recent work
- **Outcome**: Pass (maintain status), Fail (downgrade status, initiate remediation)

### Skill Degradation Detection

Skills can degrade over time due to technology changes, changing project requirements, or simply lack of practice. The framework monitors for skill degradation:

- **Time-based**: Skills not used for 90+ days are flagged for review
- **Error-based**: Increased error rates in areas covered by a skill trigger review
- **Feedback-based**: Negative code review feedback triggers skill assessment
- **Technology-based**: New versions of dependencies may require skill re-verification

---

## 9. CONTINUOUS IMPROVEMENT

The skill system is not static — it must evolve with the project, the technology landscape, and the team's capabilities. This section defines the processes for keeping the skill system current and effective.

### Skill Assessment Frequency

| Assessment Type | Frequency | Scope | Owner |
|----------------|-----------|-------|-------|
| Self-assessment | Weekly | Agent's current skill set | Agent |
| Peer review | Bi-weekly | Recent work quality | Team lead |
| Skill audit | Monthly | Random skill verification | Framework |
| Skill system review | Quarterly | All skills, criteria, processes | Maintainers |
| Full re-certification | Semi-annually | Complete skill verification | Agent + Reviewers |

### Learning Path Recommendations

Based on skill assessments, the framework generates personalized learning paths:

1. **Current Focus** — Skills the agent is actively developing, with specific practice exercises
2. **Next Steps** — Skills the agent should develop next, based on task demand and career goals
3. **Strengths** — Skills the agent excels at, with opportunities for mentoring others
4. **Gap Analysis** — Skills the agent lacks that are in high demand for current project needs

Learning paths are generated automatically by the skill registry (see `skill-registry.ts`) and updated after each assessment.

### Knowledge Base Updates

The skill system's knowledge base (verification criteria, best practices, examples, anti-patterns) must be updated regularly:

- New anti-patterns are added when recurring issues are identified
- Verification criteria are updated when technology changes require new competencies
- Best practice examples are refreshed to use current library versions and patterns
- Skill descriptions are updated to reflect changes in the technology landscape

### Best Practice Sharing

The framework facilitates best practice sharing through:

- **Skill Spotlights**: Periodic deep-dives into specific skills, shared with all agents
- **Code Review Insights**: Aggregated patterns from code reviews, shared as learning opportunities
- **Failure Post-mortems**: Anonymous analysis of failures, shared as cautionary lessons
- **Success Stories**: Documentation of particularly effective approaches, shared as models

### Anti-Pattern Avoidance

The companion document `anti-patterns.md` catalogs known anti-patterns that agents must avoid. The anti-pattern catalog is continuously updated based on observed issues. Each anti-pattern includes:

- Clear description and identification criteria
- Severity rating and potential impact
- Detection heuristics for automated identification
- Step-by-step correction procedure
- Prevention strategy for future avoidance
- Side-by-side bad vs. good code examples

---

## Appendix A: Quick Reference

### Skill Tier Summary

| Tier | Skills | Key Focus |
|------|--------|-----------|
| 1 — Foundation | SK-001 to SK-004 | Safety, integrity, error prevention, verification |
| 2 — Intermediate | SK-005 to SK-008 | Components, APIs, state, testing |
| 3 — Advanced | SK-009 to SK-012 | Performance, security, database, DevOps |
| 4 — Expert | SK-013 to SK-015 | Architecture, real-time, advanced testing |
| 5 — Master | SK-016 to SK-017 | Leadership, innovation |

### Status Levels

| Status | Description | Allowed Actions |
|--------|-------------|-----------------|
| UNVERIFIED | Skill not yet assessed | Learning mode only |
| LEARNING | Currently developing skill | Guided tasks only |
| PRACTITIONER | Basic proficiency | Standard tasks under review |
| PROFICIENT | Reliable proficiency | Independent tasks |
| EXPERT | Deep mastery | Complex tasks, mentoring |

### Key Numbers

- **17** total skills across 5 tiers
- **4** foundation skills mandatory for all agents
- **90%** minimum proficiency for Tier 1
- **30+** days between full re-verifications
- **5%** random audit rate per week
- **20%** sprint capacity recommended for tech debt

---

## Appendix B: Document Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Created** | 2025-01-10 |
| **Last Modified** | 2025-01-10 |
| **Author** | Deerflow Agent Framework — skill-system-creator |
| **Review Status** | Approved |
| **Next Review Date** | 2025-04-10 |
| **Related Documents** | `anti-patterns.md`, `skill-registry.ts`, `master-rules.md` |
