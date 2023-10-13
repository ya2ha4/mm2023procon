import { GUI } from "dat.gui";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { Clock } from "three/src/core/Clock";
import { Object3D } from "three/src/core/Object3D";
import { PointLight } from "three/src/lights/PointLight";
import { SpotLight } from "three/src/lights/SpotLight";
import { Vector2 } from "three/src/math/Vector2";
import { Vector3 } from "three/src/math/Vector3";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { Scene } from "three/src/scenes/Scene";
import { ColorRepresentation } from "three";
import { Color, Euler, MathUtils } from "three/src/Three";

import { DefColor, DefDevelop, DefPosition } from "./ConstantDefine";
import DebugInfo from "./DebugInfo";
import MyRenderer from "./graphics/MyRenderer";
import { BaseLyricFactory, LoadingMemoriesLyricFactory, LyricCreatedChecker, LyricFactory, RandomLyricFactory } from './object/Lyric/LyricFactory';
import LyricObjectManager from "./object/Lyric/LyricObjectManager";
import { PlayCharacter } from "./object/PlayCharacter";
import { StageObject } from "./object/StageObject";
import { SentenceManager } from "./SentenceManager";
import { findMusicInfo } from "./textalive/MusicInfo";
import TextAlivePlayer from "./textalive/TextAlivePlayer";

import MultiTextAlivePlayer from "./textalive/MultiTextAlivePlayer";

const gTargetAspect: number = 16 / 9;
class Main {
    private _mainSequence: MainSequence;

    public constructor() {
        this._mainSequence = new MainSequence();
    }

    public initialize(): void {
        this._mainSequence.initialize();
    }
}

type MainSequenceState = "new" | "initializing" | "ready" | "playing" | "finished" | "delete";

class MainSequence {
    private static musicInfoIndex = 0;
    private _multiPlayer: MultiTextAlivePlayer;
    private _loadingPlayerIndex: number;

    private _status: MainSequenceState;

    // 描画関連
    private _renderer: WebGLRenderer;
    private _camera: PerspectiveCamera;
    private _scene: Scene;
    private _myRenderer: MyRenderer;

    private _width: number;
    private _height: number;

    // オブジェクト管理、生成
    private _sentenceManager: SentenceManager;
    private _lyricCreateChecker: LyricCreatedChecker;
    private _lyricFactoryArray: Array<BaseLyricFactory>;

    // シーンオブジェクト
    // 歌詞
    private _lyricObjectManager: LyricObjectManager;

    // ライト
    private _pointLights: PointLight[];

    // タッチ始点
    private _touchStartPos: Vector2;
    // ドラッグ位置
    private _touchNowPos: Vector2;
    // ドラッグ判定（押下中ならtrue）
    private _isTouchDown: boolean;

    // ステージ
    private _stageObject: StageObject;

    // 操作キャラ
    private _playChara: PlayCharacter;

    // 経過時間
    private _clock: Clock;

    // デバッグ情報
    private _debugInfo: DebugInfo;

    public constructor() {
        this._multiPlayer = new MultiTextAlivePlayer();
        this._loadingPlayerIndex = 0;
        this._status = "new";

        // 描画関連 --------------------------------
        this._renderer = new WebGLRenderer();
        this._camera = new PerspectiveCamera(60, gTargetAspect, 1, 1000);
        this._scene = new Scene();
        this._myRenderer = new MyRenderer();

        this._width = window.innerWidth;
        this._height = window.innerHeight;

        // オブジェクト生成管理 --------------------------------
        this._sentenceManager = new SentenceManager();
        this._lyricCreateChecker = new LyricCreatedChecker();
        this._lyricFactoryArray = new Array<BaseLyricFactory>();

        // シーンオブジェクト --------------------------------
        // 歌詞 --------------------------------
        this._lyricObjectManager = new LyricObjectManager();

        // ライト --------------------------------
        this._pointLights = new Array<PointLight>();

        // インタラクション --------------------------------
        this._touchStartPos = new Vector2();
        this._touchNowPos = new Vector2();
        this._isTouchDown = false;

        // ステージ --------------------------------
        this._stageObject = new StageObject();

        // キャラ --------------------------------
        this._playChara = new PlayCharacter();


        // --------------------------------
        this._clock = new Clock();

        if (DefDevelop.Debug.ENABLE_DEBUG) {
            this._debugInfo = new DebugInfo();
        }

        window.addEventListener("resize", () => this.resize());
    }

