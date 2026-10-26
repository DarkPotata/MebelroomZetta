import { state } from '../store.js';

export function AdminPanel() {
    return `
        <div class="admin-panel">
            <button id="sortBtn" class="btn-secondary">
                Сортировка по цене (${state.sortOrder === 'asc' ? '↑' : '↓'})
            </button>
            <form id="addCategoryForm" class="inline-form">
                <input type="text" id="catTitle" placeholder="Новая категория" required />
                <button type="submit" class="btn-primary">+ Категория</button>
            </form>
        </div>
        <hr />
    `;
}