import { TextureLoader } from "three";
import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";
import { Texture } from "three/src/textures/Texture";
import { MeshBasicMaterial } from "three/src/Three";

import { DefPosition } from "../ConstantDefine";

export interface ScreenObjectCreateParam {
    initTexturePath: string;
    textureMap: Map<string, string>; // key:indexName, value:texturePath

    scene: Scene;
}

export default class ScreenObject {
    private _screenMesh: Mesh;
    private _textureMap: Map<string, Texture>;

    // ロード完了テクスチャ数
    private _loadedTextureCount: number;
    // テクスチャ数
    private _textureCount: number;

    // 表示中のテクスチャキー
    private _dispTextureKey: string;

    constructor() {
        this._textureMap = new Map<string, Texture>();
        this._loadedTextureCount = 0;
        this._textureCount = Number.MAX_VALUE;
        this._dispTextureKey = "";
    }

    public dispose(): void {
        this._screenMesh.geometry.dispose();
        (this._screenMesh.material as MeshBasicMaterial).dispose();

        this._textureMap.forEach((texture) => {
            texture.dispose();
        });
    }

    public restart(): void {
        this.switchTexture("init");
    }

    public create(param: ScreenObjectCreateParam): void {
        const loader = new TextureLoader();
        loader.load(param.initTexturePath, (texture) => {
            this._screenMesh = new Mesh(
                new BoxGeometry(DefPosition.Stage.SCREEN_WIDTH, DefPosition.Stage.SCREEN_HEIGHT, 0.1),
                new MeshBasicMaterial({ map: texture })
            );
            this._screenMesh.position.set(0.0, DefPosition.Stage.SCREEN_HEIGHT, -DefPosition.Stage.FLOOR_DEPTH / 2.0);
            this._screenMesh.position.copy(DefPosition.Stage.SCREEN_POS);
            param.scene.add(this._screenMesh);

            this._textureMap.set("init", texture);
            this._loadedTextureCount++;
            this._dispTextureKey = "init";
        });

        let loadCount = 0;
        param.textureMap.forEach((texturePath, key) => {
            loader.load(texturePath, (texture) => {
                this._textureMap.set(key, texture);
                this._loadedTextureCount++;
            });
            loadCount++;
        });
        this._textureCount = loadCount + 1; // +1 はinitTexturePathのロード分
    }

    public isLoaded(): boolean {
        return this._textureCount <= this._loadedTextureCount;
    }

    public switchTexture(key: string): void {
        if (this._dispTextureKey == key) {
            return;
        }

        if (this._textureMap.has(key)) {
            let material = this._screenMesh.material as MeshBasicMaterial;
            material.map = this._textureMap.get(key);
            material.needsUpdate = true;
            this._dispTextureKey = key;
        } else {
            console.warn(`[switchTexture] key:${key} で登録されたテクスチャは存在していません。`);
        }
    }

    public get dispKey(): string {
        return this._dispTextureKey;
    }
}
