import { IPhrase } from "textalive-app-api";
import { Vector3 } from "three/src/math/Vector3";

import { DefColor, DefPosition } from "../../ConstantDefine";
import { TextSentence } from "../../SentenceManager";
import { idolAnimation, moveAnimation, ObjectAnimation, ObjectAnimationParam, rotationFromAxisAngleAnimation } from "../animation/AnimationFunction";
import { easeInOutExpo, easelinear } from "../animation/EasingFunction";
import { BaseLyricObject, LyricObjectCreateParam } from "./BaseLyricObject";
import { LyricObjectUtils } from "./LyricObjectUtils";

/**
 *  歌詞オブジェクト：横から流れてくる感じのやつ
 */
export default class FlowSidewayLyricObject extends BaseLyricObject {
    private static readonly margin = 2;
    protected _lyricObjects: Array<TextSentence>;

    constructor() {
        super();

        this._lyricObjects = new Array<TextSentence>();
    }

    public override dispose(): void {
        super.dispose();
        this._lyricObjects.forEach((lyricObject) => {
            this._sentenceManager.removeSentence(lyricObject.getId());
        });
    }

    public override create(param: LyricObjectCreateParam): void {
        super.create(param);

        let c = param.phrase.firstChar;
        while (c && !(param.phrase.lastChar.startTime < c.startTime)) {
            // 1文字分のオブジェクト生成
            // 文字オブジェクト生成
            const char = this._sentenceManager.addTextSentence({
                baseParam: {
                    position: this._posRoot,
                    isBloom: true,
                },
                text: c.text,
                color: 0xffffff,
                outlineColor: DefColor.Room.IMAGE_COLOR[this._id],
            });

            {
                // フレーズ歌唱中は表示させる
                let animation = new ObjectAnimationParam({
                    start: {
                        time: param.phrase.startTime,
                    },
                    end: {
                        time: param.phrase.endTime,
                    },
                    ease: easelinear,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(idolAnimation, animation));
            }

            {
                // 文字の歌唱タイミングで回転させる
                let endTime = c.startTime + 1000;
                if (param.phrase.next) {
                    // 次の歌詞が出るまでにはアニメーションを終了させる
                    endTime = Math.min(endTime, param.phrase.next.startTime);
                }
                let animation = new ObjectAnimationParam({
                    start: {
                        time: c.startTime,
                        rotateAxis: new Vector3(0, 1, 0),
                        angle: 0,
                    },
                    end: {
                        time: endTime,
                        angle: 2 * Math.PI,
                    },
                    ease: easeInOutExpo,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(rotationFromAxisAngleAnimation, animation));
            }

            this._lyricObjects.push(char);
            c = c.next;
        }
        LyricObjectUtils.lineUpHorizontally(this._lyricObjects, this._posRoot, FlowSidewayLyricObject.margin);
        this.registryMoveAnimation(this._lyricObjects, param.phrase);
    }

    private registryMoveAnimation(lyricBlock: Array<TextSentence>, phrase: IPhrase): void {
        const lyricSize = LyricObjectUtils.getSizeHorizontally(this._lyricObjects, FlowSidewayLyricObject.margin);
        lyricBlock.forEach((char) => {
            // 画面外から入ってくるアニメーション
            const startAnimationEndTime = phrase.startTime + 250;
            let startAnimation = new ObjectAnimationParam({
                start: {
                    time: phrase.startTime,
                    position: new Vector3(DefPosition.Lyric.RIGHT_POS.x + lyricSize.x / 2, 0, 0).add(char.getPosition()),
                },
                end: {
                    time: startAnimationEndTime,
                    position: new Vector3().copy(char.getPosition()),
                },
                ease: easeInOutExpo,
                sentence: char,
            });
            this._animationList.push(new ObjectAnimation(moveAnimation, startAnimation));

            // 画面外へ出ていくアニメーション
            const endAnimationStartTime = Math.max(phrase.endTime, startAnimationEndTime);
            let endAnimation = new ObjectAnimationParam({
                start: {
                    time: endAnimationStartTime,
                    position: new Vector3().copy(char.getPosition()),
                },
                end: {
                    time: endAnimationStartTime + 500,
                    position: new Vector3(DefPosition.Lyric.LEFT_POS.x - lyricSize.x / 2, 0, 0).add(char.getPosition()),
                },
                ease: easeInOutExpo,
                sentence: char,
            });
            this._animationList.push(new ObjectAnimation(moveAnimation, endAnimation));
        });
    }
}
