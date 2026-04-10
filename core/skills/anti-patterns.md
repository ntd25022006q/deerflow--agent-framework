# DEERFLOW ANTI-PATTERN CATALOG v1.0
## Common AI Agent Anti-Patterns, Detection, and Correction

> **Document Version:** 1.0.0
> **Last Updated:** 2025-01-10
> **Owner:** Deerflow Agent Framework — Core Skills Module
> **Status:** Active
> **Companion:** `agent-skills.md`, `skill-registry.ts`

---

## How to Use This Catalog

Each anti-pattern entry follows a standard structure:

| Field | Description |
|-------|-------------|
| **ID** | Unique identifier (AP-NNN) |
| **Name** | Short descriptive name |
| **Severity** | CRITICAL / HIGH / MEDIUM / LOW |
| **Category** | The skill area this anti-pattern violates |
| **Description** | What the anti-pattern is and why it is harmful |
| **Detection Heuristics** | How to automatically or manually identify it |
| **Correction Procedure** | Step-by-step fix instructions |
| **Prevention Strategy** | How to prevent it in the future |

### Severity Definitions

- **CRITICAL**: Causes immediate data loss, security breach, or system failure. Must be fixed immediately.
- **HIGH**: Causes bugs, performance degradation, or significant technical debt. Must be fixed within the same session.
- **MEDIUM**: Reduces code quality or maintainability. Should be fixed before the next commit.
- **LOW**: Minor style or convention issue. Should be addressed when convenient.

---

## FILE SYSTEM & OPERATIONS

### AP-001: Silent File Deletion

**Severity:** CRITICAL
**Category:** SK-001 (File System Safety)

Deleting files without explicit user confirmation. This is the most dangerous anti-pattern because file deletions are irreversible and the user may not notice the loss until much later.

**Detection Heuristics:**
- `rm` commands without preceding confirmation prompt
- `fs.unlink()` calls without guard conditions
- File deletion in the middle of a multi-step operation without user visibility

**Correction Procedure:**
1. Immediately check if the deleted file was tracked in version control
2. If tracked, restore using `git checkout <file>` or `git restore <file>`
3. If not tracked, check for backups (`.backup-*` files, editor undo history)
4. Add a confirmation check before any future deletion
5. Document the deletion rationale in the commit message

**Prevention Strategy:**
Enforce a mandatory confirmation function wrapper around all delete operations. The confirmation must display the exact file path and size.

```typescript
// BAD — Silent deletion
import { unlinkSync } from 'fs';
unlinkSync('./config/settings.json');

// GOOD — Confirmation before deletion
async function safeDelete(filePath: string): Promise<void> {
  const confirmation = await prompt(
    `Delete file: ${filePath} (${statSync(filePath).size} bytes)? [y/N] `
  );
  if (confirmation.toLowerCase() !== 'y') {
    throw new Error('Deletion cancelled by user');
  }
  const backupPath = `${filePath}.backup-${Date.now()}`;
  copyFileSync(filePath, backupPath);
  unlinkSync(filePath);
  return backupPath;
}
```

---

### AP-002: Write Without Path Verification

**Severity:** HIGH
**Category:** SK-001 (File System Safety)

Writing to a file path without first verifying that the target directory exists. This results in cryptic ENOENT errors and wastes debugging time.

**Detection Heuristics:**
- `writeFileSync` / `writeFile` calls without preceding `existsSync` or `mkdirSync`
- File paths referencing directories that have not been created in the session

**Correction Procedure:**
1. Add directory existence check before the write
2. Create missing directories using `mkdirSync(path, { recursive: true })`
3. Verify the write succeeded by reading back the file

**Prevention Strategy:**
Use a `safeWrite` utility that handles directory creation and write verification automatically.

```typescript
// BAD — No path verification
writeFileSync('/project/new-dir/config.json', content);

// GOOD — Path verified, directory created atomically
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
function safeWrite(filePath: string, content: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, content, 'utf-8');
  const verification = readFileSync(filePath, 'utf-8');
  if (verification !== content) {
    throw new Error(`Write verification failed for ${filePath}`);
  }
}
```

---

### AP-003: Modification Without Backup

**Severity:** HIGH
**Category:** SK-001 (File System Safety)

Modifying critical files (config, schema, env, lock files) without creating a backup first. If the modification is incorrect, there is no easy way to revert.

**Detection Heuristics:**
- Modifications to files matching `*.config.*`, `*.schema.*`, `.env*`, `*-lock.json` without a preceding copy
- Large-scale search-and-replace operations on critical files

