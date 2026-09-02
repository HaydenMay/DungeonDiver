import * as THREE from "three";
import { createGoblin } from "./Goblin.js";
import { createCube } from "./Cube.js";
import { createSkeleton } from "./Skeleton.js";

export function createEnemyManager(scene, rng, camera) {
  const enemies = [];
  const sharedGroup = new THREE.Group();
  scene.add(sharedGroup);

  function clearAll() {
    while (enemies.length) {
      const e = enemies.pop();
      if (e.group.parent) e.group.parent.remove(e.group);
      e.dispose && e.dispose();
    }
  }

  function aliveCount() {
    return enemies.filter((e) => e.state.hp > 0).length;
  }

  function spawnForRoom(room, roomIndex) {
    const layout = pickLayout(roomIndex);
    for (let i = 0; i < layout.length; i++) {
      const spec = layout[i];
      let x, z;
      let attempts = 0;
      do {
        const angle = (i / layout.length) * Math.PI * 2 + rng.range(-0.5, 0.5);
        const r = 4.5 + rng.range(0, 2.0);
        x = Math.cos(angle) * r + rng.range(-1.5, 1.5);
        z = Math.sin(angle) * r + rng.range(-1.5, 1.5);
        attempts++;
      } while (Math.hypot(x, z + 7) < 3.0 && attempts < 10);

      let enemy;
      if (spec.type === "goblin") enemy = createGoblin(sharedGroup, rng, camera);
      else if (spec.type === "cube") enemy = createCube(sharedGroup, rng, camera);
      else if (spec.type === "skeleton") enemy = createSkeleton(sharedGroup, rng, camera);
      if (!enemy) continue;
      enemy.state.position.set(x, 0, z);
      enemy.state.roomIndex = roomIndex;
      enemy.group.position.set(x, 0, z);
      enemy.group.userData.spec = spec;
      enemies.push(enemy);
    }
  }

  function pickLayout(roomIndex) {
    if (roomIndex === 0) {
      return [
        { type: "goblin", tier: 0 },
        { type: "goblin", tier: 0 },
        { type: "cube", tier: 0 },
      ];
    }
    if (roomIndex === 1) {
      return [
        { type: "goblin", tier: 0 },
        { type: "goblin", tier: 0 },
        { type: "skeleton", tier: 0 },
      ];
    }
    if (roomIndex === 2) {
      return [
        { type: "skeleton", tier: 1 },
        { type: "goblin", tier: 1 },
        { type: "cube", tier: 1 },
      ];
    }
    if (roomIndex === 3) {
      return [
        { type: "skeleton", tier: 1 },
        { type: "skeleton", tier: 1 },
        { type: "goblin", tier: 1 },
        { type: "cube", tier: 1 },
      ];
    }
    return [
      { type: "goblin", tier: 2 },
      { type: "skeleton", tier: 2 },
      { type: "cube", tier: 2 },
      { type: "goblin", tier: 2 },
    ];
  }

  function update(dt, playerPos, room) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.update(dt, playerPos);
      if (e.state.shouldDespawn) {
        if (e.group.parent) e.group.parent.remove(e.group);
        e.dispose && e.dispose();
        enemies.splice(i, 1);
      }
    }
  }

  function getAlive() {
    return enemies.filter((e) => e.state.hp > 0);
  }

  function findNearest(pos, maxRange = 6) {
    let best = null;
    let bestD = maxRange;
    for (const e of enemies) {
      if (e.state.hp <= 0) continue;
      const d = e.state.position.distanceTo(pos);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  return {
    enemies,
    sharedGroup,
    spawnForRoom,
    update,
    clearAll,
    aliveCount,
    getAlive,
    findNearest,
  };
}
