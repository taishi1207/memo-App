import { Memo } from "./types";
// src/storage.ts
// *************
//変数一覧
// *************
export const STORAGE_KEY = "memo";

// *************
//関数一覧
// *************
export function readLocalStorage(key: string): Memo[] {
  //ローカルストレージからデータを取得する
  const data = localStorage.getItem(key);
  if (data === null) {
    return [];
  } else {
    return JSON.parse(data);
  }
}
export function saveLocalStorage(key: string, memos: Memo[]) {
  //ローカルストレージにデータを保存する
  localStorage.setItem(key, JSON.stringify(memos));
}
