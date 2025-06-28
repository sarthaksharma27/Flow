"use client"
import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"

function ComplexCube() {
  const mainCubeRef = useRef<THREE.Group>(null!)
  const innerCubeRef = useRef<THREE.Mesh>(null!)
  const wireCubeRef = useRef<THREE.Mesh>(null!)
  
  // Create particles around the cube
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 50; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ],
        scale: Math.random() * 0.1 + 0.05
      })
    }
    return temp
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    
    if (mainCubeRef.current) {
      // Main cube rotation
      mainCubeRef.current.rotation.x = t * 0.3
      mainCubeRef.current.rotation.y = t * 0.4
      mainCubeRef.current.rotation.z = t * 0.1
    }
    
    if (innerCubeRef.current) {
      // Inner cube counter-rotation
      innerCubeRef.current.rotation.x = -t * 0.6
      innerCubeRef.current.rotation.y = -t * 0.8
      innerCubeRef.current.scale.setScalar(0.6 + Math.sin(t * 2) * 0.1)
    }
    
    if (wireCubeRef.current) {
      // Wire cube slow rotation
      wireCubeRef.current.rotation.x = t * 0.2
      wireCubeRef.current.rotation.z = t * 0.15
    }
  })

  return (
    <group ref={mainCubeRef}>
      {/* Main outer cube with metallic material */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial 
          color="#18181b" 
          metalness={0.8} 
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Inner rotating cube */}
      <mesh ref={innerCubeRef} castShadow>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshStandardMaterial 
          color="#f4f4f5" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#f4f4f5"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Wireframe cube */}
      <mesh ref={wireCubeRef}>
        <boxGeometry args={[5.5, 5.5, 5.5]} />
        <meshBasicMaterial 
          color="#71717a" 
          wireframe 
          transparent
          opacity={0.6}
        />
      </mesh>
      

      
      {/* Edge highlights */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4.2, 4.2, 4.2)]} />
        <lineBasicMaterial color="#e4e4e7" transparent opacity={0.8} />
      </lineSegments>
    </group>
  )
}

function DynamicSpotlight() {
  const spotRef = useRef<THREE.SpotLight>(null!)
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (spotRef.current) {
      // Move spotlight in a circular pattern
      spotRef.current.position.x = Math.cos(t * 0.5) * 8
      spotRef.current.position.z = Math.sin(t * 0.5) * 8
      spotRef.current.position.y = 6 + Math.sin(t) * 2
      
      // Point at origin
      spotRef.current.target.position.set(0, 0, 0)
      spotRef.current.target.updateMatrixWorld()
    }
  })
  
  return (
    <spotLight
      ref={spotRef}
      color="#ffffff"
      intensity={3}
      angle={0.4}
      penumbra={0.3}
      distance={20}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={1}
      shadow-camera-far={20}
    />
  )
}

export default function CanvasPreview() {
  return (
    <Canvas
      className="!h-[400px] !w-full"
      shadows
      camera={{ position: [6, 6, 6], fov: 50 }}
      gl={{ antialias: true }}
    >
      {/* Ambient lighting */}
      <ambientLight intensity={0.1} />
      
      {/* Dynamic spotlight */}
      <DynamicSpotlight />
      
      {/* Additional colored lights */}
      <pointLight 
        position={[-5, 3, -5]} 
        color="#f4f4f5" 
        intensity={0.8}
        distance={10}
      />
      <pointLight 
        position={[5, -3, 5]} 
        color="#d4d4d8" 
        intensity={0.6}
        distance={8}
      />
      
      {/* Directional light for overall illumination */}
      <directionalLight
        position={[2, 8, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      

      
      {/* Complex cube */}
      <ComplexCube />
      
      {/* Enhanced orbit controls - DISABLED */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate={false}
      />
    </Canvas>
  )
}