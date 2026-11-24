


document.addEventListener("DOMContentLoaded", () => {
    const announcement = document.getElementById('announcement');
    const closeAnnouncementBtn = document.getElementById('close-announcement');
    const announcementImage = document.getElementById('announcement-image');

    // // Verificar si el anuncio ya fue mostrado
    // const announcementSeen = localStorage.getItem("announcementSeen");

    // if (!announcementSeen) {
        if (announcement) {
            // Mostrar el anuncio automáticamente al cargar la página
            announcement.style.display = 'flex';

            // Ocultar el anuncio al hacer clic en cualquier parte de la pantalla
            document.addEventListener('click', (event) => {
                if (!announcement.contains(event.target)) {
                    announcement.style.display = 'none';
                    localStorage.setItem("announcementSeen", "true"); // Guardar que se mostró
                }
            });

            // Evitar que el clic en el anuncio cierre el contenido
            announcement.addEventListener('click', (event) => {
                event.stopPropagation(); // Evitar propagación al documento
            });

            // Ocultar el anuncio al hacer clic en el botón de cierre
            if (closeAnnouncementBtn) {
                closeAnnouncementBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    announcement.style.display = 'none';
                    localStorage.setItem("announcementSeen", "true"); // Guardar que se mostró
                });
            }

            // Abrir la imagen en una nueva pestaña al hacer clic
            if (announcementImage) {
                announcementImage.addEventListener('click', (event) => {
                    event.stopPropagation();
                    window.open(announcementImage.src, '_blank'); // Abrir en una nueva pestaña
                });
            }
        
    }
});








//funcionalidad para el carrusel

document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector(".carousel");
    const images = document.querySelectorAll(".carousel img");
    const indicators = document.querySelectorAll(".indicator");
    let currentIndex = 0;

    if (carousel && images.length > 0) {
        // Función para mostrar la siguiente imagen
        function showNextImage() {
            // Quitar la clase "active" de la imagen e indicador actuales
            images[currentIndex].classList.remove("active");
            indicators[currentIndex].classList.remove("active");

            // Actualizar el índice a la siguiente imagen
            currentIndex = (currentIndex + 1) % images.length;

            // Agregar la clase "active" a la nueva imagen e indicador
            images[currentIndex].classList.add("active");
            indicators[currentIndex].classList.add("active");
        }

        // Función para mostrar una imagen específica al hacer clic en un punto
        function goToImage(index) {
            // Quitar la clase "active" de la imagen e indicador actuales
            images[currentIndex].classList.remove("active");
            indicators[currentIndex].classList.remove("active");

            // Actualizar el índice actual al nuevo índice
            currentIndex = index;

            // Agregar la clase "active" a la nueva imagen e indicador
            images[currentIndex].classList.add("active");
            indicators[currentIndex].classList.add("active");
        }

        // Añadir eventos de clic a cada indicador
        indicators.forEach((indicator, index) => {
            indicator.addEventListener("click", () => {
                goToImage(index);
            });
        });

        // Navegación automática cada 5 segundos
        setInterval(showNextImage, 100000);
    }
});



//FUNCIONALIDAD PARA BOOT 
document.addEventListener('DOMContentLoaded', () => {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbot = document.getElementById('close-chatbot');

    // Mostrar el chatbot al hacer clic en el botón flotante
    chatbotButton.addEventListener('click', () => {
        chatbotContainer.classList.add('show');
        chatbotContainer.classList.remove('hidden');
    });

    // Ocultar el chatbot al hacer clic en el botón de cerrar
    closeChatbot.addEventListener('click', () => {
        chatbotContainer.classList.remove('show');
        chatbotContainer.classList.add('hidden');
    });
});



document.addEventListener("DOMContentLoaded", function () {
    const message = document.getElementById("chatbot-message");
    const chatbotButton = document.getElementById("chatbot-button_mensaje");

 
        // Mostrar el mensaje
        message.classList.add("show");
        
        chatbotButton.addEventListener("click", () => {
            message.classList.remove("show");
            localStorage.setItem("chatbotMessageSeen", "true");
        });
    
});












//ACTUALIZAR RELOJ DE LAS TENDENCIAS
// Script para mostrar la hora en tiempo real
function updateClock() {
    const clock = document.getElementById('realtime-clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000); // Actualizar cada segundo
document.addEventListener('DOMContentLoaded', updateClock);
