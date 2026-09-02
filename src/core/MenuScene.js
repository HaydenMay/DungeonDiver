import * as THREE from "three";
import { createKnight } from "../character/Knight.js";

export function createMenuScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9aa0a8);

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.05,
    100
  );
  camera.position.set(0.6, 1.8, 4.2);
  camera.lookAt(-0.3, 0.9, 0);

  const ambient = new THREE.AmbientLight(0x6a7080, 0.7);
  scene.add(ambient);
  const hemi = new THREE.HemisphereLight(0x9aa8b8, 0x4a4038, 0.55);
  scene.add(hemi);

  const fillLight = new THREE.DirectionalLight(0xc8d0e0, 0.55);
  fillLight.position.set(-3, 4, 3);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0x8a7080, 0.3);
  rimLight.position.set(3, 3, -3);
  scene.add(rimLight);

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x6a655e,
    roughness: 0.85,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x7a756e,
    roughness: 0.92,
    metalness: 0.04,
  });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 0.4), wallMat);
  backWall.position.set(0, 2.5, -3);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const knight = createKnight(scene);
  knight.position.set(-0.2, 0, 0);
  knight.state.facingY = Math.PI * 0.78;
  knight.state.targetFacing = knight.state.facingY;

  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x6b4a2a,
    roughness: 0.9,
    metalness: 0.05,
  });
  const crateDark = new THREE.MeshStandardMaterial({
    color: 0x4a3320,
    roughness: 0.9,
    metalness: 0.05,
  });
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.9), crateMat);
  crate.position.set(0.55, 0.35, 0.05);
  crate.castShadow = true;
  crate.receiveShadow = true;
  scene.add(crate);

  const plank1 = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.05, 0.92), crateDark);
  plank1.position.set(0.55, 0.65, 0.05);
  scene.add(plank1);
  const plank2 = plank1.clone();
  plank2.position.set(0.55, 0.05, 0.05);
  scene.add(plank2);

  const fireGroup = new THREE.Group();
  fireGroup.position.set(-1.2, 0, 0.4);

  const logMat = new THREE.MeshStandardMaterial({
    color: 0x4a2f1a,
    roughness: 0.95,
    metalness: 0.05,
  });
  const logCharMat = new THREE.MeshStandardMaterial({
    color: 0x1a1008,
    roughness: 0.95,
    metalness: 0.05,
  });

  function makeLog(x, z, rotY) {
    const g = new THREE.Group();
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), logMat);
    log.rotation.z = Math.PI / 2;
    log.castShadow = true;
    g.add(log);
    const char1 = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 8), logCharMat);
    char1.rotation.z = Math.PI / 2;
    char1.position.x = 0.3;
    g.add(char1);
    const char2 = char1.clone();
    char2.position.x = -0.3;
    g.add(char2);
    g.position.set(x, 0.08, z);
    g.rotation.y = rotY;
    return g;
  }

  const logCount = 6;
  for (let i = 0; i < logCount; i++) {
    const angle = (i / logCount) * Math.PI * 2;
    const r = 0.18;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const rotY = angle + Math.PI / 2;
    fireGroup.add(makeLog(x, z, rotY));
  }

  const emberMat = new THREE.MeshBasicMaterial({
    color: 0xff5522,
    transparent: true,
    opacity: 0.85,
  });
  const emberGeo = new THREE.SphereGeometry(0.15, 8, 6);
  const ember = new THREE.Mesh(emberGeo, emberMat);
  ember.position.y = 0.18;
  ember.scale.set(1, 0.6, 1);
  fireGroup.add(ember);

  const flameGroup = new THREE.Group();
  flameGroup.position.y = 0.25;
  fireGroup.add(flameGroup);

  const flameOuter = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xff6622, transparent: true, opacity: 0.85 })
  );
  flameOuter.scale.set(0.7, 1.4, 0.7);
  flameOuter.position.y = 0.3;
  flameGroup.add(flameOuter);

  const flameMid = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.95 })
  );
  flameMid.scale.set(0.6, 1.6, 0.6);
  flameMid.position.y = 0.4;
  flameGroup.add(flameMid);

  const flameInner = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffdd66, transparent: true, opacity: 1.0 })
  );
  flameInner.scale.set(0.5, 1.7, 0.5);
  flameInner.position.y = 0.5;
  flameGroup.add(flameInner);

  const flameHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xff5522, transparent: true, opacity: 0.4 })
  );
  flameHalo.scale.set(0.8, 1.5, 0.8);
  flameHalo.position.y = 0.35;
  flameGroup.add(flameHalo);

  const fireLight = new THREE.PointLight(0xff8833, 22, 6, 1.6);
  fireLight.position.y = 0.6;
  fireLight.castShadow = true;
  fireLight.shadow.mapSize.set(512, 512);
  fireLight.shadow.bias = -0.002;
  fireGroup.add(fireLight);

  const fireLightFill = new THREE.PointLight(0xff6622, 8, 4, 2);
  fireLightFill.position.y = 0.3;
  fireGroup.add(fireLightFill);

  scene.add(fireGroup);

  const particleCount = 50;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = -1.2 + (Math.random() - 0.5) * 0.4;
    positions[i * 3 + 1] = Math.random() * 2;
    positions[i * 3 + 2] = 0.4 + (Math.random() - 0.5) * 0.4;
    velocities[i * 3] = (Math.random() - 0.5) * 0.15;
    velocities[i * 3 + 1] = 0.4 + Math.random() * 0.3;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    lifetimes[i] = Math.random();
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffaa44,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  let isActive = true;
  let cameraBreath = 0;

  function update(dt) {
    if (!isActive) return;
    const t = performance.now() * 0.001;

    const flicker = 0.85 + Math.sin(t * 12) * 0.05 + Math.sin(t * 23) * 0.07;
    fireLight.intensity = 20 * flicker + Math.sin(t * 7) * 3;
    fireLightFill.intensity = 7 * flicker;

    flameOuter.scale.y = 1.4 + Math.sin(t * 11) * 0.15;
    flameOuter.scale.x = 0.7 + Math.sin(t * 9) * 0.05;
    flameOuter.scale.z = 0.7 + Math.cos(t * 9) * 0.05;
    flameOuter.material.opacity = 0.8 + Math.sin(t * 7) * 0.1;

    flameMid.scale.y = 1.6 + Math.sin(t * 13) * 0.18;
    flameMid.material.opacity = 0.9 + Math.sin(t * 8) * 0.08;

    flameInner.scale.y = 1.7 + Math.sin(t * 15) * 0.2;
    flameInner.material.opacity = 0.95 + Math.sin(t * 6) * 0.05;

    flameHalo.material.opacity = 0.4 + Math.sin(t * 5) * 0.1;

    ember.material.opacity = 0.75 + Math.sin(t * 4) * 0.15;

    knight.state.animTime += dt;
    const breathe = Math.sin(t * 1.5) * 0.02;
    if (knight.visual) knight.visual.position.y = breathe;

    const idleSway = Math.sin(t * 0.8) * 0.015;
    if (knight.visual) knight.visual.rotation.z = idleSway;

    cameraBreath += dt;
    camera.position.y = 1.8 + Math.sin(t * 0.5) * 0.04;
    camera.lookAt(-0.3, 0.9, 0);

    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i * 3] * dt;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * dt;
      lifetimes[i] += dt * 0.2;
      if (pos[i * 3 + 1] > 2.5 || lifetimes[i] > 1.0) {
        pos[i * 3] = -1.2 + (Math.random() - 0.5) * 0.3;
        pos[i * 3 + 1] = Math.random() * 0.3;
        pos[i * 3 + 2] = 0.4 + (Math.random() - 0.5) * 0.3;
        velocities[i * 3] = (Math.random() - 0.5) * 0.15;
        velocities[i * 3 + 1] = 0.4 + Math.random() * 0.3;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
        lifetimes[i] = 0;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;
  }

  function render(renderer) {
    if (!isActive) return;
    renderer.render(scene, camera);
  }

  function setActive(v) {
    isActive = v;
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  return {
    scene,
    camera,
    update,
    render,
    setActive,
    onResize,
    knight,
  };
}
