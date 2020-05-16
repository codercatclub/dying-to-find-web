varying float vReflectionFactor;

uniform vec3 color;

void main() {
  vec4 refractedColor = vec4( 0.2, 0.2, 0.2, 1.0 );
  vec4 reflectedColor = vec4( 0.8, 0.8, 0.8, 1.0 );

  gl_FragColor = vec4(color, 1.0);
}
