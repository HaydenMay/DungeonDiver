import * as THREE from "three";

const KNIGHT_HEIGHT = 1.6;
const KNIGHT_RADIUS = 0.42;
const WALK_SPEED = 4.0;
const RUN_SPEED = 6.4;
const TURN_SPEED = 9;

const _camFwd = new THREE.Vector3();
const _camRgt = new THREE.Vector3();

export function createKnight(scene, app = null) {
  const group = new THREE.Group();
  const visual = new THREE.Group();
  group.add(visual);

  const skin = new THREE.MeshStandardMaterial({
    color: 0xf2c39a,
    roughness: 0.7,
  });
  const tunic = new THREE.MeshStandardMaterial({
    color: 0x6b8c5a,
    roughness: 0.8,
  });
  const belt = new THREE.MeshStandardMaterial({
    color: 0x4a3220,
    roughness: 0.7,
  });
  const pant = new THREE.MeshStandardMaterial({
    color: 0x6b4a2a,
    roughness: 0.85,
  });
  const boot = new THREE.MeshStandardMaterial({
    color: 0x3a2410,
    roughness: 0.9,
  });
  const glove = new THREE.MeshStandardMaterial({
    color: 0x4a2a18,
    roughness: 0.85,
  });
  const hair = new THREE.MeshStandardMaterial({
    color: 0xc9a76b,
    roughness: 0.9,
  });
  const eye = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.4,
  });
  const eyeWhite = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.3,
  });
  const mouth = new THREE.MeshStandardMaterial({
    color: 0x6a3530,
    roughness: 0.6,
  });
  const iron = new THREE.MeshStandardMaterial({
    color: 0xc8c8d0,
    roughness: 0.35,
    metalness: 0.85,
  });
  const grip = new THREE.MeshStandardMaterial({
    color: 0x3a2810,
    roughness: 0.85,
  });
  const goldTrim = new THREE.MeshStandardMaterial({
    color: 0xd9a14a,
    roughness: 0.3,
    metalness: 0.8,
  });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.85, 0.5), tunic);
  torso.position.y = 0.95;
  torso.castShadow = true;
  visual.add(torso);

  const beltM = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.54), belt);
  beltM.position.y = 0.6;
  beltM.castShadow = true;
  visual.add(beltM);

  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.1, 0.04),
    goldTrim,
  );
  buckle.position.set(0, 0.6, 0.27);
  visual.add(buckle);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.52, 0.5), skin);
  head.position.y = 1.66;
  head.castShadow = true;
  visual.add(head);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hair,
  );
  hairCap.position.y = 1.78;
  hairCap.castShadow = true;
  visual.add(hairCap);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeWhite);
  eyeL.position.set(-0.11, 1.7, 0.26);
  visual.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.11;
  visual.add(eyeR);

  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), eye);
  pupilL.position.set(-0.11, 1.7, 0.3);
  visual.add(pupilL);
  const pupilR = pupilL.clone();
  pupilR.position.x = 0.11;
  visual.add(pupilR);

  const mouthMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.025, 0.02),
    mouth,
  );
  mouthMesh.position.set(0, 1.58, 0.26);
  visual.add(mouthMesh);

  const armL = new THREE.Group();
  const armLMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.6, 0.22),
    tunic,
  );
  armLMesh.position.y = -0.3;
  armLMesh.castShadow = true;
  armL.add(armLMesh);
  const gloveL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), glove);
  gloveL.position.y = -0.7;
  gloveL.castShadow = true;
  armL.add(gloveL);
  armL.position.set(-0.5, 1.32, 0);
  visual.add(armL);

  const armR = new THREE.Group();
  const armRMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.6, 0.22),
    tunic,
  );
  armRMesh.position.y = -0.3;
  armRMesh.castShadow = true;
  armR.add(armRMesh);
  const gloveR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), glove);
  gloveR.position.y = -0.7;
  gloveR.castShadow = true;
  armR.add(gloveR);
  armR.position.set(0.5, 1.32, 0);
  visual.add(armR);

  const legL = new THREE.Group();
  const legLMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.55, 0.28),
    pant,
  );
  legLMesh.position.y = -0.275;
  legLMesh.castShadow = true;
  legL.add(legLMesh);
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.42), boot);
  bootL.position.set(0, -0.65, 0.04);
  bootL.castShadow = true;
  legL.add(bootL);
  legL.position.set(-0.2, 0.55, 0);
  visual.add(legL);

  const legR = new THREE.Group();
  const legRMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.55, 0.28),
    pant,
  );
  legRMesh.position.y = -0.275;
  legRMesh.castShadow = true;
  legR.add(legRMesh);
  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.42), boot);
  bootR.position.set(0, -0.65, 0.04);
  bootR.castShadow = true;
  legR.add(bootR);
  legR.position.set(0.2, 0.55, 0);
  visual.add(legR);

  const swordGroup = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.02), iron);
  blade.position.x = -0.55;
  blade.castShadow = true;
  swordGroup.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), iron);
  tip.position.x = -1.18;
  tip.rotation.z = Math.PI / 2;
  swordGroup.add(tip);
  const guard = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.32, 0.08),
    goldTrim,
  );
  guard.position.x = 0;
  guard.castShadow = true;
  swordGroup.add(guard);
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.04, 0.22, 8),
    grip,
  );
  handle.position.x = 0.15;
  handle.rotation.z = Math.PI / 2;
  swordGroup.add(handle);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), goldTrim);
  pommel.position.x = 0.28;
  swordGroup.add(pommel);
  swordGroup.position.set(0.0, -0.65, 0.18);
  swordGroup.rotation.x = -1.0;
  armL.add(swordGroup);

  const swordTip = new THREE.Object3D();
  swordTip.position.set(-1.25, 0, 0);
  swordGroup.add(swordTip);

  const hitSpark = new THREE.Group();
  const sparkGeo = new THREE.SphereGeometry(0.08, 6, 6);
  const sparkMat = new THREE.MeshBasicMaterial({
    color: 0xffd966,
    transparent: true,
    opacity: 0,
  });
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(sparkGeo, sparkMat.clone());
    s.position.set((i - 2) * 0.05, 1.2, 0.5);
    hitSpark.add(s);
  }
  visual.add(hitSpark);

  const shoulderLamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffd066 }),
  );
  shoulderLamp.position.set(0.42, 1.45, 0.1);
  visual.add(shoulderLamp);

  const lampHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffb050,
      transparent: true,
      opacity: 0.55,
    }),
  );
  lampHalo.position.copy(shoulderLamp.position);
  visual.add(lampHalo);

  const knightLight = new THREE.PointLight(0xfff0e0, 14, 12, 1.7);
  knightLight.position.set(0.42, 1.45, 0.1);
  knightLight.castShadow = false;
  visual.add(knightLight);

  const knightLightFill = new THREE.PointLight(0xffeac8, 5, 8, 2);
  knightLightFill.position.set(0, 1.4, 0.4);
  visual.add(knightLightFill);

  scene.add(group);

  const BASE_DAMAGE = 14;
  const BASE_DEFENSE = 0;
  const BASE_BLOCK = 0;
  const BASE_MAX_HP = 100;
  const BASE_SPEED = WALK_SPEED;
  const BASE_RUN_SPEED = RUN_SPEED;
  const BASE_CRIT = 0.05;
  const BASE_ATTACK_COOLDOWN = 0.42;
  const BASE_DODGE_COOLDOWN = 0.9;

  const state = {
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(),
    facingY: 0,
    targetFacing: 0,
    hp: BASE_MAX_HP,
    maxHp: BASE_MAX_HP,
    stamina: 100,
    maxStamina: 100,
    baseDamage: BASE_DAMAGE,
    baseDefense: BASE_DEFENSE,
    baseBlock: BASE_BLOCK,
    baseMaxHp: BASE_MAX_HP,
    baseSpeed: BASE_SPEED,
    baseRunSpeed: BASE_RUN_SPEED,
    baseCrit: BASE_CRIT,
    baseAttackCooldown: BASE_ATTACK_COOLDOWN,
    baseDodgeCooldown: BASE_DODGE_COOLDOWN,
    damage: BASE_DAMAGE,
    defense: BASE_DEFENSE,
    block: BASE_BLOCK,
    speed: BASE_SPEED,
    runSpeed: BASE_RUN_SPEED,
    critChance: BASE_CRIT,
    attackCooldown: 0,
    attackDuration: 0,
    attackArcT: 0,
    hasHitThisSwing: false,
    dodgeCooldown: 0,
    dodgeTime: 0,
    isAttacking: false,
    attackAngle: 0,
    invulnTime: 0,
    animTime: 0,
    sword: swordGroup,
    hitSpark,
    onDodge: null,
  };

  function recomputeStats() {
    state.damage = state.baseDamage;
    state.defense = state.baseDefense;
    state.block = state.baseBlock;
    state.maxHp = state.baseMaxHp;
    state.speedMult = 1.0;
    state.attackSpeedMult = 1.0;
    state.critChance = state.baseCrit;
    const equipped = app && app.run && app.run.state && app.run.state.equipped;
    if (equipped) {
      for (const item of Object.values(equipped)) {
        if (!item) continue;
        switch (item.stat) {
          case 'damage': state.damage += item.value; break;
          case 'defense': state.defense += item.value; break;
          case 'block': state.block += item.value; break;
          case 'hp': state.maxHp += item.value; break;
          case 'speed': state.speedMult += item.value; break;
          case 'attackSpeed': state.attackSpeedMult -= item.value; break;
          case 'critChance': state.critChance += item.value; break;
        }
      }
    }
    if (state.speedMult < 0.2) state.speedMult = 0.2;
    if (state.attackSpeedMult < 0.3) state.attackSpeedMult = 0.3;
    state.speed = state.baseSpeed * state.speedMult;
    state.runSpeed = state.baseRunSpeed * state.speedMult;
    if (state.hp > state.maxHp) state.hp = state.maxHp;
  }

  function getSwordTip() {
    const worldPos = new THREE.Vector3();
    swordTip.getWorldPosition(worldPos);
    return worldPos;
  }

  function getSwordBase() {
    const worldPos = new THREE.Vector3();
    swordGroup.getWorldPosition(worldPos);
    return worldPos;
  }

  function startAttack() {
    if (state.attackCooldown > 0) return false;
    if (state.dodgeTime > 0) return false;
    state.attackCooldown = state.baseAttackCooldown * state.attackSpeedMult;
    state.attackDuration = 0.42;
    state.attackArcT = 0;
    state.isAttacking = true;
    state.hasHitThisSwing = false;
    return true;
  }

  function tryDodge() {
    if (state.dodgeCooldown > 0 || state.stamina < 25) return false;
    state.dodgeCooldown = state.baseDodgeCooldown * state.attackSpeedMult;
    state.dodgeTime = 0.35;
    state.stamina = Math.max(0, state.stamina - 25);
    state.invulnTime = 0.32;
    state.onDodge && state.onDodge();
    return true;
  }

  function takeDamage(amount) {
    if (state.invulnTime > 0) return false;
    state.hp = Math.max(0, state.hp - amount);
    state.invulnTime = 0.4;
    if (state.hp <= 0) {
      visual.userData.dead = true;
    }
    return true;
  }

  function update(dt, axis, input) {
    state.animTime += dt;
    state.attackCooldown = Math.max(0, state.attackCooldown - dt);
    state.attackDuration = Math.max(0, state.attackDuration - dt);
    state.dodgeCooldown = Math.max(0, state.dodgeCooldown - dt);
    state.dodgeTime = Math.max(0, state.dodgeTime - dt);
    state.invulnTime = Math.max(0, state.invulnTime - dt);

    if (input.consumeAttack()) {
      startAttack();
    }
    if (input.consumeDodge()) {
      tryDodge();
    }

    if (state.stamina < state.maxStamina) {
      state.stamina = Math.min(state.maxStamina, state.stamina + dt * 22);
    }

    const moving = (axis.x !== 0 || axis.z !== 0) && state.dodgeTime === 0;
    const speed = input.state.sprint ? state.runSpeed : state.speed;

    let moveX = 0,
      moveZ = 0;
    if (moving) {
      _camFwd.setFromMatrixColumn(app.camera.matrixWorld, 2).negate();
      _camRgt.setFromMatrixColumn(app.camera.matrixWorld, 0);
      _camFwd.y = 0;
      _camRgt.y = 0;
      const fwdLen = Math.hypot(_camFwd.x, _camFwd.z);
      const rgtLen = Math.hypot(_camRgt.x, _camRgt.z);
      if (fwdLen > 0.0001) { _camFwd.x /= fwdLen; _camFwd.z /= fwdLen; }
      if (rgtLen > 0.0001) { _camRgt.x /= rgtLen; _camRgt.z /= rgtLen; }
      moveX = _camFwd.x * axis.z + _camRgt.x * axis.x;
      moveZ = _camFwd.z * axis.z + _camRgt.z * axis.x;
      const len = Math.hypot(moveX, moveZ);
      if (len > 0) {
        moveX = (moveX / len) * speed;
        moveZ = (moveZ / len) * speed;
        state.targetFacing = Math.atan2(moveX, moveZ);
      }
    } else if (state.dodgeTime > 0) {
      moveX = Math.sin(state.facingY) * 8;
      moveZ = Math.cos(state.facingY) * 8;
    }

    if (state.dodgeTime === 0) {
      state.position.x += moveX * dt;
      state.position.z += moveZ * dt;
    } else {
      state.position.x += moveX * dt * 1.1;
      state.position.z += moveZ * dt * 1.1;
    }

    const room = app && app.dungeon && app.dungeon.currentRoom;
    if (room && room.userData.obstacles) {
      const r = 0.45;
      for (const ob of room.userData.obstacles) {
        const cx = Math.max(ob.minX, Math.min(state.position.x, ob.maxX));
        const cz = Math.max(ob.minZ, Math.min(state.position.z, ob.maxZ));
        const dx = state.position.x - cx;
        const dz = state.position.z - cz;
        const distSq = dx * dx + dz * dz;
        if (distSq < r * r && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          state.position.x = cx + (dx / dist) * r;
          state.position.z = cz + (dz / dist) * r;
        } else if (distSq <= 0.0001) {
          state.position.x = ob.maxX + r;
        }
      }
    }

    group.position.copy(state.position);
    const facingDiff = Math.atan2(
      Math.sin(state.targetFacing - state.facingY),
      Math.cos(state.targetFacing - state.facingY),
    );
    state.facingY += facingDiff * Math.min(1, dt * TURN_SPEED);
    visual.rotation.y = state.facingY;

    let legSwing = 0;
    if (moving) {
      const freq = input.state.sprint ? 9 : 6;
      legSwing = Math.sin(state.animTime * freq) * 0.7;
    }
    legL.rotation.x = legSwing;
    legR.rotation.x = -legSwing;
    const armSwingBase = moving ? -legSwing * 0.6 : 0;

    if (state.isAttacking) {
      const t = 1 - state.attackDuration / 0.42;
      state.attackArcT = t;
      const swipe = Math.sin(t * Math.PI) * 2.4;
      const windup = t < 0.18 ? (0.18 - t) * 4 : 0;
      armL.rotation.x = -0.8;
      armL.rotation.y = armSwingBase + swipe + 1.4 - windup;
      armL.rotation.z = 0.2;
      armR.rotation.x = -0.6;
      armR.rotation.y = armSwingBase + swipe * 0.4 + 0.8;
      armR.rotation.z = -0.3;
      const sway = Math.sin(t * Math.PI) * 0.2;
      visual.rotation.y = state.facingY + sway;

      if (state.attackDuration <= 0) {
        state.isAttacking = false;
        state.hasHitThisSwing = false;
      }
    } else {
      armL.rotation.x = armSwingBase;
      armL.rotation.y = 0;
      armL.rotation.z = 0;
      armR.rotation.x = armSwingBase;
      armR.rotation.y = 0;
      armR.rotation.z = 0;
    }

    if (state.dodgeTime > 0) {
      const t = 1 - state.dodgeTime / 0.35;
      visual.position.y = -0.05 + Math.sin(t * Math.PI) * 0.6;
      visual.rotation.z = Math.sin(t * Math.PI) * 0.3;
    } else {
      visual.position.y =
        Math.sin(state.animTime * 2.5) * (moving ? 0.05 : 0.02);
      visual.rotation.z = 0;
    }

    const inv =
      state.invulnTime > 0 && Math.floor(state.invulnTime * 18) % 2 === 0;
    visual.visible = !inv;

    hitSpark.children.forEach((s, i) => {
      s.material.opacity = Math.max(0, s.material.opacity - dt * 6);
      s.scale.setScalar(1 + (1 - s.material.opacity) * 2);
    });

    const flicker =
      0.9 +
      Math.sin(state.animTime * 11) * 0.05 +
      Math.sin(state.animTime * 17) * 0.05;
    knightLight.intensity = 13 * flicker + Math.sin(state.animTime * 7) * 1;
    knightLightFill.intensity = 4.5 * flicker;
    lampHalo.material.opacity = 0.5 + Math.sin(state.animTime * 9) * 0.08;
    lampHalo.scale.setScalar(1 + Math.sin(state.animTime * 8) * 0.06);

    visual.updateWorldMatrix(true, true);
  }

  function flashHit() {
    hitSpark.children.forEach((s, i) => {
      s.material.opacity = 1;
      s.scale.setScalar(1);
    });
  }

  function reset() {
    recomputeStats();
    state.hp = state.maxHp;
    state.stamina = state.maxStamina;
    state.attackCooldown = 0;
    state.attackDuration = 0;
    state.dodgeCooldown = 0;
    state.dodgeTime = 0;
    state.invulnTime = 0;
    state.isAttacking = false;
    state.position.set(0, 0, -7);
    state.facingY = 0;
    state.targetFacing = 0;
    group.position.copy(state.position);
    visual.rotation.set(0, 0, 0);
    visual.visible = true;
  }

  return {
    group,
    visual,
    state,
    position: state.position,
    facingY: 0,
    getFacingY() {
      return state.facingY;
    },
    update,
    takeDamage,
    startAttack,
    tryDodge,
    flashHit,
    getSwordTip,
    getSwordBase,
    reset,
    recomputeStats,
  };
}
