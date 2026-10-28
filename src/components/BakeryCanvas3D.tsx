import React, { useEffect, useRef, useState, useTransition } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  RotateCcw,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Layers,
  Thermometer,
  Sparkles,
  Droplets,
  Timer
} from 'lucide-react';
import { BakeryItem3D } from '../types/bakery';
import { playClickSound, playSteamSound } from '../utils/audio';

interface BakeryCanvas3DProps {
  onSelectItem: (item: BakeryItem3D) => void;
  selectedItem: BakeryItem3D | null;
}

// Pre-allocated math helpers for zero GC in render loop
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.2, 0);

// Camera view presets
type CameraViewKey = 'showcase' | 'oven' | 'sourdough' | 'croissant';

interface CameraPreset {
  name: string;
  pos: [number, number, number];
  lookAt: [number, number, number];
}

const CAMERA_PRESETS: Record<CameraViewKey, CameraPreset> = {
  showcase: {
    name: 'Showcase Table',
    pos: [0, 3.2, 5.2],
    lookAt: [0, 1.0, 0],
  },
  oven: {
    name: 'Smart Deck Oven',
    pos: [3.2, 2.4, 2.8],
    lookAt: [2.5, 1.4, -0.6],
  },
  sourdough: {
    name: 'Artisan Boule Focus',
    pos: [-1.4, 1.9, 2.2],
    lookAt: [-1.2, 1.05, 0.2],
  },
  croissant: {
    name: 'Lamination & Pastry',
    pos: [0.3, 1.8, 2.0],
    lookAt: [0.1, 1.0, 0.4],
  },
};

export const BAKERY_ITEMS_CATALOG: BakeryItem3D[] = [
  {
    id: 'item-sourdough',
    name: 'Country Sourdough Boule (T65)',
    category: 'artisan-bread',
    meshType: 'sourdough',
    batchCode: 'SRD-0824',
    status: 'On Display',
    internalTempC: 98.4,
    hydrationPercent: 78,
    flourType: 'French T65 Label Rouge & 15% Whole Spelt',
    browningLevel: 0.85,
    price: 7.50,
    stockCount: 28,
    bakedAt: '05:45 AM Today',
    freshnessScore: 98,
    flavorNotes: ['Caramelized crust', 'Tangy lactic acidity', 'Wild honey & toasted wheat germ'],
  },
  {
    id: 'item-croissant',
    name: 'Isigny AOP Butter Croissant',
    category: 'viennoiserie',
    meshType: 'croissant',
    batchCode: 'CRS-0419',
    status: 'On Display',
    internalTempC: 94.2,
    hydrationPercent: 52,
    flourType: 'Normandy Gruau T45 & 84% Beurre de Tourage',
    browningLevel: 0.78,
    price: 4.25,
    stockCount: 42,
    bakedAt: '06:15 AM Today',
    freshnessScore: 99,
    flavorNotes: ['Flaky shatter crust', 'Honeycomb aeration', 'Hazelnut butter finish'],
  },
  {
    id: 'item-macaron',
    name: 'Parisian Macarons (Pistachio & Berry)',
    category: 'patisserie',
    meshType: 'macaron',
    batchCode: 'MAC-1102',
    status: 'On Display',
    internalTempC: 22.0,
    hydrationPercent: 0,
    flourType: 'Extra-Fine Sicilian Almond Flour',
    browningLevel: 0.1,
    price: 18.00,
    stockCount: 16,
    bakedAt: 'Yesterday 04:00 PM (24h Matured)',
    freshnessScore: 96,
    flavorNotes: ['Crisp delicate shell', 'Chewy almond pied', 'Tart raspberry & roasted pistachio'],
  },
  {
    id: 'item-baguette',
    name: 'Tradition Baguette au Levain',
    category: 'artisan-bread',
    meshType: 'baguette',
    batchCode: 'BAG-0901',
    status: 'On Display',
    internalTempC: 97.8,
    hydrationPercent: 75,
    flourType: 'T65 Unbleached with Fermentolevain',
    browningLevel: 0.82,
    price: 3.80,
    stockCount: 35,
    bakedAt: '06:30 AM Today',
    freshnessScore: 100,
    flavorNotes: ['Audible crust crackle', 'Custardy open crumb', 'Nutty grain aroma'],
  },
  {
    id: 'item-oven',
    name: 'Smart Hearth Deck Oven (Deck 1)',
    category: 'equipment',
    meshType: 'oven',
    batchCode: 'OVEN-UNIT-01',
    status: 'Baking',
    internalTempC: 245.0,
    hydrationPercent: 82,
    flourType: 'Industrial Quartz Stone Deck (4.5kW)',
    browningLevel: 0.9,
    price: 0,
    stockCount: 1,
    bakedAt: 'Active Live Session',
    freshnessScore: 100,
    flavorNotes: ['Dual zone PID heating', 'Automated steam injection', 'Live thermal heat sensor array'],
  },
];

