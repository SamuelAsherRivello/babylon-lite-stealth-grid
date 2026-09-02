## 1. Counter UI

- [x] C053-T001 Add a testable DOM gold-counter module that formats `gold: 00/00`, initializes the total and collected value, and verify its unit/UI tests pass
- [x] C053-T002 Add upper-left header styling and mount the counter directly below release metadata, verifying DOM order and responsive layout tests

## 2. Gameplay Integration

- [x] C053-T003 Count the level’s starting gold and connect the existing player gold-pickup collection transition to the counter, verifying initialization and one-shot increment tests
- [x] C053-T004 Verify the full existing test suite and a real-browser level-start smoke check show the counter beneath the version line and update after collection without changing level completion behavior
