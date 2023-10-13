import Stats from "three/examples/jsm/libs/stats.module";

export default class DebugInfo {
    private _stat: Stats;

    constructor() {
        this._stat = Stats();
        document.body.appendChild(this._stat.dom);
    }

    public update(): void {
        this._stat.update();
    }
}