**Correction Procedure:**
1. If the file is tracked in git, use `git diff` to review the changes
2. If the modification is incorrect, restore with `git restore <file>`
3. Create a backup before re-applying the modification

**Prevention Strategy:**
Maintain a list of critical file patterns and enforce backup-before-modify in all operations.

---

### AP-004: Scope Violation — Writing Outside Project

**Severity:** CRITICAL
**Category:** SK-001 (File System Safety)

Writing, modifying, or deleting files outside the project directory. This can corrupt system files, affect other projects, or create security vulnerabilities.

**Detection Heuristics:**
- File operations targeting paths that do not start with the project root
- Paths containing `..` that resolve outside the project directory

**Correction Procedure:**
1. Immediately check what was modified outside the project
2. Revert changes if possible
3. Report the scope violation to the user

**Prevention Strategy:**
Implement a path sandbox that resolves and validates all file paths against the project root before any operation.

---

## CODE QUALITY

### AP-005: Unrestricted `any` Type Usage

**Severity:** HIGH
**Category:** SK-003 (Error Prevention)

Using the `any` type in TypeScript code disables type checking for that value, defeating the purpose of using TypeScript entirely. This allows type mismatches to propagate to runtime.

**Detection Heuristics:**
- ESLint rule `@typescript-eslint/no-explicit-any`
- `grep` for `: any` or `as any` in non-test files
- TypeScript compiler report showing implicit `any` errors

**Correction Procedure:**
1. Identify the actual type of the value (from documentation, source code, or runtime inspection)
2. Replace `any` with the correct type
3. If the type is unknown, use `unknown` and narrow with type guards
4. For library types without definitions, create a `.d.ts` declaration file

**Prevention Strategy:**
Enable `@typescript-eslint/no-explicit-any` as an error in ESLint. Configure TypeScript strict mode.

```typescript
// BAD — any disables all type checking
function processUser(user: any) {
  return user.name.toUpperCase(); // Runtime error if user.name is undefined
}

// GOOD — Proper types with narrowing
function processUser(user: unknown): string {
  if (typeof user === 'object' && user !== null && 'name' in user && typeof user.name === 'string') {
    return user.name.toUpperCase();
  }
  throw new Error('Invalid user object: missing or invalid name field');
}
```

---

### AP-006: Empty Catch Blocks

**Severity:** HIGH
**Category:** SK-003 (Error Prevention)

Catching errors and silently discarding them. This hides bugs, makes debugging impossible, and can lead to cascading failures because the error is never handled.

**Detection Heuristics:**
- `catch` blocks with empty bodies or containing only `// ignore` comments
- ESLint rule `no-empty` (with `allowEmptyCatch: false`)

**Correction Procedure:**
1. Determine the appropriate handling strategy for the error (recover, re-throw, or report)
2. Implement the handling strategy
3. If the error is truly expected and benign, add a comment explaining why

**Prevention Strategy:**
Enable `no-empty` ESLint rule. Require all catch blocks to at minimum log the error with context.

```typescript
// BAD — Silent error swallowing
try {
  await saveToDatabase(record);
} catch (e) {
  // silently ignored
}

// GOOD — Proper error handling with context
try {
  await saveToDatabase(record);
} catch (error) {
  logger.error('Failed to save record to database', {
    recordId: record.id,
    error: error instanceof Error ? error.message : String(error),
  });
  throw new DatabaseError('Failed to persist record', { cause: error });
}
```

---

### AP-007: Missing Input Validation

**Severity:** CRITICAL
**Category:** SK-003 (Error Prevention)

Accepting external input (HTTP requests, environment variables, API responses) without validation. This is the root cause of injection attacks, crashes from malformed data, and data corruption.

**Detection Heuristics:**
- API route handlers without Zod/Joi validation
- `process.env` values used directly without validation
- JSON parsing without schema validation

**Correction Procedure:**
1. Identify all entry points where external data enters the system
2. Create Zod schemas for each input shape
3. Validate input at the entry point before processing
4. Return 422 status code with detailed error messages for invalid input

**Prevention Strategy:**
Enforce Zod validation on every API route handler. Use middleware for common validation patterns.

```typescript
// BAD — No validation
app.post('/api/users', (req, res) => {
  db.insert('users', req.body); // req.body could be anything
});

// GOOD — Zod validation at the boundary
import { z } from 'zod';
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
});
app.post('/api/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ errors: result.error.flatten() });
  }
  db.insert('users', result.data);
});
```

---

### AP-008: Skipping Verification After Changes

