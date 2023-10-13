import GUI from "lil-gui";
// レンダリングの元締め
import { EffectComposer, Pass } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Camera } from "three/src/cameras/Camera";
import { Layers } from "three/src/core/Layers";
import { Object3D } from "three/src/core/Object3D";
import { Uniform } from "three/src/core/Uniform";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial";
import { Vector2 } from "three/src/math/Vector2";
import { Vector4 } from "three/src/math/Vector4";
import { Mesh } from "three/src/objects/Mesh";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { Scene } from "three/src/scenes/Scene";

import bloom_composit_frag from "../shaders/bloom_composit.frag";
import bloom_composit_vert from "../shaders/bloom_composit.vert";

import touch_effect_frag from "../shaders/touch_effect.frag";
import touch_effect_vert from "../shaders/touch_effect.vert";
import loading_circle_frag from "../shaders/loading_circle.frag";

import { Vector3 } from "three/src/math/Vector3";
import { idolAnimation } from "../object/animation/AnimationFunction";
import { BufferGeometry, Mapping, OrthographicCamera, PlaneGeometry, WebGLRenderTarget } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { DefDevelop } from "../ConstantDefine";

const BLOOM_SCENE: number = 1;

const FLAG_ENABLE_BLOOM: number = 1 << 0;
const FLAG_ENABLE_MSAA: number = 1 << 1;

class RendererDebugGUI {
    private _gui: GUI;
    public _isEnable: boolean;
    public _whiteValue: number;
    public _colorType: number;
    public _colorMixRatio: number;
    public _bloomParam: Vector3;
    public constructor() {
        this._gui = null;
        this._isEnable = false;
        this._whiteValue = 0.0;
        this._colorType = 0;
        this._colorMixRatio = 0.0;
        this._bloomParam = null;
    }
    public initialize() {
        this._gui = new GUI();
        this._bloomParam = new Vector3(1.0, 0.8, 0.0);
        let obj = {
            isEnable: false,
            whiteValue: 0.0,
            colorType: 0,
            colorMixRatio: 0.0,
            bloomParamStrength: 1.0,
            bloomParamRadius: 0.8,
            bloomParamThreshold: 0.0,
        };
        this._gui.add(obj, "isEnable").onChange((v) => (this._isEnable = v));
        this._gui.add(obj, "whiteValue", -1.0, 1.0, 0.01).onChange((v) => (this._whiteValue = v));
        this._gui.add(obj, "colorType", 0, 2, 1).onChange((v) => (this._colorType = v));
        this._gui.add(obj, "colorMixRatio", 0, 1, 0.01).onChange((v) => (this._colorMixRatio = v));
        this._gui.add(obj, "bloomParamStrength", 0, 10, 0.1).onChange((v) => this._bloomParam.setX(v));
        this._gui.add(obj, "bloomParamRadius", 0, 10, 0.1).onChange((v) => this._bloomParam.setY(v));
        this._gui.add(obj, "bloomParamThreshold", 0, 10, 0.1).onChange((v) => this._bloomParam.setZ(v));
    }
}

class TouchEffectObject {
    private _m: Mesh;
    private _mt: ShaderMaterial;
    private _extraParameter: Vector4;
    private _timer: number;
    private _color: Vector3;

    public constructor() {
        this._m = null;
        this._mt = null;
        this._extraParameter = null;
        this._timer = 0;
        this._color = null;
    }

    public initialize(inScene: Scene, g: BufferGeometry, defaulColor: Vector3): void {
        this._extraParameter = new Vector4();
        this._color = new Vector3();
        this._color.copy(defaulColor);
        this._extraParameter.set(this._timer, this._color.x, this._color.y, this._color.z);
        let mt = new ShaderMaterial({
            vertexShader: bloom_composit_vert,
            fragmentShader: touch_effect_frag,
            uniforms: {
                effectParam: new Uniform(this._extraParameter),
            },
        });
        this._mt = mt;
        this._m = new Mesh(g, this._mt);
        this._m.position.copy(new Vector3(0, 0, 0.0));
        this._timer = 0;
        inScene.add(this._m);
    }

    public update(delta: number) {
        this._extraParameter.set(this._timer, this._color.x, this._color.y, this._color.z);
        this._mt.uniforms.effectParam = new Uniform(this._extraParameter);
        this._mt.uniformsNeedUpdate = true;
        this._timer -= delta;
        if (this._timer < 0.0) {
            this._timer = 0.0;
        }
    }

