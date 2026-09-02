import { saveVault } from "../core/Persistence.js";

const ROOMS_PER_FLOOR = 5;

function emptyEquipped() {
  return {
    weapon: null,
    helm: null,
    armor: null,
    shield: null,
    gloves: null,
    boots: null,
    ring: null,
    amulet: null,
  };
}

export function createRunManager(app) {
  const state = {
    permanentVault: [null, null],
    carried: [null, null],
    equipped: emptyEquipped(),
    collected: [],
    roomsCleared: 0,
    kills: 0,
    floor: 1,
    floorGoal: ROOMS_PER_FLOOR,
    shopOpened: false,
    runComplete: false,
  };

  function addLoot(item) {
    state.collected.push(item);
    if (app.hud) app.hud.refresh();
  }

  function equipItem(slot, item) {
    if (!item) return false;
    if (item.slot !== slot) return false;
    const inCollected = state.collected.find((i) => i.id === item.id);
    const inCarried = state.carried.find((c) => c && c.id === item.id);
    if (!inCollected && !inCarried) return false;
    if (state.equipped[slot]) {
      state.collected.push(state.equipped[slot]);
    }
    state.equipped[slot] = item;
    state.collected = state.collected.filter((i) => i.id !== item.id);
    state.carried = state.carried.map((c) => (c && c.id === item.id ? null : c));
    if (app.knight && app.knight.recomputeStats) app.knight.recomputeStats();
    if (app.hud) app.hud.refresh();
    return true;
  }

  function unequipItem(slot) {
    const item = state.equipped[slot];
    if (!item) return false;
    state.collected.push(item);
    state.equipped[slot] = null;
    if (app.knight && app.knight.recomputeStats) app.knight.recomputeStats();
    if (app.hud) app.hud.refresh();
    return true;
  }

  function equipCarry(idx, item) {
    if (idx < 0 || idx >= 2) return false;
    if (!item) return false;
    if (!state.collected.find((i) => i.id === item.id)) return false;
    if (state.carried[idx]) {
      state.collected.push(state.carried[idx]);
    }
    state.carried[idx] = item;
    state.collected = state.collected.filter((i) => i.id !== item.id);
    if (app.hud) app.hud.refresh();
    return true;
  }

  function unequipCarry(idx) {
    if (idx < 0 || idx >= 2) return false;
    if (!state.carried[idx]) return false;
    state.collected.push(state.carried[idx]);
    state.carried[idx] = null;
    if (app.hud) app.hud.refresh();
    return true;
  }

  function onEnemyKilled(enemy) {
    state.kills++;
    if (app.hud) app.hud.refresh();
  }

  function onRoomCleared() {
    state.roomsCleared++;
    if (app.state) {
      app.state.clearedRooms = state.roomsCleared;
      app.state.enemiesRemaining = 0;
    }
    if (state.roomsCleared >= state.floorGoal) {
      state.runComplete = true;
      if (app.hud && app.hud.showRunCompleteUI) app.hud.showRunCompleteUI();
    } else {
      if (app.hud) app.hud.refresh();
    }
  }

  function isFloorComplete() {
    return state.roomsCleared >= state.floorGoal;
  }

  function advanceFloor() {
    state.roomsCleared = 0;
    state.floor++;
    if (app.state) {
      app.state.roomIndex = 0;
      app.state.clearedRooms = 0;
    }
  }

  function update(dt) {
    if (app.dungeon) app.dungeon.update(dt);
  }

  function startRun(vault) {
    state.permanentVault = (vault || [null, null]).map((x) => (x ? { ...x } : null));
    state.carried = state.permanentVault.map((x) => (x ? { ...x } : null));
    state.equipped = emptyEquipped();
    for (const item of state.carried) {
      if (item && item.slot) {
        state.equipped[item.slot] = item;
      }
    }
    state.collected = [];
    state.roomsCleared = 0;
    state.kills = 0;
    state.floor = 1;
    state.runComplete = false;
    if (app.knight && app.knight.recomputeStats) app.knight.recomputeStats();
  }

  function reset() {
    startRun(state.permanentVault);
  }

  function commitCarryOut(slot0ItemId, slot1ItemId) {
    const pool = new Map();
    for (const item of Object.values(state.equipped)) {
      if (item) pool.set(item.id, item);
    }
    for (const item of state.collected) {
      if (item) pool.set(item.id, item);
    }
    const i0 = pool.get(slot0ItemId) || null;
    const i1 = pool.get(slot1ItemId) || null;
    state.permanentVault = [i0, i1];
    try {
      saveVault(state.permanentVault);
    } catch (e) {}
  }

  function getTotalStats() {
    const out = { damage: 0, defense: 0, block: 0, speed: 0, hp: 0, attackSpeed: 0, critChance: 0 };
    for (const item of Object.values(state.equipped)) {
      if (!item) continue;
      out[item.stat] = (out[item.stat] || 0) + item.value;
    }
    return out;
  }

  function getAllAvailableItems() {
    const seen = new Set();
    const items = [];
    for (const item of Object.values(state.equipped)) {
      if (item && !seen.has(item.id)) {
        items.push(item);
        seen.add(item.id);
      }
    }
    for (const item of state.collected) {
      if (item && !seen.has(item.id)) {
        items.push(item);
        seen.add(item.id);
      }
    }
    return items;
  }

  return {
    state,
    addLoot,
    equipItem,
    unequipItem,
    equipCarry,
    unequipCarry,
    onEnemyKilled,
    onRoomCleared,
    isFloorComplete,
    advanceFloor,
    update,
    reset,
    startRun,
    commitCarryOut,
    getTotalStats,
    getAllAvailableItems,
  };
}
