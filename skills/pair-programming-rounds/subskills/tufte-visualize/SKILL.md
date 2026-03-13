---
name: tufte-visualize
version: 2.0.0
description: Use when the programmer needs to visually understand a system, debug complex behavior, compare architectural approaches, or work through data-heavy decisions. Generates self-contained HTML visualizations using pre-built templates following Edward Tufte's principles. Invoke during brainstorming, architecture decisions, debugging, or when the user asks to "visualize", "see", "map", or "diagram" something.
---

# Tufte Visualization Subskill

## Purpose

Generate information-dense, interactive HTML visualizations that help programmers reason about their system. Every visualization follows Edward Tufte's principles — maximizing data, minimizing decoration, trusting the viewer's intelligence.

This is a thinking tool, not a charting tool.

## When to Invoke

**Suggest (Claude offers):**
- During brainstorming when discussing architecture, data flow, or system design
- When comparing 2+ approaches with multidimensional tradeoffs
- When debugging involves state transitions, event sequences, or data transformations
- When the user describes something spatial ("how does data flow?", "what depends on what?")

**Explicit (user requests):**
- User says "visualize", "diagram", "map", "show me", "graph", "chart"
- User asks to "see" the system, dependencies, data flow, or complexity

**Do not invoke:**
- Simple linear sequences that a numbered list covers
- Trivial 2-option decisions
- When the programmer is in flow — don't interrupt execution with unsolicited visualization offers

## Design Principles (Hard Constraints)

### 1. Data-Ink Ratio
Maximize visual elements that convey information. No gradient fills, drop shadows, 3D effects, decorative borders. Grid lines only when they aid reading (lightest gray, `#e0e0e0`). Labels directly on data, not in separate legends.

### 2. Small Multiples
When comparing across modules, files, or time: repeat the same visualization with consistent scales. Identical axes and encoding across panels. Shared elements stated once.

### 3. Micro/Macro Readings
Every visualization works at two scales: overview reveals the pattern at a glance, detail available on hover/click without leaving the page. High information density is a feature when the design is sound.

### 4. Layering and Separation
Use whitespace and subtle color differences for separation — never boxes or heavy borders. Color must encode data, never decoration. Maximum 4-5 distinct colors. Typography hierarchy: data labels > annotations > axis labels > titles.

### 5. Integrated Evidence
Annotations live adjacent to the data they describe — not in separate panels. Margin notes for extended explanations. No "click here to learn more" indirection.

### 6. Graphical Integrity
Visual representation proportional to quantities (Lie Factor near 1.0). Zero baselines for bar charts. Consistent scales. Label data sources and time ranges.

## How to Generate

**Always use the pre-built templates** in `skills/pair-programming-rounds/templates/`. Do NOT generate D3 code from scratch.

1. Choose the right template based on the programmer's question (see catalog below)
2. Gather data by reading code, analyzing structure, or asking the user
3. Read the template file
4. Replace `const DATA = {}` with the actual data as a JSON object
5. Fill in text placeholders: `TITLE_PLACEHOLDER`, `SUBTITLE_PLACEHOLDER`, `CAPTION_PLACEHOLDER`, `PROVENANCE_PLACEHOLDER`
6. Write the result to `docs/visualizations/round-{N}-{context}-{type}.html`
7. Tell the user the file path and suggest opening it in a browser

**Titles are questions, captions are answers.** A title like "Where does coupling concentrate?" followed by a caption like "The auth module accounts for 60% of cross-module imports" tells the story.

## Visualization Catalog

| When the programmer asks... | Template | Data shape |
|---|---|---|
| "What depends on what?" | `dependency-map.html` | Nodes with ids/labels, edges with source/target/weight |
| "Where is the complexity?" | `complexity-dashboard.html` | Files with path, directory, and metric values per function |
| "How does data flow?" | `data-flow.html` | Layers of nodes with transformation edges between them |
| "What breaks if I change this?" | `change-impact.html` | Tree of files with risk scores (coupling x test coverage gap) |
| "What are the possible states?" | `state-machine.html` | States with transitions, guards, and happy-path flags |
| "Which approach should we pick?" | `comparative-table.html` | Rows (approaches) with columns (criteria) and cell values |
| "What happened in what order?" | `timeline.html` | Events with timestamps, participants, and durations |
| "How big is everything?" | `treemap.html` | Nested hierarchy with size values and metric colors |

## Output Conventions

**File location:** `docs/visualizations/` relative to project root.

**File naming:** `round-{N}-{phase-or-context}-{visualization-type}.html`

**Data embedding:** All data embedded directly as JavaScript. No external fetches. Must work as a local file.

**Printable:** Every visualization includes a data table below the graphic so hover-dependent information is accessible without interaction.

**Colorblind-safe:** Never use red/green as the only distinguishing colors. Prefer single-hue sequential palettes.

**Note in progress file:** When a visualization is generated, record it in the Completed Work section of `docs/pair-progress.md`.

## Integration with Pair Programming Rounds

When invoked from the main skill, visualization generation should be dispatched as a subagent task. The subagent:
1. Reads the relevant code/data
2. Reads the appropriate template from `skills/pair-programming-rounds/templates/`
3. Fills in the data and text placeholders
4. Writes the output file

The main agent tells the user where to find it and references it in subsequent discussion.

## Anti-Patterns

- Generating a pie chart (use a table or bar chart)
- More than 5 colors without a data-driven reason
- Animation that doesn't encode data
- Legend in a corner when labels could go on the data
- Visualization when a table would be clearer
- Generating without stating what question it answers
- Using Canvas when SVG works (SVG is inspectable and accessible)
- Encoding more than 3 dimensions in one chart (use small multiples)
- Truncating axes without visual indication
- Red/green as only distinguishing colors
- Generating a visualization and never referencing it again
