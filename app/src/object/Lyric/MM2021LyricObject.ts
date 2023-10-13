import { ColorRepresentation } from "three";
import { Vector3 } from "three/src/math/Vector3";

import { DefPosition } from "../../ConstantDefine";
import { MaterialConfig, TextSentence } from "../../SentenceManager";
import { idolAnimation, materialSet, ObjectAnimation, ObjectAnimationParam, opacityAnimation, visibleSet } from "../animation/AnimationFunction";
import { easeInQuart } from "../animation/EasingFunction";
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
 *  歌詞オブジェクト：マジカルミライ2021 レイニースノードロップ MV風
 */
export default class MM2021LyricObject extends BaseLyricObject {
    protected _lyricObjects: Array<TextSentence>;
    protected _colorPattern: Array<ColorRepresentation>;

    // 歌詞表示から移動までの時間[ms]
    protected static readonly MOVE_DELAY = 200;

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

    // 1フレーズで1度だけ呼ばれる
    public override create(param: LyricObjectCreateParam): void {
        //console.log(param);
        super.create(param);

        const borderColor = 0xffffff;
        let c = param.phrase.firstChar;
        while (c && !(param.phrase.lastChar.startTime < c.startTime)) {
            const char = this._sentenceManager.addTextSentence({
                baseParam: {
                    position: this._posRoot,
                    isBloom: true,
                },
                text: c.text,
                color: 0xdddddd,
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
                    ease: easeInQuart,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(idolAnimation, animation));
            }

            {
                // 歌詞の出現
                const materialConfig: MaterialConfig[] = [{ opacity: 1 }, { opacity: 0.7 }];
                let animation = new ObjectAnimationParam({
                    start: {
                        time: c.startTime,
                        material: materialConfig,
                    },
                    end: {
                        time: c.endTime,
                    },
                    ease: easeInQuart,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(visibleSet, animation));
            }

            {
                // 色の変更
                const materialConfig: MaterialConfig[] = [{ color: 0xbbbbbb }, { color: 0xbbbbbb }];
                let animation = new ObjectAnimationParam({
                    start: {
                        time: c.startTime + MM2021LyricObject.MOVE_DELAY,
                        material: materialConfig,
                    },
                    end: {
                        time: c.endTime,
                    },
                    ease: easeInQuart,
                    sentence: char,
                });
                this._animationList.push(new ObjectAnimation(materialSet, animation));
            }

            this._lyricObjects.push(char);
            c = c.next;
        }
        // 1行目の横幅確認用
        const margin = 3;
        let firstLineSize = new Vector3();
        let sizeList = [];
        for (let i = 0; i < this._lyricObjects.length; i++) {
            let size = new Vector3();
            this._lyricObjects[i].getMesh().geometry.boundingBox.getSize(size);
            firstLineSize.add(size);
            sizeList.push(size.x);
        }
        // 余白分を追加
        firstLineSize.add(new Vector3(this._lyricObjects.length - 1 * margin, 0, 0));

        // 1文字ずつのセンテンスを1列に並べたい
        for (let i = 0; i < this._lyricObjects.length; i++) {
            let posX;
            if (i == 0) {
                posX = -firstLineSize.x / 2;
            } else {
                // 1つ前のサイズの半分+自分のサイズの半分+余白分ずらす
                const shiftX = sizeList[i - 1] / 2 + sizeList[i] / 2 + margin;
                posX = this._lyricObjects[i - 1].getPosition().x + shiftX;
            }
            // const posX = -firstLineSize.x + i * ((firstLineSize.x / this._lyricObjects.length) * 2);
            const posY = this._posRoot.y + (i - this._lyricObjects.length / 2) * 0.7;
            this._lyricObjects[i].setPosition(new Vector3(posX, posY, this._posRoot.z));
            this._lyricObjects[i].setRotationFromAxisAngle(new Vector3(0, 0, 1), (Math.PI * 5) / 180);
        }
    }
}
