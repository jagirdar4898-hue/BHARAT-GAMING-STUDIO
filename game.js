// --- Bharat Game Studio: Pro Legend Racing Engine ---

let scene, camera, renderer, car;
let currentCarIndex = localStorage.getItem('selectedCar') ? parseInt(localStorage.getItem('selectedCar')) : 0;
let coins = 0;
let speed = 0;
let gear = 1;
let isRacing = false;
let moveForward = false;
let moveBackward = false;
let trafficCars = [];
let currentMap = 'legend-city';

// Sahi Paths
const carPaths = [
    'car1.glb', 
    'car2.glb', 
    'Car3/Car3.gltf', 
    'car4.glb', 
    'car5.glb'
];

const carPrices = [0, 500, 1500, 3000, 7000];

// --- 1. Boot Sequence ---
window.onload = () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            document.getElementById('main-menu').style.display = 'block';
            initGameEngine(); 
            updateMenuUI(); // Saved car load karne ke liye
        }, 800);
    }, 3000);
};

// --- 2. 3D Engine Setup (Fixes Black Screen) ---
function initGameEngine() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    // Fog add kiya taaki door tak black na dikhe
    scene.fog = new THREE.Fog(0x87CEEB, 10, 500);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const container = document.getElementById('car-canvas-container');
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    // Global Lighting (Isse maps black nahi honge)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
    scene.add(hemiLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 50, 10);
    scene.add(sunLight);

    camera.position.set(0, 3, 10);
    loadCarModel(carPaths[currentCarIndex]);
    gameLoop();
}

// --- 3. Car & UI Sync ---
function loadCarModel(path) {
    if(car) scene.remove(car);
    const loader = new THREE.GLTFLoader();
    
    // Performance fix: Loading bar dikha sakte ho yahan
    loader.load(path, (gltf) => {
        car = gltf.scene;
        scene.add(car);
    }, undefined, (err) => {
        console.error("Path Error: Check file names.");
    });
}

function updateMenuUI() {
    document.getElementById('car-name').innerText = `CAR ${currentCarIndex + 1}`;
    document.getElementById('car-price').innerText = carPrices[currentCarIndex] === 0 ? "STATUS: OWNED" : `BUY: ${carPrices[currentCarIndex]} 🪙`;
    loadCarModel(carPaths[currentCarIndex]);
}

window.changeCar = (dir) => {
    currentCarIndex = (currentCarIndex + dir + carPaths.length) % carPaths.length;
    // Local Storage Save
    localStorage.setItem('selectedCar', currentCarIndex);
    updateMenuUI();
};

// --- 4. Map & Traffic Logic ---
window.startRace = (mapType) => {
    currentMap = mapType;
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    isRacing = true;
    
    setupTrack(mapType);
    // Traffic Bada diya
    for(let i=0; i<25; i++) createTraffic();
};

function setupTrack(type) {
    const roadGeo = new THREE.PlaneGeometry(25, 10000);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    const colors = {
        'legend-city': 0x0a0a1a,
        'village': 0x559955,
        'desert': 0xd2b48c,
        'snow-mountain': 0xffffff
    };
    const mapColor = colors[type] || 0x87CEEB;
    scene.background = new THREE.Color(mapColor);
    scene.fog.color.set(mapColor);
}

function createTraffic() {
    const trafficGeo = new THREE.BoxGeometry(2.5, 1.5, 5);
    const logoTexture = new THREE.TextureLoader().load('1.png');
    const trafficMat = new THREE.MeshStandardMaterial({ map: logoTexture });

    let tCar = new THREE.Mesh(trafficGeo, trafficMat);
    // Lanes: -7, -2.5, 2.5, 7
    const lanes = [-7, -2.5, 2.5, 7];
    tCar.position.set(lanes[Math.floor(Math.random() * lanes.length)], 0.75, -Math.random() * 1500);
    scene.add(tCar);
    trafficCars.push(tCar);
}

// --- 5. Controls ---
const accelBtn = document.getElementById('accel-btn');
const brakeBtn = document.getElementById('brake-btn');

accelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveForward = true; }, {passive: false});
accelBtn.addEventListener('touchend', () => moveForward = false);
brakeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveBackward = true; }, {passive: false});
brakeBtn.addEventListener('touchend', () => moveBackward = false);

window.toggleCamera = () => {
    // Multi-View System
    if(camera.position.z > 5) {
        camera.position.set(0, 0.8, 0.5); // Dashboard View
    } else {
        camera.position.set(0, 3, 10); // Follow View
    }
};

// --- 6. Physics & Collision (The Heart) ---
function gameLoop() {
    requestAnimationFrame(gameLoop);

    if (isRacing && car) {
        // Speed Logic
        if (moveForward) {
            speed += 0.5 * gear;
            if (speed > 250) speed = 250;
        } else {
            speed *= 0.985;
        }
        if (moveBackward) speed -= 1.5;

        car.position.z -= speed / 60;
        
        // Camera Smoothing
        camera.position.z = car.position.z + (camera.position.z > car.position.z + 5 ? 10 : 0.5);
        camera.position.x = car.position.x;
        camera.lookAt(car.position.x, 1, car.position.z - 20);

        // Traffic AI & Collision
        trafficCars.forEach(t => {
            t.position.z += 0.5; // Traffic aage badhega
            
            // Out System (Takkar Logic)
            let diffX = Math.abs(car.position.x - t.position.x);
            let diffZ = Math.abs(car.position.z - t.position.z);
            
            if(diffX < 2.2 && diffZ < 4.5) {
                isRacing = false;
                alert("OUT! BHARAT GAME STUDIO - TRY AGAIN");
                location.reload(); // Game Restart
            }

            if(t.position.z > car.position.z + 30) t.position.z -= 1500;
        });

        // UI Updates
        document.getElementById('speed-num').innerText = Math.floor(speed);
        gear = speed > 180 ? 5 : speed > 120 ? 4 : speed > 70 ? 3 : speed > 30 ? 2 : 1;
        document.getElementById('gear-num').innerText = gear;
        
        // Coins
        if(speed > 100) {
            coins += 0.05;
            document.getElementById('coin-count').innerText = Math.floor(coins);
        }
    } else if (car) {
        car.rotation.y += 0.01; // Garage Rotation
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
