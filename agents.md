# Agents & Skills

This document documents the custom agents, skills, and workflows available in this workspace.

## Skills

Skills provide specialized domain-specific instructions for particular tasks.

| Skill | Description | Location |
|-------|-------------|----------|
| `frontend-design` | Create distinctive, production-grade frontend interfaces with high design quality | [Symlink → Global](./.agents/skills/frontend-design/SKILL.md) |

### Using Skills

When a task matches a skill's domain, load it using:

```
/skill <skill-name>
```

For example, for frontend design tasks:

```
/skill frontend-design
```

---

## Rules

Workspace-specific rules that apply to all agent interactions.

| Rule | Description |
|------|-------------|
| `must-follow-rules` | Core workspace rules: use pnpm, update docs, prioritize performance and readability |

Location: [.agents/rules/must-follow-rules.md](./.agents/rules/must-follow-rules.md)

---

## Workflows

Workflows document architectural patterns and implementation guides for specific features.

| Workflow | Description |
|----------|-------------|
| `frontend-setup` | Bootstrap React + TS + Tailwind v4 + Shadcn/UI project |
| `listen-along-mobile` | Listen-along mobile fixes: host reload reconnection, disconnect handling, WebRTC patterns |

Location: [.agent/workflows/](./.agent/workflows/)