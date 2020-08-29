@import ./FogFragPars;
varying vec2 vUv;
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

void main() {
  float c = cos(47.0 * vUv.x + vUv.y - timeMsec/300.0) * (1.0 + 0.03*cos(timeMsec/30.0) ) * sin(10.0 * vUv.x + vUv.y - timeMsec /600.0);
  vec3 col = spectral_zucconi(400.0 + 200.0*c);

  gl_FragColor = vec4(col, 1.0);
  @import ./FogFrag;
}