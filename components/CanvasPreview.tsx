"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

function WireframeCube() {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.x = t * 0.2
      ref.current.rotation.y = t * 0.3
    }
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial wireframe color="#6366f1" />
    </mesh>
  )
}

export default function CanvasPreview() {
  return (
    <Canvas className="!h-[400px] !w-full" camera={{ position: [4, 4, 4], fov: 50 }}>
      {/* Dramatic spotlight */}
      <spotLight position={[5, 5, 5]} angle={0.3} intensity={1.5} penumbra={0.5} />
      <ambientLight intensity={0.3} />
      <WireframeCube />
    </Canvas>
  )
}
