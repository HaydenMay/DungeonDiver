import { loadVault, hasSavedVault, clearVault } from "../core/Persistence.js";

export function createMenuHUD(app) {
  const el = {
    root: null,
    title: null,
    subtitle: null,
    startBtn: null,
    continueBtn: null,
    howToBtn: null,
    howToModal: null,
    howToClose: null,
    resetBtn: null,
    saveIndicator: null,
  };

  function init() {
    const root = document.createElement("div");
    root.id = "menu-hud";
    root.innerHTML = `
      <div class="menu-title">
        <div class="menu-title-main">DUNGEON DIVER</div>
        <div class="menu-title-sub">A roguelike dungeon crawler</div>
      </div>
      <div class="menu-buttons">
        <button class="menu-btn menu-btn-primary" id="start-btn">Start Run</button>
        <button class="menu-btn menu-btn-secondary" id="continue-btn" style="display:none;">Continue Run</button>
        <button class="menu-btn menu-btn-text" id="howto-btn">How to Play</button>
        <button class="menu-btn menu-btn-text menu-btn-danger" id="reset-btn" style="display:none;">Reset Save</button>
      </div>
      <div class="menu-howto" id="howto-modal" style="display:none;">
        <div class="howto-box">
          <h2>How to Play</h2>
          <div class="howto-section">
            <h3>Desktop</h3>
            <ul>
              <li><b>WASD</b> — move (camera-relative)</li>
              <li><b>Shift</b> — sprint</li>
              <li><b>Mouse</b> — rotate camera</li>
              <li><b>Click</b> — attack</li>
              <li><b>Space</b> — dodge (25 stamina)</li>
              <li><b>I</b> — inventory</li>
              <li><b>P</b> — screenshot</li>
            </ul>
          </div>
          <div class="howto-section">
            <h3>Mobile</h3>
            <ul>
              <li><b>Left joystick</b> — move</li>
              <li><b>Drag right</b> — rotate camera</li>
              <li><b>Tap right</b> — attack</li>
              <li><b>Dodge button</b> — dodge</li>
              <li><b>Inventory button</b> — manage gear</li>
            </ul>
          </div>
          <div class="howto-section">
            <h3>Goal</h3>
            <p>Clear 5 rooms of enemies. Loot drops, equip it for stat bonuses, then pick <b>2 items to keep</b> at the end of the run. Death means losing everything except your carried two.</p>
          </div>
          <button class="howto-close" id="howto-close">Close</button>
        </div>
      </div>
      <div class="save-indicator" id="save-indicator" style="display:none;"></div>
    `;
    document.body.appendChild(root);

    el.root = root;
    el.title = root.querySelector(".menu-title-main");
    el.subtitle = root.querySelector(".menu-title-sub");
    el.startBtn = root.querySelector("#start-btn");
    el.continueBtn = root.querySelector("#continue-btn");
    el.howToBtn = root.querySelector("#howto-btn");
    el.howToModal = root.querySelector("#howto-modal");
    el.howToClose = root.querySelector("#howto-close");
    el.resetBtn = root.querySelector("#reset-btn");
    el.saveIndicator = root.querySelector("#save-indicator");

    el.startBtn.addEventListener("click", () => app.startGame(false));
    el.continueBtn.addEventListener("click", () => app.startGame(true));
    el.howToBtn.addEventListener("click", () => showHowTo());
    el.howToClose.addEventListener("click", () => hideHowTo());
    el.resetBtn.addEventListener("click", () => {
      if (confirm("Reset your saved vault? This cannot be undone.")) {
        clearVault();
        refreshButtons();
      }
    });

    refreshButtons();
  }

  function refreshButtons() {
    const vault = loadVault();
    if (vault && vault.some((i) => i !== null)) {
      el.continueBtn.style.display = "block";
      el.resetBtn.style.display = "block";
      const count = vault.filter(Boolean).length;
      el.saveIndicator.style.display = "block";
      el.saveIndicator.innerHTML = `Saved: ${count}/2 items carried`;
    } else {
      el.continueBtn.style.display = "none";
      el.resetBtn.style.display = "none";
      el.saveIndicator.style.display = "none";
    }
  }

  function showHowTo() {
    el.howToModal.style.display = "flex";
  }

  function hideHowTo() {
    el.howToModal.style.display = "none";
  }

  function show() {
    el.root.style.display = "block";
    requestAnimationFrame(() => el.root.classList.add("show"));
    refreshButtons();
  }

  function hide() {
    el.root.classList.remove("show");
    setTimeout(() => {
      el.root.style.display = "none";
    }, 400);
    hideHowTo();
  }

  function isVisible() {
    return el.root.style.display !== "none";
  }

  init();
  return { show, hide, isVisible, refreshButtons };
}
