varying vec2 vUv;
uniform vec4 effectParam;
#define timer effectParam.x
#define type_idx ((effectParam.y+1.0)*0.5)

float circle(vec2 p, float r) {
    return length(p) < r ? 1.0 : 0.0;
}
float torus(vec2 p, float ir,float or){
   if(length(p) > or) return 0.0;
   if(length(p) < ir) return 0.0;
   return 1.0;
}

float box(vec2 p, float ir,float or){
   float x_abs = abs(p.x);
   float y_abs = abs(p.y);
   if(x_abs > ir && x_abs < or){
      if(y_abs < or)
       return 1.0;
   }
   if(y_abs > ir && y_abs < or){
      if(x_abs < or)
       return 1.0;
   }
   return 0.0;
}

float cross_mark(vec2 p,float ir,float or){
   float abs_x=abs(p.x);
   float abs_y=abs(p.y);
   if(abs_x > or || abs_y > or) return 0.0;
   float dist = abs(abs_x - abs_y);
   
   return dist < (ir*0.5) ? 1.0 : 0.0;
}

float in_triangle(vec2 p,vec2 a,vec2 b,vec2 c){
   vec2 ab = b - a;
   vec2 bp = p - b;

   vec2 bc = c - b;
   vec2 cp = p - c;
   
   vec2 ca = a - c;
   vec2 ap = p - a;

   float c1 = ab.x*bp.y - ab.y*bp.x;
   float c2 = bc.x*cp.y - bc.y*cp.x;
   float c3 = ca.x*ap.y - ca.y*ap.x;
   if(c1 >0.0 && c2 >0.0 && c3 > 0.0){
      return 1.0;
   }
   if(c1 < 0.0 && c2 < 0.0 && c3 < 0.0){
      return 1.0;
   }
   return 0.0;
}

float triangle_mark(vec2 p,float ir,float or){
   vec2 o_top=vec2(0.0,-or);
   vec2 i_top=vec2(0.0,-ir);
   vec2 o_r=vec2(-0.9,0.45) * or;
   vec2 i_r=vec2(-0.9,0.45) * ir;
   vec2 o_l=vec2(0.9,0.45) * or;
   vec2 i_l=vec2(0.9,0.45) * ir;
   if(in_triangle(p,i_top,i_r,i_l) > 0.0) return 0.0;
   if(in_triangle(p,o_top,o_r,o_l) < 1.0) return 0.0;
   return 1.0;
}

void main() {
   if(timer < 0.01) discard;//ゴミが出ないように
   float ir = 0.8 * (1.0-timer*2.0);
   float or = 1.0 * (1.0-timer*2.0);
   vec2 pos = 2.0*vUv - vec2(1.0,1.0);
   //vec3 color = vec3(torus(vUv-vec2(0.5,0.5),ir, or));
   if(type_idx > 3.0){
         if(box(pos,ir, or) < 1.0){discard;}
   }else if(type_idx > 2.0){
      if(triangle_mark(pos, ir, or) < 1.0){discard;}
   }else if( type_idx > 1.0){
      if(cross_mark(pos, ir*0.5, or) < 1.0){discard;}
   }else{
      if(torus(pos,ir, or) < 1.0){discard;}
   }
   gl_FragColor = vec4(vec3(1.0),timer*2.0);
}