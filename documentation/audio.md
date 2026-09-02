# Sound effects

All files live in `public/audio/sfx`. Change assignments in `src/audio/sfx.js`.
The Settings SFX slider controls these sounds, including currently playing sounds.

| Event | File |
| --- | --- |
| Interactive button activation (mouse, touch, keyboard) | Click01.mp3 |
| Gold collected by contact or clicking | Pickup01.mp3 |
| Goal reached | LevelWin.wav |
| Player death begins | LevelLose.wav |
| Archer releases an arrow | Arrow01.mp3 |
| Goblin starts an accepted attack | Attack01.mp3 |
| Warrior starts an accepted attack | Attack02.mp3 |
| Lancer starts an accepted attack | Attack03.wav |
| Monk healing action | Attack04.mp3 |
| Suspicious (`?`) state entry | Alert01.mp3 at 0.65 playback rate |
| Investigating (`i`) state entry | Alert01.mp3 at 0.82 playback rate |
| Alert (`!`) state entry | Alert01.mp3 at original pitch (1.0) |
| Player enters a living bush sensor | Bush01.mp3 |

Perception sounds play on state changes, including calming down through the
levels, but not repeated detections in the same state or returning to NONE.
All three alert pitches play at 20% volume, multiplied by the SFX slider.
Pitch uses playback rate, so lower pitches also last longer. Bush contact plays
once on entry, not continuously while inside; leaving and re-entering plays it
again. NPC and enemy bush contact remains silent.

Attack05.mp3 is intentionally unused. The four non-archer assignments are
provisional for playtesting.

Current behavior limitation: Warrior and Lancer patrol AI does not call their
attack actions. Their attack callbacks are wired for when those actions run.
Monk has no attack action; Attack04 is wired to its existing `playHeal()` action,
which its current patrol controller also does not trigger. No new combat or AI
behavior is introduced by this sound integration.

Audio unlocks on the first pointer or keyboard interaction. Gameplay sounds
before that interaction are skipped, rather than replayed later in a burst.
Disabled/hidden/inert buttons and clicks on the game background do not play
the UI click. Gold clicked on the canvas plays only the pickup sound.
