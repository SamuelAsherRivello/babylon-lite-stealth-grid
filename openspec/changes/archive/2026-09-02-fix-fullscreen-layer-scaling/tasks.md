## 1. Viewport Contract

- [x] C040-T001 Inventory all canvas, engine, CSS frame, and pointer resize paths and verify the documented coordinate boundaries
- [x] C040-T002 Add reusable viewport configuration for logical width/height, 9:16 aspect ratio, uniform-fit/letterbox mode, layer selectors, and QA flag; verify with unit tests

## 2. Babylon and Debug Rendering

- [x] C040-T003 Configure Babylon's render surface from the shared contract and prevent automatic CSS resizing from changing logical dimensions; verify backing dimensions at runtime
- [x] C040-T004 Align the debug canvas to the same visible rectangle and logical transform; verify grid boundaries overlay rendered tiles at 100% browser zoom
- [x] C040-T005 Remove competing per-object or per-layer resize paths without changing logical object positions; verify source audit and runtime coordinates

## 3. Interaction and Compatibility

- [x] C040-T006 Convert pointer coordinates through the shared visible rectangle; verify clicking a gold pickup after resizing collects that pickup
- [x] C040-T007 Preserve DOM/UI behavior while consuming shared game-frame geometry; verify existing UI smoke checks remain valid

## 4. QA

- [x] C040-T008 Add enabled QA diagnostics with four-corner markers and runtime logs for game-frame, tilemap, debug, and DOM rectangles; verify at Chrome and Edge zoom 80%, 100%, and 125%
- [ ] C040-T009 Run focused tests, production build, and real-browser screenshot QA at multiple viewport sizes and confirm all layers remain aligned; leave diagnostics enabled for user approval
