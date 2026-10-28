import { Link } from 'react-router-dom';
import type { Category } from '../types';

interface HeaderProps {
    categories: Category[];
    theme: string;
    toggleTheme: () => void;
}

export default function Header({ categories, theme, toggleTheme }: HeaderProps) {
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
            </nav>
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
                <span>{theme === 'dark' ? '☀️' : '☾'}</span>
            </button>
        </header>
    );
}