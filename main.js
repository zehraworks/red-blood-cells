import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 10, 10);
dirLight.castShadow = true;
scene.add(dirLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const loader = new OBJLoader();
const redBloodCells = [];

loader.load("/rbc-model.obj", (object) => {
  object.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  object.position.set(
    Math.random() * 20 - 10,
    Math.random() * 20 - 10,
    Math.random() * 20 - 10
  );

  object.scale.set(0.1, 0.1, 0.1);

  for (let i = 0; i < 80; i++) {
    const cell = object.clone();
    cell.position.set(
      Math.random() * 50 - 25, 
      Math.random() * 50 - 25,
      Math.random() * 50 - 25
    );
    cell.rotation.set(
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI
    );
    redBloodCells.push(cell);
    scene.add(cell);
  }
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 50;

const mouse = new THREE.Vector2();
const mousePos = new THREE.Vector3();
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
  requestAnimationFrame(animate);

  const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  mousePos.copy(camera.position).add(dir.multiplyScalar(distance));

  redBloodCells.forEach((cell) => {
    const dx = cell.position.x - mousePos.x;
    const dy = cell.position.y - mousePos.y;
    const dz = cell.position.z - mousePos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const force = Math.max(0, 1 - dist / 10);
    const mouseOverForce = 10; 

    if (dist < 3) {
      cell.position.x += dx * force * mouseOverForce * 0.05;
      cell.position.y += dy * force * mouseOverForce * 0.05;
      cell.position.z += dz * force * mouseOverForce * 0.05;
    } else {
      cell.position.x += dx * force * 0.05;
      cell.position.y += dy * force * 0.05;
      cell.position.z += dz * force * 0.05;
    }

    cell.rotation.x += 0.01;
    cell.rotation.y += 0.01;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
