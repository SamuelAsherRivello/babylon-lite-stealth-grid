## Context

See proposal.md for motivation. C056's shared adjacency helper immediately calls roster attack APIs. Awareness currently stops movement whenever that helper claims an update. Goblin also initiates attacks through its behavior controller, and Archer has autonomous shooting logic inside its actor update. Preparation must cover those paths without letting one bypass or overwrite another.

The working tree includes ongoing C056, GridSpot, spatial, and awareness work. Use the current authoritative GridSpot and world-center accessors. Preserve existing uncommitted work and grid quantization.

## Goals / Non-Goals

**Goals:** One reusable player-attack preparation contract with per-actor adapters, exact arrival, and a single owner of movement and attack initiation each update.

**Non-Goals:** New attack ranges, changes to sheep/bush targeting, new Monk combat, changes to sprites or collider offsets, grid quantization changes, or a general navigation rewrite.

## Decisions

1. Represent preparation separately from the committed attacking state. Store the chosen cell, its center, player identity, and initiating eligibility rule. Capture the cell once; following a patrol waypoint or continually recapturing the cell could move the attack to another space. Existing attack locks start only after arrival.
2. Use a shared preparation coordinator for player-targeted decisions with roster adapters for eligibility, movement, heading, and attack commitment. Cover adjacency, Goblin's normal melee selection, and Archer's autonomous ranged decision. Keep actor-specific recovery and projectile release in their existing owners. Four unrelated implementations would invite inconsistent ordering.
3. Give preparation exclusive locomotion ownership while actor updates continue physics and animation. Distinguish preparing from attacking in the awareness handoff so its current unconditional stop does not cancel centering. Cancel obsolete routes when accepting preparation; avoid generic cancellation that clears Goblin recovery or the pending target. Perception can update, but cannot overwrite preparation movement or final facing.
4. Travel at existing movement speed using collision-aware movement and current cardinal-axis rules. Add a bounded destination step where needed so travel cannot exceed the remaining distance; resolve the final move through collision checks and commit the exact endpoint. A loose waypoint tolerance, raw position teleport, or art-only offset cannot satisfy exact physical centering. Both axes must reach center before attack initiation.
5. At arrival, refresh the player snapshot and validate the initiating attack rule, stop movement, update heading using existing roster direction conventions, then invoke exactly one attack adapter. No extra dwell is required. Ordinary movement-facing remains active during centering. Do not capture the final aim at the initial decision because the player may move before arrival.
6. Respect death, disposal, pause, protected actions, and displacement. Cancel invalidated preparation; use shared bounded blocked-movement recovery when obstructed and require a fresh attack decision after recovery. Tick each existing cooldown/recovery owner once per update. A permanently blocked center never authorizes an off-center attack.
7. C057 intentionally refines C056's immediate attack timing: adjacency immediately accepts preparation, while animation waits for exact arrival. During eventual spec synchronization, reconcile C056's next-update attack wording with this ordering, preserving adjacency priority, awareness independence, and all existing exclusions. Do not edit C056 or main specs during this proposal.

## Risks / Trade-offs

- Preparation and autonomous Archer shooting can both commit -> route every player attack trigger through the coordinator and assert one arrow per accepted attack.
- Awareness stop/cancel paths can erase centering -> test controller and actor update order together in all four awareness states.
- Small remaining distances can oscillate or trigger early attacks -> test large and small frame steps, both-axis offsets, collision-limited travel, and exact endpoint equality.
- Centering can invalidate pixel-range attacks -> revalidate existing eligibility instead of enlarging range or attacking a stale target.
- Ongoing C056 work can change integration points -> inspect the live code again before implementation and reconcile specification timing at synchronization.

## Migration Plan

Write failing behavior tests first, integrate the coordinator and movement endpoint support, and rerun focused character/perception tests plus the production build. Verify actual rendered center-then-face-then-attack sequences for all four combat enemies in the existing browser harness, including Archer arrow release. No assets or persistent data require migration. Any reversal uses additive corrective edits and preserves Git history.
