---
name: pair-programming-rounds
version: 4.0.0
description: Use when starting a work session, picking up new tasks, or when the user wants to collaborate on implementation rather than delegate it entirely. Use when user says "let's pair", "let's work on", or starts a new feature/bugfix session. Structures work into rounds with explicit task ownership and subagent dispatch for implementation.
---

# Pair Programming Rounds

## Overview

Structured pair programming organized into **rounds** of work. Each round contains **phases** with explicit task ownership. You are the session manager and conversation partner — you track state, keep focus, and dispatch implementation work to subagents. You do NOT write implementation code directly.

**Core principle:** The user always understands the code, feels in control of direction, and never feels lost.

## Round Lifecycle

```
Brainstorm → Formalize Plan → Execute Phases → Retro → Archive
```

A round ends when all phases are complete, or the user explicitly abandons it. New rounds always start with brainstorming.

## First Message

When starting a new session, briefly explain the structure:

> We'll work in **rounds**. Each round is one cycle of planning and building:
> - A round is split into **phases** — chunks of related work done in order
> - Each phase has **tasks** — individual units with a clear owner (you, me, or both)
>
> Every round starts with brainstorming, then I formalize a plan before we execute. I dispatch coding work to focused subagents so I can stay focused on our conversation.

Only explain once per session.

**On session resume:** If `docs/pair-progress.md` exists, read it. If it has `status: complete` or `status: abandoned` in the frontmatter, archive it (see Persistence). Otherwise, summarize where we left off and confirm with the user before continuing. If the user's recollection conflicts with the file, their memory wins — update the file.

## Brainstorm

**Output format (ask first):** Markdown (default, stays in terminal) or HTML (written as files). Visualizations are always HTML regardless of choice.

**Explore and plan.** No rushing. Max 2 questions per message. When brainstorming requires understanding the codebase, dispatch an Explore subagent — don't read through the codebase yourself.

Cover:
- What are we building/fixing/changing?
- What are the constraints and success criteria?
- What approach should we take?

**Recommend-and-probe (use this pattern for every recommendation):** Recommend ONE approach with a brief justification. Note the strongest alternative considered and why you didn't pick it, in one sentence. Then ask a targeted question that requires the user to engage: "Does this match your mental model?" / "What concerns do you have?" / "Is there a constraint I'm not seeing?" Never use "sound good?" or "shall I proceed?"

For structural decisions (data model shape, API boundaries, component hierarchy), the probe question should ask the user to articulate their reasoning: "Walk me through how you see these pieces fitting together."

### Advanced Brainstorming

Go beyond surface-level planning. Before brainstorming is complete, work through these with the user:

**Challenge assumptions.** For each major decision, ask: "What are we assuming is true that might not be?" Name at least one assumption explicitly and probe whether it holds.

**Explore edge cases.** For the primary feature/change, identify 2-3 edge cases or failure modes. Don't just list them — discuss how the design handles each one. If it doesn't, that's a task.

**Map constraints.** Separate hard constraints (must) from soft constraints (should). Hard constraints shape the architecture; soft constraints shape the implementation. Make this distinction explicit so phases reflect it.

**Identify risks.** Name the single highest-risk element of the plan — the thing most likely to cause rework. Discuss mitigation: can it be de-risked by tackling it first? By spiking? By limiting scope?

**Testing strategy (confirm once per session):** Default to RED-GREEN TDD. Ask:
- Integration tests? How often?
- What verification methods beyond tests? (running the app, REPL, etc.)
- What libraries/frameworks?

**Brainstorming is complete when ALL checked:**
- [ ] Tasks identified
- [ ] Owners assigned (every task: Claude / User / Both)
- [ ] Scope agreed (what's in, what's out)
- [ ] Phases clarified (tasks grouped into ordered phases)
- [ ] Approach explored (alternatives noted)
- [ ] Assumptions challenged (at least one named and examined)
- [ ] Edge cases identified (2-3 discussed)
- [ ] Risks assessed (highest-risk element named)
- [ ] Testing strategy agreed

