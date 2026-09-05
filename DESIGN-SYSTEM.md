# EduStats Bright Signal Design System

## Direction

Bright Signal is an approachable educational analytics system: coral energy for action, deep teal for trust and navigation, paper-white surfaces for focus, and clear green/amber/red semantics for performance feedback. It is intentionally friendly without turning the teacher workflow into a game.

The redesign is visual-only. Existing DOM ids, JavaScript handlers, workers, imports, exports, charts, and PDF flows remain unchanged.

## Design Tokens

### Color

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--primary` | `#EF6548` | `#FF8463` | Primary action, active state |
| `--primary-light` | `#FF8A63` | `#FFAB82` | Hover and emphasis |
| `--primary-pale` | `#FFE3D9` | `#633D38` | Soft action surfaces |
| `--primary-tint` | `#FFF3ED` | `#2B3D3B` | Selected rows and cards |
| `--app-bar-start` | `#15515B` | `#0B252C` | Header gradient |
| `--teal` | `#1B7881` | `#6AC6C6` | Trust, table headers, secondary accent |
| `--green` | `#12A875` | `#4AD39D` | Pass, positive trend, success |
| `--amber` | `#C98408` | `#F5C75A` | Watch, borderline, action guidance |
| `--red` | `#D94B4B` | `#FF8076` | At risk, errors, failing marks |
| `--page` | `#F5F8F7` | `#102B31` | App background |
| `--white` | `#FFFFFF` | `#173B41` | Surface and card background |
| `--rule` | `#DCE9E6` | `#2A5358` | Borders and dividers |

### Typography

- Body: Public Sans, 14-16px, line-height 1.58.
- Display and metrics: Sora, 500-700 weight.
- Data identifiers: JetBrains Mono, 500-600 weight.
- Page title: 40-50px desktop, 30-36px mobile.
- Section title: 16-20px, 700 weight.
- Labels: 11-13px, 700 weight, slight uppercase tracking.
- Caption: 11-12px, regular or medium weight.

### Shape and depth

- Small control radius: 10-12px.
- Cards and panels: 16-20px.
- Pills and badges: 999px.
- Shadows are cool, soft, and restrained: `0 2px 8px rgba(23,60,69,.06)` for resting surfaces and `0 16px 38px rgba(23,60,69,.13)` for elevated surfaces.

## Component Library

### Buttons

- Primary: coral fill, white text, bottom action shadow, rises 2px on hover and compresses on press.
- Success: green fill for completed or positive actions.
- Outline: white surface with coral border and coral text.
- Ghost: transparent, teal-tinted hover surface.
- Disabled/busy: existing app state remains authoritative; reduce opacity and suppress lift.
- Minimum touch target: 44px height.

### Cards

Cards use white or lightly tinted surfaces, a 1px rule, 16-20px corners, and a subtle resting shadow. Hover elevation is reserved for actionable cards and does not change layout dimensions.

### Inputs

Inputs use 46px minimum height, 12px radius, neutral borders, and a coral focus ring with a small upward lift. Invalid states continue to use the existing red classes and should not be hidden by the visual layer.

### Tabs and navigation

The desktop tab strip uses a white surface and coral inset active bar. On phones, the existing section selector remains visible and receives the same surface, focus, and radius treatment. The teal app bar anchors institution and class context.

### Feedback

- Green: success, pass, stable forecast.
- Amber: borderline, needs attention, non-blocking warning.
- Red: failure, at-risk forecast, blocking error.
- Toasts retain the existing `ok`, `warn`, and `err` classes.

## Visualization Patterns

### Circular progress

Use circular progress for class pass rate, predicted grade confidence, and individual attainment. The track uses `var(--rule)`; the value stroke uses green for positive, amber for borderline, and red for risk. Animate the stroke from empty to the measured value over 600ms with the standard emphasis easing. Always include the numeric value and a text label so the chart is not color-dependent.

### Subject comparison

Use grouped horizontal bars for subject means versus fail thresholds. Keep subject labels left aligned, values at the bar end, and use teal for class mean, coral for the selected student, and a red threshold marker. Animate bars from zero width after the panel enters.

### Trend

Use a line chart for longitudinal monthly performance. Use a solid coral line for the student, a muted teal class baseline, and a translucent risk band below the fail threshold. Tooltips must include the month, score, and interpretation.

### Risk queue

The predictive insights card uses a compact count badge and a short intervention list. Do not encode risk only through red; include the words `At risk`, `Watch`, or `Stable`.

## Layouts

- App shell: sticky 68px header, contextual tab strip, centered content max-width 1280px.
- Dashboard: six-stat responsive grid followed by predictive insights, grade distribution, subject statistics, and rankings.
- Data entry: form controls in one column on phones, two or three columns from tablet widths upward; data table remains horizontally scrollable.
- Reports: action cards in a two-column desktop grid and stacked mobile layout.
- Mobile: 12px page gutters, 16px card padding, 46px controls, two-column metric grid where content permits.

## Motion

- Panel and card reveal: `signal-rise`, 320-500ms, emphasis easing, staggered by 40ms.
- Button hover: 140-220ms, 2px lift; press compresses without bounce.
- Focus: immediate 4px semantic ring.
- Chart fill: 600ms, data-driven from zero to value.
- Reduced motion: all transitions and animations collapse to near-zero duration through `prefers-reduced-motion`.

## Implementation Notes

The implementation lives in the final visual-only style block in `index.html`. It overrides existing tokens and shared selectors rather than changing generated markup. Keep JavaScript-facing class names and IDs stable. New visual components should use existing classes first, then add a narrowly scoped class only when a new semantic state is required.

The current ONNX/worker and IndexedDB code paths are intentionally untouched by this redesign. Chart.js canvases remain the rendering surface, and jsPDF continues to receive the same data structures.
