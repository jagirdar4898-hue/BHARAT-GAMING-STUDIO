// --- Game Variables ---
let scene, camera, renderer, car;
let currentCarIndex = 0;
let coins = 0;
let speed = 0;
let gear = 1;
let isRacing = false;
let moveForward = false;
let moveBackward = false;

// 5 Cars Path (C capital ka dhyan rakha hai Car3 ke liye)
const carPaths = [
    'car1.glb', 
    'car2.glb', 
    'Car3/Car3.gltf', // Folder 'Car3' aur file 'Car3.gltf'
    'car4.glb', 
    'car5.glb'
];

const carPrices = [0, 500, 1500, 3000, 7000];

// --- 1. Splash Screen Logic ---
window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('main-menu').style.display = 'block';
            initGarage();
        }, 1000);
    }, 4000); // 4 seconds for BHARAT GAME STUDIO branding
};

// --- 2. 3D Engine Setup ---
function initGarage() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('car-canvas-container').appendChild(renderer.domElement);

    // Lights
    const light = new THREE.AmbientLight(0xffffff, 2);
    scene.add(light);
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(5, 10, 7);
    scene.add(sun);

    camera.position.set(0, 1.5, 5);
    loadCar(carPaths[currentCarIndex]);
    animate();
}

// --- 3. Car Loading Logic ---
function loadCar(path) {
    if(car) scene.remove(car);
    const loader = new THREE.GLTFLoader();
    
    loader.load(path, (gltf) => {
        car = gltf.scene;
        scene.add(car);
    }, undefined, (error) => {
        console.error("Car load nahi hui: " + path);
    });
}

// Car Selection Buttons
window.changeCar = (direction) => {
    currentCarIndex += direction;
    if(currentCarIndex < 0) currentCarIndex = carPaths.length - 1;
    if(currentCarIndex >= carPaths.length) currentCarIndex = 0;
    
    document.getElementById('car-name').innerText = `CAR ${currentCarIndex + 1}`;
    document.getElementById('car-price').innerText = carPrices[currentCarIndex] === 0 ? "STATUS: FREE" : `PRICE: ${carPrices[currentCarIndex]} COINS`;
    loadCar(carPaths[currentCarIndex]);
};

window.selectCar = () => {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('map-menu').style.display = 'block';
};

// --- 4. Race & Map System ---
window.startRace = (mapType) => {
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    isRacing = true;
    
    // Yahan Map load hoga based on mapType
    console.log("Starting Race on: " + mapType);
    setupEnvironment(mapType);
};

function setupEnvironment(type) {
    // Road setup
    const roadGeo = new THREE.PlaneGeometry(20, 1000);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);
    
    // Map specific colors/lighting
    if(type === 'snow-mountain') scene.background = new THREE.Color(0xffffff);
    if(type === 'desert') scene.background = new THREE.Color(0xedc9af);
}

// --- 5. Controls & Physics ---
const accelBtn = document.getElementById('accel-btn');
const brakeBtn = document.getElementById('brake-btn');
const hornBtn = document.getElementById('horn-btn');

accelBtn.onpointerdown = () => moveForward = true;
accelBtn.onpointerup = () => moveForward = false;
brakeBtn.onpointerdown = () => moveBackward = true;
brakeBtn.onpointerup = () => moveBackward = false;

hornBtn.onclick = () => {
    const audio = new Audio('https://www.myinstants.com/media/sounds/car-horn-01.mp3');
    audio.play();
};

// --- 6. Game Loop (Legend Speed) ---
function animate() {
    requestAnimationFrame(animate);

    if (isRacing && car) {
        // High Speed Logic
        if (moveForward) {
            speed += 0.5 * gear;
            if (speed > 250) speed = 250; // Max Legend Speed
        } else {
            speed *= 0.98; // Natural slowing
        }

        if (moveBackward) speed -= 1.5;

        car.position.z -= speed / 50;
        camera.position.z = car.position.z + 6;
        camera.lookAt(car.position);

        // Update UI
        document.getElementById('speed-num').innerText = Math.floor(speed);
        gear = speed > 150 ? 5 : speed > 100 ? 4 : speed > 60 ? 3 : speed > 30 ? 2 : 1;
        document.getElementById('gear-num').innerText = gear;
    } else if (car) {
        car.rotation.y += 0.01; // Garage rotation
    }

    renderer.render(scene, camera);
}

// Camera View Toggle
let viewMode = 0;
window.toggleCamera = () => {
    viewMode = (viewMode + 1) % 2;
    if(viewMode === 1) { // FPV (First Person)
        camera.position.set(0, 0.8, -0.2);
    } else { // TPV (Third Person)
        camera.position.set(0, 1.5, 5);
    }
};
