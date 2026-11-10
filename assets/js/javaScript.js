
const boards = document.getElementById("boards");
const addButton = document.getElementById("addButton");
const modal = document.getElementById("modal");
const closeButton = document.getElementById("closeButton");
const subredditForm = document.getElementById("subredditForm");
const subredditInput = document.getElementById("subredditInput");

let subreddits = JSON.parse(localStorage.getItem("subreddits")) || [
    "learnprogramming",
    "javascript"
];

// Guarda los subreddits
function saveSubreddits() {
    localStorage.setItem("subreddits", JSON.stringify(subreddits));
}

// Crea un carril
function createBoard(subreddit) {
    const board = document.createElement("div");
    board.className = "board";

    const header = document.createElement("div");
    header.className = "board-header";

    const title = document.createElement("h3");
    title.textContent = "/r/" + subreddit;

    const menuButton = document.createElement("button");
    menuButton.className = "menu-button";
    menuButton.textContent = "⋮";

    const menu = document.createElement("div");
    menu.className = "menu";

    const refreshButton = document.createElement("button");
    refreshButton.textContent = "Actualizar";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";

    const postsContainer = document.createElement("div");

    menuButton.addEventListener("click", () => {
        document.querySelectorAll(".menu").forEach(item => {
            if (item !== menu) {
                item.classList.remove("active");
            }
        });

        menu.classList.toggle("active");
    });

    // Actualiza las publicaciones
    refreshButton.addEventListener("click", () => {
        menu.classList.remove("active");
        loadPosts(subreddit, postsContainer);
    });

    // Elimina el carril
    deleteButton.addEventListener("click", () => {
        subreddits = subreddits.filter(item => item !== subreddit);
        saveSubreddits();
        board.remove();
    });

    menu.appendChild(refreshButton);
    menu.appendChild(deleteButton);

    header.appendChild(title);
    header.appendChild(menuButton);
    header.appendChild(menu);

    board.appendChild(header);
    board.appendChild(postsContainer);

    boards.appendChild(board);

    loadPosts(subreddit, postsContainer);
}

// Consulta Reddit
async function loadPosts(subreddit, container) {
    container.innerHTML = '<p class="loading">Cargando publicaciones...</p>';

    try {
        const response = await fetch(
            `https://www.reddit.com/r/${encodeURIComponent(subreddit)}.json?limit=10`
        );

        if (!response.ok) {
            throw new Error("No se pudo encontrar el subreddit");
        }

        const data = await response.json();

        const posts = data.data.children;

        container.innerHTML = "";

        if (posts.length === 0) {
            container.innerHTML = '<p class="empty">No hay publicaciones.</p>';
            return;
        }

        // Muestra las publicaciones
        posts.forEach(item => {
            const post = item.data;

            const postElement = document.createElement("div");
            postElement.className = "post";

            const score = document.createElement("p");
            score.className = "post-score";
            score.textContent = "▲ " + post.score + " votos";

            const title = document.createElement("p");
            title.className = "post-title";

            const link = document.createElement("a");
            link.textContent = post.title;
            link.href = "https://www.reddit.com" + post.permalink;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            const author = document.createElement("p");
            author.className = "post-author";
            author.textContent = "u/" + post.author;

            title.appendChild(link);

            postElement.appendChild(score);
            postElement.appendChild(title);
            postElement.appendChild(author);

            container.appendChild(postElement);
        });

    } catch (error) {
        container.innerHTML =
            '<p class="error">Error al cargar. Verifica el nombre o intenta actualizar.</p>';
    }
}

// Abre la ventana para agregar
addButton.addEventListener("click", () => {
    modal.classList.add("active");
    subredditInput.focus();
});

// Cierra la ventana
closeButton.addEventListener("click", () => {
    modal.classList.remove("active");
    subredditForm.reset();
});

// Agrega un nuevo subreddit
subredditForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = subredditInput.value.trim().replace(/^\/?r\//i, "");

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        alert("Escribe un nombre de subreddit válido.");
        return;
    }

    if (subreddits.includes(name.toLowerCase())) {
        alert("Este subreddit ya existe.");
        return;
    }

    subreddits.push(name.toLowerCase());

    saveSubreddits();

    createBoard(name.toLowerCase());

    modal.classList.remove("active");
    subredditForm.reset();
});

// Carga los carriles guardados
function initializeApp() {
    subreddits.forEach(subreddit => {
        createBoard(subreddit);
    });
}

initializeApp();
