// --- BHARAT GAME STUDIO: ULTIMATE LEGEND ENGINE ---

let scene, camera, renderer, car;
let currentCarIndex = localStorage.getItem('selectedCar') ? parseInt(localStorage.getItem('selectedCar')) : 0;
let coins = 0, speed = 0, gear = 1, isRacing = false;
let moveForward = false, moveBackward = false;
let trafficCars = [];

// GitHub Friendly Paths
const carPaths = [
    './car1.glb', 
    './car2.glb', 
    './Car3/car3.gltf', 
    './car4.glb', 
    './car5.glb'
];

// --- 1. Boot Logic ---
window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('main-menu').style.display = 'block';
        initEngine();
        updateMenuUI();
    }, 3000);
};

// --- 2. 3D Engine Initialization ---
function initEngine() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Default Sky
    scene.fog = new THREE.Fog(0x87CEEB, 10, 800);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const container = document.getElementById('car-canvas-container');
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    // High Quality Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(0, 50, 20);
    scene.add(sun);

    camera.position.set(0, 3, 10);
    loadCarModel(carPaths[currentCarIndex]);
    gameLoop();
}

// --- 3. Car Loading & Save System ---
function loadCarModel(path) {
    if(car) scene.remove(car);
    const loader = new THREE.GLTFLoader();
    loader.load(path, (gltf) => {
        car = gltf.scene;
        scene.add(car);
    }, undefined, (err) => {
        // Error par red box dikhega
        const box = new THREE.Mesh(new THREE.BoxGeometry(2,1,4), new THREE.MeshBasicMaterial({color:0xff0000}));
        car = box;
        scene.add(car);
    });
}

function updateMenuUI() {
    document.getElementById('car-name').innerText = `CAR ${currentCarIndex + 1}`;
    localStorage.setItem('selectedCar', currentCarIndex); // Permanent Save
    loadCarModel(carPaths[currentCarIndex]);
}

window.changeCar = (dir) => {
    currentCarIndex = (currentCarIndex + dir + carPaths.length) % carPaths.length;
    updateMenuUI();
};

// --- 4. Map & Traffic Logic ---
window.startRace = (mapType) => {
    document.getElementById('map-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    isRacing = true;
    setupEnvironment(mapType);
    for(let i=0; i<40; i++) createTraffic(); // Extra Traffic
};

function setupEnvironment(type) {
    // Road Plane
    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 20000),
        new THREE.MeshStandardMaterial({color: 0x222222})
    );
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Map Specific Backgrounds
    const colors = {
        'legend-city': 0x0a0a1a,
        'village': 0x44aa44,
        'desert': 0xd2b48c,
        'snow-mountain': 0xffffff
    };
    const c = colors[type] || 0x87CEEB;
    scene.background = new THREE.Color(c);
    scene.fog.color.set(c);
}

function createTraffic() {
    const tGeo = new THREE.BoxGeometry(2.5, 1.5, 5);
    const tMat = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('1.png') });
    let tCar = new THREE.Mesh(tGeo, tMat);
    const lanes = [-8, -3, 3, 8];
    tCar.position.set(lanes[Math.floor(Math.random()*lanes.length)], 0.75, -Math.random()*2000);
    scene.add(tCar);
    trafficCars.push(tCar);
}

// --- 5. Gameplay & Camera Views ---
window.toggleCamera = () => {
    // Switch between TPV and FPV
    if(camera.position.z > 5) {
        camera.position.set(0, 1, 0.5); // Inside View
    } else {
        camera.position.set(0, 3, 10); // Outside View
    }
};

function playHorn() {
    const audio = new Audio('https://www.myinstants.com/media/sounds/car-horn-01.mp3');
    audio.play();
}

// --- 6. Physics & Collision (Out System) ---
function gameLoop() {
    requestAnimationFrame(gameLoop);
    if (isRacing && car) {
        // Acceleration
        if (moveForward) speed += 0.5; else speed *= 0.98;
        car.position.z -= speed / 60;
        
        // Camera Follow
        camera.position.z = car.position.z + (camera.position.z > car.position.z + 5 ? 10 : 0.5);
        camera.position.x = car.position.x;
        camera.lookAt(car.position.x, 1, car.position.z - 15);

        // Traffic & Collision
        trafficCars.forEach(t => {
            t.position.z += 0.5; // Traffic moving
            if(car.position.distanceTo(t.position) < 3.8) {
                alert("CRASHED! BHARAT GAME STUDIO");
                location.reload(); // Out Logic
            }
            if(t.position.z > car.position.z + 20) t.position.z -= 2000;
        });

        // UI Dashboard
        document.getElementById('speed-num').innerText = Math.floor(speed);
        gear = speed > 18000 ? 5 : speed > 18000 ? 3 : 1;
        document.getElementById('gear-num').innerText = gear;
    } else if(car) {
        car.rotation.y += 0.01; // Garage Spin
    }
    renderer.render(scene, camera);
}

// Mobile Controls Fix
const btnGas = document.getElementById('accel-btn');
const btnBrake = document.getElementById('brake-btn');

btnGas.onpointerdown = (e) => { e.preventDefault(); moveForward = true; };
btnGas.onpointerup = () => moveForward = false;
btnBrake.onpointerdown = (e) => { e.preventDefault(); moveBackward = true; };
btnBrake.onpointerup = () => moveBackward = false;