    // 非サポート
    // 初めからやり直す際、全リソース初期化は時間かかるので restart() で対応する方針に
    public destructor(): void {
        // todo:
        this._multiPlayer.dispose()

        this._lyricObjectManager.dispose();

        this._pointLights.forEach((light) => {
            light.dispose();
        });

        this._stageObject.dispose();
        this._playChara.dispose();

        this._status = "delete";
    }

    public restart(): void {
        this._multiPlayer.restart();

        this._lyricCreateChecker.restart();

        this._lyricObjectManager.restart();

        this._stageObject.restart();
        this._stageObject.screen.switchTexture("ready");

        this._playChara.restart();

        this._status = "ready";
    }

    public initialize(): void {
        this._multiPlayer.initialize(0, findMusicInfo(0));

        // 描画関連 --------------------------------
        this._renderer.setSize(this._width, this._height);
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._myRenderer.initialize(this._renderer, this._width, this._height, this._scene, this._camera);
        // #canvas-containerにレンダラーのcanvasを追加
        const container = document.getElementById("canvas-container")!;
        container.appendChild(this._renderer.domElement);
        container.addEventListener("click", (event) => this.click(event));
        container.addEventListener("mousedown", (event) => this.mousedown(event));
        container.addEventListener("mouseup", (event) => this.mouseup(event));
        container.addEventListener("mousemove", (event) => this.mousemove(event));
        container.addEventListener("touchstart", (event) => this.touchdown(event));
        container.addEventListener("touchend", (event) => this.touchend(event));
        container.addEventListener("touchmove", (event) => this.touchmove(event));
        this._myRenderer.setDebugEvent(container);

        const isFpp = true;
        const fppCameraPos = new Vector3(0.0, DefPosition.Stage.SCREEN_POS.y * 2.0, 60.0);
        if (isFpp) {
            // 一人称視点
            this._camera.position.copy(fppCameraPos);
            // カメラの向き
            this._camera.rotation.set(0.0, Math.PI, 0.0);
            // カメラの注視先を 座標で指定する場合に使用
            // カメラ位置から注視する方向に対して、roll方向の向きを決める必要があるため、
            // lookatを使う場合でも、rotationは使用する必要があると思われる。
            this._camera.lookAt(new Vector3(0.0, DefPosition.Stage.SCREEN_POS.y * 1.25, -10.0));
        } else {
            // 俯瞰視点
            // カメラ位置
            let offset = 2.5;
            // 上からの俯瞰視点
            // this._camera.position.set(-20 * offset, 30 * offset, 40 * offset);
            this._camera.position.set(-200, DefPosition.Stage.SCREEN_POS.y, DefPosition.Stage.STAGE_POS.z);
            this._camera.lookAt(new Vector3(1, DefPosition.Stage.SCREEN_POS.y, -2));
        }

        // オブジェクト生成管理 --------------------------------
        this._sentenceManager.initialize(this._scene);

        const lyricOffsetPos = [
            new Vector3(-30, 60, 0),
            new Vector3(+30, 60, 0),
            new Vector3(+50, 40, 0),
            new Vector3(+40, 20, 0),
            new Vector3(-40, 20, 0),
            new Vector3(-50, 40, 0),
        ]
        for (let i = 0; i < DefDevelop.Info.MUSIC_NUM; i++) {
            let factory = new RandomLyricFactory();
            factory.create({
                lyricObjectManager: this._lyricObjectManager,
                sentenceManager: this._sentenceManager,
                player: this._multiPlayer.getPlayer(i),
                createdChecker: this._lyricCreateChecker,
                posRoot: new Vector3().copy(DefPosition.Stage.ROOM_POS[i]).add(lyricOffsetPos[i]),
                id: i,
            });

            this._lyricFactoryArray.push(factory);
        }

        // シーンオブジェクト --------------------------------
        // ポイントライト
        interface PointLightCreateParam {
            color?: ColorRepresentation;
            intensity?: number;
            distance?: number;
            decay?: number;
            position: Vector3;
        }

        const pointLightParams: PointLightCreateParam[] = [
            {
                color: 0x888888,
                position: new Vector3(0, 100, 100),
                intensity: 2,
            },
        ];
        pointLightParams.forEach((param) => {
            const pointLight = new PointLight(param.color, param.intensity, param.distance, param.decay);
            pointLight.position.set(param.position.x, param.position.y, param.position.z);
            this._pointLights.push(pointLight);
            this._scene.add(pointLight);
        });

        // 歌詞 --------------------------------

        // ライト --------------------------------

        // インタラクション --------------------------------

        // ステージ --------------------------------
        this._stageObject.create({ scene: this._scene });

        // キャラ --------------------------------
        this._playChara.create( {scene: this._scene,
            modelPath: "model/avater/procon2023avater.glb",
            position: new Vector3(0.0, 0.0, -50.0),
            rotation: new Euler(),
        } );

        // --------------------------------
        this._status = "initializing";

        this.resize();

        this.update();
    }