**Severity:** MEDIUM
**Category:** SK-004 (Code Verification)

Making code changes without running compile checks, lint, or tests afterward. This allows type errors, lint violations, and regressions to accumulate, making them progressively harder to fix.

**Detection Heuristics:**
- Code changes (git diffs) without corresponding verification log entries
- Increasing error count in the codebase over time

**Correction Procedure:**
1. Run the full verification suite immediately
2. Fix all errors introduced since the last successful verification
3. Establish a verification cadence (every change for compile/lint, every 3-5 changes for tests)

**Prevention Strategy:**
Integrate verification into the development workflow with pre-commit hooks (husky + lint-staged).

---

## ARCHITECTURE & DESIGN

### AP-009: God Component

**Severity:** HIGH
**Category:** SK-005 (Component Architecture)

A single component that handles multiple responsibilities: data fetching, business logic, complex state management, and rendering. God components are impossible to test, reuse, or maintain.

**Detection Heuristics:**
- Components exceeding 200 lines
- Components with more than 5 hooks
- Components importing from 10+ different modules
- Components with deeply nested ternary expressions in JSX

**Correction Procedure:**
1. Identify each distinct responsibility within the component
2. Extract data fetching into custom hooks or API client functions
3. Extract business logic into utility functions or a service layer
4. Extract sub-UI elements into child components
5. Keep only composition and layout in the parent component

**Prevention Strategy:**
Set a component size limit (recommended: 150 lines). Use ESLint rules to flag large files.

```typescript
// BAD — God component doing everything
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '' });

  useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser);
    fetch(`/api/users/${userId}/posts`).then(r => r.json()).then(setPosts);
  }, [userId]);

  const handleSave = async () => {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT', body: JSON.stringify(formData),
    });
    setEditing(false);
  };

  // ... 200+ more lines of rendering, form handling, etc.
}

// GOOD — Decomposed responsibilities
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId);
  const { data: posts } = useUserPosts(userId);

  if (isLoading) return <UserSkeleton />;

  return (
    <div>
      <UserHeader user={user} />
      <UserBio user={user} />
      <UserPosts posts={posts} />
    </div>
  );
}
```

---

### AP-010: Prop Drilling

**Severity:** MEDIUM
**Category:** SK-005 (Component Architecture)

Passing props through multiple layers of components that don't use them. This creates tight coupling, makes refactoring difficult, and obscures data flow.

**Detection Heuristics:**
- Components that accept props only to pass them to their children
- Props that traverse 3+ component levels without being consumed
- Components with `...props` spread to a single child

**Correction Procedure:**
1. Identify the deepest component that actually uses the prop
2. Use React Context if the prop is needed by many nested components
3. Use component composition (children prop) if the prop is needed by one specific subtree
4. Use a state manager (Zustand, Jotai) if the state is global

**Prevention Strategy:**
Review component trees during code review for unnecessary prop threading. Use composition patterns.

---

### AP-011: Mutable State Updates

**Severity:** HIGH
**Category:** SK-007 (State Management)

Directly mutating state objects or arrays in React. This bypasses React's change detection, causes stale renders, and leads to unpredictable behavior.

**Detection Heuristics:**
- `array.push()`, `array.splice()`, `object.field = value` inside state updates
- ESLint rule `react-hooks/exhaustive-deps` firing unexpectedly
- Components not re-rendering when state changes

**Correction Procedure:**
1. Replace all mutations with immutable operations (spread, map, filter, concat)
2. Consider using Immer (`produce`) for complex nested updates
3. Enable `eslint-plugin-react-hooks` with exhaustive-deps rule

**Prevention Strategy:**
Use Immer for complex state updates. Enable strict mode to surface mutation issues.

```typescript
// BAD — Direct mutation
const [items, setItems] = useState<Item[]>([]);
items.push(newItem); // Mutation! React won't detect this change.

// GOOD — Immutable update
const [items, setItems] = useState<Item[]>([]);
setItems(prev => [...prev, newItem]);

// GOOD — Complex nested update with Immer
import { produce } from 'immer';
setItems(produce(draft => {
  draft.find(i => i.id === id)!.completed = true;
}));
```

---

### AP-012: Global State Overuse

**Severity:** MEDIUM
**Category:** SK-007 (State Management)

Putting all state in a global store when most of it is only used locally. This creates unnecessary re-renders, makes the data flow harder to trace, and couples unrelated components.

**Detection Heuristics:**
- Global store containing state used by only one component tree
- Components re-rendering when unrelated global state changes
- State that is only needed during component mount

