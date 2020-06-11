#ifdef USE_FOG
  //float noise = cnoise( 0.007 * (vWorldPos.xy + vec2(vWorldPos.z, 0.0)));
//   float vFogDepth = fogDepth - 2.0* fogDepth;
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * fogDepth * fogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
	#endif
	// gl_FragColor.rgb = mix( gl_FragColor.rgb, mix(fogColor, vec3(1.0, 1.0, 1.0), clamp(vWorldPos.y-50.0,0.0,40.0)/40.0), fogFactor );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif