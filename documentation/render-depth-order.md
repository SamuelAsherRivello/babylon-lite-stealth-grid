# Render Depth Order

Babylon Lite sprite-layer `order` is a flat numeric draw order: lower values
draw first. The game uses logical category bands and TileMap sub-Z values that
compile to those flat orders. CSS `z-index` is a separate DOM stack.

| Category | Base Z / CSS z-index | Reserved range |
| --- | ---: | ---: |
| TileMap | `0` | `0-99` |
| NPCs and creatures | `100` | `100-199` |
| Player | `200` | `200-299` |
| Projectiles | `300` | `300-399` |
| Gameplay effects | `400` | `400-499` |
| Foreground/cover | `500` | `500-599` |
| Persistent DOM UI | `1000` | `1000-1999` |
| Settings overlay | `2000` | `2000-2999` |
| Error overlay | `3000` | `3000+` |

TileMap base Z is `0`; its planned sub-Z values are background water `0`, foam
`10`, ground `20`, elevation shadows `30`, elevated terrain `40`, decorations
`50`, Y-sorted props `60`, and foreground artwork `70`.

Projectile-versus-gameplay-effect ordering is deliberately TBD. Both categories
retain space in `300-499` until a visual requirement decides their relationship.

Persistent UI is above Babylon content. The settings backdrop, window, and
controls are above persistent UI when open.
