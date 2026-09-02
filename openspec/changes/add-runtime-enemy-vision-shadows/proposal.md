## Why

Enemy visual perception is currently represented by internal geometry and debug outlines, but normal gameplay does not make the visible sight path legible to the player. Adding the supplied tile shadow to each unobstructed perceived grid cell gives players an immediate, readable view of enemy sight while preserving the existing Collider-mode diagnostics.

## What Changes

- Add the supplied 64x64 shadow asset as `public/assets/terrain/tile-shadow.png`.
- Render a centered shadow in every unobstructed grid cell in each living enemy's visual perception range during normal gameplay.
- Stop rendering shadows at terrain or living-character blockers; do not render cells beyond the first blocker.
- Apply the existing visual perception falloff: 40%, 30%, 20%, and 10% by distance.
- Keep the same shadow rendering available whenever Collider mode renders, alongside the existing perception outlines and markers.
- Keep rendering driven by the centralized read-only perception snapshot and preserve independent overlays for multiple enemies.

## Capabilities

### New Capabilities

- `runtime-enemy-vision-shadows`: Runtime and Collider-mode rendering of unobstructed enemy visual-perception cells using distance-faded tile shadows.

### Modified Capabilities

None.

## Impact

This affects the perception rendering helpers and the main debug/game rendering integration. It adds one static PNG asset and no dependencies or gameplay API changes. Existing perception calculations, blocker rules, Collider-mode outlines, and active detection markers remain in place.
