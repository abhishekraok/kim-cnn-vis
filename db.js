var sep = "+";
var db;

function indexedDBOk() {
  return "indexedDB" in window;
}

function initializeDB() {
  if (!indexedDBOk) return;

  var openRequest = indexedDB.open("index", 8);

  openRequest.onupgradeneeded = function (e) {
    var thisDB = e.target.result;

    if (!thisDB.objectStoreNames.contains("wordvecs")) {
      thisDB.createObjectStore("wordvecs");
    }

    if (!thisDB.objectStoreNames.contains("wordvecslarge")) {
      thisDB.createObjectStore("wordvecslarge");
    }

    if (!thisDB.objectStoreNames.contains("weights_3")) {
      thisDB.createObjectStore("weights_3");
    }

    if (!thisDB.objectStoreNames.contains("weights_4")) {
      thisDB.createObjectStore("weights_4");
    }

    if (!thisDB.objectStoreNames.contains("weights_5")) {
      thisDB.createObjectStore("weights_5");
    }

    if (!thisDB.objectStoreNames.contains("bias")) {
      thisDB.createObjectStore("bias");
    }

    if (!thisDB.objectStoreNames.contains("dataset")) {
      thisDB.createObjectStore("dataset");
    }
  }

  openRequest.onsuccess = function (e) {
    db = e.target.result;
    console.log("Initialization complete!");
  }

  openRequest.onerror = function (e) {
    console.log("Initialization error!");
  }
}

document.addEventListener("DOMContentLoaded", initializeDB, false);
