# LayOffers Design Guidelines

## Design Approach

**Selected Approach:** Design System-Based with Productivity SaaS Inspiration

**Rationale:** LayOffers is a utility-focused, information-dense platform requiring clarity, trust, and efficiency. Drawing from Linear's clean aesthetic, Notion's content organization, and modern SaaS dashboard patterns to create a professional, credible hiring platform.

**Key Principles:**
- Clarity over cleverness: Information hierarchy must be immediately apparent
- Trust through professionalism: Clean, structured layouts build credibility
- Role-specific experiences: Each user type gets tailored interfaces
- Data-first design: Dashboards and metrics take center stage

---

## Typography

**Font Families:** 
- Primary: Inter (headings, UI, body) - professional, highly legible
- Monospace: JetBrains Mono (for project IDs, stats)

**Hierarchy:**
- Hero Headline: text-5xl md:text-6xl font-bold
- Section Headlines: text-3xl md:text-4xl font-bold
- Card Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Captions/Meta: text-sm text-opacity-70
- Stats/Numbers: text-4xl font-bold (monospace)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 8, 12, 16, 20, 24 for consistency
- Micro spacing: p-2, gap-2 (tight elements)
- Component padding: p-4, p-6 (cards, buttons)
- Section spacing: py-12, py-16, py-20 (vertical rhythm)
- Container gaps: gap-8, gap-12 (grids, flexbox)

**Grid System:**
- Dashboard layouts: grid-cols-1 md:grid-cols-3 lg:grid-cols-4
- Project cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stat displays: grid-cols-2 md:grid-cols-4
- Container max-width: max-w-7xl mx-auto px-4

---

## Component Library

### Homepage Components

**Hero Section (Full-width, 85vh):**
- Left-aligned headline + subheadline
- Two primary CTAs side-by-side (Candidates / Companies)
- Hero image: Professional workspace/collaboration scene (right side, 50% width on desktop)
- Trust indicator bar below hero: "Trusted by 500+ companies • $2M+ paid to candidates • 95% success rate"

**How It Works Section:**
- Two-column split: "For Candidates" | "For Companies"
- Each column: 4 numbered steps with icons
- Visual divider between columns
- CTA at bottom of each column

**Stats Showcase:**
- 4-column grid of key metrics (Projects Posted, Candidates Hired, Average Project Value, Success Rate)
- Large numbers with supporting text

**Testimonials:**
- 3-column grid of cards
- Avatar, quote, name, role, company
- Ratings display (5-star)

**Final CTA Section:**
- Centered, full-width
- Headline + supporting text + dual CTAs
- Newsletter signup embedded

### Dashboard Components

**Sidebar Navigation:**
- Fixed left sidebar (w-64)
- Logo at top
- Icon + label navigation items
- Role indicator badge
- Profile dropdown at bottom

**Dashboard Cards:**
- Elevated cards with rounded-xl borders
- Header with title + action button
- Content area with appropriate data display
- Footer with metadata/timestamps

**Project Cards (Marketplace):**
- Grid layout
- Company logo + name
- Project title + brief description
- Payment amount (prominent, top-right)
- Skills tags (pill-shaped)
- Difficulty indicator
- Apply button (full-width at bottom)

**Submission Review Cards:**
- Candidate name + avatar
- Project deliverable preview/link
- Rating interface (star rating)
- Accept/Reject actions
- Feedback textarea

**Data Tables:**
- Striped rows for readability
- Sortable column headers
- Status badges (color-coded states)
- Action dropdowns in last column
- Pagination at bottom

### Forms & Inputs

**Form Layout:**
- Single column, max-w-md for short forms
- Two-column grid (md:grid-cols-2) for longer forms
- Labels above inputs (font-medium, mb-2)
- Helper text below inputs (text-sm, opacity-70)

**Input Styling:**
- Consistent height (h-12 for text inputs)
- Rounded borders (rounded-lg)
- Focus states with ring utility
- Disabled states clearly differentiated

### Buttons & CTAs

**Primary Buttons:** Large (px-8 py-4), rounded-lg, font-semibold
**Secondary Buttons:** Same size, outlined style
**Icon Buttons:** Square (w-10 h-10), centered icon
**Buttons on Images:** Backdrop blur (backdrop-blur-sm), semi-transparent background

### Navigation

**Top Navigation (Public Pages):**
- Logo left
- Links center
- Auth buttons right
- Sticky on scroll

**Dashboard Navigation:**
- Sidebar with grouped sections
- Active state clearly visible
- Hover states subtle

---

## Icons

**Icon Library:** Heroicons (via CDN)
- Navigation: outline style, 24px
- Cards/Features: solid style, 32px
- Buttons: outline style, 20px
- Inline text: outline style, 16px

---

## Animations

**Minimal, Purposeful Only:**
- Card hover: subtle lift (translate-y-1) + shadow increase
- Button hover: slight scale (scale-105)
- Page transitions: fade-in for dashboard views
- No scroll animations, parallax, or decorative motion

---

## Images

**Hero Image:** Professional workspace collaboration scene - right 50% of hero section (hidden on mobile, visible md:block)

**Dashboard Placeholders:** Candidate avatars throughout (use placeholder avatar service), company logos in project cards

**Empty States:** Illustration-style graphics for "No projects yet" / "No submissions" states

**Trust Elements:** Company logo grid on homepage if available (grayscale, 6-8 logos)

---

## Page-Specific Layouts

**Homepage:** Hero (85vh) → How It Works (2-col) → Stats (4-col) → Testimonials (3-col) → Final CTA
**Dashboards:** Sidebar + Main Content Area (grid of cards/tables based on role)
**Project Marketplace:** Filter sidebar (left, 20% width) + Project grid (right, 80% width, 3-col)
**Profile Pages:** Header card (avatar, stats) + Tabbed content (Projects, Ratings, Portfolio)

This design system creates a professional, trustworthy platform that prioritizes information clarity and user efficiency across all three user roles.