import * as THREE from "three";

const _tmpToPlayer = new THREE.Vector3();
const _tmpDir = new THREE.Vector3();

export function createGoblin(group, rng, camera) {
  const root = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x4ea83a, roughness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c5a1f, roughness: 0.85 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x6b4a26, roughness: 0.9 });
  const eyeM = new THREE.MeshStandardMaterial({ color: 0xf2d24a, emissive: 0x806012, emissiveIntensity: 0.6, roughness: 0.4 });
  const tooth = new THREE.MeshStandardMaterial({ color: 0xe6d8b0, roughness: 0.5 });
  const iron = new THREE.MeshStandardMaterial({ color: 0xb5b5bd, roughness: 0.4, metalness: 0.8 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.32), cloth);
  torso.position.y = 0.65;
  torso.castShadow = true;
  root.add(torso);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.36), skin);
  head.position.y = 1.08;
  head.castShadow = true;
  root.add(head);

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.24), skin);
  snout.position.set(0, 1.0, 0.22);
  snout.castShadow = true;
  root.add(snout);

  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 4), skin);
  earL.position.set(-0.2, 1.28, 0);
  earL.rotation.z = -0.3;
  root.add(earL);
  const earR = earL.clone();
  earR.position.x = 0.2;
  earR.rotation.z = 0.3;
  root.add(earR);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeM);
  eyeL.position.set(-0.09, 1.12, 0.22);
  root.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.09;
  root.add(eyeR);

  const toothL = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4), tooth);
  toothL.position.set(-0.04, 0.95, 0.34);
  toothL.rotation.x = Math.PI;
  root.add(toothL);
  const toothR = toothL.clone();
  toothR.position.x = 0.04;
  root.add(toothR);

  const armL = new THREE.Group();
  const aLM = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.14), skin);
  aLM.position.y = -0.2;
  aLM.castShadow = true;
  armL.add(aLM);
  armL.position.set(-0.28, 0.9, 0);
  root.add(armL);

  const armR = new THREE.Group();
  const aRM = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.14), skin);
  aRM.position.y = -0.2;
  aRM.castShadow = true;
  armR.add(aRM);

  const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.02), iron);
  dagger.position.y = -0.5;
  armR.add(dagger);
  const dTip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), iron);
  dTip.position.y = -0.66;
  armR.add(dTip);
  armR.position.set(0.28, 0.9, 0);
  root.add(armR);

  const legL = new THREE.Group();
  const lLM = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.4, 0.16), dark);
  lLM.position.y = -0.2;
  lLM.castShadow = true;
  legL.add(lLM);
  legL.position.set(-0.12, 0.4, 0);
  root.add(legL);

  const legR = new THREE.Group();
  const lRM = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.4, 0.16), dark);
  lRM.position.y = -0.2;
  lRM.castShadow = true;
  legR.add(lRM);
  legR.position.set(0.12, 0.4, 0);
  root.add(legR);

  const weaponHit = new THREE.Group();
  weaponHit.position.y = 0.9;
  root.add(weaponHit);

  const hpBar = new THREE.Group();
  const hpBg = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.08, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x111111 })
  );
  hpBg.position.y = 1.5;
  hpBar.add(hpBg);
  const hpFill = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.06, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xc33a2a })
  );
  hpFill.position.y = 1.5;
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
    hp: 38,
    maxHp: 38,
    attackDamage: 7,
    attackCooldown: 0,
    attackTime: 0,
    dealtDamageThisSwing: false,
    hitFlash: 0,
    deathTime: 0,
    animTime: 0,
    speed: 2.4,
    aggroRange: 9,
    attackRange: 1.4,
    armL, armR, legL, legR, head, dagger,
    hpBar, hpFill,
    weaponHit,
    type: "goblin",
    tier: 0,
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
      state.velocity.multiplyScalar(0.8);
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
      root.rotation.y += diff * Math.min(1, dt * 6);
    }

    const moving = state.velocity.lengthSq() > 0.1;
    if (moving) {
      const swing = Math.sin(state.animTime * 9) * 0.7;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing * 0.5;
      armR.rotation.x = -swing * 0.5;
      root.position.y = Math.abs(Math.sin(state.animTime * 9)) * 0.06;
    } else {
      legL.rotation.x *= 0.8;
      legR.rotation.x *= 0.8;
      armL.rotation.x *= 0.8;
      armR.rotation.x *= 0.8;
      root.position.y = Math.sin(state.animTime * 2) * 0.02;
    }

    state.attackCooldown = Math.max(0, state.attackCooldown - dt);
    state.attackTime = Math.max(0, state.attackTime - dt);
    if (dist <= state.attackRange && state.attackCooldown <= 0) {
      state.attackCooldown = 1.1;
      state.attackTime = 0.35;
    }
    if (state.attackTime > 0) {
      const t = 1 - state.attackTime / 0.35;
      armR.rotation.x = -1.5 + Math.sin(t * Math.PI) * 1.5;
      dagger.rotation.x = -t * 1.4;
    }

    state.hitFlash = Math.max(0, state.hitFlash - dt);
    if (state.hitFlash > 0) {
      head.material.color.setHex(0xffffff);
    } else {
      head.material.color.setHex(0x4ea83a);
    }

    const hpPct = state.hp / state.maxHp;
    hpFill.scale.x = Math.max(0, hpPct);
    hpFill.position.x = -(1 - hpPct) * 0.39;
    if (camera) hpBar.quaternion.copy(camera.quaternion);

    weaponHit.position.set(0, 0.6, 0.4);
    weaponHit.rotation.copy(root.rotation);
  }

  function dispose() {
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }

  return { group: root, state, update, takeDamage, dispose, type: "goblin" };
}
