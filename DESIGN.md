---
name: Brutalist Design System
description: A practical, interaction-first component system for vibe coders.
colors:
  canvas: "#f4f4f0"
  surface: "#ffffff"
  ink: "#000000"
  secondary: "#595959"
  accent: "#79d9ff"
  success: "#23a094"
  danger: "#dc341e"
  edit-highlight: "rgb(0 0 0 / 3%)"
  backdrop: "rgb(0 0 0 / 35%)"
typography:
  display:
    fontFamily: '"Avenir Next", Avenir, Montserrat, Corbel, "URW Gothic", sans-serif'
    fontSize: "48px"
    fontWeight: 500
    lineHeight: "52px"
  headline:
    fontFamily: '"Avenir Next", Avenir, Montserrat, Corbel, "URW Gothic", sans-serif'
    fontSize: "32px"
    fontWeight: 500
    lineHeight: "36px"
  title:
    fontFamily: '"Avenir Next", Avenir, Montserrat, Corbel, "URW Gothic", sans-serif'
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "28px"
  body:
    fontFamily: '"Avenir Next", Avenir, Montserrat, Corbel, "URW Gothic", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "22px"
  label:
    fontFamily: '"Avenir Next", Avenir, Montserrat, Corbel, "URW Gothic", sans-serif'
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
rounded:
  none: "0px"
  small: "4px"
  large: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "8px 16px"
    height: "48px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "8px 16px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.small}"
    padding: "8px 16px"
    height: "48px"
  text-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "12px 16px"
    height: "48px"
  tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
---

# Design System: Brutalist Design System

## Overview

**Creative North Star: "The Working Specimen"**

Brutalist Design System treats every component as a working specimen: clear enough to inspect, direct enough to copy, and tactile enough to reveal its behavior. The visual language is high-contrast and utilitarian, with a warm paper canvas, white working surfaces, black ink, and a bright cyan accent reserved for action and state.

The system favors readable density over decoration. Strong borders, compact radii, visible focus, and small offset shadows make interaction states legible. Documentation follows a categorized, AlignUI-inspired structure so vibe coders can move from preview to source to usable implementation without losing context.

**Key Characteristics:**
- Warm canvas and white surfaces
- Black ink with cyan action accents
- Compact radii, explicit borders, and offset depth
- Preview-first documentation with copyable output
- Responsive, semantic, keyboard-accessible controls

## Colors

The palette is deliberately small: neutral paper and ink establish the field, while cyan, teal, and red communicate action and feedback.

