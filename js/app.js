import { render } from './render.js';

// Обработка системных кнопок браузёра «Назад / Вперёд»
window.addEventListener('popstate', render);

// Обработка программного метода navigateTo()
window.addEventListener('locationchange', render);

// Глобальный перехват кликов по всем ссылкам с атрибутом data-link
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[data-link]');
    if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href !== window.location.pathname) {
            window.history.pushState(null, null, href);
            render();
        }
    }
});

window.addEventListener('DOMContentLoaded', render);