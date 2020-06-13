// @import ./PerlinNoise;

@import ./FogFragPars;

varying vec3 vUv;

void main() {
  float noise = 0.2*(cnoise(vec2(15.0*vUv.x+ timeMsec/4000.0, 12.0)) + 2.0 * vUv.x);
  float noise2 =  0.4 * smoothstep(0.7,0.9,2.0*(0.5 - abs(vUv.y - 0.5))) + 0.53 * (cnoise(vec2(40.0*vUv.x+ timeMsec/4000.0, 5.0*vUv.y)));
  float hide = step(vUv.y, 1.0 - noise) * step(noise, vUv.y);
  float segment = floor(vUv.x*20.0)/20.0;
  float dif = step(vUv.x - segment,0.1/20.0 + noise2/20.0);
  if(dif < 0.1) discard;
  gl_FragColor= vec4(0.0,0.0,0.0, hide);

  #include <fog_fragment>
}