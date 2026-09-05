# Components — specs for Figma

General
- Background: use Color Style `Background` (#F6EFE6)
- Base text color: `Text` (#3B2E2C)
- Headings font: Playfair Display (weights 600–700)
- Body font: Inter (weights 400–600)
- Corner radii: cards 16px; buttons 12px
- Spacing grid: base unit 4px; use spacing tokens in design-tokens.json

Card (used across Home, Together, Games)
- Width: Full width container with 16–20px internal padding
- Radius: 16px
- Fill: cardBackground (#F9F6F2)
- Shadow: 0 6px 20px rgba(40,30,28,0.06)
- Contents: title (Playfair, 16–18), body (Inter, 14–16), 1 CTA (primary or secondary)

Primary Button
- Fill: accent (#E07A5F)
- Text: white, Inter Semibold, 16px
- Radius: 12px
- Padding: 12–14px vertical, 20–24px horizontal
- Hover/Press: accentMuted (#D9644A) or scale 0.98

Secondary Button
- Fill: transparent
- Border: 1px solid rgba(59,46,44,0.12)
- Text: text color (#3B2E2C), Inter 16px
- Radius: 12px

HeartPhoto (hero)
- Mask the image with heart-logo.svg
- Default size on Home: 220px
- Use slight elevation (shadow) and 2–3px offset

TabBar (bottom)
- Height: 72px
- Background: transparent (or background color)
- Active tint: accent
- Inactive: text (80% opacity)
- Icons: thin stroke, minimal

Micro-interactions
- Tap on card: soft scale 1.02 + crossfade 160ms
- Reveal answer: gentle heart pulse (scale 1.04) + fade-in
- Countdown changes: smooth number transition; no abrupt jumps

Exportable assets
- heart-logo.svg (component)
- Tab icons (24px stroke): home.svg, together.svg (two hearts), games.svg (dice), memories.svg (photo stack), us.svg (profile)
