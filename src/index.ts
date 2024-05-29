import { readLocalStorage, saveLocalStorage, STORAGE_KEY } from "./storage";
import { Memo } from "./types";
import { marked } from "marked";

// **************
//要素一覧
// **************

const memoList = document.getElementById("list") as HTMLDivElement;
const addButton = document.getElementById("add") as HTMLDivElement;
const editButton = document.getElementById("edit") as HTMLButtonElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const deleteButton = document.getElementById("delete") as HTMLButtonElement;
const memoTitle = document.getElementById("memoTitle") as HTMLInputElement;
const memoBody = document.getElementById("memoBody") as HTMLTextAreaElement;
const previewBody = document.getElementById("previewBody") as HTMLDivElement;

const downloadLink = document.getElementById("download") as HTMLAnchorElement;

// **************
//処理
// **************
let memos: Memo[] = [];
let memoIndex: number = 0;
downloadLink.addEventListener("click", clickDownloadMemo);
deleteButton.addEventListener("click", clickDeleteMemo);
addButton.addEventListener("click", clickAddMemo);
editButton.addEventListener("click", clickEditMemo);
saveButton.addEventListener("click", clickSaveMemo);

init();

// **************
//関数一覧
// **************
/*新しいメモを作成する*/
function newMemo(): Memo {
  const timestamp: number = Date.now();
  return {
    id: timestamp.toString() + memos.length.toString(),
    title: `new memo ${memos.length + 1}`,
    body: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
/*初期化*/
function init() {
  //すべてのメモをローカルストレージから取得する
  memos = readLocalStorage(STORAGE_KEY);
  console.log(memos);
  if (memos.length === 0) {
    //新しいメモを2つ作成
    memos.push(newMemo());
    memos.push(newMemo());
    //すべてのメモをローカルストレージに保存する
    saveLocalStorage(STORAGE_KEY, memos);
  }
  console.log(memos);
  //すべてのメモのタイトルをメモ一覧に表示する
  showMemoElements(memoList, memos);
  //メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  //選択中のメモ情報を表示用のメモ要素に設定する
  setMemoElement();
  //保存ボタンを非表示にし編集ボタンを表示する
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
}
/*メモの要素を作成する*/
function newMemoElement(memo: Memo): HTMLDivElement {
  // div要素を作成する
  const div = document.createElement("div");
  // div要素にタイトルを設定する
  div.innerText = memo.title;
  // div要素のdata-id属性にメモIDを設定する
  div.setAttribute("data-id", memo.id);
  // div要素のclass属性にスタイルを設定する
  div.classList.add("w-full", "p-sm");
  div.addEventListener("click", selectedMemo);
  return div;
}
//
function clearMemoElements(div: HTMLDivElement) {
  div.innerText = "";
}
function showMemoElements(div: HTMLDivElement, memos: Memo[]) {
  clearMemoElements(div);
  memos.forEach((memo) => {
    const memoElement = newMemoElement(memo);
    div.appendChild(memoElement);
  });
}

/*div要素にアクティブスタイル設定する*/
function setActiveStyle(index: number, isActive: boolean) {
  const selector = `#list > div:nth-child(${index})`;
  const element = document.querySelector(selector) as HTMLDivElement;
  if (isActive) {
    element.classList.add("active");
  } else {
    element.classList.remove("active");
  }
}

/*メモを設定する*/
function setMemoElement() {
  const memo: Memo = memos[memoIndex];
  //メモを表示する要素にタイトルと本文を設定する
  memoTitle.value = memo.title;
  memoBody.value = memo.body;
  //markdownで記述した本文(文字列)をHTMLにパースする
  (async () => {
    try {
      previewBody.innerHTML = await marked.parse(memo.body);
    } catch (error) {
      console.log(error);
    }
  })();
}

/*button要素の表示・非表示を設定する*/
function setHiddenButton(button: HTMLButtonElement, isHidden: boolean) {
  if (isHidden) {
    button.removeAttribute("hidden");
  } else {
    button.setAttribute("hidden", "hidden");
  }
}

/*タイトルと本文の要素のdisabled属性を設定する*/
function setEditMemo(editMemo: boolean) {
  if (editMemo) {
    memoTitle.removeAttribute("disabled");
    memoBody.removeAttribute("disabled");
    //編集モード時がtextareaを表示し、プレビュー用を非表示にする
    memoBody.removeAttribute("hidden");
    previewBody.setAttribute("hidden", "hidden");
  } else {
    memoTitle.setAttribute("disabled", "disabled");
    memoBody.setAttribute("disabled", "disabled");
  }
}

// **************
//イベント関連の関数一覧
// **************
function clickAddMemo(event: MouseEvent) {
  //タイトルと本文を編集モードにする
  setEditMemo(true);
  //保存ボタンを表示し編集ボタンを非表示にする
  setHiddenButton(saveButton, true);
  setHiddenButton(editButton, false);
  //新しいメモを追加する
  memos.push(newMemo());
  //すべてのメモをローカルストレージに保存する
  saveLocalStorage(STORAGE_KEY, memos);
  //新しいメモが追加されたインデックスを設定する
  memoIndex = memos.length - 1;
  //すべてのメモのタイトルをメモ一覧に表示する
  showMemoElements(memoList, memos);
  //メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  //選択中のメモ情報を表示用のメモ要素に設定する
  setMemoElement();
}

/*メモが選択された時の処理*/

function selectedMemo(event: MouseEvent) {
  //タイトルと本文を表示モードにする
  setEditMemo(false);
  //保存ボタンを非表示にし編集ボタンを表示する
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
  //メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, false);
  //クリックされたdiv要素のdata-id属性からメモIDを取得する
  const target = event.target as HTMLDivElement;
  const id = target.getAttribute("data-id");
  //選択されたメモのインデックスを取得する
  memoIndex = memos.findIndex((memo) => memo.id === id);
  //選択中のメモ情報を表示用のメモ要素に設定する
  setMemoElement();
  setActiveStyle(memoIndex + 1, true);
}

/*編集ボタンが押された時の処理*/
function clickEditMemo(event: MouseEvent) {
  //タイトルと本文を編集モードに変更
  setEditMemo(true);
  //保存ボタンを表示し
  setHiddenButton(saveButton, true);
  setHiddenButton(editButton, false);
}
/*保存ボタンが押された時の処理*/
function clickSaveMemo(event: MouseEvent) {
  const memo: Memo = memos[memoIndex];
  memo.title = memoTitle.value;
  memo.body = memoBody.value;
  memo.updatedAt = Date.now();
  //すべてのメモをローカルストレージに保存する
  saveLocalStorage(STORAGE_KEY, memos);
  //タイトルと本文を表示モードにする
  setEditMemo(false);
  //保存ボタンを非表示にし編集ボタンを表示する
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, false);
  //すべてのメモのタイトルを一覧で表示する
  showMemoElements(memoList, memos);
  //メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  //
  setMemoElement();
}

/**/
function clickDeleteMemo(event: MouseEvent) {
  if (memos.length === 1) {
    alert("これ以上は削除できません");
    return;
  }
  //表示中のメモのIDを取得する
  const memoId = memos[memoIndex].id;
  //すべてのメモから表示中のメモを削除する
  memos = memos.filter((memo) => memo.id !== memoId);
  //すべてのメモをローカルストレージに保存する
  saveLocalStorage(STORAGE_KEY, memos);
  //表示するメモのインデックスを1つ前のものにする
  if (1 <= memoIndex) {
    memoIndex--;
  }
  //表示するメモを設定する
  setMemoElement();
  //画面右側を表示モードにする
  setEditMemo(false);
  //保存ボタンを非表示にし編集ボタンを表示する
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
  //画面左側のメモのタイトル一覧をクリアして再構築する
  showMemoElements(memoList, memos);
  //表示するメモのタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
}

/**/
function clickDownloadMemo(event: MouseEvent) {
  //ダウンロードするメモを取得する
  const memo = memos[memoIndex];
  //イベントが発生した要素を取得する
  const target = event.target as HTMLAnchorElement;
  //
  target.download = `${memo.title}.md`;
  target.href = URL.createObjectURL(
    new Blob([memo.body], {
      type: "application/octet-staream",
    })
  );
}