    public setTouchPos(pos: Vector3, color: Vector3) {
        let ofs_pos = pos;
        ofs_pos.x = ofs_pos.x * -1;
        this._m.position.copy(ofs_pos);
        this._timer = 0.5;
        this._color.copy(color);
    }

    public resize(scale: number) {
        this._m.scale.set(scale, scale, scale);
    }
}

class LoadingCircleObject {
    private _m: Mesh;
    private _mt: ShaderMaterial;
    private _extraParameter: Vector4;
    private _timer: number;
    private _opacity: number;
    public constructor() {
        this._m = null;
        this._mt = null;
        this._extraParameter = null;
        this._timer = 0;
        this._opacity = 1.0;
    }
    public initialize(inScene: Scene, g: BufferGeometry, screenParam: Vector2): void {
        this._extraParameter = new Vector4();
        this._extraParameter.set(this._timer, this._opacity, 0.0, 0.0);
        let mt = new ShaderMaterial({
            vertexShader: bloom_composit_vert,
            fragmentShader: loading_circle_frag,
            uniforms: {
                effectParam: new Uniform(this._extraParameter),
            },
        });
        this._mt = mt;
        this._m = new Mesh(g, this._mt);
        this._m.position.copy(new Vector3(screenParam.x * -0.5, screenParam.y * 0.5, 0.0));
        inScene.add(this._m);
    }
    public update(delta: number) {
        this._extraParameter.set(this._timer, this._opacity, 0.0, 0.0);
        this._mt.uniforms.effectParam = new Uniform(this._extraParameter);
        this._mt.uniformsNeedUpdate = true;
        this._timer += delta;
    }
    public resize(scale: number, x: number, y: number) {
        this._m.scale.set(scale, scale, scale);
        this._m.position.copy(new Vector3(x, y));
    }
    public setDisp(flag: boolean) {
        if (flag) {
            this._opacity = 1.0;
        } else {
            this._opacity = 0.0;
        }
    }
}
class TouchEffectRenderer {
    private _screenSpaceCamera: OrthographicCamera;
    private _scene: Scene;
    public _compositer: EffectComposer;
    private _pass: RenderPass;
    private _color: Vector3;
    private _effects: Array<TouchEffectObject>;
    private _effectIdx: number;
    private _loading: LoadingCircleObject;
    public constructor() {
        this._screenSpaceCamera = null;
        this._scene = null;
        this._compositer = null;
        this._pass = null;
        this._color = null;
        this._effects = null;
        this._effectIdx = 0;
        this._loading = null;
    }
    public initialize(screenParam: Vector2, inRenderer: WebGLRenderer): void {
        this._scene = new Scene();
        this._color = new Vector3(1.0, 1.0, 1.0);
        this._screenSpaceCamera = new OrthographicCamera(0, screenParam.x, 0, screenParam.y, -1, 100);
        this._screenSpaceCamera.up.set(0, 1, 0);
        this._screenSpaceCamera.position.copy(new Vector3(0, 0, -1.0));
        this._screenSpaceCamera.lookAt(this._scene.position);
        this._compositer = new EffectComposer(inRenderer);
        this._compositer.renderToScreen = false;
        this._pass = new RenderPass(this._scene, this._screenSpaceCamera);
        this._compositer.addPass(this._pass);
        let g = new PlaneGeometry(128, 128);
        this._effects = new Array<TouchEffectObject>();
        for (let i: number = 0; i < 8; ++i) {
            this._effects.push(new TouchEffectObject());
            this._effects[i].initialize(this._scene, g, this._color);
        }
        this._loading = new LoadingCircleObject();
        this._loading.initialize(this._scene, g, screenParam);
    }

    public render(delta: number): void {
        this._screenSpaceCamera.updateMatrix();
        this._screenSpaceCamera.updateProjectionMatrix();
        this._effects.forEach((v) => v.update(delta));
        this._loading.update(delta);
        this._compositer.render();
    }
    public setTouchPos(pos: Vector3): void {
        this._effects[this._effectIdx].setTouchPos(pos, new Vector3(this._effectIdx, 0.0, 0.0));
        this._effectIdx = (this._effectIdx + 1) % this._effects.length;
    }
    public setTouchColor(inCol: Vector3): void {
        this._color.copy(inCol);
    }
    public resize(inWidth: number, inHeight: number) {
        this._screenSpaceCamera.left = this._compositer.renderer.domElement.offsetLeft;
        this._screenSpaceCamera.right = this._screenSpaceCamera.left + inWidth;
        this._screenSpaceCamera.bottom = inHeight;
        this._screenSpaceCamera.updateMatrix();
        this._screenSpaceCamera.updateProjectionMatrix();
        let s: number = Math.max(0.75, inWidth / 1920);
        this._effects.forEach((v) => v.resize(s));
        this._loading.resize(s, -0.5 * (this._screenSpaceCamera.left + this._screenSpaceCamera.right), 0.5 * inHeight);
    }
    public dispLoading(flag: boolean) {
        this._loading.setDisp(flag);
    }
}
export default class MyRenderer {
    private _bloomCompositor: EffectComposer;
    private _finalCompositor: EffectComposer;
    private _renderWidth: number;
    private _renderHeight: number;
    private _darkMaterial: MeshBasicMaterial;
    private _materials;
    private _targetScene: Scene;
    private _bloomLayer: Layers;