export const BakeryCanvas3D: React.FC<BakeryCanvas3DProps> = ({
  onSelectItem,
  selectedItem,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<CameraViewKey>('showcase');
  const [browningLevel, setBrowningLevel] = useState<number>(0.75);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [hoveredItemName, setHoveredItemName] = useState<string | null>(null);
  const [steamAnimation, setSteamAnimation] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Internal mutable refs to bridge React and Three.js animation loop without rebuilding scene
  const refsState = useRef({
    browningLevel: 0.75,
    autoRotate: true,
    activePreset: 'showcase' as CameraViewKey,
    selectedId: selectedItem?.id || null,
    isHovering: false,
    onSelectItem,
  });

  useEffect(() => {
    refsState.current.browningLevel = browningLevel;
    refsState.current.autoRotate = autoRotate;
    refsState.current.activePreset = activePreset;
    refsState.current.selectedId = selectedItem?.id || null;
    refsState.current.onSelectItem = onSelectItem;
  }, [browningLevel, autoRotate, activePreset, selectedItem, onSelectItem]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL renderer for performance guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Renderer Setup with Clean White Background & Horizon Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfbf9);
    scene.fog = new THREE.Fog(0xfcfbf9, 12, 32);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    const initialPreset = CAMERA_PRESETS[activePreset];
    camera.position.set(...initialPreset.pos);
    camera.lookAt(...initialPreset.lookAt);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Environment Setup (RoomEnvironment via PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Balanced Studio Lighting Rig
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0xe8e2d8, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(6, 9, 6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.9);
    fillLight.position.set(-6, 5, -3);
    scene.add(fillLight);

    const warmRimLight = new THREE.PointLight(0xf59e0b, 1.2, 10);
    warmRimLight.position.set(0, 3, -3);
    scene.add(warmRimLight);

    // 4. Studio Ground Plane & Contact Grounding
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf7f5f0,
      roughness: 0.92,
      metalness: 0.02,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = !isSoftwareGl;
    scene.add(groundMesh);

    // Soft radial contact shadow under showcase
    const shadowGeo = new THREE.PlaneGeometry(10, 6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(60, 45, 30, 0.28)');
    grad.addColorStop(0.5, 'rgba(80, 60, 40, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, 0.01, 0);
    scene.add(contactShadow);

    // 5. Procedural Showcase Table / Baker's Island
    const tableGroup = new THREE.Group();
    // Countertop (White Carrara Marble styled procedural finish)
    const topGeo = new THREE.BoxGeometry(6.2, 0.18, 3.2);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0xfcfbf9,
      roughness: 0.25,
      metalness: 0.05,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0.9;
    topMesh.castShadow = !isSoftwareGl;
    topMesh.receiveShadow = !isSoftwareGl;
    tableGroup.add(topMesh);

    // Warm French oak base
    const baseGeo = new THREE.BoxGeometry(5.8, 0.8, 2.8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xd6cbb8,
      roughness: 0.75,
      metalness: 0.05,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.4;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    tableGroup.add(baseMesh);

    scene.add(tableGroup);

    // Raycastable interactive objects array
    const interactiveMeshes: THREE.Object3D[] = [];

    // --- PROCEDURAL HERO SUBJECT 1: ARTISAN SOURDOUGH BOULE (Composite Group: 6 Parts) ---
    const sourdoughGroup = new THREE.Group();
    sourdoughGroup.position.set(-1.4, 0.99, 0.4);
    sourdoughGroup.name = 'Country Sourdough Boule (T65)';
    sourdoughGroup.userData = { id: 'item-sourdough' };

    // Wooden Baker's Board underneath
    const boardGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 32);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xd9b382,
      roughness: 0.6,
      metalness: 0.05,
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.position.y = 0.02;
    boardMesh.castShadow = !isSoftwareGl;
    boardMesh.receiveShadow = !isSoftwareGl;
    sourdoughGroup.add(boardMesh);

    // Sourdough Bread Body (Squashed deformed sphere with custom vertex displacement for rustic oven spring)
    const loafGeo = new THREE.SphereGeometry(0.42, 32, 24);
    loafGeo.scale(1.0, 0.65, 0.95);
    const posAttr = loafGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      // Subtle organic irregularity
      const noise = (Math.sin(vx * 9) + Math.cos(vz * 8) + Math.sin(vy * 12)) * 0.018;
      posAttr.setXYZ(i, vx + noise * 0.6, vy + noise * 0.4, vz + noise * 0.6);
    }
    loafGeo.computeVertexNormals();

    const sourdoughMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.08, 0.68, 0.45),
      roughness: 0.72,
      metalness: 0.02,
    });
    const loafMesh = new THREE.Mesh(loafGeo, sourdoughMat);
    loafMesh.position.y = 0.28;
    loafMesh.castShadow = !isSoftwareGl;
    sourdoughGroup.add(loafMesh);

    // Scored French Crescent "Ear" (Extruded curve ridge with pale flour bloom)
    const earCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.28, 0.22, -0.05),
      new THREE.Vector3(0.0, 0.38, 0.12),
      new THREE.Vector3(0.28, 0.24, -0.08)
    );
    const earGeo = new THREE.TubeGeometry(earCurve, 20, 0.038, 8, false);
    const earMat = new THREE.MeshStandardMaterial({
      color: 0xf5eedb, // flour dusted blistered ear
      roughness: 0.88,
      metalness: 0.01,
    });
    const earMesh = new THREE.Mesh(earGeo, earMat);
    earMesh.position.y = 0.18;
    earMesh.castShadow = !isSoftwareGl;
    sourdoughGroup.add(earMesh);

    // Decorative toasted sesame seeds on crust
    const seedsGeo = new THREE.ConeGeometry(0.008, 0.02, 5);
    const seedsMat = new THREE.MeshStandardMaterial({ color: 0xecd5b3, roughness: 0.5 });
    const seedsInst = new THREE.InstancedMesh(seedsGeo, seedsMat, 24);
    const dummy = new THREE.Object3D();
    for (let s = 0; s < 24; s++) {
      const angle = (s / 24) * Math.PI * 2;
      const radius = 0.32 + Math.random() * 0.06;
      dummy.position.set(Math.cos(angle) * radius, 0.28 + Math.random() * 0.08, Math.sin(angle) * radius * 0.9);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      dummy.updateMatrix();
      seedsInst.setMatrixAt(s, dummy.matrix);
    }
    seedsInst.instanceMatrix.needsUpdate = true;
    sourdoughGroup.add(seedsInst);

    scene.add(sourdoughGroup);
    interactiveMeshes.push(sourdoughGroup);

    // --- PROCEDURAL HERO SUBJECT 2: FRENCH CROISSANT (Composite Group: 7 Laminated Rings) ---
    const croissantGroup = new THREE.Group();
    croissantGroup.position.set(0.1, 0.99, 0.6);
    croissantGroup.name = 'Isigny AOP Butter Croissant';
    croissantGroup.userData = { id: 'item-croissant' };

    // Parchment paper sheet
    const paperGeo = new THREE.PlaneGeometry(0.7, 0.5);
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfaf4e6,
      roughness: 0.95,
      side: THREE.DoubleSide,
    });
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.rotation.x = -Math.PI / 2;
    paperMesh.position.y = 0.005;
    croissantGroup.add(paperMesh);

    // Glossy Egg-Washed Croissant Material
    const croissantMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(0.09, 0.78, 0.46),
      roughness: 0.24,
      metalness: 0.04,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
    });

    // 7 crescent segments stacked along a curved curve
    const ringCount = 7;
    const ringRadii = [0.06, 0.11, 0.15, 0.18, 0.15, 0.11, 0.06];
    for (let r = 0; r < ringCount; r++) {
      const t = (r / (ringCount - 1)) - 0.5; // -0.5 to 0.5
      const angle = t * 1.8;
      const arcRadius = 0.26;
      const x = Math.sin(angle) * arcRadius;
      const z = (Math.cos(angle) - 1) * arcRadius * 0.7;
      const radius = ringRadii[r];

      const segGeo = new THREE.CylinderGeometry(radius * 0.9, radius, 0.07, 16);
      segGeo.scale(1.0, 1.0, 1.3); // Flatter lamination profile
      const segMesh = new THREE.Mesh(segGeo, croissantMat);
      segMesh.position.set(x, 0.12 + Math.abs(t) * -0.04, z);
      segMesh.rotation.z = -angle * 0.8;
      segMesh.rotation.x = Math.PI / 2;
      segMesh.castShadow = !isSoftwareGl;
      croissantGroup.add(segMesh);
    }

    // Tapered horn tips
    [-0.24, 0.24].forEach((tipX, idx) => {
      const tipGeo = new THREE.ConeGeometry(0.045, 0.1, 12);
      const tipMesh = new THREE.Mesh(tipGeo, croissantMat);
      tipMesh.position.set(tipX, 0.06, -0.16);
      tipMesh.rotation.z = idx === 0 ? 1.2 : -1.2;
      tipMesh.rotation.x = -0.6;
      tipMesh.castShadow = !isSoftwareGl;
      croissantGroup.add(tipMesh);
    });

    scene.add(croissantGroup);
    interactiveMeshes.push(croissantGroup);

    // --- PROCEDURAL HERO SUBJECT 3: PARISIAN MACARON TOWER (Composite Group: 10 Parts) ---
    const macaronGroup = new THREE.Group();
    macaronGroup.position.set(-0.35, 0.99, -0.5);
    macaronGroup.name = 'Parisian Macarons (Pistachio & Berry)';
    macaronGroup.userData = { id: 'item-macaron' };

    // Marble Display Pedestal
    const pedBaseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.04, 32);
    const pedStemGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.18, 24);
    const pedPlateGeo = new THREE.CylinderGeometry(0.55, 0.52, 0.03, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0xf4f1ea,
      roughness: 0.18,
      metalness: 0.08,
    });
    const pedBase = new THREE.Mesh(pedBaseGeo, pedMat);
    pedBase.position.y = 0.02;
    pedBase.receiveShadow = !isSoftwareGl;
    const pedStem = new THREE.Mesh(pedStemGeo, pedMat);
    pedStem.position.y = 0.13;
    const pedPlate = new THREE.Mesh(pedPlateGeo, pedMat);
    pedPlate.position.y = 0.23;
    pedPlate.castShadow = !isSoftwareGl;
    pedPlate.receiveShadow = !isSoftwareGl;

    macaronGroup.add(pedBase);
    macaronGroup.add(pedStem);
    macaronGroup.add(pedPlate);

    // Function to build a 3-part Parisian macaron (Top dome, Ruffled foot/pied, Ganache layer, Bottom dome)
    const createMacaron = (colorHex: number, ganacheHex: number, posX: number, posY: number, posZ: number, rotY: number) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(posX, posY, posZ);
      mGroup.rotation.y = rotY;

      const shellMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.38,
        metalness: 0.02,
      });
      const ganacheMat = new THREE.MeshStandardMaterial({
        color: ganacheHex,
        roughness: 0.55,
        metalness: 0.05,
      });

      // Top Dome
      const topGeo = new THREE.SphereGeometry(0.11, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
      topGeo.scale(1.0, 0.6, 1.0);
      const topMesh = new THREE.Mesh(topGeo, shellMat);
      topMesh.position.y = 0.035;
      topMesh.castShadow = !isSoftwareGl;
      mGroup.add(topMesh);

      // Top Pied (ruffled edge)
      const piedGeo = new THREE.CylinderGeometry(0.112, 0.112, 0.016, 24);
      const topPied = new THREE.Mesh(piedGeo, shellMat);
      topPied.position.y = 0.025;
      mGroup.add(topPied);

      // Ganache Center
      const ganacheGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.022, 24);
      const ganacheMesh = new THREE.Mesh(ganacheGeo, ganacheMat);
      ganacheMesh.position.y = 0.01;
      mGroup.add(ganacheMesh);

      // Bottom Pied
      const botPied = new THREE.Mesh(piedGeo, shellMat);
      botPied.position.y = -0.005;
      mGroup.add(botPied);

      // Bottom Dome
      const botGeo = new THREE.SphereGeometry(0.11, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
      botGeo.scale(1.0, -0.6, 1.0);
      const botMesh = new THREE.Mesh(botGeo, shellMat);
      botMesh.position.y = -0.015;
      mGroup.add(botMesh);

      return mGroup;
    };

    // Macaron 1: Sicilian Pistachio (delicate mint green)
    const macaronPistachio = createMacaron(0xa7f3d0, 0x059669, -0.16, 0.28, 0.08, 0.2);
    // Macaron 2: Raspberry Rose (ruby pink)
    const macaronRaspberry = createMacaron(0xfbcfe8, 0xbe185d, 0.16, 0.28, 0.06, -0.3);
    // Macaron 3: Tahitian Vanilla Bean (soft ivory cream with tiny gold leaf)
    const macaronVanilla = createMacaron(0xfef3c7, 0xd97706, 0.0, 0.38, -0.08, 0.8);

    macaronGroup.add(macaronPistachio);
    macaronGroup.add(macaronRaspberry);
    macaronGroup.add(macaronVanilla);

    scene.add(macaronGroup);
    interactiveMeshes.push(macaronGroup);

    // --- PROCEDURAL HERO SUBJECT 4: RUSTIC BAGUETTES IN BASKET (Composite Group: 5 Parts) ---
    const baguetteGroup = new THREE.Group();
    baguetteGroup.position.set(1.4, 0.99, -0.2);
    baguetteGroup.name = 'Tradition Baguette au Levain';
    baguetteGroup.userData = { id: 'item-baguette' };

    // Braided wicker basket base
    const basketGeo = new THREE.CylinderGeometry(0.32, 0.24, 0.45, 18);
    const basketMat = new THREE.MeshStandardMaterial({
      color: 0xc4a47c,
      roughness: 0.85,
      metalness: 0.05,
    });
    const basketMesh = new THREE.Mesh(basketGeo, basketMat);
    basketMesh.position.y = 0.22;
    basketMesh.castShadow = !isSoftwareGl;
    baguetteGroup.add(basketMesh);

    // 3 baguettes leaning inside basket
    const baguetteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.085, 0.72, 0.44),
      roughness: 0.65,
      metalness: 0.03,
    });

    [-0.1, 0.05, 0.15].forEach((offsetZ, bIdx) => {
      const bGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.85, 16);
      bGeo.scale(1.0, 1.0, 1.3);
      const bMesh = new THREE.Mesh(bGeo, baguetteMat);
      bMesh.position.set(0.08 * bIdx - 0.06, 0.48, offsetZ);
      bMesh.rotation.z = 0.18 + bIdx * 0.08;
      bMesh.rotation.x = -0.12 - bIdx * 0.05;
      bMesh.castShadow = !isSoftwareGl;
      baguetteGroup.add(bMesh);
    });

    scene.add(baguetteGroup);
    interactiveMeshes.push(baguetteGroup);

    // --- PROCEDURAL HERO SUBJECT 5: SMART HEARTH DECK OVEN (Composite Group: 12 Parts) ---
    const ovenGroup = new THREE.Group();
    ovenGroup.position.set(2.8, 0, -1.0);
    ovenGroup.rotation.y = -Math.PI / 4;
    ovenGroup.name = 'Smart Hearth Deck Oven (Deck 1)';
    ovenGroup.userData = { id: 'item-oven' };

    // Outer Stainless Steel Chassis
    const ovenChassisGeo = new THREE.BoxGeometry(1.6, 2.4, 1.4);
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x52525b,
      roughness: 0.32,
      metalness: 0.85,
    });
    const chassisMesh = new THREE.Mesh(ovenChassisGeo, steelMat);
    chassisMesh.position.y = 1.2;
    chassisMesh.castShadow = !isSoftwareGl;
    chassisMesh.receiveShadow = !isSoftwareGl;
    ovenGroup.add(chassisMesh);

    // Deck 1 Chamber Opening (Baking Hearth)
    const chamberGeo = new THREE.BoxGeometry(1.3, 0.55, 0.8);
    const stoneDeckMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      roughness: 0.9,
      metalness: 0.1,
    });
    const deckHearth = new THREE.Mesh(chamberGeo, stoneDeckMat);
    deckHearth.position.set(0, 1.6, 0.35);
    ovenGroup.add(deckHearth);

    // Quartz Heating Elements (Glowing Amber Rods inside)
    const rodGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.1, 12);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const rod1 = new THREE.Mesh(rodGeo, glowMat);
    rod1.rotation.z = Math.PI / 2;
    rod1.position.set(0, 1.82, 0.35);
    ovenGroup.add(rod1);

    const rod2 = new THREE.Mesh(rodGeo, glowMat);
    rod2.rotation.z = Math.PI / 2;
    rod2.position.set(0, 1.42, 0.35);
    ovenGroup.add(rod2);

    // Double Glazed Inspection Glass Door
    const glassGeo = new THREE.BoxGeometry(1.32, 0.58, 0.05);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
      ior: 1.5,
    });
    const glassDoor = new THREE.Mesh(glassGeo, glassMat);
    glassDoor.position.set(0, 1.6, 0.72);
    ovenGroup.add(glassDoor);

    // Satin Aluminum Door Handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.1, 16);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.2,
      metalness: 0.95,
    });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.rotation.z = Math.PI / 2;
    handleMesh.position.set(0, 1.35, 0.8);
    ovenGroup.add(handleMesh);

    // Digital Smart IoT Control Panel Bezel
    const panelGeo = new THREE.BoxGeometry(1.4, 0.3, 0.05);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.2,
      metalness: 0.8,
    });
    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    panelMesh.position.set(0, 2.1, 0.71);
    ovenGroup.add(panelMesh);

    // LED Status Indicator Bar (Cyan / Emerald Green smart status)
    const ledGeo = new THREE.PlaneGeometry(0.6, 0.08);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(-0.3, 2.1, 0.74);
    ovenGroup.add(ledMesh);

    // Proofer drawer beneath deck oven
    const prooferGeo = new THREE.BoxGeometry(1.32, 0.7, 0.05);
    const prooferMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      roughness: 0.4,
      metalness: 0.7,
    });
    const prooferMesh = new THREE.Mesh(prooferGeo, prooferMat);
    prooferMesh.position.set(0, 0.6, 0.72);
    ovenGroup.add(prooferMesh);

    scene.add(ovenGroup);
    interactiveMeshes.push(ovenGroup);

    // Steam particle system for oven steam bursts
    const steamParticleCount = 45;
    const steamGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const steamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
    });
    const steamMesh = new THREE.InstancedMesh(steamGeo, steamMat, steamParticleCount);
    steamMesh.frustumCulled = false;
    scene.add(steamMesh);

    const steamOffsets: { x: number; y: number; z: number; speed: number; life: number }[] = [];
    for (let sp = 0; sp < steamParticleCount; sp++) {
      steamOffsets.push({
        x: (Math.random() - 0.5) * 0.8,
        y: Math.random() * 0.3,
        z: (Math.random() - 0.5) * 0.4,
        speed: 0.015 + Math.random() * 0.02,
        life: Math.random(),
      });
    }

    // 6. Raycasting for Click / Hover Inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedItem = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(interactiveMeshes, true);
      if (intersects.length > 0) {
        let root: THREE.Object3D | null = intersects[0].object;
        while (root && root.parent && root.parent !== scene) {
          if (root.userData && root.userData.id) break;
          root = root.parent;
        }
        if (root && root.userData && root.userData.id) {
          const item = BAKERY_ITEMS_CATALOG.find((it) => it.id === root?.userData.id);
          return item || null;
        }
      }
      return null;
    };

    const handlePointerMove = (e: MouseEvent) => {
      const item = getIntersectedItem(e);
      if (item) {
        container.style.cursor = 'pointer';
        setHoveredItemName(item.name);
      } else {
        container.style.cursor = 'default';
        setHoveredItemName(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const item = getIntersectedItem(e);
      if (item) {
        playClickSound();
        refsState.current.onSelectItem(item);
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // 7. Render Loop with Smooth Camera Damping & Frame-Rate Independent Kinematics
    let frameId = 0;
    let clock = new THREE.Clock();

    function updateMaterials(browning: number) {
      // Dynamic color interpolation based on browning slider
      // Pale raw dough (0.1) -> Golden (0.5) -> Rich dark caramelized crust (1.0)
      const hue = 0.11 - browning * 0.035; // 0.11 down to 0.075
      const sat = 0.55 + browning * 0.35;
      const light = 0.72 - browning * 0.38;

      sourdoughMat.color.setHSL(hue, sat, light);
      sourdoughMat.roughness = THREE.MathUtils.lerp(0.85, 0.65, browning);

      croissantMat.color.setHSL(hue + 0.01, sat, light + 0.02);
      croissantMat.clearcoat = THREE.MathUtils.lerp(0.3, 0.9, browning);

      baguetteMat.color.setHSL(hue, sat, light);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Update browning materials in real-time
      updateMaterials(refsState.current.browningLevel);

      // Camera preset smooth transition
      const targetPreset = CAMERA_PRESETS[refsState.current.activePreset];
      _targetCamPos.set(...targetPreset.pos);
      _targetLookAt.set(...targetPreset.lookAt);

      // Subtle auto-rotate orbit when in showcase mode
      if (refsState.current.autoRotate && refsState.current.activePreset === 'showcase') {
        const orbitRadius = 5.2;
        const orbitAngle = elapsed * 0.15;
        _targetCamPos.x = Math.sin(orbitAngle) * orbitRadius * 0.7;
        _targetCamPos.z = Math.cos(orbitAngle) * orbitRadius;
      }

      // Smooth exponential damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 3.5, delta);

      _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, 4.0, delta);
      _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, 4.0, delta);
      _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, 4.0, delta);
      camera.lookAt(_currentLookAt);

      // Floating / gentle hovering micro-motion on showcase subjects
      sourdoughGroup.position.y = 0.99 + Math.sin(elapsed * 1.5) * 0.006;
      croissantGroup.position.y = 0.99 + Math.cos(elapsed * 1.4) * 0.005;

      // Oven steam animation update
      const dummySteam = new THREE.Object3D();
      steamOffsets.forEach((sp, idx) => {
        sp.y += sp.speed;
        if (sp.y > 1.2) {
          sp.y = 0.1;
          sp.x = (Math.random() - 0.5) * 0.6;
        }
        const ovenSteamBaseX = 2.4;
        const ovenSteamBaseY = 1.6;
        const ovenSteamBaseZ = -0.6;
        dummySteam.position.set(ovenSteamBaseX + sp.x, ovenSteamBaseY + sp.y, ovenSteamBaseZ + sp.z);
        const scale = 0.8 + sp.y * 1.5;
        dummySteam.scale.set(scale, scale, scale);
        dummySteam.updateMatrix();
        steamMesh.setMatrixAt(idx, dummySteam.matrix);
      });
      steamMesh.instanceMatrix.needsUpdate = true;

      // Glow pulsing on oven heating quartz tubes
      glowMat.color.setHSL(0.08, 0.95, 0.45 + Math.sin(elapsed * 4.0) * 0.08);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    // 8. Responsive resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);

      renderer.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      topGeo.dispose();
      topMat.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      loafGeo.dispose();
      sourdoughMat.dispose();
      earGeo.dispose();
      earMat.dispose();
      croissantMat.dispose();
      pedMat.dispose();
      baguetteMat.dispose();
      steelMat.dispose();
      stoneDeckMat.dispose();
      glassMat.dispose();
      glowMat.dispose();
      steamGeo.dispose();
      steamMat.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  const triggerSteamBurst = () => {
    playSteamSound();
    setSteamAnimation(true);
    setTimeout(() => setSteamAnimation(false), 2400);
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] bg-[#fcfbf9] overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm select-none">
      {/* 3D WebGL Canvas Mounting Container */}
      <div ref={mountRef} className="w-full h-full relative" />

      {/* Top Left Minimal HUD Spec Badge (Conforming to Three.js layout directives) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-none border border-stone-200 shadow-sm text-xs font-medium text-stone-800">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="font-semibold text-stone-900">3D Smart Kitchen & Showcase</span>
          <span className="text-stone-400">|</span>
          <span className="text-stone-500 font-mono">r160 PBR</span>
        </div>
        {hoveredItemName && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-semibold shadow-md animate-in fade-in zoom-in-95 duration-150">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Click to inspect: {hoveredItemName}</span>
          </div>
        )}
      </div>

      {/* Top Right Quick Actions: Steam Injection & Deck Status */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={triggerSteamBurst}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 shadow-sm ${
            steamAnimation
              ? 'bg-sky-500 text-white border-sky-400 shadow-sky-200 ring-2 ring-sky-300'
              : 'bg-white/95 text-stone-700 hover:text-stone-900 border-stone-200 hover:bg-stone-50'
          }`}
          title="Inject 4-second pressurized steam into Deck 1"
        >
          <Droplets className={`w-3.5 h-3.5 ${steamAnimation ? 'animate-bounce text-white' : 'text-sky-500'}`} />
          <span>{steamAnimation ? 'Steam Injected!' : 'Inject Steam (4s)'}</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setAutoRotate((prev) => !prev);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 shadow-sm ${
            autoRotate
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-white/95 text-stone-600 border-stone-200'
          }`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'text-amber-600' : 'text-stone-400'}`} />
          <span>{autoRotate ? 'Orbit: ON' : 'Orbit: Paused'}</span>
        </button>
      </div>

      {/* Selected Item Floating Detail Card (Top-Right under actions) */}
      {selectedItem && (
        <div className="absolute top-16 right-4 z-10 w-72 bg-white/95 border border-stone-200 rounded-xl p-3.5 shadow-lg text-xs space-y-2.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between border-b border-stone-100 pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-semibold">
                {selectedItem.batchCode}
              </span>
              <h4 className="font-semibold text-stone-900 text-sm leading-tight">{selectedItem.name}</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
              {selectedItem.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-stone-600 text-[11px]">
            <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-lg">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <div>
                <p className="text-[9px] text-stone-400">Internal Temp</p>
                <p className="font-semibold text-stone-800">{selectedItem.internalTempC}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-lg">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <div>
                <p className="text-[9px] text-stone-400">Hydration</p>
                <p className="font-semibold text-stone-800">
                  {selectedItem.hydrationPercent > 0 ? `${selectedItem.hydrationPercent}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-stone-400 font-medium">Flour / Material Spec</p>
            <p className="text-[11px] text-stone-700 font-medium">{selectedItem.flourType}</p>
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-stone-100 text-[11px]">
            <span className="text-stone-500">Retail Value: <strong className="text-stone-900">${selectedItem.price.toFixed(2)}</strong></span>
            <span className="text-amber-700 font-medium">Freshness {selectedItem.freshnessScore}%</span>
          </div>
        </div>
      )}

      {/* Mandatory Three.js Collapsible Bottom Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl pointer-events-auto">
        <div className="flex flex-col items-center">
          {/* Collapse / Expand Toggle Button pinned to top edge */}
          <button
            onClick={() => {
              playClickSound();
              setIsDockCollapsed((prev) => !prev);
            }}
            className="mb-1.5 px-3 py-1 rounded-full bg-white/95 hover:bg-stone-50 border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium shadow-sm flex items-center gap-1.5 transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-600" />
                <span>Show 3D Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                <span>Collapse Dock (Zen View)</span>
              </>
            )}
          </button>

          {/* Unified Bottom Dock */}
          {!isDockCollapsed && (
            <div className="w-full bg-white/95 border border-stone-200/90 rounded-2xl p-3.5 shadow-xl text-stone-800 space-y-3 transition-all duration-200">
              {/* Row 1: Camera Preset Views */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 shrink-0">
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-stone-700">Camera:</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(Object.keys(CAMERA_PRESETS) as CameraViewKey[]).map((key) => {
                    const preset = CAMERA_PRESETS[key];
                    const isActive = activePreset === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          playClickSound();
                          startTransition(() => {
                            setActivePreset(key);
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                            : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Live Baking & Browning Slider + Quick Telemetry */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2 border-t border-stone-100">
                {/* Browning Slider */}
                <div className="md:col-span-7 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 shrink-0">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Crust Browning:</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.02"
                    value={browningLevel}
                    onChange={(e) => setBrowningLevel(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-semibold text-amber-800 w-12 text-right">
                    {Math.round(browningLevel * 100)}%
                  </span>
                </div>

                {/* Quick Oven status */}
                <div className="md:col-span-5 flex items-center justify-end gap-3 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-stone-700">Deck 1: 245°C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3 h-3 text-sky-500" />
                    <span>Proofer: 82% RH</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
