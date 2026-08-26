import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  type: 'hub' | 'zone' | 'capital';
  count: number;
  status: string;
  color: string;
}

const KATSINA_LOCATIONS: LocationPoint[] = [
  { name: 'Katsina Urban HQ', lat: 12.989, lng: 7.604, type: 'capital', count: 184, status: 'Active Surveillance', color: '#10b981' },
  { name: 'Daura Zone', lat: 13.030, lng: 7.290, type: 'zone', count: 52, status: 'Scheduled Audit', color: '#06b6d4' },
  { name: 'Funtua Commercial Corridor', lat: 11.121, lng: 7.319, type: 'hub', count: 96, status: 'High Traffic Monitoring', color: '#f59e0b' },
  { name: 'Dutsin-Ma University Axis', lat: 12.800, lng: 7.500, type: 'zone', count: 41, status: 'Active Surveillance', color: '#8b5cf6' },
  { name: 'Malumfashi Central', lat: 11.789, lng: 7.621, type: 'zone', count: 37, status: 'Field Inspection', color: '#10b981' },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Generate realistic continent dots mathematically on a sphere
function createGlobePoints(radius: number, count: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const colorLand = new THREE.Color('#059669'); // emerald
  const colorAfrica = new THREE.Color('#10b981'); // bright emerald
  const colorDim = new THREE.Color('#1e293b'); // slate-800

  // Golden ratio sphere point distribution
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Convert to lat/lng to filter rough landmass regions
    const lat = Math.asin(y) * (180 / Math.PI);
    const lng = Math.atan2(z, x) * (180 / Math.PI);

    // Approximate continent boundaries filter
    const isAfrica = (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52);
    const isEurope = (lat > 37 && lat <= 71 && lng >= -10 && lng <= 45);
    const isAsia = (lat > 5 && lat <= 75 && lng > 45 && lng <= 145);
    const isAmericas = (lat >= -55 && lat <= 72 && lng >= -168 && lng <= -34);
    const isAustralia = (lat >= -45 && lat <= -10 && lng >= 112 && lng <= 154);

    const isLand = isAfrica || isEurope || isAsia || isAmericas || isAustralia;

    if (isLand || Math.random() < 0.08) {
      positions.push(x * radius, y * radius, z * radius);
      if (isAfrica && lat >= 10 && lat <= 14 && lng >= 5 && lng <= 10) {
        // Katsina & Northern Nigeria highlight
        colors.push(1, 0.8, 0.2);
      } else if (isAfrica) {
        colors.push(colorAfrica.r, colorAfrica.g, colorAfrica.b);
      } else if (isLand) {
        colors.push(colorLand.r * 0.7, colorLand.g * 0.7, colorLand.b * 0.7);
      } else {
        colors.push(colorDim.r, colorDim.g, colorDim.b);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

export function ModernGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLocation, setActiveLocation] = useState<LocationPoint>(KATSINA_LOCATIONS[0]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.z = 240;

    // WebGL Renderer with High-DPI support
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Root Globe Group
    const globeGroup = new THREE.Group();
    // Tilt to show Northern Nigeria prominently
    globeGroup.rotation.x = 0.22;
    globeGroup.rotation.y = -1.2;
    scene.add(globeGroup);

    const GLOBE_RADIUS = 75;

    // 1. Dark Glass Sphere Core
    const innerSphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.5, 64, 64);
    const innerSphereMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color('#030712'), // Very dark midnight
      emissive: new THREE.Color('#022c22'),
      emissiveIntensity: 0.25,
      shininess: 40,
      specular: new THREE.Color('#059669'),
      transparent: true,
      opacity: 0.95
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    globeGroup.add(innerSphere);

    // 2. Glowing Dotted Landmass
    const pointsGeo = createGlobePoints(GLOBE_RADIUS, 4200);
    const pointsMat = new THREE.PointsMaterial({
      size: 1.7,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    globeGroup.add(pointsMesh);

    // 3. Latitude / Longitude Subtle Rings
    const gridGroup = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#065f46'),
      transparent: true,
      opacity: 0.2
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = Math.sin(phi) * (GLOBE_RADIUS + 0.2);
      const y = Math.cos(phi) * (GLOBE_RADIUS + 0.2);
      const circleGeo = new THREE.BufferGeometry();
      const pts: number[] = [];
      for (let j = 0; j <= 64; j++) {
        const theta = (j / 64) * Math.PI * 2;
        pts.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
      }
      circleGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const line = new THREE.Line(circleGeo, ringMat);
      gridGroup.add(line);
    }
    globeGroup.add(gridGroup);

    // 4. Atmosphere Outer Halo Ring
    const haloGeo = new THREE.RingGeometry(GLOBE_RADIUS + 0.5, GLOBE_RADIUS + 8, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#10b981'),
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.lookAt(camera.position);
    scene.add(haloMesh);

    // 5. Katsina & Regional Data Markers with Pulsing Rings
    const markerMeshes: { point: THREE.Mesh; ring: THREE.Mesh; pos: THREE.Vector3; loc: LocationPoint }[] = [];

    KATSINA_LOCATIONS.forEach((loc) => {
      const pos = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS + 0.5);

      // Core LED dot
      const dotGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(loc.color) });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.copy(pos);
      globeGroup.add(dotMesh);

      // Expanding Radar Pulse
      const pulseGeo = new THREE.RingGeometry(1.2, 2.4, 32);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color),
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.copy(pos);
      pulseMesh.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(pulseMesh);

      markerMeshes.push({ point: dotMesh, ring: pulseMesh, pos, loc });
    });

    // 6. Curved Arcs between Katsina HQ and Regional Zones
    const hqPos = latLngToVector3(12.989, 7.604, GLOBE_RADIUS + 0.5);
    KATSINA_LOCATIONS.slice(1).forEach((loc) => {
      const targetPos = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS + 0.5);
      const midPos = hqPos.clone().add(targetPos).multiplyScalar(0.5);
      midPos.normalize().multiplyScalar(GLOBE_RADIUS + 12); // Arc curvature height

      const curve = new THREE.QuadraticBezierCurve3(hqPos, midPos, targetPos);
      const curvePoints = curve.getPoints(32);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(loc.color),
        transparent: true,
        opacity: 0.6
      });
      const curveLine = new THREE.Line(curveGeo, curveMat);
      globeGroup.add(curveLine);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x34d399, 2.5);
    dirLight1.position.set(120, 100, 150);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight2.position.set(-150, -80, -100);
    scene.add(dirLight2);

    // Interactive Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x + deltaY * 0.005));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile
    let touchStart = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStart.x;
        const deltaY = e.touches[0].clientY - touchStart.y;
        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x + deltaY * 0.005));
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    domElement.addEventListener('touchmove', onTouchMove, { passive: true });

    // Handle Window Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      haloMesh.lookAt(camera.position);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth auto-rotation when not dragging
      if (!isDragging) {
        globeGroup.rotation.y += 0.002;
      }

      // Animate pulsing radar rings
      markerMeshes.forEach((item, index) => {
        const scale = 1 + ((elapsedTime * 1.5 + index * 0.6) % 2) * 2.2;
        const opacity = Math.max(0, 1 - (((elapsedTime * 1.5 + index * 0.6) % 2) / 2));
        item.ring.scale.set(scale, scale, 1);
        (item.ring.material as THREE.MeshBasicMaterial).opacity = opacity * 0.7;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center">
      {/* Dynamic Background Glow behind Globe */}
      <div className="absolute inset-0 bg-radial from-emerald-500/15 via-teal-900/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Interactive Three.js Canvas Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        title="Click and drag to rotate the geospatial globe"
      />

      {/* Floating HUD Telemetry Pill (Top Left) */}
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 pointer-events-none">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <div className="text-[11px] font-mono leading-tight">
          <span className="text-slate-400 uppercase tracking-wider block text-[9px]">SURVEILLANCE GRID</span>
          <span className="text-emerald-400 font-bold">KATSINA STATE • LIVE</span>
        </div>
      </div>

      {/* Interactive Location Selector Chips (Bottom) */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex flex-wrap justify-center gap-1.5 pointer-events-auto">
        {KATSINA_LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            onClick={() => setActiveLocation(loc)}
            className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 backdrop-blur-md ${
              activeLocation.name === loc.name
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 scale-105'
                : 'bg-slate-900/75 text-slate-300 border border-slate-800 hover:bg-slate-800/90'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeLocation.name === loc.name ? '#022c22' : loc.color }} />
            {loc.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Active Node Detail Card Overlay (Top Right) */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20 bg-slate-950/90 backdrop-blur-md border border-emerald-500/30 p-3.5 rounded-2xl shadow-2xl max-w-[200px] pointer-events-none transition-all">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">{activeLocation.type}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/60 font-medium">
            {activeLocation.count} Assets
          </span>
        </div>
        <div className="text-xs font-bold text-white mb-0.5">{activeLocation.name}</div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {activeLocation.status}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[9px] font-mono text-slate-500">
          GPS: {activeLocation.lat.toFixed(3)}°N, {activeLocation.lng.toFixed(3)}°E
        </div>
      </div>
    </div>
  );
}