    private isInitialized(): boolean {
        if (this._loadingPlayerIndex < DefDevelop.Info.MUSIC_NUM && !this._multiPlayer.isInitialized(this._loadingPlayerIndex)) {
            return false;
        } else {
            this._loadingPlayerIndex++;
            if (this._loadingPlayerIndex < DefDevelop.Info.MUSIC_NUM) {
                this._multiPlayer.initialize(this._loadingPlayerIndex, findMusicInfo(this._loadingPlayerIndex));
                return false;
            }
        }

        if (!this._sentenceManager.isLoaded()) {
            return false;
        }

        if (!this._stageObject.screen.isLoaded()) {
            return false;
        }

        if (!this._stageObject.roomScreen.isLoaded()) {
            return false;
        }

        if (!this._playChara.isLoaded()) {
            return false;
        }

        return true;
    }

    private isFinished(): boolean {
        return this._lyricObjectManager.isFinished() && this._multiPlayer.isFinished(0);
    }

    public update(): void {
        requestAnimationFrame(() => {
            this.update();
        });
        this._myRenderer.dispLoading(false);
        if (this._status == "new" || this._status == "initializing") {
            // 初期化開始
            this._myRenderer.dispLoading(true);
        }

        if (this._status == "initializing" && this.isInitialized()) {
            // 初期化完了（スタート待ち）
            this._stageObject.screen.switchTexture("ready");
            this._status = "ready";
        }

        if (this._status == "playing" && this.isFinished()) {
            // 曲終了
            this._stageObject.screen.switchTexture("finished");
            this._status = "finished";
        }

        const delta = this._clock.getDelta();

        // 描画関連 --------------------------------

        // オブジェクト生成管理 --------------------------------
        this._lyricFactoryArray.forEach((factory) => {
            factory.update();
        });

        // シーンオブジェクト --------------------------------
        // 歌詞 --------------------------------
        this._lyricObjectManager.update(delta);

        // ライト --------------------------------

        // インタラクション --------------------------------

        // ステージ --------------------------------

        // キャラ --------------------------------
        if (this._isTouchDown) {
            // ドラッグ方向に移動
            const delta = new Vector2().copy(this._touchNowPos).sub(this._touchStartPos);
            const l = Math.min(this._width, this._height) * 0.5;
            delta.x /= l;
            delta.y /= l;
            const moveLimit = 1;
            delta.x = MathUtils.clamp(delta.x, -moveLimit, moveLimit);
            delta.y = MathUtils.clamp(delta.y, -moveLimit, moveLimit);
            this._playChara.move(new Vector3(delta.x, 0, delta.y));
        }
        this._playChara.update(delta);

        // rem: キャラとの位置で音量調整
        let distList = [0, 0, 0, 0, 0, 0]; // 各部屋と操作キャラとの距離 
        let indexRank = [0, 0, 0, 0, 0, 0]; // 各部屋のMusicInfo用id
        for (let i = 0; i < DefDevelop.Info.MUSIC_NUM; i++) {
            distList[i] = this._playChara.position.distanceToSquared(DefPosition.Stage.ROOM_POS[i]);
            indexRank[i] = i;
        }

        for (let i = 0; i < distList.length - 1; i++) {
            for (let j = distList.length - 1; j > i; j--) {
                if (distList[j-1] < distList[j]) {
                    let tempDist  = distList[j-1];
                    distList[j-1] = distList[j];
                    distList[j]   = tempDist;

                    let tempIndex  = indexRank[j-1];
                    indexRank[j-1] = indexRank[j];
                    indexRank[j]   = tempIndex;
                }
            }
        }

        for (let i = 0; i < indexRank.length; i++) {
            const player = this._multiPlayer.getPlayer(indexRank[i]);
            const dist = MathUtils.clamp(distList[i], 0, 30*30);
            const vol = (1 - MathUtils.inverseLerp(0, 30*30, dist)) * 100;
            player.setVolume(vol);

            const lyricFactory = this._lyricFactoryArray[indexRank[i]];
            lyricFactory.isCreateEnable = (30*30 > dist);
        }

        // --------------------------------
        if (DefDevelop.Debug.ENABLE_DEBUG) {
            this._debugInfo.update();
        }

        this._myRenderer.render(delta);
    }

