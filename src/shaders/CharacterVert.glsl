@import ./PerlinNoise;

uniform float timeMsec;
uniform float shockMag;
uniform float shockFreq;
uniform float pulseSpread;
uniform float packetLength;
uniform float trailLength;
#include <fog_pars_vertex>
varying vec3 vUv;

void main() {
  vec3 newPosition = position;
  vec3 inputPos = position;
  inputPos.x += cnoise(vec2(inputPos.y + 0.0*timeMsec/5000.0,1.0));
  vUv.xy = uv;
  vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
  float s = inputPos.y + 0.8*cnoise(vec2(worldPos.x + timeMsec/3000.0,worldPos.z));
  float t = inputPos.x;
  float freq = 5.0;
  
  newPosition.z += s * cos(freq * t+ timeMsec/1000.0);
  newPosition.y += s * sin(freq * t+ timeMsec/1000.0);
  newPosition.z += 0.1 * cos(20.0*inputPos.x + timeMsec/1000.0);

  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  #include <fog_vertex>
  gl_Position = projectionMatrix * mvPosition;

}