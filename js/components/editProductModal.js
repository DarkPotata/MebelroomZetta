import { sanitize } from '../utils.js';

/**
 * Модальное окно редактирования товара.
 * @param {Object} product — товар, который редактируем
 * @param {string} categoryId — ID категории
 */
export function EditProductModal(product, categoryId) {
    if (!product) return ''; // На всякий случай

    return `
        <div id="editModal" class="modal hidden">
            <div class="modal-content">
                <h3>Редактировать товар</h3>
                
                <form id="editProductForm" data-cat-id="${categoryId}" data-prod-id="${product.id}">
                    <label>
                        Название
                        <input 
                            type="text" 
                            id="editTitle" 
                            value="${sanitize(product.title)}" 
                            required 
                        />
                    </label>

                    <label>
                        Цена (₽)
                        <input 
                            type="number" 
                            id="editPrice" 
                            value="${product.price}" 
                            required 
                        />
                    </label>

                    <label>
                        URL картинки
                        <input 
                            type="text" 
                            id="editImg" 
                            value="${product.img}" 
                        />
                    </label>

                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Сохранить</button>
                        <button type="button" id="closeModal" class="btn-secondary">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}