# Task Decomposition for AI Agents

> **Document Version:** 1.0
> **Last Updated:** 2025-01-10
> **Owner:** Deerflow Agent Framework — Core Workflow Team
> **Related:** [Agentic Workflow System](./agentic-workflow.md) | [Workflow Engine](./workflow-engine.ts)

---

## 1. Introduction

Task decomposition is the process of breaking a complex user request into small, atomic, and independently verifiable units of work. For AI agents, this skill is **essential** because agents operate within finite context windows, have limited working memory across session boundaries, and cannot reliably handle large-scale changes in a single pass.

This document defines the Deerflow methodology for task decomposition, including complexity scoring algorithms, dependency management, execution strategies, and token budget allocation. Every agent operating within the Deerflow framework MUST follow these guidelines when planning and executing work.

---

## 2. Task Complexity Scoring Algorithm

Every task must be assigned a complexity score before execution. The complexity score determines the execution strategy (sequential, parallel, or sub-agent delegation), the amount of context budget allocated, and the verification rigor required.

### 2.1 Scoring Dimensions

The complexity score is computed across six dimensions, each contributing a weighted portion of the total score (0–100):

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Scope** | 25% | Number of files, modules, or components affected |
| **Novelty** | 20% | How much new code must be written vs. modifying existing code |
| **Coupling** | 20% | Number of dependencies and consumers affected |
| **Risk** | 15% | Likelihood of breaking existing functionality |
| **Ambiguity** | 10% | How well-defined the requirements are |
| **Volume** | 10% | Estimated lines of code to be written or modified |

### 2.2 Scoring Formula

```
COMPLEXITY_SCORE =
  (scope_score × 0.25) +
  (novelty_score × 0.20) +
  (coupling_score × 0.20) +
  (risk_score × 0.15) +
  (ambiguity_score × 0.10) +
  (volume_score × 0.10)
```

Each dimension is scored individually from 0 to 100 using the rubrics below.

### 2.3 Dimension Rubrics

#### Scope Score

| Value | Criteria |
|-------|----------|
| 0–20 | Single file, single function modification |
| 21–40 | 2–3 files, localized changes |
| 41–60 | 4–7 files, changes span one module |
| 61–80 | 8–15 files, changes span multiple modules |
| 81–100 | 15+ files, cross-system changes |

#### Novelty Score

| Value | Criteria |
|-------|----------|
| 0–20 | Pure modification of existing code (bug fix, config change) |
| 21–40 | Small extension of existing pattern (add a field, add a prop) |
| 41–60 | New code following established patterns |
| 61–80 | New code requiring new patterns or abstractions |
| 81–100 | Ground-up implementation with no existing reference |

#### Coupling Score

| Value | Criteria |
|-------|----------|
| 0–20 | No dependencies on other modules; no consumers |
| 21–40 | 1–2 dependencies; 1–3 consumers |
| 41–60 | 3–5 dependencies; 4–8 consumers |
| 61–80 | 6–10 dependencies; 9+ consumers |
| 81–100 | Widely used shared module with 10+ consumers |

#### Risk Score

| Value | Criteria |
|-------|----------|
| 0–20 | No risk — change is isolated, easily revertible |
| 21–40 | Low risk — minimal chance of side effects |
| 41–60 | Medium risk — could affect nearby components |
| 61–80 | High risk — affects core functionality or shared state |
| 81–100 | Critical risk — affects authentication, payments, data integrity |

#### Ambiguity Score

| Value | Criteria |
|-------|----------|
| 0–20 | Crystal clear — every detail specified, examples provided |
| 21–40 | Mostly clear — main behavior defined, minor details open |
| 41–60 | Moderately defined — requirements need interpretation |
| 61–80 | Poorly defined — significant ambiguity in requirements |
| 81–100 | Extremely vague — needs clarification before proceeding |

#### Volume Score

| Value | Criteria |
|-------|----------|
| 0–20 | Under 20 lines changed |
| 21–40 | 20–50 lines changed |
| 41–60 | 50–150 lines changed |
| 61–80 | 150–400 lines changed |
| 81–100 | 400+ lines changed |

### 2.4 Complexity Levels

