import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Products from './Products';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div id="app">
        <header className="header">
          <div className="logo">
            <h2 style={{ margin: 0, color: 'var(--text-color)' }}>ZETTA</h2>
          </div>
          <nav className="nav">
            <Link to="/">Каталог</Link>
            <Link to="/login">Вход / Регистрация</Link>
          </nav>
        </header>
        
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        <footer className="footer">
          <div className="footer-copyright">
            © 2026 Zetta Furniture. Все права защищены.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;