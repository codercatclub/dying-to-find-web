uniform float timeMsec;
varying vec3 viewDir;
varying vec3 worldNormal;
uniform vec4 playerPos1;
uniform vec4 playerPos2;

attribute vec3 _primcenter;
#include <fog_pars_vertex>

vec4 quat_from_axis_angle(vec3 axis, float angle)
{ 
  vec4 qr;
  float half_angle = (angle * 0.5);
  qr.x = axis.x * sin(half_angle);
  qr.y = axis.y * sin(half_angle);
  qr.z = axis.z * sin(half_angle);
  qr.w = cos(half_angle);
  return qr;
}

vec3 rotate_vertex_position(vec3 position, vec3 axis, float angle)
{ 
  vec4 q = quat_from_axis_angle(axis, angle);
  vec3 v = position.xyz;
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

  vec3 dif1 = worldPosition.xyz - playerPos1.xyz;
  vec3 dif2 = worldPosition.xyz - playerPos2.xyz;
  float dist1 = 1.0 - min(dot(dif1, dif1) * playerPos1.w, 1.0);
  float dist2 = 1.0 - min(dot(dif2, dif2) * playerPos2.w, 1.0);

  float finalDist = max(dist1, dist2);
  
  // worldPosition.xyz += 5.0 * finalDist * worldNormal;
  worldPosition.xyz = _primcenter + finalDist * worldNormal + rotate_vertex_position(worldPosition.xyz - _primcenter, worldNormal,  3.0 * finalDist);
  
  viewDir = normalize(dif2);

  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}


// vec4 julia(vec3 p, vec4 c) {
//   // start with p.x and p.y 
//   vec4 r = vec4(p.x, p.y, p.z,.0);
//   vec4 d = vec4(0.0, 0.0, 0., 0.0);

  
//   for(int i = 0; i < 5; i++)
//   {
//     vec4 q = r;
//     r.x = q.x*q.x - dot( q.yzw, q.yzw ) + c.x;
//     r.yzw = 2.0*q.x*q.yzw + c.yzw;
//     d += (r - q);
//   }
//   return d;
// }

// varying float spectralJulia;
// uniform float timeMsec;

// void main() {

//   vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
//   vec3 worldPos = position.xyz;
//   vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
//   vec3 I = worldPosition.xyz - cameraPosition;
//   vec4 c = vec4 (-0.4,0.3,-0.0,0.0);

//   c.x +=  0.4*sin(timeMsec/2000.0);
//   c.y +=  0.4*cos(timeMsec/5000.0);
//   c.z +=  0.4*sin(timeMsec/1000.0);

//   float vReflectionFactor =pow( 1.0 + dot( normalize( I ), worldNormal ), 8.0);
//   vec4 j = smoothstep(0.0,1.0,julia(0.5 * normalize( worldPos + 10.0 * vReflectionFactor),c));

//   spectralJulia = 400.0 + 400.0 * max(j.x, j.y);

//   vec3 newPosition = position - 0.1 * normal * (1.0 - smoothstep(0.6, 0.7, max(j.x, j.y)));
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
// }