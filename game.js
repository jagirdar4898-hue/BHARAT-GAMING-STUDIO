// --- Bharat Game Studio: Legend Racing Engine ---

let scene, camera, renderer, car;
let currentCarIndex = 0;
let coins = 0;
let speed = 0;
let gear = 1;
let isRacing = false;
let moveForward = false;
let moveBackward = false;
let trafficCars = [];

// Sahi Paths (CORS aur Case-Sensitivity fix)
const carPaths = [
    'car1.glb', 
    'car2.glb', 
    'Car3/car3.gltf', 
    'car4.glb', 
    'car5.glb'
];

const carPrices = [0, 5000, 15000, 30000, 70000];

// --- 1. Boot Sequence ---
window.onload = () => {
    // Logo Splash Screen
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                document.getElementById('main-menu').style.display = 'block';
                initGameEngine(); 
            }, 1000);
        }
    }, 3000);
};

// --- 2. Engine Initialization (Fixes Black Screen) ---
function initGameEngine() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky Blue starting

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const container = document.getElementById('car-canvas-container');
    if(container) container.appendChild(renderer.domElement);

    // Lighting (Bina iske car black dikhti hai)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(5, 15, 10);
    scene.add(sunLight);

    camera.position.set(0, 2, 6);
    camera.lookAt(0, 1, 0);

    loadCarModel(carPaths[currentCarIndex]);
    gameLoop();
}

// --- 3. Car & Texture Loading ---
function loadCarModel(path) {
    if(car) scene.remove(car);
    const loader = new THREE.GLTFLoader();
    
    loader.load(path, (gltf) => {
        car = gltf.scene;
        car.position.set(0, 0, 0);
        scene.add(car);
        console.log("Legend Car Loaded: " + path);
    }, undefined, (err) => {
        console.error("Path Error: Check if your folders and files match exactly.");
    });
}

// --- 4. Menu & Garage Logic ---
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

// --- 5. Traffic System (Bharat Game Studio Branding) ---
function createTraffic() {
    const trafficGeo = new THREE.BoxGeometry(2, 1.5, 4);
    // Logo Texture for Traffic
    const logoTexture = new THREE.TextureLoader().load('1.png');
    const trafficMat = new THREE.MeshStandardMaterial({ map: logoTexture });

    for(let i=0; i<10; i++) {
        let tCar = new THREE.Mesh(trafficGeo, trafficMat);
        tCar.position.set(Math.random() * 10 - 5, 0.75, -Math.random() * 500);
        scene.add(tCar);
        trafficCars.push(tCar);
    }
}

// --- 6. Race & Map Setup ---
window.startRace = (mapType) => {
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    isRacing = true;
    
    createTraffic();
    setupTrack(mapType);
};

function setupTrack(type) {
    const roadGeo = new THREE.PlaneGeometry(25, 5000);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Map Types
    if(type === 'legend-city') scene.background = new THREE.Color(0x111122); 
    if(type === 'village') scene.background = new THREE.Color(0x44aa44);
    if(type === 'snow-mountain') scene.background = new THREE.Color(0xeeeeee);
    if(type === 'desert') scene.background = new THREE.Color(0xd2b48c);
}

// --- 7. Controls & Input ---
const accelBtn = document.getElementById('accel-btn');
const brakeBtn = document.getElementById('brake-btn');

accelBtn.addEventListener('pointerdown', () => moveForward = true);
accelBtn.addEventListener('pointerup', () => moveForward = false);
brakeBtn.addEventListener('pointerdown', () => moveBackward = true);
brakeBtn.addEventListener('pointerup', () => moveBackward = false);

window.toggleCamera = () => {
    if(camera.position.z < 2) camera.position.set(0, 2, 6); // TPV
    else camera.position.set(0, 0.8, 0.2); // FPV
};

// --- 8. Legend Game Loop ---
function gameLoop() {
    requestAnimationFrame(gameLoop);

    if (isRacing && car) {
        // High Speed Physics
        if (moveForward) {
            speed += 0.4 * gear;
            if (speed > 250) speed = 250;
        } else {
            speed *= 0.98;
        }

        if (moveBackward) speed -= 1.0;

        // Move Car
        car.position.z -= speed / 60;
        camera.position.z = car.position.z + 5;
        camera.position.x = car.position.x;
        camera.lookAt(car.position.x, 1, car.position.z - 10);

        // Traffic Movement
        trafficCars.forEach(t => {
            t.position.z += 0.5; // Opposite side movement
            if(t.position.z > car.position.z + 20) t.position.z -= 500; // Respawn
        });

        // UI Updates
        document.getElementById('speed-num').innerText = Math.floor(speed);
        gear = speed > 160 ? 5 : speed > 110 ? 4 : speed > 70 ? 3 : speed > 30 ? 2 : 1;
        document.getElementById('gear-num').innerText = gear;
        
        // Coins Earn
        if(speed > 100) coins += 0.01;
        document.getElementById('coin-count').innerText = Math.floor(coins);
    } else if (car) {
        car.rotation.y += 0.01; // Menu rotation
    }

    renderer.render(scene, camera);
    }
