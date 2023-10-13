import { IPhrase, IWord } from "textalive-app-api";
import { Vector3 } from "three/src/math/Vector3";

import { DefPosition } from "../../ConstantDefine";
import { MaterialConfig, TextSentence } from "../../SentenceManager";
import {
    idolAnimation,
    moveAnimation,
    ObjectAnimation,
    ObjectAnimationParam,
    rotationFromAxisAngleAnimation,
    visibleSet,
} from "../animation/AnimationFunction";
import { easelinear, easeOutExpo } from "../animation/EasingFunction";
import { BaseLyricObject, LyricObjectCreateParam } from "./BaseLyricObject";
import { LyricObjectUtils } from "./LyricObjectUtils";

interface IMM2015PhraseParam {
    text: string;
    startTime: number;
    endTime: number;
}

class MM2015PhraseParam implements IMM2015PhraseParam {
    text: string;
    startTime: number;
    endTime: number;

    constructor(param: IMM2015PhraseParam) {
        this.text = param.text;
        this.startTime = param.startTime;
        this.endTime = param.endTime;
    }
}

/**
 *  歌詞オブジェクト：マジカルミライ2015 Hand in Hand 表示風
 */
export default class MM2015LyricObject extends BaseLyricObject {
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

        const phraseParams = this.makePhraseParam(param.phrase);
        // 3ブロック分オブジェクト生成
        phraseParams.forEach((phraseParam) => {
            const lyricBlock = new Array<TextSentence>();
            // 1文字分のオブジェクト生成
            for (let i = 0; i < phraseParam.text.length; i++) {
                // 文字オブジェクト生成
                const char = this._sentenceManager.addTextSentence({
                    baseParam: {
                        position: this._posRoot,
                        isBloom: true,
                    },
                    text: phraseParam.text.charAt(i),
                    standardMaterialParam: { color: 0x9650dc, roughness: 0.3, metalness: 0.5 },
                });
                char.setVisible(false);

                {
                    // 表示＋定位置で待機させる
                    const visibleConfig: MaterialConfig[] = [{ opacity: 1.0 }];
                    let animation = new ObjectAnimationParam({
                        start: {
                            time: phraseParam.startTime,
                            material: visibleConfig,
                        },
                        end: {
                            time: phraseParam.endTime,
                        },
                        ease: easelinear,
                        sentence: char,
                    });
                    this._animationList.push(new ObjectAnimation(visibleSet, animation));

                    // 表示を消す
                    const invisibleConfig: MaterialConfig[] = [{ opacity: 0.0 }];
                    let invisibleAnimation = new ObjectAnimationParam({
                        start: {
                            time: phraseParam.endTime,
                            material: invisibleConfig,
                        },
                        end: {
                            time: phraseParam.endTime + 1000,
                        },
                        ease: easelinear,
                        sentence: char,
                    });
                    this._animationList.push(new ObjectAnimation(visibleSet, invisibleAnimation));
                }

                this._lyricObjects.push(char);
                lyricBlock.push(char);
            }
            this.registryMoveAnimation(lyricBlock, phraseParam);
        });
    }

    private registryMoveAnimation(lyricBlock: Array<TextSentence>, blockParam: MM2015PhraseParam): void {
        // 1文字ずつ横並びさせる
        LyricObjectUtils.lineUpHorizontally(lyricBlock, this._posRoot, 2);

        // 広がる感じのアニメーション
        const len = lyricBlock.length;
        const zAxis = (len % 2 == 1 ? len + 1 : len) % 4 == 0 ? [0.1, -0.1] : [-0.1, 0.1]; // 1文字ずつジグザクに傾ける
        let i = 0;
        lyricBlock.forEach((char) => {
            let animation = new ObjectAnimationParam({
                start: {
                    time: blockParam.startTime,
                    position: this._posRoot,
                    angle: 0,
                    rotateAxis: new Vector3(0, (Math.random() - 0.5) * 0.1, i % 2 ? zAxis[0] : zAxis[1]),
                },
                end: {
                    time: blockParam.endTime,
                    position: new Vector3().copy(char.getPosition()).add(new Vector3(0, -10, 40)),
                    angle: ((1 - 0.5) * 2 * Math.PI) / 4, // [-Math.PI / 4, Math.PI / 4]
                },
                ease: easeOutExpo,
                sentence: char,
            });
            this._animationList.push(new ObjectAnimation(moveAnimation, animation));
            this._animationList.push(new ObjectAnimation(rotationFromAxisAngleAnimation, animation));
            i++;
        });
    }

    private makePhraseParam(phrase: IPhrase): MM2015PhraseParam[] {
        let ret = new Array<MM2015PhraseParam>();

        let word = phrase.firstWord;
        let startWord = word;
        let text = "";
        while (word) {
            text += word.text;
            if (this.isSplit(word, phrase)) {
                // 1wordの場合はその単語を使用。最後のフレーズで処理を実行した場合、wordはnull参照になるのでエラー回避。
                const endWord = word ? (word == startWord ? word : word.previous) : phrase.lastWord;
                const phraseParam = new MM2015PhraseParam({
                    text: text,
                    startTime: startWord.startTime,
                    endTime: endWord.endTime,
                });
                ret.push(phraseParam);

                if (!word || word == phrase.lastWord || startWord == phrase.lastWord) {
                    break;
                }
                startWord = word == startWord ? word.next : word;
                text = "";
            }
            word = word.next;
        }

        return ret;
    }

    private isSplit(word: IWord, phrase: IPhrase): boolean {
        if (!word || word == phrase.lastWord) {
            return true;
        }

        if (word.next) {
            if (!this.isHead(word) && this.isHead(word.next)) {
                return true;
            }
            if (this.isEnd(word) && !this.isEnd(word.next)) {
                return true;
            }
        } else {
            if (this.isEnd(word)) {
                return true;
            }
        }

        return false;
    }

    // 文頭になる可能性がある単語
    private isHead(word: IWord): boolean {
        const Noun = ["N", "PN", "R", "J", "D", "I", "U", "F"];
        if (Noun.find((pos) => pos == word.pos)) {
            return true;
        }
        return false;
    }

    private isEnd(word: IWord): boolean {
        const Noun = ["W"];
        if (Noun.find((pos) => pos == word.pos)) {
            return true;
        }
        return false;
    }
}
