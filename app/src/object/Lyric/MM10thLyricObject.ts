import MM2013LyricObject from "./MM2013LyricObject";

/**
 *  歌詞オブジェクト：マジカルミライ10th タイトルロゴカラー調
 */
export default class MM10thLyricObjects extends MM2013LyricObject {
    constructor() {
        super();

        this._colorPattern = [0xd00080, 0x06b6e3, 0xffd11a];
    }

    protected override isUpPosition(index: number): boolean {
        return index % 2 == 0;
    }

    protected override isLeftPosition(index: number): boolean {
        return index == 0;
    }

    protected override isRightPosition(index: number): boolean {
        return index == 2;
    }
}
