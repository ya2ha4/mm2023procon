import { Color, ColorRepresentation, MathUtils } from "three";
import { Object3D } from "three/src/core/Object3D";
import { Vector3 } from "three/src/math/Vector3";

import { MaterialConfig, TextSentence } from "../../SentenceManager";
import { easelinear, EasingFunc } from "./EasingFunction";

// アニメーションのキーフレームパラメータ
export interface KeyFrameParam {
    time: number;

    position?: Vector3;
    rotateAxis?: Vector3;
    angle?: number;
    scale?: Vector3;
    material?: MaterialConfig[];
}

// アニメーションパラメータ
export interface IObjectAnimationParam {
    start: KeyFrameParam;
    end: KeyFrameParam;
    ease?: EasingFunc;

    object?: Object3D;
    sentence?: TextSentence;
}

export class ObjectAnimationParam {
    // アニメーション
    private _start: KeyFrameParam;
    private _end: KeyFrameParam;
    private _ease: EasingFunc;

    // アニメーション対象
    private _object: Object3D;
    private _sentence: TextSentence;

    constructor(param: IObjectAnimationParam) {
        this._start = param.start;
        this._end = param.end;
        this._ease = param.ease ? param.ease : easelinear;

        if (!param.object && !param.sentence) {
            console.warn(`アニメーション対象が設定されていません`);
        }
        this._object = param.object;
        this._sentence = param.sentence;
    }

    public get start(): KeyFrameParam {
        return this._start;
    }

    public get end(): KeyFrameParam {
        return this._end;
    }

    public get ease(): EasingFunc {
        return this._ease;
    }

    public get object(): Object3D {
        return this._object;
    }

    public get sentence(): TextSentence {
        return this._sentence;
    }
}

// アニメーション処理関数に渡すパラメータ
export interface AnimationFuncArgument {
    timePosition: number;
    animationParam: ObjectAnimationParam;
    delta: number;
}

export class ObjectAnimation {
    func: (arg: AnimationFuncArgument) => void;
    param: ObjectAnimationParam;
    isPlay: boolean;

    constructor(func: (arg: AnimationFuncArgument) => void, param: ObjectAnimationParam) {
        this.func = func;
        this.param = param;
        this.isPlay = false;
    }
}

function lerpVector(x: Vector3, y: Vector3, t: number): Vector3 {
    return new Vector3(MathUtils.lerp(x.x, y.x, t), MathUtils.lerp(x.y, y.y, t), MathUtils.lerp(x.z, y.z, t));
}

/**
 * アニメーション処理関数
 */
type AnimationFunc = (arg: AnimationFuncArgument) => void;

/**
 * アニメーション処理：平行移動
 */
export function moveAnimation(arg: AnimationFuncArgument): void {
    if (!arg.animationParam.start.position.isVector3 || !arg.animationParam.end.position.isVector3) {
        console.warn(`[moveAnimation] パラメータの設定が不正です\n  position:${arg.timePosition}\n  ${arg}`);
        return;
    }

    let timeT = MathUtils.inverseLerp(arg.animationParam.start.time, arg.animationParam.end.time, arg.timePosition);
    timeT = arg.animationParam.ease(timeT);

    const pos = lerpVector(arg.animationParam.start.position, arg.animationParam.end.position, timeT);
    if (arg.animationParam.object) {
        arg.animationParam.object.position.copy(pos);
    }
    if (arg.animationParam.sentence) {
        arg.animationParam.sentence.setPosition(pos);
    }
}

/**
 * アニメーション処理：スケール変更
 */
export function scaleAnimation(arg: AnimationFuncArgument): void {
    if (!arg.animationParam.start.scale.isVector3 || !arg.animationParam.end.scale.isVector3) {
        console.warn(`[scaleAnimation] パラメータの設定が不正です\n  position:${arg.timePosition}\n  ${arg}`);
        return;
    }

    let timeT = MathUtils.inverseLerp(arg.animationParam.start.time, arg.animationParam.end.time, arg.timePosition);
    timeT = arg.animationParam.ease(timeT);

    const scale = lerpVector(arg.animationParam.start.scale, arg.animationParam.end.scale, timeT);
    if (arg.animationParam.object) {
        arg.animationParam.object.scale.copy(scale);
    }
    if (arg.animationParam.sentence) {
        arg.animationParam.sentence.setScale(scale);
    }
}

