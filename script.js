document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ ---
    const themeBtn = document.getElementById('themeButton');
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
    });

    // --- 2. АККОРДЕОН ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            
            // Закрываем остальные вкладки
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== currentItem) {
                    item.classList.remove('active');
                }
            });

            // Переключаем текущую
            currentItem.classList.toggle('active');
        });
    });

    // --- 3. СЛАЙДЕР С ПОДДЕРЖКОЙ СВАЙПОВ ---
    const track = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');

    let scrollAmount = 0;

    function getSlideWidth() {
        const slide = document.querySelector('.slide');
        return slide.clientWidth + 20; // ширина слайда + gap
    }

    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' });
    });

    // Логика переключения активных точек при скролле
    track.addEventListener('scroll', () => {
        const index = Math.round(track.scrollLeft / getSlideWidth());
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    });

    // Поддержка клика по точкам
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            track.scrollTo({
                left: index * getSlideWidth(),
                behavior: 'smooth'
            });
        });
    });
});