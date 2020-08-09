@import ./PerlinNoise;
uniform sampler2D positionTex;
uniform float time;
varying vec2 vUv;
varying vec2 vUv2;
uniform vec3 playerPos;
float sdSolidAngle(vec3 p, vec2 c, float ra)
{
  // c is the sin/cos of the angle
  vec2 q = vec2( length(p.xz), p.y );
  float l = length(q) - ra;
  float m = length(q - c*clamp(dot(q,c),0.0,ra) );
  return max(l,m*sign(c.y*q.x-c.x*q.y));
}
float sdCone( vec3 p, vec2 c, float h )
{
  float q = length(p.xz);
  return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
}
void main() {
  vec3 prevPos;
  float alpha = 1.0;

  vec4 mainPos2 = texture2D(positionTex, vec2(0., vUv.y));

  if (vUv.x < 0.01) {
    prevPos = mainPos2.xyz;
    float angle = time / 5.0;
    vec3 offset = vec3(time, time, 0.0);
    // velocity at desired pos
    float noise0 = cnoise(0.1 * prevPos.xyz + offset + vec3(0.0, 0.0, 0.0));
    float noisex = cnoise(0.1 * prevPos.xyz + offset + vec3(0.01, 0.0, 0.0));
    float noisey = cnoise(0.1 * prevPos.xyz + offset + vec3(0., 0.01, 0.0));
    float noisez = cnoise(0.1 * prevPos.xyz + offset + vec3(0., 0.0, 0.01));
    // float noise2 = cnoise(prevPos);
    float dx = noisex - noise0;
    float dy = noisey - noise0;
    float dz = noisez - noise0;

    float dxRot = cos(angle) * dx - sin(angle) * dy;
    float dyRot = sin(angle) * dx + cos(angle) * dy;

    vec3 testPos = prevPos;
    testPos.x += 90.0 * dxRot;
    testPos.y += 90.0 * dyRot;
    testPos.z += 90.0 * dz;
    if (sdCone(testPos, vec2(sin(1.0),cos(1.0)), 20.) > 0.0) {
      // prevPos.x -= .5*(1.0 + vUv.y) * sin(5.*time + 10.0 * vUv.y);
      float moveTowards = 30.0 * (ceil(mod(0.8*time + 10.0 * vUv.y, 2.0)) - 1.5);
      float d = moveTowards - prevPos.x;
      float s = sign(d);
      prevPos.x += .9*(1.0 + vUv.y)*s;
      alpha = 0.1;
    }
    else{
      prevPos.x += 90.0 * dxRot;
      prevPos.y += 90.0 * dyRot;
      prevPos.z += 90.0 * dz;
    }

  } else if (vUv.x < 0.02) {
    prevPos = mainPos2.xyz;
    prevPos.x += 0.1;
    prevPos.z += 0.1;
  } else {
    vec2 m = vUv;
    m.x -= 2. / 99.;
    vec3 mPos = texture2D(positionTex, vUv).xyz;
    prevPos = 0.2 * texture2D(positionTex, m).xyz + 0.8 * mPos;
    if (sdCone(prevPos, vec2(sin(1.0),cos(1.0)), 20.) > 0.0) {
      alpha = 0.1;
    }
  }

  gl_FragColor = vec4(prevPos, alpha);
}
