## Why

Collider mode needs a direct visual explanation of each character's perception geometry and the grid spot currently triggering detection. This makes the centralized gameplay system inspectable while keeping user-facing perception display out of scope.

## What Changes

- Render every living detector's Visual and Audio Perception only while Collider mode is enabled.
- Draw centered 50%-cell triangles for perception grid spots.
- Use a 4px white line for Visual Perception and a 2px purple line for Audio Perception.
- Use thin lines for inactive perception cells and double thickness for actively detected cells.
- Render overlapping Visual and Audio indicators independently.
- Consume the centralized system's read-only geometry and active-detection snapshot.

## Capabilities

### New Capabilities

- `character-perception-debug-rendering`: Collider-mode visualization of perception geometry and active detections.

### Modified Capabilities

None.

## Impact

Likely affects the existing collider diagnostic canvas, main render/update integration, and UI tests. It adds no dependency and does not add runtime user-facing inspection or interaction.
