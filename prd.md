# Command Line Wizard — Combat System (Revised)

## Core Combat Philosophy

- Player has **3 abilities total**:
  - **2 Normal Attacks**
  - **1 Ultimate (charge-based)**
- Emphasis:
  - fast decision-making
  - chaining abilities
  - positioning + timing
- No ability overload → clarity and mastery

---

# Player Combat Kit

## Ability Slots

| Slot | Type          | Key | Description |
|------|--------------|-----|------------|
| 1    | Normal Attack | J   | Primary attack (low cooldown) |
| 2    | Normal Attack | K   | Secondary attack (utility / combo) |
| 3    | Ultimate      | L   | High-impact ability (charge required) |

---

## Ultimate Charge System

- Ultimate builds via:
  - hitting enemies
  - dealing damage
- Charge stored as:

```text
ULT: [████░░░░░░]
Rules
Each hit = +X charge
Full bar required to cast
Resets to 0 after use
Normal Attack Types (5 Total)

Players choose 2 per run

1. Fire Bolt

Type: Projectile
Cooldown: Low

Behavior:

Fast straight projectile
On hit: small explosion (radius 1)

Strengths:

Reliable damage
Good for finishing enemies

Weakness:

Requires aim
2. Lightning Beam

Type: Instant line

Behavior:

Hits in straight line
Chains to nearby enemies (2 max)

Strengths:

Multi-target
Great positioning reward

Weakness:

Narrow hitbox
3. Frost Wave

Type: Cone

Behavior:

Hits area in front of player
Applies slow

Strengths:

Crowd control
Defensive spacing

Weakness:

Short range
4. Arcane Orb

Type: Delayed projectile

Behavior:

Slow-moving orb
Explodes after delay or impact

Strengths:

Area denial
Setup tool

Weakness:

Harder to time
5. Dash Strike

Type: Movement + damage

Behavior:

Dash forward
Damages enemies along path

Strengths:

Mobility + offense
High skill expression

Weakness:

Risky positioning
Ultimate Abilities (3 Options)

Players choose 1 per run

1. Nova Cataclysm

Type: Full-screen burst

Behavior:

Short wind-up (2 ticks)
Expanding explosion from player outward

Effect:

Massive AOE damage
Clears nearby enemies

Visual (ASCII):

  .
 ...
.....
*****
.....

Use Case:

Panic button
Wave clear
2. Thunder Collapse

Type: Targeted strike

Behavior:

Mark target area
After delay → multiple lightning strikes

Effect:

High burst damage
Chains between enemies

Strength:

Rewards prediction
3. Frozen Domain

Type: Area control

Behavior:

Creates zone around player
Enemies inside:
slowed heavily
take damage over time

Effect:

Defensive + control

Use Case:

Survive pressure
Control space
HP System
Player HP Bar
HP: [████████░░] 80/100
Behavior
Damage reduces HP
No regeneration (MVP)
Death = instant run reset
Enemy HP (Simplified)
No full bar display
Visual indicators:
e → healthy
E → damaged
X → hit (flash)
Combat Dynamics
Skill Expression Comes From:
1. Positioning
lining up beams
avoiding projectiles
2. Timing
cooldown management
ultimate usage
3. Sequencing
combo abilities:
slow → beam
orb → dash
UI Layout (Combat-Focused)
[ GRID ]        [ UI PANEL ]

                HP:  ████████░░
                ULT: ████░░░░░░

                J: Fire Bolt (0)
                K: Frost Wave (2)

                U: Nova (READY)

                ----------------
                Hit enemy +12
                You dash
                Enemy casts
Design Constraints (IMPORTANT)
Max 3 abilities → maintain clarity
Every ability must:
be directional
have clear visual feedback
No stat bloat (no +5 damage, etc.)
Success Criteria

Combat feels:

fast
readable
skill-based

Player experiences:

“clean combo”
“clutch dodge”
“well-timed ultimate”