import { IBeat, IPhrase, IPlayerApp, IRepetitiveSegment, IVideo, Player, Timer } from "textalive-app-api";
import { DefDevelop } from "../ConstantDefine";

import { MusicInfo } from "./MusicInfo";

//import config = require("./textalive_config.json"); // 本番用
import config = require("./dev_textalive_config.json"); // 開発用

export default class TextAlivePlayer {
    private _player: Player;
    private _video: IVideo;
    private _position: number;
    private _musicInfo: MusicInfo;
    private _isReady: boolean;

    public constructor() {
        this._position = 0;
        this._isReady = false;
    }

    public dispose(): void {
        this._player.dispose();
    }

    public restart(): void {
        this._player.requestStop();
        this._position = 0;
    }

    public initialize(param: MusicInfo): void {
        this._player = new Player({
            app: {
                token: config.textalive_token,
                appName: "Move Around the Music Rooms",
            },
            valenceArousalEnabled: true,
            vocalAmplitudeEnabled: true,
            mediaElement: document.querySelector<HTMLElement>("#media"),
        });
        document.querySelector<HTMLElement>("#media").hidden = !DefDevelop.Debug.USING_YOUTUBE_MEDIA;
        this._musicInfo = param;

        this._player.addListener({
            onAppReady: (app) => this.onAppReady(app),
            onVideoReady: (v) => this.onVideoReady(v),
            onTimerReady: (timer) => this.onTimerReady(timer),
            // onPlay : () => this.onPlay(),
            // onPause: () => this.onPause(),
            // onStop : () => this.onStop(),
            // onMediaSeek : (pos) => this.onMediaSeek(pos),
            onTimeUpdate: (pos) => this.onTimeUpdate(pos),
            // onThrottledTimeUpdate: (pos) => this.onThrottledTimeUpdate(pos),
            // onAppParameterUpdate: (name, value) => this.onAppParameterUpdate(name, value),
            // onAppMediaChange: (url) => this.onAppMediaChange(url),
        });
    }

    public isInitialized(): boolean {
        return this._isReady;
    }

    public isFinished(): boolean {
        if (!this.isInitialized()) {
            return false;
        }

        // position は Player.data.song.length を超える値にならない場合がある為、 length-1 して判定
        return this._player.data.song.length - 1 < this.position / 100 && !this._player.isPlaying;
    }

    public get position(): number {
        return this._position;
    }

    public get isPlaying(): boolean {
        return this._player && this._player.isPlaying;
    }

    public get musicInfo(): MusicInfo {
        return this._musicInfo;
    }

    public findCurrentPhrase(): IPhrase {
        if (this._video == null) {
            return null;
        }

        return this._video.findPhrase(this._position);
    }

    public findPhrase(position: number): IPhrase {
        if (this._video == null) {
            return null;
        }

        return this._video.findPhrase(position);
    }

    public findPhraseByIndex(index: number): IPhrase {
        if (index < 0 || this._video == null) {
            return null;
        }

        let phrase = this._video.firstPhrase;
        for (let i = 0; i < index && phrase; i++) {
            phrase = phrase.next;
        }

        return phrase;
    }

    // 何番目のフレーズか検索
    public findPhraseIndex(phrase: IPhrase): number {
        if (this._video == null || phrase == null) {
            return -1;
        }

        for (let i = 0, ph = this._video.firstPhrase; ph; i++, ph = ph.next) {
            if (ph == phrase) {
                return i;
            }
        }

        return -1;
    }

    public findBeat(): IBeat {
        if (this._video == null) {
            return null;
        }

        return this._player.findBeat(this._position);
    }

    public isStartedLastChorus(): boolean {
        if (this._video == null) {
            return false;
        }

        const lastChorus = this.findLastChorusSegment();
        return lastChorus && lastChorus.startTime <= this._position;
    }

    public findLastChorusSegment(): IRepetitiveSegment {
        if (this._video == null) {
            return null;
        }

        const lastChorus = this._player.getChoruses().reduce((acc, value) => (acc.startTime > value.startTime ? acc : value));
        return lastChorus;
    }

    public getVocalAmplitude(position: number): number {
        if (this._video == null) {
            return 0;
        }

        return this._player.getVocalAmplitude(position);
    }

    public requestPlay(): boolean {
        if (this._video == null) {
            return false;
        }

        return this._player.requestPlay();
    }

    public requestPause(): boolean {
        if (this._video == null) {
            return false;
        }

        return this._player.requestPause();
    }

    public requestStop(): boolean {
        if (this._video == null) {
            return false;
        }

        return this._player.requestStop();
    }

    public setVolume(vol: number): boolean {
        if (this._video == null) {
            return false;
        }

        this._player.volume = vol;
        return true;
    }

    private onAppReady(app: IPlayerApp): void {
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            console.log(`app:`, app);
        }

        if (!app.songUrl) {
            const forceUsingMV = DefDevelop.Debug.USING_YOUTUBE_MEDIA; // song URL にMV(youtube)を使用するか? piapro使用すると play/pause 操作をアプリ実装する必要ある為
            if (forceUsingMV && this._musicInfo.musicVideoUrl) {
                this._player.createFromSongUrl(this._musicInfo.musicVideoUrl);
            } else {
                this._player.createFromSongUrl(this._musicInfo.songUrl, this._musicInfo.playerVideoOptions);
            }
        }
    }

    private onVideoReady(v: IVideo): void {
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            console.log(`video:`, v);
        }
        this._video = v;

        if (DefDevelop.Debug.ENABLE_DEBUG) {
            this.debugPrintLyric();
        }
    }

    private onTimerReady(timer: Timer): void {
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            console.log(`timer:`, timer);
        }
        this._isReady = true;
    }

    private onTimeUpdate(position: number): void {
        if (this._player.isPlaying) {
            // piaproのURLで Player.createFromSongUrl() を実行すると再生せずとも position が増加して意図しない値が入るため、その値は反映させない
            if (this._position == 0 && this._video.firstPhrase.startTime < position) {
                return;
            }

            // 再生タイミングによっては発生しうるが、仕様上問題ないので警告は出さない
            if (false && this._position > position) {
                console.warn(`set invalid position this.position:${this._position}, set position:${position}`);
            }
            this._position = position;
        }
    }

    private debugPrintLyric(): void {
        if (!this._video) {
            return;
        }

        let phrase = this._video.firstPhrase;
        let text: string = ""; // 出力文字列
        let index = 0;
        while (phrase) {
            let word = phrase.firstWord;
            let wordsText: string = "";
            while (word != phrase.lastWord) {
                wordsText += `[${word.pos}]${word.text}/`;
                word = word.next;
            }
            wordsText += `[${word.pos}]${word.text}`;

            // フレーズごとの出力を出力文字列に追加
            text += `[${index.toString().padStart(3, ` `)}] ${phrase.text} (${wordsText})\n`; // 出力フォーマットはは『フレーズ ([品詞]単語/[品詞]単語/.../[品詞]単語)』
            phrase = phrase.next;
            index++;
        }
        console.log(text);
    }
}
