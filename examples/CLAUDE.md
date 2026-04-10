# Using Deerflow with Claude Code

> **Agent:** Claude Code (Anthropic)  
> **Rule File:** `.clinerules`  
> **Status:** Full Support ✅

---

## Overview

Claude Code is Anthropic's CLI-based AI coding agent. Deerflow provides dedicated rules for Claude Code through the `.clinerules` file, which Claude reads at the start of every session.

## Setup

### Step 1: Install Deerflow

```bash
git clone https://github.com/your-username/deerflow-agent-framework.git
cd deerflow-agent-framework
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

When prompted, select **Claude Code** as your AI editor.

### Step 2: Verify Installation

```bash
# Confirm .clinerules exists in your project root
ls -la .clinerules

# Read the first few lines to verify
head -20 .clinerules
```

### Step 3: Start Claude Code

```bash
# Navigate to your project
cd /path/to/your/project

# Start Claude Code
claude
```

### Step 4: Verify Claude Follows the Rules

Once Claude Code starts, ask:

```
What rules do you follow when writing code?
```

Claude should respond with a summary of the Deerflow rules, including:
- 15 absolute prohibitions
- 5-phase mandatory workflow
- Quality metrics (300 line files, 50 line functions, etc.)
- Testing requirements (80% coverage)
- Security standards (OWASP Top 10)

## Daily Workflow

### Starting a New Feature

```
I want to add a user profile page with editable fields.
```

Claude will follow the 8-phase workflow:

1. **Phase 0 (Context Acquisition):** Claude reads existing files, components, and architecture
2. **Phase 1 (Requirements):** Claude asks clarifying questions and defines requirements
3. **Phase 2 (Architecture):** Claude designs the component structure and data flow
4. **Phase 3 (Planning):** Claude creates a task decomposition with atomic steps
5. **Phase 4 (Implementation):** Claude writes code, one file at a time
6. **Phase 5 (Testing):** Claude writes corresponding tests
7. **Phase 6 (Integration):** Claude verifies imports and cross-component integration
8. **Phase 7 (Documentation):** Claude updates JSDoc and CHANGELOG

### Making a Bug Fix

```
The login form throws an error when the email field is empty.
```

Claude will:
1. Read the relevant form component
2. Identify the root cause
3. Propose a fix
4. Write a test for the edge case
5. Verify the fix doesn't break other tests
6. Update documentation if needed

### Refactoring Code

```
Refactor the Dashboard component — it's getting too large (400+ lines).
```

Claude will:
1. Analyze the component's responsibilities
2. Identify separable concerns
3. Plan the decomposition
4. Extract sub-components and hooks
5. Verify all tests still pass
6. Verify no circular dependencies

## Claude Code-Specific Rules

The `.clinerules` file includes Claude Code-specific directives:

### Tool Usage Rules

Claude Code has access to shell commands and file operations. Deerflow adds safety constraints:

- **File Operations:** Always verify paths before reading/writing
- **Shell Commands:** Never run destructive commands without confirmation
- **File Deletion:** Always confirm before deleting any file
- **Project Scope:** Never modify files outside the project directory

### Response Quality Rules

- Always include file paths in responses
- Always explain what was changed and why
- Always run verification after making changes
- Always provide rollback instructions if changes are significant

### File Operation Rules

```markdown
When modifying files:
1. ALWAYS read the file first before making changes
2. ALWAYS show the complete file content, not just the changed section
3. ALWAYS verify the file compiles (run tsc) after changes
4. ALWAYS run relevant tests after changes
5. NEVER delete files without explicit user confirmation
```

## MCP Server Integration

For enhanced real-time enforcement, configure MCP servers in Claude Code:

```bash
# claude_desktop_config.json (or equivalent)
{
  "mcpServers": {
    "deerflow-enforcer": {
      "command": "npx",
      "args": ["-y", "deerflow-mcp-server"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

## Common Scenarios

### Scenario: Claude Proposes Using `any`

```
Claude: I'll use `any` here for the API response type since the shape is uncertain.

You: The rules forbid `any`. Use `unknown` and narrow with type guards, or define a proper interface.

Claude: You're right. Let me define a proper interface for the API response and use Zod for runtime validation.
```

### Scenario: Claude Skips Writing Tests

```
Claude: The utility function is now implemented. 

You: The rules require tests for all new code. Please write unit tests with at least 80% coverage.

Claude: I'll write comprehensive tests covering the happy path, edge cases, and error scenarios.
```

### Scenario: Claude Creates a Large File

```
Claude: I've added the complete user management module in a single file (350 lines).

You: Files must be under 300 lines. Please decompose this into separate modules following Clean Architecture.

Claude: I'll split this into: UserRepository, UserService, UserController, and UserTypes.
```

## Troubleshooting

### Claude Doesn't Follow the Rules

If Claude Code doesn't seem to follow Deerflow rules:

1. **Check the file exists:**
   ```bash
   ls -la .clinerules
   ```

2. **Check the file is in the project root:**
   ```bash
   # Should be at /path/to/project/.clinerules
   # NOT at /path/to/project/src/.clinerules
   ```

3. **Restart Claude Code** after copying the file

4. **Ask Claude directly:**
   ```
   Please read and follow the rules in .clinerules
   ```

### Claude Creates Too Many Files at Once

If Claude creates multiple files without verifying each one:

```
Please make changes one file at a time. After each file, verify it compiles and passes tests before moving to the next file.
```

## Tips for Effective Claude Code + Deerflow

1. **Be specific in your requests** — The more context you provide, the better Claude follows the rules
2. **Ask for the plan first** — "Before implementing, show me your plan" lets you review before changes
3. **Request verification** — "Show me the test results" keeps Claude accountable
4. **Use the workflow** — "Follow the Deerflow workflow phases" ensures structured approach
5. **Review Phase 2 output** — Architecture design is the most impactful phase to review