**Correction Procedure:**
1. Audit the global store and classify each piece of state
2. Move server state to TanStack Query
3. Move local-only state to `useState` / `useReducer`
4. Keep only truly cross-cutting UI state (theme, locale, auth) in the global store

**Prevention Strategy:**
Establish a state classification guide. Review global store additions during code review.

---

## API & BACKEND

### AP-013: Missing API Validation

**Severity:** CRITICAL
**Category:** SK-006 (API Design)

API endpoints that accept requests without validating the request body, query parameters, or path parameters. This allows malformed data into the system and can lead to crashes, data corruption, or security vulnerabilities.

**Detection Heuristics:**
- Route handlers without Zod schema parsing
- `req.body`, `req.query`, or `req.params` used without validation
- No 422 responses in API error handling

**Correction Procedure:**
1. Create Zod schemas for every endpoint's input
2. Parse and validate input at the route handler level
3. Return structured 422 error responses for validation failures
4. Add middleware-level validation for common patterns

**Prevention Strategy:**
Make validation the default by using a framework-level validation middleware that requires schemas for all routes.

---

### AP-014: Inconsistent Error Responses

**Severity:** MEDIUM
**Category:** SK-006 (API Design)

Different API endpoints returning errors in different formats. This makes error handling on the client unpredictable and debugging difficult.

**Detection Heuristics:**
- `res.status(400).send()`, `res.json({ error: ... })`, `res.json({ message: ... })` used inconsistently
- Client-side error handling that checks multiple possible error formats

**Correction Procedure:**
1. Define a standard error response type
2. Create a utility function for sending error responses
3. Replace all ad-hoc error responses with the standard utility
4. Update client-side error handling to use a single format

**Prevention Strategy:**
Use a shared error response utility that enforces the standard format at the type level.

```typescript
// BAD — Inconsistent error formats
res.status(400).send('Bad request');
res.status(500).json({ message: 'Internal error' });
res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });

// GOOD — Standardized error response
interface ApiError {
  code: string;
  message: string;
  timestamp: string;
  requestId: string;
  details?: Record<string, string[]>;
}
function sendError(res: Response, status: number, code: string, message: string) {
  res.status(status).json({
    code,
    message,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId,
  } satisfies ApiError);
}
```

---

### AP-015: Missing API Versioning

**Severity:** MEDIUM
**Category:** SK-006 (API Design)

Building APIs without versioning from the start. When breaking changes are needed, there is no way to introduce them without breaking existing clients.

**Detection Heuristics:**
- API routes without version prefix (e.g., `/api/users` instead of `/api/v1/users`)
- No version negotiation mechanism

**Correction Procedure:**
1. Add version prefix to all existing routes
2. Set up version-to-handler routing
3. Update all clients to use the versioned URL
4. Document the versioning strategy

**Prevention Strategy:**
Require version prefix in API route definitions from the start.

---

## TESTING

### AP-016: Testing Implementation Details

**Severity:** MEDIUM
**Category:** SK-008 (Testing Strategy)

Writing tests that assert on internal implementation details (private methods, internal state, CSS class names) rather than observable behavior. These tests break when the implementation changes without the behavior changing.

**Detection Heuristics:**
- Tests importing internal modules (files not in the public API)
- Tests asserting on `.length` of internal arrays or state
- Tests that break when code is refactored without behavior change

**Correction Procedure:**
1. Identify what behavior the test is actually verifying
2. Rewrite the test to assert on observable outputs (rendered text, API calls, state changes)
3. Use testing-library's user-event for interaction testing

**Prevention Strategy:**
Follow the testing-library philosophy: test behavior, not implementation. Avoid shallow rendering.

```typescript
// BAD — Testing implementation details
test('clicking button sets loading to true', () => {
  const { result } = renderHook(() => useSubmitForm());
  act(() => result.current.setLoading(true));
  expect(result.current.isLoading).toBe(true);
});

// GOOD — Testing observable behavior
test('submit button shows spinner while submitting', async () => {
  render(<SubmitButton onSubmit={mockSubmit} />);
  const button = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(button);
  expect(screen.getByRole('progressbar')).toBeVisible();
});
```

---

### AP-017: Over-Mocking

**Severity:** MEDIUM
**Category:** SK-008 (Testing Strategy)

Mocking everything in tests, including the system under test's own logic. This creates tests that pass even when the code is broken, providing a false sense of security.

**Detection Heuristics:**
- Test files where more lines are mock setup than actual test logic
- Mocking internal utility functions of the module being tested
- Tests that never fail when the implementation has bugs

