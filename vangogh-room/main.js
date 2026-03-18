import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x95a2bf);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.75, 4.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();

function loadTexture(path, setup, fallbackColor = 0xffffff) {
  const fallback = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  fallback.colorSpace = THREE.SRGBColorSpace;
  fallback.needsUpdate = true;

  const texture = textureLoader.load(
    path,
    (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      if (setup) setup(loaded);
      loaded.needsUpdate = true;
    },
    undefined,
    () => {
      // Keep fallback if texture is unavailable.
    }
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  if (setup) setup(texture);
  texture.userData.fallbackColor = fallbackColor;
  return texture;
}

const wallTexture = loadTexture('./assets/textures/wall_texture.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.1, 1.2);
});

const floorTexture = loadTexture('./assets/textures/floor_texture.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.5, 2.9);
  texture.rotation = 0.02;
});

const woodTexture = loadTexture('./assets/textures/wood_texture.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.3, 1.1);
});

const windowTexture = loadTexture('./assets/textures/window_texture.jpg', (texture) => {
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
});

const roomGroup = new THREE.Group();
scene.add(roomGroup);

const wallTints = [0x88a5d9, 0x84a2d3, 0x96b0df, 0x7fa0d2, 0x98b5df, 0x87a5d5];
const roomMaterials = wallTints.map(
  (tint) =>
    new THREE.MeshStandardMaterial({
      map: wallTexture,
      color: tint,
      roughness: 0.88,
      metalness: 0.03,
      side: THREE.BackSide,
    })
);

const room = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 12), roomMaterials);
room.position.y = 3;
roomGroup.add(room);

const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorTexture,
  color: 0xc28e67,
  roughness: 0.93,
  metalness: 0.02,
});

const floor = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 11.4), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.02;
roomGroup.add(floor);

const ambient = new THREE.AmbientLight(0xffe7be, 0.72);
scene.add(ambient);

const keyLight = new THREE.PointLight(0xffdfa2, 1.24, 32, 1.8);
keyLight.position.set(-1.1, 3.9, -2.2);
scene.add(keyLight);

const windowLight = new THREE.PointLight(0xfff1b8, 1.5, 22, 2);
windowLight.position.set(-1.45, 3.2, -5.35);
scene.add(windowLight);

const fillLight = new THREE.PointLight(0xaac0ff, 0.32, 22, 2);
fillLight.position.set(3.3, 2.5, 3.8);
scene.add(fillLight);

const woodMatBed = new THREE.MeshStandardMaterial({
  map: woodTexture,
  color: 0xc48347,
  roughness: 0.82,
  metalness: 0.04,
});

const woodMatTable = new THREE.MeshStandardMaterial({
  map: woodTexture,
  color: 0xbb7a43,
  roughness: 0.86,
  metalness: 0.04,
});

const chairMat = new THREE.MeshStandardMaterial({
  map: woodTexture,
  color: 0xd2c56f,
  roughness: 0.9,
  metalness: 0.02,
});

// Letto (destro, grande, inclinato)
const bed = new THREE.Group();
const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 1.95), woodMatBed);
bedFrame.position.y = 0.66;
bed.add(bedFrame);

const mattress = new THREE.Mesh(
  new THREE.BoxGeometry(3.35, 0.38, 1.74),
  new THREE.MeshStandardMaterial({ color: 0xe3cc85, roughness: 0.95, metalness: 0.01 })
);
mattress.position.set(0, 1.07, 0.03);
bed.add(mattress);

const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.55, 1.98), woodMatBed);
headboard.position.set(1.76, 1.35, 0);
bed.add(headboard);

bed.position.set(3.55, 0, 0.35);
bed.rotation.y = -0.16;
roomGroup.add(bed);

// Finestra (frontale, luminosa con emissive)
const windowFrame = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2.05),
  new THREE.MeshStandardMaterial({
    map: windowTexture,
    color: 0x7da269,
    roughness: 0.78,
    metalness: 0.05,
  })
);
windowFrame.position.set(-1.5, 3.1, -5.96);
roomGroup.add(windowFrame);

const windowGlowMaterial = new THREE.MeshStandardMaterial({
  map: windowTexture,
  emissiveMap: windowTexture,
  color: 0xd3e8a9,
  emissive: 0x9abf63,
  emissiveIntensity: 1.1,
  roughness: 0.35,
  metalness: 0.02,
});
const windowGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.72), windowGlowMaterial);
windowGlow.position.set(-1.5, 3.08, -5.94);
roomGroup.add(windowGlow);

// Sedia (semplice, inclinata, decentrata)
const chair = new THREE.Group();

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

const top = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 0.9), woodMatTable);
top.position.y = 1.16;
table.add(top);

[
  [-0.51, 0.58, -0.31],
  [0.48, 0.58, -0.34],
  [-0.49, 0.58, 0.31],
  [0.45, 0.58, 0.34],
].forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), woodMatTable);
  leg.position.set(x, y, z);
  table.add(leg);
});

table.position.set(-3.35, 0, -3.8);
table.rotation.y = -0.18;
table.rotation.z = 0.02;
roomGroup.add(table);

// --- Movimento ---
const keys = { forward: false, backward: false, left: false, right: false };

const look = { yaw: Math.PI, pitch: -0.03 };

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
const bgHSL = { h: 0.62, s: 0.26, l: 0.66 };

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

  keyLight.intensity = 1.24 + Math.sin(elapsed * 1.08) * 0.11;
  windowLight.intensity = 1.5 + Math.sin(elapsed * 1.6 + 0.4) * 0.16;

  const glowPulse = 1.05 + Math.sin(elapsed * 1.3 + 0.3) * 0.1 + Math.sin(elapsed * 3.6) * 0.03;
  windowGlowMaterial.emissiveIntensity = glowPulse;

  const globalTint = Math.sin(elapsed * 0.31) * 0.01;
  scene.background.setHSL(bgHSL.h + globalTint, bgHSL.s, bgHSL.l + globalTint * 0.8);
  ambient.color.setHSL(0.11 + globalTint * 0.45, 0.55, 0.79);

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
