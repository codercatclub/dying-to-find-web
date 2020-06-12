varying vec3 viewDir;
varying vec3 worldNormal;
@import ./FogFragPars;

float julia(vec2 p) {
  float x1 = p.x;
  float y1 = p.y;
  float c1 = -0.5125+ 0.5*sin(timeMsec/1000.0)*cos(timeMsec/1000.0);
  float c2 = 0.5212+ 0.5*sin(timeMsec/1000.0);
  for(int i = 0; i < 6; i++)
  {
    float x = x1; 
    float y = y1; 
    x1 = (x*x -y*y) + c1;
    y1 = 2.*x*y + c2; 
  }
  return sqrt(x1*x1 + y1*y1);
}

vec3 bump3y (vec3 x, vec3 yoffset)
{
	vec3 y = vec3(1.,1.,1.) - x * x;
	y = saturate(y-yoffset);
	return y;
}
vec3 spectral_zucconi (float w)
{
    // w: [400, 700]
	// x: [0,   1]
	float x = saturate((w - 400.0)/ 300.0);

	const vec3 cs = vec3(3.54541723, 2.86670055, 2.29421995);
	const vec3 xs = vec3(0.69548916, 0.49416934, 0.28269708);
	const vec3 ys = vec3(0.02320775, 0.15936245, 0.53520021);

	return bump3y (	cs * (x - xs), ys);
}

vec4 julia(vec3 p, vec4 c) {
  // start with p.x and p.y 
  vec4 r = vec4(p.x, p.y, p.z,.0);
  vec4 d = vec4(0.0, 0.0, 0., 0.0);

  
  for(int i = 0; i < 5; i++)
  {
    vec4 q = r;
    r.x = q.x*q.x - dot( q.yzw, q.yzw ) + c.x;
    r.yzw = 2.0*q.x*q.yzw + c.yzw;
    d += (r - q);
  }
  return d;
}

void main() {
  vec4 c = vec4 (-0.4,0.3,-0.0,0.0);

  c.x +=  0.4*sin(timeMsec/2000.0);
  c.y +=  0.4*cos(timeMsec/5000.0);
  c.z +=  0.4*sin(timeMsec/1000.0);

  float vReflectionFactor =pow( 1.0 + dot( normalize(viewDir), worldNormal ), 8.0);
  vec4 j = saturate(julia(0.5 * normalize(worldNormal + 10.0 * vReflectionFactor),c));

  float spectralJulia = 400.0 + 400.0 * max(j.x, j.y);
  vec3 color = spectral_zucconi(spectralJulia);
  gl_FragColor = vec4( color.rg, smoothstep(0.1,1.0, color.b), 1.0 );
  @import ./FogFrag;
}




// void main() {
//   float vNoise = smoothstep(0.0,2.0,julia(0.34*vUv));

//   float vs2 = 0.4 * (mod(vNoise,0.1) - 0.05);
//   //make metallic based on this    
  
//   float vReflectionFactor =4.0 * pow( 1.0 + dot( normalize( I ), worldNormal ), 4.0 + 2.0*vNoise );

//   vec3 color = spectral_zucconi(400.0 + 300.0 * (vReflectionFactor - vNoise - vs2));
//   gl_FragColor = vec4( color.rgb, 1.0 );
// }
// vec4 julia(vec3 p, vec4 c) {
//   // start with p.x and p.y 
//   vec4 r = vec4(p.x, p.y, p.z,.0);
//   for(int i = 0; i < 8; i++)
//   {
//     vec4 q = r;
//     r.x = q.x*q.x - dot( q.yzw, q.yzw ) + c.x;
//     r.yzw = 2.0*q.x*q.yzw + c.yzw;
//   }
//   //return sqrt(r.x*r.x + r.y*r.y + r.z*r.z + r.w*r.w);
//   return r;
// }
// void main() {
//     vec4 c = vec4 (-0.2,0.8,0.0,0.0);

//     c.x +=  0.4*sin(timeMsec/3000.0);
//     c.y +=  0.4*cos(timeMsec/8000.0);

//   vec4 j = saturate(julia((0.7)*normalize( worldPos ),c));

//   float vReflectionFactor =pow( 1.0 + dot( normalize( I ), worldNormal ), 8.0);

//   float spectralJulia = 400.0 + 400.0 * max(j.x, j.y);
//   vec3 color = spectral_zucconi(spectralJulia) + spectral_zucconi(400.0 + 300.0 * vReflectionFactor);
//   gl_FragColor = vec4( color.rg, smoothstep(0.1,1.0,color.b), 1.0 );
// }

// vec4 quat_from_axis_angle(vec3 axis, float angle)
// { 
//   vec4 qr;
//   float half_angle = (angle * 0.5) * 3.14159 / 180.0;
//   qr.x = axis.x * sin(half_angle);
//   qr.y = axis.y * sin(half_angle);
//   qr.z = axis.z * sin(half_angle);
//   qr.w = cos(half_angle);
//   return qr;
// }

// vec3 rotate_vertex_position(vec3 position, vec3 axis, float angle)
// { 
//   vec4 q = quat_from_axis_angle(axis, angle);
//   vec3 v = position.xyz;
//   return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
// }

// float julia(vec3 p, vec4 c) {
//   // start with p.x and p.y 
//   vec4 r = vec4(p.x, p.y, p.z,.0);
//   for(int i = 0; i < 8; i++)
//   {
//     vec4 q = r;
//     r.x = q.x*q.x - dot( q.yzw, q.yzw ) + c.x;
//     r.yzw = 2.0*q.x*q.yzw + c.yzw;
//   }
//   return sqrt(r.x*r.x + r.y*r.y + r.z*r.z + r.w*r.w);
// }
// void main() {
//     vec4 c = vec4 (-0.2,0.8,0.0,0.0);

//     c.x +=  0.2*sin(timeMsec/2000.0);
//     c.y +=  0.2*cos(timeMsec/5000.0);
//     c.z +=  0.2*sin(timeMsec/1000.0);


//   float j = smoothstep(0.0, 2.0,julia((0.3)*normalize( worldPos ),c));
//   vec3 norms = rotate_vertex_position(worldNormal, vec3(0.0, 1.0, 0.0), 40.0 * (j - 0.5));

//   float vReflectionFactor =pow( 1.0 + dot( normalize( I ), normalize(norms) ), 2.0);
//   vec3 color =spectral_zucconi(400.0 + 300.0 * vReflectionFactor);
//   gl_FragColor = vec4( color.r, color.g, smoothstep(0.2,1.0,color.b),1.0);
// }