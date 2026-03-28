---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks.

Use when:
- Designing new pages (landing page, dashboard, admin, SaaS, mobile)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for UX, accessibility, or visual consistency
- Making product-level design decisions (style, information hierarchy, brand)

Example queries:
- 'Build a SaaS dashboard design system'
- 'Create a luxury e-commerce store design'
- 'Design a modern fintech app interface'
- 'Review my booking app for UX issues'

Access the skill's Python CLI tools:
- Design System Generation: python scripts/search.py '<query>' --design-system
- Domain Search: python scripts/search.py '<query>' --domain color
- Stack Guidelines: python scripts/search.py '<query>' --stack react

Documentation: See SKILL.md in this folder for complete workflow."
---

# UI/UX Pro Max Skill

Complete design intelligence for web and mobile applications.

## Quick Start

### 1. Install Dependencies

```bash
python --version  # Requires Python 3.8+
```

### 2. View the Full Documentation

See `SKILL.md` for comprehensive guidance on:
- When to use this skill  
- Rule categories by priority (Accessibility → Charts & Data)
- Quick reference checklists
- 4-step workflow with examples
- Pre-delivery checklist

### 3. Use the CLI Tools (If All Files Downloaded)

```bash
# Design system generation (requires all data files)
python scripts/search.py "SaaS dashboard" --design-system

# Domain-specific search
python scripts/search.py "minimalism dark mode" --domain style

# Stack-specific guidance
python scripts/search.py "list performance" --stack react
```

## File Structure

```
.claude/skills/ui-ux-pro-max/
├── SKILL.md                    # Complete documentation (read this!)
├── scripts/
│   ├── search.py              # CLI entry point
│   ├── core.py                # BM25 search engine
│   └── design_system.py        # Design system generator
└── data/                       # Data files (download separately)
    ├── products.csv           # 161 product types
    ├── styles.csv             # 50+ UI styles
    ├── colors.csv             # 161 color palettes
    ├── typography.csv         # 57 font pairings
    ├── charts.csv             # 25 chart types
    ├── ux-guidelines.csv       # 99 UX best practices
    ├── landing.csv            # Landing page patterns
    ├── ui-reasoning.csv        # Reasoning rules
    └── ... (additional CSV files)
```

## Full Setup (Complete Data Files)

The Python scripts need data files to function. Two options:

### Option A: Clone the Full Repository (Recommended)

```bash
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git
cd ui-ux-pro-max-skill
# Copy .claude/skills/ui-ux-pro-max to your project
```

### Option B: Manual Download

Download all CSV files from: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/src/ui-ux-pro-max/data`

Place them in `.claude/skills/ui-ux-pro-max/data/` directory.

## Primary Use Cases

### UI/UX Design Review

Use this skill when you need to:

- ✅ **Design new UI** - Get comprehensive design system recommendations
- ✅ **Review existing UI** - Validate against 99 UX guidelines and checklists  
- ✅ **Choose style/colors** - Find perfect palette for your product type
- ✅ **Component creation** - Get patterns for buttons, forms, cards, charts
- ✅ **Accessibility check** - WCAG compliance and a11y best practices
- ✅ **Animation guidance** - Proper timing, easing, and motion patterns
- ✅ **Typography pairing** - 57 proven font combinations

### Trigger Phrases

Ask Claude (via chat) to:

- "Review this button component for accessibility"
- "What color palette fits a fintech dashboard?"
- "Design a landing page structure for a beauty service"
- "Check my form for UX issues"
- "Generate a complete design system for my SaaS app"
- "What animations should I use here?"
- "Is my contrast ratio WCAG compliant?"

## Key Features

### 1️⃣ 161 Product Types with AI Reasoning

Pre-built reasoning for every product category (SaaS, e-commerce, healthcare, gaming, etc.) with recommended styles, colors, typography, and effects.

### 2️⃣ 99 UX Guidelines (Rule Categories)

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Accessibility | CRITICAL |
| 2 | Touch & Interaction | CRITICAL |
| 3 | Performance | HIGH |
| 4 | Style Selection | HIGH |
| 5 | Layout & Responsive | HIGH |
| 6 | Typography & Color | MEDIUM |
| 7 | Animation | MEDIUM |
| 8 | Forms & Feedback | MEDIUM |
| 9 | Navigation Patterns | HIGH |
| 10 | Charts & Data | LOW |

### 3️⃣ Comprehensive Pre-Delivery Checklist

```
- [ ] No emojis as icons (use SVG)
- [ ] cursor-pointer on all clickable elements
- [ ] 4.5:1 contrast ratio for text
- [ ] Visible focus states for keyboard navigation
- [ ] prefers-reduced-motion respected
- [ ] Touch targets ≥44×44pt
- [ ] Responsive: 375px, 768px, 1024px, 1440px
```

### 4️⃣ Stack Coverage

- React / Next.js
- Vue / Nuxt
- Svelte / SvelteKit
- Angular
- SwiftUI
- React Native
- Flutter
- HTML/Tailwind
- shadcn/ui
- Jetpack Compose

## Example Workflow

### Run a Design System Analysis

1. **Identify your product type:**  
   "I'm building a fintech app dashboard"

2. **Ask Claude:**  
   "Help me design a dashboard for a fintech crypto app"

3. **Claude uses this skill to:**
   - Search product database → finds "Fintech/Crypto" category
   - Apply reasoning rules → determines recommended patterns
   - Search styles → finds "Minimalism + Dark Mode"
   - Search colors → gets navy/trust blue + gold
   - Search typography → selects professional fonts
   - Aggregate results → generates complete design system

4. **Get output like:**

```
+========================================+
| DESIGN SYSTEM FOR: FINTECH CRYPTO      |
+========================================+

