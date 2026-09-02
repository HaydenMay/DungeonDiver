import { RARITIES } from "../loot/LootSystem.js";

const SLOT_LABELS = {
  weapon: "Weapon",
  helm: "Helm",
  armor: "Armor",
  shield: "Shield",
  gloves: "Gloves",
  boots: "Boots",
  ring: "Ring",
  amulet: "Amulet",
};

const SLOT_ORDER = ["weapon", "helm", "armor", "shield", "gloves", "boots", "ring", "amulet"];

export function createHUD(app) {
  const el = {
    root: null,
    hpFill: null,
    hpText: null,
    staminaFill: null,
    staminaText: null,
    floorText: null,
    killsText: null,
    statsReadout: null,
    lootFlash: null,
    inventory: null,
    inventoryBody: null,
    inventoryBtn: null,
    gameOver: null,
    gameOverTitle: null,
    gameOverSub: null,
    goBtn: null,
    runComplete: null,
    rcTargets: null,
    rcPool: null,
    rcHint: null,
    rcConfirm: null,
  };

  let selectedItem = null;
  let selectedMode = null; // "carry" | "equip:weapon" | etc.
  let rcSelected = [null, null];

  function init() {
    const root = document.createElement("div");
    root.id = "hud";
    root.innerHTML = `
      <div class="hud-top">
        <div class="stat-bars">
          <div class="stat-row">
            <span class="stat-label">HP</span>
            <div class="bar"><div class="bar-fill hp-fill"></div></div>
            <span class="stat-text hp-text">100/100</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">STAM</span>
            <div class="bar"><div class="bar-fill stamina-fill"></div></div>
            <span class="stat-text stamina-text">100/100</span>
          </div>
        </div>
        <div class="floor-info">
          <div class="floor-text">Floor 1 · Room 1/5</div>
          <div class="kills-text">Kills: 0</div>
        </div>
      </div>
      <div class="hud-stats-readout"></div>
      <div class="hud-bottom">
        <div class="inventory-btn" id="inv-btn">Inventory (I)</div>
        <div class="hint-mini">Loot · Equip · Carry 2 out</div>
      </div>
      <div class="loot-flash" id="loot-flash"></div>
      <div class="room-banner" id="room-banner" style="display:none;"></div>
      <div class="wave-complete" id="wave-complete" style="display:none;">
        <div class="wc-box">
          <div class="wc-title">Wave Cleared</div>
          <div class="wc-sub" id="wc-sub">Room 1 cleared</div>
          <button class="wc-btn" id="wc-btn">Next Wave →</button>
        </div>
      </div>
      <div class="inventory-panel" id="inv-panel" style="display:none;">
        <div class="inv-header">
          <h2>Inventory</h2>
          <div class="inv-hint">Click an item, then click a slot. Click an item again to deselect.</div>
        </div>
        <div class="inv-body" id="inv-body"></div>
        <div class="inv-footer">
          <button class="inv-close" id="inv-close">Close</button>
        </div>
      </div>
      <div class="game-over" id="game-over" style="display:none;">
        <div class="go-box">
          <div class="go-title" id="go-title">FALLEN</div>
          <div class="go-sub" id="go-sub">Carried out 2 items</div>
          <button class="go-btn" id="go-btn">Retry (R)</button>
        </div>
      </div>
      <div class="run-complete" id="run-complete" style="display:none;">
        <div class="rc-box">
          <div class="rc-title">RUN COMPLETE</div>
          <div class="rc-hint" id="rc-hint">Choose 2 items to keep for your next run.</div>
          <div class="rc-targets" id="rc-targets"></div>
          <div class="rc-divider">AVAILABLE ITEMS</div>
          <div class="rc-pool" id="rc-pool"></div>
          <button class="rc-confirm" id="rc-confirm">Start Next Run</button>
        </div>
      </div>
      <div class="help">
        <span><b>WASD</b> move</span>
        <span><b>Shift</b> sprint</span>
        <span><b>Click</b> attack</span>
        <span><b>Space</b> dodge</span>
        <span><b>I</b> inventory</span>
        <span><b>P</b> screenshot</span>
      </div>
    `;
    document.body.appendChild(root);

    el.root = root;
    el.hpFill = root.querySelector(".hp-fill");
    el.hpText = root.querySelector(".hp-text");
    el.staminaFill = root.querySelector(".stamina-fill");
    el.staminaText = root.querySelector(".stamina-text");
    el.floorText = root.querySelector(".floor-text");
    el.killsText = root.querySelector(".kills-text");
    el.statsReadout = root.querySelector(".hud-stats-readout");
    el.lootFlash = root.querySelector("#loot-flash");
    el.roomBanner = root.querySelector("#room-banner");
    el.waveComplete = root.querySelector("#wave-complete");
    el.wcSub = root.querySelector("#wc-sub");
    el.wcBtn = root.querySelector("#wc-btn");
    el.inventory = root.querySelector("#inv-panel");
    el.inventoryBody = root.querySelector("#inv-body");
    el.inventoryBtn = root.querySelector("#inv-btn");
    el.gameOver = root.querySelector("#game-over");
    el.gameOverTitle = root.querySelector("#go-title");
    el.gameOverSub = root.querySelector("#go-sub");
    el.goBtn = root.querySelector("#go-btn");
    el.runComplete = root.querySelector("#run-complete");
    el.rcTargets = root.querySelector("#rc-targets");
    el.rcPool = root.querySelector("#rc-pool");
    el.rcHint = root.querySelector("#rc-hint");
    el.rcConfirm = root.querySelector("#rc-confirm");

    el.inventoryBtn.addEventListener("click", () => toggleInventory());
    root.querySelector("#inv-close").addEventListener("click", () => toggleInventory(false));
    el.goBtn.addEventListener("click", () => app.restart());
    el.rcConfirm.addEventListener("click", () => confirmRunComplete());
    el.wcBtn.addEventListener("click", () => {
      hideWaveComplete();
      app.advanceToNextRoom();
    });

    el.inventoryBody.addEventListener("click", (e) => {
      const un = e.target.closest(".inv-unequip");
      if (un) {
        e.stopPropagation();
        const slot = un.dataset.slot;
        if (slot === "carry0") app.run.unequipCarry(0);
        else if (slot === "carry1") app.run.unequipCarry(1);
        else app.run.unequipItem(slot);
        selectedItem = null;
        selectedMode = null;
        renderInventory();
        return;
      }
      const slot = e.target.closest(".inv-slot");
      if (slot && selectedItem != null) {
        const slotType = slot.dataset.type;
        const slotKey = slot.dataset.key;
        const item = findItemById(selectedItem);
        if (!item) return;
        if (slotType === "equip") {
          if (item.slot !== slotKey) return;
          app.run.equipItem(slotKey, item);
        } else if (slotType === "carry") {
          const idx = parseInt(slotKey);
          if (item.slot === "weapon" || item.slot === "armor" || item.slot === "helm" ||
              item.slot === "shield" || item.slot === "gloves" || item.slot === "boots" ||
              item.slot === "ring" || item.slot === "amulet") {
            app.run.equipCarry(idx, item);
          }
        }
        selectedItem = null;
        selectedMode = null;
        renderInventory();
        return;
      }
      const card = e.target.closest(".inv-card");
      if (card) {
        const id = parseInt(card.dataset.id);
        if (selectedItem === id) {
          selectedItem = null;
          selectedMode = null;
        } else {
          selectedItem = id;
          selectedMode = "item";
        }
        renderInventory();
      }
    });
  }

  function findItemById(id) {
    const run = app.run.state;
    for (const item of Object.values(run.equipped)) {
      if (item && item.id === id) return item;
    }
    for (const item of run.collected) {
      if (item && item.id === id) return item;
    }
    for (const item of run.carried) {
      if (item && item.id === id) return item;
    }
    return null;
  }

  function rarityClass(item) {
    return item ? `rarity-${item.rarity}` : "";
  }

  function itemCard(item) {
    const r = RARITIES[item.rarity];
    const color = `#${item.rarityColor.toString(16).padStart(6, "0")}`;
    return `
      <div class="inv-card ${rarityClass(item)} ${selectedItem === item.id ? "selected" : ""}" data-id="${item.id}" style="border-color:${color}">
        <div class="inv-card-name" style="color:${color}">${item.name}</div>
        <div class="inv-card-stat">${item.stat} +${item.value}</div>
        <div class="inv-card-rarity">${r.label} · ${SLOT_LABELS[item.slot]}</div>
      </div>
    `;
  }

  function slotHtml(slotType, slotKey, item, opts = {}) {
    const label = opts.label || (slotType === "carry" ? `Carry ${parseInt(slotKey) + 1}` : SLOT_LABELS[slotKey]);
    const compatible = !selectedItem || (() => {
      const it = findItemById(selectedItem);
      if (!it) return false;
      if (slotType === "equip") return it.slot === slotKey;
      if (slotType === "carry") return true;
      return false;
    })();
    if (item) {
      const color = `#${item.rarityColor.toString(16).padStart(6, "0")}`;
      return `
        <div class="inv-slot filled" data-type="${slotType}" data-key="${slotKey}">
          <div class="inv-slot-label">${label}</div>
          <div class="inv-slot-name" style="color:${color}">${item.name}</div>
          <div class="inv-slot-stat">${item.stat} +${item.value}</div>
          <button class="inv-unequip" data-slot="${slotType === "carry" ? "carry" + slotKey : slotKey}">Remove</button>
        </div>
      `;
    }
    return `
      <div class="inv-slot empty ${compatible ? "compatible" : ""}" data-type="${slotType}" data-key="${slotKey}">
        <div class="inv-slot-label">${label}</div>
        <div class="inv-slot-empty">${compatible ? "Click item to equip" : "Empty"}</div>
      </div>
    `;
  }

  function renderInventory() {
    const run = app.run.state;
    let html = `
      <div class="inv-section-label">EQUIPPED</div>
      <div class="inv-equipped-grid">
        ${SLOT_ORDER.map((s) => slotHtml("equip", s, run.equipped[s])).join("")}
      </div>
      <div class="inv-section-label">CARRY OUT (2 max)</div>
      <div class="inv-carry-grid">
        ${slotHtml("carry", "0", run.carried[0], { label: "Carry Slot 1" })}
        ${slotHtml("carry", "1", run.carried[1], { label: "Carry Slot 2" })}
      </div>
      <div class="inv-section-label">COLLECTED</div>
      <div class="inv-collected-grid">
    `;
    if (run.collected.length === 0) {
      html += '<div class="inv-empty">No items. Defeat enemies to find loot.</div>';
    } else {
      html += run.collected.map(itemCard).join("");
    }
    html += "</div>";
    el.inventoryBody.innerHTML = html;
  }

  function flashLoot(item) {
    const r = RARITIES[item.rarity];
    el.lootFlash.innerHTML = `
      <div class="loot-name" style="color:#${item.rarityColor.toString(16).padStart(6, "0")}">${item.name}</div>
      <div class="loot-stat">${item.stat} +${item.value} · ${SLOT_LABELS[item.slot]} · ${r.name}</div>
    `;
    el.lootFlash.classList.add("show");
    setTimeout(() => el.lootFlash.classList.remove("show"), 2200);
  }

  function showWaveComplete(roomIndex, isFinal) {
    if (isFinal) {
      el.wcSub.textContent = `All ${roomIndex} rooms cleared!`;
      el.wcBtn.textContent = "View Run Summary →";
    } else {
      el.wcSub.textContent = `Room ${roomIndex} cleared · ${app.run.state.floorGoal - roomIndex} rooms remain`;
      el.wcBtn.textContent = "Next Wave →";
    }
    el.waveComplete.style.display = "flex";
    if (app.state) app.state.wavePause = true;
  }

  function hideWaveComplete() {
    el.waveComplete.style.display = "none";
    if (app.state) app.state.wavePause = false;
  }

  function flashRoomTransition(roomNum) {
    el.roomBanner.innerHTML = `<div class="rb-text">Room ${roomNum}</div>`;
    el.roomBanner.style.display = "flex";
    el.roomBanner.classList.remove("show");
    void el.roomBanner.offsetWidth;
    el.roomBanner.classList.add("show");
    setTimeout(() => {
      el.roomBanner.classList.remove("show");
      setTimeout(() => { el.roomBanner.style.display = "none"; }, 400);
    }, 1200);
  }

  function updateStatsReadout() {
    const k = app.knight.state;
    const lines = [
      `<span class="stat-chip"><span class="sc-label">ATK</span><span class="sc-val">${k.damage}</span></span>`,
      `<span class="stat-chip"><span class="sc-label">DEF</span><span class="sc-val">${k.defense}</span></span>`,
      `<span class="stat-chip"><span class="sc-label">HP</span><span class="sc-val">${Math.ceil(k.hp)}/${k.maxHp}</span></span>`,
      `<span class="stat-chip"><span class="sc-label">SPD</span><span class="sc-val">${k.speed.toFixed(1)}</span></span>`,
      `<span class="stat-chip"><span class="sc-label">CRT</span><span class="sc-val">${Math.round((k.critChance || 0) * 100)}%</span></span>`,
    ];
    el.statsReadout.innerHTML = lines.join("");
  }

  function update() {
    const knight = app.knight;
    const hpPct = knight.state.hp / knight.state.maxHp;
    el.hpFill.style.width = `${Math.max(0, hpPct * 100)}%`;
    el.hpText.textContent = `${Math.ceil(knight.state.hp)}/${knight.state.maxHp}`;
    const stPct = knight.state.stamina / knight.state.maxStamina;
    el.staminaFill.style.width = `${Math.max(0, stPct * 100)}%`;
    el.staminaText.textContent = `${Math.ceil(knight.state.stamina)}/${knight.state.maxStamina}`;

    const run = app.run;
    el.floorText.textContent = `Floor ${run.state.floor} · Room ${run.state.roomsCleared + 1}/${run.state.floorGoal}`;
    const collectedCount = run.state.collected.length +
      Object.values(run.state.equipped).filter(Boolean).length;
    el.killsText.textContent = `Kills: ${run.state.kills} · Items: ${collectedCount}`;

    updateStatsReadout();

    if (knight.state.hp <= 0 && !app.state.gameOver && !app.state.runComplete) {
      app.state.gameOver = true;
      el.gameOver.style.display = "flex";
      el.gameOverTitle.textContent = "FALLEN";
      const vaultCount = run.state.permanentVault.filter(Boolean).length;
      el.gameOverSub.textContent = `You collected ${collectedCount} items. Carried out: ${vaultCount}/2`;
      el.goBtn.textContent = "Retry (R)";
    }

    if (app.enemies.aliveCount() === 0 && app.state.enemiesRemaining > 0 && !app.state.gameOver) {
      app.state.enemiesRemaining = 0;
      const cleared = app.run.state.roomsCleared + 1;
      const isFinal = cleared >= app.run.state.floorGoal;
      showWaveComplete(cleared, isFinal);
    }
  }

  function toggleInventory(force) {
    const showing = force !== undefined ? force : el.inventory.style.display === "none";
    el.inventory.style.display = showing ? "flex" : "none";
    if (showing) renderInventory();
  }

  function refresh() {
    if (el.inventory.style.display !== "none") renderInventory();
  }

  function refreshAll() {
    refresh();
    el.gameOver.style.display = "none";
    el.runComplete.style.display = "none";
  }

  function showRunCompleteUI() {
    rcSelected = [
      app.run.state.permanentVault[0] ? app.run.state.permanentVault[0].id : null,
      app.run.state.permanentVault[1] ? app.run.state.permanentVault[1].id : null,
    ];
    renderRunComplete();
    el.runComplete.style.display = "flex";
  }

  function hideRunCompleteUI() {
    el.runComplete.style.display = "none";
  }

  function renderRunComplete() {
    const items = app.run.getAllAvailableItems();
    el.rcTargets.innerHTML = [0, 1].map((idx) => {
      const item = items.find((i) => i.id === rcSelected[idx]);
      if (item) {
        const color = `#${item.rarityColor.toString(16).padStart(6, "0")}`;
        return `
          <div class="rc-slot filled" data-target="${idx}">
            <div class="rc-slot-label">Carry Slot ${idx + 1}</div>
            <div class="rc-slot-name" style="color:${color}">${item.name}</div>
            <div class="rc-slot-stat">${item.stat} +${item.value}</div>
            <div class="rc-slot-tag">${SLOT_LABELS[item.slot]}</div>
          </div>
        `;
      }
      return `
        <div class="rc-slot empty" data-target="${idx}">
          <div class="rc-slot-label">Carry Slot ${idx + 1}</div>
          <div class="rc-slot-empty">Click an item below</div>
        </div>
      `;
    }).join("");

    el.rcPool.innerHTML = items.map((item) => {
      const color = `#${item.rarityColor.toString(16).padStart(6, "0")}`;
      const isSelected = rcSelected.includes(item.id);
      return `
        <div class="rc-item ${isSelected ? "selected" : ""}" data-id="${item.id}" style="border-color:${color}">
          <div class="rc-item-name" style="color:${color}">${item.name}</div>
          <div class="rc-item-stat">${item.stat} +${item.value}</div>
          <div class="rc-item-slot">${SLOT_LABELS[item.slot]}</div>
        </div>
      `;
    }).join("");

    el.rcTargets.querySelectorAll(".rc-slot").forEach((slot) => {
      slot.addEventListener("click", () => {
        if (selectedItem == null) return;
        const idx = parseInt(slot.dataset.target);
        const item = items.find((i) => i.id === selectedItem);
        if (!item) return;
        if (rcSelected.includes(item.id)) return;
        rcSelected[idx] = item.id;
        selectedItem = null;
        renderRunComplete();
      });
    });

    el.rcPool.querySelectorAll(".rc-item").forEach((it) => {
      it.addEventListener("click", () => {
        const id = parseInt(it.dataset.id);
        selectedItem = selectedItem === id ? null : id;
        renderRunComplete();
      });
    });
  }

  function confirmRunComplete() {
    app.run.commitCarryOut(rcSelected[0], rcSelected[1]);
    app.nextRun();
  }

  init();
  return {
    update,
    refresh,
    refreshAll,
    toggleInventory,
    flashLoot,
    showRunCompleteUI,
    hideRunCompleteUI,
    flashRoomTransition,
    showWaveComplete,
    hideWaveComplete,
  };
}
