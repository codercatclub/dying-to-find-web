#include <fog_pars_fragment> 

void main() {
  gl_FragColor= vec4(0.0, 0.0, 0.0, 1.0);
  #include <fog_fragment> 
}