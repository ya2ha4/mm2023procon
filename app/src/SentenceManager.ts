// 歌詞管理構造SentenceManager
// アプリ内では歌詞をSentenceという単位で操作する

import { ColorRepresentation, CylinderGeometry, Layers, MeshStandardMaterial, MeshStandardMaterialParameters, Material, MaterialParameters } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { SphereGeometry } from "three/src/geometries/SphereGeometry";
import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three/src/materials/MeshBasicMaterial";
import { Vector3 } from "three/src/math/Vector3";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";
import { Color } from "three/src/Three";

const BLOOM_SCENE: number = 1;

// 透明不透明の描画ソートは内部で切り替えてやるのがよかろう
// デフォルトが0らしくて、より大きな数字があとになる
// ...
const RENDER_ORDER_OPAQUE: number = 0;
const RENDER_ORDER_TRANSPARENT: number = 10;

// Sentence 共通の実装
export interface BaseSentenceParam {
    position: Vector3;
    isBloom: boolean;
}

export interface MaterialConfig {
    opacity?: number; // 不透明度 1.0(不透明)～0.0(透明)
    color?: ColorRepresentation; // 色
    isBloom?: boolean; // bloom発光させるかどうか
}

export class BaseSentence {
    protected _id: number;
    protected _mesh: Mesh;

    public constructor() {
        this._id = 0;
        this._mesh = null;
    }

    public destract(): void {
        this._mesh.geometry.dispose();
        this.disposeMaterial();
    }

    public setBloom(inEnable: boolean): void {
        if (inEnable) {
            this._mesh.layers.enable(BLOOM_SCENE);
        } else {
            this._mesh.layers.disable(BLOOM_SCENE);
        }
    }

    public setPosition(pos: Vector3): void {
        this._mesh.position.copy(pos);
    }

    public getPosition(): Vector3 {
        return this._mesh.position;
    }

    public getScale(): Vector3 {
        return this._mesh.scale;
    }

    public setScale(inScale: Vector3): void {
        this._mesh.scale.copy(inScale);
    }

    public setVisible(visible: boolean): void {
        this._mesh.visible = visible;
    }

    public setRotationFromAxisAngle(axis: Vector3, inAngle: number): void {
        this._mesh.setRotationFromAxisAngle(axis, inAngle);
    }

    public getId(): number {
        return this._id;
    }

    public getMesh(): Mesh {
        return this._mesh;
    }

    public setMaterial(configs: MaterialConfig[]): void {
        if (Array.isArray(this._mesh.material)) {
            this.setMaterialArray(configs);
            return;
        }

        if (1 < configs.length) {
            console.warn(`mesh.material は Material ですが、Material[] を設定しようとしています。\nconfig[0] の内容を設定します。`);
        }

        const config = configs[0];
        let l = new Layers();
        l.set(BLOOM_SCENE);
        let b: boolean = l.test(this._mesh.layers);
        this.setBloom(config.isBloom ?? b);

        let opacity_v = config.opacity ?? this._mesh.material.opacity;
        let opacity_f: boolean = opacity_v < 1.0;
        // 良い感じに元のパラメータを拾いつつ設定
        const mt = this.createMaterial(this._mesh.material, config, true);
        this.disposeMaterial();
        this._mesh.material = mt;
        // マテリアルの種別でレンダリング順を変えて重なりをマシに補正
        if (opacity_f) {
            this._mesh.renderOrder = RENDER_ORDER_TRANSPARENT;
        } else {
            this._mesh.renderOrder = RENDER_ORDER_OPAQUE;
        }
    }

    protected setMaterialArray(configs: MaterialConfig[]): void {
        if (Array.isArray(this._mesh.material)) {
            if (this._mesh.material.length != configs.length) {
                console.warn(
                    `mesh.material と configs のマテリアル数が異なっています。\n  mesh.material:${this._mesh.material.length}\n  configs:${configs.length}`
                );
                return;
            }

            // bloom は先頭の config を反映
            const config = configs[0];
            let l = new Layers();
            l.set(BLOOM_SCENE);
            let b: boolean = l.test(this._mesh.layers);
            this.setBloom(config.isBloom ?? b);

            let mts = new Array<Material>();
            this._mesh.material.forEach((material) => {
                // 良い感じに元のパラメータを拾いつつ設定
                // 複数マテリアル持ちの場合は不透明にするため、半透明の設定を無視
                const mt = this.createMaterial(material, configs[mts.length], false);
                mts.push(mt);
            });
            this.disposeMaterial();
            this._mesh.material = mts;
            // マテリアルの種別でレンダリング順を変えて重なりをマシに補正
            this._mesh.renderOrder = RENDER_ORDER_TRANSPARENT;
        } else {
            console.warn(`mesh.material は Material ですが、Material[] を設定しようとしています。`);
        }
    }

