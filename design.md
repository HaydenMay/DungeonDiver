Chibi Knight Dungeon Game

Living Game Design Document — Early Concept

Status: Early Prototype / Pre-Production
Engine: Godot 4
Perspective: 3D Third-Person
Genre: Action Roguelite / Dungeon Crawler / Loot-Based RPG

⸻

1. Game Concept

A stylized 3D action game where the player controls a cute, chibi-style knight who enters dangerous dungeon rooms, fights enemies with melee weapons, discovers equipment, and builds a temporary character build during each run.

The defining progression mechanic is that the player can only carry two pieces of equipment from a completed run into the next run.

The game should be approachable and fun visually, while combat and equipment choices provide meaningful depth.

The initial development goal is deliberately small:

Get a chibi knight moving, animate him, give him a sword, and make him hit a target.

Everything else comes later.

⸻

2. Core Gameplay Philosophy

The game should revolve around three major pillars:

⚔️ Skill-Based Combat

The player should feel like they are actually controlling a knight rather than simply watching numbers trade damage.

🎒 Risky Loot Decisions

Finding a powerful item should create an interesting decision because the player cannot keep everything.

🧩 Build Experimentation

Equipment, armor sets, and limited perks should allow players to create different builds without permanently locking them into one playstyle.

⸻

3. Core Gameplay Loop

The eventual gameplay loop is:

Prepare Knight
↓
Choose limited Perks
↓
Enter Dungeon
↓
Fight through Rooms
↓
Find Equipment
↓
Modify Current Build
↓
Continue Deeper
↓
Elite / Boss
↓
Complete Run or Die
↓
If Successful: Choose Two Equipment Pieces
↓
Permanent Progression
↓
Prepare Next Run

The central loop can be summarized as:

Fight → Loot → Build → Risk → Escape → Keep Two → Repeat

⸻

4. Player Character

The player controls a small, chunky chibi knight.

Base Character Design

The base character is intentionally simple because equipment will eventually be layered over the character.

Current visual design:

* Bald head
* Large chibi proportions
* Simple expressive face
* Basic long-sleeved shirt/tunic
* Brown gloves
* Neutral/khaki pants
* Brown medieval-style boots
* Belt
* No weapon
* No helmet
* No armor
* No cape
* No major accessories

The base outfit functions as the character’s underlayer.

The goal is for armor and equipment to dramatically change the knight’s appearance while retaining the same underlying character.

⸻

5. Character Asset Pipeline

Current planned asset pipeline:

Meshy
→ Generate character concept/reference
→ Generate 3D character
→ Remesh/optimize

Mixamo
→ Auto-rig character
→ Provide humanoid skeleton
→ Provide initial animation library

Blender
→ Asset cleanup and modification when necessary

Godot
→ Character controller
→ Animation system
→ Equipment
→ Combat
→ Game logic

Current character model

The Meshy-generated character initially contained approximately:

* 3.08 million faces
* 1.54 million vertices

Meshy’s Remesh tool was used to reduce the model to approximately 30K faces, while retaining the overall character appearance and clothing boundaries.

The 30K version currently looks good enough to continue prototyping.

⸻

6. Animation Direction

For the initial prototype, Mixamo is the primary animation source.

The current strategy is:

Meshy character
→ Export FBX
→ Upload to Mixamo
→ Mixamo auto-rig
→ Apply animations
→ Import into Godot

The character should have one primary skeleton that is reused by its animations.

Initial animation set:

Movement

* Idle
* Walk
* Run

Combat

Several combat/attack animations have already been obtained for testing.

Future animation needs may include:

* Light attacks
* Heavy attack
* Dodge
* Block
* Parry
* Hit reaction
* Death
* Combat idle
* Combat movement
* Turning
* Strafing

For initial movement testing, individual Idle / Walk / Run animations are preferred over building a large locomotion system.

Movement should initially be driven by Godot, with animation representing the movement rather than relying on root motion.

⸻

7. Modular Equipment

Equipment should not be permanently baked into the base character.

The intended structure is:

Base Knight

* Body
* Clothing
* Skeleton

↓

Equipment

* Helmet
* Chest armor
* Gloves/Gauntlets
* Boots/Leg armor
* Weapon
* Shield
* Accessories
* Potentially cape/back equipment

