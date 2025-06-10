// Main Solar System Simulation
document.addEventListener("DOMContentLoaded", async () => {
  // Show loading screen
  const loadingScreen = document.getElementById("loading-screen");
  const progressBar = document.querySelector(".progress-bar");

  // Simulate loading progress
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
    }
    progressBar.style.width = `${progress}%`;
  }, 200);

  // Create texture loader
  const textureLoader = new THREE.TextureLoader();

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 50, 100);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  // Orbit controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 20;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI * 0.9;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 3, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Starfield
  createStarfield(scene);

  // Solar system parameters
  const planets = [
    {
      name: "Mercury",
      texture: "/assets/mercury.png",
      size: 0.8,
      distance: 28,
      speed: 0.04,
      rotationSpeed: 0.004,
      color: 0x8b8b8b,
      info: "The smallest planet in our solar system and closest to the Sun.",
    },
    {
      name: "Venus",
      texture: "/assets/venus.webp",
      size: 1.5,
      distance: 44,
      speed: 0.015,
      rotationSpeed: 0.002,
      color: 0xe6c229,
      info: "Similar in size to Earth, with a toxic atmosphere of carbon dioxide.",
    },
    {
      name: "Earth",
      texture: "/assets/earth.png",
      size: 1.6,
      distance: 62,
      speed: 0.01,
      rotationSpeed: 0.01,
      color: 0x6b93d6,
      info: "Our home planet, the only known place in the universe with life.",
    },
    {
      name: "Mars",
      texture: "/assets/mars.png",
      size: 1.2,
      distance: 95,
      speed: 0.008,
      rotationSpeed: 0.008,
      color: 0x993d00,
      info: "Known as the Red Planet due to iron oxide on its surface.",
    },
    {
      name: "Jupiter",
      texture: "/assets/Jupiter.webp",
      size: 3.5,
      distance: 130,
      speed: 0.002,
      rotationSpeed: 0.02,
      color: 0xb07f35,
      info: "The largest planet in our solar system, a gas giant with a Great Red Spot.",
    },
    {
      name: "Saturn",
      texture: "/assets/Saturn.webp",
      size: 3.0,
      distance: 160,
      speed: 0.0009,
      rotationSpeed: 0.015,
      color: 0xdcd0a1,
      hasRing: true,
      info: "Famous for its beautiful ring system made of ice and rock particles.",
    },
    {
      name: "Uranus",
      texture: "/assets/Uranus.png",
      size: 2.5,
      distance: 190,
      speed: 0.0004,
      rotationSpeed: 0.005,
      color: 0xc1e3e3,
      info: "An ice giant that rotates on its side, with a tilted axis of 98 degrees.",
    },
    {
      name: "Neptune",
      texture: "/assets/Neptune.webp",
      size: 2.5,
      distance: 220,
      speed: 0.0001,
      rotationSpeed: 0.005,
      color: 0x5b5ddf,
      info: "The windiest planet with the strongest winds in the solar system.",
    },
  ];

  // Load textures
  const loadTextures = async () => {
    const texturePromises = planets.map((planet) => {
      return new Promise((resolve) => {
        textureLoader.load(
          planet.texture,
          (texture) => {
            planet.loadedTexture = texture;
            resolve();
          },
          undefined,
          () => {
            // Fallback if texture fails to load
            planet.loadedTexture = null;
            resolve();
          }
        );
      });
    });

    await Promise.all(texturePromises);
  };

  await loadTextures();

  // Create sun
  // Create sun
  const sunGeometry = new THREE.SphereGeometry(10, 64, 64);
  const sunMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load(
      "assets/sun.png"
    ),
    emissive: 0xfdb813,
    emissiveIntensity: 1,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Sun glow effect
  const sunGlowGeometry = new THREE.SphereGeometry(12, 32, 32);
  const sunGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xfdb813,
    transparent: true,
    opacity: 0.3,
  });
  const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
  scene.add(sunGlow);

  // Add point light for sun
  const sunLight = new THREE.PointLight(0xfdb813, 2, 500);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  // Create planets
  const planetObjects = planets.map((planet) => {
    const geometry = new THREE.SphereGeometry(planet.size, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: planet.loadedTexture || null,
      color: planet.loadedTexture ? 0xffffff : planet.color,
      shininess: 10,
      specular: new THREE.Color(0x333333),
    });
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    // Position planet
    planetMesh.position.x = planet.distance;

    // Add orbit path
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x555555,
      transparent: true,
      opacity: 0.2,
      linewidth: 1,
    });
    const orbitPoints = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      orbitPoints.push(
        new THREE.Vector3(
          planet.distance * Math.cos(theta),
          0,
          planet.distance * Math.sin(theta)
        )
      );
    }
    orbitGeometry.setFromPoints(orbitPoints);
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

    // Create group for planet and orbit
    const planetGroup = new THREE.Group();
    planetGroup.add(planetMesh);
    planetGroup.add(orbit);
    scene.add(planetGroup);

    // Set initial position on the orbit
    const angle = Math.random() * Math.PI * 2;
    planetMesh.position.set(
      planet.distance * Math.cos(angle),
      0,
      planet.distance * Math.sin(angle)
    );

    return {
      name: planet.name,
      mesh: planetMesh,
      group: planetGroup,
      orbit: orbit,
      speed: planet.speed,
      rotationSpeed: planet.rotationSpeed,
      distance: planet.distance,
      angle: angle,
      info: planet.info,
    };
  });

  // Special handling for Saturn's rings
  const saturn = planetObjects.find((p) => p.name === "Saturn");
  if (saturn) {
    const ringGeometry = new THREE.RingGeometry(
      saturn.mesh.geometry.parameters.radius * 1.5,
      saturn.mesh.geometry.parameters.radius * 2.2,
      64
    );
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0xdcd0a1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      specular: new THREE.Color(0x111111),
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    saturn.mesh.add(ring);
    saturn.ring = ring;
  }

  // Create speed controls
  const speedControlsContainer = document.getElementById("speed-controls");
  planetObjects.forEach((planet) => {
    const controlGroup = document.createElement("div");
    controlGroup.className = "control-group";

    const label = document.createElement("label");
    label.textContent = planet.name;
    label.htmlFor = `speed-${planet.name.toLowerCase()}`;

    // Add planet icon
    const icon = document.createElement("i");
    icon.className = "fas fa-globe";
    icon.style.color = planetObjects
      .find((p) => p.name === planet.name)
      .mesh.material.color.getHexString();
    label.prepend(icon);

    const input = document.createElement("input");
    input.type = "range";
    input.id = `speed-${planet.name.toLowerCase()}`;
    input.min = "0";
    input.max = "0.1";
    input.step = "0.001";
    input.value = planet.speed;

    input.addEventListener("input", (e) => {
      planet.speed = parseFloat(e.target.value);
    });

    controlGroup.appendChild(label);
    controlGroup.appendChild(input);
    speedControlsContainer.appendChild(controlGroup);
  });

  // Animation state
  let isAnimating = true;
  const toggleAnimationBtn = document.getElementById("toggle-animation");
  toggleAnimationBtn.addEventListener("click", () => {
    isAnimating = !isAnimating;
    toggleAnimationBtn.innerHTML = isAnimating
      ? '<i class="fas fa-pause"></i>'
      : '<i class="fas fa-play"></i>';
    toggleAnimationBtn.title = isAnimating ? "Pause" : "Resume";
  });

  // Dark/light mode toggle
  const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
  toggleDarkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    toggleDarkModeBtn.innerHTML = document.body.classList.contains("light-mode")
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    toggleDarkModeBtn.title = document.body.classList.contains("light-mode")
      ? "Dark Mode"
      : "Light Mode";
  });

  // Reset camera
  document.getElementById("reset-camera").addEventListener("click", () => {
    gsap.to(camera.position, {
      x: 0,
      y: 50,
      z: 100,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        controls.target.set(0, 0, 0);
        controls.update();
      },
    });
  });

  // Toggle orbits visibility
  document.getElementById("toggle-orbits").addEventListener("click", () => {
    planetObjects.forEach((planet) => {
      planet.group.children[1].visible = !planet.group.children[1].visible;
    });
  });

  // Planet labels and info
  const planetLabelsContainer = document.getElementById("planet-labels");
  const planetInfoContainer = document.getElementById("planet-info");

  planetObjects.forEach((planet) => {
    const label = document.createElement("div");
    label.className = "planet-label";
    label.textContent = planet.name;
    label.id = `label-${planet.name.toLowerCase()}`;
    planetLabelsContainer.appendChild(label);

    planet.mesh.userData = {
      label: label,
      info: planet.info,
    };
  });

  // Raycaster for hover detection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredPlanet = null;

  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
      planetObjects.map((p) => p.mesh)
    );

    // Hide all labels first
    planetObjects.forEach((planet) => {
      planet.mesh.userData.label.classList.remove("active");
    });

    if (intersects.length > 0) {
      const planetMesh = intersects[0].object;
      const label = planetMesh.userData.label;
      const planetPosition = planetMesh.getWorldPosition(new THREE.Vector3());
      const screenPosition = planetPosition.clone().project(camera);

      label.style.left = `${(screenPosition.x * 0.5 + 0.5) * 100}%`;
      label.style.top = `${(-(screenPosition.y * 0.5) + 0.5) * 100}%`;
      label.classList.add("active");

      hoveredPlanet = planetMesh;

      // Update info panel
      planetInfoContainer.innerHTML = `
                <h4>${planetMesh.userData.label.textContent}</h4>
                <p>${planetMesh.userData.info}</p>
            `;
    } else {
      hoveredPlanet = null;
      if (
        planetInfoContainer.children.length === 0 ||
        planetInfoContainer.querySelector(".info-placeholder") === null
      ) {
        planetInfoContainer.innerHTML = `
          <div class="info-placeholder">
            <i class="fas fa-globe-americas"></i>
            <p>Hover or click on a planet to see details</p>
          </div>
        `;
      }
    }
  });

  // Click to zoom
  window.addEventListener("click", () => {
    if (hoveredPlanet) {
      const planetPosition = hoveredPlanet.getWorldPosition(
        new THREE.Vector3()
      );

      gsap.to(camera.position, {
        x: planetPosition.x * 1.5,
        y: planetPosition.y + 10,
        z: planetPosition.z * 1.5,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          controls.target.copy(planetPosition);
          controls.update();
        },
      });
    }
  });

  // Mobile menu toggle
  const toggleMenuBtn = document.getElementById("toggle-menu");
  const infoPanel = document.getElementById("info-panel");
  const controlsPanel = document.getElementById("controls-panel");
  const showInfoBtn = document.getElementById("show-info");
  const showControlsBtn = document.getElementById("show-controls");
  const closeInfoBtn = document.getElementById("close-info");
  const closeControlsBtn = document.getElementById("close-controls");

  toggleMenuBtn.addEventListener("click", () => {
    infoPanel.classList.toggle("mobile-collapsed");
    controlsPanel.classList.toggle("mobile-collapsed");
  });

  showInfoBtn.addEventListener("click", () => {
    infoPanel.style.display = "block";
    controlsPanel.style.display = "none";
    showInfoBtn.classList.add("active");
    showControlsBtn.classList.remove("active");
  });

  showControlsBtn.addEventListener("click", () => {
    infoPanel.style.display = "none";
    controlsPanel.style.display = "block";
    showInfoBtn.classList.remove("active");
    showControlsBtn.classList.add("active");
  });

  closeInfoBtn.addEventListener("click", () => {
    infoPanel.style.display = "none";
  });

  closeControlsBtn.addEventListener("click", () => {
    controlsPanel.style.display = "none";
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Hide loading screen when everything is ready
  setTimeout(() => {
    gsap.to(loadingScreen, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        loadingScreen.style.display = "none";
      },
    });
  }, 1500);

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (isAnimating) {
      // Rotate planets around the sun in perfect circles
      planetObjects.forEach((planet) => {
        // Update orbital angle
        planet.angle += planet.speed * delta * 10;

        // Calculate new position in circular orbit
        const x = Math.cos(planet.angle) * planet.distance;
        const z = Math.sin(planet.angle) * planet.distance;

        // Update planet position (not the group position)
        planet.mesh.position.set(x, 0, z);

        // Rotate planet on its axis
        planet.mesh.rotation.y += planet.rotationSpeed * delta * 10;

        // Rotate Saturn's ring
        if (planet.ring) {
          planet.ring.rotation.z += 0.002 * delta * 10;
        }
      });

      // Rotate sun and glow
      sun.rotation.y += 0.002 * delta * 10;
      sunGlow.rotation.y += 0.001 * delta * 10;

      // Pulsate sun glow
      sunGlow.scale.set(
        1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05,
        1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05,
        1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05
      );
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});

// Create starfield background
function createStarfield(scene) {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starVertices, 3)
  );
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}