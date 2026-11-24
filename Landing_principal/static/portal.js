document.addEventListener('DOMContentLoaded', () => {
    const byId = (id) => document.getElementById(id);

    const clock = byId('realtime-clock');
    const updateClock = () => {
        if (!clock) return;
        clock.textContent = new Intl.DateTimeFormat('es-PE', {
            timeZone: 'America/Lima',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(new Date());
    };
    updateClock();
    window.setInterval(updateClock, 1000);

    const year = byId('current-year');
    if (year) year.textContent = new Date().getFullYear();

    const nav = byId('primary-nav');
    const mobileMenu = byId('mobile-menu');
    if (nav && mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            mobileMenu.setAttribute('aria-expanded', String(open));
        });
    }

    const closeMenus = () => {
        document.querySelectorAll('.dropdown-wrap.open').forEach((menu) => {
            menu.classList.remove('open');
            const button = menu.querySelector('.dropdown-toggle');
            if (button) button.setAttribute('aria-expanded', 'false');
        });
    };
    document.querySelectorAll('.dropdown-toggle').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const parent = button.closest('.dropdown-wrap');
            const wasOpen = parent.classList.contains('open');
            closeMenus();
            if (!wasOpen) {
                parent.classList.add('open');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown-wrap')) closeMenus();
    });

    const videoOverlay = byId('video-modal-overlay');
    const videoClose = byId('video-modal-close');
    const introVideo = byId('intro-video');
    const closeVideo = () => {
        if (!videoOverlay) return;
        videoOverlay.classList.remove('is-visible');
        videoOverlay.hidden = true;
        if (introVideo) introVideo.pause();
    };
    if (videoClose) videoClose.addEventListener('click', closeVideo);
    if (introVideo) introVideo.addEventListener('ended', closeVideo);

    const announcement = byId('announcement');
    const announcementClose = byId('close-announcement');
    if (announcement) {
        announcement.hidden = false;
        announcement.classList.add('is-visible');
        const closeAnnouncement = () => {
            announcement.classList.remove('is-visible');
            announcement.hidden = true;
        };
        if (announcementClose) announcementClose.addEventListener('click', closeAnnouncement);
        announcement.addEventListener('click', (event) => {
            if (event.target === announcement) closeAnnouncement();
        });
    }

    const peopleForm = byId('people-form');
    if (peopleForm) {
        peopleForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = byId('people-query').value.trim();
            if (!query) {
                byId('people-query').focus();
                return;
            }
            window.open(`http://eclaro/SitePages/BusquedaPersonas.aspx?k=${encodeURIComponent(query)}`, '_blank', 'noopener');
        });
    }

    const icons = {
        calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18m-12 5 2 2 4-4"/>',
        key: '<circle cx="8" cy="15" r="5"/><path d="m12 11 9-9m-4 4 3 3m-6 0 3 3"/>',
        'users-settings': '<circle cx="8" cy="8" r="3"/><path d="M2 19v-2a6 6 0 0 1 11-3M17.5 13.5v1.5m0 6v1.5m-5-4.5h1.5m7 0h1.5m-8-3 1 1m5 5 1 1m0-7-1 1m-5 5-1 1"/><circle cx="17.5" cy="18" r="3"/>',
        gear: '<path d="M10 2h4l.6 2.4 2 .9 2.2-1.1 2.8 2.8-1.1 2.2.9 2L24 12l-2.6.8-.9 2 1.1 2.2-2.8 2.8-2.2-1.1-2 .9L14 22h-4l-.6-2.4-2-.9-2.2 1.1-2.8-2.8 1.1-2.2-.9-2L0 12l2.6-.8.9-2-1.1-2.2 2.8-2.8 2.2 1.1 2-.9L10 2Z" transform="translate(2 2) scale(.83)"/><circle cx="12" cy="12" r="3.2"/>',
        network: '<rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/><rect x="8.5" y="15" width="7" height="7" rx="1"/><path d="M9 6.5h6M5.5 10v4h6.5m6.5-4v4h-6.5"/>',
        link: '<path d="M10 13a5 5 0 0 0 7.6.5l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7M14 11a5 5 0 0 0-7.6-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>',
        users: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M1.5 20v-2a6.5 6.5 0 0 1 13 0v2H1.5Zm13.5 0h7v-2a5.5 5.5 0 0 0-5.5-5.5"/>',
        building: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3"/>',
        book: '<path d="M12 5c-3-2-6-2.5-10-2v16c4-.5 7 0 10 2 3-2 6-2.5 10-2V3c-4-.5-7 0-10 2Zm0 0v16"/>',
        shield: '<path d="m12 2 9 4v6c0 5-3 8-9 10-6-2-9-5-9-10V6l9-4Z"/><path d="m9 12 2 2 4-4"/>',
        clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4v-2h6v2M9 13l2 2 4-4"/>',
        document: '<path d="M5 2h10l5 5v15H5V2Zm10 0v5h5"/><path d="M12 10v8m2-6c-2-2-5-1-5 1s5 1 5 3-3 3-5 1"/>',
        tools: '<path d="M14.5 6.2a5 5 0 0 0-6.4 6.4L3 17.5a2.1 2.1 0 0 0 3.5 3L12 15a5 5 0 0 0 6.1-6.5l-3 3-2.6-.7-.7-2.6 2.7-2Z"/><path d="m4 4 4 4M17 17l4 4"/>',
        dollar: '<path d="M12 2v20M17 6c-2-2-8-2.5-10 1-3 6 11 4 10 10-.5 4-8 4.5-11 1"/>',
        'person-shield': '<circle cx="10" cy="7" r="4"/><path d="M3 20v-2a7 7 0 0 1 10-6m5 1 5 2v3c0 2.7-2 4.5-5 5-3-.5-5-2.3-5-5v-3l5-2Z"/>',
    };
    const palette = {
        blue: ['#eaf2ff', '#3668ab'], rose: ['#ffedf0', '#c94670'], violet: ['#f2edff', '#6c55b0'],
        teal: ['#e5f5f1', '#3b938c'], sky: ['#e9f3ff', '#4d82ae'], slate: ['#edf0f4', '#647083'],
    };
    document.querySelectorAll('.quick-card').forEach((card) => {
        const icon = card.querySelector('.quick-icon');
        const colors = palette[card.dataset.color] || palette.slate;
        card.style.setProperty('--icon-bg', colors[0]);
        card.style.setProperty('--icon-ink', colors[1]);
        if (icon && icons[card.dataset.icon]) icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[card.dataset.icon]}</svg>`;
    });

    const carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.slide-image'));
        const dots = byId('slide-dots');
        const counter = byId('slide-counter');
        const title = byId('image-title');
        const prev = byId('prev-slide');
        const next = byId('next-slide');
        const autoplay = byId('autoplay');
        let current = 0;
        let playing = true;
        let timer;

        const render = () => {
            slides.forEach((slide, index) => {
                const active = index === current;
                slide.hidden = !active;
                slide.classList.toggle('is-active', active);
            });
            if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
            if (title && slides[current]) title.textContent = slides[current].dataset.title || slides[current].alt;
            if (dots) {
                dots.replaceChildren();
                slides.forEach((slide, index) => {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'dot';
                    dot.setAttribute('aria-label', `Mostrar imagen ${index + 1}`);
                    dot.setAttribute('aria-current', String(index === current));
                    dot.addEventListener('click', () => { current = index; render(); restart(); });
                    dots.appendChild(dot);
                });
            }
            const disabled = slides.length < 2;
            if (prev) prev.disabled = disabled;
            if (next) next.disabled = disabled;
            if (autoplay) autoplay.disabled = disabled;
        };
        const go = (delta) => {
            if (!slides.length) return;
            current = (current + delta + slides.length) % slides.length;
            render();
        };
        const stop = () => { window.clearInterval(timer); timer = null; };
        const restart = () => {
            stop();
            if (playing && slides.length > 1 && !document.hidden) timer = window.setInterval(() => go(1), 8500);
        };
        if (prev) prev.addEventListener('click', () => { go(-1); restart(); });
        if (next) next.addEventListener('click', () => { go(1); restart(); });
        if (autoplay) autoplay.addEventListener('click', () => {
            playing = !playing;
            autoplay.innerHTML = playing ? 'Pausar <span aria-hidden="true">Ⅱ</span>' : 'Reproducir <span aria-hidden="true">▶</span>';
            autoplay.setAttribute('aria-label', playing ? 'Pausar carrusel' : 'Reproducir carrusel');
            restart();
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', restart);
        document.addEventListener('visibilitychange', restart);

        const lightbox = byId('lightbox');
        const zoomImage = byId('zoom-image');
        const zoomTitle = byId('zoom-title');
        const zoomBody = byId('zoom-body');
        const openZoom = () => {
            if (!lightbox || !slides[current]) return;
            stop();
            zoomImage.src = slides[current].src;
            zoomImage.alt = slides[current].alt;
            zoomTitle.textContent = slides[current].dataset.title || slides[current].alt;
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            zoomBody.classList.remove('zoomed');
        };
        const closeZoom = () => {
            if (!lightbox) return;
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            restart();
        };
        const refreshZoom = () => {
            go(0);
            if (zoomImage && slides[current]) {
                zoomImage.src = slides[current].src;
                zoomTitle.textContent = slides[current].dataset.title || slides[current].alt;
            }
        };
        const expand = byId('expand-image');
        if (expand) expand.addEventListener('click', openZoom);
        slides.forEach((slide) => slide.addEventListener('click', openZoom));
        if (byId('close-zoom')) byId('close-zoom').addEventListener('click', closeZoom);
        if (byId('zoom-prev')) byId('zoom-prev').addEventListener('click', () => { go(-1); refreshZoom(); });
        if (byId('zoom-next')) byId('zoom-next').addEventListener('click', () => { go(1); refreshZoom(); });
        const zoomToggle = byId('zoom-toggle');
        if (zoomToggle) zoomToggle.addEventListener('click', () => {
            const zoomed = zoomBody.classList.toggle('zoomed');
            zoomToggle.textContent = zoomed ? 'Ajustar a la pantalla' : 'Ampliar a 180%';
        });
        if (lightbox) lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeZoom(); });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') { closeZoom(); closeMenus(); }
            if (lightbox && lightbox.classList.contains('open') && event.key === 'ArrowLeft') { go(-1); refreshZoom(); }
            if (lightbox && lightbox.classList.contains('open') && event.key === 'ArrowRight') { go(1); refreshZoom(); }
        });
        if (slides.length) render();
        else if (counter) counter.textContent = '00 / 00';
        restart();
    }

    const chatbotButton = byId('chatbot-button');
    const chatbotContainer = byId('chatbot-container');
    const closeChatbot = byId('close-chatbot');
    if (chatbotButton && chatbotContainer) chatbotButton.addEventListener('click', () => { chatbotContainer.hidden = false; });
    if (closeChatbot && chatbotContainer) closeChatbot.addEventListener('click', () => { chatbotContainer.hidden = true; });
    const chatbotMessage = byId('chatbot-message');
    const closeMessage = byId('chatbot-button_mensaje');
    if (chatbotMessage) window.setTimeout(() => chatbotMessage.classList.add('show'), 500);
    if (closeMessage && chatbotMessage) closeMessage.addEventListener('click', () => chatbotMessage.classList.remove('show'));
});
