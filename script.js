const bookList = document.getElementById("bookList");
const isbnInput = document.getElementById("isbnInput");

isbnInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const isbn = isbnInput.value.trim();
    if (isbn) {
      fetchBookData(isbn);
      isbnInput.value = "";
    }
  }
});

async function fetchBookData(isbn) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.totalItems > 0) {
      const book = data.items[0].volumeInfo;
      const title = book.title || "Unbekannt";
      const author = book.authors ? book.authors.join(", ") : "Unbekannt";
      const cover = book.imageLinks ? book.imageLinks.thumbnail : "";

      updateBookList(isbn, title, author, cover);
    } else {
      alert("Buch nicht gefunden");
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
  }
}

function updateBookList(isbn, title, author, cover) {
  let rows = bookList.getElementsByTagName("tr");

  for (let row of rows) {
    if (row.dataset.isbn === isbn) {
      // Buch existiert → Anzahl erhöhen
      let countCell = row.cells[4];
      countCell.textContent = parseInt(countCell.textContent) + 1;
      return;
    }
  }

  // Buch existiert nicht → Neues Buch hinzufügen
  const newRow = bookList.insertRow();
  newRow.dataset.isbn = isbn;

  newRow.innerHTML = `
    <td><img src="${cover}" alt="Cover"></td>
    <td>${isbn}</td>
    <td>${title}</td>
    <td>${author}</td>
    <td>1</td>
  `;

  saveData();
}

function saveData() {
  const rows = bookList.getElementsByTagName("tr");
  let books = [];

  for (let row of rows) {
    books.push({
      isbn: row.dataset.isbn,
      title: row.cells[2].textContent,
      author: row.cells[3].textContent,
      cover: row.cells[0].querySelector("img")?.src || "",
      count: row.cells[4].textContent,
    });
  }

  localStorage.setItem("bookInventory", JSON.stringify(books));
}

function loadData() {
  const books = JSON.parse(localStorage.getItem("bookInventory")) || [];
  books.forEach((book) => {
    const newRow = bookList.insertRow();
    newRow.dataset.isbn = book.isbn;

    newRow.innerHTML = `
      <td><img src="${book.cover}" alt="Cover"></td>
      <td>${book.isbn}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.count}</td>
    `;
  });
}

window.onload = loadData;
