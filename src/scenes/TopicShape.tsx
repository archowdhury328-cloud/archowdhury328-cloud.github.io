import type { ShapeName } from './topicStyle';

interface Props {
  shape: ShapeName;
  color: string;
  size: number;
  opacity?: number;
  emissive?: number;
}

/** One mesh per shape; geometry args are tiny so these are cheap. Material is shared per mesh instance. */
export function TopicShape({ shape, color, size, opacity = 1, emissive = 0.5 }: Props) {
  const geometry = (() => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[size * 1.6, size * 1.6, size * 1.6]} />;
      case 'octahedron':
        return <octahedronGeometry args={[size * 1.15]} />;
      case 'cone':
        return <coneGeometry args={[size * 1.1, size * 2, 4]} />;
      case 'torus':
        return <torusGeometry args={[size * 0.95, size * 0.38, 10, 24]} />;
      default:
        return <sphereGeometry args={[size, 20, 14]} />;
    }
  })();
  return (
    <mesh>
      {geometry}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} roughness={0.45} metalness={0.1} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}
