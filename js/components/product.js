import { sanitize } from '../utils.js';

export function Product(product, categoryId) {
    // Проверяем, открыто ли сейчас модальное окно (маршрут содержит '/edit/')
    const isEditMode = window.location.pathname.includes('/edit/');

    // В модальном режиме отображаем текстовое имя товара вместо картинки
    const imageOrTitle = isEditMode
        ? `<div class="product-placeholder">${sanitize(product.title)}</div>`
        : `<img src="${product.img}" alt="${sanitize(product.title)}" />`;

    return `
        <div class="product-card">
            ${imageOrTitle}
            <h3>${sanitize(product.title)}</h3>
            <p class="price">${product.price.toLocaleString()} ₽</p>
            
            <div class="product-card-actions">
                <button 
                    class="btn-secondary-sm" 
                    data-edit-prod="${product.id}" 
                    data-cat-id="${categoryId}"
                >
                    ✏️ Редактировать
                </button>
                <button 
                    class="btn-danger-sm" 
                    data-delete-prod="${product.id}" 
                    data-cat-id="${categoryId}"
                >
                    🗑 Удалить
                </button>
            </div>
        </div>
    `;
}