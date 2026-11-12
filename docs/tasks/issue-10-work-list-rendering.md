状態と表示の分離というタスクをやってみるが、なかなか難しい

いきなりコードにせず、日本語で手順を書いてみよう。

## 作品の配列全体をみて、一覧をまるごと作り直すというのを関数にまとめたい。

配列というデータを書き換え、それを使って、表示ごと差し替える。

1. 作り直す前には画面のli要素をすべて消す。(list.textContent = "")
2. 配列(anirackContentRecords)をforEachで順番に取りだす。
3. １件ごとにliを作成し (document.createElement("li"))
4. テキストを入れて（li.textContent)
5. ulに追加。（list.appendChild)

いけそう！
