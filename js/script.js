// 要素の取得
const form = document.querySelector("form");
const list = document.querySelector(".title-list");
const input = document.getElementById("title");
const dialog = document.querySelector("dialog");
const close = document.querySelector(".cancel-btn");

// グローバル変数
let contentRenameDialogId;

// 作品のデータを保存するための配列
let anirackContentRecords = [];

const savedRecords = localStorage.getItem("Records");
if (savedRecords) {
  anirackContentRecords = JSON.parse(savedRecords);
  renderList();
}

// 間違った形式で入力しても、入力し直して保存できる
input.addEventListener("input", () => {
  input.setCustomValidity("");
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // フォームのページリロードを無効
  const title = form.elements["content-title"].value.trim();
  const uuid = crypto.randomUUID();
  // 空白のみの場合は保存できないようにする
  if (title === "") {
    input.setCustomValidity("タイトルを入力してください");
    input.reportValidity();
  } else {
    const contentRecord = {
      title: title,
      id: uuid,
    };
    anirackContentRecords.push(contentRecord);
    form.reset();
    renderList();
    localStorage.setItem("Records", JSON.stringify(anirackContentRecords));
  }
});

// 入力されたタイトルをリストとして画面に表示
function renderList() {
  list.textContent = "";
  anirackContentRecords.forEach((contentRecord) => {
    const li = document.createElement("li");
    li.textContent = contentRecord.title;
    list.appendChild(li);
    renderDeleteButton(contentRecord.id, li);
    renderEditButton(contentRecord.id, li);
  });
}

// 編集ボタン
function renderEditButton(uuid, contentLiElement) {
  const button = document.createElement("button");
  contentLiElement.appendChild(button);
  button.textContent = "編集";
  button.addEventListener("click", () => {
    contentRenameDialogId = uuid;
    dialog.showModal();
  });
}

// キャンセルボタン
close.addEventListener("click", () => {
  dialog.close();
});

// 削除ボタン
function renderDeleteButton(uuid, contentLiElement) {
  const button = document.createElement("button");
  contentLiElement.appendChild(button);
  button.textContent = "削除";
  button.addEventListener("click", () => {
    anirackContentRecords = anirackContentRecords.filter((contentRecord) => {
      return uuid !== contentRecord.id;
    });
    localStorage.setItem("Records", JSON.stringify(anirackContentRecords));
    renderList();
  });
}
