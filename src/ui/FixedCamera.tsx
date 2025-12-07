import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export default function FixedCamera() {
  const { camera } = useThree();

  useEffect(() => {
    // Hard reset camera to flat forward-facing view
    camera.position.set(0, 8, 12);   // slight height to mimic orthographic-like view
    camera.rotation.set(0, 0, 0);    // remove any tilt
    camera.lookAt(0, 0, 0);          // aim at origin

    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}
