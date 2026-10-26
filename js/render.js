import { state, addCategory, deleteCategory, addProduct, deleteProduct, updateProduct, toggleSort, toggleTheme } from './store.js';
import { Header } from './components/header.js';
import { Footer } from './components/footer.js';
import { Home } from './components/home.js';
import { PageTitle } from './components/pageTitle.js';
import { AdminPanel } from './components/adminPanel.js';
import { Category } from './components/category.js';
import { EmptyMessage } from './components/emptyMessage.js';
import { EditProductModal } from './components/editProductModal.js';
import { matchRoute, navigateTo } from './router.js';

export function render() {
    const app = document.getElementById('app');
    const path = window.location.pathname;

    const routeEdit = matchRoute('/:catId/edit/:prodId', path);
    const routeCategory = matchRoute('/:catId', path);

    let activeCatId = null;
    let activeProdId = null;

    if (routeEdit) {
        activeCatId = routeEdit.catId;
        activeProdId = Number(routeEdit.prodId);
    } else if (routeCategory && path !== '/') {
        activeCatId = routeCategory.catId;
    }

    document.body.classList.toggle('dark-theme', state.theme === 'dark');
    document.body.classList.toggle('light-theme', state.theme === 'light');

    let mainContentHTML = '';
    const isHomePage = path === '/';

    if (isHomePage) {
        mainContentHTML = Home();
    } else {
        const visibleCategories = activeCatId
            ? state.categories.filter(c => c.id === activeCatId)
            : [];
            
        const catalogHTML = visibleCategories.length === 0 
            ? EmptyMessage('Категория не найдена.') 
            : visibleCategories.map(Category).join('');

        mainContentHTML = `
            <main class="catalog-wrapper">
                ${PageTitle('Управление каталогом')}
                ${AdminPanel()}
                ${catalogHTML}
            </main>
        `;
    }

    app.innerHTML = `
        ${Header()}
        ${mainContentHTML}
        ${Footer()}
        <div id="modalRoot"></div>
    `;

    if (activeCatId && activeProdId) {
        openEditModal(activeCatId, activeProdId);
    }

    bindEvents();
    if (isHomePage) bindHomeEvents();
}

function bindHomeEvents() {
    // Аккордеон
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== currentItem) item.classList.remove('active');
            });
            currentItem.classList.toggle('active');
        });
    });

    // Слайдер
    const track = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    
    if(!track || !nextBtn) return;

    function getSlideWidth() {
        const slide = document.querySelector('.slide');
        return slide ? slide.clientWidth + 20 : 0;
    }

    nextBtn.addEventListener('click', () => track.scrollBy({ left: getSlideWidth(), behavior: 'smooth' }));
    prevBtn.addEventListener('click', () => track.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' }));

    track.addEventListener('scroll', () => {
        const index = Math.round(track.scrollLeft / getSlideWidth());
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            track.scrollTo({ left: index * getSlideWidth(), behavior: 'smooth' });
        });
    });
}

// Функции bindEvents, bindModalEvents, openEditModal, closeModal остаются без изменений из предыдущей версии
function openEditModal(catId, prodId) {
    const category = state.categories.find(c => c.id === catId);
    const product = category?.products.find(p => p.id === prodId);
    if (!product) return;

    document.getElementById('modalRoot').innerHTML = EditProductModal(product, catId);
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('hidden');
        bindModalEvents(catId, prodId);
    }
}

function bindEvents() {
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        toggleTheme(); render();    
    });

    document.getElementById('sortBtn')?.addEventListener('click', () => {
        toggleSort(); render();
    });

    document.getElementById('addCategoryForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        addCategory(document.getElementById('catTitle').value);
        render();
    });

    document.querySelectorAll('[data-delete-cat]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Удалить категорию?')) {
                deleteCategory(btn.dataset.deleteCat);
                if (window.location.pathname !== '/') navigateTo('/');
                else render();
            }
        });
    });

    document.querySelectorAll('.addProductForm').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            addProduct(form.dataset.catId, form.querySelector('.prodTitle').value, form.querySelector('.prodPrice').value);
            render();
        });
    });

    document.querySelectorAll('[data-delete-prod]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Удалить товар?')) {
                deleteProduct(btn.dataset.catId, Number(btn.dataset.deleteProd));
                render();
            }
        });
    });

    document.querySelectorAll('[data-edit-prod]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(`/${btn.dataset.catId}/edit/${btn.dataset.editProd}`));
    });
}

function bindModalEvents(categoryId, productId) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editProductForm');
    const closeBtn = document.getElementById('closeModal');
    const backUrl = `/${categoryId}`;

    closeBtn?.addEventListener('click', () => closeModal(backUrl));
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(backUrl); });
    
    const escapeHandler = (e) => {
        if (e.key === 'Escape') { closeModal(backUrl); document.removeEventListener('keydown', escapeHandler); }
    };
    document.addEventListener('keydown', escapeHandler);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTitle = document.getElementById('editTitle').value.trim();
        const newPrice = Number(document.getElementById('editPrice').value);
        const newImg = document.getElementById('editImg').value.trim();
        
        if (!newTitle || isNaN(newPrice) || newPrice < 0) return alert('Ошибка ввода');
        
        updateProduct(categoryId, productId, { title: newTitle, price: newPrice, img: newImg || './images/hero.avif' });
        closeModal(backUrl);
    });
}

function closeModal(redirectUrl) {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.add('hidden');
        setTimeout(() => { document.getElementById('modalRoot').innerHTML = ''; navigateTo(redirectUrl); }, 150);
    }
}