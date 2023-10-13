declare module "*textalive_config.json" {
    interface ConfigData {
        textalive_token: string;
    }
    const value: ConfigData;
    export = value;
}
