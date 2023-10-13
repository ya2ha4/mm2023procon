import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshLambertMaterial } from "three/src/materials/MeshLambertMaterial";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";

import { DefPosition } from "../ConstantDefine";
import { findMusicInfo } from "../textalive/MusicInfo";
import ScreenObject from "./ScreenObject";
import RoomScreenObject, { RoomScreenObjectCreateParam } from "./RoomScreenObject";
import { AnimationAction, Group, Vector3 } from "three/src/Three";
import { AnimationMixer } from 'three';

export interface StateObjectCreateParam {
    scene: Scene;
}

export class StageObject {
    // 床面
    private _floorMesh: Mesh;

    // ステージ
    private _stageModel: Group;
    // アニメーション再生制御
    private _stageAction: AnimationAction;

    // スクリーン
    private _screenObject: ScreenObject;

    private _roomScreenObjects: RoomScreenObject[];

    constructor() {
        this._screenObject = new ScreenObject();
        this._roomScreenObjects = new Array<RoomScreenObject>();
    }

    public dispose(): void {
        this._floorMesh.geometry.dispose();
        (this._floorMesh.material as MeshLambertMaterial).dispose();

        this._screenObject.dispose();

        this._roomScreenObjects.forEach((object: RoomScreenObject) => {
            object.dispose();
        });
    }

    public start(): void {
        if (this._stageAction) {
            this._stageAction.play();
        }
    }

    public restart(): void {
        this._screenObject.restart();
        // this._roomScreenObject.restart();
        if (this._stageAction) {
            this._stageAction.stop();
        }
    }

    public create(param: StateObjectCreateParam): void {
        const loader = new GLTFLoader();
        loader.load(
            "model/stage/procon2023stage.glb",
            (gltf: GLTF) => {
                let model = gltf.scene;
                param.scene.add(model);
                model.scale.set(10,10,10);
                model.position.copy(DefPosition.Stage.STAGE_POS);

                let mixer = new AnimationMixer(model);
                for (let i = 0; i < gltf.animations.length;i++) {
                    let animation = gltf.animations[i];
                    this._stageAction = mixer.clipAction(animation);
                    console.log(animation.name);
                    this._stageAction.play();
                }
            },
            null,
            (error: ErrorEvent) => {
                console.error(error);
            }
        );

        this._floorMesh = new Mesh(
            new BoxGeometry(DefPosition.Stage.FLOOR_WIDTH, 0.1, DefPosition.Stage.FLOOR_DEPTH, 300, 1, 300),
            new MeshLambertMaterial({})
        );
        this._floorMesh.position.set(0.0, 0.0, 0.0);
        //param.scene.add(this._floorMesh);

        const textureMap = new Map<string, string>();
        textureMap.set("ready", "image/ready.png");
        textureMap.set("none", "image/none.png");
        this._screenObject.create({
            initTexturePath: "image/loading.png",
            textureMap: textureMap,
            scene: param.scene,
        });

        for(let i = 0; i < DefPosition.Stage.ROOM_POS.length; i++) {
            let roomScreenObject = new RoomScreenObject();
            roomScreenObject.create({
                videoPath: findMusicInfo(i).movieName,
                position: new Vector3().copy(DefPosition.Stage.STAGE_POS).add(DefPosition.Stage.ROOM_POS[i]),
                scene: param.scene,
            });
            this._roomScreenObjects.push(roomScreenObject);
        }
    }

    public roomScreenPlay(): void {
        this._roomScreenObjects.forEach((object: RoomScreenObject) => {
            object.play();
        });
    }

    public get screen(): ScreenObject {
        return this._screenObject;
    }

    public get roomScreen(): RoomScreenObject {
        return this._roomScreenObjects[0];
    }
}
