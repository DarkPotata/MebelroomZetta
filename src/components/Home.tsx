import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types';

interface HomeProps {
    categories: Category[];
}

export default function Home({ categories }: HomeProps) {
    // --- Логика Аккордеона ---
    // Вместо поиска элементов и ручного переключения классов (как было в ванильном JS), 
    // мы просто храним индекс открытой вкладки. React сам перерисует интерфейс при его изменении.
    const [activeAccordion, setActiveAccordion] = useState<number>(0);

    const advantages = [
        { icon: '✏️', title: 'Индивидуальный дизайн', desc: 'Создаем уникальные решения с учетом ваших пожеланий и особенностей помещения.' },
        { icon: '🛡️', title: 'Качественные материалы', desc: 'Используем только долговечные и экологически безопасные материалы от ведущих фабрик.' },
        { icon: '🏭', title: 'Проверенные фабрики', desc: 'Сотрудничаем с современными производствами с многоступенчатым контролем качества.' }
    ];

    // --- Логика Слайдера ---
    // useRef заменяет document.getElementById('sliderTrack'). Он дает прямую ссылку на DOM-узел.
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeDot, setActiveDot] = useState<number>(0);

    const getSlideWidth = () => {
        if (trackRef.current) {
            const slide = trackRef.current.querySelector('.slide') as HTMLElement;
            return slide ? slide.clientWidth + 20 : 0;
        }
        return 0;
    };

    const handleScroll = () => {
        if (trackRef.current) {
            const index = Math.round(trackRef.current.scrollLeft / getSlideWidth());
            setActiveDot(index);
        }
    };

    return (
        <main>
            <section className="hero">
                <div className="hero-content">
                    <h1>МЕБЕЛЬРУМ<br/>ZETTA</h1>
                    <p className="subtitle">Мебель, в которой хочется жить</p>
                    <p className="description">Проекты любой сложности: от классических модульных до авторских с учетом особенностей помещения.</p>
                    <button type="button" className="btn-primary">Рассчитать проект</button>
                </div>
                <div className="hero-image">
                    <img src="/images/hero.avif" alt="Современная кухня ZETTA" />
                </div>
            </section>

            <section className="categories-landing">
                {categories.map(cat => (
                    <Link key={cat.id} to={`/${cat.id}`} className="category-card-landing">
                        <h2>{cat.title}</h2>
                        <div className="card-divider">◆</div>
                        <img src={cat.image} alt={cat.title} />
                    </Link>
                ))}
            </section>

            <section className="projects">
                <h2 className="section-title">Наши проекты</h2>
                <div className="section-divider">◆</div>
                <div className="slider-wrapper">
                    <button type="button" className="slider-btn prev" onClick={() => trackRef.current?.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' })}>&#10094;</button>
                    
                    <div className="slider-container" ref={trackRef} onScroll={handleScroll}>
                        <div className="slide"><img src="/images/project1.avif" alt="Проект 1" /></div>
                        <div className="slide"><img src="/images/project2.avif" alt="Проект 2" /></div>
                        <div className="slide"><img src="/images/project3.avif" alt="Проект 3" /></div>
                        <div className="slide"><img src="/images/project4.avif" alt="Проект 4" /></div>
                    </div>
                    
                    <button type="button" className="slider-btn next" onClick={() => trackRef.current?.scrollBy({ left: getSlideWidth(), behavior: 'smooth' })}>&#10095;</button>
                </div>
                <div className="slider-dots">
                    {[0, 1, 2, 3].map(idx => (
                        <span 
                            key={idx} 
                            className={`dot ${activeDot === idx ? 'active' : ''}`} 
                            onClick={() => trackRef.current?.scrollTo({ left: idx * getSlideWidth(), behavior: 'smooth' })}
                        ></span>
                    ))}
                </div>
            </section>

            <section className="advantages">
                <h2 className="section-title">Почему выбирают нас?</h2>
                <div className="section-divider">◆</div>
                <div className="accordion">
                    {advantages.map((adv, index) => (
                        <div key={index} className={`accordion-item ${activeAccordion === index ? 'active' : ''}`}>
                            <button type="button" className="accordion-header" onClick={() => setActiveAccordion(index)}>
                                <div className="accordion-title">
                                    <span className="icon">{adv.icon}</span>
                                    <span>{adv.title}</span>
                                </div>
                                <span className="arrow">∨</span>
                            </button>
                            <div className="accordion-content">
                                <p>{adv.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}