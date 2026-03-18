import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ca7bf);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.75, 4.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const roomGroup = new THREE.Group();
scene.add(roomGroup);

const roomMaterial = new THREE.MeshStandardMaterial({
  color: 0x8da8da,
  roughness: 0.9,
  metalness: 0.02,
  side: THREE.BackSide,
});

const room = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 12), roomMaterial);
room.position.y = 3;
roomGroup.add(room);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(11.4, 11.4),
  new THREE.MeshStandardMaterial({ color: 0xa87556, roughness: 0.95, metalness: 0.01 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.02;
roomGroup.add(floor);

const ambient = new THREE.AmbientLight(0xf2e7be, 0.68);
scene.add(ambient);

const keyLight = new THREE.PointLight(0xffe4a6, 1.15, 30, 2);
keyLight.position.set(-1.2, 3.8, -2.4);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x9fbcff, 0.4, 22, 2);
fillLight.position.set(3.2, 2.4, 3.7);
scene.add(fillLight);

// Letto (destro, grande, inclinato)
const bed = new THREE.Group();
const bedFrame = new THREE.Mesh(
  new THREE.BoxGeometry(3.6, 1.1, 1.95),
  new THREE.MeshStandardMaterial({ color: 0xbe8044, roughness: 0.83 })
);
bedFrame.position.y = 0.66;
bed.add(bedFrame);

const mattress = new THREE.Mesh(
  new THREE.BoxGeometry(3.35, 0.38, 1.74),
  new THREE.MeshStandardMaterial({ color: 0xe0c879, roughness: 0.9 })
);
mattress.position.set(0, 1.07, 0.03);
bed.add(mattress);

const headboard = new THREE.Mesh(
  new THREE.BoxGeometry(0.12, 1.55, 1.98),
  new THREE.MeshStandardMaterial({ color: 0xaa6f37, roughness: 0.84 })
);
headboard.position.set(1.76, 1.35, 0);
bed.add(headboard);

bed.position.set(3.55, 0, 0.35);
bed.rotation.y = -0.16;
roomGroup.add(bed);

// Finestra (frontale, luminosa)
const windowFrame = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2.05),
  new THREE.MeshStandardMaterial({ color: 0x5d7f4f, roughness: 0.8 })
);
windowFrame.position.set(-1.5, 3.1, -5.96);
roomGroup.add(windowFrame);

const windowGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xe1f5ad });
const windowGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.72), windowGlowMaterial);
windowGlow.position.set(-1.5, 3.08, -5.94);
roomGroup.add(windowGlow);

// Sedia (semplice, inclinata, decentrata)
const chair = new THREE.Group();
const chairMat = new THREE.MeshStandardMaterial({ color: 0xcfc36a, roughness: 0.92 });

const seat = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.9), chairMat);
seat.position.y = 0.95;
chair.add(seat);

const back = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.08, 0.14), chairMat);
back.position.set(0, 1.5, -0.38);
chair.add(back);

[
  [-0.34, 0.48, -0.29],
  [0.34, 0.48, -0.29],
  [-0.34, 0.48, 0.29],
  [0.34, 0.48, 0.29],
].forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), chairMat);
  leg.position.set(x, y, z);
  chair.add(leg);
});

chair.position.set(-4.3, 0, 1.65);
chair.rotation.y = 0.34;
chair.rotation.z = -0.045;
roomGroup.add(chair);

// Tavolo (piccolo, leggermente sproporzionato)
const table = new THREE.Group();
const tableMat = new THREE.MeshStandardMaterial({ color: 0xb97a47, roughness: 0.88 });

const top = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 0.9), tableMat);
top.position.y = 1.16;
table.add(top);

[
  [-0.51, 0.58, -0.31],
  [0.48, 0.58, -0.34],
  [-0.49, 0.58, 0.31],
  [0.45, 0.58, 0.34],
].forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), tableMat);
  leg.position.set(x, y, z);
  table.add(leg);
});

table.position.set(-3.35, 0, -3.8);
table.rotation.y = -0.18;
table.rotation.z = 0.02;
roomGroup.add(table);

// --- Movimento ---
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const look = {
  yaw: Math.PI,
  pitch: -0.03,
};

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);

function setKey(code, value) {
  if (code === 'KeyW' || code === 'ArrowUp') keys.forward = value;
  if (code === 'KeyS' || code === 'ArrowDown') keys.backward = value;
  if (code === 'KeyA' || code === 'ArrowLeft') keys.left = value;
  if (code === 'KeyD' || code === 'ArrowRight') keys.right = value;
}

window.addEventListener('keydown', (event) => setKey(event.code, true));
window.addEventListener('keyup', (event) => setKey(event.code, false));