    private _touchEffect: TouchEffectRenderer;
    //
    private _base3DPass: Pass;
    private _unrealBloomPass: UnrealBloomPass;
    private _bloomParam: Vector3;
    private _smaaPass: SMAAPass;
    private _renderPassConfigFlags: number;
    private _compositPass: ShaderPass;
    private _extraParamter: Vector4;

    private _debugParam: RendererDebugGUI;
    public constructor() {
        this._bloomCompositor = null;
        this._finalCompositor = null;
        this._renderWidth = 0;
        this._renderHeight = 0;
        this._darkMaterial = null;
        this._targetScene = null;
        this._bloomLayer = null;
        this._bloomParam = null;
        this._materials = null;
        this._base3DPass = null;
        this._smaaPass = null;
        this._compositPass = null;
        this._extraParamter = null;
        this._renderPassConfigFlags = FLAG_ENABLE_BLOOM | FLAG_ENABLE_MSAA;
        this._touchEffect = null;
        this._debugParam = null;
    }
    public initialize(inRenderer: WebGLRenderer, inWidth: number, inHeight: number, inScene: Scene, inCamera: Camera): void {
        // 内部的なレンダリング解像度を1/2にして速さを稼ぐことにする
        this._renderWidth = inWidth;
        this._renderHeight = inHeight;
        this._targetScene = inScene;
        this._bloomLayer = new Layers();
        this._bloomLayer.set(BLOOM_SCENE);
        this._darkMaterial = new MeshBasicMaterial({ color: `black` });
        this._materials = {};
        this._extraParamter = new Vector4(0.0, 0.0, 0.0, 0.0);
        this._bloomCompositor = new EffectComposer(inRenderer);
        this._bloomCompositor.renderToScreen = false;
        this._bloomParam = new Vector3(0.5, 0.1, 0.0);
        this._base3DPass = new RenderPass(inScene, inCamera);
        this._touchEffect = new TouchEffectRenderer();
        this._touchEffect.initialize(new Vector2(this._renderWidth, this._renderHeight), inRenderer);

        const vec = new Vector2(this._renderWidth * 0.5, this._renderHeight * 0.5);
        this._unrealBloomPass = new UnrealBloomPass(vec, this._bloomParam.x, this._bloomParam.y, this._bloomParam.z);
        this._bloomCompositor.addPass(this._base3DPass);
        this._bloomCompositor.addPass(this._unrealBloomPass);

        this._compositPass = new ShaderPass(
            new ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this._bloomCompositor.renderTarget2.texture },
                    touchTexture: { value: this._touchEffect._compositer.renderTarget2.texture },
                    effectParam: new Uniform(this._extraParamter),
                },
                vertexShader: bloom_composit_vert,
                fragmentShader: bloom_composit_frag,
                defines: {},
            }),
            "baseTexture"
        );
        this._compositPass.needsSwap = true;
        this._finalCompositor = new EffectComposer(inRenderer);
        this._finalCompositor.addPass(this._base3DPass);
        this._finalCompositor.addPass(this._compositPass);
        this._smaaPass = new SMAAPass(this._renderWidth, this._renderHeight);
        this.setAAPass();
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            this._debugParam = new RendererDebugGUI();
            this._debugParam.initialize();
        }
    }
    public render(delta: number): void {
        if (this._debugParam && this._debugParam._isEnable) {
            let v4 = new Vector4(this._debugParam._whiteValue, this._debugParam._colorType, this._debugParam._colorMixRatio, 0.0);
            this._compositPass.material.uniforms.effectParam = new Uniform(v4);
            this._unrealBloomPass.strength = this._debugParam._bloomParam.x;
            this._unrealBloomPass.radius = this._debugParam._bloomParam.y;
            this._unrealBloomPass.threshold = this._debugParam._bloomParam.z;
        } else {
            this._compositPass.material.uniforms.effectParam = new Uniform(this._extraParamter);
            this._unrealBloomPass.strength = this._bloomParam.x;
            this._unrealBloomPass.radius = this._bloomParam.y;
            this._unrealBloomPass.threshold = this._bloomParam.z;
        }
        this._unrealBloomPass.compositeMaterial.needsUpdate = true;
        this._touchEffect.render(delta);
        if (0 != (this._renderPassConfigFlags & FLAG_ENABLE_BLOOM)) {
            this.renderBloomPass();
        }
        this._compositPass.material.uniforms.bloomTexture.value = this._bloomCompositor.renderTarget2.texture;
        this._compositPass.material.uniforms.touchTexture.value = this._touchEffect._compositer.renderTarget2.texture;
        this._compositPass.material.uniformsNeedUpdate = true;

        this._finalCompositor.render();
    }
    private renderBloomPass(): void {
        this._targetScene.traverse((obj: Object3D) => {
            this.darkenNonBloom(obj);
        });
        this._bloomCompositor.render();
        this._targetScene.traverse((obj: Object3D) => {
            this.restoreMaterial(obj);
        });
    }
    private darkenNonBloom(obj: Object3D): void {
        const o = <Mesh>obj;
        if (o.isMesh) {
            if (!this._bloomLayer.test(o.layers)) {
                this._materials[obj.uuid] = o.material;
                o.material = this._darkMaterial;
            }
        }
    }
    private restoreMaterial(obj): void {
        if (this._materials[obj.uuid]) {
            obj.material = this._materials[obj.uuid];
            delete this._materials[obj.uuid];
        }
    }
    private setAAPass(): void {
        if (0 != (this._renderPassConfigFlags & FLAG_ENABLE_MSAA)) {
            this._finalCompositor.addPass(this._smaaPass);
        } else {
            this._finalCompositor.removePass(this._smaaPass);
        }
    }

    private debugEventAA(e: MouseEvent): void {
        if (!e.altKey) {
            return;
        }
        if (0 != (this._renderPassConfigFlags & FLAG_ENABLE_MSAA)) {
            this._renderPassConfigFlags &= ~FLAG_ENABLE_MSAA;
        } else {
            this._renderPassConfigFlags |= FLAG_ENABLE_MSAA;
        }
        this.setAAPass();
    }
    private debugEventBloom(e: MouseEvent): void {
        if (!e.ctrlKey) {
            return;
        }
        // 一発でトグルできるビット演算があった気がするが...
        if (0 != (this._renderPassConfigFlags & FLAG_ENABLE_BLOOM)) {
            this._renderPassConfigFlags &= ~FLAG_ENABLE_BLOOM;
        } else {
            this._renderPassConfigFlags |= FLAG_ENABLE_BLOOM;
        }
    }

    private debugEvent(e: MouseEvent) {
        this.debugEventAA(e);
        this.debugEventBloom(e);
    }
    public setDebugEvent(c: HTMLElement): void {
        c.addEventListener("click", (event) => this.debugEvent(event));
    }

    public resize(inWidth: number, inHeight: number) {
        this._renderWidth = inWidth;
        this._renderHeight = inHeight;
        this._unrealBloomPass.setSize(this._renderWidth * 0.5, this._renderHeight * 0.5);
        this._smaaPass.setSize(this._renderWidth, this._renderHeight);
        this._bloomCompositor.setSize(this._renderWidth, this._renderHeight);
        this._finalCompositor.setSize(this._renderWidth, this._renderHeight);
        this._touchEffect.resize(inWidth, inHeight);
    }

    public setWhiteOutIntensity(inIntensity: number) {
        this._extraParamter.setX(inIntensity);
    }
    public setFilterType(filterId: number) {
        this._extraParamter.setY(filterId);
    }
    public setFilterMixRatio(mixRatio: number) {
        this._extraParamter.setZ(mixRatio);
    }
    public setTouchColor(color: Vector3) {
        this._touchEffect.setTouchColor(color);
    }
    public setTouchPos(e: MouseEvent) {
        const element = <HTMLDivElement>e.currentTarget;
        const x = e.clientX - element.offsetLeft;
        const y = e.clientY - element.offsetTop;
        const p = new Vector3(x, y, 0);
        this._touchEffect.setTouchPos(p);
    }

    public dispLoading(isDisp: boolean) {
        this._touchEffect.dispLoading(isDisp);
    }
}
