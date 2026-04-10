# Using Deerflow with Cursor

> **Agent:** Cursor  
> **Rule File:** `.cursorrules`  
> **Status:** Full Support ✅

---

## Overview

Cursor is an AI-powered code editor built on VS Code. Deerflow provides dedicated rules for Cursor through the `.cursorrules` file, which Cursor reads automatically when you open a project.

## Setup

### Step 1: Install Deerflow

```bash
git clone https://github.com/your-username/deerflow-agent-framework.git
cd deerflow-agent-framework
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

When prompted, select **Cursor** as your AI editor.

### Step 2: Verify Installation

```bash
# Confirm .cursorrules exists in your project root
ls -la .cursorrules
```

### Step 3: Open Your Project in Cursor

1. Open Cursor
2. File → Open Folder → Select your project
3. Cursor automatically loads `.cursorrules`

### Step 4: Verify Cursor Follows the Rules

Open the Cursor chat (Cmd/Ctrl + L) and ask:

```
What coding rules do you follow?
```

Cursor should respond with the Deerflow enforcement protocol, including:
- Identity as a Senior Full-Stack Engineer (15+ years)
- 15 absolute prohibitions
- 5-phase mandatory workflow
- Quality metrics and thresholds
- Testing requirements

## Daily Workflow

### Using Cursor Chat

When asking Cursor to implement features, it will automatically follow the Deerflow workflow:

```
Add a settings page with theme selection, notification preferences, and account management.
```

Cursor will:
1. Read your existing codebase structure
2. Identify relevant files and components
3. Design the settings page architecture
4. Create atomic implementation tasks
5. Write code with proper TypeScript types
6. Include tests for new functionality
7. Verify everything compiles and works

### Using Cursor Agent Mode

In agent mode (Cmd/Ctrl + Shift + L), Cursor has filesystem access. Deerflow adds important safety constraints:

- **Read before write:** Always reads files before modifying
- **Confirm before delete:** Never deletes without user approval
- **One file at a time:** Modifies files sequentially with verification
- **Atomic commits:** Makes small, focused changes

### Using Cursor Inline Generation

When Cursor suggests inline code completions, the `.cursorrules` file ensures:

- No `any` types in completions
- Proper error handling in generated code
- Consistent naming with project conventions
- JSDoc on exported functions and classes

## Cursor-Specific Rules

The `.cursorrules` file includes Cursor-specific directives:

### Multi-File Editing

Cursor can edit multiple files simultaneously. Deerflow constrains this:

```markdown
Multi-File Editing Rules:
1. Maximum 5 files per edit operation (configurable via ai.maxBatchEdits)
2. Verify each file individually after editing
3. Run type check after each batch of edits
4. If any file fails verification, stop and fix before continuing
```

### Agent Mode Constraints

In agent mode, Cursor has broader access. Deerflow adds:

```markdown
Agent Mode Rules:
1. NEVER delete directories without explicit user confirmation
2. NEVER run shell commands that modify the system
3. ALWAYS show the user what files will be affected before making changes
4. ALWAYS run verification (compile + lint) after every set of changes
5. NEVER modify files outside the project directory
```

### Code Generation Quality

For all code generation (chat, agent, inline):

```markdown
Generated Code Standards:
1. TypeScript strict mode — ALWAYS
2. No `any` types — use proper types
3. Functions: max 50 lines
4. Files: max 300 lines
5. Components: max 200 lines
6. SOLID principles — no exceptions
7. Proper error handling — never silent
8. No console.log, debugger, or commented code
```

## MCP Server Integration

For real-time enforcement, configure MCP servers in Cursor:

1. Open Cursor Settings → MCP
2. Add the Deerflow MCP server configuration from `mcp-tools/config.json`
3. Restart Cursor

```json
{
  "mcpServers": {
    "deerflow-enforcer": {
      "command": "npx",
      "args": ["-y", "deerflow-mcp-server"]
    },
    "deerflow-linter": {
      "command": "npx",
      "args": ["-y", "deerflow-mcp-linter"]
    }
  }
}
```

## Common Scenarios

### Scenario: Cursor Suggests a Quick Fix

```
Cursor: I can fix this by adding @ts-ignore and moving on.

You: The rules forbid @ts-ignore. Please fix the underlying type issue instead.
```

### Scenario: Cursor Creates a Component Without Tests

```
Cursor: Here's the new UserProfile component.

You: The rules require tests for all new code. Please write tests following the templates in test-templates.ts.
```

### Scenario: Cursor Wants to Delete a Directory

```
Cursor: I'll delete the old components directory and create a new one.

You: Stop. Please list the files in that directory first, explain why each needs to be deleted, and wait for my confirmation.
```

### Scenario: Cursor Uses `console.log` for Debugging

```
Cursor: I've added console.log statements to trace the issue.

You: Remove all console.log statements. Use structured logging (winston/pino) or proper error handling instead.
```

## Tips for Effective Cursor + Deerflow

1. **Use Cmd+I for inline edits** — Inline edits are smaller and easier to verify
2. **Use Agent mode for complex tasks** — But review each step Cursor proposes
3. **Reference the rules explicitly** — "Follow .cursorrules for this implementation"
4. **Ask Cursor to explain its plan** — "Before coding, explain your approach"
5. **Review the file list before agent edits** — "What files will you modify?"
6. **Request verification** — "Run the tests and show me the results"
7. **Use the Phase approach** — "Start with Phase 0 (read everything)"

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + L` | Open Cursor Chat |
| `Cmd/Ctrl + Shift + L` | Agent Mode |
| `Cmd/Ctrl + I` | Inline Edit |
| `Cmd/Ctrl + K` | Generate Code |
| `Tab` | Accept Suggestion |

## Troubleshooting

### Cursor Doesn't Recognize `.cursorrules`

1. Check the file is named exactly `.cursorrules` (not `.cursor-rules` or `.cursor_rules`)
2. Check the file is in the project root directory
3. Reopen the project in Cursor
4. Clear Cursor cache and restart

### Cursor Ignores Rules in Agent Mode

1. Ask Cursor explicitly: "Please follow the rules in .cursorrules"
2. Restart the agent session
3. Be more specific in your instructions
4. Reference specific rules: "The rules say max 300 lines per file — please split this"

### Cursor Agent Makes Unexpected Changes

1. Use `.cursorignore` to protect sensitive files
2. Ask Cursor to show its plan before executing
3. Use git to review changes after each agent session
4. Set `ai.maxBatchEdits` to 1 for maximum control
