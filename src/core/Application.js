import * as THREE from "three";
import { createDungeon } from "../world/Dungeon.js";
import { createKnight } from "../character/Knight.js";
import { createEnemyManager } from "../enemies/EnemyManager.js";
import { createCombatSystem } from "../combat/CombatSystem.js";
import { createLootSystem } from "../loot/LootSystem.js";
import { createRunManager } from "../run/RunManager.js";
import { createHUD } from "../ui/HUD.js";
import { createMenuHUD } from "../ui/MenuHUD.js";
import { createMenuScene } from "./MenuScene.js";
import { createCameraRig } from "../core/CameraRig.js";
import { createInput } from "../core/Input.js";
import { RNG } from "../core/RNG.js";
import { loadVault, saveVault } from "../core/Persistence.js";

export class Application {
  constructor() {
    this.canvas = document.querySelector("canvas.webgl");
    this.clock = new THREE.Clock();
    this.rng = new RNG((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    this.state = {
      runActive: true,
      roomIndex: 0,
      enemiesRemaining: 0,
      clearedRooms: 0,
      runSeed: 0xc0ffee,
      paused: false,
      gameOver: false,
      victory: false,
      runComplete: false,
      wavePause: false,
      mode: "menu",
    };

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initInput();

    this.cameraRig = createCameraRig(this.camera, this.canvas, this.input);

    this.menuScene = createMenuScene();
    this.menuHUD = createMenuHUD(this);

    this.dungeon = createDungeon(this.scene, this.rng);
    this.knight = createKnight(this.scene, this);
    this.enemies = createEnemyManager(this.scene, this.rng, this.camera);
    this.run = createRunManager(this);
    this.hud = createHUD(this);
    this.combat = createCombatSystem(this);
    this.loot = createLootSystem(this.scene, this.rng, this);

    this._connectSystems();
    this._addResizeListener();
    this._addHotkeys();

    this.menuScene.setActive(true);
    this.menuHUD.show();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x26201a);
    this.scene.fog = new THREE.FogExp2(0x26201a, 0.022);
    const warmAmbient = new THREE.AmbientLight(0x6a5a4a, 0.42);
    this.scene.add(warmAmbient);
    const hemi = new THREE.HemisphereLight(0x6a5a48, 0x1a1410, 0.32);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff0e0, 0.7);
    sun.position.set(0, 12, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 25;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);
    this.sun = sun;
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.05,
      120
    );
    this.camera.position.set(0, 6, -10);
    this.camera.lookAt(0, 1.4, 0);
  }

  _initInput() {
    this.input = createInput(this.canvas);
  }

  _connectSystems() {
    this.dungeon.buildStartingRoom();
    this.enemies.spawnForRoom(this.dungeon.currentRoom, 0);
    this.state.enemiesRemaining = this.enemies.aliveCount();
    this.knight.position.set(0, 0, -7);
    this.knight.state.facingY = 0;
    this.knight.state.targetFacing = 0;
    this.cameraRig.follow(this.knight);
    this.run.startRun(this.run.state.permanentVault);
  }

  _addResizeListener() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      if (this.menuScene) this.menuScene.onResize();
    });
  }

  _addHotkeys() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyP" && this.state.mode === "game") {
        this.screenshot();
      } else if (e.code === "KeyR" && this.state.mode === "game" && (this.state.gameOver || this.state.runComplete)) {
        this.restart();
      } else if (e.code === "Escape" && this.state.mode === "game") {
        this.state.paused = !this.state.paused;
      } else if (e.code === "KeyI" && this.state.mode === "game") {
        this.hud.toggleInventory();
      } else if (e.code === "Space") {
        e.preventDefault();
      }
    });
  }

  start() {
    this.clock.start();
    this._loop();
  }

  startGame(continueRun) {
    const vault = continueRun ? loadVault() : null;
    this.state.mode = "game";
    this.menuHUD.hide();
    this.menuScene.setActive(false);
    if (this.hud && this.hud.show) this.hud.show();

    this._initGameWithVault(vault || [null, null]);
    this.hud.refreshAll();
  }

  returnToMenu() {
    saveVault(this.run.state.permanentVault);
    this.state.mode = "menu";
    this.menuScene.setActive(true);
    this.menuHUD.show();
    if (this.hud && this.hud.hide) this.hud.hide();
  }

  _initGameWithVault(vault) {
    this.rng = new RNG((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    this.state.gameOver = false;
    this.state.victory = false;
    this.state.runComplete = false;
    this.state.wavePause = false;
    this.state.paused = false;
    this.state.roomIndex = 0;
    this.state.clearedRooms = 0;

    this.enemies.clearAll();
    this.loot.clearAll();
    this.knight.reset();
    this.dungeon.clear();
    this.dungeon.buildStartingRoom();
    this.enemies.spawnForRoom(this.dungeon.currentRoom, 0);
    this.state.enemiesRemaining = this.enemies.aliveCount();
    this.knight.position.set(0, 0, -7);
    this.knight.state.facingY = 0;
    this.knight.state.targetFacing = 0;
    this.cameraRig.follow(this.knight);
    this.run.startRun(vault);
    this.hud.refreshAll();
    if (this.hud.hideWaveComplete) this.hud.hideWaveComplete();
    if (this.hud.hideRunCompleteUI) this.hud.hideRunCompleteUI();
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.state.mode === "menu") {
      this.menuScene.update(dt);
      this.menuScene.render(this.renderer);
      return;
    }

    if (this.state.paused || this.state.gameOver || this.state.runComplete || this.state.wavePause) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const axis = this.input.getAxis();
    this.knight.update(dt, axis, this.input);
    this.cameraRig.update(dt, this.knight.position, this.knight.facingY);

    if (this.sun) {
      this.sun.position.set(this.knight.position.x, 12, this.knight.position.z);
      this.sun.target.position.set(this.knight.position.x, 0, this.knight.position.z);
      this.sun.target.updateMatrixWorld();
    }

    this.enemies.update(dt, this.knight.position, this.dungeon.currentRoom);
    this.combat.update(dt);
    this.loot.update(dt);
    this.run.update(dt);

    this.hud.update();

    this.renderer.render(this.scene, this.camera);
  }

  screenshot() {
    this.renderer.render(this.scene, this.camera);
    const data = this.canvas.toDataURL("image/png");
    fetch("/api/screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: data }),
    })
      .then((r) => r.json())
      .then((r) => console.log("Screenshot saved:", r.path))
      .catch((e) => console.error("Screenshot error:", e));
  }

  restart() {
    this._initGameWithVault(this.run.state.permanentVault);
  }

  nextRun() {
    saveVault(this.run.state.permanentVault);
    this._initGameWithVault(this.run.state.permanentVault);
  }

  advanceToNextRoom() {
    this.run.onRoomCleared();
    if (this.state.runComplete || this.state.gameOver) {
      this.state.enemiesRemaining = 0;
      return;
    }
    this.enemies.clearAll();
    this.loot.clearAll();
    this.state.roomIndex = (this.state.roomIndex || 0) + 1;
    this.dungeon.buildNextRoom();
    this.enemies.spawnForRoom(this.dungeon.currentRoom, this.state.roomIndex);
    this.state.enemiesRemaining = this.enemies.aliveCount();
    this.knight.position.set(0, 0, -this.dungeon.ROOM_SIZE * 0.4);
    this.knight.state.facingY = 0;
    this.knight.state.targetFacing = 0;
    this.knight.state.invulnTime = 0.5;
    this.cameraRig.follow(this.knight);
    if (this.hud && this.hud.flashRoomTransition) {
      this.hud.flashRoomTransition(this.state.roomIndex + 1);
    }
    if (this.hud && this.hud.hideWaveComplete) {
      this.hud.hideWaveComplete();
    }
  }
}
