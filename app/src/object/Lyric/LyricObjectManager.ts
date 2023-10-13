import { BaseLyricObject } from "./BaseLyricObject";

export default class LyricObjectManager {
    private _lyricObjects: Array<BaseLyricObject>;

    constructor() {
        this._lyricObjects = new Array<BaseLyricObject>();
    }

    public dispose(): void {
        this._lyricObjects.forEach((lyric) => {
            lyric.dispose();
        });
        this._lyricObjects = null;
    }

    public restart(): void {
        this._lyricObjects.forEach((lyric) => {
            lyric.dispose();
        });

        this._lyricObjects = new Array<BaseLyricObject>();
    }

    public isFinished(): boolean {
        return 0 == this._lyricObjects.length;
    }

    public addLyricObject(lyric: BaseLyricObject): void {
        this._lyricObjects.push(lyric);
    }

    public update(delta: number): void {
        // update 実行
        this._lyricObjects.forEach((lyric) => {
            lyric.update(delta);
        });

        // 演出が終わったオブジェクトの削除
        this._lyricObjects
            .filter((lyric) => lyric.isFinished())
            .forEach((lyric) => {
                lyric.dispose();
            });
        this._lyricObjects = this._lyricObjects.filter((lyric) => !lyric.isFinished());
    }
}
