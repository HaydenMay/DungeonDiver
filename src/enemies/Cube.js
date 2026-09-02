import * as THREE from "three";

const _tmpToPlayer = new THREE.Vector3();
const _tmpDir = new THREE.Vector3();

export function createCube(group, rng, camera) {
  const root = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x4488dd,
    roughness: 0.18,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
    emissive: 0x224488,
    emissiveIntensity: 0.45,
  });

  const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), bodyMat);
  cube.position.y = 0.75;
  cube.castShadow = true;
  cube.receiveShadow = true;
  root.add(cube);

  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7 })
  );
  inner.position.y = 0.75;
  root.add(inner);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfafafa });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  for (let i = 0; i < 2; i++) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
    e.position.set(i === 0 ? -0.32 : 0.32, 1.05, 0.71);
    root.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), pupilMat);
    p.position.set(i === 0 ? -0.32 : 0.32, 1.05, 0.78);
    root.add(p);
  }

  const hpBar = new THREE.Group();
  const hpBg = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.08, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x111111 })
  );
  hpBg.position.y = 1.65;
  hpBar.add(hpBg);
  const hpFill = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.06, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xc33a2a })
  );
  hpFill.position.y = 1.65;
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
    hp: 60,
    maxHp: 60,
    attackDamage: 10,
    attackCooldown: 0,
    attackTime: 0,
    dealtDamageThisSwing: false,
    hitFlash: 0,
    deathTime: 0,
    animTime: 0,
    speed: 1.6,
    aggroRange: 8,
    attackRange: 1.6,
    type: "cube",
    cube, inner, hpBar, hpFill,
    bodyMat,
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
      const t = Math.min(1, state.deathTime / 1.0);
      const s = 1 - t;
      root.scale.set(s, s, s);
      bodyMat.opacity = 0.85 * s;
      bodyMat.transparent = true;
      cube.position.y = 0.75 * s;
      inner.position.y = 0.75 * s;
      root.traverse((o) => {
        if (o.material && o.userData.baseOpacity !== undefined) {
          o.material.opacity = o.userData.baseOpacity * s;
        }
      });
      if (state.deathTime > 1.2) state.shouldDespawn = true;
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
      state.velocity.multiplyScalar(0.7);
    } else {
      state.velocity.multiplyScalar(0.8);
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
      root.rotation.y += diff * Math.min(1, dt * 4);
    }

    const t = state.animTime * 1.5;
    const wobble = 1 + Math.sin(t) * 0.05;
    cube.scale.set(wobble, 1 / wobble * 0.95 + 0.1, wobble);
    inner.rotation.y = t * 0.5;
    inner.rotation.x = t * 0.3;

    state.attackCooldown = Math.max(0, state.attackCooldown - dt);
    state.attackTime = Math.max(0, state.attackTime - dt);
    if (dist <= state.attackRange && state.attackCooldown <= 0) {
      state.attackCooldown = 1.4;
      state.attackTime = 0.5;
    }
    if (state.attackTime > 0) {
      const at = 1 - state.attackTime / 0.5;
      const pulse = 1 + Math.sin(at * Math.PI) * 0.18;
      cube.scale.set(pulse, pulse, pulse);
    }

    state.hitFlash = Math.max(0, state.hitFlash - dt);
    bodyMat.color.setHex(state.hitFlash > 0 ? 0xaaddff : 0x4488dd);

    const hpPct = state.hp / state.maxHp;
    hpFill.scale.x = Math.max(0, hpPct);
    hpFill.position.x = -(1 - hpPct) * 0.39;
    if (camera) hpBar.quaternion.copy(camera.quaternion);
  }

  function dispose() {
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }

  return { group: root, state, update, takeDamage, dispose, type: "cube" };
}