**Correction Procedure:**
1. Remove mocks for the module being tested
2. Keep mocks only for external dependencies (APIs, databases, third-party services)
3. Write integration tests that use real implementations for internal modules

**Prevention Strategy:**
Establish a clear mocking policy: mock only external boundaries. Prefer integration tests.

---

### AP-018: Untestable Code Design

**Severity:** HIGH
**Category:** SK-008 (Testing Strategy)

Writing code that is inherently difficult or impossible to test due to tight coupling, hidden dependencies, side effects in constructors, or lack of dependency injection.

**Detection Heuristics:**
- Functions that call `fetch()` or `Date.now()` directly
- Classes that instantiate their dependencies in the constructor
- Functions with more than 3 side effects

**Correction Procedure:**
1. Extract side effects into injectable dependencies
2. Use dependency injection (constructor parameters, function parameters)
3. Separate pure logic from impure side effects
4. Make time-dependent code accept a clock parameter

**Prevention Strategy:**
Design for testability from the start. Follow the dependency inversion principle.

---

## PERFORMANCE

### AP-019: Unnecessary Re-renders

**Severity:** MEDIUM
**Category:** SK-009 (Performance Optimization)

Components re-rendering when their props or state haven't meaningfully changed. This wastes CPU cycles and can cause visible jank in complex UIs.

**Detection Heuristics:**
- React DevTools Profiler showing unnecessary re-renders
- `console.log` in component body firing unexpectedly
- Performance profiling showing excessive render cycles

**Correction Procedure:**
1. Identify the source of unnecessary re-renders using React DevTools
2. Apply `React.memo` for components receiving stable props
3. Use `useMemo` for expensive computations
4. Use `useCallback` for function props passed to memoized children
5. Verify the optimization actually helps with profiling

**Prevention Strategy:**
Profile before optimizing. Set React DevTools as a standard development tool.

---

### AP-020: Missing Code Splitting

**Severity:** MEDIUM
**Category:** SK-009 (Performance Optimization)

Loading the entire application in a single JavaScript bundle. This increases initial load time, especially for large applications, and degrades the user experience on slow networks.

**Detection Heuristics:**
- Single large JavaScript bundle (> 200KB gzipped)
- No dynamic `import()` usage in the codebase
- Lighthouse "Reduce JavaScript execution time" warning

**Correction Procedure:**
1. Identify natural splitting boundaries (routes, modals, heavy components)
2. Replace static imports with dynamic `import()` + `React.lazy()`
3. Add `Suspense` boundaries with appropriate loading fallbacks
4. Verify bundle size improvement with bundle analyzer

**Prevention Strategy:**
Configure route-based code splitting by default. Use `next/dynamic` for Next.js projects.

---

### AP-021: Premature Optimization

**Severity:** LOW
**Category:** SK-009 (Performance Optimization)

Optimizing code without evidence that it is a performance bottleneck. Premature optimization adds complexity, reduces readability, and may not improve performance at all.

**Detection Heuristics:**
- `useMemo` / `useCallback` on every component without profiling
- Complex caching logic for data that is rarely accessed
- Custom implementations replacing simple built-in methods "for performance"

**Correction Procedure:**
1. Profile the application to identify actual bottlenecks
2. Remove optimizations that don't show measurable improvement
3. Focus optimization effort on the 20% of code that causes 80% of performance issues

**Prevention Strategy:**
Require profiling data before approving performance optimizations in code review.

---

## SECURITY

### AP-022: Hardcoded Secrets

**Severity:** CRITICAL
**Category:** SK-010 (Security Implementation)

Embedding API keys, passwords, tokens, or other secrets directly in source code. These secrets are visible to anyone with access to the codebase and will be committed to version control permanently.

**Detection Heuristics:**
- String literals matching common secret patterns (API_KEY, password, token, secret)
- ESLint rule `no-secrets` or `detect-secrets` scanner
- Git history analysis for committed secrets

**Correction Procedure:**
1. Immediately rotate the compromised secret (the old value is no longer secure)
2. Move the secret to an environment variable or secrets manager
3. If the secret was committed to git, use `git filter-branch` or `BFG Repo Cleaner` to remove it from history
4. Add the secret pattern to `.gitignore` and pre-commit scanning

**Prevention Strategy:**
Use `detect-secrets` as a pre-commit hook. Never commit secrets to version control.

---

### AP-023: SQL Injection Vulnerability

**Severity:** CRITICAL
**Category:** SK-010 (Security Implementation)

