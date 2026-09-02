import * as THREE from "three";

const _tmpToPlayer = new THREE.Vector3();
const _tmpDir = new THREE.Vector3();

export function createSkeleton(group, rng, camera) {
  const root = new THREE.Group();
  const bone = new THREE.MeshStandardMaterial({ color: 0xf2ead4, roughness: 0.55, metalness: 0.05 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x5a3a26, roughness: 0.95 });
  const eyeGlow = new THREE.MeshBasicMaterial({ color: 0xff4422 });
  const eyeGlowEm = new THREE.MeshStandardMaterial({ color: 0xff5533, emissive: 0xff3311, emissiveIntensity: 1.5 });
  const iron = new THREE.MeshStandardMaterial({ color: 0xb0b0b8, roughness: 0.4, metalness: 0.8 });

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.24), cloth);
  pelvis.position.y = 0.85;
  pelvis.castShadow = true;
  root.add(pelvis);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.2), bone);
  spine.position.y = 1.18;
  spine.castShadow = true;
  root.add(spine);

  const ribcage = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 6, 12, Math.PI), bone);
    rib.position.y = 0.35 - i * 0.08;
    rib.rotation.x = Math.PI / 2;
    ribcage.add(rib);
  }
  ribcage.position.y = 1.4;
  root.add(ribcage);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), bone);
  skull.position.y = 1.78;
  skull.castShadow = true;
  root.add(skull);

  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.16), bone);
  jaw.position.set(0, 1.66, 0.08);
  root.add(jaw);

  for (let i = 0; i < 4; i++) {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.02), bone);
    tooth.position.set((i - 1.5) * 0.04, 1.7, 0.18);
    root.add(tooth);
  }

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeGlowEm);
  eyeL.position.set(-0.08, 1.82, 0.18);
  root.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.08;
  root.add(eyeR);

  const armL = new THREE.Group();
  const upperL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), bone);
  upperL.position.y = -0.2;
  armL.add(upperL);
  const lowerL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.4, 6), bone);
  lowerL.position.y = -0.55;
  armL.add(lowerL);
  armL.position.set(-0.28, 1.55, 0);
  root.add(armL);

  const armR = new THREE.Group();
  const upperR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), bone);
  upperR.position.y = -0.2;
  armR.add(upperR);
  const lowerR = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.4, 6), bone);
  lowerR.position.y = -0.55;
  armR.add(lowerR);

  const sword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.02), iron);
  sword.position.y = -0.95;
  armR.add(sword);
  const sTip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), iron);
  sTip.position.y = -1.35;
  armR.add(sTip);
  const sGuard = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), iron);
  sGuard.position.y = -0.6;
  armR.add(sGuard);
  armR.position.set(0.28, 1.55, 0);
  root.add(armR);

  const legL = new THREE.Group();
  const uLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), bone);
  uLegL.position.y = -0.2;
  legL.add(uLegL);
  const lLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), bone);
  lLegL.position.y = -0.6;
  legL.add(lLegL);
  legL.position.set(-0.13, 0.75, 0);
  root.add(legL);

  const legR = new THREE.Group();
  const uLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), bone);
  uLegR.position.y = -0.2;
  legR.add(uLegR);
  const lLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), bone);
  lLegR.position.y = -0.6;
  legR.add(lLegR);
  legR.position.set(0.13, 0.75, 0);
  root.add(legR);

  const weaponHit = new THREE.Group();
  root.add(weaponHit);

  const hpBar = new THREE.Group();
  const hpBg = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.08, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x111111 })
  );
  hpBg.position.y = 2.05;
  hpBar.add(hpBg);
  const hpFill = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.06, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xc33a2a })
  );
  hpFill.position.y = 2.05;
  hpBar.add(hpFill);
  root.add(hpBar);

  group.add(root);
  root.traverse((o) => {
    if (o.material && o.material.opacity !== undefined) {
      o.userData.baseOpacity = o.material.opacity || 1;
    }
  });

  const state = {
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    knockback: new THREE.Vector3(),
    knockbackTime: 0,
    hp: 50,
    maxHp: 50,
    attackDamage: 12,
    attackCooldown: 0,
    attackTime: 0,
    dealtDamageThisSwing: false,
    hitFlash: 0,
    deathTime: 0,
    animTime: 0,
    speed: 2.0,
    aggroRange: 10,
    attackRange: 1.5,
    armL, armR, legL, legR, skull, sword,
    hpBar, hpFill, weaponHit,
    type: "skeleton",
    bodyMat: bone,
  };

  function takeDamage(amount) {
    state.hp -= amount;
    state.hitFlash = 0.18;
    if (state.hp <= 0) state.deathTime = 0.001;
    return state.hp <= 0;
  }

  function update(dt, playerPos) {
    state.animTime += dt;
    if (state.hp <= 0) {
      state.deathTime += dt;
      const t = Math.min(1, state.deathTime / 1.2);
      root.rotation.x = t * Math.PI / 2;
      root.position.y = -t * 0.4;
      const fade = 1 - Math.max(0, (t - 0.4) / 0.6);
      root.traverse((o) => {
        if (o.material && o.material.transparent !== undefined) {
          o.material.transparent = true;
          o.material.opacity = (o.userData.baseOpacity ?? 1) * fade;
        }
      });
      if (state.deathTime > 1.4) state.shouldDespawn = true;
      return;
    }

    _tmpToPlayer.subVectors(playerPos, state.position);
    const dist = _tmpToPlayer.length();
    _tmpDir.set(0, 0, 0);
    if (dist > 0) _tmpDir.copy(_tmpToPlayer).normalize();
    const dir = _tmpDir;

    if (dist < state.aggroRange && dist > state.attackRange) {
      state.velocity.x = dir.x * state.speed;
      state.velocity.z = dir.z * state.speed;
    } else if (dist <= state.attackRange) {
      state.velocity.multiplyScalar(0.6);
    } else {
      state.velocity.multiplyScalar(0.85);
    }

    state.position.x += state.velocity.x * dt;
    state.position.z += state.velocity.z * dt;

    if (state.knockbackTime > 0) {
      state.knockbackTime -= dt;
      const k = Math.max(0, state.knockbackTime / 0.25);
      state.position.x += state.knockback.x * dt * k;
      state.position.z += state.knockback.z * dt * k;
      state.knockback.multiplyScalar(0.85);
    }

    root.position.copy(state.position);

    if (state.velocity.lengthSq() > 0.01) {
      const targetY = Math.atan2(state.velocity.x, state.velocity.z);
      const diff = Math.atan2(Math.sin(targetY - root.rotation.y), Math.cos(targetY - root.rotation.y));
      root.rotation.y += diff * Math.min(1, dt * 5);
    }

    const moving = state.velocity.lengthSq() > 0.1;
    if (moving) {
      const swing = Math.sin(state.animTime * 8) * 0.6;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing * 0.4;
      armR.rotation.x = -swing * 0.4;
      root.position.y = Math.abs(Math.sin(state.animTime * 8)) * 0.05;
    } else {
      legL.rotation.x *= 0.8;
      legR.rotation.x *= 0.8;
      armL.rotation.x *= 0.8;
      armR.rotation.x *= 0.8;
      root.position.y = Math.sin(state.animTime * 1.5) * 0.015;
    }

    state.attackCooldown = Math.max(0, state.attackCooldown - dt);
    state.attackTime = Math.max(0, state.attackTime - dt);
    if (dist <= state.attackRange && state.attackCooldown <= 0) {
      state.attackCooldown = 1.2;
      state.attackTime = 0.4;
    }
    if (state.attackTime > 0) {
      const at = 1 - state.attackTime / 0.4;
      armR.rotation.x = -1.6 + Math.sin(at * Math.PI) * 1.6;
      sword.rotation.x = -at * 1.2;
    }

    state.hitFlash = Math.max(0, state.hitFlash - dt);
    skull.material.emissiveIntensity = state.hitFlash > 0 ? 2.5 : 1.4;

    const hpPct = state.hp / state.maxHp;
    hpFill.scale.x = Math.max(0, hpPct);
    hpFill.position.x = -(1 - hpPct) * 0.39;
    if (camera) hpBar.quaternion.copy(camera.quaternion);

    weaponHit.position.set(0.3, 1.2, 0);
    weaponHit.rotation.copy(root.rotation);
  }

  function dispose() {
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }

  return { group: root, state, update, takeDamage, dispose, type: "skeleton" };
}
