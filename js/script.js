// 要素の取得
const form = document.querySelector("form");
const shelfList = document.querySelector(".shelf-list");
const input = document.getElementById("title");
const titleRename = document.getElementById("title-rename");
const editReviewText = document.getElementById("edit-review-text");
const editDialog = document.querySelector(".edit-dialog");
const addDialog = document.querySelector(".add-dialog");
const editSaveBtn = document.querySelector(".edit-save-btn");
const addCancelBtn = document.querySelector(".add-cancel-btn");
const editCancelBtn = document.querySelector(".edit-cancel-btn");
const openAddDialogBtn = document.querySelector(".open-add-dialog-btn");

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
  const review = form.elements["content-review"].value.trim();
  const uuid = crypto.randomUUID();
  // 空白のみの場合は保存できないようにする
  if (title === "") {
    input.setCustomValidity("タイトルを入力してください");
    input.reportValidity();
  } else {
    const contentRecord = {
      title: title,
      review: review,
      id: uuid,
    };
    anirackContentRecords.push(contentRecord);
    form.reset();
    addDialog.close();
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
  shelfList.textContent = "";
  let shelfRow;
  anirackContentRecords.forEach((contentRecord, index) => {
    const coverButton = document.createElement("button");
    const coverTitle = document.createElement("span");
    coverTitle.textContent = contentRecord.title;
    coverButton.appendChild(coverTitle);
    coverButton.classList.add("cover");
    coverButton.setAttribute("type", "button");
    coverTitle.classList.add("cover-title");
    if (index % 3 === 0) {
      const shelf = document.createElement("div");
      shelf.classList.add("shelf");
      const shelfBoard = document.createElement("div");
      shelfBoard.classList.add("shelf-board");
      shelfRow = document.createElement("div");
      shelfRow.classList.add("shelf-row");
      shelfList.appendChild(shelf);
      shelf.appendChild(shelfRow);
      shelf.appendChild(shelfBoard);
    }
    shelfRow.appendChild(coverButton);
  });
}

// U（Update / 更新）
// タイトルごとに編集ボタンを作る関数、押すと編集ダイアログが開く
function renderEditButton(uuid, contentTitle, contentReview, contentLiElement) {
  const button = document.createElement("button");
  contentLiElement.appendChild(button);
  button.textContent = "編集";
  button.addEventListener("click", () => {
    titleRename.value = contentTitle;
    editReviewText.value = contentReview;
    contentRenameDialogId = uuid;
    editDialog.showModal();
  });
}

// 既存のデータを書き換えて保存する
editSaveBtn.addEventListener("click", () => {
  const renameInput = titleRename.value.trim();
  const rewriteReviewText = editReviewText.value.trim();

  if (renameInput === "") {
    titleRename.setCustomValidity("タイトルを入力してください");
    titleRename.reportValidity();
  } else {
    anirackContentRecords = anirackContentRecords.map((contentRecord) => {
      if (contentRecord.id === contentRenameDialogId) {
        contentRecord.title = renameInput;
        contentRecord.review = rewriteReviewText;
      }
      return contentRecord;
    });
    localStorage.setItem("Records", JSON.stringify(anirackContentRecords));
    titleRename.value = "";
    editReviewText.value = "";
    editDialog.close();
    renderList();
  }
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
openAddDialogBtn.addEventListener("click", () => {
  addDialog.showModal();
});

addDialog.addEventListener("click", (event) => {
  //暗い部分のみをクリックしたら閉じるようにする
  if (event.target === addDialog) {
    addDialog.close();
  }
});

addCancelBtn.addEventListener("click", () => {
  addDialog.close();
});

editCancelBtn.addEventListener("click", () => {
  editDialog.close();
});
