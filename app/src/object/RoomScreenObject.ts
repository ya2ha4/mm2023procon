import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";
import { Texture } from "three/src/textures/Texture";
import { MeshBasicMaterial, PlaneGeometry, Vector3 } from "three/src/Three";
import { VideoTexture } from "three/src/Three";

import { DefPosition } from "../ConstantDefine";

export interface RoomScreenObjectCreateParam {
    videoPath: string;
    position: Vector3;
    scene: Scene;
}

export default class RoomScreenObject {
    private _screenMesh: Mesh;
    private _textureMap: Map<string, Texture>;

    private _videoElement: HTMLVideoElement;
    private _loadedVideo: boolean;
    private _videoTexture: Texture;

    constructor() {
        this._textureMap = new Map<string, Texture>();
        this._videoElement = document.createElement("video");
        this._loadedVideo = false;
    }

    public dispose(): void {
        this._screenMesh.geometry.dispose();
        (this._screenMesh.material as MeshBasicMaterial).dispose();

        this._textureMap.forEach((texture) => {
            texture.dispose();
        });
        this._videoTexture.dispose();
    }

    public restart(): void {
        // pass
    }

    public create(param: RoomScreenObjectCreateParam): void {
        this._videoElement.src = param.videoPath;
        this._videoElement.addEventListener("loadeddata", (event: Event) => {
            this._loadedVideo = true;
        });
        this._videoElement.load();

        this._videoTexture = new VideoTexture(this._videoElement);

        let geo = new PlaneGeometry(DefPosition.Stage.ROOM_WIDTH, DefPosition.Stage.ROOM_HEIGHT, 2, 1);

        // 長方形の右上、右下の座標を移動させ、L字型のPlaneに変形
        [2, 5].forEach((swapIndex: number, _index: number, _array: number[]) => {
            const x = geo.attributes.position.getX(swapIndex);
            const z = geo.attributes.position.getZ(swapIndex);
            geo.attributes.position.setX(swapIndex, z);
            geo.attributes.position.setZ(swapIndex, x);
        });
        geo.attributes.position.needsUpdate = true;

        this._screenMesh = new Mesh(geo, new MeshBasicMaterial({ map: this._videoTexture }));
        this._screenMesh.position.copy(param.position);
        this._screenMesh.rotateY(Math.PI / 4);

        param.scene.add(this._screenMesh);
    }

    public isLoaded(): boolean {
        return this._loadedVideo;
    }

    public play(): boolean {
        this._videoElement.play();
        this._videoElement.loop = true;
        return true;
    }
}
