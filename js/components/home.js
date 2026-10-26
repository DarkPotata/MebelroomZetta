import { state } from '../store.js';
import { sanitize } from '../utils.js';

export function Home() {
    const categoriesHTML = state.categories.map(cat => `
        <a href="/${cat.id}" data-link class="category-card-landing">
            <h2>${sanitize(cat.title)}</h2>
            <div class="card-divider">◆</div>
            <img src="${cat.image}" alt="${sanitize(cat.title)}">
        </a>
    `).join('');

    return `
        <main>
            <section class="hero">
                <div class="hero-content">
                    <h1>МЕБЕЛЬРУМ<br>ZETTA</h1>
                    <p class="subtitle">Мебель, в которой хочется жить</p>
                    <p class="description">Проекты любой сложности: от классических модульных до авторских с учетом особенностей помещения.</p>
                    <button type="button" class="btn-primary">Рассчитать проект</button>
                </div>
                <div class="hero-image">
                    <img src="/images/hero.avif" alt="Современная кухня ZETTA">
                </div>
            </section>

            <section class="categories-landing">
                ${categoriesHTML}
            </section>

            <section class="projects" id="projects">
                <h2 class="section-title">Наши проекты</h2>
                <div class="section-divider">◆</div>
                <div class="slider-wrapper">
                    <button type="button" class="slider-btn prev" id="prevBtn">&#10094;</button>
                    <div class="slider-container" id="sliderTrack">
                        <div class="slide"><img src="/images/project1.avif" alt="Проект 1"></div>
                        <div class="slide"><img src="/images/project2.avif" alt="Проект 2"></div>
                        <div class="slide"><img src="/images/project3.avif" alt="Проект 3"></div>
                        <div class="slide"><img src="/images/project4.avif" alt="Проект 4"></div>
                    </div>
                    <button type="button" class="slider-btn next" id="nextBtn">&#10095;</button>
                </div>
                <div class="slider-dots" id="sliderDots">
                    <span class="dot active"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </section>

            <section class="advantages">
                <h2 class="section-title">Почему выбирают нас?</h2>
                <div class="section-divider">◆</div>
                
                <div class="accordion">
                    <div class="accordion-item active">
                        <button type="button" class="accordion-header">
                            <div class="accordion-title">
                                <span class="icon">✏️</span>
                                <span>Индивидуальный дизайн</span>
                            </div>
                            <span class="arrow">∨</span>
                        </button>
                        <div class="accordion-content">
                            <p>Создаем уникальные решения с учетом ваших пожеланий и особенностей помещения.</p>
                        </div>
                    </div>

                    <div class="accordion-item">
                        <button type="button" class="accordion-header">
                            <div class="accordion-title">
                                <span class="icon">🛡️</span>
                                <span>Качественные материалы</span>
                            </div>
                            <span class="arrow">∨</span>
                        </button>
                        <div class="accordion-content">
                            <p>Используем только долговечные и экологически безопасные материалы от ведущих фабрик.</p>
                        </div>
                    </div>

                    <div class="accordion-item">
                        <button type="button" class="accordion-header">
                            <div class="accordion-title">
                                <span class="icon">🏭</span>
                                <span>Проверенные фабрики</span>
                            </div>
                            <span class="arrow">∨</span>
                        </button>
                        <div class="accordion-content">
                            <p>Сотрудничаем с современными производствами с многоступенчатым контролем качества.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    `;
}