// 要素の取得
const form = document.querySelector("form");
const list = document.querySelector(".title-list");
const input = document.getElementById("title");
const titleRename = document.getElementById("title-rename");
const dialog = document.querySelector("dialog");
const cancelBtn = document.querySelector(".cancel-btn");
const saveBtn = document.querySelector(".save-btn");

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
    renderEditButton(contentRecord.id, contentRecord.title, li);
    renderDeleteButton(contentRecord.id, li);
  });
}

// 編集ボタン
function renderEditButton(uuid, contentTitle, contentLiElement) {
  const button = document.createElement("button");
  contentLiElement.appendChild(button);
  button.textContent = "編集";
  button.addEventListener("click", () => {
    titleRename.value = contentTitle;
    contentRenameDialogId = uuid;
    dialog.showModal();
  });
}

// キャンセルボタン
cancelBtn.addEventListener("click", () => {
  dialog.close();
});

// 保存ボタン
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
  dialog.close();
  renderList();
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
