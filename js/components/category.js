import { state } from '../store.js';
import { sanitize } from '../utils.js';
import { Product } from './product.js';

export function Category(category) {
    const sortedProducts = [...category.products].sort((a, b) => {
        return state.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

    const productsHTML = sortedProducts.length > 0
        ? sortedProducts.map(p => Product(p, category.id)).join('')
        : '<p class="empty-msg">В этой категории пока нет товаров.</p>';

    return `
        <section class="category-block">
            <div class="category-header">
                <h2><a href="/${category.id}" data-link>${sanitize(category.title)}</a></h2>
                <button class="btn-danger" data-delete-cat="${category.id}">
                    Удалить категорию (Каскадно)
                </button>
            </div>

            <div class="products-grid">
                ${productsHTML}
            </div>

            <form class="addProductForm inline-form" data-cat-id="${category.id}">
                <input type="text" class="prodTitle" placeholder="Название товара" required />
                <input type="number" class="prodPrice" placeholder="Цена" required />
                <button type="submit" class="btn-primary">+ Добавить товар</button>
            </form>
        </section>
    `;
}