import { IPhrase } from "textalive-app-api";

import { DefPhraseIndex } from "../../ConstantDefine";
import { SentenceManager } from "../../SentenceManager";
import TextAlivePlayer from "../../textalive/TextAlivePlayer";
import { BaseLyricObject, LyricObjectCreateParam } from "./BaseLyricObject";
import FlowSidewayLyricObject from "./FlowSidewayLyricObject";
import LyricObject from "./LyricObject";
import LyricObjectManager from "./LyricObjectManager";
import MM10thLyricObjects from "./MM10thLyricObject";
import MM2013LyricObject from "./MM2013LyricObject";
import MM2014LyricObject from "./MM2014LyricObject";
import MM2015LyricObject from "./MM2015LyricObject";
import MM2016LyricObject from "./MM2016LyricObject";
import MM2021LyricObject from "./MM2021LyricObject";
import PopoutLyricObject from './PopoutLyricObjects';
import { MathUtils, Vector3 } from 'three';

export interface LyricFactoryCreateParam {
    lyricObjectManager: LyricObjectManager;
    sentenceManager: SentenceManager;
    player: TextAlivePlayer;
    createdChecker: LyricCreatedChecker;
    posRoot: Vector3;
    id: number;
}

// 歌詞オブジェクト生成基底クラス
export class BaseLyricFactory {
    protected _lyricObjectManager: LyricObjectManager;
    protected _sentenceManager: SentenceManager;
    protected _player: TextAlivePlayer;
    protected _posRoot: Vector3;
    protected _isCreateEnable: boolean;
    protected _id: number;

    protected _createdChecker: LyricCreatedChecker;

    constructor() {}

    public create(param: LyricFactoryCreateParam): void {
        this._lyricObjectManager = param.lyricObjectManager;
        this._sentenceManager = param.sentenceManager;
        this._player = param.player;
        this._posRoot = new Vector3().copy(param.posRoot);
        this._isCreateEnable = true;
        this._createdChecker = param.createdChecker;
        this._id = param.id;
    }

    public update(): void {}

    public set isCreateEnable(isEnable: boolean) {
        this._isCreateEnable = isEnable;
    }
}

// 歌詞オブジェクト生成クラス：Loading Memories 固有仕様
export class LoadingMemoriesLyricFactory extends BaseLyricFactory {
    constructor() {
        super();
    }

