const form = document.querySelector("form");
const shelfList = document.querySelector(".shelf-list");
const input = document.getElementById("title");
const titleRename = document.getElementById("title-rename");
const editReviewText = document.getElementById("edit-review-text");
const editDialog = document.querySelector(".edit-dialog");
const addDialog = document.querySelector(".add-dialog");
const searchTypeBtns = document.querySelectorAll(".search-type-btn");
const searchBtn = document.querySelector(".search-btn");
const searchResults = document.querySelector(".search-results");
const searchCount = document.querySelector(".search-count");
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

let contentRenameDialogId;
let contentImagePath;

// CSS側の棚の列数と合わせること --shelf-columnsを書き換えればOKです
const coversPerShelfRow = 3;

let anirackContentRecords = [];

const mediaSearchQuery = `query ($type: MediaType, $search: String) {
  Page {
    media(type: $type, search: $search, sort: POPULARITY_DESC, isAdult: false) {
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
      startDate {
        year
      }
    }
  }
}`;

// 間違った形式で入力しても、入力し直して保存できる
input.addEventListener("input", () => {
  input.setCustomValidity("");
  contentImagePath = null;
});

function setInputValidity(element) {
  element.setCustomValidity("タイトルを入力してください");
  element.reportValidity();
}

function saveAndDisplay() {
  localStorage.setItem("Records", JSON.stringify(anirackContentRecords));
  renderList();
}

function returnTitlePriority(obj) {
  if (obj.title.native !== null) {
    return obj.title.native;
  } else if (obj.title.english !== null) {
    return obj.title.english;
  } else {
    return obj.title.romaji;
  }
}

function returnOneSearchList(obj) {
  const list = document.createElement("li");
  const button = document.createElement("button");
  const titleSpan = document.createElement("span");
  const div = document.createElement("div");
  const formatSpan = document.createElement("span");
  const seasonYearSpan = document.createElement("span");
  const img = document.createElement("img");
  list.appendChild(button);
  button.setAttribute("type", "button");
  button.classList.add("search-result");
  button.appendChild(img);
  button.appendChild(titleSpan);
  button.appendChild(div);
  div.appendChild(seasonYearSpan);
  div.appendChild(formatSpan);
  div.classList.add("meta-list");
  img.classList.add("search-result-cover");
  titleSpan.textContent = returnTitlePriority(obj);
  formatSpan.textContent = obj.format;
  formatSpan.classList.add("meta");
  seasonYearSpan.textContent = obj.startDate.year;
  seasonYearSpan.classList.add("meta");
  if (obj.coverImage.medium == null) {
    img.classList.add("no-image");
  } else {
    img.setAttribute("src", obj.coverImage.medium);
  }
  titleSpan.classList.add("search-result-title");
  if (obj.startDate.year === null) {
    seasonYearSpan.textContent = "年不明";
  }
  button.addEventListener("click", () => {
    input.value = titleSpan.textContent;
    contentImagePath = obj.coverImage.medium;
  });
  return list;
}

searchTypeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    searchTypeBtns.forEach((b) => {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
  });
});

// フォームに入力されたものを保存
form.addEventListener("submit", (event) => {
  event.preventDefault(); // フォームのページリロードを無効
  const title = form.elements["content-title"].value.trim();
  const review = form.elements["content-review"].value.trim();
  const uuid = crypto.randomUUID();
  // 空白のみの場合は保存できないようにする
  if (title === "") {
    setInputValidity(input);
  } else {
    const contentRecord = {
      title: title,
      review: review,
      id: uuid,
      imagePath: contentImagePath,
    };
    anirackContentRecords.push(contentRecord);
    form.reset();
    addDialog.close();
    saveAndDisplay();
    contentImagePath = null;
  }
});

