import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDCanvas = ({ textureUrl }) => {
  const canvasRef = useRef(null);
  const tshirtRef = useRef(null);  // Ref to hold the 3D T-shirt model
  const rendererRef = useRef(null);  // Ref to store the renderer

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene.background = null;
    rendererRef.current = renderer;  // Save the renderer in the ref

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    const loader = new GLTFLoader();

    // Load the 3D T-shirt model
    loader.load('/3Dimg/tshirt.glb', (gltf) => {  // Use your T-shirt .glb model file path here
      const model = gltf.scene;
      model.scale.set(4, 4, 4);  // Adjust scale based on T-shirt model
      scene.add(model);

      tshirtRef.current = model;  // Save a reference to the T-shirt model

      // Initially apply a blank texture or existing texture if provided
      if (textureUrl) {
        applyTexture(textureUrl);
      }
    });

    camera.position.z = 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      scene.clear();
      controls.dispose();
    };
  }, []);

  // Function to apply texture to the T-shirt model and ensure it covers the model fully
  const applyTexture = (textureUrl) => {
    if (tshirtRef.current && textureUrl) {
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(textureUrl, () => {
        // Callback once the texture is loaded
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);  // Adjust the repeat to make it cover the model fully

        // Use rendererRef to access the renderer and set anisotropy
        texture.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();

        // Apply the texture to the T-shirt's material
        tshirtRef.current.traverse((node) => {
          if (node.isMesh) {
            node.material.map = texture;
            node.material.needsUpdate = true;
          }
        });
      });
    }
  };

  // Listen for changes to textureUrl and apply new texture when it changes
  useEffect(() => {
    if (textureUrl) {
      applyTexture(textureUrl);
    }
  }, [textureUrl]);

  return <canvas ref={canvasRef} style={{ width: '500px', height: '500px' }}/>;
};

export default ThreeDCanvas;
