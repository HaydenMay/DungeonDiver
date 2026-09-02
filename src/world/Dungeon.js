import * as THREE from "three";

const ROOM_SIZE = 16;
const WALL_HEIGHT = 5.5;

const STONE_COLORS = [0x4a4440, 0x3a3530, 0x554c44, 0x463f38, 0x3f3a36];

function hash(x, y, seed) {
  let n = (x * 374761393 + y * 668265263 + seed * 1442695040) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  n = n ^ (n >>> 16);
  return (n >>> 0) / 0xffffffff;
}

function smooth(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function createStoneMaterial(seed, baseColor = 0x55504a) {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  const c = new THREE.Color(baseColor);
  const r0 = c.r * 255;
  const g0 = c.g * 255;
  const b0 = c.b * 255;
  const s = (seed % 11) + 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size * 6;
      const ny = y / size * 6;
      const n1 = smooth(nx, ny, s);
      const n2 = smooth(nx * 2.3, ny * 2.3, s + 7);
      const n3 = smooth(nx * 4.7, ny * 4.7, s + 13);
      let v = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
      const tileX = Math.floor(x / (size / 4));
      const tileY = Math.floor(y / (size / 4));
      const localX = (x % (size / 4)) / (size / 4);
      const localY = (y % (size / 4)) / (size / 4);
      if (localX < 0.04 || localX > 0.96 || localY < 0.04 || localY > 0.96) {
        v *= 0.55;
      }
      const crackMask = Math.max(
        Math.abs(smooth(nx * 1.5, ny * 1.5, s + 21) - 0.5),
        Math.abs(smooth(nx * 2.2, ny * 2.2, s + 33) - 0.5)
      );
      if (crackMask < 0.05) v *= 0.7;
      const shade = 0.55 + v * 0.6;
      data[idx] = Math.min(255, Math.max(0, r0 * shade));
      data[idx + 1] = Math.min(255, Math.max(0, g0 * shade));
      data[idx + 2] = Math.min(255, Math.max(0, b0 * shade));
      data[idx + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.needsUpdate = true;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  return tex;
}

export function createDungeon(scene, rng) {
  const group = new THREE.Group();
  scene.add(group);

  const rooms = [];
  let currentRoom = null;
  let roomCounter = 0;

  let _cachedWallTex = null;
  let _cachedFloorTex = null;
  let _cachedCeilingTex = null;

  function clear() {
    while (group.children.length) {
      const c = group.children.pop();
      group.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
        else c.material.dispose();
      }
    }
    if (_cachedWallTex) { _cachedWallTex.dispose(); _cachedWallTex = null; }
    if (_cachedFloorTex) { _cachedFloorTex.dispose(); _cachedFloorTex = null; }
    if (_cachedCeilingTex) { _cachedCeilingTex.dispose(); _cachedCeilingTex = null; }
    rooms.length = 0;
    currentRoom = null;
    roomCounter = 0;
  }

  function makeWallMaterial() {
    if (!_cachedWallTex) _cachedWallTex = createStoneMaterial(roomCounter, 0x8a7a68);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8a7a68,
      roughness: 0.92,
      metalness: 0.04,
      map: _cachedWallTex,
    });
    mat.map.repeat.set(2, 1.4);
    return mat;
  }

  function makeFloorMaterial() {
    if (!_cachedFloorTex) _cachedFloorTex = createStoneMaterial(roomCounter + 7, 0x6a5a48);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x6a5a48,
      roughness: 0.85,
      metalness: 0.06,
      map: _cachedFloorTex,
    });
    mat.map.repeat.set(4, 4);
    return mat;
  }

  function makeCeilingMaterial() {
    if (!_cachedCeilingTex) _cachedCeilingTex = createStoneMaterial(roomCounter + 3, 0x4a3e34);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4a3e34,
      roughness: 1.0,
      metalness: 0.0,
      map: _cachedCeilingTex,
    });
    mat.map.repeat.set(4, 4);
    return mat;
  }

  function makeBlock(w, h, d, x, y, z, mat) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  function buildRoom(index, isStart = false) {
    const root = new THREE.Group();
    root.userData.roomIndex = index;
    root.userData.torches = [];
    root.userData.fires = [];
    root.userData.bounds = new THREE.Box3(
      new THREE.Vector3(-ROOM_SIZE / 2, 0, -ROOM_SIZE / 2),
      new THREE.Vector3(ROOM_SIZE / 2, WALL_HEIGHT, ROOM_SIZE / 2)
    );

    const floorMat = makeFloorMaterial();
    floorMat.map.repeat.set(4, 4);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);

    const ceilMat = makeCeilingMaterial();
    ceilMat.map.repeat.set(4, 4);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = WALL_HEIGHT;
    root.add(ceil);

    const wallMat = makeWallMaterial();
    wallMat.map.repeat.set(2, 1.4);

    const wallThickness = 0.6;
    const t = wallThickness;
    const halfRoom = ROOM_SIZE / 2;

    root.userData.obstacles = [];

    function addWallBox(cx, cz, w, d, h = WALL_HEIGHT) {
      root.userData.obstacles.push({
        minX: cx - w / 2,
        maxX: cx + w / 2,
        minZ: cz - d / 2,
        maxZ: cz + d / 2,
      });
    }

    addWallBox(0, -halfRoom, ROOM_SIZE, t);
    addWallBox(0, halfRoom, ROOM_SIZE, t);
    addWallBox(-halfRoom, 0, t, ROOM_SIZE);
    addWallBox(halfRoom, 0, t, ROOM_SIZE);

    root.add(makeBlock(ROOM_SIZE, WALL_HEIGHT, t, 0, WALL_HEIGHT / 2, -halfRoom, wallMat));
    root.add(makeBlock(ROOM_SIZE, WALL_HEIGHT, t, 0, WALL_HEIGHT / 2, halfRoom, wallMat));
    root.add(makeBlock(t, WALL_HEIGHT, ROOM_SIZE, -halfRoom, WALL_HEIGHT / 2, 0, wallMat));
    root.add(makeBlock(t, WALL_HEIGHT, ROOM_SIZE, halfRoom, WALL_HEIGHT / 2, 0, wallMat));

    const stepCount = 8 + rng.int(0, 6);
    for (let i = 0; i < stepCount; i++) {
      const angle = (i / stepCount) * Math.PI * 2;
      const minX = -halfRoom + 1;
      const maxX = halfRoom - 1;
      const px = rng.range(minX, maxX);
      const pz = rng.range(minX, maxX);
      const px2 = rng.range(minX, maxX);
      const pz2 = rng.range(minX, maxX);
      const bw = rng.range(1.4, 3.2);
      const bh = rng.range(1.0, 2.4);
      const bd = rng.range(1.4, 3.2);
      const useFirst = rng.chance(0.5);
      const bx = useFirst ? px : px2;
      const bz = useFirst ? pz : pz2;
      const useW = useFirst;
      const w = useW ? bw : bd;
      const d = useW ? bd : bw;
      if (Math.abs(bx) < 2 && Math.abs(bz) < 2) continue;
      root.add(makeBlock(w, bh, d, bx, bh / 2, bz, wallMat));
      addWallBox(bx, bz, w, d);
    }

    const torchCount = rng.int(3, 5);
    for (let i = 0; i < torchCount; i++) {
      const angle = (i / torchCount) * Math.PI * 2 + rng.range(0, 0.4);
      const r = ROOM_SIZE * 0.45;
      const tx = Math.cos(angle) * r;
      const tz = Math.sin(angle) * r;
      addTorch(root, tx, tz);
    }

    root.position.y = 0;
    return root;
  }

  function addTorch(parent, x, z) {
    const torchGroup = new THREE.Group();
    torchGroup.position.set(x, 0, z);

    const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 2.4, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 1.2;
    post.castShadow = true;
    torchGroup.add(post);

    const bracketGeo = new THREE.BoxGeometry(0.4, 0.05, 0.05);
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.7, metalness: 0.6 });
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    bracket.position.y = 2.3;
    torchGroup.add(bracket);

    const flameGeo = new THREE.SphereGeometry(0.18, 8, 6);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      transparent: true,
      opacity: 0.95,
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 2.5;
    flame.scale.y = 1.6;
    torchGroup.add(flame);

    const haloGeo = new THREE.SphereGeometry(0.32, 8, 6);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff8822,
      transparent: true,
      opacity: 0.45,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 2.5;
    torchGroup.add(halo);

    const light = new THREE.PointLight(0xffaa55, 65, 22, 1.5);
    light.position.y = 2.6;
    light.castShadow = false;
    torchGroup.add(light);

    parent.add(torchGroup);

    parent.userData.torches.push({ group: torchGroup, light, flame, halo, baseY: 2.5 });
  }

  function buildStartingRoom() {
    roomCounter = 0;
    const r = buildRoom(0, true);
    group.add(r);
    rooms.push(r);
    currentRoom = r;
  }

  function buildNextRoom() {
    roomCounter++;
    const r = buildRoom(roomCounter, false);
    group.add(r);
    rooms.push(r);
    currentRoom = r;
    return r;
  }

  function update(dt) {
    if (!currentRoom) return;
    const t = performance.now() * 0.001;
    for (const torch of currentRoom.userData.torches) {
      const flicker = 0.85 + Math.sin(t * 12 + torch.group.position.x) * 0.05 + Math.sin(t * 23 + torch.group.position.z) * 0.07;
      torch.light.intensity = 60 * flicker + Math.sin(t * 7 + torch.group.position.z * 0.5) * 5;
      torch.flame.scale.set(
        1 + Math.sin(t * 14 + torch.group.position.x) * 0.08,
        1.6 + Math.sin(t * 11 + torch.group.position.z) * 0.15,
        1 + Math.sin(t * 16 + torch.group.position.y) * 0.08
      );
      torch.flame.material.opacity = 0.85 + Math.sin(t * 9 + torch.group.position.x) * 0.1;
      torch.halo.material.opacity = 0.4 + Math.sin(t * 8 + torch.group.position.z) * 0.08;
    }
  }

  return {
    group,
    get currentRoom() { return currentRoom; },
    get rooms() { return rooms; },
    ROOM_SIZE,
    WALL_HEIGHT,
    clear,
    buildStartingRoom,
    buildNextRoom,
    update,
  };
}