    protected createMaterial(srcMaterial: Material, config: MaterialConfig, enableOpacity: boolean): Material {
        let opacity_v = config.opacity ?? srcMaterial.opacity;
        let opacity_f: boolean = opacity_v < 1.0;
        // 良い感じに元のパラメータを拾いつつ設定
        let material: Material;
        switch (srcMaterial.type) {
            case "MeshStandardMaterial": {
                const param: MeshStandardMaterialParameters = {
                    color: config.color ?? (srcMaterial as MeshStandardMaterial).color,
                    transparent: opacity_f,
                    opacity: opacity_v,
                };
                if (!enableOpacity) {
                    this.deleteOpacityProperty(param);
                }
                material = new MeshStandardMaterial(param);
                break;
            }
            case "MeshBasicMaterial": {
                const param: MeshBasicMaterialParameters = {
                    color: config.color ?? (srcMaterial as MeshBasicMaterial).color,
                    transparent: opacity_f,
                    opacity: opacity_v,
                };
                if (!enableOpacity) {
                    this.deleteOpacityProperty(param);
                }
                material = new MeshBasicMaterial(param);
                break;
            }
            default: {
                console.warn(`想定外のマテリアルの為、MeshBasicMaterial 扱いで対応:${srcMaterial.type}`);
                const param: MeshBasicMaterialParameters = {
                    color: config.color ?? (srcMaterial as MeshBasicMaterial).color,
                    transparent: opacity_f,
                    opacity: opacity_v,
                };
                if (!enableOpacity) {
                    this.deleteOpacityProperty(param);
                }
                material = new MeshBasicMaterial(param);
                break;
            }
        }

        return material;
    }

    protected deleteOpacityProperty(param: MaterialParameters): MaterialParameters {
        delete param.transparent;
        delete param.opacity;
        return param;
    }

    public getMaterialConfig(): MaterialConfig {
        let o = (this._mesh.material as Material).opacity;
        let srcMat: Material;
        if (Array.isArray(this._mesh.material)) {
            srcMat = this._mesh.material[0];
        } else {
            srcMat = this._mesh.material;
        }
        let c = this.getMaterialColor(srcMat);
        let l = new Layers();
        l.set(BLOOM_SCENE);
        let b = l.test(this._mesh.layers);
        return {
            opacity: o,
            color: c,
            isBloom: b,
        };
    }

    protected getMaterialColor(material: Material): Color {
        let color: Color;
        switch (material.type) {
            case "MeshStandardMaterial": {
                color = (material as MeshStandardMaterial).color;
                break;
            }
            case "MeshBasicMaterial": {
                color = (material as MeshBasicMaterial).color;
                break;
            }
            default:
                color = new Color();
                console.warn(`想定外のマテリアルの為、MeshBasicMaterial 扱いで対応:${Color}`);
                break;
        }
        return color;
    }

    public isMultipleMaterial(): boolean {
        return Array.isArray(this._mesh.material);
    }

    protected disposeMaterial(): void {
        if (Array.isArray(this._mesh.material)) {
            this._mesh.material.forEach((material) => {
                material.dispose();
            });
        } else {
            this._mesh.material.dispose();
        }
    }
}

// テキスト用 Sentence の実装
export interface TextSentenceParam {
    baseParam: BaseSentenceParam;
    text: string;
    color?: ColorRepresentation;
    outlineColor?: ColorRepresentation;
    standardMaterialParam?: MeshStandardMaterialParameters;
}

export class TextSentence extends BaseSentence {
    private _text: string;

    public constructor() {
        super();
    }

