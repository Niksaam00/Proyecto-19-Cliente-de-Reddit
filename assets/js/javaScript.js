
const API = "https://jsonplaceholder.typicode.com/users/";

const lanesContainer = document.getElementById("lanes");
const addButton = document.getElementById("addLane");
const modal = document.getElementById("modal");
const formulario = document.getElementById("formulario");
const inputUsuario = document.getElementById("numeroUsuario");
const mensajeError = document.getElementById("mensajeError");
const cancelar = document.getElementById("cancelar");

const STORAGE_KEY = "carriles-usuarios";

// Recuperamos los carriles guardados
function getLanes() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === null) {
            return [
                { userId: 1 },
                { userId: 2 }
            ];
        }

        const data = JSON.parse(saved);

        if (!Array.isArray(data)) {
            return [];
        }

        return data.filter(lane =>
            Number.isInteger(lane.userId) &&
            lane.userId >= 1 &&
            lane.userId <= 10
        );

    } catch (error) {
        return [];
    }
}

let lanes = getLanes();

// Guardamos los carriles
function saveLanes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lanes));
}

// Consultamos un usuario en la API
async function getUser(userId) {
    let response;

    try {
        response = await fetch(API + userId);
    } catch (error) {
        throw new Error("No se pudo conectar con la API.");
    }

    if (response.status === 404) {
        throw new Error("El usuario no existe.");
    }

    if (!response.ok) {
        throw new Error("Error del servidor: " + response.status);
    }

    return await response.json();
}

// Mostramos mensajes de carga o error
function showMessage(card, message, isError = false) {
    card.innerHTML = "";

    const paragraph = document.createElement("p");
    paragraph.className = "status";

    if (isError) {
        paragraph.classList.add("error");
    }

    paragraph.textContent = message;
    card.appendChild(paragraph);
}

// Creamos una fila para mostrar los datos
function createRow(label, value) {
    const row = document.createElement("div");
    row.className = "dato";

    const title = document.createElement("div");
    title.className = "etiqueta";
    title.textContent = label;

    const text = document.createElement("div");
    text.className = "valor";
    text.textContent = value;

    row.append(title, text);

    return row;
}

// Mostramos la información del usuario
function showUser(card, user) {
    card.innerHTML = "";

    card.append(
        createRow("Nombre", user.name),
        createRow("Usuario", "@" + user.username),
        createRow("Correo", user.email),
        createRow("Teléfono", user.phone),
        createRow("Ciudad", user.address.city),
        createRow("Empresa", user.company.name),
        createRow("Sitio web", user.website)
    );
}

// Cargamos o actualizamos los datos
async function loadUser(userId, card) {
    showMessage(card, "Cargando datos...");

    try {
        const user = await getUser(userId);
        showUser(card, user);
    } catch (error) {
        showMessage(card, error.message, true);
    }
}

// Creamos un carril
function createLane(userId) {
    const lane = document.createElement("div");
    lane.className = "lane";

    const header = document.createElement("div");
    header.className = "lane-header";

    const title = document.createElement("h2");
    title.textContent = "Usuario " + userId;

    const menuButton = document.createElement("button");
    menuButton.className = "menu-button";
    menuButton.textContent = "⋮";

    const menu = document.createElement("div");
    menu.className = "menu hidden";

    const refreshButton = document.createElement("button");
    refreshButton.textContent = "Refresh";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    menu.append(refreshButton, deleteButton);
    header.append(title, menuButton, menu);

    const card = document.createElement("div");
    card.className = "user-card";

    lane.append(header, card);
    lanesContainer.appendChild(lane);

    // Abrimos o cerramos el menú
    menuButton.addEventListener("click", () => {
        menu.classList.toggle("hidden");
    });

    // Actualizamos el usuario
    refreshButton.addEventListener("click", () => {
        menu.classList.add("hidden");
        loadUser(userId, card);
    });

    // Eliminamos el carril
    deleteButton.addEventListener("click", () => {
        lanes = lanes.filter(item => item.userId !== userId);

        saveLanes();
        renderLanes();
    });

    // Cargamos los datos del usuario
    loadUser(userId, card);
}

// Dibujamos todos los carriles
function renderLanes() {
    lanesContainer.innerHTML = "";

    lanes.forEach(lane => {
        createLane(lane.userId);
    });
}

// Abrimos la ventana para agregar usuarios
function openModal() {
    modal.classList.remove("hidden");
    inputUsuario.value = "";
    mensajeError.textContent = "";
    inputUsuario.focus();
}

// Cerramos la ventana
function closeModal() {
    modal.classList.add("hidden");
}

// Agregamos un nuevo usuario
async function addLane(event) {
    event.preventDefault();

    const userId = Number(inputUsuario.value);

    // Validamos el número
    if (!Number.isInteger(userId) || userId < 1 || userId > 10) {
        mensajeError.textContent = "Escribe un número del 1 al 10.";
        return;
    }

    // Comprobamos que no esté repetido
    if (lanes.some(lane => lane.userId === userId)) {
        mensajeError.textContent = "Este usuario ya está agregado.";
        return;
    }

    const submitButton = formulario.querySelector(".submit-button");

    submitButton.disabled = true;
    mensajeError.textContent = "Buscando usuario...";

    try {
        // Verificamos que el usuario exista
        await getUser(userId);

        // Guardamos el nuevo carril
        lanes.push({ userId: userId });

        saveLanes();
        renderLanes();

        closeModal();

    } catch (error) {
        mensajeError.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
}

// Conectamos los botones
addButton.addEventListener("click", openModal);
cancelar.addEventListener("click", closeModal);
formulario.addEventListener("submit", addLane);

// Cerramos el popup al hacer clic fuera
modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});

// Iniciamos la aplicación
renderLanes();