Based on the computed score, tasks are classified into five complexity levels:

| Level | Score Range | Strategy | Max Files Per Checkpoint | Verification |
|-------|-------------|----------|--------------------------|-------------|
| **TRIVIAL** | 0–10 | Execute immediately | 1 | Basic compilation |
| **LOW** | 11–25 | Sequential, standard workflow | 2 | Compilation + unit tests |
| **MEDIUM** | 26–45 | Sequential with checkpoints | 3 | Full verification gate |
| **HIGH** | 46–65 | Decompose into sub-tasks | 3 per sub-task | Full gate + integration |
| **CRITICAL** | 66–100 | Must decompose; consider sub-agent | 2 per sub-task | Full gate + E2E + security |

---

## 3. When to Use Sub-Agents vs. Sequential Processing

### 3.1 Decision Matrix

Use the following decision matrix to determine the execution strategy:

| Condition | Strategy |
|-----------|----------|
| Single task, TRIVIAL or LOW complexity | Execute immediately in current context |
| Single task, MEDIUM complexity | Execute with checkpoints every 3 files |
| Single task, HIGH complexity | Decompose into 3–5 sub-tasks, execute sequentially |
| Single task, CRITICAL complexity | Decompose into sub-tasks; use sub-agents for independent sub-tasks |
| Multiple independent tasks | Parallel execution via sub-agents |
| Multiple dependent tasks | Sequential execution following dependency order |
| Task requires specialized knowledge (e.g., database migration) | Delegate to specialized sub-agent |

### 3.2 Sub-Agent Delegation Criteria

A sub-agent should be spawned when ALL of the following are true:

1. **Independence:** The sub-task has minimal coupling with other sub-tasks (fewer than 3 shared interfaces)
2. **Complexity:** The sub-task scores MEDIUM or higher on the complexity scale
3. **Context Isolation:** The sub-task can be fully described in a self-contained prompt (under 2000 words)
4. **Interface Clarity:** The inputs and outputs of the sub-task are well-defined (explicit type contracts exist)
5. **Verification Independence:** The sub-task can be verified independently without requiring the results of other sub-tasks

### 3.3 Sequential Processing Criteria

Use sequential processing when ANY of the following are true:

1. The tasks have hard dependencies (task B requires the output of task A)
2. The tasks modify overlapping files or modules
3. The tasks share mutable state or database resources
4. The complexity is too low to justify the overhead of sub-agent coordination
5. The context window is sufficient to handle all tasks in a single session

### 3.4 Sub-Agent Communication Protocol

When using sub-agents, follow this communication protocol:

```
1. MAIN AGENT creates a Task Brief:
   - Objective: What the sub-agent must accomplish
   - Context: Relevant file paths, interfaces, and patterns
   - Constraints: What the sub-agent must NOT change
   - Inputs: Type definitions and data the sub-agent will need
   - Expected Outputs: Files to create/modify, types to export
   - Verification Criteria: How to confirm the sub-task is complete
   - Token Budget: Maximum context to consume

2. SUB-AGENT executes the task brief:
   - Follows the standard 8-phase workflow
   - Produces the expected outputs
   - Runs local verification

3. MAIN AGENT integrates the results:
   - Reviews the sub-agent's output
   - Verifies interface compatibility
   - Runs integration tests
   - Resolves any conflicts
```

---

## 4. Task Dependency Management

### 4.1 Dependency Types

Tasks can have the following dependency relationships:

| Type | Symbol | Description |
|------|--------|-------------|
| **Hard Dependency** | `A → B` | Task B cannot start until Task A is complete |
| **Soft Dependency** | `A ⇢ B` | Task B should start after A, but can proceed with incomplete A (using mocks) |
| **Ordering Dependency** | `A ≻ B` | Tasks are independent but must be done in order for consistency |
| **Mutual Exclusion** | `A ⊥ B` | Tasks must NOT run simultaneously (e.g., both modify the same file) |

### 4.2 Dependency Graph Rules

