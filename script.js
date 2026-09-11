document.addEventListener('DOMContentLoaded', () => {

    // ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
    const themeBtn = document.getElementById('themeButton');
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
    });

    // АККОРДЕОН
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== currentItem) item.classList.remove('active');
            });
            currentItem.classList.toggle('active');
        });
    });

    // СЛАЙДЕР
    const track = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    const originalSlides = Array.from(track.querySelectorAll('.slide'));
    const total = originalSlides.length;

    // 1. Клоны для бесконечности
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone  = originalSlides[total - 1].cloneNode(true);

    track.appendChild(firstClone);                    // [1] [2] [3] [4] [clone(1)]
    track.insertBefore(lastClone, track.firstChild);  // [clone(4)] [1] [2] [3] [4] [clone(1)]

    // Итог: 6 слайдов. Индекс 1 = настоящий первый.
    const allSlides = track.querySelectorAll('.slide');

    let currentIndex = 1;        // стартуем на настоящем первом
    let isAnimating = false;     // защита от быстрых кликов

    // Ширина слайда + gap
    function getSlideWidth() {
        const gap = parseFloat(getComputedStyle(track).gap) || 20;
        return allSlides[0].getBoundingClientRect().width + gap;
    }

    // Прокрутка так, чтобы слайд с индексом i оказался ПО ЦЕНТРУ
    function scrollToIndex(index, smooth = true) {
        const width = getSlideWidth();
        const containerWidth = track.clientWidth;

        // центр слайда минус центр контейнера
        const offset = index * width + (width - 20) / 2 - containerWidth / 2;

        track.scrollTo({
            left: offset,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }

    // Стартовая позиция (после загрузки картинок, чтобы ширина была правильной)
    window.addEventListener('load', () => {
        scrollToIndex(currentIndex, false);
    });

    // Универсальная функция перехода
    function goNext() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex++;
        scrollToIndex(currentIndex, true);
        setTimeout(() => {
            // Если дошли до клона первого (последний в ленте) — телепорт на настоящий первый
            if (currentIndex >= allSlides.length - 1) {
                currentIndex = 1;
                scrollToIndex(currentIndex, false);
            }
            isAnimating = false;
        }, 450); // чуть дольше, чем длительность smooth
    }

    function goPrev() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex--;
        scrollToIndex(currentIndex, true);
        setTimeout(() => {
            // Если дошли до клона последнего (первый в ленте) — телепорт на настоящий последний
            if (currentIndex <= 0) {
                currentIndex = allSlides.length - 2;
                scrollToIndex(currentIndex, false);
            }
            isAnimating = false;
        }, 450);
    }

    nextBtn.addEventListener('click', goNext);
    prevBtn.addEventListener('click', goPrev);
});