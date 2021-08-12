import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
 const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Particles
 */
// Geometrty
const particlesGeometry = new THREE.BufferGeometry();
const count = 5000;

const positions = new Float32Array(count * 3);

for(let i = 0; i < count * 3; i++) 
{
    positions[i] = (Math.random() - .5) * 10;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: .1,
    sizeAttenuation: true,
}); 

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);

scene.add(particles);

/**
 *  Sizes
 */ 
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update Sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update Renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Updadate Controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();