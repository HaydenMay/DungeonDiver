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
    isTouchDevice: false,
    joystickActive: false,
    joystickDX: 0,
    joystickDY: 0,
    cameraDX: 0,
    cameraDY: 0,
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
      if (!state.pointerLocked && !state.isTouchDevice) canvas.requestPointerLock();
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

  state.isTouchDevice =
    "ontouchstart" in window ||
    (navigator.maxTouchPoints != null && navigator.maxTouchPoints > 0);

  if (state.isTouchDevice) {
    const JOYSTICK_RADIUS = 60;
    const activeTouches = new Map();

    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
          const rect = canvas.getBoundingClientRect();
          const x = t.clientX - rect.left;
          const y = t.clientY - rect.top;
          const isLeftHalf = x < rect.width / 2;
          activeTouches.set(t.identifier, {
            startX: t.clientX,
            startY: t.clientY,
            currentX: t.clientX,
            currentY: t.clientY,
            moved: false,
            isLeft: isLeftHalf,
          });
          if (isLeftHalf) {
            state.joystickActive = true;
            state.joystickDX = 0;
            state.joystickDY = 0;
          }
        }
      },
      { passive: false }
    );

    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
          const data = activeTouches.get(t.identifier);
          if (!data) continue;
          const dx = t.clientX - data.startX;
          const dy = t.clientY - data.startY;
          const dist = Math.hypot(dx, dy);
          if (dist > 8) data.moved = true;
          data.currentX = t.clientX;
          data.currentY = t.clientY;
          if (data.isLeft) {
            const clampedDist = Math.min(dist, JOYSTICK_RADIUS);
            const angle = Math.atan2(dy, dx);
            state.joystickDX = (Math.cos(angle) * clampedDist) / JOYSTICK_RADIUS;
            state.joystickDY = (Math.sin(angle) * clampedDist) / JOYSTICK_RADIUS;
          } else {
            state.cameraDX = t.clientX - data.startX;
            state.cameraDY = t.clientY - data.startY;
            data.startX = t.clientX;
            data.startY = t.clientY;
          }
        }
      },
      { passive: false }
    );

    const endTouch = (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const data = activeTouches.get(t.identifier);
        if (!data) continue;
        if (data.isLeft) {
          state.joystickActive = false;
          state.joystickDX = 0;
          state.joystickDY = 0;
        }
        if (!data.isLeft && !data.moved) {
          state.consumeAttack = true;
        }
        activeTouches.delete(t.identifier);
      }
    };
    canvas.addEventListener("touchend", endTouch, { passive: false });
    canvas.addEventListener("touchcancel", endTouch, { passive: false });
  }

  return {
    state,
    getAxis() {
      let x = 0;
      let z = 0;
      if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) x += 1;
      if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) x -= 1;
      if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) z += 1;
      if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) z -= 1;

      if (state.isTouchDevice && state.joystickActive) {
        if (Math.abs(state.joystickDX) > 0.15) x = state.joystickDX;
        if (Math.abs(state.joystickDY) > 0.15) z = -state.joystickDY;
      }

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
    consumeCameraDelta() {
      if (state.cameraDX !== 0 || state.cameraDY !== 0) {
        const dx = state.cameraDX;
        const dy = state.cameraDY;
        state.cameraDX = 0;
        state.cameraDY = 0;
        return { dx, dy };
      }
      return null;
    },
    isTouchDevice() {
      return state.isTouchDevice;
    },
    triggerDodge() {
      state.consumeDodge = true;
    },
    triggerAttack() {
      state.consumeAttack = true;
    },
  };
}