1. **No cycles:** The dependency graph must be a Directed Acyclic Graph (DAG). If a cycle is detected, break it by extracting the shared dependency into a separate task.
2. **Minimize hard dependencies:** Prefer soft dependencies where possible to enable parallel execution.
3. **Explicit declaration:** Every dependency must be explicitly declared in the task definition. Implicit dependencies are prohibited.
4. **Transitive reduction:** Only declare direct dependencies. Do not declare transitive dependencies (if A → B and B → C, do NOT declare A → C).

### 4.3 Dependency Resolution Order

Tasks are executed in topological order. Within the same topological level, tasks are ordered by:

1. **Complexity (descending):** High-risk tasks first (fail fast)
2. **Dependency count (ascending):** Tasks with fewer dependencies first (fewer blockers)
3. **Strategic priority:** Foundation tasks (types, utilities) before feature tasks

### 4.4 Conflict Detection

Before executing tasks in parallel, check for conflicts:

- **File conflicts:** Two tasks modifying the same file → must be sequential
- **Interface conflicts:** Two tasks modifying the same exported interface → must be sequential
- **Dependency conflicts:** Two tasks installing different versions of the same package → must resolve before execution
- **State conflicts:** Two tasks modifying the same database table or shared state → must be sequential or use transactions

---

## 5. Parallel Execution Strategies

### 5.1 Parallelism Levels

| Level | Description | Example |
|-------|-------------|---------|
| **File-level parallelism** | Multiple independent files created simultaneously | Creating types, constants, and utilities at the same time |
| **Feature-level parallelism** | Independent features developed concurrently | Login page and registration page developed in parallel |
| **Layer-level parallelism** | Different layers of the stack developed concurrently | Backend API and frontend components developed in parallel |
| **Test-level parallelism** | Multiple test suites run concurrently | Unit tests, integration tests, and E2E tests run in parallel |

### 5.2 Parallel Execution Rules

1. **Maximum parallelism:** Never exceed 3 concurrent sub-tasks. Coordination overhead grows non-linearly.
2. **Shared interface first:** Before parallel execution, ensure all shared interfaces are defined and committed.
3. **Staging branches:** Each parallel sub-task should ideally work on a separate branch to avoid merge conflicts.
4. **Synchronization points:** Define explicit synchronization points where all parallel tasks must converge for integration verification.

### 5.3 Parallel Execution Template

```
PHASE: PARALLEL EXECUTION

Step 1: Define shared interfaces
  - Create all shared types and interfaces
  - Commit as "feat: shared interfaces for [feature]"

Step 2: Create branch for each sub-task
  - Branch A: feat/[feature]-subtask-a
  - Branch B: feat/[feature]-subtask-b
  - Branch C: feat/[feature]-subtask-c

Step 3: Execute sub-tasks in parallel
  - Sub-agent A works on Branch A
  - Sub-agent B works on Branch B
  - Sub-agent C works on Branch C

Step 4: Synchronization point
  - Merge all branches to main/develop
  - Resolve any merge conflicts
  - Run full test suite

Step 5: Integration verification
  - Run cross-component tests
  - Verify end-to-end flows
  - Fix any integration issues
```

---

## 6. Token Budget Allocation Per Task

### 6.1 Budget Allocation Model

The agent's total context budget is limited (typically 128K–200K tokens for modern models). This budget must be allocated carefully to avoid running out of context mid-task.

**Total Budget Formula:**

```
TOTAL_BUDGET = MODEL_CONTEXT_LIMIT - RESERVED_BUDGET

where:
  MODEL_CONTEXT_LIMIT = context window size of the model
  RESERVED_BUDGET = 20% of limit (reserved for system prompt, tool results, and emergency)
```

**Per-Task Budget Formula:**

```
TASK_BUDGET = TOTAL_BUDGET × (TASK_COMPLEXITY_WEIGHT / TOTAL_WEIGHT)

where:
  TASK_COMPLEXITY_WEIGHT = complexity_score of the task
  TOTAL_WEIGHT = sum of complexity scores for all remaining tasks
```

### 6.2 Budget Allocation by Phase

