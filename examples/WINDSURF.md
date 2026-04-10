# Using Deerflow with Windsurf

> **Agent:** Windsurf (Cascade)  
> **Rule File:** `.windsurfrules`  
> **Status:** Full Support ✅

---

## Overview

Windsurf is an AI-powered IDE with Cascade, its agentic coding system. Deerflow provides dedicated rules for Windsurf through the `.windsurfrules` file, which integrates with Cascade's flow system to enforce quality at every step.

## Setup

### Step 1: Install Deerflow

```bash
git clone https://github.com/your-username/deerflow-agent-framework.git
cd deerflow-agent-framework
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

When prompted, select **Windsurf** as your AI editor.

### Step 2: Verify Installation

```bash
# Confirm .windsurfrules exists in your project root
ls -la .windsurfrules
```

### Step 3: Open Your Project in Windsurf

1. Open Windsurf
2. File → Open Folder → Select your project
3. Windsurf automatically loads `.windsurfrules`

### Step 4: Verify Cascade Follows the Rules

Start a Cascade session and ask:

```
What coding standards do you follow?
```

Cascade should respond with the Deerflow enforcement protocol.

## Cascade-Specific Features

The `.windsurfrules` file includes Windsurf Cascade-specific directives that integrate with Cascade's flow system.

### Cascade Flow Rules

Cascade operates in a flow-based model where it reads files, plans changes, and executes them. Deerflow adds constraints to each flow step:

```markdown
Cascade Flow Rules:
1. READ Phase: Must read ALL files in affected directories before planning
2. PLAN Phase: Must create a structured plan with atomic tasks
3. CODE Phase: Must implement one file at a time with verification
4. VERIFY Phase: Must run compile + lint + tests after every 3-5 changes
5. DOCUMENT Phase: Must update JSDoc, CHANGELOG, and relevant docs
```

### Context Management

Cascade can maintain context across multiple turns. Deerflow ensures context quality:

```markdown
Context Management Rules:
1. At the start of every session, re-read the project structure
2. When context becomes long (>50% of window), summarize previous decisions
3. Never lose track of the current phase in the workflow
4. Always maintain a checklist of completed and pending tasks
5. When resuming a session, recap the current state and next steps
```

### Cascade Phase Enforcement

Deerflow maps directly to Cascade's phase model:

| Cascade Phase | Deerflow Phase | Quality Gate |
|---------------|---------------|-------------|
| Read/Understand | Phase 0: Context Acquisition | Gate 0→1 |
| Plan | Phase 1-3: Requirements + Architecture + Planning | Gate 2→3 |
| Code | Phase 4: Implementation | Gate 4→5 |
| Test/Verify | Phase 5-6: Verification + Integration | Gate 6→7 |
| Document | Phase 7: Documentation | Complete |

## Daily Workflow

### Starting a New Feature with Cascade

```
I want to add a notification system with real-time updates, email notifications, and in-app notification center.
```

Cascade will follow the Deerflow workflow:

1. **Read Phase:**
   - Reads project structure
   - Identifies existing notification patterns
   - Understands current architecture

2. **Plan Phase:**
   - Defines requirements (FR-001 through FR-N)
   - Designs notification architecture
   - Creates implementation task list
   - Presents plan for review

3. **Code Phase:**
   - Implements one file at a time
   - Verifies each file before proceeding
   - Runs compile + lint after every 2-3 files

4. **Test Phase:**
   - Writes tests for all new code
   - Runs full test suite
   - Verifies coverage ≥ 80%

5. **Document Phase:**
   - Updates JSDoc on public APIs
   - Updates CHANGELOG
   - Updates relevant documentation

### Multi-Turn Cascade Sessions

Deerflow's context management rules help Cascade handle long sessions:

```
[Turn 1] Build the user authentication API endpoints.

[Turn 2] Now add the frontend login form and connect it to the API.

[Turn 3] Add password reset functionality.

