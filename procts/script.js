// --- Funcionalidad del Menú Hamburguesa (Copiada para autonomía) ---
window.toggleMenu = function (event) {
    event?.stopPropagation();
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.querySelector('.menu-icon');
    sidebar.classList.toggle("active");
    menuIcon.classList.toggle("active");
};

document.addEventListener("click", function (event) {
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.querySelector('.menu-icon');
    if (sidebar && menuIcon && sidebar.classList.contains("active") &&
        !sidebar.contains(event.target) &&
        !menuIcon.contains(event.target)) {
        sidebar.classList.remove("active");
        menuIcon.classList.remove("active");
    }
});

window.addEventListener('resize', function () {
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.querySelector('.menu-icon');
    if (window.innerWidth > 768 && sidebar && menuIcon) {
        sidebar.classList.remove("active");
        menuIcon.classList.remove("active");
    }
});


/**
 * Carga los productos desde el archivo CSV y los convierte en un array de objetos.
 * @returns {Promise<Array<Object>>} Una promesa que se resuelve con el array de productos.
 */
async function loadProductsFromCSV() {
    try {
        // La ruta debe ser relativa a la página HTML que carga el script.
        const response = await fetch('productos.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const products = lines.slice(1).map(line => {
            // La expresión regular anterior era compleja y fallaba.
            // Este método es más simple y robusto para este formato de CSV.
            // Divide la línea por comas, pero maneja las comas dentro de las comillas.
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/"/g, '').trim());

            const product = {};
            headers.forEach((header, index) => {
                product[header] = values[index];
            });
            return product;
        });
        return products;
    } catch (error) {
        console.error("Error al cargar o procesar el archivo CSV:", error);
        return [];
    }
}

/**
 * Inicializa la página de catálogo de productos (filtros y cuadrícula).
 * @param {Array<Object>} products - El array de productos a mostrar.
 */
function initializeProductCatalog(products) {
    const grid = document.getElementById('product-grid');
    const filtersContainer = document.getElementById('product-filters');
    const searchInput = document.getElementById('search-input');
    
    if (!grid || !filtersContainer) return;

    const whatsappNumber = '+584146329982';

    const uniqueCategories = [...new Set(products.map(p => p.category))].sort();
    const categories = ['Todos', ...uniqueCategories];

    filtersContainer.innerHTML = categories.map(cat => 
        `<button class="filter-btn ${cat === 'Todos' ? 'active' : ''}" data-category="${cat}">${cat}</button>`
    ).join('');

    function displayProducts() {
        const categoryFilter = filtersContainer.querySelector('.active').dataset.category;
        const searchTerm = searchInput.value.toLowerCase();

        grid.innerHTML = '';

        // 1. Filtrar por categoría
        const categoryFilteredProducts = categoryFilter === 'Todos' 
            ? products 
            : products.filter(p => p.category === categoryFilter);

        // 2. Filtrar por término de búsqueda
        const filteredProducts = categoryFilteredProducts.filter(p => 
            p.title.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm)
        );

        if (filteredProducts.length === 0) {
            grid.innerHTML = '<p class="no-products-message">No se encontraron productos que coincidan con tu búsqueda.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'project-card product-card'; 
            card.innerHTML = `
                <div class="project-image">
                    <img src="${product.image}" alt="${product.title}" 
                         onerror="this.onerror=null;this.src='placeholder.jpg';">
                    <div class="project-type-badge">${product.category}</div> 
                </div>
                <div class="project-content">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <div class="product-footer">
                        <span class="price">${product.price}</span>
                        <a href="#" class="btn-small btn-whatsapp" data-product-id="${product.id}">
                            <i class="fab fa-whatsapp"></i> Reservar
                        </a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    filtersContainer.addEventListener('click', e => {
        if (e.target.classList.contains('filter-btn')) {
            filtersContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            displayProducts(); // Vuelve a dibujar los productos con el nuevo filtro
        }
    });

    // Listener para la barra de búsqueda
    searchInput.addEventListener('input', displayProducts);

    // Listener para los botones de WhatsApp
    grid.addEventListener('click', e => {
        const button = e.target.closest('.btn-whatsapp');
        if (button) {
            e.preventDefault();
            const productId = button.dataset.productId;
            const product = products.find(p => p.id == productId);

            if (product) {
                const message = `¡Hola! Estoy interesado en el producto: *${product.title}* (Precio: ${product.price}). ¿Podrían darme más información sobre el pago y la entrega?`;
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }
        }
    });

    // Carga inicial de productos
    displayProducts(); 
}

/**
 * Función principal que se ejecuta al cargar la página.
 */
async function main() {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    const products = await loadProductsFromCSV();
    initializeProductCatalog(products);
}

document.addEventListener("DOMContentLoaded", main);
