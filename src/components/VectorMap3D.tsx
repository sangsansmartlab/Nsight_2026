import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Article, CustomAxes, RankedAxisItem } from '../types';
import { getContinuousColor, isPoliticsDomain } from '../utils/colorScale';

interface VectorMap3DProps {
  articles: Article[];
  axes: CustomAxes;
  rankedAxes?: [RankedAxisItem, RankedAxisItem, RankedAxisItem];
  selectedArticle: Article | null;
  hoveredArticle: Article | null;
  topMatchedArticleId?: string | null;
  scaleFactor: number;
  showFloorGrid: boolean;
  showXYGrid: boolean;
  showYZGrid: boolean;
  show3DTendency?: boolean;
  cameraPresetCommand: string | null;
  onSelectArticle: (article: Article | null) => void;
  onHoverArticle: (article: Article | null, pos?: { x: number; y: number }) => void;
}

// Minimal Badge Sprite Generator using 2D Canvas
function createMinimalBadgeSprite(
  text: string,
  textColor = '#ffffff',
  bgColor = 'rgba(15, 23, 42, 0.90)',
  borderColor = '#38bdf8',
  scaleX = 3.4,
  scaleY = 0.8
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 424, 80, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 21px Pretendard, -apple-system, sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 220, 48);
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
  sprite.scale.set(scaleX, scaleY, 1);
  return sprite;
}

