// 要素の取得
const form = document.querySelector("form");
const list = document.querySelector(".title-list");
const input = document.getElementById("title");

// 間違った形式で入力しても、入力し直して保存できる
input.addEventListener("input", () => {
  input.setCustomValidity("");
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // フォームのページリロードを無効
  const title = form.elements["content-title"].value;
  const li = document.createElement("li");
  // 空白のみの場合は保存できないようにする
  if (title.trim() === "") {
    input.setCustomValidity("タイトルを入力してください");
    input.reportValidity();
  } else {
    li.textContent = title;
    list.appendChild(li);
  }
});
