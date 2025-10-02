document.addEventListener("DOMContentLoaded", function () {
    // Inicializa AOS para las animaciones
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });

    // --- Funcionalidad del Carrusel de Productos Destacados ---
    const carouselInner = document.querySelector('.carousel-inner');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // Solo ejecutar si los elementos del carrusel existen
    if (carouselInner && indicatorsContainer && prevBtn && nextBtn) {
        let currentIndex = 0;
        let projects = [];

        // Cargar productos desde el CSV
        fetch('procts/productos.csv')
            .then(response => response.text())
            .then(csvText => {
                const lines = csvText.trim().split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                projects = lines.slice(1).map(line => {
                    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/"/g, '').trim());
                    const project = {};
                    headers.forEach((header, index) => {
                        project[header] = values[index];
                    });
                    return project;
                }).filter(p => p.destacado && p.destacado.toLowerCase() === 'si'); // Filtrar por la nueva columna 'destacado'

                if (projects.length > 0) {
                    buildCarousel();
                }
            })
            .catch(error => console.error("Error al cargar los productos destacados:", error));

        function buildCarousel() {
            carouselInner.innerHTML = projects.map((project, index) => {
                const imgSrc = `procts/${project.image}`;
                return `
                    <div class="project-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                        <div class="project-image">
                            <img src="${imgSrc}" alt="${project.title}" onerror="this.onerror=null; this.src='procts/images/placeholder.jpg';">
                            <div class="project-type-badge">${project.category}</div>
                        </div>
                        <div class="project-content">
                            <h3>${project.title}</h3>
                            <p>${project.description}</p>
                            <div class="product-footer">
                                <span class="price">${project.price}</span>
                                <a href="procts/productos.html" class="btn-small">Ver Detalles</a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            indicatorsContainer.innerHTML = projects.map((_, index) => 
                `<div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
            ).join('');

            updateCarousel();
        }

        function updateCarousel() {
            const offset = -currentIndex * 100;
            carouselInner.style.transform = `translateX(${offset}%)`;

            document.querySelectorAll('.project-card').forEach(card => card.classList.remove('active'));
            document.querySelector(`.project-card[data-index="${currentIndex}"]`).classList.add('active');

            document.querySelectorAll('.indicator').forEach(ind => ind.classList.remove('active'));
            document.querySelector(`.indicator[data-index="${currentIndex}"]`).classList.add('active');
        }

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % projects.length;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + projects.length) % projects.length;
            updateCarousel();
        });

        indicatorsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('indicator')) {
                currentIndex = parseInt(e.target.dataset.index);
                updateCarousel();
            }
        });
    }

    // --- Botón "Volver Arriba" ---
    const backToTopButton = document.getElementById("backToTop");
    window.onscroll = function () {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    };
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// --- Funcionalidad del Menú Hamburguesa (Global) ---
function toggleMenu(event) {
    event?.stopPropagation();
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.querySelector('.menu-icon');
    sidebar.classList.toggle("active");
    menuIcon.classList.toggle("active"); // Para animar el ícono
}

document.addEventListener("click", function (event) {
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.querySelector('.menu-icon');
    if (sidebar.classList.contains("active") && !sidebar.contains(event.target) && !menuIcon.contains(event.target)) {
        sidebar.classList.remove("active");
        menuIcon.classList.remove("active");
    }
});

window.addEventListener('resize', function () {
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.querySelector('.menu-icon');
    if (window.innerWidth > 768) {
        sidebar.classList.remove("active");
        menuIcon.classList.remove("active");
    }
});
