// 要素の取得
const form = document.querySelector("form");
const shelfList = document.querySelector(".shelf-list");
const input = document.getElementById("title");
const titleRename = document.getElementById("title-rename");
const editReviewText = document.getElementById("edit-review-text");
const editDialog = document.querySelector(".edit-dialog");
const addDialog = document.querySelector(".add-dialog");
const searchBtn = document.querySelector(".search-btn");
const searchResults = document.querySelector(".search-results");
const searchStatus = document.querySelector(".search-status");
const editSaveBtn = document.querySelector(".edit-save-btn");
const contentDeleteBtn = document.querySelector(".content-delete-btn");
const deleteConfirm = document.querySelector(".delete-confirm");
const deleteConfirmSubmitBtn = document.querySelector(
  ".delete-confirm-submit-btn",
);
const deleteConfirmCancelBtn = document.querySelector(
  ".delete-confirm-cancel-btn",
);
const deleteConfirmContentTitle = document.querySelector(
  ".delete-confirm-content-title",
);
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

// 検索ボタン
searchBtn.addEventListener("click", async () => {
  searchResults.textContent = "";
  searchResults.classList.add("hidden");
  searchStatus.classList.add("hidden");
  if (input.value === "") {
    input.setCustomValidity("タイトルを入力してください");
    input.reportValidity();
  } else {
    searchBtn.disabled = true;
    searchBtn.textContent = "検索中...";
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `query ($search: String) {
        Page {
          media (type: ANIME, search: $search) {
            id
            title {
              native
              english
              romaji
            }
            coverImage {
              medium
            }
            format
            seasonYear
          }
        }
      }`,
          variables: {
            search: input.value,
          },
        }),
      });
      const json = await response.json();
      const mediaData = json.data.Page.media;
      console.log(mediaData);
      if (mediaData.length === 0) {
        searchStatus.classList.remove("hidden");
        searchStatus.textContent =
          "見つかりませんでした。そのまま手で入力して保存できます";
      } else {
        searchResults.classList.remove("hidden");
        mediaData.forEach((obj) => {
          const list = document.createElement("li");
          const button = document.createElement("button");
          const titleSpan = document.createElement("span");
          const formatSpan = document.createElement("span");
          const seasonYearSpan = document.createElement("span");
          const img = document.createElement("img");
          list.appendChild(button);
          button.setAttribute("type", "button");
          button.classList.add("search-result");
          button.appendChild(img);
          button.appendChild(titleSpan);
          button.appendChild(formatSpan);
          button.appendChild(seasonYearSpan);
          if (obj.title.native !== null) {
            titleSpan.textContent = obj.title.native;
          } else if (obj.title.english !== null) {
            titleSpan.textContent = obj.title.english;
          } else {
            titleSpan.textContent = obj.title.romaji;
          }
          formatSpan.textContent = obj.format;
          seasonYearSpan.textContent = obj.seasonYear;
          img.setAttribute("src", obj.coverImage.medium);
          titleSpan.classList.add("search-result-title");
          button.addEventListener("click", () => {
            input.value = titleSpan.textContent;
          });
          searchResults.appendChild(list);
        });
      }
    } catch (error) {
      console.error(error);
      searchStatus.classList.remove("hidden");
      searchStatus.textContent =
        "検索できませんでした。時間をおいて、もう一度お試しください";
    }
    searchBtn.disabled = false;
    searchBtn.textContent = "検索";
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
    coverButton.addEventListener("click", () => {
      contentRenameDialogId = contentRecord.id;
      titleRename.value = contentRecord.title;
      deleteConfirmContentTitle.textContent = contentRecord.title;
      editReviewText.value = contentRecord.review;
      editDialog.showModal();
      contentDeleteBtn.classList.remove("hidden");
      deleteConfirm.classList.add("hidden");
    });
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
deleteConfirmSubmitBtn.addEventListener("click", () => {
  anirackContentRecords = anirackContentRecords.filter((contentRecord) => {
    return contentRenameDialogId !== contentRecord.id;
  });
  localStorage.setItem("Records", JSON.stringify(anirackContentRecords));
  renderList();
  editDialog.close();
});

contentDeleteBtn.addEventListener("click", () => {
  deleteConfirm.classList.toggle("hidden");
  contentDeleteBtn.classList.toggle("hidden");
});

deleteConfirmCancelBtn.addEventListener("click", () => {
  deleteConfirm.classList.toggle("hidden");
  contentDeleteBtn.classList.toggle("hidden");
});

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