| Phase | Budget % | Notes |
|-------|----------|-------|
| Phase 0: Context Acquisition | 15–25% | Read files, map structure |
| Phase 1: Requirements | 10–15% | Write specs and acceptance criteria |
| Phase 2: Architecture | 10–15% | Design components and interfaces |
| Phase 3: Planning | 5–10% | Task decomposition and ordering |
| Phase 4: Implementation | 35–45% | Code writing (largest phase) |
| Phase 5: Verification | 10–15% | Test and lint output |
| Phase 6: Integration | 5–8% | Cross-component checks |
| Phase 7: Documentation | 3–5% | Update docs and changelog |

### 6.3 Context Optimization Techniques

To maximize the effective use of the context window:

1. **Lazy reading:** Read files only when needed, not all at once. Use `grep` and `glob` to locate relevant code before reading.
2. **Summarize, don't re-read:** After reading a file, create a brief summary (exports, key logic, dependencies). Reference the summary instead of re-reading.
3. **Compact imports:** When reading a file for understanding, skip long import blocks — focus on the logic.
4. **Batch tool calls:** When multiple independent reads are needed, issue them in parallel.
5. **Truncate verbose output:** When running commands, use flags to limit output (e.g., `--quiet`, `--no-color`).
6. **Write state to files:** When approaching 80% context usage, write the current state (decisions, progress, next steps) to a markdown file. This creates a durable checkpoint.
7. **Avoid re-reading test output:** If tests pass, record the result. Don't re-read the full test output in subsequent turns.

### 6.4 Context Exhaustion Recovery

If the agent detects it is running out of context:

1. **STOP immediately** — do not continue coding
2. **Save state:** Write a detailed checkpoint file containing:
   - Current phase and progress
   - Decisions made so far
   - Files created/modified and their current state
   - Remaining tasks
   - Any issues or blockers
3. **Summarize:** Create a brief summary for the next session
4. **Exit cleanly:** Provide a clear handoff message for the next session

---

## 7. Priority Queuing System

### 7.1 Priority Levels

Tasks are assigned priority levels that determine execution order when resources are limited:

| Priority | Label | Criteria | Execution Policy |
|----------|-------|----------|-----------------|
| P0 | **BLOCKER** | System is broken; no workaround exists | Execute immediately; block all other work |
| P1 | **CRITICAL** | Core feature broken; major impact on users | Execute in current session; preempt other tasks |
| P2 | **HIGH** | Important feature or significant bug | Schedule in current session; execute before P3/P4 |
| P3 | **MEDIUM** | Moderate bug or improvement | Schedule when resources available |
| P4 | **LOW** | Minor bug, cosmetic issue, or nice-to-have | Defer to next session if budget is limited |

### 7.2 Priority Assignment Rules

- **Bug fixes:** Start at P2. Escalate to P1 if the bug affects core user flows or data integrity. Escalate to P0 if the system is completely broken.
- **New features:** Start at P3. Escalate to P2 if the feature is a direct user request. Escalate to P1 if the feature is a release blocker.
- **Refactoring:** Start at P4. Escalate to P3 if the refactoring resolves a significant code smell or tech debt item.
- **Security fixes:** Start at P1. Escalate to P0 if the vulnerability is actively exploitable.

### 7.3 Priority Queue Processing

When multiple tasks are queued, process them in the following order:

1. **P0 BLOCKER:** Drop everything and handle immediately
2. **P1 CRITICAL:** Handle in the current session, before any new work
3. **P2 HIGH:** Handle after current task is complete
4. **P3 MEDIUM:** Handle if context budget allows
5. **P4 LOW:** Handle only if all higher-priority tasks are complete and budget remains

### 7.4 Priority Preemption

A higher-priority task may preempt a lower-priority task under the following conditions:

- **P0 can preempt anything:** If a blocker is discovered, stop current work immediately
- **P1 can preempt P3/P4:** If a critical issue is discovered, pause medium/low work
- **P2 can preempt P4:** If a high-priority item is discovered, defer low-priority work

**Preemption rules:**
1. Save current state (checkpoint)
2. Document what was being done and how far along
3. Switch to the higher-priority task
4. After completing the high-priority task, resume the preempted task

---

## 8. Task Size Guidelines

### 8.1 Ideal Task Size

Tasks should be small enough to be completed and verified in a single agent action (one file creation or modification with verification). The following guidelines define ideal task sizes:

