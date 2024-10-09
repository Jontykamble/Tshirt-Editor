import {
    ContactShadows,
    Environment,
    Float,
    OrbitControls,
  } from "@react-three/drei";
  import { Mug } from "./Mugeditor";
  
  export const Experience = () => {
    return (
      <>
        <OrbitControls />
        <Float>
          <Mug />
        </Float>
        <ContactShadows position-y={-0.5} opacity={0.4} blur={2} />
        <Environment preset="sunset" background blur={4} />
      </>
    );
  };