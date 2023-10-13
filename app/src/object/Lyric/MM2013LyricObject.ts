import { IPhrase } from "textalive-app-api";
import { ColorRepresentation } from "three";
import { Vector3 } from "three/src/math/Vector3";

import { DefPosition } from "../../ConstantDefine";
import { TextSentence } from "../../SentenceManager";
import { idolAnimation, ObjectAnimation, ObjectAnimationParam, opacityAnimation, moveAnimation } from "../animation/AnimationFunction";
import { easelinear } from "../animation/EasingFunction";
import { BaseLyricObject, LyricObjectCreateParam } from "./BaseLyricObject";

interface IMM2013PhraseParam {
    text: string;
    startTime: number;
    endTime: number;
    color: ColorRepresentation;
}

class MM2013PhraseParam implements IMM2013PhraseParam {
    text: string;
    startTime: number;
    endTime: number;
    color: ColorRepresentation;

    constructor(param: IMM2013PhraseParam) {
        this.text = param.text;
        this.startTime = param.startTime;
        this.endTime = param.endTime;
        this.color = param.color;
    }
}

/**
 *  歌詞オブジェクト：マジカルミライ2013 タイトルロゴカラー調
 */
export default class MM2013LyricObject extends BaseLyricObject {
    protected _lyricObjects: Array<TextSentence>;
    protected _colorPattern: Array<ColorRepresentation>;

    constructor() {
        super();

        this._lyricObjects = new Array<TextSentence>();
        this._colorPattern = [0xeb4c6a, 0xea8f1e, 0x189094];
    }

    public override dispose(): void {
        super.dispose();
        this._lyricObjects.forEach((lyricObject) => {
            this._sentenceManager.removeSentence(lyricObject.getId());
        });
    }

    public override create(param: LyricObjectCreateParam): void {
        super.create(param);

        const phraseParams = this.makePhraseParam(param.phrase);
        phraseParams.forEach((phraseParam) => {
            // 文字オブジェクト生成
            const lyric = this._sentenceManager.addTextSentence({
                baseParam: {
                    position: this._posRoot,
                    isBloom: false,
                },
                text: phraseParam.text,
                color: phraseParam.color,
            });
            lyric.setMaterial([{ opacity: 0.0 }]);

            {
                // 定位置で待機させる
                let animation = new ObjectAnimationParam({
                    start: {
                        time: phraseParam.startTime,
                    },
                    end: {
                        time: phraseParam.endTime,
                    },
                    ease: easelinear,
                    sentence: lyric,
                });
                this._animationList.push(new ObjectAnimation(idolAnimation, animation));
            }

            this._lyricObjects.push(lyric);
        });

        // 1行目の横幅確認用
        let firstLineSize = new Vector3();
        for (let i = 0; i < this._lyricObjects.length; i++) {
            if (this.isUpPosition(i)) {
                let size = new Vector3();
                this._lyricObjects[i].getMesh().geometry.boundingBox.getSize(size);
                firstLineSize.add(size);
            }
        }

        for (let i = 0; i < this._lyricObjects.length; i++) {
            const defaultPos = this.isUpPosition(i) ? DefPosition.Lyric.DEFAULT_2LINE_POS[0] : DefPosition.Lyric.DEFAULT_2LINE_POS[1];

            // 1行目の2オブジェクトを被らないよう移動
            let posX = 0;
            if (this.isLeftPosition(i)) {
                posX = -(firstLineSize.x / 4 + 1);
            }
            if (this.isRightPosition(i)) {
                posX = +(firstLineSize.x / 4 + 1);
            }
            this._lyricObjects[i].setPosition(new Vector3(posX, defaultPos.y, defaultPos.z));

            {
                // 透過度あげて表示＋前方へ出す
                const phraseParam = phraseParams[i];
                const lyric = this._lyricObjects[i];
                const afterPos = new Vector3(0, -10, 40).add(lyric.getPosition());
                let animation = new ObjectAnimationParam({
                    start: {
                        time: phraseParam.startTime,
                        material: [{ opacity: 0.25 }],
                        position: lyric.getPosition(),
                    },
                    end: {
                        time: phraseParam.endTime,
                        material: [{ opacity: 1.0 }],
                        position: afterPos,
                    },
                    ease: easelinear,
                    sentence: lyric,
                });
                this._animationList.push(new ObjectAnimation(opacityAnimation, animation));
                this._animationList.push(new ObjectAnimation(moveAnimation, animation));
            }
        }
    }

    private makePhraseParam(phrase: IPhrase): MM2013PhraseParam[] {
        let ret = new Array<MM2013PhraseParam>();

        // ひとまず このミライ/あのミライ/も全て で分割されるよう IWord 3等分
        const splitSize = Math.floor(phrase.wordCount / 3);
        let wordSplitLength = [splitSize, splitSize, splitSize];
        // 端数をいい感じに分配
        switch (phrase.wordCount % 3) {
            case 2:
                wordSplitLength[0]++;
            case 1:
                wordSplitLength[1]++;
                break;
        }

        let word = phrase.firstWord;
        wordSplitLength.forEach((length) => {
            const startTime = word.startTime;
            let text = "";
            for (let i = 0; i < length; i++) {
                text += word.text;
                word = word.next;
            }

            const phraseParam = new MM2013PhraseParam({
                text: text,
                startTime: startTime,
                endTime: word ? word.previous.endTime : phrase.lastWord.endTime, // 最後のフレーズで処理を実行した場合、wordはnull参照になるのでエラー回避
                color: this._colorPattern[ret.length % this._colorPattern.length],
            });
            ret.push(phraseParam);
        });

        return ret;
    }

    // 上の行で表示するか
    protected isUpPosition(index: number): boolean {
        return index < Math.ceil(this._lyricObjects.length / 2);
    }

    // 左に移動させるか
    protected isLeftPosition(index: number): boolean {
        return index == 0;
    }

    // 右に移動させるか
    protected isRightPosition(index: number): boolean {
        return index == 1;
    }
}
