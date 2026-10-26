/**
 * Сопоставляет текущий pathname с шаблоном роута вида '/:catId/edit/:prodId'
 */
export function matchRoute(pattern, path) {
    const keys = [];
    const patternRegex = pattern.replace(/:(\w+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
    });

    const match = path.match(new RegExp(`^${patternRegex}$`));
    if (!match) return null;

    const params = {};
    keys.forEach((key, index) => {
        params[key] = decodeURIComponent(match[index + 1]);
    });

    return params;
}

/**
 * Переход по роуту без перезагрузки
 */
export function navigateTo(url) {
    window.history.pushState(null, null, url);
    window.dispatchEvent(new CustomEvent('locationchange'));
}