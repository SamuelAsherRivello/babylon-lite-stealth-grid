## 1. DOM Overlay Contract

- [x] 1.1 C041-T001 Inspect the existing DOM overlay structure and identify the visible game-rectangle anchor context; verify all five requested control areas are accounted for
- [x] 1.2 C041-T002 Add one shared 25 px logical inset for the DOM overlay and verify its top, right, bottom, and left anchor values are consistent

## 2. Corner and Unit Layout

- [x] 2.1 C041-T003 Anchor the version and settings controls to the upper-left and upper-right corners; verify their positions at 100% browser scale
- [x] 2.2 C041-T004 Anchor Move to the lower-left and group Item plus Attack as one lower-right unit; verify the unit remains together and inset from both lower edges

## 3. Resize and Browser-Zoom QA

- [ ] 3.1 C041-T005 Preserve existing control sizing and interaction behavior while applying the new anchors; verify keyboard and pointer interactions remain functional
- [ ] 3.2 C041-T006 Run focused tests and production build, then verify real-browser screenshots at 50%, 100%, and 150% browser scale with the four-edge inset and requested anchors