Constructing SQL queries by concatenating user input directly into query strings. This allows attackers to execute arbitrary SQL commands, potentially accessing, modifying, or deleting all data in the database.

**Detection Heuristics:**
- String concatenation or template literals in SQL query construction
- ESLint rule `security/detect-sql-injection`
- SQL keywords (`SELECT`, `DROP`, `INSERT`) combined with `${` or `+`

**Correction Procedure:**
1. Replace all string-concatenated queries with parameterized queries
2. Use an ORM or query builder (Prisma, Drizzle, Knex)
3. Validate that all user input is properly escaped or parameterized
4. Run a security audit to check for other injection points

**Prevention Strategy:**
Mandate parameterized queries or ORM usage. Ban string-concatenated SQL.

```typescript
// BAD — SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${userInput}'`;

// GOOD — Parameterized query
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [userInput]);

// GOOD — ORM (Prisma)
const users = await prisma.user.findMany({ where: { email: userInput } });
```

---

### AP-024: Missing Authentication Checks

**Severity:** CRITICAL
**Category:** SK-010 (Security Implementation)

API endpoints or pages that can be accessed without authentication when they should require it. This exposes sensitive functionality and data to unauthenticated users.

**Detection Heuristics:**
- Route handlers without auth middleware
- Pages without auth guard components
- API endpoints that don't check session/token validity

**Correction Procedure:**
1. Audit all routes and pages for authentication requirements
2. Add authentication middleware/checks to all protected routes
3. Test that unauthenticated access is properly rejected
4. Add auth checks at both the middleware level and the handler level for defense in depth

**Prevention Strategy:**
Use a catch-all authentication middleware. Default to authenticated; explicitly mark public routes.

---

## DATABASE

### AP-025: N+1 Query Problem

**Severity:** HIGH
**Category:** SK-011 (Database Design)

Executing one query to fetch a list of items, then N additional queries to fetch related data for each item. This turns O(1) database operations into O(N), causing severe performance degradation.

**Detection Heuristics:**
- Loops containing database queries
- Query logs showing exponentially many queries for simple list operations
- Response time increasing linearly with the number of related records

**Correction Procedure:**
1. Replace N+1 queries with a single query using JOINs or eager loading
2. In Prisma: use `include` or `select` for relations
3. In raw SQL: use JOINs with proper grouping
4. Consider DataLoader for batched GraphQL queries

**Prevention Strategy:**
Enable query logging in development. Set thresholds for maximum queries per request.

```typescript
// BAD — N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// GOOD — Single query with eager loading
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

---

### AP-026: Missing Database Indexes

**Severity:** HIGH
**Category:** SK-011 (Database Design)

Querying database columns without proper indexes. This causes full table scans on every query, making the application slow down dramatically as data grows.

**Detection Heuristics:**
- `EXPLAIN ANALYZE` output showing sequential scans on large tables
- Query response time increasing with table size
- Database monitoring showing high I/O wait

**Correction Procedure:**
1. Run `EXPLAIN ANALYZE` on slow queries
2. Identify columns used in WHERE, JOIN, ORDER BY clauses
3. Create composite indexes matching the query patterns
4. Monitor query performance after index creation

**Prevention Strategy:**
Review query patterns during schema design. Create indexes proactively for columns used in filters and joins.

---

### AP-027: Irreversible Migrations

**Severity:** HIGH
**Category:** SK-011 (Database Design)

Database migrations that cannot be rolled back. Destructive operations (DROP COLUMN, DROP TABLE, RENAME COLUMN) without down migrations leave the database in an unrecoverable state if the migration fails or needs to be reverted.

**Detection Heuristics:**
- Migration files without a `down` function
- `down` functions that throw "not implemented"
- Destructive operations in `up` functions without corresponding `down` operations

**Correction Procedure:**
1. Write down migrations for all existing up migrations
2. For destructive changes, use a multi-step approach: add new column → migrate data → update code → remove old column (each as a separate migration)
3. Test both up and down migrations on a copy of production data

**Prevention Strategy:**
Require down migrations for all schema changes. Test migrations against production-like data volumes.

---

## DEVOPS & DEPLOYMENT

### AP-028: No Health Checks

**Severity:** HIGH
**Category:** SK-012 (DevOps & Deployment)

Running a service without health check endpoints. This makes it impossible for orchestration systems to detect failures, restart unhealthy instances, or route traffic away from failing nodes.

**Detection Heuristics:**
- No `/health` or `/ready` endpoints in the API
- No liveness/readiness probes in container configuration
- Manual investigation required to determine service status