    public override update(): void {
        const phrase = this._player.findPhrase(this._player.position);
        if (!phrase) {
            return;
        }

        if (!this._createdChecker.isCreated(phrase)) {
            const param: LyricObjectCreateParam = {
                phrase: phrase,
                player: this._player,
                sentenceManager: this._sentenceManager,
                posRoot: this._posRoot,
                id: this._id,
            };
            const phraseIndex = this._player.findPhraseIndex(phrase);
            
            // 出だし、ラスサビ前
            {
                const LyricPhraseIndex = new Array<number>;
                for (let i = 0; i <= DefPhraseIndex.MM2013.START_INDEX - 1; i++) {
                    LyricPhraseIndex.push(i);
                }
                for (let i = DefPhraseIndex.Index.START_SEPIA_FILLTER_INDEX; i <= DefPhraseIndex.Index.END_INDEX; i++) {
                    LyricPhraseIndex.push(i);
                }
                const isCreate =
                    LyricPhraseIndex.findIndex((element) => {
                        return element == phraseIndex;
                    }) > -1;
                if (isCreate) {
                    let lyric = new LyricObject();
                    lyric.create(param);
                    this._lyricObjectManager.addLyricObject(lyric);
                    this._createdChecker.addPhrase(phrase);
                }
            }

            // 各年の演出
            {
                const mm2013LyricPhraseIndex = new Array<number>;
                for (let i = DefPhraseIndex.MM2013.START_INDEX; i <= DefPhraseIndex.MM2013.END_INDEX - 1; i++) {
                    mm2013LyricPhraseIndex.push(i);
                }
                const isCreate =
                    mm2013LyricPhraseIndex.findIndex((element) => {
                        return element == phraseIndex;
                    }) > -1;
                if (isCreate) {
                    let lyric = new MM2013LyricObject();
                    lyric.create(param);
                    this._lyricObjectManager.addLyricObject(lyric);
                    this._createdChecker.addPhrase(phrase);
                }
            }
            {
                const mm2022LyricPhraseIndex = new Array<number>;
                // 特殊対応：「新たなミライへと」のみ2022タイトルロゴ風に（スクリーン演出は2013のまま）
                mm2022LyricPhraseIndex.push(DefPhraseIndex.MM2013.END_INDEX);
                const isCreate =
                    mm2022LyricPhraseIndex.findIndex((element) => {
                        return element == phraseIndex;
                    }) > -1;
                if (isCreate) {
                    let lyric = new MM10thLyricObjects();
                    lyric.create(param);
                    this._lyricObjectManager.addLyricObject(lyric);
                    this._createdChecker.addPhrase(phrase);
                }
            }

            {
                const mm2014LyricPhraseIndex = new Array<number>;
                for (let i = DefPhraseIndex.MM2014.START_INDEX; i <= DefPhraseIndex.MM2014.END_INDEX; i++) {
                    mm2014LyricPhraseIndex.push(i);
                }
                const isCreate =
                    mm2014LyricPhraseIndex.findIndex((element) => {
                        return element == phraseIndex;
                    }) > -1;
                if (isCreate) {
                    let lyric = new MM2014LyricObject();
                    lyric.create(param);
                    this._lyricObjectManager.addLyricObject(lyric);
                    this._createdChecker.addPhrase(phrase);
                }
            }

            {
                const mm2015LyricPhraseIndex = new Array<number>;
                for (let i = DefPhraseIndex.MM2015.START_INDEX; i <= DefPhraseIndex.MM2015.END_INDEX; i++) {
                    mm2015LyricPhraseIndex.push(i);
                }
                const isCreate =
                    mm2015LyricPhraseIndex.findIndex((element) => {
                        return element == phraseIndex;
                    }) > -1;
                if (isCreate) {
                    let lyric = new MM2015LyricObject();
                    lyric.create(param);
                    this._lyricObjectManager.addLyricObject(lyric);
                    this._createdChecker.addPhrase(phrase);
                }
            }

            {
                const mm2016LyricPhraseIndex = new Array<number>;
                for (let i = DefPhraseIndex.MM2016.START_INDEX; i <= DefPhraseIndex.MM2016.END_INDEX; i++) {
                    mm2016LyricPhraseIndex.push(i);
                }
                const isCreate =
                    mm2016LyricPhraseIndex.findIndex((element) => {
                        return element == phraseIndex;
                    }) > -1;
                if (isCreate) {
                    let lyric = new MM2016LyricObject();
                    lyric.create(param);
                    this._lyricObjectManager.addLyricObject(lyric);
                    this._createdChecker.addPhrase(phrase);
                }
            }

            {
                const mm2017to2020LyricPhraseIndex = new Array<number>;
                for (let i = DefPhraseIndex.MM2017.START_INDEX; i <= DefPhraseIndex.MM2020.END_INDEX; i++) {
                    mm2017to2020LyricPhraseIndex.push(i);
                }
                const isCreate =
                mm2017to2020LyricPhraseIndex.findIndex((element) => {
                        return element == phraseIndex;
                    }) > -1;
                if (isCreate) {
                    let lyric = new PopoutLyricObject();
                    lyric.create(param);
                    this._lyricObjectManager.addLyricObject(lyric);
                    this._createdChecker.addPhrase(phrase);
                }
            }

            {
                const mm2021LyricPhraseIndex = new Array<number>;
                for (let i = DefPhraseIndex.MM2021.START_INDEX; i <= 41; i++) {
                    mm2021LyricPhraseIndex.push(i);
                }
                const isCreate =
                mm2021LyricPhraseIndex.findIndex((element) => {
                        return element == phraseIndex;
                    }) > -1;
                if (isCreate) {
                    let lyric = new MM2021LyricObject();
                    lyric.create(param);
                    this._lyricObjectManager.addLyricObject(lyric);
                    this._createdChecker.addPhrase(phrase);
                }
            }
        }
    }
}

// 歌詞オブジェクト生成クラス：汎用
export class LyricFactory extends BaseLyricFactory {
    constructor() {
        super();
    }

