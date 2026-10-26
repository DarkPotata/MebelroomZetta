import { generateId } from './utils.js';

// Ключи localStorage
const KEY_THEME = 'zetta:theme';
const KEY_SORT = 'zetta:sortOrder';
const KEY_CATEGORIES = 'zetta:categories';

// Старый ключ — для миграции
const LEGACY_KEY = 'zetta_store_data';

const defaultCategories = [
    {
        id: 'kitchens',
        title: 'Кухни',
        image: '/images/kitchen.avif',
        products: [
            { id: 101, title: 'Кухня «Модерн»', price: 120000, img: '/images/kitchen.avif' },
            { id: 102, title: 'Кухня «Сканди»', price: 85000, img: '/images/project1.avif' }
        ]
    },
    {
        id: 'wardrobes',
        title: 'Шкафы',
        image: '/images/wardrobe.avif',
        products: [
            { id: 201, title: 'Шкаф-купе «Лофт»', price: 45000, img: '/images/wardrobe.avif' },
            { id: 202, title: 'Шкаф «Классика»', price: 52000, img: '/images/project2.avif' }
        ]
    },
    {
        id: 'dressing',
        title: 'Гардеробные',
        image: '/images/dressing.avif',
        products: [
            { id: 301, title: 'Гардеробная «Премиум»', price: 95000, img: '/images/dressing.avif' },
            { id: 302, title: 'Гардеробная «Компакт»', price: 68000, img: '/images/project3.avif' }
        ]
    }
];

// --- Чтение по частям ---
function loadTheme() {
    return localStorage.getItem(KEY_THEME) || 'light';
}

function loadSort() {
    return localStorage.getItem(KEY_SORT) || 'asc';
}

function loadCategories() {
    const raw = localStorage.getItem(KEY_CATEGORIES);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Ошибка парсинга категорий', e);
        }
    }
    return defaultCategories;
}

// --- Миграция со старого формата ---
function migrateLegacy() {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;

    try {
        const parsed = JSON.parse(legacy);

        // Если новых ключей ещё нет — переносим данные из старого
        if (!localStorage.getItem(KEY_THEME) && parsed.theme) {
            localStorage.setItem(KEY_THEME, parsed.theme);
        }
        if (!localStorage.getItem(KEY_SORT) && parsed.sortOrder) {
            localStorage.setItem(KEY_SORT, parsed.sortOrder);
        }
        if (!localStorage.getItem(KEY_CATEGORIES) && parsed.categories) {
            localStorage.setItem(KEY_CATEGORIES, JSON.stringify(parsed.categories));
        }
    } catch (e) {
        console.error('Ошибка миграции старого localStorage', e);
    }

    // Удаляем старый ключ
    localStorage.removeItem(LEGACY_KEY);
}

migrateLegacy();

// --- Инициализация состояния ---
export const state = {
    theme: loadTheme(),
    sortOrder: loadSort(),
    categories: loadCategories()
};

// --- Сохранение по частям ---
function saveTheme() {
    localStorage.setItem(KEY_THEME, state.theme);
}

function saveSort() {
    localStorage.setItem(KEY_SORT, state.sortOrder);
}

function saveCategories() {
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(state.categories));
}

// --- Мутации ---
export function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveTheme();
}

export function toggleSort() {
    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    saveSort();
}

export function addCategory(title) {
    state.categories.push({
        id: generateId('cat'),
        title: title,
        image: '/images/logo.png',
        products: []
    });
    saveCategories();
}

export function deleteCategory(categoryId) {
    state.categories = state.categories.filter(cat => cat.id !== categoryId);
    saveCategories();
}

export function addProduct(categoryId, title, price) {
    const category = state.categories.find(cat => cat.id === categoryId);
    if (!category) return;

    category.products.push({
        id: Date.now(),
        title: title,
        price: Number(price),
        img: '/images/hero.avif'
    });
    saveCategories();
}

export function deleteProduct(categoryId, productId) {
    const category = state.categories.find(cat => cat.id === categoryId);
    if (!category) return;

    category.products = category.products.filter(p => p.id !== productId);
    saveCategories();
}

export function updateProduct(categoryId, productId, updates) {
    const category = state.categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const product = category.products.find(p => p.id === productId);
    if (!product) return;

    Object.assign(product, updates);
    saveCategories();
}