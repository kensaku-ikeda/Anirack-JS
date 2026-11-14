// 要素の取得
const form = document.querySelector("form");
const list = document.querySelector(".title-list");
const input = document.getElementById("title");
const record = document.querySelector(".record");
const titleRename = document.getElementById("title-rename");
const edit = document.querySelector(".edit");
const add = document.querySelector(".add");
const saveBtn = document.querySelector(".save-btn");
const addCancelBtn = document.querySelector(".add-cancel-btn");
const editCancelBtn = document.querySelector(".edit-cancel-btn");

// グローバル変数
let contentRenameDialogId;

// 作品のデータを保存するための配列
let anirackContentRecords = [];

// C（Create / 作成）
// 間違った形式で入力しても、入力し直して保存できる
input.addEventListener("input", () => {
  input.setCustomValidity("");
});

// フォームに入力されたものを保存
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
    add.close();
    renderList();
    localStorage.setItem("Records", JSON.stringify(anirackContentRecords));
  }
});

// R（Read / 読み取り）
// ページを開いたときにローカルストレージから読み取って、データを保持
const savedRecords = localStorage.getItem("Records");
if (savedRecords) {
  anirackContentRecords = JSON.parse(savedRecords);
  renderList();
}

// 保存されたデータを画面に表示する
function renderList() {
  list.textContent = "";
  anirackContentRecords.forEach((contentRecord) => {
    const li = document.createElement("li");
    li.textContent = contentRecord.title;
    list.appendChild(li);
    renderEditButton(contentRecord.id, contentRecord.title, li);
    renderDeleteButton(contentRecord.id, li);
  });
}

// U（Update / 更新）
// タイトルごとに編集ボタンを作る関数、押すと編集ダイアログが開く
function renderEditButton(uuid, contentTitle, contentLiElement) {
  const button = document.createElement("button");
  contentLiElement.appendChild(button);
  button.textContent = "編集";
  button.addEventListener("click", () => {
    titleRename.value = contentTitle;
    contentRenameDialogId = uuid;
    edit.showModal();
  });
}

// 既存のデータを書き換えて保存する
saveBtn.addEventListener("click", () => {
  const renameInput = titleRename.value.trim();
  anirackContentRecords = anirackContentRecords.map((contentRecord) => {
    if (contentRecord.id === contentRenameDialogId && renameInput !== "") {
      contentRecord.title = renameInput;
    }
    return contentRecord;
  });
  localStorage.setItem("Records", JSON.stringify(anirackContentRecords));
  titleRename.value = "";
  edit.close();
  renderList();
});

// D（Delete / 削除）
// 既存のデータを削除する
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

// モーダルの開閉
record.addEventListener("click", () => {
  add.showModal();
});

add.addEventListener("click", (event) => {
  //暗い部分のみをクリックしたら閉じるようにする
  if (event.target === add) {
    add.close();
  }
});

addCancelBtn.addEventListener("click", () => {
  add.close();
});

editCancelBtn.addEventListener("click", () => {
  edit.close();
});
