import * as THREE from "three";

export function createCameraRig(camera, canvas, input = null) {
  const target = new THREE.Vector3();
  const desiredPos = new THREE.Vector3();
  const currentTarget = new THREE.Vector3(0, 1.4, 0);
  const orbit = { yaw: 0, pitch: 0.4 };

  const minPitch = 0.05;
  const maxPitch = Math.PI / 2 - 0.15;
  const minDist = 4.5;
  const maxDist = 12;
  let distance = 8;

  const onMouseMove = (e) => {
    if (document.pointerLockElement === canvas) {
      orbit.yaw -= e.movementX * 0.0035;
      orbit.pitch -= e.movementY * 0.0035;
      orbit.pitch = Math.max(minPitch, Math.min(maxPitch, orbit.pitch));
    }
  };
  const onWheel = (e) => {
    distance += e.deltaY * 0.005;
    distance = Math.max(minDist, Math.min(maxDist, distance));
  };

  document.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("wheel", onWheel);

  let followTarget = null;

  return {
    yaw: orbit.yaw,
    pitch: orbit.pitch,
    follow(obj) {
      followTarget = obj;
    },
    update(dt, position, facingY) {
      if (input && input.state && input.state.isTouchDevice) {
        const cam = input.consumeCameraDelta();
        if (cam) {
          orbit.yaw -= cam.dx * 0.005;
          orbit.pitch -= cam.dy * 0.005;
          orbit.pitch = Math.max(minPitch, Math.min(maxPitch, orbit.pitch));
        }
      }

      if (!followTarget) return;
      const camTargetX = position.x;
      const camTargetY = position.y + 1.4;
      const camTargetZ = position.z;
      target.set(camTargetX, camTargetY, camTargetZ);
      currentTarget.lerp(target, Math.min(1, dt * 10));

      const cosP = Math.cos(orbit.pitch);
      desiredPos.set(
        camTargetX + Math.sin(orbit.yaw) * distance * cosP,
        camTargetY + Math.sin(orbit.pitch) * distance,
        camTargetZ + Math.cos(orbit.yaw) * distance * cosP
      );

      camera.position.lerp(desiredPos, Math.min(1, dt * 8));
      camera.lookAt(currentTarget);
    },
  };
}
