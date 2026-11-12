// 要素の取得
const form = document.querySelector("form");
const list = document.querySelector(".title-list");
const input = document.getElementById("title");

// 作品のデータを保存するための配列
let anirackContentRecords = [];

const local = localStorage.getItem("Records");
if (local) {
  anirackContentRecords = JSON.parse(local);
  renderList();
}

// 間違った形式で入力しても、入力し直して保存できる
input.addEventListener("input", () => {
  input.setCustomValidity("");
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // フォームのページリロードを無効
  const title = form.elements["content-title"].value;
  const UUID = crypto.randomUUID();
  // 空白のみの場合は保存できないようにする
  if (title.trim() === "") {
    input.setCustomValidity("タイトルを入力してください");
    input.reportValidity();
  } else {
    const contentRecord = {
      title: title,
      id: UUID,
    };
    anirackContentRecords.push(contentRecord);
    renderList();
    localStorage.setItem("Records", JSON.stringify(anirackContentRecords));
  }
});

function renderList() {
  list.textContent = "";
  anirackContentRecords.forEach((contentRecord) => {
    const li = document.createElement("li");
    li.textContent = contentRecord.title;
    list.appendChild(li);
  });
}
