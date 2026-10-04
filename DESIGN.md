# Design Brief

## Direction

Campus Commons — a calm, friendly editorial bulletin where students scan everything happening on campus in one place.

## Tone

Warm, human, information-first: restrained like a productivity tool but with the approachable character of a well-set campus newspaper.

## Differentiation

Every feed card carries a colored category rail plus a monospace date chip, so the whole hub is scannable at a glance; urgent/pinned items get a coral-to-red gradient rail and a soft pulse.

## Color Palette

| Token      | OKLCH       | Role                                    |
| ---------- | ----------- | --------------------------------------- |
| background | 0.985 0.006 210 | Soft cool off-white page canvas      |
| foreground | 0.22 0.02 220   | Primary text, deep slate-blue        |
| card       | 1.0 0.003 210   | Content surfaces, near-pure white    |
| primary    | 0.42 0.11 195   | Deep teal-pine — actions, active nav |
| accent     | 0.62 0.16 35    | Warm coral — highlights, urgent cues |
| muted      | 0.955 0.01 210  | Secondary surfaces, tags, dividers   |

Category coding: academic `0.55 0.11 195` (teal), exam `0.5 0.15 275` (indigo), fee `0.68 0.14 70` (amber), general `0.55 0.02 230` (slate), urgent `0.58 0.21 27` (red).

## Typography

- Display: Figtree — headings, card titles, nav; friendly geometric sans.
- Body: Figtree — paragraphs, labels, metadata; legible at small sizes.
- Mono: JetBrains Mono — dates, times, room codes, counts.
- Scale: hero `text-4xl md:text-5xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm md:text-base`.

## Elevation & Depth

Layered surfaces: white cards on a tinted canvas with `shadow-subtle`, rising to `shadow-elevated` on hover; urgent cards use `shadow-urgent` for a warm lift, never glow.

## Structural Zones

| Zone    | Background        | Border     | Notes                                      |
| ------- | ----------------- | ---------- | ------------------------------------------ |
| Header  | `bg-card`         | `border-b` | Sticky top bar, search + quick nav         |
| Sidebar | `bg-sidebar`      | `border-r` | Desktop nav; collapses to bottom bar mobile |
| Content | `bg-background`   | —          | Alternating `bg-muted/30` section bands    |
| Footer  | `bg-muted/40`     | `border-t` | Quiet links and campus contact info        |

## Spacing & Rhythm

Generous section gaps (`space-y-8`), tight card internals (`p-4 md:p-5`), 12px gaps between feed items; density tuned for scanning, not decoration.

## Component Patterns

- Buttons: `rounded-lg`, solid `bg-primary` for primary, outline for secondary, `hover:bg-primary/90` with `transition-smooth`.
- Cards: `rounded-xl bg-card border shadow-subtle`, `hover:shadow-elevated` and `hover:-translate-y-0.5`.
- Badges: pill `rounded-full` category tags tinted with the category color at low opacity.
- Feed rail: 4px left rail colored by category; urgent uses `bg-gradient-urgent`.

## Motion

- Entrance: feed items `animate-fade-in-up` staggered ~40ms via inline delay.
- Hover: cards lift with `translate-y` + shadow, 300ms `transition-smooth`.
- Decorative: urgent dot `animate-pulse-urgent`; no bouncy or looping motion elsewhere.

## Constraints

- Use semantic tokens only — no raw hex, rgb, or arbitrary color classes.
- Light mode primary; dark mode intentionally tuned, not inverted.
- Mobile-first: single column, bottom nav on small screens, sidebar at `lg`.

## Signature Detail

The category color-rail + mono date chip on every card — a scannable "campus bulletin" system that makes the feed instantly legible.
