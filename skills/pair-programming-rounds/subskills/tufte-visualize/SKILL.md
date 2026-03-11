---
name: tufte-visualize
version: 1.0.0
description: Use when the programmer needs to visually understand a system, debug complex behavior, compare architectural approaches, or work through data-heavy decisions. Generates self-contained HTML visualizations following Edward Tufte's principles from "The Visual Display of Quantitative Information" and "Envisioning Information." Invoke during brainstorming phases, architecture decisions, debugging sessions, or when the user asks to "visualize", "see", "map", or "diagram" something.
---

# Tufte Visualization Subskill

## Purpose

Generate beautiful, information-dense, interactive HTML visualizations that help programmers understand systems, debug behavior, compare approaches, and make architectural decisions. Every visualization follows Edward Tufte's principles — maximizing data, minimizing decoration, and trusting the viewer's intelligence.

**This is not a charting tool.** This is a thinking tool. The visualizations exist to help the programmer reason about their system, not to make pretty pictures.

## When to Invoke

**Auto-suggest (Claude should offer):**
- During brainstorming when the discussion involves architecture, data flow, or system design
- When comparing 2+ approaches and the tradeoffs are multidimensional
- When debugging involves understanding state transitions, event sequences, or data transformations
- When the user describes something spatial ("how does data flow from X to Y?", "what depends on what?")

**Explicit (user requests):**
- User says "visualize", "diagram", "map", "show me", "graph", "chart"
- User asks to "see" the system, dependencies, data flow, or complexity
- User shares data and wants to understand patterns

**Do not invoke:**
- For simple linear sequences that a numbered list covers
- When the user has chosen Markdown-only output mode and hasn't asked for a visualization
- For trivial decisions with 2 obvious options
- When the programmer is in flow on execution tasks — don't interrupt with visualization offers

## Design Principles — Hard Constraints

Every generated visualization MUST follow these rules. These are not suggestions. Violating them produces chartjunk.

### 1. Data-Ink Ratio

> "Above all else, show the data." — Tufte

Maximize the proportion of visual elements that convey information. Every pixel must earn its place.