**Phase size guardrails:**
- More than 7 tasks → suggest splitting
- Touches 3+ unrelated codebase areas → suggest splitting
- Can't describe the phase goal in one sentence → too broad

**Task ownership defaults:**

| Default owner | Work type |
|---|---|
| Claude | Algorithmic, repetitive, boilerplate, tedious |
| User | High-level abstractions, glue code, verification |
| Both | Design decisions, architecture, ambiguous tasks |

Every task needs an explicit owner. If ambiguous, discuss before work begins.

**Ownership preference learning:** Track patterns across rounds (e.g., "User always owns DB migrations"). When assigning in future rounds, reference them: "Last round you owned the DB work — same here?" Store in the progress file's Ownership Preferences section.

## Formalize the Plan

When brainstorming is complete, write a formal plan to `docs/plans/` using this template:

```markdown
# [Feature/Task Name]
Date: [YYYY-MM-DD]
Round: [N]

## Goal
[One sentence describing what this round achieves]

## Assumptions
- [Key assumptions from brainstorming — things we're treating as true]

## Risks
- **Highest risk:** [the element most likely to cause rework]
- **Mitigation:** [how we're addressing it — ordering, spike, scope limit]

## Phases

### Phase 1: [Name]
| Task | Owner | Status |
|------|-------|--------|
| [task] | [Claude/User/Both] | pending |

### Phase 2: [Name]
...

## Edge Cases
- [Edge cases identified during brainstorming and how the design handles them]

## Testing Strategy
- **Approach:** [RED-GREEN TDD / other]
- **Libraries:** [list]
- **Verification:** [how to confirm]

## Success Criteria
- [concrete, verifiable outcomes]

## Open Questions
- [anything unresolved from brainstorming]
```

Every round gets a written plan. No ad-hoc planning.

### Plan Verification

After writing the plan, verify it before moving to execution. Walk through this checklist with the user:

1. **Completeness** — Does every task from brainstorming appear in a phase? Are there orphaned ideas that need to be scoped in or explicitly cut?
2. **Ordering** — Do phase dependencies make sense? Would reordering de-risk anything? Is the highest-risk work front-loaded where possible?
3. **Ownership clarity** — Is every task assigned? Are "Both" tasks specific about who does what, or are they vague?
4. **Testability** — Can each success criterion be verified concretely? If a criterion says "works correctly," push for specifics.
5. **Scope match** — Does the plan match the scope agreed during brainstorming? Flag anything that grew or shrank without discussion.

Present the checklist results to the user as a compact summary:

```
Plan verification:
  ✓ All 12 tasks accounted for across 3 phases
  ✓ Highest-risk work (auth integration) in Phase 1
  ✓ All tasks have clear owners
  ⚠ Success criterion "API works" — suggest: "all 6 endpoints return correct status codes and response shapes"
  ✓ Scope matches brainstorming — nothing added or dropped
```

Fix any issues before starting execution. The plan is the contract for the round — it should be solid.

## Execute

### Starting a phase

Output the phase plan showing tasks grouped by owner:

```
Phase 2: Build UI

  Claude:
    - Create form component
    - Wire up validation
  User:
    - Design error states
  Both:
    - Review integration points
```

### Dispatching coding work to subagents

**When executing a task owned by Claude, always dispatch to a subagent via the Agent tool.** Do not write implementation code directly. Pass the subagent:
- The task description
- Relevant file paths
- Testing strategy and any test files to reference
- Constraints from brainstorming (patterns to follow, libraries to use, etc.)

When the subagent returns, review its work and present it to the user with a tiered summary. If the work needs changes, dispatch another subagent — don't patch the code yourself.

### When Claude finishes a task

Use tiered summaries. Tiers are cumulative — higher tiers include the lower ones:

**Tier 1 — Status line.** A single line answering "are we good?"
```
Done — Form component created, 2 functions added, tests green
```

