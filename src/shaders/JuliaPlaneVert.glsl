@import ./PerlinNoise;

varying vec3 viewDir;
varying vec3 worldNormal;
varying float colorMask;

attribute vec3 color;

@import ./FogVertPars;

void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  worldNormal = normalize( position.xyz + mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  vec4 mvPosition = viewMatrix * worldPosition;
  viewDir = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;

  colorMask = color.r;
  @import ./FogVert;
}