Equipment should be separate assets that can be swapped.

⸻

8. Equipment Attachment

Weapons are expected to be relatively straightforward.

The knight’s skeleton can contain attachment points such as:

* Right-hand weapon socket
* Left-hand shield socket
* Head/helmet attachment
* Back attachment
* Armor attachment regions

A weapon can therefore be replaced without changing the character model or animations.

Example:

Right Hand → Weapon Socket

↓

Iron Sword
Fire Sword
Lightning Sword
Axe
Hammer
etc.

The exact implementation will be determined during the prototype.

⸻

9. Armor System

Armor should eventually function as modular equipment layered over the base clothing.

The base clothing provides a complete appearance when no armor is equipped.

Armor sets can dramatically alter the knight’s silhouette.

Possible sets:

Guardian

Heavy defensive armor.

Berserker

Large aggressive armor focused on offense.

Assassin

Lightweight armor focused on mobility.

Mage

Fantasy armor/robes focused on special effects.

The exact sets are not yet designed.

⸻

10. Armor Set Bonuses

Armor sets may provide bonuses when multiple pieces from the same set are equipped.

Example:

Guardian Set

2 Pieces

Increased defense.

3 Pieces

Perfect blocks restore stamina.

4 Pieces

Perfect blocks trigger a counterattack.

Set bonuses are intended to encourage experimentation rather than requiring players to wear complete sets.

Mixed equipment should remain viable.

⸻

11. Equipment Rarity

Tentative rarity structure:

* ⚪ Common
* 🟢 Uncommon
* 🔵 Rare
* 🟣 Epic
* 🟠 Legendary

Higher rarity should not simply mean larger numerical stats.

Higher rarity should increasingly provide interesting mechanics and build-defining effects.

Example:

Legendary Storm Sword

Sword attacks occasionally release a chain lightning effect.

Legendary items should have the potential to significantly change how a build plays.

⸻

12. The Two-Item Carry System

The game’s defining progression mechanic.

At the end of a successful run, the player may select two pieces of equipment to carry into the next run.

Everything else found during that run is left behind.

Example:

A completed run produces:

* Legendary Sword
* Epic Helmet
* Rare Chest Armor
* Rare Gloves
* Epic Boots

The player chooses:

Legendary Sword + Epic Helmet

Those two items survive.

The rest is lost.

⸻

13. Equipment Persistence

Previously carried equipment remains available when beginning the next run.

Equipment discovered during the current run is temporary until the player successfully completes the run.

This creates an ongoing decision:

Is this new item good enough to replace one of my two carried items?

A player may carry an item for several runs and eventually abandon it for something better.

⸻

14. Death

Death should create meaningful risk.

If the player dies during a run:

Current-run equipment is lost.

Previously secured equipment remains.

This creates a distinction between:

Secured Equipment

The two pieces carried into the run.

Temporary Equipment

Everything discovered during the current run.

This gives powerful loot immediate excitement and risk.

⸻

15. Perks

Perks provide another layer of character customization.

Perks are intentionally limited.

The player should only be able to equip a small number at once.

Potential maximum:

Approximately 3 perk slots

The exact number is TBD.

Example perks:

Tough

Increased maximum HP.

Duelist

Increased damage when fighting a single enemy.

Scavenger

Increased chance of bonus loot.

Glass Knight

Increased damage but reduced maximum HP.

Last Stand

Increased damage while at low health.

Perks should eventually interact with equipment builds without overpowering them.

⸻

16. Permanent Progression

Permanent progression is separate from equipment.

The player can eventually improve their knight between runs using a permanent progression system.

Potential skill-tree categories:

Combat

* Attack damage
* Critical chance
* Dodge
* Stamina

Survival

* Starting HP
* Defense
* Healing

Fortune

* Better loot chances
* Treasure rewards
* Rarity improvements

Equipment Discovery

* Increased chance of high-tier swords
* Increased chance of high-tier armor
* More equipment choices

Examples:

Better Blades I
Increased chance of finding Rare+ swords.

Toughness I
Increased starting HP.

Permanent progression should improve opportunities without eliminating the importance of player skill or run-specific decisions.

⸻

17. Dungeon Structure

The dungeon is expected to consist of individual rooms rather than one continuous environment.

