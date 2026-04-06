# Design System Specification: The Curated Gallery

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

Moving beyond standard e-commerce templates, this system treats the interface as a high-end gallery space. We do not simply "list" products; we exhibit them. The aesthetic is rooted in **Editorial Minimalism**—a philosophy where white space is treated as an active structural element rather than "empty" space. 

To achieve a signature look, we break the traditional rigid grid through intentional asymmetry, dramatic typography scales, and a "layered paper" approach to depth. This system is designed to disappear, allowing high-quality product photography to command the user's full attention while providing a frictionless, premium navigational experience.

---

## 2. Colors
Our palette is a sophisticated exercise in high-contrast restraint. We use a monochrome foundation to establish authority, punctuated by surgical applications of accent colors.

### The "No-Line" Rule
To maintain an editorial feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#f3f3f3) section should sit directly against a `surface` (#f9f9f9) background. Let the change in tone define the edge.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create "nested" depth:
- **Base Level:** `surface` (#f9f9f9) or `background` (#f9f9f9).
- **Secondary Sections:** `surface-container-low` (#f3f3f3) for subtle grouping.
- **High-Impact Cards:** `surface-container-lowest` (#ffffff) to make content "pop" against the gray base.
- **Interactive/Floating:** `surface-container-high` (#e8e8e8).

### The "Glass & Gradient" Rule
Flat design can often feel "cheap." To elevate the experience:
- **Glassmorphism:** Use semi-transparent `surface` colors with a 20px-40px backdrop-blur for sticky headers or floating navigation bars.
- **Signature Textures:** For main Call-to-Actions (CTAs), avoid flat black. Instead, apply a subtle linear gradient from `primary` (#000000) to `primary-container` (#1b1b1b). This adds a "weighted" feel to the button that implies luxury.

---

## 3. Typography
We utilize **Pretendard Variable** (or Inter) to create a hierarchy that feels like a fashion lookbook.

- **Display & Headlines:** Use `display-lg` (3.5rem) and `headline-lg` (2rem) with tight letter-spacing (-0.02em) to create "Hero" moments. These should be used for curated collections and editorial titles.
- **Body & Labels:** `body-md` (0.875rem) is our workhorse. For secondary metadata, use `label-sm` (0.6875rem) in `on-surface-variant` (#4c4546) to create a clear visual step-down.
- **The Contrast Principle:** Pair a massive `display-md` headline with a tiny, uppercase `label-md` category tag. This extreme contrast in scale is what separates "standard" UI from a signature brand identity.

---

## 4. Elevation & Depth
In this design system, shadows are a last resort. Depth is achieved through **Tonal Layering**.

### The Layering Principle
Stack surface tiers to create a soft, natural lift. Place a `surface-container-lowest` (#ffffff) card on top of a `surface-container-low` (#f3f3f3) background. This creates a "sheet on sheet" effect that is much cleaner than a drop shadow.

### Ambient Shadows
When a floating effect is required (e.g., a "Quick Add" modal), use an **Ambient Shadow**:
- **Color:** A tinted version of `on-surface` (#1a1c1c) at 4%–6% opacity.
- **Blur:** Large values (30px–60px) with 0 spread to mimic soft, natural light.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in an input field), use a **Ghost Border**: 
- Token: `outline-variant` (#cfc4c5).
- Opacity: 20%. 
- **Rule:** Never use 100% opaque borders for decorative containment.

---

## 5. Components

### Buttons
- **Primary:** Background `primary` (#000000), text `on-primary` (#ffffff). Corner radius: `sm` (0.125rem) for a sharp, architectural look.
- **Secondary:** Background `transparent`, "Ghost Border" `outline-variant` (#cfc4c5) at 40% opacity. 
- **Interaction:** On hover, the Primary button should subtly shift to `primary-container` (#1b1b1b).

### Cards & Lists
- **Rule:** Forbid the use of divider lines. 
- **Structure:** Separate items using the Spacing Scale (minimum 48px vertical gap). 
- **Imagery:** Cards should be image-first. Use a 3:4 aspect ratio for products to emphasize verticality and elegance.

### Input Fields
- **Style:** Underline-only or subtle "Ghost Border" containers.
- **Active State:** On focus, the border or underline transitions to `secondary` (#006876).
- **Error State:** Use `error` (#ba1a1a) text sparingly, paired with a `error_container` (#ffdad6) subtle background highlight.

### Admin Dashboard Elements
- **Data Cards:** Use `surface-container-lowest` (#ffffff) with a 2px `surface-container-high` (#e8e8e8) bottom accent.
- **Charts:** Use `secondary` (#006876) for primary data growth and `on-secondary-container` (#006573) for secondary metrics. Maintain the "No-Line" rule even in complex data visualizations.

---

## 6. Do's and Don'ts

### Do
- **Do** prioritize negative space. If a layout feels "full," remove an element.
- **Do** use asymmetric image placements to guide the eye through a narrative.
- **Do** ensure all typography is legible, maintaining a minimum 4.5:1 contrast ratio for body text using `on-surface` (#1a1c1c).

### Don't
- **Don't** use "Standard Gray" (#808080). Always use the system tokens like `outline` (#7e7576) or `on-surface-variant` (#4c4546) to ensure tonal harmony.
- **Don't** use rounded corners above `md` (0.375rem). This system is built on precision and sharp, clean edges.
- **Don't** use heavy, dark drop shadows. They muddy the minimalist aesthetic.
- **Don't** use divider lines to separate list items. Use whitespace or a subtle background shift.