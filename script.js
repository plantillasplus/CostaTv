const favChannels = JSON.parse(localStorage.getItem("favorites")) || [];
document.getElementById("favCount").textContent = favChannels.length;

let itemsToShow = 15; // Controla cuántos items se muestran
let currentPlaying = null; // Almacena el canal en reproducción
let currentCategory = "Todos"; // Categoría seleccionada

function renderItems(filtered = channels) {
    const itemsContainer = document.getElementById("items");
    itemsContainer.innerHTML = "";

    filtered.slice(0, itemsToShow).forEach(channel => {
        const item = document.createElement("div");
        item.className = "item";
        
        // Verifica si el canal está en favoritos
        const isFav = favChannels.some(c => c.name === channel.name);
        const favIcon = document.createElement("i");
        favIcon.className = "favorite";
        favIcon.innerHTML = isFav ? "❤️" : "🤍";
        favIcon.onclick = (e) => {
            e.stopPropagation(); // Evita la reproducción al hacer clic en el icono
            toggleFavorite(channel.name, channel.url, channel.type, favIcon);
        };

        item.innerHTML = `<span>${channel.name}</span> `;
        item.appendChild(favIcon);
        item.onclick = () => playChannel(channel, item);

        // Agregar clase activa si es el canal en reproducción
        if (currentPlaying && currentPlaying.name === channel.name) {
            item.classList.add("active");
        }

        itemsContainer.appendChild(item);
    });

    // Muestra u oculta el botón "Ver más"
    const loadMoreBtn = document.getElementById("loadMore");
    if (filtered.length > itemsToShow) {
        loadMoreBtn.classList.remove("hiddenn");
        loadMoreBtn.innerHTML = "Ver más";
    } else {
        loadMoreBtn.classList.add("hiddenn");
    }

    // Ocultar mensaje si hay resultados, mostrarlo si no hay
    document.getElementById("noResults").classList.toggle("hidden", filtered.length > 0);
}

function playChannel(channel, clickedItem = null) {
    const playerContainer = document.getElementById("player");
    
    if (channel.type === "m3u8") {
        playerContainer.innerHTML = '<div id="video"></div>';
        new Clappr.Player({ source: channel.url, parentId: "#video", autoPlay: true });
    } else {
        playerContainer.innerHTML = `<iframe src="${channel.url}" width="100%" height="300px"></iframe>`;
    }
    
    // Remueve la clase activa del item previamente seleccionado
    document.querySelectorAll(".item").forEach(item => item.classList.remove("active"));

    // Si el canal proviene de la lista principal, marcarlo como activo
    if (clickedItem) {
        clickedItem.classList.add("active");
    } else {
        // Si se selecciona desde favoritos, buscarlo en la lista principal y marcarlo
        document.querySelectorAll(".item").forEach(item => {
            if (item.textContent.trim().startsWith(channel.name)) {
                item.classList.add("active");
            }
        });
    }

    currentPlaying = channel;

    closePopup(); // Cierra el popup si se reproduce un canal desde favoritos
}

// Modificación: Se activa el primer item al presionar play
document.getElementById("playFirst").addEventListener("click", () => {
    const firstItem = document.querySelector(".item");
    if (firstItem) {
        playChannel(channels[0], firstItem);
    }
});

document.getElementById("search").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const filtered = channels.filter(c => c.name.toLowerCase().includes(query));
    itemsToShow = 15; // Reiniciar el contador de items visibles
    renderItems(filtered);
});

function toggleFavorite(name, url, type, favIcon) {
    const index = favChannels.findIndex(c => c.name === name);
    if (index > -1) {
        favChannels.splice(index, 1);
        favIcon.innerHTML = "🤍";
    } else {
        favChannels.push({ name, url, type });
        favIcon.innerHTML = "❤️";
    }
    localStorage.setItem("favorites", JSON.stringify(favChannels));
    document.getElementById("favCount").textContent = favChannels.length;
}

document.getElementById("favBtn").addEventListener("click", function () {
    const favPopup = document.getElementById("favPopup");
    const favList = document.getElementById("favList");
    favList.innerHTML = favChannels.length
        ? favChannels.map(c => `<button onclick="playChannel({name: '${c.name}', url: '${c.url}', type: '${c.type}'})"><span>${c.name}</span><i> &#9654;</i> </button>`).join("")
        : "No tienes favoritos guardados.";
    document.getElementById("overlay").classList.add("active");
    favPopup.classList.add("show");
});

function closePopup() {
    document.getElementById("favPopup").classList.remove("show");
    document.getElementById("overlay").classList.remove("active");
}

document.getElementById("overlay").addEventListener("click", function (e) {
    if (e.target.id === "overlay") {
        closePopup();
    }
});

function generateCategories() {
    const categoriesContainer = document.getElementById("categories");
    const categories = ["Todos", ...new Set(channels.map(c => c.category))];

    categoriesContainer.innerHTML = categories.map(cat => 
        `<div class="category ${cat === "Todos" ? "active" : ""}" onclick="filterByCategory('${cat}', this)">${cat}</div>`
    ).join("");
}

function filterByCategory(category, element) {
    itemsToShow = 10; // Reinicia la cantidad de items visibles
    currentCategory = category;
    
    // Resaltar la categoría activa
    document.querySelectorAll(".category").forEach(cat => cat.classList.remove("active"));
    element.classList.add("active");

    if (category === "Todos") {
        renderItems(channels);
    } else {
        renderItems(channels.filter(c => c.category === category));
    }
}

// Función para cargar más items dentro de la búsqueda o categoría seleccionada
function loadMore() {
    itemsToShow += 15;
    
    let filtered = channels;
    const query = document.getElementById("search").value.toLowerCase();
    
    if (query) {
        filtered = channels.filter(c => c.name.toLowerCase().includes(query));
    } else if (currentCategory !== "Todos") {
        filtered = channels.filter(c => c.category === currentCategory);
    }

    renderItems(filtered);
}

// Generar categorías al inicio
generateCategories();
renderItems();
