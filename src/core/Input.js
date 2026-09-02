import * as THREE from "three";

export function createInput(canvas) {
  const state = {
    keys: new Set(),
    mouseDown: false,
    pointerLocked: false,
    consumeAttack: false,
    consumeDodge: false,
    axisX: 0,
    axisZ: 0,
    sprint: false,
  };

  const onKeyDown = (e) => {
    state.keys.add(e.code);
    if (e.code === "Space") {
      e.preventDefault();
      state.consumeDodge = true;
    }
  };
  const onKeyUp = (e) => state.keys.delete(e.code);
  const onMouseDown = (e) => {
    if (e.button === 0) {
      state.consumeAttack = true;
      state.mouseDown = true;
      if (!state.pointerLocked) canvas.requestPointerLock();
    }
  };
  const onMouseUp = () => (state.mouseDown = false);
  const onPointerLockChange = () => {
    state.pointerLocked = document.pointerLockElement === canvas;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  document.addEventListener("pointerlockchange", onPointerLockChange);

  return {
    state,
    getAxis() {
      const x = (state.keys.has("KeyD") || state.keys.has("ArrowRight") ? 1 : 0) -
        (state.keys.has("KeyA") || state.keys.has("ArrowLeft") ? 1 : 0);
      const z = (state.keys.has("KeyW") || state.keys.has("ArrowUp") ? 1 : 0) -
        (state.keys.has("KeyS") || state.keys.has("ArrowDown") ? 1 : 0);
      state.axisX = x;
      state.axisZ = z;
      state.sprint = state.keys.has("ShiftLeft") || state.keys.has("ShiftRight");
      return { x, z };
    },
    consumeAttack() {
      if (state.consumeAttack) {
        state.consumeAttack = false;
        return true;
      }
      return false;
    },
    consumeDodge() {
      if (state.consumeDodge) {
        state.consumeDodge = false;
        return true;
      }
      return false;
    },
    isPointerLocked() {
      return state.pointerLocked;
    },
  };
}