    public override update(): void {
        const phrase = this._player.findPhrase(this._player.position);
        if (!phrase) {
            return;
        }

        if (!this._createdChecker.isCreated(phrase)) {
            const param: LyricObjectCreateParam = {
                phrase: phrase,
                player: this._player,
                sentenceManager: this._sentenceManager,
                posRoot: this._posRoot,
                id: this._id,
            };

            // todo: BaseLyricObject を継承したどのクラスを new するか判断できるようにする
            let lyric: BaseLyricObject;
            const phraseIndex = this._player.findPhraseIndex(phrase);
            if (this._player.isStartedLastChorus()) {
                // ラスサビ（銀テ）演出以降の場合はシンプルに表示
                lyric = new LyricObject();
            } else {
                lyric = new FlowSidewayLyricObject();
            }
            lyric.create(param);
            this._lyricObjectManager.addLyricObject(lyric);
            this._createdChecker.addPhrase(phrase);
        }
    }
}

// 歌詞オブジェクト生成クラス：ランダム切り替え
export class RandomLyricFactory extends BaseLyricFactory {
    private _dispCount: number;
    private _dispType: string; // 生成する歌詞オブジェクトの種類

    constructor() {
        super();
        this._dispCount = 0;
        this._dispType = "LyricObject";
    }

    public override update(): void {
        const phrase = this._player.findPhrase(this._player.position);
        if (!phrase) {
            return;
        }

        if (!this._createdChecker.isCreated(phrase)) {
            const param: LyricObjectCreateParam = {
                phrase: phrase,
                player: this._player,
                sentenceManager: this._sentenceManager,
                posRoot: this._posRoot,
                id: this._id,
            };

            // todo: BaseLyricObject を継承したどのクラスを new するか判断できるようにする
            let lyric: BaseLyricObject;
            const phraseIndex = this._player.findPhraseIndex(phrase);
            if (this._player.isStartedLastChorus()) {
                // ラスサビ（銀テ）演出以降の場合はシンプルに表示
                lyric = new LyricObject();
            } else {
                // 一定周期でランダムに表示オブジェクト変更
                if (3 < this._dispCount) {
                    this.changeDispType();
                }

                // 歌詞表示無効の場合は作った扱いにして処理止める
                if (!this._isCreateEnable) {
                    this._createdChecker.addPhrase(phrase);
                    return;
                }

                switch(this._dispType) {
                    case "LyricObject": {
                        lyric = new LyricObject();
                        break;
                    }
                    case "FlowSideway": {
                        lyric = new FlowSidewayLyricObject();
                        break;
                    }
                    case "MM2013": {
                        lyric = 3 <= phrase.wordCount ? new MM2013LyricObject(): new LyricObject();
                        break;
                    }
                    case "MM2014": {
                        lyric = new MM2014LyricObject();
                        break; 
                    }
                    case "MM2015": {
                        lyric = new MM2015LyricObject();
                        break;
                    }
                    case "MM2016": {
                        lyric = new MM2016LyricObject();
                        break;
                    }
                    case "MM2021": {
                        lyric = new MM2021LyricObject();
                        break;
                    }
                    case "MM10th": {
                        lyric = 3 <= phrase.wordCount ? new MM10thLyricObjects(): new LyricObject();
                        break;
                    }
                    case "Popout": {
                        lyric = new PopoutLyricObject();
                        break;
                    }
                    default: {
                        lyric = new LyricObject();
                        break;
                    }
                }

                this._dispCount++;
            }
            lyric.create(param);
            this._lyricObjectManager.addLyricObject(lyric);
            this._createdChecker.addPhrase(phrase);
        }
    }

    private changeDispType() : void {
        const objectType = [
            "LyricObject",
            "FlowSideway",
            "MM2013",
            "MM2014",
            "MM2015",
            "MM2016",
            "MM2021",
            "MM10th",
            "Popout",
        ];
        const index = MathUtils.clamp(Math.floor(Math.random() * objectType.length + 0.5), 0, objectType.length - 1);
        this._dispType = objectType[index];
        this._dispCount = 0;
    }
}

// 生成済み歌詞判定クラス
export class LyricCreatedChecker {
    private _createdPhraseStartTimeList: Array<number>;

    constructor() {
        this._createdPhraseStartTimeList = new Array<number>();
    }

    public restart(): void {
        this._createdPhraseStartTimeList.splice(0);
    }

    public addPhrase(phrase: IPhrase): void {
        this._createdPhraseStartTimeList.push(phrase.startTime);
    }

    public isCreated(phrase: IPhrase): boolean {
        return this._createdPhraseStartTimeList.some((value) => value == phrase.startTime);
    }
}
