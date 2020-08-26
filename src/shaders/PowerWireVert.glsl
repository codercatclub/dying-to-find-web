@import ./PerlinNoise;

varying vec2 vUv;
@import ./FogVertPars;

void main() {
  vUv = uv;
  vec3 newPosition = position;
  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  @import ./FogVert;
  gl_Position = projectionMatrix * mvPosition;
}
