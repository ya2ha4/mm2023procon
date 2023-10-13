
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform sampler2D touchTexture;
uniform vec4      effectParam;
#define whiteIntensity effectParam.x
#define configFlags effectParam.y
#define mixRatio effectParam.z

#define R_LUMINANCE 0.298912
#define G_LUMINANCE 0.586611
#define B_LUMINANCE 0.114478
#define Flag_Mono   (1.0)
#define Flag_Sepia  (2.0)

varying vec2 vUv;


vec3 to_monochrome(vec3 inColor){
    const vec3 monoScale = vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE);
    float gray = dot(inColor,monoScale);
    return vec3(gray,gray,gray);
}

vec3 to_sepia(vec3 inColor){
    float v = inColor.x * R_LUMINANCE + inColor.y * G_LUMINANCE + inColor.z * B_LUMINANCE;
    return vec3(v*0.9,v*0.7,v*0.4);
}

void main() {
    gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

    if(configFlags >= Flag_Sepia){
        gl_FragColor.rgb = mix(gl_FragColor.rgb,to_sepia(gl_FragColor.rgb),mixRatio);
    }else if(configFlags >= Flag_Mono){
        gl_FragColor.rgb = mix(gl_FragColor.rgb,to_monochrome(gl_FragColor.rgb),mixRatio);
    }

    if(whiteIntensity < 0.00){
        gl_FragColor.xyz *= 1.0f - abs(whiteIntensity);
    }else{
        gl_FragColor += vec4(whiteIntensity,whiteIntensity,whiteIntensity,1.0);
    }
    vec4 touch_c=texture2D(touchTexture,vUv);
    float f = dot(touch_c.rgb,touch_c.rgb);
    if(f > 0.0){
        vec3 t=touch_c.rgb * touch_c.a;
        vec3 b=gl_FragColor.rgb * (1.0-touch_c.a);
        gl_FragColor.rgb = t+b;
    }
    //gl_FragColor = (  texture2D( bloomTexture, vUv ) );
    //gl_FragColor = ( texture2D( baseTexture, vUv ));
}