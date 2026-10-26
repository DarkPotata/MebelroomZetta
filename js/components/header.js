import { state } from '../store.js';
import { sanitize } from '../utils.js';

export function Header() {
    return `
        <header class="header">
            <div class="logo">
                <a href="/" data-link><img src="/images/logo.png" alt="ZETTA мебельрум"></a>
            </div>
            <nav class="nav">
                <a href="/" data-link>Главная</a>
                ${state.categories.map(cat => `<a href="/${cat.id}" data-link>${sanitize(cat.title)}</a>`).join('')}
            </nav>
            <button type="button" class="theme-toggle" id="themeToggle" aria-label="Переключить тему">
                <span>${state.theme === 'dark' ? '☀️' : '☾'}</span>
            </button>
        </header>
    `;
}