PATTERN: Trust & Authority
- Style: Minimalism + Dark Mode
- Colors: Navy + Trust Blue + Gold
- Typography: Inter / Inconsolata
- Key Effects: Smooth state transitions

COLORS:
- Primary: #0066CC (Trust Blue)
- Secondary: #1E3A5F (Navy)
- CTA: #FFD700 (Gold)
- Background: #0A0E27 (Deep Dark)
- Text: #F8FAFC (Light)

PRE-DELIVERY CHECKLIST:
- [ ] No emojis as icons
- [ ] WCAG AAA compliance (high security)
- [ ] Real-time number animations
- [ ] Security indicator styling
+========================================+
```

## Advanced: Design System Persistence

Save design systems for reuse across projects:

```bash
python scripts/search.py "fintech crypto" \
  --design-system \
  --persist \
  -p "CryptoBank" \
  --page "dashboard"
```

Creates:
- `design-system/CryptoBank/MASTER.md` - Global rules
- `design-system/CryptoBank/pages/dashboard.md` - Page overrides

## Tips for Best Results

- **Multi-dimensional queries**: `"entertainment social vibrant content-dense"` not just `"app"`
- **Always start with design system**: `--design-system` gives full context
- **Then deep-dive domains**: Use `--domain` for specific details
- **Use `--stack` for tech**: Get implementation guidance for your framework

## Pre-Delivery Validation

Before shipping UI, use this checklist:

### § 1: Accessibility (CRITICAL)
- [ ] Color contrast: 4.5:1 minimum
- [ ] Keyboard navigation: Full support
- [ ] Focus states: Visible 2-4px rings
- [ ] Alt text: All meaningful images
- [ ] ARIA labels: Icon-only buttons

### § 2: Touch & Interaction (CRITICAL)
- [ ] Touch targets: 44×44pt minimum
- [ ] Touch spacing: 8px between targets
- [ ] Feedback: Visual response within 100ms
- [ ] Haptic: For confirmations/actions

### § 3: Performance (HIGH)
- [ ] WebP/AVIF images
- [ ] Lazy loading: Below-fold content
- [ ] CLS < 0.1 (no layout shifts)
- [ ] Main thread: <16ms per frame

### § 5: Responsive (HIGH)
- [ ] Mobile-first approach
- [ ] No horizontal scroll
- [ ] Tested: 375px, 768px, 1024px

### § 6: Typography & Color (MEDIUM)
- [ ] Base 16px: Readable body text
- [ ] Line-height: 1.5-1.75
- [ ] Semantic tokens: Not raw hex
- [ ] Dark mode: Separate contrast test

### § 7: Animation (MEDIUM)
- [ ] Duration: 150-300ms (not >500ms)
- [ ] `prefers-reduced-motion`: Respected
- [ ] Meaning: Every animation has purpose
- [ ] Transform/opacity only (not width/height)

## Reference Links

- **GitHub:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Author:** @nextlevelbuilder
- **CSV Data:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/src/ui-ux-pro-max/data
- **Skills Docs:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills

## License

This skill is part of the UI/UX Pro Max project and is licensed under its original license. See the GitHub repository for details.

---

**Read SKILL.md next for the complete workflow and rule reference.**
