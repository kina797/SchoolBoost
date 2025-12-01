/* script.js */

// --- 設定項目 ---
// 以前設定していただいた学校の座標
const schoolLocation = {
  lat: 34.69901121238893,
  lng: 135.19325247730316,
};

const schoolRadius = 200; // 判定する半径（メートル）
// --- 設定ここまで ---

// ガチャの中身リスト
const gachaItems = [
  { icon: "🍙", name: "朝ごはんのおにぎり", rarity: "N" },
  { icon: "✏️", name: "伝説の鉛筆", rarity: "N" },
  { icon: "🥤", name: "購買のジュース", rarity: "R" },
  { icon: "🐱", name: "校庭の猫", rarity: "SR" },
  { icon: "💎", name: "皆勤賞の輝き", rarity: "SSR" },
];

// アプリ起動時の初期化
function initApp() {
  // 保存されているコレクションを読み込む
  loadCollection();
  // ボタンなどのイベントを設定する
  setupEventListeners();

  if (navigator.geolocation) {
    // 位置情報を監視する
    navigator.geolocation.watchPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // 距離を計算
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(userLocation),
          new google.maps.LatLng(schoolLocation)
        );

        updateScreen(distance);
      },
      (error) => {
        document.getElementById("status-text").textContent =
          "位置情報が取得できませんでした";
      }
    );
  } else {
    document.getElementById("status-text").textContent =
      "GPSに対応していません";
  }
}

// イベントリスナーの設定（タップ操作などの登録）
function setupEventListeners() {
  // チェックインボタンを押した時
  document
    .getElementById("checkin-btn")
    .addEventListener("click", showGachaMachine);

  // ガチャのレバーをタップした時
  document
    .getElementById("gacha-handle-container")
    .addEventListener("click", playGachaAnimation);
}

// 画面の更新（エリア内か外かで表示を切り替え）
function updateScreen(distance) {
  const statusText = document.getElementById("status-text");
  const checkinBtn = document.getElementById("checkin-btn");
  const resultArea = document.getElementById("result-area");
  const machine = document.getElementById("gacha-machine");

  // すでに結果が出ている、またはガチャマシンが表示されている場合は何もしない
  if (resultArea.style.display === "block" || machine.style.display === "block")
    return;

  if (distance <= schoolRadius) {
    // エリア内
    statusText.innerHTML = "学校に到着しました！<br>お疲れ様です！";
    checkinBtn.style.display = "inline-block";
  } else {
    // エリア外
    statusText.innerHTML = `学校まであと <span class="distance-display">${Math.round(
      distance
    )}m</span>`;
    checkinBtn.style.display = "none";
  }
}

// ガチャマシンを表示する関数
function showGachaMachine() {
  // ボタンとテキストを隠す
  document.getElementById("checkin-btn").style.display = "none";
  document.getElementById("status-text").style.display = "none";

  // ガチャマシンを表示
  const machine = document.getElementById("gacha-machine");
  machine.style.display = "block";
}

// ガチャを回すアニメーションと結果表示
let isSpinning = false; // 連打防止用

function playGachaAnimation() {
  if (isSpinning) return; // 回転中は無視
  isSpinning = true;

  const machine = document.getElementById("gacha-machine");
  const handle = document.getElementById("gacha-handle");

  // クラスを追加して回転スタート
  handle.classList.add("spinning");

  // 1.6秒後に結果を表示
  setTimeout(() => {
    // 回転を止めてマシンを隠す
    handle.classList.remove("spinning");
    machine.style.display = "none";
    isSpinning = false;

    // ランダム抽選
    const randomItem =
      gachaItems[Math.floor(Math.random() * gachaItems.length)];

    // 画面に表示
    document.getElementById("item-icon").textContent = randomItem.icon;
    document.getElementById("item-name").textContent = randomItem.name;

    // 結果エリアを表示
    document.getElementById("result-area").style.display = "block";

    // 保存
    saveToCollection(randomItem);
  }, 1600);
}

// --- コレクション保存・読み込み機能 ---

function saveToCollection(item) {
  let collection = JSON.parse(localStorage.getItem("myCollection")) || [];
  collection.push(item);
  localStorage.setItem("myCollection", JSON.stringify(collection));
  loadCollection();
}

function loadCollection() {
  const listContainer = document.getElementById("collection-list");
  const collection = JSON.parse(localStorage.getItem("myCollection")) || [];

  if (collection.length === 0) {
    listContainer.innerHTML = '<p class="empty-msg">まだ何も持っていません</p>';
    return;
  }

  listContainer.innerHTML = "";

  collection.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "collection-item";
    itemElement.textContent = item.icon;
    listContainer.appendChild(itemElement);
  });
}
