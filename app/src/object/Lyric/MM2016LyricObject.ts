import { DefColor, DefPosition } from "../../ConstantDefine";
import { MaterialConfig, TextSentence } from "../../SentenceManager";
import { idolAnimation, ObjectAnimation, ObjectAnimationParam, visibleSet } from "../animation/AnimationFunction";
import { easelinear } from "../animation/EasingFunction";
import { BaseLyricObject, LyricObjectCreateParam } from "./BaseLyricObject";
import { LyricObjectUtils } from "./LyricObjectUtils";

/**
 *  歌詞オブジェクト：マジカルミライ2016 ３９みゅーじっく！ 表示風
 */
export default class MM2016LyricObject extends BaseLyricObject {
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
                color: DefColor.Room.IMAGE_COLOR[this._id],
                outlineColor: 0xffffff,
            });
            char.setVisible(false);

            {
                // 表示＋定位置で待機させる
                const visibleConfig: MaterialConfig[] = [{ opacity: 1.0 }];
                let animation = new ObjectAnimationParam({
                    start: {
                        time: c.startTime,
                        material: visibleConfig,
                    },
                    end: {
                        time: param.phrase.endTime,
                    },
                    ease: easelinear,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(visibleSet, animation));
            }

            this._lyricObjects.push(char);
            c = c.next;
        }
        LyricObjectUtils.lineUpHorizontally(this._lyricObjects, this._posRoot, 2);
    }
}