// AniList APIで作品を検索し、検索結果を表示する
searchBtn.addEventListener("click", async () => {
  searchStatus.textContent = "";
  searchStatus.classList.add("hidden");
  searchResults.textContent = "";
  searchResults.classList.add("hidden");
  searchStatus.classList.remove("is-empty", "is-error");
  searchCount.textContent = "";
  contentImagePath = null;
  const selectedSearchTypebtn = document.querySelector(
    '.search-type-btn[aria-pressed="true"]',
  );
  const selectedSearchType = selectedSearchTypebtn.dataset.type;
  if (input.value === "") {
    setInputValidity(input);
  } else {
    searchStatus.classList.remove("hidden");
    searchBtn.disabled = true;
    searchBtn.textContent = "検索中...";
    searchStatus.classList.add("is-loading");
    searchStatus.textContent = "探しています・・・";
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: mediaSearchQuery,
          variables: {
            type: selectedSearchType,
            search: input.value,
          },
        }),
      });
      searchStatus.textContent = "";
      searchStatus.classList.remove("is-loading");
      const json = await response.json();
      const mediaData = json.data.Page.media;
      const mediaCount = mediaData.length;
      searchCount.textContent = `検索結果${mediaCount}件`;
      if (mediaData.length === 0) {
        searchStatus.classList.remove("hidden");
        searchStatus.textContent =
          "見つかりませんでした。そのまま手で入力して保存できます";
        searchStatus.classList.add("is-empty");
      } else {
        searchResults.classList.remove("hidden");
        mediaData.forEach((obj) => {
          const list = returnOneSearchList(obj);
          searchResults.appendChild(list);
        });
      }
    } catch (error) {
      console.error(error);
      searchStatus.classList.remove("hidden", "is-loading");
      searchStatus.textContent =
        "検索できませんでした。時間をおいて、もう一度お試しください";
      searchStatus.classList.add("is-error");
    }
    searchBtn.disabled = false;
    searchBtn.textContent = "検索";
  }
});

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
    const coverImage = document.createElement("img");
    const coverButton = document.createElement("button");
    const coverTitle = document.createElement("span");
    const div = document.createElement("div");
    coverTitle.textContent = contentRecord.title;
    coverButton.appendChild(coverImage);
    coverButton.classList.add("cover");
    coverImage.classList.add("cover-image");
    coverButton.appendChild(div);
    coverButton.appendChild(coverTitle);
    if (contentRecord.imagePath != null) {
      coverImage.setAttribute("src", contentRecord.imagePath);
      coverButton.classList.add("has-image");
    } else {
      coverButton.classList.add("no-image");
      div.textContent = "NO IMAGE";
      div.classList.add("cover-noimage-text");
    }
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
    if (index % coversPerShelfRow === 0) {
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

// 既存のデータを書き換えて保存する
editSaveBtn.addEventListener("click", () => {
  const renameInput = titleRename.value.trim();
  const rewriteReviewText = editReviewText.value.trim();

  if (renameInput === "") {
    setInputValidity(titleRename);
  } else {
    anirackContentRecords = anirackContentRecords.map((contentRecord) => {
      if (contentRecord.id === contentRenameDialogId) {
        contentRecord.title = renameInput;
        contentRecord.review = rewriteReviewText;
      }
      return contentRecord;
    });
    saveAndDisplay();
    titleRename.value = "";
    editReviewText.value = "";
    editDialog.close();
  }
});

// 既存のデータを削除する
deleteConfirmSubmitBtn.addEventListener("click", () => {
  anirackContentRecords = anirackContentRecords.filter((contentRecord) => {
    return contentRenameDialogId !== contentRecord.id;
  });
  saveAndDisplay();
  editDialog.close();
});

function toggleDeleteConfirm() {
  deleteConfirm.classList.toggle("hidden");
  contentDeleteBtn.classList.toggle("hidden");
}

contentDeleteBtn.addEventListener("click", toggleDeleteConfirm);
deleteConfirmCancelBtn.addEventListener("click", toggleDeleteConfirm);

openAddDialogBtn.addEventListener("click", () => {
  addDialog.showModal();
  contentImagePath = null;
});

addCancelBtn.addEventListener("click", () => {
  addDialog.close();
});

addDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
});

editCancelBtn.addEventListener("click", () => {
  editDialog.close();
});

editDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
});
