import * as THREE from "three";

export function createCombatSystem(app) {
  const HIT_RANGE = 1.4;
  const tmpBase = new THREE.Vector3();
  const tmpTip = new THREE.Vector3();
  const tmpDiff = new THREE.Vector3();
  const tmpClosest = new THREE.Vector3();
  const tmpKnockback = new THREE.Vector3();

  function segmentPointDistance(p, a, b) {
    const ab = tmpDiff.subVectors(b, a);
    const ap = new THREE.Vector3().subVectors(p, a);
    const t = Math.max(0, Math.min(1, ap.dot(ab) / ab.dot(ab)));
    tmpClosest.copy(a).addScaledVector(ab, t);
    return tmpClosest.distanceTo(p);
  }

  function update(dt) {
    const knight = app.knight;
    const dungeon = app.dungeon;
    const enemies = app.enemies;
    const loot = app.loot;
    const run = app.run;

    for (const enemy of enemies.getAlive()) {
      if (enemy.state.hp <= 0) continue;
      if (enemy.state.attackTime > 0) {
        const t = 1 - enemy.state.attackTime / 0.4;
        const d = enemy.state.position.distanceTo(knight.position);
        if (t > 0.45 && t < 0.6 && d < 1.4 && !enemy.state.dealtDamageThisSwing) {
          const effectiveDamage = Math.max(1, enemy.state.attackDamage - (knight.state.defense || 0));
          if (knight.takeDamage(effectiveDamage)) {
            knight.flashHit();
          }
          enemy.state.dealtDamageThisSwing = true;
        }
      }
      if (enemy.state.attackTime <= 0) {
        enemy.state.dealtDamageThisSwing = false;
      }
      if (enemy.state.position.distanceTo(knight.position) < 0.6 && enemy.state.attackCooldown <= 0) {
        enemy.state.attackCooldown = 0.8;
        enemy.state.attackTime = 0.4;
        enemy.state.dealtDamageThisSwing = false;
      }
    }

    if (knight.state.isAttacking && !knight.state.hasHitThisSwing) {
      tmpTip.copy(knight.getSwordTip());
      tmpBase.copy(knight.getSwordBase());

      for (const enemy of enemies.getAlive()) {
        if (enemy.state.hp <= 0) continue;
        if (enemy.state.deathTime > 0) continue;

        const center = enemy.state.position.clone();
        center.y = 0.8;
        const distToSegment = segmentPointDistance(center, tmpBase, tmpTip);
        const distToPlayer = enemy.state.position.distanceTo(knight.position);

        if (distToSegment < HIT_RANGE && distToPlayer < 2.5) {
          let dmg = knight.state.damage;
          if (app.rng.next() < (knight.state.critChance || 0)) {
            dmg = Math.floor(dmg * 2);
          }
          const killed = enemy.takeDamage(dmg);
          knight.state.hasHitThisSwing = true;

          tmpKnockback.subVectors(enemy.state.position, knight.position).setY(0).normalize();
          const kbStrength = killed ? 2.5 : 1.4;
          enemy.state.knockbackTime = 0.25;
          enemy.state.knockback.copy(tmpKnockback).multiplyScalar(kbStrength);
          enemy.state.hitFlash = 0.2;

          knight.flashHit();

          if (killed) {
            run.onEnemyKilled(enemy);
            loot.dropLoot(enemy.state.position.clone(), enemy.type, app.rng);
            enemy.state.deathTime = 0.001;
          }
          break;
        }
      }
    }
  }

  return { update };
}