/**
 * アニメーション処理：軸回転
 */
export function rotationFromAxisAngleAnimation(arg: AnimationFuncArgument): void {
    if (!arg.animationParam.start.rotateAxis.isVector3 || Number.isNaN(arg.animationParam.start.angle) || Number.isNaN(arg.animationParam.end.angle)) {
        console.warn(`[rotationFromAxisAngleAnimation] パラメータの設定が不正です\n  position:${arg.timePosition}\n  ${arg}`);
        return;
    }

    let timeT = MathUtils.inverseLerp(arg.animationParam.start.time, arg.animationParam.end.time, arg.timePosition);
    timeT = arg.animationParam.ease(timeT);

    const angle = MathUtils.lerp(arg.animationParam.start.angle, arg.animationParam.end.angle, timeT);
    if (arg.animationParam.object) {
        arg.animationParam.object.setRotationFromAxisAngle(arg.animationParam.start.rotateAxis, angle);
    }
    if (arg.animationParam.sentence) {
        arg.animationParam.sentence.setRotationFromAxisAngle(arg.animationParam.start.rotateAxis, angle);
    }
}

/**
 * アニメーション処理：マテリアル設定（色）
 */
export function colorAnimation(arg: AnimationFuncArgument): void {
    if (!arg.animationParam.start.material || !arg.animationParam.end.material) {
        console.warn(`[colorAnimation] パラメータの設定が不正です\n  position:${arg.timePosition}\n  ${arg}`);
        return;
    }

    let timeT = MathUtils.inverseLerp(arg.animationParam.start.time, arg.animationParam.end.time, arg.timePosition);
    timeT = arg.animationParam.ease(timeT);

    let materialConfigs = new Array<MaterialConfig>();
    const materialCount = arg.animationParam.start.material.length;
    for (let i = 0; i < materialCount; i++) {
        const color = new Color(arg.animationParam.start.material[i].color).lerp(new Color(arg.animationParam.end.material[i].color), timeT);
        materialConfigs.push({
            color: color,
        });
    }

    if (arg.animationParam.sentence) {
        arg.animationParam.sentence.setMaterial(materialConfigs);
    }
}

/**
 * アニメーション処理：マテリアル設定（透明度）
 */
export function opacityAnimation(arg: AnimationFuncArgument): void {
    if (!arg.animationParam.start.material || !arg.animationParam.end.material) {
        console.warn(`[opacityAnimation] パラメータの設定が不正です\n  position:${arg.timePosition}\n  ${arg}`);
        return;
    }

    let timeT = MathUtils.inverseLerp(arg.animationParam.start.time, arg.animationParam.end.time, arg.timePosition);
    timeT = arg.animationParam.ease(timeT);

    let materialConfigs = new Array<MaterialConfig>();
    const materialCount = arg.animationParam.start.material.length;
    for (let i = 0; i < materialCount; i++) {
        materialConfigs.push({
            opacity: MathUtils.lerp(arg.animationParam.start.material[i].opacity, arg.animationParam.end.material[i].opacity, timeT),
        });
    }

    if (arg.animationParam.sentence) {
        arg.animationParam.sentence.setMaterial(materialConfigs);
    }
}

/**
 * アニメーション処理：待機
 */
export function idolAnimation(arg: AnimationFuncArgument): void {}

/**
 * 即時処理：マテリアル設定
 */
export function materialSet(arg: AnimationFuncArgument): void {
    if (!arg.animationParam.start.material) {
        console.warn(`[materialSet] パラメータの設定が不正です\n  position:${arg.timePosition}\n  ${arg}`);
        return;
    }

    if (arg.animationParam.sentence) {
        arg.animationParam.sentence.setMaterial(arg.animationParam.start.material);
    }
}

/**
 * 即時処理：オブジェクトのvisible設定
 */
export function visibleSet(arg: AnimationFuncArgument): void {
    if (!arg.animationParam.start.material) {
        console.warn(`[visibleSet] パラメータの設定が不正です\n  position:${arg.timePosition}\n  ${arg}`);
        return;
    }

    if (arg.animationParam.sentence) {
        arg.animationParam.sentence.getMesh().visible = !(arg.animationParam.start.material[0].opacity < 0.5);
    }
}