[Turn 4] The tests are failing after the password reset changes. Fix them.
```

Between turns, Cascade will:
- Recap what was completed in previous turns
- Verify the current state of the codebase
- Plan the next set of changes
- Maintain the overall workflow progress

## Windsurf-Specific Rules

### File Operation Safety

```markdown
File Operations in Cascade:
1. ALWAYS use the READ tool before any WRITE tool
2. NEVER use DELETE without showing the user a file list and getting confirmation
3. ALWAYS verify file paths exist before writing
4. NEVER modify files outside the project root
5. ALWAYS backup critical files before modification
```

### Terminal/Shell Rules

```markdown
Shell Command Rules:
1. NEVER run destructive commands (rm -rf, drop table, etc.) without confirmation
2. ALWAYS show the command before executing it
3. NEVER modify system files or global configurations
4. ALWAYS use non-destructive alternatives when possible (git checkout vs rm)
5. ALWAYS verify the command output before proceeding
```

### Error Handling in Cascade

```markdown
Error Handling Requirements:
1. When a tool returns an error, STOP and report it to the user
2. NEVER silently retry failed operations
3. ALWAYS explain what went wrong and propose a fix
4. NEVER continue the workflow if a verification step fails
5. ALWAYS ask the user before attempting risky recovery operations
```

## MCP Server Integration

Configure MCP servers in Windsurf for real-time enforcement:

1. Open Windsurf Settings → MCP Servers
2. Add Deerflow MCP servers from `mcp-tools/config.json`
3. Restart Windsurf

```json
{
  "mcpServers": {
    "deerflow-enforcer": {
      "command": "npx",
      "args": ["-y", "deerflow-mcp-server"]
    },
    "deerflow-architecture": {
      "command": "npx",
      "args": ["-y", "deerflow-mcp-arch"]
    },
    "deerflow-tester": {
      "command": "npx",
      "args": ["-y", "deerflow-mcp-tester"]
    }
  }
}
```

## Common Scenarios

### Scenario: Cascade Proposes Skipping Tests

```
Cascade: The feature is implemented. Should I move on to the next task?

You: No. The rules require tests for all new code with ≥80% coverage. Please write comprehensive tests before proceeding.
```

### Scenario: Cascade Hits a Type Error

```
Cascade: There's a type error. I'll add a type assertion to fix it.

You: Don't use type assertions. Fix the underlying type issue. Use proper type narrowing or define the correct interface.
```

### Scenario: Cascade Wants to Modify Multiple Files

```
Cascade: I need to update 8 files for this change. Let me proceed.

You: Please limit to 5 files per batch ( Deerflow rule). Make the first batch, verify everything works, then continue with the next batch.
```

### Scenario: Cascade Session Gets Long

```
Cascade: [After 30+ turns] Let me continue with the implementation...

You: Before continuing, please provide a summary of what's been completed and what remains. The context is getting long.
```

## Tips for Effective Windsurf + Deerflow

1. **Start each session with context** — "Read the project structure and understand the current state"
2. **Use Cascade's plan review** — Review and approve the plan before implementation
3. **Request checkpoints** — "Stop and verify after every 3 files"
4. **Monitor the workflow** — "Which phase are we in? What's the status?"
5. **Use Cascade's flow visualization** — Keep an eye on Cascade's progress display
6. **Break large tasks into sessions** — Use the workflow's checkpoint/rollback features

## Troubleshooting

### Windsurf Doesn't Load `.windsurfrules`

1. Verify the file name is exactly `.windsurfrules`
2. Check the file is in the project root
3. Reopen the project in Windsurf
4. Restart Windsurf

### Cascade Skips Workflow Phases

1. Explicitly request the workflow: "Follow the Deerflow 8-phase workflow"
2. Ask for the plan: "Show me your plan before implementing"
3. Request phase-by-phase progression: "Complete Phase 0 first, then show me before moving to Phase 1"

### Cascade Makes Unauthorized File Changes

1. Review the file change list before approving
2. Ask Cascade to explain each change
3. Use git to review and revert unexpected changes
4. Be more specific in your instructions

### Cascade Session Loses Context

1. Ask for a summary: "Please summarize what's been completed and what remains"
2. Use checkpoint/rollback: "Save a checkpoint here in case we need to roll back"
3. Break the task into smaller sessions
4. Use the task decomposition guide for complex tasks
