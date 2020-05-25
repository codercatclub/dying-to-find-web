#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float fogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif

void main() {
  gl_FragColor= vec4(0.0, 0.0, 0.0, 1.0);
  #ifdef USE_FOG
    #ifdef FOG_EXP2
      float fogFactor = 1.0 - exp( - fogDensity * fogDensity * fogDepth * fogDepth );
    #else
      float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
    #endif
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
  #endif
}