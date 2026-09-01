## 1. Reaction model

- [x] C037-T001 Add validated `NONE`, `SUSPICIOUS`, `INVESTIGATING`, and `ALERT` perception states with profile-driven thresholds, configurable durations, and deterministic unit tests.
- [x] C037-T002 Add enemy-owned reaction snapshots containing `suspicionCell`, `alertedCell`, `lastKnownCell`, active state, and remaining timers; verify immutable snapshot behavior.

## 2. Enemy behavior integration

- [x] C037-T003 Route centralized visual/audio detections through per-enemy reaction profiles without replacing existing patrol, locomotion, or combat state machines; verify goblin, archer, and warrior integration tests.
- [ ] C037-T004 Implement bounded investigation movement and deterministic four-direction searching around the last-known cell, including blocked routes, configurable two-second facing phases, and de-escalation; verify unit tests for one-cell, two-cell, full-route, and search recovery outcomes.
- [ ] C037-T005 Implement alert pursuit with configurable randomized 3–5 second duration that tracks the player only while direct visual perception continues, updates alerted/last-known cells on renewed detection, then freezes the last-known cell; verify no-cheating pursuit tests.

## 3. Rendering and verification

- [ ] C037-T006 Render Babylon Lite Sprite2D expressions above each enemy (`?`, eye, `!`) following movement, with idle animation and white/yellow/red transition flashes; add debug keys 4/5/6/7 for all living enemies and verify presentation tests.
- [ ] C037-T007 Run the full unit suite, production build, OpenSpec validation, and real-browser stealth flow covering escalation, hiding, searching, and recovery; record results and any unrelated baseline failures.