**Required:**
- No gradient fills, drop shadows, or 3D effects — ever
- No decorative borders or background patterns
- Grid lines only when they aid precise reading — use the lightest possible gray (#e0e0e0 or lighter), and prefer removing them entirely
- Axes only when scale matters — omit when the pattern is the message
- Labels directly on or adjacent to data elements, never in a separate legend when avoidable

**Forbidden:**
- Chartjunk: decorative illustrations, icons-as-data, pictograms
- Redundant encoding: using both color AND shape AND label to represent the same dimension
- Chrome that doesn't inform: rounded corners on data containers, colored section backgrounds, ornamental dividers

### 2. Small Multiples

> "At the heart of quantitative reasoning is a single question: Compared to what?" — Tufte

When comparing across modules, files, time periods, or approaches, use the same small visualization repeated with consistent scales.

**Required:**
- Identical axes, scales, and visual encoding across all panels
- Panels arranged in a grid that follows a meaningful order (alphabetical, chronological, by magnitude)
- Shared elements (axis labels, titles) factored out — stated once, not repeated per panel
- Enough panels to show the pattern — Tufte argues for dozens when the data supports it

### 3. Micro/Macro Readings

> "To clarify, add detail." — Tufte

Design visualizations that work at two scales: the overview reveals the pattern, the detail reveals the specifics.

**Required:**
- Every visualization must have a macro reading (what does the whole picture tell you at a glance?)
- Detail available on demand — via hover, zoom, or click — without leaving the page
- The transition between macro and micro must be seamless, not a mode switch
- High information density is a feature, not a problem, when the design is sound

### 4. Layering and Separation

Use whitespace, subtle color differences, and typographic weight to separate information layers. Never use boxes, borders, or heavy rules to create separation.

**Required:**
- Whitespace is the primary separation mechanism
- If color is used, it must encode data — never decoration
- Maximum 4-5 distinct colors per visualization; prefer a single-hue sequential palette for quantitative data
- Typography follows the hierarchy: data labels > annotations > axis labels > titles

### 5. Integrated Evidence

> "The point of the evidence display is to assist thinking about the substance." — Tufte

Explanations, annotations, and context live adjacent to the data they describe, not in separate panels or popups.

**Required:**
- Annotations placed directly on the visualization at the point of relevance
- Margin notes (following Tufte CSS conventions) for extended explanations
- No "click here to learn more" indirection — if the explanation matters, it's visible
- Sidenotes preferred over footnotes; footnotes preferred over separate documentation

### 6. Graphical Integrity

The visual representation of quantities must be directly proportional to the quantities represented.

**Required:**
- Lie Factor near 1.0 — the visual effect size must match the data effect size
- Baselines at zero for bar charts (or clearly marked if truncated, with justification)
- Consistent scales — never stretch one axis to exaggerate a trend
- Time series must use consistent time intervals on the x-axis
- Label data sources and time ranges

## Technology Stack

All visualizations are self-contained HTML files. No build steps, no package installation, no framework dependencies.

### Required Libraries (loaded via CDN)

```html
<!-- Tufte CSS — typography, sidenotes, margin figures -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tufte-css/1.8.0/tufte.min.css" />

<!-- D3.js — data-driven visualization -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
```

### Optional Libraries (use when appropriate)

```html
<!-- Observable Plot — faster high-level alternative to D3 for standard chart types -->
<script src="https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm"></script>

<!-- For inline sparklines when embedding in text-heavy documents -->
<script src="https://cdn.jsdelivr.net/npm/@aspect-js/sparkline@1.0.0/sparkline.min.js"></script>
```

### HTML Template

Every generated visualization MUST use this base structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>[Descriptive title — what question does this visualization answer?]</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tufte-css/1.8.0/tufte.min.css" />
    <style>
        /* Tufte overrides and visualization-specific styles */
        body { background: #fffff8; }
        svg text { font-family: et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif; }
        .data-ink { stroke: #333; fill: none; }
        .annotation { font-size: 0.8rem; fill: #666; }
        .hover-detail { opacity: 0; transition: opacity 0.15s; }
        .hover-detail.visible { opacity: 1; }
        /* No decorative styles. No gradients. No shadows. */
    </style>
</head>
<body>
    <article>
        <h1>[Title: the question this answers]</h1>
        <p class="subtitle">[Context: what system, what timeframe, what scope]</p>

        <section>
            <!-- Primary visualization -->
            <figure>
                <div id="viz"></div>
                <!-- Caption is mandatory — it states the takeaway, not a description -->
                <figcaption>
                    [The insight — what should the viewer conclude from this graphic?]
                </figcaption>
            </figure>
        </section>

        <section>
            <!-- Annotations, methodology notes, data sources -->
            <p>[How the data was gathered. What's included/excluded. Caveats.]</p>
        </section>
    </article>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
    <script>
        // Data and visualization code here
        // All data is embedded — no external fetches
    </script>
</body>
</html>
```

### Style Rules for Generated Code

- Use `et-book` (via Tufte CSS) as the primary font — never sans-serif for body text
- Background: `#fffff8` (Tufte's off-white) — never pure white
- Primary data ink: `#333` — never pure black
- Annotation text: `#666`
- Grid lines (when necessary): `#e0e0e0`, 1px, no dashes
- Interactive hover states: `opacity` transitions only — no scaling, bouncing, or color animations
- SVG preferred over Canvas for most visualizations (accessible, inspectable, printable)
- Responsive: visualizations must work at 800px-1400px viewport width

## Visualization Catalog

Choose the right visualization type based on what the programmer needs to understand. When in doubt, ask.

### 1. Dependency Map

**Use when:** Understanding what connects to what. Module relationships, import graphs, service dependencies.

**Tufte principles applied:**
- Micro/macro: force-directed layout shows clusters at a glance; hover reveals specific imports/exports
- Data-ink: edge weight encoded by line thickness only (not color AND thickness AND labels)
- Layering: internal vs external dependencies separated by subtle color difference

**Data sources:** `import`/`require` statements, package.json dependencies, API call graphs

**Interactivity:**
- Hover a node → highlight all connected edges, dim unconnected nodes, show detail panel in margin
- Click a node → freeze the highlight for comparison
- Scroll to zoom, drag to pan

### 2. Complexity Dashboard (Small Multiples)

**Use when:** Assessing where complexity lives in a codebase. Finding hotspots. Prioritizing refactoring.

**Tufte principles applied:**
- Small multiples: one sparkline per file/module, arranged by directory structure
- Data-ink: no axes on individual sparklines — the pattern is the message
- Integrated evidence: file path labels serve double duty as both identifier and navigation hint

**Data sources:** Cyclomatic complexity, lines of code, function count, nesting depth. Derived from static analysis or Claude's reading of the code.

**Interactivity:**
- Hover a sparkline → show exact values and the metric name
- Click → expand to a full time-series chart with axes

### 3. Data Flow Diagram

**Use when:** Tracing how data moves through a system. Understanding transformations, side effects, and state changes.

**Tufte principles applied:**
- Layering: data layers (input → processing → storage → output) separated by whitespace, not boxes
- Adjacent annotations: transformation descriptions placed directly on the flow arrows
- Graphical integrity: flow width proportional to data volume when volume matters

**Data sources:** Claude's analysis of the code path, user description of the system, database schema

**Interactivity:**
- Hover a transformation → show the function/method responsible and a code snippet
- Click a data store → show schema or type definition in a margin note

### 4. Change Impact Visualization

**Use when:** Planning a refactor. Understanding blast radius. Answering "if I change X, what breaks?"

**Tufte principles applied:**
- Data-ink: node size encodes risk (number of dependents × test coverage gap), nothing else
- Micro/macro: overview shows the full dependency tree colored by impact level; hover shows specific files and test names
- Graphical integrity: impact radius is computed, not guessed

**Data sources:** Import graph, test coverage data, git blame/churn history

**Interactivity:**
- Select the file(s) being changed → visualization highlights all affected files
- Color scale: green (tested, low coupling) → red (untested, high coupling)
- Hover → show which tests cover this file, last modification date

### 5. State Machine / Flow Diagram

**Use when:** Debugging complex state transitions. Understanding UI flows, protocol states, or workflow engines.

**Tufte principles applied:**
- Graphical integrity: every path shown must be reachable in the actual code
- Adjacent annotations: transition conditions placed directly on edges
- Layering: happy path emphasized (darker ink), error/edge paths de-emphasized (lighter ink)

**Data sources:** State management code (Redux, XState, finite automata), route definitions, workflow configs

**Interactivity:**
- Click a state → highlight all paths that reach it (forward and backward)
- Hover a transition → show the condition/guard and the code that triggers it
- Toggle: show/hide error paths, show/hide guard conditions

### 6. Comparative Table (Tufte-Style)

**Use when:** Brainstorming phase — comparing 2-4 architectural approaches, library choices, or design options.

**Tufte principles applied:**
- Data-ink: no vertical rules, minimal horizontal rules (top, bottom, and below header only)
- Numbers right-aligned, text left-aligned, generous whitespace
- Integrated evidence: footnotes as sidenotes, not at page bottom

**Data sources:** Claude's analysis, user-provided criteria, benchmark data

**Interactivity:**
- Sortable columns (click header to sort)
- Hover a cell → expand abbreviated content or show source/reasoning
- Highlight row on hover for scanning

### 7. Timeline / Sequence Diagram

**Use when:** Understanding the order of events. Debugging async operations, request lifecycles, or build pipelines.

**Tufte principles applied:**
- Data-ink: time flows left to right, participants are labeled once at the left margin
- Layering: synchronous calls in solid lines, async in dashed — the only two line styles
- Data density: compress idle time, expand active periods proportionally

**Data sources:** Log files, network traces, Claude's analysis of async code paths

**Interactivity:**
- Hover an arrow → show payload/arguments and duration
- Click a participant → highlight all messages to/from that participant
- Zoom into a time range by click-drag on the timeline axis

### 8. Codebase Treemap

**Use when:** Understanding the shape and size of a codebase. Finding where code lives, what's big, what's tested.

**Tufte principles applied:**
- Micro/macro: rectangles sized by lines of code, colored by a chosen metric (complexity, coverage, churn)
- Data-ink: labels only on rectangles large enough to hold them — small modules are identified by hover
- Layering: directory hierarchy encoded by nesting, not by borders

**Data sources:** File system structure, line counts, complexity metrics, coverage reports

**Interactivity:**
- Hover → show file path, line count, metric value
- Click → zoom into that directory (drill-down)
- Toggle color encoding between metrics (complexity, coverage, last modified)

## Output Conventions

### File Location

All generated visualizations go to `docs/visualizations/` relative to the project root:

```
docs/
├── pair-progress.md
├── pair-progress-round-1.md
└── visualizations/
    ├── round-1-architecture-dependencies.html
    ├── round-1-approach-comparison.html
    └── round-2-refactor-impact.html
```

### File Naming

`round-{N}-{phase-or-context}-{visualization-type}.html`

Examples:
- `round-1-brainstorm-dependency-map.html`
- `round-2-debug-state-machine.html`
- `round-3-refactor-change-impact.html`

### Data Embedding

All data MUST be embedded directly in the HTML file as JavaScript variables or JSON. Never reference external data files or API endpoints. The visualization must work when opened as a local file with no server.

```javascript
// Good — data embedded directly
const modules = [
    { name: "auth", complexity: 12, lines: 340, dependencies: ["db", "crypto"] },
    { name: "api", complexity: 8, lines: 220, dependencies: ["auth", "validation"] },
];

// Forbidden — external data source
// fetch('/api/metrics').then(...)  // NO — breaks offline, creates dependency
```

### Captions and Annotations

Every visualization MUST have:
1. **A title framed as a question** — "Where does complexity concentrate?" not "Complexity Map"
2. **A caption stating the insight** — "Authentication and payment modules account for 60% of total cyclomatic complexity" not "This chart shows complexity by module"
3. **Data provenance** — where the data came from, when it was gathered, what's excluded
4. **At least one annotation** on the visualization itself pointing out the most important pattern

### Printing

Visualizations should be printable. Hover-dependent information must also be accessible without interaction (e.g., a data table below the graphic that shows the full detail). This follows Tufte's print-first philosophy while extending it for the web.

## Integration with Pair Programming Rounds

### During Brainstorming

When this subskill is invoked during the brainstorming phase:
1. Identify what the programmer needs to understand before making a decision
2. Propose which visualization type from the catalog would help — explain why in one sentence
3. Gather the data (read code, analyze structure, ask the user for missing context)
4. Generate the HTML file and save it to `docs/visualizations/`
5. Tell the user the file path and suggest they open it in a browser
6. Reference the visualization in subsequent discussion — "as the dependency map shows, module X is the highest-coupling node"

### During Execution

Visualizations during execution should be offered, not imposed. Suggest when:
- A refactor is about to touch many files — offer a change impact visualization
- The user is confused about data flow — offer a data flow diagram
- A bug involves complex state — offer a state machine diagram

### During Retro

Generate a round summary visualization if the round involved 3+ phases:
- A small-multiples timeline showing what was built in each phase
- A before/after comparison if architecture changed significantly

### Progress File Integration

When a visualization is generated, note it in the active `docs/pair-progress.md`:

```markdown
## Completed Work
- Generated dependency map: docs/visualizations/round-1-brainstorm-dependency-map.html
```

## Anti-Patterns — You're Doing It Wrong

- Generating a pie chart (Tufte's least favorite chart type — use a table or bar chart instead)
- Using more than 5 colors without a data-driven reason
- Adding animation that doesn't encode data (no spinning loaders, no entrance animations)
- Putting a legend in a separate corner when labels could go directly on the data
- Using a visualization when a table would be clearer (small datasets with exact values)
- Making the visualization depend on external resources (CDN failures should degrade gracefully — inline critical CSS/JS as a fallback)
- Generating a visualization without stating what question it answers
- Using canvas when SVG would work (canvas is not inspectable or accessible)
- Encoding more than 3 dimensions in a single chart (use small multiples instead)
- Truncating axes without clear visual indication and justification
- Using red/green as the only distinguishing colors (colorblind-hostile)
- Generating a visualization and never referencing it again in conversation

## Quick Reference

| Situation | Visualization Type | Key Principle |
|---|---|---|
| "What depends on what?" | Dependency Map | Micro/macro readings |
| "Where is the complexity?" | Complexity Dashboard | Small multiples |
| "How does data flow?" | Data Flow Diagram | Layering and separation |
| "What breaks if I change this?" | Change Impact | Data-ink ratio |
| "What are the possible states?" | State Machine | Graphical integrity |
| "Which approach should we choose?" | Comparative Table | Integrated evidence |
| "What happened in what order?" | Timeline / Sequence | Data density |
| "How big is everything?" | Codebase Treemap | Micro/macro readings |
