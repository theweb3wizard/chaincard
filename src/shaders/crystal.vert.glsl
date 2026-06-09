varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

uniform float uTime;
uniform float uWobble;

void main() {
  vUv = uv;
  vec3 pos = position;

  float noise = sin(pos.x * 2.0 + uTime * 0.5) * cos(pos.y * 2.0 + uTime * 0.3) * sin(pos.z * 2.0 + uTime * 0.7);
  pos += normal * noise * uWobble * 0.05;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vPosition = worldPos.xyz;
  vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vViewDir = normalize(cameraPosition - worldPos.xyz);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}