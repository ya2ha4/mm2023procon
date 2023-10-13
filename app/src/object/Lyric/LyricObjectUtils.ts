import { TextSentence } from "../../SentenceManager";
import { Vector3 } from "three/src/math/Vector3";

export namespace LyricObjectUtils {
    /**
     * boundingBoxからオブジェクトのサイズ計算
     * @param sentenceArray サイズ合計対象
     * @param spacingMargin 行間
     * @param lineUpX x軸方向へ並んだものとして計算するか
     * @param lineUpY y軸方向へ並んだものとして計算するか
     * @param lineUpZ z軸方向へ並んだものとして計算するか
     * @returns
     */
    export function getSize(sentenceArray: Array<TextSentence>, spacingMargin: number, lineUpX?: boolean, lineUpY?: boolean, lineUpZ?: boolean): Vector3 {
        let totalSize = new Vector3();
        sentenceArray.forEach((lyric) => {
            const size = new Vector3();
            lyric.getMesh().geometry.boundingBox.getSize(size);
            // 並んでいる軸はサイズ合計、並んでいない軸は最大値を取得できるよう計算
            const calcValue = (previousTotalSize, currentSize, isLineup) => {
                return isLineup ? previousTotalSize + currentSize : Math.max(previousTotalSize, currentSize);
            };
            totalSize.x = calcValue(totalSize.x, size.x, lineUpX);
            totalSize.y = calcValue(totalSize.y, size.y, lineUpY);
            totalSize.z = calcValue(totalSize.z, size.z, lineUpZ);
        });

        totalSize.add(
            new Vector3(
                lineUpX ? spacingMargin * (sentenceArray.length - 1) : 0,
                lineUpY ? spacingMargin * (sentenceArray.length - 1) : 0,
                lineUpZ ? spacingMargin * (sentenceArray.length - 1) : 0
            )
        );

        return totalSize;
    }

    // 横並びさせた場合のサイズ計算
    export function getSizeHorizontally(sentenceArray: Array<TextSentence>, spacingMargin: number): Vector3 {
        return getSize(sentenceArray, spacingMargin, true);
    }

    // 縦並びさせた場合のサイズ計算
    export function getSizeVertically(sentenceArray: Array<TextSentence>, spacingMargin: number): Vector3 {
        return getSize(sentenceArray, spacingMargin, false, true);
    }

    /**
     * 横並びでTextSentenceを配置
     * @param sentenceArray 配置対象
     * @param position 配置位置
     * @param spacingMargin sentence間の行間
     */
    export function lineUpHorizontally(sentenceArray: Array<TextSentence>, position: Vector3, spacingMargin: number): void {
        let existHalfWidth = false;

        sentenceArray.forEach((textSentence) => {
            // 半角文字が入っている場合は文字幅大きく変わるので配置処理を使い分ける
            // 記号含めるかや半角文字の数を一定以上ならにするかなどは検討必要
            if (textSentence.text.match(/[a-zA-Z0-9]+/)) {
                existHalfWidth = true;
            }
        });

        if (existHalfWidth) {
            lineUpHorizontallyProportional(sentenceArray, position, spacingMargin);
        } else {
            lineUpHorizontallyMonospaced(sentenceArray, position, spacingMargin);
        }
    }

    /**
     * 横並びでTextSentenceを配置（文字サイズがほぼ同じ場合用）
     * 文字数奇数の場合、中央の文字が中心から移動しない。
     * @param sentenceArray 配置対象
     * @param position 配置位置
     * @param spacingMargin sentence間の行間
     */
    function lineUpHorizontallyMonospaced(sentenceArray: Array<TextSentence>, position: Vector3, spacingMargin: number): void {
        // 中央から外へ位置移動させ1文字ずつ横並びさせる
        const len = sentenceArray.length;
        for (let i = 0; i < Math.floor(len / 2) + (len % 2 ? 1 : 0); i++) {
            const r = Math.floor(len / 2) - i - (len % 2 ? 0 : 1);
            const l = Math.floor(len / 2) + i;
            if (r == l) {
                sentenceArray[r].setPosition(position);
                continue;
            }
            const preR = r + 1;
            const preL = l - 1;

            let rSize = new Vector3();
            sentenceArray[r].getMesh().geometry.boundingBox.getSize(rSize);
            let lSize = new Vector3();
            sentenceArray[l].getMesh().geometry.boundingBox.getSize(lSize);

            if (r == preL) {
                // 両方移動
                const rPos = new Vector3();
                rPos.copy(position);
                rPos.setX(-(rSize.x + lSize.x + spacingMargin) / 4);
                sentenceArray[r].setPosition(rPos);

                const lPos = new Vector3();
                lPos.copy(position);
                lPos.setX((rSize.x + lSize.x + spacingMargin) / 4);
                sentenceArray[l].setPosition(lPos);
            } else {
                // 外側のみ移動
                const preRSize = sentenceArray[preR].getMesh().geometry.boundingBox.getSize(new Vector3());
                const rPos = new Vector3();
                rPos.copy(position);
                rPos.setX(sentenceArray[preR].getPosition().x - (rSize.x + preRSize.x + spacingMargin) / 2);
                rPos.setY(sentenceArray[preR].getPosition().y);
                rPos.setZ(sentenceArray[preR].getPosition().z);
                sentenceArray[r].setPosition(rPos);

                const preLSize = sentenceArray[preL].getMesh().geometry.boundingBox.getSize(new Vector3());
                const lPos = new Vector3();
                lPos.copy(position);
                lPos.setX(sentenceArray[preL].getPosition().x + (lSize.x + preLSize.x + spacingMargin) / 2);
                lPos.setY(sentenceArray[preL].getPosition().y);
                lPos.setZ(sentenceArray[preL].getPosition().z);
                sentenceArray[l].setPosition(lPos);
            }
        }
    }

    /**
     * 横並びでTextSentenceを配置（文字サイズが大きく異なる場合用）
     * 文字幅が異なる文字が入っていても中心位置が大きくズレない。
     * @param sentenceArray 配置対象
     * @param position 配置位置
     * @param spacingMargin sentence間の行間
     */
    function lineUpHorizontallyProportional(sentenceArray: Array<TextSentence>, position: Vector3, spacingMargin: number): void {
        const totalSize = getSizeHorizontally(sentenceArray, spacingMargin);
        for (let i = 0; i < sentenceArray.length; i++) {
            let posX = 0;
            if (i == 0) {
                posX = -totalSize.x / 2;
            } else {
                // 1つ前のサイズの半分+自分のサイズの半分+余白分ずらす
                const preSize = sentenceArray[i - 1].getMesh().geometry.boundingBox.getSize(new Vector3());
                const currentSize = sentenceArray[i].getMesh().geometry.boundingBox.getSize(new Vector3());
                const shiftX = (preSize.x + currentSize.x) / 2 + spacingMargin;
                posX = sentenceArray[i - 1].getPosition().x + shiftX;
            }
            sentenceArray[i].setPosition(new Vector3(posX, 0, 0).add(position));
            const currentSize = sentenceArray[i].getMesh().geometry.boundingBox.getSize(new Vector3());
            // console.log(`pos:${sentenceArray[i].getPosition().x}, size:${currentSize.x}`);
        }
    }
}
