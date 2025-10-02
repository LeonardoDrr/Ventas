document.addEventListener("DOMContentLoaded", function () {
    // Inicializa AOS para las animaciones
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });

    // Ejecuta la función principal que carga los datos y construye la página
    main();
});

/**
 * Carga los productos desde el archivo CSV y los convierte en un array de objetos.
 * @returns {Promise<Array<Object>>} Una promesa que se resuelve con el array de productos.
 */
async function loadProductsFromCSV() {
    try {
        const response = await fetch('productos.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const products = lines.slice(1).map(line => {
            const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.replace(/"/g, '').trim());
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
    
    if (!grid || !filtersContainer) return;

    const whatsappNumber = '+584146329982';

    const uniqueCategories = [...new Set(products.map(p => p.category))].sort();
    const categories = ['Todos', ...uniqueCategories];

    filtersContainer.innerHTML = categories.map(cat => 
        `<button class="filter-btn ${cat === 'Todos' ? 'active' : ''}" data-category="${cat}">${cat}</button>`
    ).join('');

    function displayProducts(filter = 'Todos') {
        grid.innerHTML = '';
        const filteredProducts = filter === 'Todos' 
            ? products 
            : products.filter(p => p.category === filter);

        if (filteredProducts.length === 0) {
            grid.innerHTML = '<p>No hay productos en esta categoría.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'project-card product-card'; 
            card.innerHTML = `
                <div class="project-image">
                    <img src="${product.image}" alt="${product.title}" onerror="this.onerror=null; this.src='images/placeholder.jpg';">
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
            const category = e.target.dataset.category;
            displayProducts(category);
        }
    });

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
