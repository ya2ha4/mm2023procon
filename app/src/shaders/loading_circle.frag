varying vec2 vUv;
uniform vec4 effectParam;
#define timer effectParam.x
#define opacity effectParam.y

const float PI  = 3.141592653589793;
const float PI2 = PI * 2.;

vec3[6] base_colors=vec3[](
   vec3(57.0 / 255.0, 197.0 / 255.0, 187.0 / 255.0),
   vec3(255.0 / 255.0, 165.0 / 255.0, 0.0 / 255.0),
   vec3(255.0 / 255.0, 226.0 / 255.0, 17.0 / 255.0),
   vec3(255.0 / 255.0, 192.0 / 255.0, 203.0 / 255.0),
   vec3(216.0 / 255.0, 0.0 / 255.0, 0.0 / 255.0),
   vec3(0.0 / 255.0, 0.0 / 255.0, 255.0 / 255.0)
);
vec3[6] pale_colors=vec3[](
   vec3(232.0 / 255.0, 242.0 / 255.0, 241.0 / 255.0),
   vec3(255.0 / 255.0, 244.0 / 255.0, 226.0 / 255.0),
   vec3(255.0 / 255.0, 252.0 / 255.0, 233.0 / 255.0),
   vec3(255.0 / 255.0, 240.0 / 255.0, 243.0 / 255.0),
   vec3(249.0 / 255.0, 227.0 / 255.0, 229.0 / 255.0),
   vec3(239.0 / 255.0, 239.0 / 255.0, 249.0 / 255.0)
);

float torus(vec2 p, float ir,float or){
   if(length(p) > or) return 0.0;
   if(length(p) < ir) return 0.0;
   return 1.0;
}
float circle(vec2 p, float r) {
    return length(p) < r ? 1.0 : 0.0;
}
void main() {
   if(opacity < 0.1) discard;//ゴミが出ないように
   float l_threshold = fract(timer);
   float ir = 0.7;
   float or = 1.0;
   vec2 pos = 2.0*vUv - vec2(1.0,1.0);
   float l =0.;
   vec2 p = pos.yx;
   l = (atan(p.y,p.x)+PI)/PI2;
   //vec3 color = vec3(torus(vUv-vec2(0.5,0.5),ir, or));
   if( l < l_threshold){discard;}
   if(torus(p,ir, or) < 1.0){discard;}
   int idx = int(mod(timer, 6.0));
   vec3 c = mix(base_colors[idx],pale_colors[idx],l_threshold);
   gl_FragColor = vec4(c.xyz,1.0);
}