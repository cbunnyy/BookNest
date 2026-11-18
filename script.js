
const API_URL = "https://openlibrary.org/search.json";

const bookGrid = document.getElementById("bookGrid");
const favoriteGrid = document.getElementById("favoriteGrid");
const searchInput = document.getElementById("searchInput");
const bookCount = document.getElementById("bookCount");
const noResults = document.getElementById("noResults");
const emptyFavorites = document.getElementById("emptyFavorites");

const categoryButtons = document.querySelectorAll(".category-btn");

let favorites = JSON.parse(
    localStorage.getItem("bookFavorites")
) || [];

let selectedCategory = "All";
let searchTimer;


// 1. SEARCH BOOKS FROM OPEN LIBRARY

async function searchBooks(query = "popular books") {

    bookGrid.innerHTML = "<p>Loading books...</p>";
    noResults.hidden = true;

    try {

        const params = new URLSearchParams({
            q: query,
            fields: "key,title,author_name,first_publish_year,cover_i,subject",
            limit: "24"
        });

        const response = await fetch(
            `${API_URL}?${params}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch books");
        }

        const data = await response.json();

        displayBooks(data.docs || []);

    } catch (error) {

        bookGrid.innerHTML =
            "<p>Something went wrong. Please try again.</p>";

        console.error(error);

    }
}


// 2. DISPLAY BOOKS

function displayBooks(books) {

    bookGrid.innerHTML = "";

    bookCount.textContent = books.length + " books";

    noResults.hidden = books.length !== 0;

    books.forEach(book => {

        const card = createBookCard(book);

        bookGrid.appendChild(card);

    });

}


// 3. CREATE BOOK CARDS

function createBookCard(book) {

    const card = document.createElement("div");
    card.className = "book-card";

    const cover = document.createElement("img");
    cover.className = "book-cover";

    if (book.cover_i) {

        cover.src =
            `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;

    } else {

        cover.style.display = "none";

    }

    cover.alt = book.title + " book cover";

    const info = document.createElement("div");
    info.className = "book-info";

    const title = document.createElement("h3");
    title.textContent = book.title || "Untitled";

    const author = document.createElement("p");

    author.textContent =
        "By " + (book.author_name?.join(", ") || "Unknown author");

    const year = document.createElement("p");

    year.textContent =
        book.first_publish_year
            ? "First published: " + book.first_publish_year
            : "Publication year unavailable";

    const category = document.createElement("span");

    category.className = "book-category";

    category.textContent =
        selectedCategory === "All"
            ? (book.subject?.[0] || "Book")
            : selectedCategory;

    const button = document.createElement("button");

    button.className = "favorite-btn";

    const isFavorite = favorites.some(
        item => item.key === book.key
    );

    button.textContent = isFavorite
        ? "♥ Remove Favorite"
        : "♡ Add to Favorites";

    button.addEventListener("click", () => {

        toggleFavorite(book, button);

    });

    info.append(title, author, year, category, button);

    card.append(cover, info);

    return card;
}


// 4. SAVE FAVORITES

function saveFavorites() {

    localStorage.setItem(
        "bookFavorites",
        JSON.stringify(favorites)
    );

}


// 5. ADD OR REMOVE FAVORITES

function toggleFavorite(book, button) {

    const exists = favorites.some(
        item => item.key === book.key
    );

    if (exists) {

        favorites = favorites.filter(
            item => item.key !== book.key
        );

        button.textContent = "♡ Add to Favorites";

    } else {

        favorites.push(book);

        button.textContent = "♥ Remove Favorite";

    }

    saveFavorites();
    renderFavorites();

}


// 6. DISPLAY FAVORITES

function renderFavorites() {

    favoriteGrid.innerHTML = "";

    emptyFavorites.hidden = favorites.length !== 0;

    favorites.forEach(book => {

        const card = createBookCard(book);

        favoriteGrid.appendChild(card);

    });

}


// 7. SEARCH INPUT

searchInput.addEventListener("input", () => {

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {

        const query = searchInput.value.trim();

        if (query.length >= 2) {

            searchBooks(query);

        } else if (query.length === 0) {

            searchBooks("popular books");

        }

    }, 500);

});


// 8. CATEGORY FILTERS

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        if (selectedCategory === "All") {

            searchBooks("popular books");

        } else {

            searchBooks(
                `subject:${selectedCategory.toLowerCase()}`
            );

        }

    });

});


// 9. START BOOKNEST

renderFavorites();

searchBooks("popular books");
