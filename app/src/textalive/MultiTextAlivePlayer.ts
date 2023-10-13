import { IBeat, IPhrase, IRepetitiveSegment } from "textalive-app-api";
import { DefDevelop } from "../ConstantDefine";
import { MusicInfo, findMusicInfo } from './MusicInfo';
import TextAlivePlayer from "./TextAlivePlayer";


export default class MultiTextAlivePlayer {
    private _players: TextAlivePlayer[];

    public constructor() {
        this._players = new Array<TextAlivePlayer>(DefDevelop.Info.MUSIC_NUM);
        for(let i = 0; i < DefDevelop.Info.MUSIC_NUM; i++) {
            this._players[i] = new TextAlivePlayer();
        }
    }

    public dispose(): void {
        this._players.forEach((player: TextAlivePlayer) => {
            player.dispose();
        });
    }

    public restart(): void {
        this._players.forEach((player: TextAlivePlayer) => {
            player.requestStop()
        });
    }

    public getPlayer(id: number): TextAlivePlayer {
        return this._players[id];
    }

    public initialize(id: number, param: MusicInfo): void {
        this._players[id].initialize(param);
    }

    public isInitialized(id: number): boolean {
        return this._players[id].isInitialized();
    }

    public isFinished(id: number): boolean {
        return this._players[id].isFinished();
    }

    public position(id: number): number {
        return this._players[id].position;
    }

    public isPlaying(id: number): boolean {
        return this._players[id].isPlaying;
    }

    public musicInfo(id: number): MusicInfo {
        return this._players[id].musicInfo;
    }

    public findCurrentPhrase(id: number): IPhrase {
        return this._players[id].findCurrentPhrase();
    }

    public findPhrase(id: number, position: number): IPhrase {
        return this._players[id].findPhrase(position);
    }

    public findPhraseByIndex(id: number, index: number): IPhrase {
        return this._players[id].findPhraseByIndex(index);
    }

    public findBeat(id: number): IBeat {
        return this._players[id].findBeat();
    }

    public isStartedLastChorus(id: number): boolean {
        return this._players[id].isStartedLastChorus();
    }

    public findLastChorusSegment(id: number): IRepetitiveSegment {
        return this._players[id].findLastChorusSegment();
    }

    public getVocalAmplitude(id: number, position: number): number {
        return this._players[id].getVocalAmplitude(position);
    }

    public requestPlayAll(): boolean {
        this._players.forEach((player: TextAlivePlayer) => {
            player.requestPlay();
        })
        return true;
    }

    public requestPlay(id: number): boolean {
        return this._players[id].requestPlay();
    }

    public requestPauseAll(): boolean {
        this._players.forEach((player: TextAlivePlayer) => {
            player.requestPause();
        })
        return true;
    }

    public requestPause(id: number): boolean {
        return this._players[id].requestPause();
    }

    public requestStopAll(): boolean {
        this._players.forEach((player: TextAlivePlayer) => {
            player.requestStop();
        })
        return true;
    }

    public requestStop(id: number): boolean {
        return this._players[id].requestStop();
    }
}