let pointerLocked = false;
renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('mousemove', (event) => {
  if (!pointerLocked) return;
  look.yaw -= event.movementX * 0.0019;
  look.pitch -= event.movementY * 0.0016;
  look.pitch = THREE.MathUtils.clamp(look.pitch, -1.1, 1.1);
});

const touchState = {
  moveId: null,
  lookId: null,
  moveStartX: 0,
  moveStartY: 0,
  lookStartX: 0,
  lookStartY: 0,
  moveDeltaX: 0,
  moveDeltaY: 0,
};

function findTouchById(touches, id) {
  for (const touch of touches) {
    if (touch.identifier === id) return touch;
  }
  return null;
}

window.addEventListener(
  'touchstart',
  (event) => {
    for (const touch of event.changedTouches) {
      if (touch.clientX < window.innerWidth * 0.5 && touchState.moveId === null) {
        touchState.moveId = touch.identifier;
        touchState.moveStartX = touch.clientX;
        touchState.moveStartY = touch.clientY;
      } else if (touchState.lookId === null) {
        touchState.lookId = touch.identifier;
        touchState.lookStartX = touch.clientX;
        touchState.lookStartY = touch.clientY;
      }
    }
  },
  { passive: true }
);

window.addEventListener(
  'touchmove',
  (event) => {
    const moveTouch = findTouchById(event.touches, touchState.moveId);
    if (moveTouch) {
      touchState.moveDeltaX = moveTouch.clientX - touchState.moveStartX;
      touchState.moveDeltaY = moveTouch.clientY - touchState.moveStartY;
    }

    const lookTouch = findTouchById(event.touches, touchState.lookId);
    if (lookTouch) {
      const dx = lookTouch.clientX - touchState.lookStartX;
      const dy = lookTouch.clientY - touchState.lookStartY;
      look.yaw -= dx * 0.0022;
      look.pitch -= dy * 0.0018;
      look.pitch = THREE.MathUtils.clamp(look.pitch, -1.1, 1.1);
      touchState.lookStartX = lookTouch.clientX;
      touchState.lookStartY = lookTouch.clientY;
    }
  },
  { passive: true }
);

window.addEventListener(
  'touchend',
  (event) => {
    for (const touch of event.changedTouches) {
      if (touch.identifier === touchState.moveId) {
        touchState.moveId = null;
        touchState.moveDeltaX = 0;
        touchState.moveDeltaY = 0;
      }
      if (touch.identifier === touchState.lookId) {
        touchState.lookId = null;
      }
    }
  },
  { passive: true }
);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
const baseCameraPos = new THREE.Vector3().copy(camera.position);

function updateMovement(delta) {
  const moveSpeed = 1.65;

  const touchForward = THREE.MathUtils.clamp(-touchState.moveDeltaY / 80, -1, 1);
  const touchStrafe = THREE.MathUtils.clamp(touchState.moveDeltaX / 80, -1, 1);

  const forwardInput = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0) + touchForward;
  const strafeInput = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + touchStrafe;

  const forward = new THREE.Vector3(Math.sin(look.yaw), 0, Math.cos(look.yaw));
  const right = new THREE.Vector3().crossVectors(forward, worldUp).normalize();

  direction.set(0, 0, 0);
  direction.addScaledVector(forward, forwardInput);
  direction.addScaledVector(right, strafeInput);

  if (direction.lengthSq() > 0.0001) {
    direction.normalize();
    velocity.lerp(direction.multiplyScalar(moveSpeed), Math.min(1, delta * 5));
  } else {
    velocity.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, delta * 4));
  }

  camera.position.addScaledVector(velocity, delta);
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.2, 5.2);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.2, 5.2);
  camera.position.y = baseCameraPos.y;
}

function animate() {
  const elapsed = clock.getElapsedTime();
  const delta = Math.min(0.045, clock.getDelta());

  updateMovement(delta);

  // Micro-animazioni obbligatorie
  const breathing = 1 + Math.sin(elapsed * 0.62) * 0.01;
  roomGroup.scale.set(breathing, 1 + Math.sin(elapsed * 0.58 + 0.7) * 0.008, breathing);

  keyLight.intensity = 1.15 + Math.sin(elapsed * 1.15) * 0.09;
  windowGlow.material.color.setHSL(0.2 + Math.sin(elapsed * 0.7) * 0.01, 0.72, 0.74 + Math.sin(elapsed * 2.3) * 0.03);

  const bob = Math.sin(elapsed * 0.8) * 0.025;
  const sway = Math.cos(elapsed * 0.55) * 0.012;
  camera.rotation.order = 'YXZ';
  camera.rotation.y = look.yaw + sway;
  camera.rotation.x = look.pitch + bob;
  camera.rotation.z = Math.sin(elapsed * 0.45) * 0.008;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
