---
name: Agent Rule Issue
about: Report an issue with rules for a specific AI agent
title: '[RULE] '
labels: 'rules'
assignees: ''
---

## Agent Information
- **AI Agent:** [Cursor / Claude Code / Windsurf / GitHub Copilot / OpenAI Codex / Other]
- **Agent Version:** [e.g., 0.45.x]

## Rule File
Which rule file is affected?
- [ ] `.cursorrules`
- [ ] `.windsurfrules`
- [ ] `CLAUDE.md`
- [ ] `.github/copilot-instructions.md`
- [ ] `.codex/instructions.md`
- [ ] `.cursor/rules/*.mdc`
- [ ] `core/rules/master-rules.md`

## Issue Description
What's wrong with the rule? Is it:
- Too strict (blocks valid code)?
- Too loose (allows bad patterns)?
- Conflicting with another rule?
- Not being followed by the agent?
- Causing an error or crash?

## Steps to Reproduce
1. Set up Deerflow in your project
2. Ask the agent to: [describe the prompt]
3. The agent: [describe what went wrong]

## Expected Rule Behavior
What should the rule enforce?

## Actual Behavior
What happened instead?

## Suggested Fix
How should the rule be changed?
