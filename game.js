// --- Bharat Game Studio: Ultimate Legend Racing Engine ---

let scene, camera, renderer, car;
let currentCarIndex = 0;
let coins = 0;
let speed = 0;
let gear = 1;
let isRacing = false;
let moveForward = false;
let moveBackward = false;
let trafficCars = [];

// Sahi Paths (GitHub Case-Sensitivity Fix)
const carPaths = [
    'car1.glb', 
    'car2.glb', 
    'Car3/car3.gltf', // Ensure folder is 'Car3' and file is 'Car3.gltf'
    'car4.glb', 
    'car5.glb'
];

const carPrices = [0, 0, 0, 0, 0];

// --- 1. Boot Sequence (Splash Screen) ---
window.onload = () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                document.getElementById('main-menu').style.display = 'block';
                initGameEngine(); 
            }, 800);
        }
    }, 3500); // Bharat Game Studio branding time
};

// --- 2. 3D Engine Setup (Fixes Black Screen & Mobile Size) ---
function initGameEngine() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky Blue

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance fix for mobile
    
    const container = document.getElementById('car-canvas-container');
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    // Hardcore Lighting (Sab kuch chamkane ke liye)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    loadCarModel(carPaths[currentCarIndex]);
    gameLoop();
}

// --- 3. Car Loading Logic ---
function loadCarModel(path) {
    if(car) scene.remove(car);
    const loader = new THREE.GLTFLoader();
    
    loader.load(path, (gltf) => {
        car = gltf.scene;
        car.position.set(0, 0, 0);
        scene.add(car);
        console.log("Model Loaded Successfully: " + path);
    }, undefined, (err) => {
        console.error("Error loading 3D model. Check path/names on GitHub.");
    });
}

// --- 4. Navigation Logic ---
window.changeCar = (dir) => {
    currentCarIndex = (currentCarIndex + dir + carPaths.length) % carPaths.length;
    document.getElementById('car-name').innerText = `CAR ${currentCarIndex + 1}`;
    document.getElementById('car-price').innerText = carPrices[currentCarIndex] === 0 ? "STATUS: FREE" : `BUY: ${carPrices[currentCarIndex]} 🪙`;
    loadCarModel(carPaths[currentCarIndex]);
};

window.selectCar = () => {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('map-menu').style.display = 'block';
};

window.backToGarage = () => {
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
};

// --- 5. Traffic & Environment System ---
function createTraffic() {
    const trafficGeo = new THREE.BoxGeometry(2, 1.2, 4);
    const logoTexture = new THREE.TextureLoader().load('1.png');
    const trafficMat = new THREE.MeshStandardMaterial({ map: logoTexture });

    for(let i=0; i<15; i++) {
        let tCar = new THREE.Mesh(trafficGeo, trafficMat);
        tCar.position.set(Math.random() * 14 - 7, 0.6, -Math.random() * 1000);
        scene.add(tCar);
        trafficCars.push(tCar);
    }
}

window.startRace = (mapType) => {
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    isRacing = true;
    
    createTraffic();
    setupTrack(mapType);
};

function setupTrack(type) {
    // Infinite Road Logic
    const roadGeo = new THREE.PlaneGeometry(20, 10000);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Map Specific Fog & Background
    if(type === 'legend-city') scene.background = new THREE.Color(0x0a0a1a);
    if(type === 'village') scene.background = new THREE.Color(0x559955);
    if(type === 'desert') scene.background = new THREE.Color(0xd2b48c);
    if(type === 'snow-mountain') scene.background = new THREE.Color(0xffffff);
}

// --- 6. Legend Controls (Mobile Optimized) ---
const accelBtn = document.getElementById('accel-btn');
const brakeBtn = document.getElementById('brake-btn');

const handleStart = (type) => { 
    if(type === 'gas') moveForward = true; 
    if(type === 'brake') moveBackward = true; 
};
const handleEnd = () => { moveForward = false; moveBackward = false; };

// Passive: false is important for preventDefault
accelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart('gas'); }, {passive: false});
accelBtn.addEventListener('touchend', handleEnd);
brakeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart('brake'); }, {passive: false});
brakeBtn.addEventListener('touchend', handleEnd);

window.toggleCamera = () => {
    if(camera.position.z > 2) camera.position.set(0, 0.8, 0.5); // FPV
    else camera.position.set(0, 3, 8); // TPV
};

// --- 7. Game Loop (High Speed Physics) ---
function gameLoop() {
    requestAnimationFrame(gameLoop);

    if (isRacing && car) {
        // Legend Speed & Gear Logic
        if (moveForward) {
            speed += 0.6 * gear;
            if (speed > 2800) speed = 2800; // Legend Max Speed
        } else {
            speed *= 0.985; // Slowing down naturally
        }
        if (moveBackward) speed -= 2.0;

        // Apply Speed to Car
        car.position.z -= speed / 600;
        
        // Camera Follow
        camera.position.z = car.position.z + 8;
        camera.position.x = car.position.x;
        camera.lookAt(car.position.x, 1, car.position.z - 15);

        // Traffic AI (Bharat Game Studio Logo Vehicles)
        trafficCars.forEach(t => {
            t.position.z += 0.8; 
            if(t.position.z > car.position.z + 20) t.position.z -= 1000;
        });

        // UI Dashboard Updates
        document.getElementById('speed-num').innerText = Math.floor(speed);
        gear = speed > 200 ? 5 : speed > 140 ? 4 : speed > 80 ? 3 : speed > 30 ? 2 : 1;
        document.getElementById('gear-num').innerText = gear;
        
        // Coins Calculation
        if(speed > 50) {
            coins += speed / 5000;
            document.getElementById('coin-count').innerText = Math.floor(coins);
        }
    } else if (car) {
        car.rotation.y += 0.015; // Cool rotation in Garage
    }

    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
