import { PlayerVideoOptions } from "textalive-app-api";

export class MusicInfo {
    id: number;
    songUrl: string;
    playerVideoOptions?: PlayerVideoOptions;
    musicVideoUrl?: string;
    singerName: string[];
    movieName?: string;
}

export function findMusicInfo(id: number): MusicInfo {
    // king妃jack躍 / 宮守文学 feat. 初音ミク
    const king: MusicInfo = {
        id: 0,
        songUrl: "https://piapro.jp/t/ucgN/20230110005414",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2427948/history
                beatId: 4267297,
                chordId: 2405019,
                repetitiveSegmentId: 2475577 /* 5月6日更新 */,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FucgN%2F20230110005414
                lyricId: 56092,
                lyricDiffId: 9636
            },
        },
        musicVideoUrl: "https://www.youtube.com/watch?v=IsxdBZ0wgq8",
        singerName: ["Miku"],
        movieName: "video/king.mp4",
    };

    // 生きること / nogumi feat. 初音ミク
    const ikiru: MusicInfo = {
        id: 1,
        songUrl: "https://piapro.jp/t/fnhJ/20230131212038",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2427949/history
                beatId: 4267300,
                chordId: 2405033,
                repetitiveSegmentId: 2475606,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FfnhJ%2F20230131212038
                lyricId: 56131,
                lyricDiffId: 9638
            },
        },
        singerName: ["Miku"],
        movieName: "video/ikirukoto.mp4",
    };

    // 唱明者 / すこやか大聖堂 feat. KAITO
    const shomei: MusicInfo = {
        id: 2,
        songUrl: "https://piapro.jp/t/Vfrl/20230120182855",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2427950/history
                beatId: 4267334,
                chordId: 2405059,
                repetitiveSegmentId: 2475645,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FVfrl%2F20230120182855
                lyricId: 56095,
                lyricDiffId: 9637
            },
        },
        musicVideoUrl: "https://www.youtube.com/watch?v=ZcWFcYediVA",
        singerName: ["Kaito"],
        movieName: "video/syoumeisya.mp4",
    };

    // ネオンライトの海を往く / Ponchi♪ feat. 初音ミク
    const neon: MusicInfo = {
        id: 3,
        songUrl: "https://piapro.jp/t/fyxI/20230203003935",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2427951/history
                beatId: 4267373,
                chordId: 2405138,
                repetitiveSegmentId: 2475664,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FfyxI%2F20230203003935
                lyricId: 56096,
                lyricDiffId: 9639
            },
        },
        musicVideoUrl: "https://www.youtube.com/watch?v=wIOUS73LahQ",
        singerName: ["Miku"],
        movieName: "video/neon.mp4",
    };

    // ミュウテイション / Rin（Kuroneko Lounge） feat. 初音ミク
    const mutation: MusicInfo = {
        id: 4,
        songUrl:"https://piapro.jp/t/Wk83/20230203141007",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2427952/history
                beatId: 4267381,
                chordId: 2405285,
                repetitiveSegmentId: 2475676,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FWk83%2F20230203141007
                lyricId: 56812 /* 6月27日更新 */,
                lyricDiffId: 10668 /* 6月27日更新 */
            },
        },
        musicVideoUrl: "https://www.youtube.com/watch?v=cDeu3qhZyHk",
        singerName: ["Miku"],
        movieName: "video/mutation.mp4",
    };

    // Entrust via 39 / ikomai feat. 初音ミク
    const entrust: MusicInfo = {
        id: 5,
        songUrl: "https://piapro.jp/t/Ya0_/20230201235034",
        playerVideoOptions: {
            video: {
                // 音楽地図訂正履歴: https://songle.jp/songs/2427953/history
                beatId: 4269734,
                chordId: 2405723,
                repetitiveSegmentId: 2475686,
                // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FYa0_%2F20230201235034
                lyricId: 56098,
                lyricDiffId: 9643
            },
        },
        singerName: ["Miku"],
        movieName: "video/entrust.mp4",
    };

    const musicInfo: MusicInfo = [king, ikiru, shomei, neon, mutation, entrust].filter((music) => music.id === id).pop();
    if (!musicInfo) {
        console.error(`MusicInfo not found. id:${id}`);
    }
    return musicInfo;
}
