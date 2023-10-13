# mm2023procon_develop
# Move Around the Music Rooms
Move Around the Music Rooms は TextAlive App API を用いたリリックアプリです。</br>
本アプリは、初音ミク「マジカルミライ 2023」 プログラミング・コンテスト応募作品になります。</br>

## アプリ説明
### コンセプト、概要
ミクさんをドラッグして移動させ、曲をモチーフにした部屋に近づくと対応した曲を聴くことができるアプリです。</br>
</br>
楽曲コンテストの全曲が同時に流れており場所によっては複数の曲が聴けるようになっていますので自由な位置で楽しんでみて下さい。</br>
開始位置では何も聴こえないようになっていますので、いろんな場所に移動してお好みのスポットを探してみて下さい。</br>
</br>
部屋を巡りシームレスに変わっていく曲の変化を楽しんだり、一つの場所でじっくり曲を聴き入ったり自由に楽しんで下さい。</br>

### アプリの操作方法、シーケンスについて
- アプリを起動し画面に「READY! / タップ or クリックでスタート」と表示されたら画面を押すことでアプリが開始します
- ドラッグすることで、ミクさんを移動させることができ、部屋に近づくことで歌詞が表示され、曲が聴こえてくるようになります

### 動作確認環境
下記の環境で動作確認していますが、OS/ブラウザのバージョン、ハードウェア構成によっては正しく動作しない可能性があります。</br>
- Windows: Google Chrome, Firefox, Edge
- Android: Google Chrome
#### 意図しない状況が発生する環境
下記の環境では、ミクさんの位置にかかわらず全楽曲が最大音量で流れます。</br>
- iOS: Safari, Google Chrome
こちらiOSでのメディアの取り扱いポリシー都合か、TextAlive App API都合か原因が特定できていない状態です。</br>
現状、アプリ開発側からの不具合対応が難しい為、iOS以外の環境からご確認いただけますと幸いです。</br>

## セットアップ方法
### 前準備
[Node.js](https://nodejs.org/) をインストールして下さい。</br>

### パッケージのインストール
package.json のあるディレクトリ (app) にて下記コマンドを実行し、パッケージをインストールして下さい。</br>
```
npm install
```

### TextAlive App API トークンの設定
トークンを下記のjsonファイルに設定して下さい。（トークンは https://developer.textalive.jp/ から取得して下さい。）</br>
- 本番用：app/src/textalive/textalive_config.json
- 開発用：app/src/textalive/dev_textalive_config.json

app/src/textalive/TextAlivePlayer.ts 内にjsonファイルを読み込んでいる箇所がありますので、適時書き換えてアプリを動作させて下さい。</br>
```
import config = require("./dev_textalive_config.json");
```

### サーバの起動
下記コマンドを実行することで、サーバが起動します。</br>
```
npm run build-dev
```

下記の出力が表示されていればOKです。</br>
そのurlにアクセスすることでアプリを確認することができます。</br>
> Server running at `http://localhost:****` (**** はデフォルト 1234 のポート番号)

## 開発メンバー（五十音順）
- しろねぎ
- minatty
- ya2ha4


## License
### package
- dat.gui</br>
  本アプリではApach License 2.0 のライセンスで配布されているパッケージがインストールされます</br>
  Apache License 2.0 http://www.apache.org/licenses/LICENSE-2.0</br>
  https://github.com/dataarts/dat.gui/blob/master/LICENSE</br>
- textalive-app-api</br>
  https://github.com/TextAliveJp/textalive-app-api/blob/master/LICENSE.md</br>
- three</br>
  Copyright © 2010-2022 three.js authors</br>
  https://github.com/mrdoob/three.js/blob/dev/LICENSE</br>
- copy-files-from-to</br>
  Copyright (c) 2017 webextensions.org</br>
  https://github.com/webextensions/copy-files-from-to/blob/master/LICENSE</br>
- del-cli</br>
  Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)</br>
  https://github.com/sindresorhus/del-cli/blob/main/license</br>
- glslify-bundle</br>
  Copyright (c) 2014 stackgl contributors</br>
  https://github.com/glslify/glslify-bundle/blob/master/LICENSE.md</br>
- parcel</br>
  Copyright (c) 2017-present Devon Govett</br>
  https://github.com/parcel-bundler/parcel/blob/v2/LICENSE</br>
- process</br>
  Copyright (c) 2013 Roman Shtylman <shtylman@gmail.com></br>
  https://github.com/defunctzombie/node-process/blob/master/LICENSE</br>
- typescript</br>
  本アプリではApach License 2.0 のライセンスで配布されているパッケージがインストールされます</br>
  Apache License 2.0 http://www.apache.org/licenses/LICENSE-2.0</br>
  https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt</br>

### Font
- Mplus 1 Code</br>
  Copyright 2021 The M+ FONTS Project Authors</br>
  https://github.com/coz-m/MPLUS_FONTS</br>
- 自家製 Rounded M+</br>
  自家製フォント工房</br>
  http://jikasei.me/font/rounded-mplus/about.html</br>
