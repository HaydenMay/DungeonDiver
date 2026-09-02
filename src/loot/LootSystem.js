import * as THREE from "three";

export const RARITIES = {
  common: {
    color: 0xc8c8c8,
    name: "Common",
    weight: 60,
    label: "C",
    mult: 1.0,
  },
  uncommon: {
    color: 0x4ea84a,
    name: "Uncommon",
    weight: 25,
    label: "U",
    mult: 1.6,
  },
  rare: { color: 0x4488dd, name: "Rare", weight: 10, label: "R", mult: 2.4 },
  epic: { color: 0xa055dd, name: "Epic", weight: 4, label: "E", mult: 3.5 },
  legendary: {
    color: 0xe08030,
    name: "Legendary",
    weight: 1,
    label: "L",
    mult: 5.0,
  },
};

export const SLOTS = ["weapon", "armor", "helm", "shield", "ring", "amulet", "gloves", "boots"];

const NAMES = {
  weapon: {
    common: ["Iron Shortsword", "Old Dagger", "Rusty Axe", "Tarnished Mace"],
    uncommon: [
      "Steel Longsword",
      "Hunter's Blade",
      "Iron Spear",
      "Footman's Sword",
    ],
    rare: ["Knight's Greatsword", "Silver Sabre", "War Hammer", "Royal Blade"],
    epic: ["Lord's Greatsword", "Champion's Edge", "Mythril Cleaver"],
    legendary: ["Stormcaller", "Soul Reaper", "Doombringer"],
  },
  armor: {
    common: ["Padded Tunic", "Leather Vest", "Cloth Robes"],
    uncommon: ["Chainmail", "Studded Leather", "Hardened Coat"],
    rare: ["Knight's Plate", "Elven Mail", "Forge-Iron Cuirass"],
    epic: ["Royal Platemail", "Hero's Bulwark"],
    legendary: ["Dragonscale Armor", "Titan's Aegis"],
  },
  helm: {
    common: ["Cloth Cap", "Leather Hood"],
    uncommon: ["Iron Helm", "Hunter's Hood"],
    rare: ["Knight's Helm", "Silver Circlet"],
    epic: ["Crown of Valor", "Battle Visage"],
    legendary: ["Helm of the Wise", "Stormcrown"],
  },
  shield: {
    common: ["Wooden Buckler", "Tarnished Targe"],
    uncommon: ["Iron Round Shield", "Steel Kite"],
    rare: ["Knight's Bulwark", "Tower Shield"],
    epic: ["Aegis of Light", "Royal Crest"],
    legendary: ["Sunwarden", "Eternal Bulwark"],
  },
  ring: {
    common: ["Copper Band", "Worn Ring"],
    uncommon: ["Silver Ring", "Jade Band"],
    rare: ["Ruby Signet", "Sapphire Loop"],
    epic: ["Band of Might", "Ring of Wards"],
    legendary: ["Ring of the Storm", "Eternal Loop"],
  },
  amulet: {
    common: ["Bone Charm", "Tarnished Pendant"],
    uncommon: ["Silver Amulet", "Ember Locket"],
    rare: ["Sunstone Pendant", "Moonsilver Charm"],
    epic: ["Amulet of the Phoenix", "Talisman of Fury"],
    legendary: ["Heart of the Mountain", "Eye of the Storm"],
  },
  gloves: {
    common: ["Cloth Wraps", "Leather Gloves"],
    uncommon: ["Hunter's Gloves", "Studded Gauntlets"],
    rare: ["Knight's Gauntlets", "Silvered Handguards"],
    epic: ["Champion's Fists", "Stormgrip Gauntlets"],
    legendary: ["Hands of the Storm", "Titan's Grip"],
  },
  boots: {
    common: ["Worn Boots", "Cloth Shoes"],
    uncommon: ["Hunter's Boots", "Reinforced Boots"],
    rare: ["Knight's Sabatons", "Elven Boots"],
    epic: ["Boots of Swiftness", "Stormwalkers"],
    legendary: ["Windrunner's Boots", "Hermes' Steps"],
  },
};

const STATS = {
  weapon: { damage: [4, 8] },
  armor: { defense: [3, 6] },
  helm: { defense: [1, 3] },
  shield: { block: [8, 14], defense: [1, 3] },
  ring: { critChance: [0.01, 0.03] },
  amulet: { hp: [10, 20] },
  gloves: { attackSpeed: [0.04, 0.08] },
  boots: { speed: [0.04, 0.08] },
};

let nextId = 1;

