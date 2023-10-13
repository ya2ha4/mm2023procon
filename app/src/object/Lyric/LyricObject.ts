import { Vector3 } from "three/src/math/Vector3";

import { DefColor, DefPhraseIndex, DefPosition } from "../../ConstantDefine";
import { BaseSentenceParam, TextSentence, TextSentenceParam, MaterialConfig } from "../../SentenceManager";
import {
    idolAnimation,
    moveAnimation,
    ObjectAnimation,
    ObjectAnimationParam,
    rotationFromAxisAngleAnimation,
    scaleAnimation,
} from "../animation/AnimationFunction";
import { easeInExpo, easeInOutExpo, easelinear, easeOutExpo, EasingFunc } from "../animation/EasingFunction";
import { BaseLyricObject, LyricObjectCreateParam } from "./BaseLyricObject";
import { visibleSet } from "../animation/AnimationFunction";

/**
 *  歌詞オブジェクト
 */
export default class LyricObject extends BaseLyricObject {
    protected _lyricObject: TextSentence;

    constructor() {
        super();
    }

    public override dispose(): void {
        super.dispose();
        this._sentenceManager.removeSentence(this._lyricObject.getId());
    }

    public override create(param: LyricObjectCreateParam): void {
        super.create(param);

        const isNeedAdjustmentLastChorus = this.isNeedAdjustmentLastChorus(param);
        let text = param.phrase.text;
        if (isNeedAdjustmentLastChorus) {
            // ラスサビの歌詞をMVと同様「叫んだ世界が大好きだ」に変更
            text = param.phrase.text.replace("あなた", "世界");
        }

        // 文字オブジェクト生成
        this._lyricObject = this._sentenceManager.addTextSentence({
            baseParam: {
                position: this._posRoot,
                isBloom: true,
            },
            text: text,
            outlineColor: DefColor.Room.IMAGE_COLOR[this._id],
        });

        // todo: ラスサビを別の歌詞オブジェクトで対応するなら各種歌詞オブジェクトにも対応を入れる
        this._lyricObject.setVisible(false);
        const startTime = isNeedAdjustmentLastChorus ? param.player.findLastChorusSegment().startTime : param.phrase.startTime;

        // 定位置で待機させる
        const visibleConfig: MaterialConfig[] = [{ opacity: 1.0 }];
        const animation = new ObjectAnimationParam({
            start: {
                time: startTime,
                material: visibleConfig,
            },
            end: {
                time: param.phrase.endTime,
            },
            ease: easelinear,
            sentence: this._lyricObject,
        });
        this._animationList.push(new ObjectAnimation(visibleSet, animation));
    }

    // ラスサビの開始タイミング調整が必要か
    // ラスサビの Phrase.startTime と IRepetitiveSegment.startTime のタイミングにズレが大きい
    // IRepetitiveSegment.startTime の方がいい感じなのでそれまでは表示しない
    protected isNeedAdjustmentLastChorus(param: LyricObjectCreateParam): boolean {
        return !(param.player.musicInfo.id != 0 || param.player.findPhraseIndex(param.phrase) != DefPhraseIndex.Index.LAST_CHORUS_INDEX);
    }
}

/**
 *  歌詞オブジェクトの実装サンプル
 */
export class SampleLyricObject extends BaseLyricObject {
    protected _lyricObject: TextSentence;

    constructor() {
        super();
    }

    public override dispose(): void {
        super.dispose();
        this._sentenceManager.removeSentence(this._lyricObject.getId());
    }

    public override create(param: LyricObjectCreateParam): void {
        // 輪郭線つき歌詞の生成およびsetMaterialの動作チェック
        this.createOulineText(param);
        return;

        super.create(param);

        // 文字オブジェクト生成
        this._lyricObject = this._sentenceManager.addTextSentence({
            baseParam: {
                position: new Vector3(),
                isBloom: false,
            },
            text: param.phrase.text,
        });

        // アニメーション用パラメータ生成
        const animationNum = 3;
        const easeFunc: Array<EasingFunc> = [easeInExpo, easeInOutExpo, easeOutExpo];
        console.log(`phrase: ${param.phrase}`);
        const animationTime = (param.phrase.endTime - param.phrase.startTime) / animationNum;
        for (let i = 0; i < animationNum; i++) {
            // とりあえずジグザクに移動するよう時間と座標を設定
            let animation = new ObjectAnimationParam({
                start: {
                    time: param.phrase.startTime + i * animationTime,
                    position: new Vector3(75 + i * -50, 50 + 10 * (i % 2 ? -1 : 1), 5),
                },
                end: {
                    time: param.phrase.startTime + (i + 1) * animationTime,
                    position: new Vector3(75 + (i + 1) * -50, 50 + 10 * ((i + 1) % 2 ? -1 : 1), 5),
                },
                ease: easeFunc[i],
                sentence: this._lyricObject,
            });
            this._animationList.push(new ObjectAnimation(moveAnimation, animation));

            if (i % 2) {
                // 偶数回目のアニメーションではスケールも変更または回転するよう設定
                if (Math.random() < 0.5) {
                    let animation = new ObjectAnimationParam({
                        start: {
                            time: param.phrase.startTime + i * animationTime,
                            scale: new Vector3(1, i, 1),
                        },
                        end: {
                            time: param.phrase.startTime + (i + 1) * animationTime,
                            scale: new Vector3(1, i + 2, 1),
                        },
                        ease: easeInOutExpo,
                        sentence: this._lyricObject,
                    });
                    this._animationList.push(new ObjectAnimation(scaleAnimation, animation));
                } else {
                    let animation = new ObjectAnimationParam({
                        start: {
                            time: param.phrase.startTime + i * animationTime,
                            rotateAxis: new Vector3(0, 1, 0),
                            angle: 0,
                        },
                        end: {
                            time: param.phrase.startTime + (i + 1) * animationTime,
                            angle: 2 * Math.PI,
                        },
                        ease: easelinear,
                        sentence: this._lyricObject,
                    });
                    this._animationList.push(new ObjectAnimation(rotationFromAxisAngleAnimation, animation));
                }
            }
        }
    }

    private createOulineText(param: LyricObjectCreateParam): void {
        super.create(param);

        // 文字オブジェクト生成
        this._lyricObject = this._sentenceManager.addTextSentence({
            baseParam: {
                position: this._posRoot,
                isBloom: true,
            },
            text: param.phrase.text,
            outlineColor: DefColor.Room.IMAGE_COLOR[this._id],
        });

        if (Math.random() < 0.5) {
            this._lyricObject.setMaterial([
                { color: 0xffffff, isBloom: false },
                { color: 0xffff00, isBloom: false },
            ]);
        }

        // 定位置で待機させる
        let animation = new ObjectAnimationParam({
            start: {
                time: param.phrase.startTime,
            },
            end: {
                time: param.phrase.endTime,
            },
            ease: easelinear,
            sentence: this._lyricObject,
        });
        this._animationList.push(new ObjectAnimation(idolAnimation, animation));
    }
}
