// fragment shader (ピクセルシェーダー)
// 画面に表示する各ピクセルごとの処理

// バーテックスシェーダからの入力
varying vec2 vUv;

// プログラムからの入力
uniform float uAspect;
uniform float uTime;
uniform vec2  uMouse;
uniform float uRadius;
varying vec3 P;
varying vec3 N;
vec3 light_position = vec3(-10, -2, -2);
void main() {
    vec2 uv = vec2( vUv.x * uAspect, vUv.y );
    vec2 center = vec2( uMouse.x * uAspect, uMouse.y );
    float lightness = uRadius / length( uv - center );
    vec4 color = vec4( vec3( lightness), 1.0 );
    vec3 L = normalize(light_position.xyz - P);
    float dotNL = dot(N, L);
    vec4 diffuse = vec4(0.5, 0.5, 0.5, 0.5) * max(0.0, dotNL);
    vec4 ambient = vec4(0.05, 0.05, 0.05, 0.05);
    color *= vec4( 0.1, 0.1, 1.0, 1.0 );
    float shiness = 0.1;
    vec3 V = normalize(-P);
    vec3 H = normalize(L + V);
    float powNH = pow( max(dot(N, H), 0.0), shiness);
    vec4 specular = vec4( 0.05, 0.05, 0.05, 1.0 ) * powNH;
    gl_FragColor = ambient + diffuse + color + specular;
}