**Correction Procedure:**
1. Add a `/health` endpoint that checks the application process is running (liveness)
2. Add a `/ready` endpoint that checks all critical dependencies (readiness)
3. Configure health probes in Docker/Kubernetes with appropriate thresholds

**Prevention Strategy:**
Include health check endpoints in the project template. Require them for all services.

---

### AP-029: Secrets in Docker Images

**Severity:** CRITICAL
**Category:** SK-012 (DevOps & Deployment)

Baking secrets (API keys, database credentials, certificates) into Docker images. Anyone with access to the image can extract the secrets, and the secrets persist in image layers even after they're "removed."

**Detection Heuristics:**
- `ENV` or `ARG` instructions containing key-like values in Dockerfiles
- Secrets visible in `docker history` output
- `.env` files copied into Docker images

**Correction Procedure:**
1. Immediately rebuild images without the embedded secrets
2. Rotate all compromised secrets
3. Use runtime environment variables or secrets mounts instead of build-time values
4. Use Docker secrets or Kubernetes secrets for sensitive data

**Prevention Strategy:**
Never use `COPY .env` in Dockerfiles. Use multi-stage builds that exclude secrets from the final image.

---

### AP-030: Missing Rollback Plan

**Severity:** HIGH
**Category:** SK-012 (DevOps & Deployment)

Deploying without a tested rollback procedure. When a deployment fails or introduces a critical bug, there is no quick way to restore the previous working version.

**Detection Heuristics:**
- Deployment scripts without rollback commands
- Database migrations without down paths
- No previous version retention in deployment artifacts

**Correction Procedure:**
1. Retain at least the previous 2 versions of the deployment artifact
2. Document and test rollback procedures
3. Implement blue-green or canary deployments
4. Use feature flags to disable problematic features without full rollback

**Prevention Strategy:**
Require a rollback plan as part of every deployment checklist. Test rollbacks quarterly.

---

## AGENT BEHAVIOR

### AP-031: Overconfidence Without Verification

**Severity:** HIGH
**Category:** SK-004 (Code Verification)

The agent claims a task is complete without running verification steps. This leads to broken code being committed, build failures, and regressions that are discovered later by other developers or users.

**Detection Heuristics:**
- Task completion claims without preceding compile/lint/test output
- Code changes followed immediately by "done" without verification logs

**Correction Procedure:**
1. Run the full verification suite before declaring completion
2. Fix any issues found during verification
3. Include verification results in the completion report

**Prevention Strategy:**
Make verification a mandatory step in the agent workflow. Block task completion until verification passes.

---

### AP-032: Hallucinating Dependencies

**Severity:** HIGH
**Category:** SK-002 (Dependency Management)

The agent suggests or installs npm packages that don't exist or have different names. This wastes time, confuses developers, and can introduce security risks if a similarly-named malicious package exists.

**Detection Heuristics:**
- `npm install` commands for packages not found in the npm registry
- Package names that look similar to real packages but differ in spelling

**Correction Procedure:**
1. Verify the package exists on npmjs.com before installing
2. If the package doesn't exist, search for the correct name
3. If no package meets the need, implement the functionality directly

**Prevention Strategy:**
Always verify package existence before installation. Use `npm view <package>` to check.

---

### AP-033: Infinite Loop Generation

**Severity:** HIGH
**Category:** SK-003 (Error Prevention)

The agent generates code with infinite loops or unbounded recursion, typically from `while(true)`, recursive calls without base cases, or state updates triggering re-renders that trigger more state updates.

**Detection Heuristics:**
- `while (true)` without break condition
- Recursive functions without base cases or with unreachable base cases
- `useEffect` with missing dependencies creating render loops

**Correction Procedure:**
1. Add termination conditions to all loops
2. Ensure recursive functions have reachable base cases
3. Fix React effect dependency arrays to prevent re-render loops

**Prevention Strategy:**
Use ESLint rules to flag potentially infinite loops. Require explicit termination conditions.

---

### AP-034: Copy-Paste Anti-Pattern

**Severity:** MEDIUM
**Category:** SK-005 (Component Architecture)

Duplicating code blocks across multiple files instead of extracting shared logic into reusable functions, hooks, or components. This makes maintenance a nightmare — a bug fix must be applied in every copy.

**Detection Heuristics:**
- Code clones detected by static analysis tools (jscpd, sonarqube)
- Similar functions with minor differences across multiple files
- Multiple components with identical logic blocks

