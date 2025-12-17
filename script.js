const PASSWORD = "1357924680";
let db;

/* LOGIN */
function login() {
  const input = document.getElementById("password").value;
  if (input === PASSWORD) {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  } else {
    alert("Password salah");
  }
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

/* DATABASE */
const request = indexedDB.open("MediaDB", 1);

request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore("files", { keyPath: "name" });
};

request.onsuccess = e => {
  db = e.target.result;
  loadFiles();
};

/* SAVE FILE */
function saveFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Pilih file dulu");

  if (file.size > 50 * 1024 * 1024) {
    return alert("Maksimal 50 MB");
  }

  const reader = new FileReader();
  reader.onload = () => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put({
      name: file.name,
      type: file.type,
      data: reader.result
    });
    tx.oncomplete = loadFiles;
  };
  reader.readAsDataURL(file);
}

/* LOAD FILE */
function loadFiles() {
  const media = document.getElementById("media");
  media.innerHTML = "";

  const tx = db.transaction("files", "readonly");
  const store = tx.objectStore("files");

  store.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (!cursor) return;

    const item = cursor.value;
    const div = document.createElement("div");
    div.className = "media-item";

    if (item.type.startsWith("image")) {
      const img = document.createElement("img");
      img.src = item.data;
      div.appendChild(img);
    } else {
      const video = document.createElement("video");
      video.src = item.data;
      video.controls = true;
      div.appendChild(video);
    }

    const del = document.createElement("button");
    del.textContent = "X";
    del.className = "delete-btn";
    del.onclick = () => deleteFile(item.name);

    div.appendChild(del);
    media.appendChild(div);

    cursor.continue();
  };
}

/* DELETE FILE */
function deleteFile(name) {
  const tx = db.transaction("files", "readwrite");
  tx.objectStore("files").delete(name);
  tx.oncomplete = loadFiles;
}