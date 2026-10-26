// Защита от XSS-инъекций (санитайзер)
export function sanitize(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str; // Используем textContent для безопасности
    return div.innerHTML;
}

// Генератор уникальных ID
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}