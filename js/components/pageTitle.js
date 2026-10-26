// js/components/pageTitle.js
export function PageTitle(text) {
    return `
        <h1 class="page-title">
            <a href="/" data-link style="text-decoration: none; color: inherit;">${text}</a>
        </h1>
    `;
}