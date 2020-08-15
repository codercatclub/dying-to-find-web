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

float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdCone( vec3 p, vec2 c, float h )
{
  float q = length(p.xz);
  return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
}
float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}
vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}
float opSubtraction( float d1, float d2 ) { return max(-d1,d2); }




float sdRhombus(vec3 p, float la, float lb, float h, float ra)
{
  vec3 oldP = p;
  p.x = oldP.x;
  p.z = p.y;
  p.y = oldP.z;
  // vec2 pRot = rotate(p.xz, 0.05* time);
  // p.xz = pRot;
  p = abs(p);
  vec2 b = vec2(la,lb);
  float f = clamp( (ndot(b,b-2.0*p.xz))/dot(b,b), -1.0, 1.0 );
  vec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);
  return min(max(q.x,q.y),0.0) + length(max(q,0.0));
}
float scene(vec3 pos)
{
  float rhombus = sdRhombus(pos, 10.0,30.0,10.0,10.0);
  float sphere = sdSphere(pos, 14.0);
  return opSubtraction(sphere,rhombus);
}
void main() {
  vec3 prevPos;
  float alpha = 1.0;

  vec4 mainPos2 = texture2D(positionTex, vec2(0., vUv.y));

  if (vUv.x < 0.01) {
    prevPos = mainPos2.xyz;
    float angle = time / 15.0;
    vec3 offset = vec3(0.5*time, 0.5*time, 0.0);
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

    if (scene(prevPos) > 0.0) {
      // prevPos.x -= .5*(1.0 + vUv.y) * sin(5.*time + 10.0 * vUv.y);
      float moveTowards = 100.0 * (ceil(mod(0.8*time + 10.0 * vUv.y, 2.0)) - 1.5);
      float moveTowardsY = 100.0 * (fract(0.03*time + 10.0 * vUv.y) - .5);
      float moveTowardsZ = 10.0 * (fract(0.03*time + 10.0 * vUv.y) - .5);
      float d = moveTowards - prevPos.x;
      float s = sign(d);

      float d2 = moveTowardsY - prevPos.y;
      float s2 = sign(d2);

      float d3 = moveTowardsZ - prevPos.z;
      float s3 = sign(d3);

      prevPos.x += .8*(1.0 + vUv.y)*s;
      prevPos.y += .07*(1.0 + vUv.y)*s2;
      prevPos.z += .01*(1.0 + vUv.y)*s3;
    alpha = 0.1;
    }
    else{
      prevPos.x += 122.0 * dxRot;
      prevPos.y += 122.0 * dyRot;
      prevPos.z += 122.0 * dz;
    }

  } else if (vUv.x < 0.02) {
    prevPos = mainPos2.xyz;
    prevPos.x += 0.1;
    prevPos.z += 0.1;
    if (scene(prevPos) > 0.0) {
      alpha = 0.1;
    }
  } else {
    vec2 m = vUv;
    m.x -= 2. / 99.;
    vec3 mPos = texture2D(positionTex, vUv).xyz;
    prevPos = 0.2 * texture2D(positionTex, m).xyz + 0.8 * mPos;
    if (scene(prevPos) > 0.0) {
      alpha = 0.1;
    }
  }

  gl_FragColor = vec4(prevPos, alpha);
}