**Correction Procedure:**
1. Identify the duplicated code
2. Extract the shared logic into a utility function, custom hook, or shared component
3. Parameterize the differences between the copies
4. Replace all copies with calls to the shared implementation

**Prevention Strategy:**
Run jscpd or similar clone detection tool as part of CI. Review duplicated code during code review.

---

### AP-035: Ignoring TypeScript Errors

**Severity:** HIGH
**Category:** SK-003 (Error Prevention)

The agent uses type assertions (`as any`, `as Type`, `!`) to silence TypeScript errors instead of fixing the underlying type issue. This hides real bugs and makes the type system unreliable.

**Detection Heuristics:**
- High frequency of `as` keyword usage
- Non-null assertions (`!`) on potentially undefined values
- `@ts-ignore` or `@ts-expect-error` comments

**Correction Procedure:**
1. Remove the type assertion
2. Fix the underlying type issue (correct the type definition, add proper narrowing, handle the nullable case)
3. If the assertion is truly necessary, add a comment explaining why and what invariant it relies on

**Prevention Strategy:**
Enable `strict` mode in tsconfig. Limit `as` assertions with ESLint rules.

```typescript
// BAD — Type assertion hiding a bug
const user = data as User;
console.log(user.name.toUpperCase()); // Runtime crash if data is null

// GOOD — Proper type narrowing
const user = parseUser(data);
if (!user) {
  throw new Error('Failed to parse user data');
}
console.log(user.name.toUpperCase());
```

---

## Summary Table

| ID | Name | Severity | Category |
|----|------|----------|----------|
| AP-001 | Silent File Deletion | CRITICAL | SK-001 |
| AP-002 | Write Without Path Verification | HIGH | SK-001 |
| AP-003 | Modification Without Backup | HIGH | SK-001 |
| AP-004 | Scope Violation | CRITICAL | SK-001 |
| AP-005 | Unrestricted `any` Type | HIGH | SK-003 |
| AP-006 | Empty Catch Blocks | HIGH | SK-003 |
| AP-007 | Missing Input Validation | CRITICAL | SK-003 |
| AP-008 | Skipping Verification | MEDIUM | SK-004 |
| AP-009 | God Component | HIGH | SK-005 |
| AP-010 | Prop Drilling | MEDIUM | SK-005 |
| AP-011 | Mutable State Updates | HIGH | SK-007 |
| AP-012 | Global State Overuse | MEDIUM | SK-007 |
| AP-013 | Missing API Validation | CRITICAL | SK-006 |
| AP-014 | Inconsistent Error Responses | MEDIUM | SK-006 |
| AP-015 | Missing API Versioning | MEDIUM | SK-006 |
| AP-016 | Testing Implementation Details | MEDIUM | SK-008 |
| AP-017 | Over-Mocking | MEDIUM | SK-008 |
| AP-018 | Untestable Code Design | HIGH | SK-008 |
| AP-019 | Unnecessary Re-renders | MEDIUM | SK-009 |
| AP-020 | Missing Code Splitting | MEDIUM | SK-009 |
| AP-021 | Premature Optimization | LOW | SK-009 |
| AP-022 | Hardcoded Secrets | CRITICAL | SK-010 |
| AP-023 | SQL Injection Vulnerability | CRITICAL | SK-010 |
| AP-024 | Missing Authentication Checks | CRITICAL | SK-010 |
| AP-025 | N+1 Query Problem | HIGH | SK-011 |
| AP-026 | Missing Database Indexes | HIGH | SK-011 |
| AP-027 | Irreversible Migrations | HIGH | SK-011 |
| AP-028 | No Health Checks | HIGH | SK-012 |
| AP-029 | Secrets in Docker Images | CRITICAL | SK-012 |
| AP-030 | Missing Rollback Plan | HIGH | SK-012 |
| AP-031 | Overconfidence Without Verification | HIGH | SK-004 |
| AP-032 | Hallucinating Dependencies | HIGH | SK-002 |
| AP-033 | Infinite Loop Generation | HIGH | SK-003 |
| AP-034 | Copy-Paste Anti-Pattern | MEDIUM | SK-005 |
| AP-035 | Ignoring TypeScript Errors | HIGH | SK-003 |

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Created** | 2025-01-10 |
| **Last Modified** | 2025-01-10 |
| **Author** | Deerflow Agent Framework — skill-system-creator |
| **Review Status** | Approved |
| **Next Review Date** | 2025-04-10 |
| **Related Documents** | `agent-skills.md`, `skill-registry.ts`, `master-rules.md` |
