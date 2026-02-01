<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>

<script>
// 1. Splash Screen Logic
window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('garage-menu').style.display = 'block';
            init3DMenu(); // Garage start hoga
        }, 1000);
    }, 3000); // 3 second tak "BHARAT GAME STUDIO" dikhega
};

// 2. 3D Scene Setup
let scene, camera, renderer, car;

function init3DMenu() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('car-3d-display').appendChild(renderer.domElement);

    // Light (Bina light ke car kaali dikhegi)
    const light = new THREE.AmbientLight(0xffffff, 2);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 5;
    camera.position.y = 1;

    // Car Loading Logic
    const loader = new THREE.GLTFLoader();
    loader.load('car1.glb', function(gltf) {
        car = gltf.scene;
        scene.add(car);
        animate();
    }, undefined, function(error) {
        console.error("Car load nahi hui! Check file path.");
    });
}

function animate() {
    requestAnimationFrame(animate);
    if(car) car.rotation.y += 0.01; // Menu mein car ghumti rahegi
    renderer.render(scene, camera);
}
</script>