function rollRarity(rng, tier = 0) {
  const adjusted = { ...RARITIES };
  const upgradeBoost = tier * 0.05;
  adjusted.uncommon.weight = Math.max(5, adjusted.uncommon.weight - tier * 3);
  adjusted.rare.weight += tier * 4 + upgradeBoost * 10;
  adjusted.epic.weight += tier * 2;
  adjusted.legendary.weight += tier * 0.4;
  const items = Object.entries(adjusted).map(([k, v]) => [k, v.weight]);
  return rng.weighted(items);
}

function pickSlot(rng, type) {
  if (type === "goblin") {
    const pool = ["weapon", "ring", "amulet", "gloves", "boots"];
    return rng.pick(pool);
  }
  if (type === "cube") {
    const pool = ["amulet", "ring"];
    return rng.pick(pool);
  }
  if (type === "skeleton") {
    const pool = ["weapon", "armor", "shield", "helm", "gloves", "boots"];
    return rng.pick(pool);
  }
  return "weapon";
}

export function generateItem(rng, type, tier = 0, forceRarity = null) {
  const slot = pickSlot(rng, type);
  const rarity = forceRarity || rollRarity(rng, tier);
  const pool = NAMES[slot][rarity];
  const name = rng.pick(pool);
  const r = RARITIES[rarity];
  const statBase = STATS[slot];
  const statKey = Object.keys(statBase)[0];
  const statRange = statBase[statKey];
  const value = Math.round(
    (statRange[0] + rng.next() * (statRange[1] - statRange[0])) * r.mult,
  );

  return {
    id: nextId++,
    name,
    slot,
    rarity,
    rarityColor: r.color,
    stat: statKey,
    value,
    tier,
  };
}

export function createLootSystem(scene, rng, app = null) {
  const drops = [];
  const group = new THREE.Group();
  scene.add(group);

  function clearAll() {
    while (drops.length) {
      const d = drops.pop();
      if (d.mesh.parent) d.mesh.parent.remove(d.mesh);
      d.mesh.geometry.dispose();
      d.mesh.material.dispose();
    }
  }

  function dropLoot(position, type, rngArg) {
    const r = rngArg || rng;
    const tier = Math.floor(r.range(0, 0.6) + (type === "skeleton" ? 0.4 : 0));
    const item = generateItem(r, type, tier);
    const mat = new THREE.MeshStandardMaterial({
      color: item.rarityColor,
      emissive: item.rarityColor,
      emissiveIntensity: 0.6,
      roughness: 0.4,
      metalness: 0.5,
    });
    let geo;
    if (item.slot === "weapon") geo = new THREE.BoxGeometry(0.12, 0.4, 0.04);
    else if (item.slot === "armor") geo = new THREE.BoxGeometry(0.4, 0.4, 0.2);
    else if (item.slot === "helm") geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    else if (item.slot === "shield")
      geo = new THREE.BoxGeometry(0.32, 0.32, 0.06);
    else if (item.slot === "ring")
      geo = new THREE.TorusGeometry(0.12, 0.04, 8, 12);
    else if (item.slot === "amulet") geo = new THREE.OctahedronGeometry(0.15);
    else if (item.slot === "gloves") geo = new THREE.BoxGeometry(0.3, 0.2, 0.18);
    else if (item.slot === "boots") geo = new THREE.BoxGeometry(0.2, 0.24, 0.32);
    else geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.position.y = 0.4;
    mesh.castShadow = true;

    const glow = new THREE.PointLight(item.rarityColor, 1.2, 3, 2);
    glow.position.y = 0.4;
    mesh.add(glow);

    group.add(mesh);
    drops.push({ mesh, item, ttl: 30, baseY: 0.4 });
  }

  function update(dt) {
    if (!app || !app.knight) return;
    const player = app.knight;
    const playerPos = player.position;
    const t = performance.now() * 0.001;
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.ttl -= dt;
      d.mesh.position.y = d.baseY + Math.sin(t * 2.5 + d.item.id) * 0.12;
      d.mesh.rotation.y += dt * 1.5;
      d.mesh.rotation.x += dt * 0.6;

      const dist = d.mesh.position.distanceTo(playerPos);
      if (dist < 1.2) {
        pickup(d.item);
        if (d.mesh.parent) d.mesh.parent.remove(d.mesh);
        d.mesh.geometry.dispose();
        d.mesh.material.dispose();
        drops.splice(i, 1);
      } else if (d.ttl <= 0) {
        if (d.mesh.parent) d.mesh.parent.remove(d.mesh);
        d.mesh.geometry.dispose();
        d.mesh.material.dispose();
        drops.splice(i, 1);
      }
    }
  }

  function pickup(item) {
    if (!app) return;
    if (app.run) app.run.addLoot(item);
    if (app.hud) app.hud.flashLoot(item);
  }

  return { drops, dropLoot, update, clearAll };
}