### Primary
- **Electric Cyan** (#79d9ff): Primary action, selected progress, and interactive emphasis.

### Secondary
- **Utility Teal** (#23a094): Success feedback and completed states.
- **Signal Red** (#dc341e): Errors, destructive actions, and danger feedback.

### Neutral
- **Warm Canvas** (#f4f4f0): Page background and quiet interaction states.
- **Working Surface** (#ffffff): Component surfaces, fields, and readable content areas.
- **Ink** (#000000): Text, borders, dividers, and structural emphasis.
- **Secondary Ink** (#595959): Supporting text and scrollbar contrast.
- **Edit Highlight** (rgb(0 0 0 / 3%)): Subtle editable and hover surface.
- **Backdrop** (rgb(0 0 0 / 35%)): Modal scrim.

**The Small Palette Rule.** Use the accent and feedback colors for meaning; let ink, canvas, and surface carry most of the interface.

## Typography

**Display Font:** Avenir Next (with Avenir, Montserrat, Corbel, URW Gothic, sans-serif fallbacks)
**Body Font:** Avenir Next (with the same fallback stack)
**Label/Mono Font:** Inherited sans-serif; code examples use the browser monospace face.

**Character:** Avenir Next gives the system a clean, friendly technical voice. Weight and line-height changes establish hierarchy while the shared family keeps documentation and controls coherent.

### Hierarchy
- **Display** (500, 48px, 52px): Page titles and major documentation headings.
- **Headline** (500, 32px, 36px): Section-level headings.
- **Title** (500, 24px, 28px): Component and specimen headings.
- **Body** (400, 16px, 22px): Explanations, field content, and readable prose.
- **Label** (600, 14px, 20px): Navigation labels, metadata, and compact control text.

**The Specimen First Rule.** Show a readable working example before asking users to parse implementation details.

## Layout

The documentation uses one shell with a three-column desktop grid shared by the header and the page: a sticky navigation rail, a flexible article column, and an on-page index. The header follows the same columns—brand over the rail, the four primary areas (Start, Basics, Components, Blocks) over the article, and the page finder over the index—so its rules continue the rail and index borders. The rail lists only the current area; the ⌘K or `/` finder searches every area. Below 1200px the index becomes an “On this page” menu; below 800px the rail moves into a drawer that also carries the area links.

Every documentation page starts the same way: title, one-line lead, the copyable import statement, then the default example. Sections follow in a fixed order—Examples, Composition (when present), Usage guidance, API reference—each introduced by a ruled heading. Pages carry no eyebrows, helper sentences, or repeated footers.

Main content uses 48px horizontal padding on desktop, 32px at tablet widths and 16px on phones, with 64px between sections. Scrollable regions preserve minimum widths and use thin, themed scrollbars.

## Elevation & Depth

The system uses structural, offset shadows rather than soft ambient elevation. Flat surfaces are the default; borders provide the primary edge and small hard shadows appear on interactive or floating elements. Motion shifts components by small negative offsets to make interaction feel physical.

### Shadow Vocabulary
- **Small offset** (`2px 2px 0 var(--a-color-ink)`): Compact controls and selected affordances.
- **Interactive offset** (`4px 4px 0 var(--a-color-ink)`): Hover and focus-within feedback on panels and buttons.
- **Floating offset** (`8px 8px 0 var(--a-color-ink)`): Modals and elevated popovers.

**The Hard Edge Rule.** Keep depth crisp and directional; do not introduce soft gradients or diffuse shadows into the core component language.

## Shapes

Form language is geometric and explicit. Most controls use a 4px radius, larger panels use a 20px radius, and pills use a fully rounded 999px silhouette. One-pixel ink borders define the component boundary. Inputs, panels, menus, and overlays use white surfaces; the warm canvas is reserved for the page and quiet states.

## Components

### Buttons
- **Shape:** Compact 4px corners with a 1px ink border.
- **Primary:** Cyan surface with ink text and 8px 16px internal padding.
- **Hover / Focus:** Lift by 4px with a hard interactive shadow; retain a visible 2px focus ring.
- **Secondary / Ghost / Tertiary:** White bordered default, or transparent quiet variant.

### Chips / Tags
- **Style:** Pill silhouette, 4px 8px padding, white default surface, ink border.
- **State:** Accent, success, and danger tones communicate semantic status; removable tags expose a compact pill action.

### Cards / Containers
- **Corner Style:** 4px for compact containers, 20px for panels and modal surfaces.
- **Background:** White working surface with warm canvas headers where the pattern calls for separation.
- **Shadow Strategy:** Flat at rest; hard offset shadow for interaction and floating states.
- **Border:** 1px ink border.
- **Internal Padding:** 16px to 32px, with documentation panels using the larger step where content requires it.

### Inputs / Fields
- **Style:** White surface, 1px ink stroke, 4px radius, 12px 16px padding, 48px control height.
- **Focus:** Inset ink ring with the shared 2px focus treatment.
- **Error / Disabled:** Danger border for invalid fields; disabled controls use reduced opacity and a not-allowed cursor.
- **Pickers:** Date, date-range and time fields are one bordered control holding the typed value and a single trigger; the browser's own picker is hidden and the system popover (calendar or time slots) is the only selector.
- **Choice cards:** Selected cards stay white; the filled control, a doubled ink edge and the small offset show selection. The control sits in its own column, centred on the label and description.
- **Hints:** Field hints and errors start where the label text starts, including beside checkboxes and switches.

### Blocks
- **Containers:** A block that completes a task sits in a Panel. Focused single tasks (sign-in, recovery, verification) use the default Panel at a 25rem maximum; settings, profile and access blocks use the split Panel with a canvas header.
- **Settings rows:** Each section is a labelled group whose title and hint sit in the left column and whose controls sit in the right; rows are separated by ink rules and stack below a 36rem container width.
- **Actions:** The primary action closes the form. Settings close with right-aligned actions and no rule above them; account panels move secondary routes (“New here?”, “Return to sign in”) into a ruled footer.
- **Identity:** People use round avatars; organizations, workspaces and brand marks use square avatars. Identity triggers (workspace switcher, account menu) share one bordered shape with a two-line label and an up-down chevron.
- **Rails:** Sidebars and navigation rails use the canvas tone and a single ink edge, with the account or settings control pinned to the bottom under a rule.
- **Examples:** Demonstration content reads as product copy. Never label an example as a simulation inside its preview.

### Menus and overlays
- **Menus:** Items highlight with the canvas tone; keyboard focus adds a 1px inset ink edge. A menu opens at least as wide as its trigger, and single- or multi-choice items keep an indicator column so labels align.
- **Focus return:** Closing an overlay with the pointer returns focus to its trigger without drawing the keyboard ring.

### Navigation
- **Style:** Compact left-aligned rows with 4px radius. Active and hovered rows use white surfaces; the active page receives an inset ink outline. The same treatment marks the current area in the header's navigation menu.
- **Groups:** Collapsible groups use the quiet Disclosure: a borderless row with a chevron.
- **Responsive:** The navigation rail moves into a drawer on narrow screens, with the content column taking the full width.

## Do's and Don'ts

### Do:
- **Do** use shared atomic primitives for controls, layout, and interaction behavior.
- **Do** pair previews with copyable IDs or code wherever a developer needs to act. Copy sits with the code it copies, in the Code view, not in the example header.
- **Do** preserve semantic names, keyboard access, and visible focus states.
- **Do** use borders and offset shadows to explain structure and state.

### Don't:
- **Don't** replace reusable components with private screen-only controls.
- **Don't** use accent colors as decoration without an interaction or status meaning.
- **Don't** hide source examples behind fixed-height regions that clip wrapped code.
- **Don't** introduce soft, diffuse elevation that conflicts with the hard-edge visual language.
- **Don't** add a second component for a size or tone of an existing one. `CompactButton`, `AvatarGroupCompact`, `Notification`, `StatusBadge` and `TabMenuVertical` are deprecated for this reason.
