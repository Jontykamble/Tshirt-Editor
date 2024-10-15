import './index.css';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 3D Model Component
export function Model({ colors }) {
  const group = useRef();
  const { nodes, materials } = useGLTF('/men_polo_shirt_camouflage_pattern.glb');

  useEffect(() => {
    Object.entries(colors).forEach(([materialName, color]) => {
      if (materials[materialName]) {
        materials[materialName].color.set(color); // Apply colors
      }
    });
  }, [colors, materials]);

  if (!nodes || !materials) return null;

  return (
    <group ref={group} scale={[1.2, 1.2, 1.2]} dispose={null}>
      {Object.entries(nodes).map(([key, node]) => (
        <mesh
          key={key}
          castShadow
          receiveShadow
          geometry={node.geometry}
          material={materials[node.material?.name]}
        />
      ))}
    </group>
  );
}

// Main App Component
function App() {
  const [colors, setColors] = useState({});

  const handleColorChange = (materialName, color) => {
    setColors((prev) => ({ ...prev, [materialName]: color }));
  };

  const { materials } = useGLTF('/men_polo_shirt_camouflage_pattern.glb');

  return (
    <div className="App">
      {/* 3D Model Section */}
      <div className="model-container">
        <Canvas camera={{ position: [0, 2, 5] }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <Model colors={colors} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Suspense>
        </Canvas>
      </div>

      {/* Color Picker Section */}
      <div className="color-picker-panel">
        <h2>Color Chooser</h2>
        <div className="colors">
          {Object.keys(materials).map((materialName) => (
            <div key={materialName} className="color-item">
              <input
                type="color"
                value={colors[materialName] || '#ffffff'}
                onChange={(e) => handleColorChange(materialName, e.target.value)}
              />
              <label>{materialName}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