| Metric | Ideal Range | Maximum |
|--------|------------|---------|
| Files affected | 1–2 | 3 |
| Lines changed | 10–50 | 150 |
| Functions added/modified | 1–3 | 5 |
| Dependencies introduced | 0–1 | 2 |
| Time to verify | < 30 seconds | < 2 minutes |

### 8.2 When a Task Is Too Large

Decompose a task if ANY of the following are true:

- It requires modifying more than 3 files
- It adds more than 150 lines of code
- It touches more than one architectural layer (e.g., both database schema AND UI)
- It introduces more than 2 new dependencies
- It cannot be verified independently of other tasks
- Its complexity score exceeds MEDIUM (26+)

### 8.3 When a Task Is Too Small

Do NOT create a separate task if:

- It is a single-line change (e.g., fix a typo)
- It is a configuration value change
- It can be combined with another task without increasing complexity
- Creating the task overhead exceeds the implementation effort

### 8.4 Task Granularity Examples

```
TOO LARGE (decompose):
  "Implement the entire user authentication system including JWT,
   login page, registration page, password reset, and admin panel"

CORRECT SIZE:
  TASK-001: Create authentication types and interfaces (TRIVIAL)
  TASK-002: Implement JWT token generation and validation service (MEDIUM)
  TASK-003: Create login API endpoint with validation (MEDIUM)
  TASK-004: Create login page component with form handling (MEDIUM)
  TASK-005: Write tests for authentication service (MEDIUM)
  TASK-006: Create registration API endpoint (MEDIUM)
  TASK-007: Create registration page component (MEDIUM)
  TASK-008: Implement password reset flow (HIGH)
  TASK-009: Add authentication middleware to protected routes (LOW)
  TASK-010: Integration testing for complete auth flow (MEDIUM)
```

---

## 9. Decomposition Anti-Patterns

### 9.1 Over-Decomposition

Splitting tasks into pieces that are too small creates coordination overhead that exceeds the value. Signs of over-decomposition:
- Tasks that take under 30 seconds to implement
- Tasks with no meaningful verification criteria
- More time spent managing tasks than doing work

**Fix:** Merge related micro-tasks into a single cohesive task.

### 9.2 Under-Decomposition

Failing to decompose a complex task leads to errors and context exhaustion. Signs of under-decomposition:
- Tasks that modify more than 5 files
- Tasks that take more than 10 minutes to complete
- Tasks that cannot be verified incrementally

**Fix:** Apply the complexity scoring algorithm and decompose until each sub-task scores MEDIUM or lower.

### 9.3 Hidden Dependencies

Declaring tasks as independent when they actually share dependencies or modify overlapping code. Signs:
- Integration failures after "independent" tasks are completed
- Merge conflicts during parallel execution
- Interface mismatches between "decoupled" modules

**Fix:** Review the dependency graph before execution. Check for file overlaps and shared interfaces.

### 9.4 Top-Down Only Decomposition

Decomposing from the top down without considering bottom-up constraints (e.g., shared utility needs). Signs:
- Tasks creating duplicate utility functions
- Inconsistent patterns across sub-tasks
- Missing shared types that multiple tasks need

**Fix:** After top-down decomposition, do a bottom-up pass to identify shared utilities and create them first.

---

## 10. Summary: The Decomposition Checklist

Before executing any task, verify:

- [ ] The task has a unique identifier (TASK-NNN)
- [ ] The task has a clear, atomic objective
- [ ] The complexity score has been computed
- [ ] The task dependencies have been declared
- [ ] The task fits within the token budget
- [ ] Verification criteria are defined
- [ ] The task's priority is assigned
- [ ] A rollback strategy is documented
- [ ] The task is the right size (not too large, not too small)
- [ ] The execution strategy is chosen (sequential, parallel, or sub-agent)

**Remember:** Well-decomposed tasks are the foundation of reliable agent behavior. The time invested in decomposition pays dividends in reduced errors, faster execution, and more predictable outcomes.

---

*This document is part of the Deerflow Agent Framework workflow system. It should be used in conjunction with [agentic-workflow.md](./agentic-workflow.md) and [workflow-engine.ts](./workflow-engine.ts).*