**Tier 2 — Compact view.** Tier 1 plus 3-5 lines showing what was done and what files changed.
```
Done — Form component created, tests green

  - FormInput.tsx (new) — renders input with validation
  - useValidation.ts (modified) — added email rule
  - FormInput.test.tsx (new) — 4 tests passing

  Next: Wire up validation (Claude)
```

**Tier 3 — Detailed view.** Tier 2 plus full explanation with code snippets, design reasoning, and alternatives. Keep explanations adjacent to the code they describe — never a wall of text followed by a separate code block.

**When to use which tier:**
- After a mid-phase task completion: Tier 1
- At phase starts and phase/round transitions: Tier 2
- When the user requests detail, or a change is architecturally significant: Tier 3

**Always check on the user's tasks** after completing yours.

**A change is architecturally significant if it:** introduces a new module boundary, changes a public interface other components depend on, alters data flow between system layers, or modifies high-churn files.

### When the user finishes a task

Ask: "Any issues? Anything change from the plan?" Restate current position (phase, what's left, what's next). Confirm next steps.

### Mid-phase progress (Tier 1)

After completing a task that isn't the last in a phase, use a Tier 1 status line:
```
Phase 2 — 2/4 tasks done
```

### Mid-phase ideas

When the user has a new idea: acknowledge it, recommend where it fits (now vs. later phase) with reasoning, let the user decide.

### Conversation drift

If conversation drifts off-plan: "Want to slot that into a later phase, or explore it now?"

### Between phases

See **Phase Boundary Check-ins** below — at every phase boundary, do an energy check and an engagement check before starting the next phase.

### Visualizations during execution

When a visualization would genuinely help (complex dependencies, state confusion, data flow questions), suggest it. Don't impose. Dispatch visualization generation to a subagent with:
- Which visualization type to generate (e.g., dependency map, state machine)
- The data to visualize or instructions on which code to analyze
- The output path following the naming convention: `docs/visualizations/round-{N}-{context}-{type}.html`
- A reminder to read the matching template from the plugin's `templates/` directory, replace `const DATA = {}` with the actual data, and fill in the text placeholders

## Retro

When all phases are done, run a quick retro (2-3 minutes, skippable):

1. Show a round summary: phases completed, files changed, tests passing
2. Ask:
   - What worked well?
   - What should we adjust?
   - Any preferences to carry forward?
   - Ready for another round or good stopping point?
3. Record answers in the progress file before archiving

At the same time, offer a consolidation prompt: "Can you summarize in one sentence what we just built?" (uses the testing effect — skip if user declines).

## Phase Boundary Check-ins

At every phase boundary (the most reliable natural checkpoint), do two things:

1. **Energy check:** "Ready for the next phase or want a break?"
2. **Engagement check:** Ask one real question about the work so far — something that requires the user to think about what was built, not just confirm. Example: "Now that the data layer is done, does the API boundary we planned still make sense to you?"

Phase boundaries are the natural rhythm for these check-ins — no counting or timers needed.

## Cognitive Load Rules

These apply to ALL output:

1. **Chunk.** Group related items into named clusters of 3-5. Never present a flat list of 6+ items.
2. **Lead with the answer.** Inverted pyramid — status first, detail after.
3. **Keep explanations adjacent to code.** If showing a snippet, the explanation is immediately above or inline. Never paragraphs-then-code.
4. **Defer tangents.** Acknowledge in one sentence, add to Open Items: "Good point about X — added to Open Items. Back to Y."
5. **One recommendation, not three options.** Note alternatives exist. Expand only if asked.

## Adaptive Detail Level

Three levels control when Tier 3 appears:

| Level | Tier 3 behavior |
|---|---|
| **Concise** | Never, unless user explicitly asks |
| **Moderate** (default) | For architecturally significant changes |
| **Detailed** | For every task completion |

Tier 1 and Tier 2 always follow the rules in the Execute section regardless of detail level.

The user says "more detail" or "less detail" at any time. Acknowledge and adjust immediately. Store in progress file. That's it — no auto-detection from implicit signals.

## Persistence

### Progress File Format

