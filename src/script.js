import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import galaxyVertexShader from './shaders/galaxy/vertex.glsl'
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl'

/**
 * Base
 */
// Debug
 const gui = new dat.GUI({width: 360});

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 200000;
parameters.size = .005;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = .5;
parameters.randomnessPower = 3;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () =>
{
    // Destroy Old Galaxy
    if(points !== null)
    {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    // Geometry
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count * 1)

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);


    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;
        // const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1) * parameters.randomness;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1) * parameters.randomness;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1) * parameters.randomness;

        positions[i3 + 0] = Math.cos(branchAngle) * radius + randomX;
        positions[i3 + 1] = 0 + randomY;
        positions[i3 + 2] = Math.sin(branchAngle) * radius + randomZ;

        // Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        // Scale
        scales[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    // Material
    // material = new THREE.PointsMaterial({
    //     size: parameters.size,
    //     sizeAttenuation: true,
    //     depthWrite: false,
    //     blending: THREE.AdditiveBlending,
    //     vertexColors: true
    // })
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        uniforms:
        {
            uTime: {value: 0},
            uSize: {value: 30 * renderer.getPixelRatio()}
        }

    })

    // Points
    points = new THREE.Points(geometry, material);
    scene.add(points);
}

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
// gui.add(parameters, 'size').min(.001).max(.1).step(.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(.01).max(20).step(.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
// gui.add(parameters, 'spin').min(-5).max(5).step(.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(0).max(2).step(.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(1).max(10).step(.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

/**
 *  Sizes
 */ 
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => 
{
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
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
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

generateGalaxy();

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Update Material
    material.uniforms.uTime.value = elapsedTime;

    // Updadate Controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();