    private resize(): void {
        let currentAspect = document.documentElement.clientWidth / document.documentElement.clientHeight;
        if (currentAspect > gTargetAspect) {
            this._height = document.documentElement.clientHeight;
            this._width = gTargetAspect * this._height;
        } else {
            this._width = document.documentElement.clientWidth;
            this._height = this._width / gTargetAspect;
        }
        if (this._renderer) {
            this._renderer.setSize(this._width, this._height);
        }
        if (this._myRenderer) {
            this._myRenderer.resize(this._width, this._height);
        }
    }

    private click(event: MouseEvent): void {
        // クリック対象がcanvasオブジェクトの場合
        if (event.target == this._renderer.domElement) {
            // ペンライトを振ってパーティクルを生成
            // this._penlight.shake();
        }

        if (this._status == "ready") {
            if (this._multiPlayer.requestPlayAll()) {
                this._stageObject.screen.switchTexture("none");
                this._status = "playing";
                this._stageObject.roomScreenPlay();
            } else {
                console.warn(`player.requestPlay() に失敗`);
            }
        }

        if (this._status == "finished") {
            this.restart();
            this._stageObject.screen.switchTexture("ready");
            //this._stageObject.roomScreen.stop();
            this._status = "ready";
        }

        if (this._camera == null || this._scene == null) {
            return;
        }

        const element = <HTMLDivElement>event.currentTarget;
        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;
        const w = element.offsetWidth;
        const h = element.offsetHeight;

        // 座標を [-1.0, 1.0] に正規化
        const pos = new Vector2((x / w - 0.5) * 2.0, -(y / h - 0.5) * 2.0);
        // console.log(`click normalized pos: (${pos.x}, ${pos.y})`);
        this._myRenderer.setTouchPos(event);
    }

    private mousedown(event: MouseEvent): void {
        const element = <HTMLDivElement>event.currentTarget;
        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;
        this._touchStartPos.set(x, y);
        this._touchNowPos.set(x, y);
        this._isTouchDown = true;
    }

    private mouseup(event: MouseEvent): void {
        this._touchStartPos.set(0, 0);
        this._touchNowPos.set(0, 0);
        this._isTouchDown = false;
    }

    private mousemove(event: MouseEvent): void {
    if (this._isTouchDown) {
            const element = <HTMLDivElement>event.currentTarget;
            const x = event.clientX - element.offsetLeft;
            const y = event.clientY - element.offsetTop;
            this._touchNowPos.set(x, y);
        }
    }

    private touchdown(event: TouchEvent): void {
        const element = <HTMLDivElement>event.currentTarget;
        const x = event.touches[0].clientX - element.offsetLeft;
        const y = event.touches[0].clientY - element.offsetTop;
        this._touchStartPos.set(x, y);
        this._touchNowPos.set(x, y);
        this._isTouchDown = true;
    }

    private touchend(event: TouchEvent): void {
        this._touchStartPos.set(0, 0);
        this._touchNowPos.set(0, 0);
        this._isTouchDown = false;
    }

    private touchmove(event: TouchEvent): void {
    if (this._isTouchDown) {
            const element = <HTMLDivElement>event.currentTarget;
            const x = event.touches[0].clientX - element.offsetLeft;
            const y = event.touches[0].clientY - element.offsetTop;
            this._touchNowPos.set(x, y);
        }
    }
}

const main = new Main();
main.initialize();

