// vertex shader (バーテックスシェーダー)
// ポリゴンの各頂点ごとの処理

// ピクセルシェーダで処理する為の変数
varying vec2 vUv;
varying vec3 P;
varying vec3 N;

void main() {
    vUv = uv;
    // vec3 position2 = position + vec3(0.3,0.3,1.0);
    // vec4 worldPosition = modelMatrix * vec4( position2, 1.0 );
    // vec4 mvPosition =  viewMatrix * worldPosition;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // modelViewMatrix = modelMatrix * viewMatrix;

    // 頂点までの位置ベクトル
    P = vec3(modelViewMatrix *  vec4( position, 1.0 )) ;
    N = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
}