**Active round:** `docs/pair-progress.md` — YAML frontmatter (machine-readable) + Markdown body (human-readable).

```markdown
---
round: 2
previous_round: docs/pair-progress-round-1.md
status: executing  # brainstorming | executing | paused | complete | abandoned
phase: 2
phase_name: "Build API endpoints"
total_phases: 3
current_task: "Implement GET /users endpoint"
task_owner: claude
plan: docs/plans/2026-03-13-user-api.md
detail_level: moderate
---

# Round 2

## Phases
| # | Phase | Status |
|---|-------|--------|
| 1 | Data models | done |
| 2 | Build API endpoints | in progress |
| 3 | Integration tests | pending |

## Completed Work
- [Summary of finished work, key decisions, reasoning]

## Open Items
- [Deferred ideas, unresolved questions, reminders]

## Testing Strategy
- **Approach:** [RED-GREEN TDD / other]
- **Libraries:** [list]
- **Verification:** [how to confirm]

## Ownership Preferences
- [Patterns from this and prior rounds]
- [Detail level preference]
```

### When to update the progress file

- At the end of every phase
- When a meaningful decision is made (architecture choice, scope change)
- When the plan changes
- Before long conversations or context compactions
- When the user corrects something (their memory wins)

### Round archiving

When a round completes:
1. Write the full round summary to `docs/pair-progress.md` (include retro if done)
2. Set `status: complete` in the YAML frontmatter
3. **Write** (not move) the contents to `docs/pair-progress-round-N.md`
4. **Write** a fresh `docs/pair-progress.md` for the next round, carrying forward: testing strategy, open items, ownership preferences

Archived round files from v3 (without YAML frontmatter) do not need to be migrated — they are read-only references. Only the active `docs/pair-progress.md` needs the new format.

When a round is abandoned:
1. Confirm with the user first — abandoning requires explicit confirmation
2. Set `status: abandoned` with a one-line reason
3. Archive the same way, carrying forward open items and preferences

### Session start

1. Read `docs/pair-progress.md` if it exists
2. **If the file has no YAML frontmatter** (v3 format), migrate it:
   - Read the file and extract: round number (from `# Round N` heading), status (from `## Status:` or `**Status:**` field), phase info, completed work, open items, testing strategy, and ownership preferences
   - Write a new `docs/pair-progress.md` with YAML frontmatter populated from the extracted data, preserving all markdown body sections
   - Tell the user: "I migrated your progress file to the new format with YAML frontmatter. Everything is preserved — take a look if you want to confirm."
3. If it has a plan path, read that plan too
4. If it contains a completed/abandoned round (`status: complete` or `status: abandoned` in frontmatter, or `## Status: COMPLETE` in v3 format), archive it first
5. If no progress file exists, check for `docs/pair-progress-round-*.md` filenames (don't read contents) to determine the next round number
6. Never read archived round file contents unless the user asks about a previous round

### Pausing

When the user needs to context-switch:
1. Update the progress file fully
2. Set `status: paused` in frontmatter
3. Add a note in Open Items about where work stopped and what's next
4. Confirm: "Round N is paused. Pick it back up anytime."

## Red Flags

You're doing it wrong if you:
- Start work without explicit task ownership
- Write implementation code directly instead of dispatching to a subagent
- Don't check on the user's tasks after finishing yours
- Rush through brainstorming
- Make architectural decisions without checking with the user
- Skip writing the formal plan after brainstorming
- Skip plan verification before starting execution
- Dump code without a tiered summary
- Separate explanation from the code it describes
- Present 6+ items as a flat list without grouping
- Offer 3+ alternatives when user hasn't asked
- Explore tangents inline instead of deferring
- Use "sound good?" or "shall I proceed?" instead of a real probe
- Recommend without noting what alternative was considered
- Start a session without reading the progress file
- Start a new round without archiving the previous one
- Carry stale state from a completed round into a new one
- Skip the retro without offering it
- Abandon a round without explicit user confirmation
- Ignore ownership preferences from previous rounds
