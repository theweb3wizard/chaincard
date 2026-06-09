uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform vec3 uLightPosition;
uniform float uTime;
uniform float uRefraction;
uniform float uOpacity;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
}

float saturate(float x) {
  return clamp(x, 0.0, 1.0);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);

  float rim = fresnel(viewDir, normal, 3.0);

  vec3 lightDir = normalize(uLightPosition - vPosition);
  float diff = max(dot(normal, lightDir), 0.0);

  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);

  float internalRefraction = sin(vUv.x * 20.0 + uTime * 0.5) * 0.5 + 0.5;

  vec3 color = uColor * (diff * 0.6 + 0.4);
  color += uGlowColor * rim * 0.8;
  color += vec3(1.0) * spec * 0.3;

  float prismatic = sin(vUv.y * 30.0 + uTime * 0.8) * 0.5 + 0.5;
  vec3 prismColors[5];
  prismColors[0] = vec3(0.4, 0.6, 1.0);
  prismColors[1] = vec3(0.6, 0.8, 1.0);
  prismColors[2] = vec3(1.0, 1.0, 1.0);
  prismColors[3] = vec3(0.8, 0.6, 1.0);
  prismColors[4] = vec3(0.4, 0.9, 1.0);

  int idx = int(prismatic * 4.99);
  vec3 prismColor = prismColors[idx];
  color += prismColor * rim * 0.3 * internalRefraction;

  float alpha = uOpacity * (0.7 + rim * 0.3);

  gl_FragColor = vec4(color, alpha);
}