    public initialize(inFont: Font, inScene: Scene, inId: number, inParam: TextSentenceParam) {
        this._text = inParam.text;
        const textGeometry = new TextGeometry(inParam.text, {
            font: inFont,
            size: 10,
            height: 3,
        });
        // 中心座標を中央に変更
        textGeometry.computeBoundingBox();
        let boundingSize = new Vector3();
        textGeometry.boundingBox.getSize(boundingSize);
        textGeometry.translate(-boundingSize.x / 2, 0, 0);

        let mt: Material;
        if (inParam.standardMaterialParam) {
            mt = new MeshStandardMaterial(inParam.standardMaterialParam);
        } else {
            mt = new MeshBasicMaterial({
                color: inParam.color ?? 0xffffff,
            });
        }

        let material: Material | Material[];
        if (inParam.outlineColor) {
            const outlineMt = new MeshBasicMaterial({
                color: inParam.outlineColor ?? 0xffffff,
            });
            material = [mt, outlineMt];
        } else {
            material = mt;
        }

        const mesh = new Mesh(textGeometry, material);
        mesh.position.copy(inParam.baseParam.position);
        inScene.add(mesh);
        this._mesh = mesh;
        this.setBloom(inParam.baseParam.isBloom);
        this._id = inId;
    }

    public get text(): string {
        return this._text;
    }
}

// パーティクル Sentence の実装
export interface SphereSentenceParam {
    baseParam: BaseSentenceParam;
    color: ColorRepresentation;
}

export class SphereSentence extends BaseSentence {
    public constructor() {
        super();
    }

    public initialize(inScene: Scene, inId: number, inParam: SphereSentenceParam) {
        const geometry = new SphereGeometry(1, 8, 8);
        const mt = new MeshBasicMaterial({
            color: inParam.color,
        });

        const mesh = new Mesh(geometry, mt);
        mesh.position.copy(inParam.baseParam.position);
        inScene.add(mesh);
        this._mesh = mesh;
        this.setBloom(inParam.baseParam.isBloom);
        this._id = inId;
    }
}

export interface CylinderSentenceParam {
    baseParam: BaseSentenceParam;
    color: ColorRepresentation;
}

export class CylinderSentence extends BaseSentence {
    public constructor() {
        super();
    }

    public initialize(inScene: Scene, inId: number, inParam: CylinderSentenceParam) {
        const geometry = new CylinderGeometry(0.5, 0.5, 6, 20);
        const mt = new MeshBasicMaterial({
            color: inParam.color,
        });

        const mesh = new Mesh(geometry, mt);
        mesh.position.copy(inParam.baseParam.position);
        inScene.add(mesh);
        this._mesh = mesh;
        this.setBloom(inParam.baseParam.isBloom);
        this._id = inId;
    }
}

export class SentenceManager {
    private _currentId: number;
    private _scene: Scene;
    private _sentenceList: Array<BaseSentence>;
    private static readonly FontPath: string = "fonts/M_PLUS_1_Code_Regular_yu_rounded.json";
    private _font: Font;
    private _isLoaded: boolean;
    public constructor() {
        this._scene = null;
        this._sentenceList = null;
        this._currentId = 0;
        this._isLoaded = false;
    }
    public initialize(inScene: Scene): void {
        this._scene = inScene;
        const fontLoader = new FontLoader();
        fontLoader.load(SentenceManager.FontPath, (font) => {
            this._font = font;
            this._isLoaded = true;
        });
        this._sentenceList = new Array<BaseSentence>();
    }
    public addTextSentence(param: TextSentenceParam): TextSentence {
        // 管理IDを発番しておく
        const retId: number = this._currentId;
        this._currentId += 1;
        let s = new TextSentence();
        s.initialize(this._font, this._scene, retId, param);
        this._sentenceList.push(s);
        return s;
    }
    public addParticleSentence(param: SphereSentenceParam): SphereSentence {
        // 管理IDを発番しておく
        const retId: number = this._currentId;
        this._currentId += 1;
        let s = new SphereSentence();
        s.initialize(this._scene, retId, param);
        this._sentenceList.push(s);
        return s;
    }
    public addPenlightSentence(param: CylinderSentenceParam): CylinderSentence {
        // 管理IDを発番しておく
        const retId: number = this._currentId;
        this._currentId += 1;
        let s = new CylinderSentence();
        s.initialize(this._scene, retId, param);
        this._sentenceList.push(s);
        return s;
    }
    public removeSentence(inTarget: number): void {
        let o: BaseSentence = this._sentenceList[inTarget];

        if (o) {
            // 強制的に変換するが…
            let mesh = o.getMesh();
            this._scene.remove(mesh);
            o.destract();

            this._sentenceList[inTarget] = null;
        }
    }

    public getSentence(targetId: number): BaseSentence {
        return this._sentenceList[targetId];
    }

    public isLoaded(): boolean {
        return this._isLoaded;
    }
}