export const VectorMap3D: React.FC<VectorMap3DProps> = ({
  articles,
  axes,
  rankedAxes,
  selectedArticle,
  hoveredArticle,
  topMatchedArticleId,
  scaleFactor,
  showFloorGrid,
  showXYGrid,
  showYZGrid,
  show3DTendency = true,
  cameraPresetCommand,
  onSelectArticle,
  onHoverArticle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const contentGroupRef = useRef<THREE.Group | null>(null);
  const nodesListRef = useRef<THREE.Mesh[]>([]);
  const labelSpritesRef = useRef<THREE.Sprite[]>([]);

  // References to keep latest callbacks without recreating WebGL context
  const onSelectRef = useRef(onSelectArticle);
  onSelectRef.current = onSelectArticle;

  const onHoverRef = useRef(onHoverArticle);
  onHoverRef.current = onHoverArticle;

  const scaleFactorRef = useRef(scaleFactor);
  scaleFactorRef.current = scaleFactor;

  const cameraAnimIdRef = useRef<number | null>(null);

  // Smooth Camera Lerp helper
  const animateCameraTo = (targetPos: THREE.Vector3, targetLook: THREE.Vector3, duration = 620) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (cameraAnimIdRef.current !== null) {
      cancelAnimationFrame(cameraAnimIdRef.current);
      cameraAnimIdRef.current = null;
    }

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic Ease-Out

      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startTarget, targetLook, ease);
      controls.update();

      if (progress < 1.0) {
        cameraAnimIdRef.current = requestAnimationFrame(step);
      } else {
        cameraAnimIdRef.current = null;
      }
    };

    cameraAnimIdRef.current = requestAnimationFrame(step);
  };

  // 1. Initialize Persistent WebGL Scene, Camera, Renderer & Controls ONCE
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(22, 18, 26);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controlsRef.current = controls;

    // Studio 3-Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(12, 22, 16);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x60a5fa, 0.55);
    backLight.position.set(-16, -12, -16);
    scene.add(backLight);

    const contentGroup = new THREE.Group();
    scene.add(contentGroup);
    contentGroupRef.current = contentGroup;

    // Raycasting & Pointer Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
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
      const intersects = raycaster.intersectObjects(nodesListRef.current);

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

      const isTouch = e.pointerType === 'touch';
      const maxDist = isTouch ? 14 : 6;
      const maxTime = isTouch ? 500 : 450;

      if (dx < maxDist && dy < maxDist && dt < maxTime) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodesListRef.current);

        let targetArt: Article | null = null;

        if (intersects.length > 0) {
          targetArt = intersects[0].object.userData as Article;
        } else if (isTouch && nodesListRef.current.length > 0) {
          let closestScreenDist = 40;
          const touchX = e.clientX;
          const touchY = e.clientY;
          const screenPos = new THREE.Vector3();

          for (const nodeMesh of nodesListRef.current) {
            screenPos.setFromMatrixPosition(nodeMesh.matrixWorld);
            screenPos.project(camera);
            if (screenPos.z < 1) {
              const sx = ((screenPos.x + 1) * window.innerWidth) / 2;
              const sy = ((-screenPos.y + 1) * window.innerHeight) / 2;
              const dist = Math.hypot(touchX - sx, touchY - sy);
              if (dist < closestScreenDist) {
                closestScreenDist = dist;
                targetArt = nodeMesh.userData as Article;
              }
            }
          }
        }

        if (targetArt) {
          onSelectRef.current(targetArt);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      const camDist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
      let targetOpacity = (camDist - 12) / (30 - 12);
      targetOpacity = Math.max(0.14, Math.min(0.95, targetOpacity));

      labelSpritesRef.current.forEach((sprite) => {
        const dirToSprite = sprite.position.clone().normalize();
        const camDir = camera.getWorldDirection(new THREE.Vector3()).negate().normalize();
        const dot = camDir.dot(dirToSprite);

        let finalOpacity = targetOpacity;
        if (dot > 0.85) {
          finalOpacity *= 0.32;
        }
        sprite.material.opacity = THREE.MathUtils.lerp(sprite.material.opacity, finalOpacity, 0.1);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  // 2. Smoothly Focus Camera when selectedArticle changes (without destroying scene)
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !selectedArticle) return;

    const tx = selectedArticle.coordinates.x * scaleFactor;
    const ty = selectedArticle.coordinates.y * scaleFactor;
    const tz = selectedArticle.coordinates.z * scaleFactor;
    const targetLook = new THREE.Vector3(tx, ty, tz);

    // Keep camera offset direction relative to current view for smooth focus
    const currentOffset = camera.position.clone().sub(controls.target);
    const desiredDist = Math.max(16, Math.min(34, currentOffset.length()));
    const nextPos = targetLook.clone().add(currentOffset.normalize().multiplyScalar(desiredDist));

    animateCameraTo(nextPos, targetLook, 550);
  }, [selectedArticle?.id]);

  // 3. Handle Camera Preset Commands
  useEffect(() => {
    if (!cameraPresetCommand || !cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const dist = scaleFactor * 2.4;

    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3(0, 0, 0);

    if (cameraPresetCommand.startsWith('FRONT')) {
      targetPos.set(0, 0, dist);
    } else if (cameraPresetCommand.startsWith('TOP')) {
      targetPos.set(0, dist, 0.001);
    } else if (cameraPresetCommand.startsWith('SIDE')) {
      targetPos.set(dist, 0, 0);
    } else if (cameraPresetCommand.startsWith('RESET')) {
      targetPos.set(22, 18, 26);
    } else if (cameraPresetCommand.startsWith('ZOOM_IN')) {
      const dir = camera.position.clone().sub(controls.target);
      targetPos.copy(controls.target).add(dir.multiplyScalar(0.72));
      targetLook.copy(controls.target);
    } else if (cameraPresetCommand.startsWith('ZOOM_OUT')) {
      const dir = camera.position.clone().sub(controls.target);
      targetPos.copy(controls.target).add(dir.multiplyScalar(1.35));
      targetLook.copy(controls.target);
    } else {
      return;
    }

    animateCameraTo(targetPos, targetLook, 620);
  }, [cameraPresetCommand, scaleFactor]);

  // 4. Rebuild 3D Content Group Meshes (Grids, Ranked Axis Badges, Spheres, Tendency Vectors & Tubes)
  // while keeping Camera and OrbitControls state completely intact!
  useEffect(() => {
    const contentGroup = contentGroupRef.current;
    if (!contentGroup) return;

    // Dispose previous group children cleanly
    while (contentGroup.children.length > 0) {
      const child = contentGroup.children[0] as any;
      contentGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    }

    nodesListRef.current = [];
    labelSpritesRef.current = [];

    const bound = scaleFactor * 1.2;

    // 1. Floor Grid (XZ plane)
    const floorGrid = new THREE.GridHelper(bound * 2, 20, 0x38bdf8, 0x1e293b);
    floorGrid.position.set(0, 0, 0);
    floorGrid.visible = showFloorGrid;
    contentGroup.add(floorGrid);

    // 2. Front Grid (XY plane)
    const xyGrid = new THREE.GridHelper(bound * 2, 20, 0xf43f5e, 0x1e293b);
    xyGrid.position.set(0, 0, 0);
    xyGrid.rotation.x = Math.PI / 2;
    xyGrid.visible = showXYGrid;
    contentGroup.add(xyGrid);

    // 3. Side Grid (YZ plane)
    const yzGrid = new THREE.GridHelper(bound * 2, 20, 0x10b981, 0x1e293b);
    yzGrid.position.set(0, 0, 0);
    yzGrid.rotation.z = Math.PI / 2;
    yzGrid.visible = showYZGrid;
    contentGroup.add(yzGrid);

    // Central Axis Lines through (0,0,0)
    const xLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-bound, 0, 0),
      new THREE.Vector3(bound, 0, 0)
    ]);
    const xLineMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 });
    contentGroup.add(new THREE.Line(xLineGeom, xLineMat));

    const yLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -bound, 0),
      new THREE.Vector3(0, bound, 0)
    ]);
    const yLineMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    contentGroup.add(new THREE.Line(yLineGeom, yLineMat));

    const zLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -bound),
      new THREE.Vector3(0, 0, bound)
    ]);
    const zLineMat = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 2 });
    contentGroup.add(new THREE.Line(zLineGeom, zLineMat));

    // Ranked Axis Badges ([1순위 · X], [2순위 · Y], [3순위 · Z]) with Custom Weight %
    const totalRawWeight =
      (rankedAxes?.[0]?.weight ?? 50) +
      (rankedAxes?.[1]?.weight ?? 30) +
      (rankedAxes?.[2]?.weight ?? 20);

    const getNormWeightPct = (idx: number, fallbackPct: number) => {
      if (!rankedAxes || rankedAxes.length < 3 || totalRawWeight <= 0) return fallbackPct;
      return Math.round(((rankedAxes[idx]?.weight ?? 0) / totalRawWeight) * 100);
    };

    const formatAxisLabel = (
      rankNum: number,
      axisCode: string,
      rankItem: RankedAxisItem | undefined,
      weightPct: number,
      fullText: string,
      fallback: string
    ) => {
      if (rankItem && rankItem.name.trim()) {
        return `${rankNum}순위(${axisCode}·${weightPct}%): ${rankItem.name.trim().slice(0, 14)}`;
      }
      if (!fullText) return `${rankNum}순위(${axisCode}·${weightPct}%): ${fallback}`;
      let clean = fullText;
      if (clean.includes('↔')) {
        const parts = clean.split('↔');
        const lastPart = parts[parts.length - 1]?.trim().replace(/\(\+1\.0\)/g, '').trim();
        const firstPart = parts[0]?.trim().replace(/\(-1\.0\)/g, '').trim();
        if (firstPart && lastPart) {
          clean = `${firstPart}↔${lastPart}`;
        }
      }
      if (clean.length > 16) {
        clean = clean.slice(0, 15) + '…';
      }
      return `${rankNum}순위(${axisCode}·${weightPct}%): ${clean}`;
    };

    const xLabelText = formatAxisLabel(1, 'X', rankedAxes?.[0], getNormWeightPct(0, 50), axes.x_axis, '가로 쟁점');
    const yLabelText = formatAxisLabel(2, 'Y', rankedAxes?.[1], getNormWeightPct(1, 30), axes.y_axis, '사회적 파급력');
    const zLabelText = formatAxisLabel(3, 'Z', rankedAxes?.[2], getNormWeightPct(2, 20), axes.z_axis, '정보 신뢰도');

    const xLabel = createMinimalBadgeSprite(xLabelText, '#f43f5e', 'rgba(15,23,42,0.90)', '#f43f5e');
    xLabel.position.set(bound + 2.2, 0, 0);
    contentGroup.add(xLabel);

    const yLabel = createMinimalBadgeSprite(yLabelText, '#10b981', 'rgba(15,23,42,0.90)', '#10b981');
    yLabel.position.set(0, bound + 1.9, 0);
    contentGroup.add(yLabel);

    const zLabel = createMinimalBadgeSprite(zLabelText, '#a855f7', 'rgba(15,23,42,0.90)', '#a855f7');
    zLabel.position.set(0, 0, bound + 2.2);
    contentGroup.add(zLabel);

    labelSpritesRef.current = [xLabel, yLabel, zLabel];

    // Center (0,0,0) Origin Marker
    const originGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
    const originMarker = new THREE.Mesh(originGeo, originMat);
    originMarker.position.set(0, 0, 0);
    contentGroup.add(originMarker);

    const hasColorAxis = Boolean(axes.color_axis && axes.color_axis.trim());
    const isPol = isPoliticsDomain(axes.color_axis, axes.x_axis);

    // Render Article Nodes & Clean 3D Coordinate Vectors
    articles.forEach((art) => {
      const px = art.coordinates.x * scaleFactor;
      const py = art.coordinates.y * scaleFactor;
      const pz = art.coordinates.z * scaleFactor;

      const isSelected = selectedArticle?.id === art.id;
      const isHovered = hoveredArticle?.id === art.id;
      const isTopMatched = topMatchedArticleId === art.id;

      const radius = isSelected ? 0.98 : isHovered ? 0.8 : isTopMatched ? 0.72 : 0.56;

      const continuousInfo = getContinuousColor(art.coordinates.x, isPol);
      const baseNodeColor = hasColorAxis ? continuousInfo.hex : '#38bdf8';
      const colorHex = isSelected ? '#F59E0B' : baseNodeColor;

      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: 0.22,
        metalness: 0.78,
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: isSelected ? 0.88 : isHovered ? 0.5 : isTopMatched ? 0.35 : 0.16
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(px, py, pz);
      mesh.userData = art;

      contentGroup.add(mesh);
      nodesListRef.current.push(mesh);

      // Highlight Halo Ring for Selected or #1 Top-Matched Node
      if (isSelected || isTopMatched) {
        const ringGeo = new THREE.RingGeometry(radius + 0.22, radius + 0.36, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0xf59e0b : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isSelected ? 0.9 : 0.65
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(px, py, pz);
        ringMesh.lookAt(cameraRef.current?.position || new THREE.Vector3(22, 18, 26));
        contentGroup.add(ringMesh);
      }

      // Subtle radial tendency vector from Origin (0,0,0) to Article Node (no cluttered text badge above spheres)
      if (show3DTendency) {
        const vecGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(px, py, pz)
        ]);
        const vecMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(isSelected ? '#f59e0b' : baseNodeColor),
          transparent: true,
          opacity: isSelected ? 0.65 : 0.22
        });
        contentGroup.add(new THREE.Line(vecGeom, vecMat));
      }

      // Floor Drop line (dashed line down to y=0 floor)
      if (!isSelected) {
        const dropPoints = [new THREE.Vector3(px, py, pz), new THREE.Vector3(px, 0, pz)];
        const dropGeom = new THREE.BufferGeometry().setFromPoints(dropPoints);
        const dropMat = new THREE.LineDashedMaterial({
          color: new THREE.Color(hasColorAxis ? baseNodeColor : '#475569'),
          dashSize: 0.3,
          gapSize: 0.2,
          opacity: hasColorAxis ? 0.35 : 0.2,
          transparent: true
        });
        const dropLine = new THREE.Line(dropGeom, dropMat);
        dropLine.computeLineDistances();
        contentGroup.add(dropLine);
      }
    });

    // Selection Visualization: 3 Coordinate Tubes & Axis Projections
    if (selectedArticle) {
      const cx = selectedArticle.coordinates.x * scaleFactor;
      const cy = selectedArticle.coordinates.y * scaleFactor;
      const cz = selectedArticle.coordinates.z * scaleFactor;

      // 1. X Tube (1순위 축)
      if (Math.abs(cx) > 0.01) {
        const xCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(cx, 0, 0));
        const xTubeGeom = new THREE.TubeGeometry(xCurve, 24, 0.16, 8, false);
        const xTubeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        contentGroup.add(new THREE.Mesh(xTubeGeom, xTubeMat));
      }

      // 2. Y Tube (2순위 축)
      if (Math.abs(cy) > 0.01) {
        const yCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, cy, 0));
        const yTubeGeom = new THREE.TubeGeometry(yCurve, 24, 0.16, 8, false);
        const yTubeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        contentGroup.add(new THREE.Mesh(yTubeGeom, yTubeMat));
      }

      // 3. Z Tube (3순위 축)
      if (Math.abs(cz) > 0.01) {
        const zCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, cz));
        const zTubeGeom = new THREE.TubeGeometry(zCurve, 24, 0.16, 8, false);
        const zTubeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        contentGroup.add(new THREE.Mesh(zTubeGeom, zTubeMat));
      }

      // Dashed projection lines connecting node to each axis
      const projPoints = [
        new THREE.Vector3(cx, cy, cz),
        new THREE.Vector3(cx, 0, 0),
        new THREE.Vector3(cx, cy, cz),
        new THREE.Vector3(0, cy, 0),
        new THREE.Vector3(cx, cy, cz),
        new THREE.Vector3(0, 0, cz)
      ];
      const projGeom = new THREE.BufferGeometry().setFromPoints(projPoints);
      const projMat = new THREE.LineDashedMaterial({
        color: 0xf59e0b,
        dashSize: 0.35,
        gapSize: 0.15,
        opacity: 0.95,
        transparent: true
      });
      const projLine = new THREE.LineSegments(projGeom, projMat);
      projLine.computeLineDistances();
      contentGroup.add(projLine);

      // Colored marker dots on each axis
      const dotGeo = new THREE.SphereGeometry(0.38, 16, 16);

      const dotX = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      dotX.position.set(cx, 0, 0);
      contentGroup.add(dotX);

      const dotY = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      dotY.position.set(0, cy, 0);
      contentGroup.add(dotY);

      const dotZ = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
      dotZ.position.set(0, 0, cz);
      contentGroup.add(dotZ);
    }
  }, [
    articles,
    axes,
    rankedAxes,
    scaleFactor,
    selectedArticle,
    hoveredArticle,
    topMatchedArticleId,
    showFloorGrid,
    showXYGrid,
    showYZGrid,
    show3DTendency
  ]);

  return <div ref={containerRef} id="canvas-container" className="absolute inset-0 z-0" />;
};
