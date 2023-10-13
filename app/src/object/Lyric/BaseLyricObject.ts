import { IPhrase } from "textalive-app-api";
import { MathUtils, Vector3 } from "three";

import { SentenceManager } from "../../SentenceManager";
import TextAlivePlayer from "../../textalive/TextAlivePlayer";
import { ObjectAnimation } from "../animation/AnimationFunction";

export interface LyricObjectCreateParam {
    phrase: IPhrase;
    player: TextAlivePlayer;
    sentenceManager: SentenceManager;
    posRoot: Vector3;
    id: number
}

/**
 * 歌詞オブジェクト基底クラス
 */
export class BaseLyricObject {
    protected _animationList: Array<ObjectAnimation>;

    protected _textAlivePlayer: TextAlivePlayer;
    protected _sentenceManager: SentenceManager;
    protected _posRoot: Vector3;
    protected _id: number;

    public constructor() {
        this._animationList = new Array<ObjectAnimation>();
    }

    public dispose(): void {
        this._animationList.splice(0);
    }

    public create(param: LyricObjectCreateParam): void {
        this._textAlivePlayer = param.player;
        this._sentenceManager = param.sentenceManager;
        this._posRoot = param.posRoot;
        this._id = param.id;
    }

    public update(delta: number): void {
        // 実行対象のアニメーションを抽出
        const currentAnimations = this._animationList.filter((animation) => {
            const pos = this._textAlivePlayer.position;
            // アニメーションの時間内または一度も実行されずアニメーションの時間を過ぎた場合、実行対象とする
            return (animation.param.start.time <= pos && pos < animation.param.end.time) || (animation.param.end.time < pos && !animation.isPlay);
        });

        currentAnimations.forEach((animation) => {
            //console.log(`animation:${animation.func.name}, ease:${animation.param.ease.name}, position:${this._textAlivePlayer.position}`);
            animation.func({
                timePosition: MathUtils.clamp(this._textAlivePlayer.position, animation.param.start.time, animation.param.end.time),
                animationParam: animation.param,
                delta: delta,
            });
            if (animation.param.end.time < this._textAlivePlayer.position) {
                animation.isPlay = true;
            }
        });
    }

    public isFinished(): boolean {
        const lastIndex = this._animationList.length - 1;
        if (-1 < lastIndex) {
            return this._animationList[lastIndex].param.end.time < this._textAlivePlayer.position;
        }
        return true;
    }
}
