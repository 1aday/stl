import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CustomizationValues } from '../types/template';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

interface STLViewerProps {
    stlData: string;
    customization: CustomizationValues;
    onSceneReady?: (scene: THREE.Scene) => void;
}

interface MeshRefs {
    frame: THREE.Mesh;
    background: THREE.Mesh;
}

export const STLViewer: React.FC<STLViewerProps> = ({ stlData, customization }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const meshRef = useRef<MeshRefs | null>(null);
    const frameIdRef = useRef<number>(0);
    const controlsRef = useRef<OrbitControls | null>(null);

    // Cleanup function
    const cleanup = () => {
        if (frameIdRef.current) {
            cancelAnimationFrame(frameIdRef.current);
        }

        if (meshRef.current) {
            meshRef.current.frame.geometry.dispose();
            (meshRef.current.frame.material as THREE.Material).dispose();
            meshRef.current.background.geometry.dispose();
            (meshRef.current.background.material as THREE.Material).dispose();
        }

        if (controlsRef.current) {
            controlsRef.current.dispose();
        }

        if (rendererRef.current) {
            rendererRef.current.dispose();
            rendererRef.current.forceContextLoss();
            const domElement = rendererRef.current.domElement;
            domElement.parentNode?.removeChild(domElement);
        }

        sceneRef.current = null;
        meshRef.current = null;
        rendererRef.current = null;
        controlsRef.current = null;
    };

    const stringToArrayBuffer = (str: string) => {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Cleanup previous instance
        cleanup();

        // Initialize scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        // Initialize camera
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 5);

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Initialize controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(1, 1, 2);
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
        backLight.position.set(-1, -1, -2);
        scene.add(backLight);

        // Load STL
        try {
            const loader = new STLLoader();
            let geometry: THREE.BufferGeometry;

            // Check if the STL data is in ASCII format
            if (stlData.trim().toLowerCase().startsWith('solid')) {
                // ASCII STL
                geometry = loader.parse(stringToArrayBuffer(stlData));
            } else {
                // Binary STL
                const buffer = stringToArrayBuffer(stlData);
                geometry = loader.parse(buffer);
            }

            // Center geometry
            geometry.center();

            const material = new THREE.MeshStandardMaterial({
                color: customization.main_color || 0xFFA500,
                metalness: 0,
                roughness: 0.2,
                side: THREE.DoubleSide,
                transparent: false,
                opacity: 1,
                depthWrite: true,
                depthTest: true,
            });

            const frameMaterial = new THREE.MeshStandardMaterial({
                color: customization.accent_color || 0x333333,
                metalness: 0,
                roughness: 0.2,
                side: THREE.DoubleSide,
                transparent: false,
                opacity: 1,
                depthWrite: true,
                depthTest: true,
            });

            const backgroundGeometry = geometry.clone();
            const frameGeometry = geometry.clone();

            // Adjust the frame size and position differently
            frameGeometry.scale(1.05, 1.05, 1.2); // Make frame 5% larger and taller
            const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
            const backgroundMesh = new THREE.Mesh(backgroundGeometry, material);

            // Position the frame behind the background
            frameMesh.position.z = -0.2; // Move frame further back

            scene.add(frameMesh);
            scene.add(backgroundMesh);

            meshRef.current = {
                frame: frameMesh,
                background: backgroundMesh
            };

            // Adjust camera to fit model
            const box = new THREE.Box3().setFromObject(meshRef.current.background);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const cameraDistance = maxDim / (2 * Math.tan(fov / 2));

            camera.position.set(0, 0, cameraDistance * 1.5);
            camera.lookAt(center);
        } catch (error) {
            console.error('Error loading STL:', error);
        }

        // Add text to the model
        const loader = new FontLoader();
        const fontUrl = '/fonts/helvetiker_regular.typeface.json';

        fetch('/api/setup')
            .then(() => {
                loader.load(
                    fontUrl,
                    (font) => {
                        const textContent = customization.custom_text ||
                            customization.nameplate_label ||
                            'BADGER';

                        const textGeometry = new TextGeometry(textContent, {
                            font: font,
                            size: 20,
                            height: 0.5,
                            curveSegments: 12,
                            bevelEnabled: false
                        });

                        // Center the text geometry
                        textGeometry.computeBoundingBox();
                        const textWidth = textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x;
                        const textHeight = textGeometry.boundingBox!.max.y - textGeometry.boundingBox!.min.y;

                        const textMaterial = new THREE.MeshStandardMaterial({
                            color: 0xffffff,
                            metalness: 0,
                            roughness: 0.1,
                            depthWrite: true,
                            depthTest: true,
                            polygonOffset: true,
                            polygonOffsetFactor: -1,
                            polygonOffsetUnits: -4
                        });

                        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

                        // Scale and position the text
                        textMesh.scale.set(0.3, 0.3, 0.3);
                        textMesh.rotation.x = 0;
                        textMesh.position.set(
                            -textWidth * 0.3 / 2,
                            -textHeight * 0.3 / 2,
                            2.1
                        );

                        // Add a small offset to prevent z-fighting
                        textMesh.renderOrder = 1;

                        scene.add(textMesh);
                    },
                    undefined,
                    (error) => {
                        console.error('Error loading font:', error);
                    }
                );
            })
            .catch(error => {
                console.error('Font setup failed:', error);
            });

        // Animation loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup on unmount
        return cleanup;
    }, [stlData, customization]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current) return;

            const camera = sceneRef.current?.children.find(
                child => child instanceof THREE.PerspectiveCamera
            ) as THREE.PerspectiveCamera;

            if (camera) {
                camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.updateProjectionMatrix();
                rendererRef.current.setSize(
                    containerRef.current.clientWidth,
                    containerRef.current.clientHeight
                );
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (meshRef.current) {
            console.log('Current customization:', customization);

            // Update main color
            const bgMaterial = meshRef.current.background.material as THREE.MeshStandardMaterial;
            const mainColor = customization.main_color || customization.nameplate_background;
            if (mainColor) {
                bgMaterial.color.set(mainColor);
                bgMaterial.needsUpdate = true;
            }

            // Update accent color
            const frameMaterial = meshRef.current.frame.material as THREE.MeshStandardMaterial;
            const accentColor = customization.accent_color || customization.nameplate_frame;
            if (accentColor) {
                frameMaterial.color.set(accentColor);
                frameMaterial.needsUpdate = true;
            }
        }
    }, [customization]);

    return (
        <div
            ref={containerRef}
            className="w-full h-[400px] rounded-lg overflow-hidden bg-gray-100"
            style={{ minHeight: '400px' }}
        />
    );
}; 