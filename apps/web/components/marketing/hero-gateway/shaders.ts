export const holoVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const holoFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 1.8);
    float pulse = sin(uTime * 2.4 + vUv.y * 24.0) * 0.5 + 0.5;
    float scan = step(0.92, fract(vUv.y * 40.0 - uTime * 3.5));
    float glitch = step(0.97, hash(vec2(floor(uTime * 8.0), floor(vUv.y * 20.0))));

    vec3 col = mix(uColorA, uColorB, pulse);
    col = mix(col, uColorC, fresnel * 0.7);
    col += scan * uColorA * 0.8;
    col += glitch * vec3(1.0, 0.2, 0.6) * 0.5;
    col += fresnel * vec3(0.4, 0.9, 1.0) * 0.6;

    float alpha = 0.65 + fresnel * 0.35 + scan * 0.2;
    gl_FragColor = vec4(col, alpha);
  }
`;

export const wireVertex = /* glsl */ `
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const wireFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;

  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    float edge = abs(sin(vUv.x * 80.0 + uTime * 4.0)) * abs(sin(vUv.y * 80.0 - uTime * 2.0));
    float glow = sin(uTime * 2.0 + vPosition.x * 6.0) * 0.5 + 0.5;
    vec3 col = uColor * (0.5 + glow * 0.8 + edge * 0.4);
    gl_FragColor = vec4(col, 0.9);
  }
`;

export const gridVertex = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const gridFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;

  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    float dist = length(vWorldPosition.xz);
    float fade = 1.0 - smoothstep(2.0, 14.0, dist);
    float lineX = abs(fract(vWorldPosition.x * 0.5) - 0.5);
    float lineZ = abs(fract(vWorldPosition.z * 0.5) - 0.5);
    float grid = min(lineX, lineZ);
    grid = 1.0 - smoothstep(0.0, 0.02, grid);
    float pulse = sin(uTime * 1.5 - dist * 0.8) * 0.5 + 0.5;
    float alpha = grid * fade * (0.15 + pulse * 0.25);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export const beamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const beamFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float core = 1.0 - abs(vUv.x - 0.5) * 2.0;
    core = pow(core, 3.0);
    float scan = sin(vUv.y * 30.0 - uTime * 6.0) * 0.5 + 0.5;
    float alpha = core * scan * 0.35;
    gl_FragColor = vec4(uColor, alpha);
  }
`;
