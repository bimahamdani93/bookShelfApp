document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const books = [];
const RENDER_EVENT = "render-book";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function addBook() {
  const textTitle = document.getElementById("inputBookTitle").value;
  const textAuthor = document.getElementById("inputBookAuthor").value;
  const textYear = document.getElementById("inputBookYear").value;
  const completedCheck = document.getElementById("inputBookIsComplete");

  const generatedID = generateId();

  if (completedCheck.checked == false) {
    const bookObject = generateBookObject(
      generatedID,
      textTitle,
      textAuthor,
      textYear,
      false
    );

    books.push(bookObject);
  } else {
    const bookObject = generateBookObject(
      generatedID,
      textTitle,
      textAuthor,
      textYear,
      true
    );

    books.push(bookObject);
  }
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = "Penulis : " + bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = "Tahun : " + bookObject.year;

  const listContainer = document.createElement("article");
  listContainer.classList.add("book_item");
  listContainer.append(textTitle, textAuthor, textYear);

  const containerButton = document.createElement("div");
  containerButton.classList.add("action");

  const doneButton = document.createElement("button");
  doneButton.classList.add("green");
  const tSelesai = document.createTextNode("Selesai dibaca");
  doneButton.addEventListener("click", function () {
    addBookToCompleted(bookObject.id);
  });
  doneButton.append(tSelesai);

  const eraseButton = document.createElement("button");
  eraseButton.classList.add("red");
  const tHapus = document.createTextNode("Hapus buku");
  eraseButton.addEventListener("click", function () {
    customConfirm.show("Apakah Anda yakin ingin menghapus? ", dialogBox);
    const oke = document.getElementById("oke");
    oke.addEventListener("click", function(){
      removeBookFromCompleted(bookObject.id);
      okay();
    });
    const cancel = document.getElementById("cancel");
    cancel.addEventListener("click", function(){
      close();
    })
  });
  eraseButton.append(tHapus);

  const backButton = document.createElement("button");
  backButton.classList.add("blue");
  const tKembali = document.createTextNode("Baca Kembali");
  backButton.addEventListener("click", function () {
    undoBookToCompleted(bookObject.id);
  });
  backButton.append(tKembali);

  if (bookObject.isComplete == true) {
    containerButton.append(eraseButton, backButton);
  } else {
    containerButton.append(doneButton, eraseButton);
  }

  listContainer.setAttribute("id", `book-${bookObject.id}`);
  listContainer.append(textTitle, textAuthor, textYear, containerButton);

  return listContainer;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBOOKList.innerHTML = "";
  const completedBOOKList = document.getElementById("completeBookshelfList");
  completedBOOKList.innerHTML = "";

  for (bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete == true) completedBOOKList.append(bookElement);
    else uncompletedBOOKList.append(bookElement);
  }
});

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookId) {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function undoBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

const cariBuku = document.getElementById("searchBookTitle");
cariBuku.addEventListener("keyup", searchBook);

function searchBook(judul) {
  const cariBuku = judul.target.value.toLowerCase();
  let buku = document.querySelectorAll(".book_item");

  buku.forEach((item) => {
    const judul = item.firstChild.textContent.toLowerCase();
    if (judul.indexOf(cariBuku) != -1) {
      item.setAttribute("style", "display: block;");
    } else {
      item.setAttribute("style", "display: none !important;");
    }
  });
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSELF_APK";

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function dialogBox() {}

const customConfirm = new (function () {
  this.show = function (msg, callback) {
    const dlg = document.getElementById("dialogCont");
    const dlgBody = dlg.querySelector("#dlgBody");
    dlg.style.top = "60%";
    dlg.style.opacity = 1;
    dlgBody.textContent = msg;
    this.callback = callback;
    document.getElementById("backLayer").style.display = "";
  };
})();

function okay() {
  this.callback;
  close();
}

function close() {
  const dlg = document.getElementById("dialogCont");
  dlg.style.top = "-60%";
  dlg.style.opacity = 0;
  document.getElementById("backLayer").style.display = "none";
}
