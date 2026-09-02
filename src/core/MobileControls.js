export function wireMobileControls(input) {
  if (!input.state.isTouchDevice) return;

  const joystickBase = document.getElementById("joystick-base");
  const joystickThumb = document.getElementById("joystick-thumb");
  const joystickZone = document.getElementById("joystick-zone");
  const btnAttack = document.getElementById("btn-attack");
  const btnDodge = document.getElementById("btn-dodge");
  const btnInventory = document.getElementById("btn-inventory");

  if (joystickBase && joystickThumb) {
    const baseRect = () => joystickBase.getBoundingClientRect();
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = baseRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = t.clientX - cx;
      const dy = t.clientY - cy;
      const maxR = rect.width / 2 - 12;
      const dist = Math.min(Math.hypot(dx, dy), maxR);
      const angle = Math.atan2(dy, dx);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      joystickThumb.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
    };
    const onTouchEnd = () => {
      joystickThumb.style.transform = "translate(-50%, -50%)";
    };
    joystickZone.addEventListener("touchmove", onTouchMove, { passive: true });
    joystickZone.addEventListener("touchend", onTouchEnd, { passive: true });
    joystickZone.addEventListener("touchcancel", onTouchEnd, { passive: true });
  }

  const pressHandler = (trigger) => {
    let active = false;
    return {
      start: (e) => {
        e.preventDefault();
        active = true;
        trigger();
      },
      end: (e) => {
        e.preventDefault();
        active = false;
      },
      isActive: () => active,
    };
  };

  if (btnAttack) {
    const h = pressHandler(() => input.triggerAttack());
    btnAttack.addEventListener("touchstart", h.start, { passive: false });
    btnAttack.addEventListener("touchend", h.end, { passive: false });
    btnAttack.addEventListener("touchcancel", h.end, { passive: false });
  }

  if (btnDodge) {
    const h = pressHandler(() => input.triggerDodge());
    btnDodge.addEventListener("touchstart", h.start, { passive: false });
    btnDodge.addEventListener("touchend", h.end, { passive: false });
    btnDodge.addEventListener("touchcancel", h.end, { passive: false });
  }

  if (btnInventory) {
    const toggleInventory = () => {
      const app = window.__dungeonDiver;
      if (app && app.hud && app.hud.toggleInventory) {
        app.hud.toggleInventory();
      }
    };
    const h = pressHandler(toggleInventory);
    btnInventory.addEventListener("touchstart", h.start, { passive: false });
    btnInventory.addEventListener("touchend", h.end, { passive: false });
    btnInventory.addEventListener("touchcancel", h.end, { passive: false });
  }
}
