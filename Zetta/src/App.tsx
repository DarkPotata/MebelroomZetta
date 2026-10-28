import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { Category } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Catalog from './components/Catalog';
import Auth from './components/Auth';

export default function App() {
    // 1. При запуске сначала ищем данные в памяти браузера
    const [categories, setCategories] = useState<Category[]>(() => {
        const saved = localStorage.getItem('zetta:data');
        return saved ? JSON.parse(saved) : [];
    });
    const [theme, setTheme] = useState(localStorage.getItem('zetta:theme') || 'light');

    // 2. Если память пуста (самый первый заход), качаем по сети из Mock-API
    useEffect(() => {
        if (categories.length === 0) {
            fetch('https://api.npoint.io/a178263d3500a77aaff2')
                .then(res => res.json())
                .then(data => {
                    setCategories(data);
                    localStorage.setItem('zetta:data', JSON.stringify(data));
                })
                .catch(err => console.error('Ошибка загрузки:', err));
        }
    }, []);

    // 3. Автоматически сохраняем любые изменения товаров и категорий в память
    useEffect(() => {
        if (categories.length > 0) {
            localStorage.setItem('zetta:data', JSON.stringify(categories));
        }
    }, [categories]);

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
        localStorage.setItem('zetta:theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return (
        <BrowserRouter>
            <Header categories={categories} theme={theme} toggleTheme={toggleTheme} />
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Home categories={categories} />} />
                <Route path="/:categoryId" element={<Catalog categories={categories} setCategories={setCategories} />} />
                <Route path="/:categoryId/edit/:productId" element={<Catalog categories={categories} setCategories={setCategories} />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}