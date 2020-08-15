@import ./PerlinNoise;

uniform float shockMag;
uniform float shockFreq;
uniform float pulseSpread;
uniform float packetLength;
uniform float trailLength;

@import ./FogVertPars;

void main() {
  float b  = cnoise(50.0 * vec2(uv.y,1.0));
  float c = cnoise(shockFreq * vec2(uv.x, uv.y + timeMsec/3000.0));
  float modif = smoothstep(0.3,0.4,(1.0 - uv.y));
  float time = mod((1.0 - 0.5*modif)*uv.x + timeMsec/(2000.0) + b * pulseSpread, pulseSpread)/pulseSpread;
  float shouldClip = 1.0 - smoothstep(0.009, 0.009 + packetLength, time);
  float shouldClip2 = 1.0 - smoothstep(0.01, 0.01 + trailLength, time);

  vec3 newPosition = position;
  newPosition += 0.6 * (shouldClip + 0.3) * normal + shouldClip2 * shockMag * vec3(c,0.0,1.0);

  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  @import ./FogVert;
  gl_Position = projectionMatrix * mvPosition;
}
