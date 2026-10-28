import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { Category } from '../types';

interface HeaderProps {
    categories: Category[];
    theme: string;
    toggleTheme: () => void;
}

export default function Header({ categories, theme, toggleTheme }: HeaderProps) {
    const { isAuthenticated, logout } = useContext(AuthContext);

    return (
        <header className="header">
            <div className="logo">
                <Link to="/"><img src="/images/logo.png" alt="ZETTA мебельрум" /></Link>
            </div>
            <nav className="nav">
                <Link to="/">Главная</Link>
                {categories.map(cat => (
                    <Link key={cat.id} to={`/${cat.id}`}>{cat.title}</Link>
                ))}
                
                {/* Кнопка входа или выхода в зависимости от контекста */}
                {isAuthenticated ? (
                    <button type="button" onClick={logout} className="btn-secondary-sm" style={{ marginLeft: '15px' }}>Выйти</button>
                ) : (
                    <Link to="/auth" style={{ marginLeft: '15px', color: '#B58B5D', fontWeight: 'bold' }}>Войти</Link>
                )}
            </nav>
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
                <span>{theme === 'dark' ? '☀️' : '☾'}</span>
            </button>
        </header>
    );
}