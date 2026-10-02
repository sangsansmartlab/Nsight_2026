import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Article, CustomAxes } from '../types';

interface VectorMap3DProps {
  articles: Article[];
  axes: CustomAxes;
  selectedArticle: Article | null;
  hoveredArticle: Article | null;
  scaleFactor: number;
  showFloorGrid: boolean;
  showXYGrid: boolean;
  showYZGrid: boolean;
  cameraPresetCommand: string | null;
  onSelectArticle: (article: Article | null) => void;
  onHoverArticle: (article: Article | null, pos?: { x: number; y: number }) => void;
}

// Minimal Badge Sprite Generator using 2D Canvas
function createMinimalBadgeSprite(
  text: string,
  textColor = '#ffffff',
  bgColor = 'rgba(15, 23, 42, 0.88)',
  borderColor = '#38bdf8'
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 380;
  canvas.height = 90;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rounded rectangle background
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 364, 74, 14);
    ctx.fill();
    ctx.stroke();

    // Text rendering
    ctx.font = 'bold 22px Pretendard, -apple-system, sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 190, 45);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    opacity: 0.95
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(3.2, 0.76, 1);
  return sprite;
}

export const VectorMap3D: React.FC<VectorMap3DProps> = ({
  articles,
  axes,
  selectedArticle,
  hoveredArticle,
  scaleFactor,
  showFloorGrid,
  showXYGrid,
  showYZGrid,
  cameraPresetCommand,
  onSelectArticle,
  onHoverArticle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // References to keep latest callbacks and state without recreating scene
  const onSelectRef = useRef(onSelectArticle);
  onSelectRef.current = onSelectArticle;

  const onHoverRef = useRef(onHoverArticle);
  onHoverRef.current = onHoverArticle;

  const selectedRef = useRef(selectedArticle);
  selectedRef.current = selectedArticle;

  // Handle camera presets when command changes
  useEffect(() => {
    if (!cameraPresetCommand || !cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const dist = scaleFactor * 2.4;

    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3(0, 0, 0);

    if (cameraPresetCommand === 'FRONT') {
      targetPos.set(0, 0, dist);
    } else if (cameraPresetCommand === 'TOP') {
      targetPos.set(0, dist, 0.001);
    } else if (cameraPresetCommand === 'SIDE') {
      targetPos.set(dist, 0, 0);
    } else if (cameraPresetCommand === 'RESET') {
      targetPos.set(22, 18, 26);
    }

    // Smooth transition
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();
    const duration = 650; // ms

    const animateTransition = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startTarget, targetLook, ease);
      controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  }, [cameraPresetCommand, scaleFactor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous canvas
    container.innerHTML = '';

    // Disposables tracker
    const disposables: { dispose: () => void }[] = [];

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(22, 18, 26);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    disposables.push(renderer);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x60a5fa, 0.5);
    backLight.position.set(-15, -10, -15);
    scene.add(backLight);

    const bound = scaleFactor * 1.2;

    // Three Orthogonal Grid Planes passing through (0,0,0)
    // 1. Floor Grid (XZ plane)
    const floorGrid = new THREE.GridHelper(bound * 2, 20, 0x38bdf8, 0x1e293b);
    floorGrid.position.set(0, 0, 0);
    floorGrid.visible = showFloorGrid;
    scene.add(floorGrid);

    // 2. Front Grid (XY plane)
    const xyGrid = new THREE.GridHelper(bound * 2, 20, 0xf43f5e, 0x1e293b);
    xyGrid.position.set(0, 0, 0);
    xyGrid.rotation.x = Math.PI / 2;
    xyGrid.visible = showXYGrid;
    scene.add(xyGrid);

    // 3. Side Grid (YZ plane)
    const yzGrid = new THREE.GridHelper(bound * 2, 20, 0x10b981, 0x1e293b);
    yzGrid.position.set(0, 0, 0);
    yzGrid.rotation.z = Math.PI / 2;
    yzGrid.visible = showYZGrid;
    scene.add(yzGrid);

    // Three Main Central Axis Lines through (0,0,0)
    // X-Axis (Rose / Red)
    const xLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-bound, 0, 0),
      new THREE.Vector3(bound, 0, 0),
    ]);
    const xLineMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 });
    const xAxisLine = new THREE.Line(xLineGeom, xLineMat);
    scene.add(xAxisLine);
    disposables.push(xLineGeom, xLineMat);

    // Y-Axis (Emerald / Green)
    const yLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -bound, 0),
      new THREE.Vector3(0, bound, 0),
    ]);
    const yLineMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const yAxisLine = new THREE.Line(yLineGeom, yLineMat);
    scene.add(yAxisLine);
    disposables.push(yLineGeom, yLineMat);

    // Z-Axis (Purple)
    const zLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -bound),
      new THREE.Vector3(0, 0, bound),
    ]);
    const zLineMat = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 2 });
    const zAxisLine = new THREE.Line(zLineGeom, zLineMat);
    scene.add(zAxisLine);
    disposables.push(zLineGeom, zLineMat);

    // Dynamic Axis Minimal Badges at edge boundaries (+bound)
    const xLabelText = `X: ${axes.x_axis.includes('↔') ? axes.x_axis.split('↔')[1]?.trim() || '가로축' : '규제 ↔ 진흥'}`;
    const yLabelText = `Y: ${axes.y_axis.includes('↔') ? axes.y_axis.split('↔')[1]?.trim() || '높이' : '파급력'}`;
    const zLabelText = `Z: ${axes.z_axis.includes('↔') ? axes.z_axis.split('↔')[1]?.trim() || '깊이' : '신뢰도'}`;

    const xLabel = createMinimalBadgeSprite(xLabelText, '#f43f5e', 'rgba(15,23,42,0.88)', '#f43f5e');
    xLabel.position.set(bound + 2.0, 0, 0);
    scene.add(xLabel);
    disposables.push(xLabel.material);

    const yLabel = createMinimalBadgeSprite(yLabelText, '#10b981', 'rgba(15,23,42,0.88)', '#10b981');
    yLabel.position.set(0, bound + 1.8, 0);
    scene.add(yLabel);
    disposables.push(yLabel.material);

    const zLabel = createMinimalBadgeSprite(zLabelText, '#a855f7', 'rgba(15,23,42,0.88)', '#a855f7');
    zLabel.position.set(0, 0, bound + 2.0);
    scene.add(zLabel);
    disposables.push(zLabel.material);

    const labelSprites = [xLabel, yLabel, zLabel];

    // Center (0,0,0) Origin Marker
    const originGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
    const originMarker = new THREE.Mesh(originGeo, originMat);
    originMarker.position.set(0, 0, 0);
    scene.add(originMarker);
    disposables.push(originGeo, originMat);

    // Article Nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const nodesList: THREE.Mesh[] = [];

    articles.forEach((art) => {
      const px = art.coordinates.x * scaleFactor;
      const py = art.coordinates.y * scaleFactor;
      const pz = art.coordinates.z * scaleFactor;

      const isSelected = selectedArticle?.id === art.id;
      const isHovered = hoveredArticle?.id === art.id;

      const radius = isSelected ? 0.95 : isHovered ? 0.75 : 0.55;
      const colorHex = isSelected ? '#F59E0B' : art.coordinates.color_hex;

      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: 0.2,
        metalness: 0.8,
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: isSelected ? 0.85 : isHovered ? 0.45 : 0.15,
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(px, py, pz);
      mesh.userData = art;

      scene.add(mesh);
      nodesList.push(mesh);
      disposables.push(sphereGeo, sphereMat);

      // Floor Drop line (dashed line down to y=0 floor)
      if (!isSelected) {
        const dropPoints = [new THREE.Vector3(px, py, pz), new THREE.Vector3(px, 0, pz)];
        const dropGeom = new THREE.BufferGeometry().setFromPoints(dropPoints);
        const dropMat = new THREE.LineDashedMaterial({
          color: new THREE.Color(art.coordinates.color_hex),
          dashSize: 0.3,
          gapSize: 0.2,
          opacity: 0.28,
          transparent: true,
        });
        const dropLine = new THREE.Line(dropGeom, dropMat);
        dropLine.computeLineDistances();
        scene.add(dropLine);
        disposables.push(dropGeom, dropMat);
      }
    });

    // Selection Visualization: 3 Coordinate Tubes & Axis Projections
    if (selectedArticle) {
      const cx = selectedArticle.coordinates.x * scaleFactor;
      const cy = selectedArticle.coordinates.y * scaleFactor;
      const cz = selectedArticle.coordinates.z * scaleFactor;

      // 1. X Tube (from origin (0,0,0) to (cx,0,0))
      if (Math.abs(cx) > 0.01) {
        const xCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(cx, 0, 0));
        const xTubeGeom = new THREE.TubeGeometry(xCurve, 24, 0.16, 8, false);
        const xTubeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const xTubeMesh = new THREE.Mesh(xTubeGeom, xTubeMat);
        scene.add(xTubeMesh);
        disposables.push(xTubeGeom, xTubeMat);
      }

      // 2. Y Tube (from origin (0,0,0) to (0,cy,0))
      if (Math.abs(cy) > 0.01) {
        const yCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, cy, 0));
        const yTubeGeom = new THREE.TubeGeometry(yCurve, 24, 0.16, 8, false);
        const yTubeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const yTubeMesh = new THREE.Mesh(yTubeGeom, yTubeMat);
        scene.add(yTubeMesh);
        disposables.push(yTubeGeom, yTubeMat);
      }

      // 3. Z Tube (from origin (0,0,0) to (0,0,cz))
      if (Math.abs(cz) > 0.01) {
        const zCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, cz));
        const zTubeGeom = new THREE.TubeGeometry(zCurve, 24, 0.16, 8, false);
        const zTubeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        const zTubeMesh = new THREE.Mesh(zTubeGeom, zTubeMat);
        scene.add(zTubeMesh);
        disposables.push(zTubeGeom, zTubeMat);
      }

      // Dashed projection lines connecting node to each axis
      const projPoints = [
        new THREE.Vector3(cx, cy, cz),
        new THREE.Vector3(cx, 0, 0),
        new THREE.Vector3(cx, cy, cz),
        new THREE.Vector3(0, cy, 0),
        new THREE.Vector3(cx, cy, cz),
        new THREE.Vector3(0, 0, cz),
      ];
      const projGeom = new THREE.BufferGeometry().setFromPoints(projPoints);
      const projMat = new THREE.LineDashedMaterial({
        color: 0xf59e0b,
        dashSize: 0.35,
        gapSize: 0.15,
        opacity: 0.95,
        transparent: true,
      });
      const projLine = new THREE.LineSegments(projGeom, projMat);
      projLine.computeLineDistances();
      scene.add(projLine);
      disposables.push(projGeom, projMat);

      // Colored marker dots on each axis
      const dotGeo = new THREE.SphereGeometry(0.38, 16, 16);
      disposables.push(dotGeo);

      const dotXMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const dotX = new THREE.Mesh(dotGeo, dotXMat);
      dotX.position.set(cx, 0, 0);
      scene.add(dotX);
      disposables.push(dotXMat);

      const dotYMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const dotY = new THREE.Mesh(dotGeo, dotYMat);
      dotY.position.set(0, cy, 0);
      scene.add(dotY);
      disposables.push(dotYMat);

      const dotZMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
      const dotZ = new THREE.Mesh(dotGeo, dotZMat);
      dotZ.position.set(0, 0, cz);
      scene.add(dotZ);
      disposables.push(dotZMat);
    }

    // Pointer Event Handling: Drag vs Click Separation
    let pointerDownTime = 0;
    const pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownTime = Date.now();
      pointerDownPos.x = e.clientX;
      pointerDownPos.y = e.clientY;
    };

    const handlePointerMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodesList);

      if (intersects.length > 0) {
        const art = intersects[0].object.userData as Article;
        onHoverRef.current(art, { x: e.clientX + 16, y: e.clientY + 16 });
        document.body.style.cursor = 'pointer';
      } else {
        onHoverRef.current(null);
        document.body.style.cursor = 'default';
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dt = Date.now() - pointerDownTime;
      const dx = Math.abs(e.clientX - pointerDownPos.x);
      const dy = Math.abs(e.clientY - pointerDownPos.y);

      // If user barely moved and released quickly, register as intentional node click
      if (dx < 6 && dy < 6 && dt < 450) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodesList);

        if (intersects.length > 0) {
          const art = intersects[0].object.userData as Article;
          onSelectRef.current(art);

          // Smoothly pan controls target to selected node
          const targetX = art.coordinates.x * scaleFactor;
          const targetY = art.coordinates.y * scaleFactor;
          const targetZ = art.coordinates.z * scaleFactor;
          controls.target.set(targetX, targetY, targetZ);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Dynamic Fade Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Distance from camera to origin (0,0,0)
      const camDist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

      // Dynamic Fade: as camera zooms in (camDist drops), badges become transparent to keep view clean
      let targetOpacity = (camDist - 12) / (30 - 12);
      targetOpacity = Math.max(0.12, Math.min(0.95, targetOpacity));

      labelSprites.forEach((sprite) => {
        // Measure angle between camera view direction and sprite position
        const dirToSprite = sprite.position.clone().normalize();
        const camDir = camera.getWorldDirection(new THREE.Vector3()).negate().normalize();
        const dot = camDir.dot(dirToSprite);

        let finalOpacity = targetOpacity;
        if (dot > 0.85) {
          finalOpacity *= 0.3; // Additional fade when directly facing camera
        }

        sprite.material.opacity = THREE.MathUtils.lerp(sprite.material.opacity, finalOpacity, 0.1);
      });

      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      controls.dispose();

      disposables.forEach((item) => {
        try {
          item.dispose();
        } catch {
          // Ignore disposal errors
        }
      });

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [articles, axes, scaleFactor, selectedArticle, hoveredArticle, showFloorGrid, showXYGrid, showYZGrid]);

  return <div ref={containerRef} id="canvas-container" className="absolute inset-0 z-0" />;
};
