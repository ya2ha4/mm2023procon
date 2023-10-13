import { ColorRepresentation, MathUtils } from "three";
import { Vector3 } from "three/src/math/Vector3";

import { DefPosition } from "../../ConstantDefine";
import { MaterialConfig, TextSentence } from "../../SentenceManager";
import { idolAnimation, materialSet, moveAnimation, ObjectAnimation, ObjectAnimationParam, visibleSet } from "../animation/AnimationFunction";
import { easelinear, easeOutExpo } from "../animation/EasingFunction";
import { BaseLyricObject, LyricObjectCreateParam } from "./BaseLyricObject";
import { LyricObjectUtils } from "./LyricObjectUtils";

interface IMM2014PhraseParam {
    text: string;
    startTime: number;
    endTime: number;
    color: ColorRepresentation;
}

class MM2014PhraseParam implements IMM2014PhraseParam {
    text: string;
    startTime: number;
    endTime: number;
    color: ColorRepresentation;

    constructor(param: IMM2014PhraseParam) {
        this.text = param.text;
        this.startTime = param.startTime;
        this.endTime = param.endTime;
        this.color = param.color;
    }
}

/**
 *  歌詞オブジェクト：ネクストネスト (Magical Mirai 10th edit) MV風
 */
export default class MM2014LyricObject extends BaseLyricObject {
    protected _lyricObjects: Array<TextSentence>;

    // 歌詞表示から移動までの時間[ms]
    protected static readonly MOVE_DELAY = 200;

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

        const borderColor = 0xc0c0c0;
        let c = param.phrase.firstChar;
        while (c && !(param.phrase.lastChar.startTime < c.startTime)) {
            const char = this._sentenceManager.addTextSentence({
                baseParam: {
                    position: this._posRoot,
                    isBloom: true,
                },
                text: c.text,
                color: 0x000000,
                outlineColor: borderColor,
            });
            char.getMesh().visible = false;

            {
                // 定位置で待機させる
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
                // 歌詞の出現
                const materialConfig: MaterialConfig[] = [{ opacity: 1.0 }, { opacity: 1.0 }];
                let animation = new ObjectAnimationParam({
                    start: {
                        time: c.startTime,
                        material: materialConfig,
                    },
                    end: {
                        time: c.endTime,
                    },
                    ease: easelinear,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(visibleSet, animation));
            }

            {
                // 色の変更
                const materialConfig: MaterialConfig[] = [{ color: borderColor }, { color: borderColor }];
                let animation = new ObjectAnimationParam({
                    start: {
                        time: c.startTime + MM2014LyricObject.MOVE_DELAY,
                        material: materialConfig,
                    },
                    end: {
                        time: c.endTime,
                    },
                    ease: easelinear,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(materialSet, animation));
            }

            this._lyricObjects.push(char);
            c = c.next;
        }

        // 横並びさせる
        LyricObjectUtils.lineUpHorizontally(this._lyricObjects, this._posRoot, 1);
        for (let i = 0; i < this._lyricObjects.length; i++) {
            // 1文字ずつ上下にずらす
            const pos = this._lyricObjects[i].getPosition();
            const setPos = new Vector3(pos.x, i % 2 ? DefPosition.Lyric.DEFAULT_2LINE_POS[1].y : DefPosition.Lyric.DEFAULT_2LINE_POS[0].y, pos.z);
            this._lyricObjects[i].setPosition(setPos);
        }

        // 各文字の初期位置が確定したので、1列にそろわせるアニメーションを設定
        c = param.phrase.firstChar;
        this._lyricObjects.forEach((char) => {
            const endPos = new Vector3();
            endPos.copy(this._posRoot);
            endPos.x = char.getPosition().x;
            let animation = new ObjectAnimationParam({
                start: {
                    time: c.startTime + MM2014LyricObject.MOVE_DELAY,
                    position: char.getPosition(),
                },
                end: {
                    time: MathUtils.clamp(c.startTime + MM2014LyricObject.MOVE_DELAY + 250, c.startTime + MM2014LyricObject.MOVE_DELAY + 10, c.next.startTime),
                    position: endPos,
                },
                ease: easeOutExpo,
                sentence: char,
            });
            this._animationList.push(new ObjectAnimation(moveAnimation, animation));
            c = c.next;
        });
    }
}
