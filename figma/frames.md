# Frames — mobile layout specs (390 x 844)

1) Home (priority)
- Top bar (64px): center couple header
  - Names: Playfair Display 22pt, deep brown (#3B2E2C)
  - Small heart glyph between names (use heart SVG)
  - Subheading: "Together 2y 3m" Inter 14pt, 80% opacity
- Hero section:
  - HeartPhoto 220 x 220 centered
  - Countdown (serif heavy): 48pt, centered
  - Subtitle: "until next meeting" Inter 14pt
  - Local times: two chips side-by-side (chip: 140 x 40, radius 12)
- Cards stack (vertical with 16px gap; padding 20px):
  - Love Note card (preview + Open)
  - Today's Challenge (title + Start)
  - Today's Question (question text + Answer CTA)
- Floating affordance: small + in bottom-right for quick add

2) Together
- Segmented control under top bar: Questions | Challenges | Love Notes
- List: each item is card (radius 14), left-aligned title, small status badge on right (You / Partner / Both)
- Item detail: question/challenge modal with text area for answer and Submit button

3) Games
- 2x2 grid cards with icon, title, 1-line description
- Tap into game flow (turn-based modal)

4) Memories
- Top toggle: Grid / Timeline
- Grid: 2-column masonry with 12px gutters
- FAB bottom-right: Add Memory (photo + caption)
- Timeline: date headers and stacked memory cards

5) Us (Settings)
- Couple profile at top (heart photo + names + short bio)
- List of settings:
  - Relationship start date (editable)
  - Next meeting date (editable)
  - Time zones (pickers)
  - Notifications toggles
  - Privacy & account controls

Spacing & rhythm
- Page padding: 20px
- Card spacing: 16px vertical
- Use plenty of whitespace — avoid crowded lists

Accessibility
- Ensure text sizes scale with device settings
- Provide alt text for images and semantic labels for interactive elements
