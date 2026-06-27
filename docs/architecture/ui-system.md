# UI System

## Direction

Editorial Brutalism: strong typography, hard borders, visible grid logic, high contrast, and controlled accent colors.

## Tokens

Tokens live in `apps/web/src/styles/global.css`.

Core decisions:

- Background: warm editorial paper in light mode, deep neutral in dark mode
- Border: 2px hard border
- Shadow: hard offset shadow
- Radius: 4px
- Fonts: Newsreader, Public Sans, Space Mono

## Rules

- Use Astro components for static UI.
- Use React only for interactive islands.
- No nested UI cards.
- Keep body text readable before visual impact.
- Check 320px, 768px, 1024px, and 1440px widths.
- Respect `prefers-reduced-motion`.
