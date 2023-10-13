import { AnimationClip, AnimationMixer, Euler, Material, Scene, SkinnedMesh, Vector2, Vector3 } from "three";
import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";
import { Group } from 'three/src/objects/Group';

export interface PlayCharacterCreateParam {
    scene: Scene;
    modelPath: string;
    position: Vector3;
    rotation: Euler;
}

export class PlayCharacter {
    private _mixer: AnimationMixer;
    private _loaded: boolean;
    private _motions: AnimationClip[];
    // 再生中のモーション名
    private _playMotionNames: string[];

    private _model: Group; 

    public constructor() {
        this._mixer = null;
        this._loaded = false;
        this._motions = [];
        this._playMotionNames = [];
    }

    public create(param: PlayCharacterCreateParam): void {
        const loader = new GLTFLoader();
        loader.load(param.modelPath, (gltf: GLTF) => {
            this._model = gltf.scene;
            param.scene.add(this._model);
            this._model.position.copy(param.position);
            this._model.rotation.copy(param.rotation);
            this._model.scale.set(3, 3, 3);

            this._loaded = true;
        },
        null,
        (event: ErrorEvent) => {
            console.error(event);
        });
    }

    public move(vec: Vector3): void {
        if (this._model && this.loaded) {
            this._model.position.add(vec);
            this._model.setRotationFromAxisAngle(new Vector3(0, 1, 0), Math.atan2(-vec.x, -vec.z))
        }
    }

    public update(delta: number): void {
        if (this._loaded) {
            // pass;
        }
    }

    public play(names: string[]): void {
        // 必要なモーションを再生する
    }

    public dispose(): void {
    }

    public isLoaded(): boolean {
        return this._loaded;
    }

    public restart(): void {
        // pass
    }

    public get loaded(): boolean {
        return this._loaded;
    }

    public get position(): Vector3 {
        if (!this._model) {
            return new Vector3();
        }
        return this._model.position;
    }
}