Potential room types:

⚔️ Combat Room
💀 Elite Room
💰 Treasure Room
❤️ Healing Room
🛒 Shop
❓ Event Room
👑 Boss Room

Eventually, the player may choose between multiple paths.

Example:

Combat
→ Combat / Treasure choice
→ Elite
→ Shop
→ Boss

The exact dungeon structure is TBD.

⸻

18. Combat

Combat is one of the most important systems and has intentionally not been fully designed yet.

Potential core actions:

* Light attack
* Heavy attack
* Dodge
* Block
* Parry

Potential resources:

* Health
* Stamina

Combat should emphasize:

* Timing
* Positioning
* Enemy attack readability
* Hit reactions
* Impact feedback

Potential combat feedback:

* Hit sparks
* Sound effects
* Sword trails
* Hit-stop
* Knockback
* Camera shake
* Enemy stagger
* Damage feedback

The exact combat system will be designed after the basic movement/attack prototype works.

⸻

19. Enemies

The first prototype enemy will not be an AI enemy.

The first target is essentially a punching bag.

The purpose is to test:

Sword → collision → damage → hit reaction

Eventually, enemies may include:

* Goblin
* Skeleton
* Archer
* Shield enemy
* Heavy enemy
* Mage
* Other fantasy creatures

Enemy variety should focus on interesting combinations rather than simply having a huge enemy count.

⸻

20. Bosses

Bosses are planned as larger encounters with unique attack patterns.

They should test skills learned during normal rooms.

Potential boss designs may use exaggerated chibi proportions and personalities.

Bosses are a future system and are not part of the initial prototype.

⸻

21. Art Direction

The game should have a:

Cute + stylized + colorful fantasy aesthetic.

Characters should use:

* Chunky proportions
* Rounded geometry
* Clear silhouettes
* Exaggerated weapons and armor
* Simple readable shapes

The contrast between the tiny knight and oversized weapons/armor should be part of the game’s visual identity.

⸻

22. Development Philosophy

Development should proceed in small vertical slices.

Do not build the complete game at once.

Each milestone should prove that the previous system works.

Prototype 0

Knight Movement

* Import character
* Third-person camera
* Idle
* Walk
* Run
* Basic movement

Prototype 1

Sword

* Sword model
* Weapon attachment
* Attack animation

Prototype 2

Punching Bag

* Target
* Hit detection
* Health
* Damage
* Hit reaction

Prototype 3

Basic Enemy

* Enemy movement
* Enemy attack
* Player damage
* Death

Prototype 4

First Room

* Room
* Enemy encounter
* Door/room completion
* Reward

Only after these fundamentals are enjoyable should the larger systems be developed.

⸻

23. Current Immediate Goal

The project is currently at the character prototype stage.

The immediate goal is:

Get the Meshy-generated chibi knight into Godot with a Mixamo skeleton and working movement animations.

Then:

Give him a sword and make him hit a stationary target.

No loot system.

No dungeon generation.

No skill tree.

No perks.

No bosses.

No complicated UI.

No permanent progression.

Those systems remain part of the future design, but they should not interfere with establishing the game’s fundamental combat feel.

⸻

24. Future Design Questions

The following still need to be decided:

Combat

* Exact attack system
* Combo structure
* Heavy attacks
* Dodge
* Block
* Parry
* Stamina
* Hit-stop
* Lock-on
* Camera behavior

Equipment

* Exact equipment slots
* Weapon types
* Armor slots
* Stat system
* Affixes
* Set bonuses
* Cursed equipment
* Legendary effects

Runs

* Run length
* Number of rooms
* Number of floors
* Room selection
* Shops
* Healing
* Events
* Boss structure

Progression

* Permanent currency
* Skill-tree structure
* Perk slots
* Perk acquisition
* Unlocks

Content

* Enemy roster
* Boss roster
* Biomes
* Dungeon themes
* NPCs
* Hub

These should be designed after the combat prototype proves itself.

⸻

25. Current Project Principle

The project should always prioritize:

Make the core interaction fun before adding complexity.

The first successful version of the game does not need to be a dungeon crawler.

It needs to be:

A cute knight

→ moving around

→ swinging a sword

→ hitting something

→ and making the player want to swing the sword again.

Everything else is built around that.