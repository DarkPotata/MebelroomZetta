import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface Product {
    id: number;
    title: string;
    price: number;
    img: string;
    category: string;
    userId: number;
}

export default function Catalog() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Поиск с задержкой (Debounce)
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Сортировка
    const [sortBy, setSortBy] = useState<'title' | 'price'>('title');

    // Состояния формы (Добавление / Редактирование)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ title: '', price: '', img: '', category: 'Кухни' });
    
    const { token, isAuthenticated } = useContext(AuthContext);
    const { pathname } = useLocation();

    // Debounce 500ms
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Ошибка загрузки', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId 
            ? `http://localhost:5000/api/products/${editingId}`
            : 'http://localhost:5000/api/products';
        const method = editingId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...form, price: Number(form.price) })
        });
        
        if (res.ok) {
            fetchProducts();
            handleCancel();
        } else {
            alert('Ошибка доступа или неверные данные');
        }
    };

    const handleEditClick = (p: Product) => {
        setEditingId(p.id);
        setForm({ title: p.title, price: String(p.price), img: p.img, category: p.category });
        window.scrollTo(0, 0);
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm({ title: '', price: '', img: '', category: 'Кухни' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Уверены, что хотите удалить?')) return;
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchProducts();
        else alert('Нет прав на удаление этого объекта');
    };

    // Определение категории по URL
    const getCategoryFromPath = () => {
        if (pathname.includes('kitchens')) return 'Кухни';
        if (pathname.includes('wardrobes')) return 'Шкафы';
        if (pathname.includes('dressing')) return 'Гардеробные';
        return null;
    };

    const currentCategory = getCategoryFromPath();

    // Фильтрация и сортировка
    const filteredProducts = products.filter(p => {
        const matchesCategory = currentCategory ? p.category === currentCategory : true;
        const query = debouncedSearch.toLowerCase();
        // Поиск минимум по двум текстовым полям (название и категория) без учета регистра
        const matchesSearch = p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        return a.title.localeCompare(b.title);
    });

    return (
        <main style={{ padding: '30px' }}>
            <h2 className="section-title">Каталог товаров</h2>

            {/* Форма добавления / редактирования */}
            {isAuthenticated && (
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'var(--secondary-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3>{editingId ? 'Редактировать товар' : 'Добавить новый товар'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
                        <input placeholder="Название" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                        <input type="number" placeholder="Цена" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                        <input placeholder="URL картинки" value={form.img} onChange={e => setForm({...form, img: e.target.value})} required />
                        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ padding: '10px', borderRadius: '5px' }}>
                            <option value="Кухни">Кухни</option>
                            <option value="Шкафы">Шкафы</option>
                            <option value="Гардеробные">Гардеробные</option>
                        </select>
                        <button type="submit" className="btn-primary">Сохранить</button>
                        {editingId && <button type="button" onClick={handleCancel} className="btn-secondary-sm">Отменить</button>}
                    </form>
                </div>
            )}

            {/* Панель поиска и сортировки */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="Поиск (по названию или категории)..." 
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px' }}
                />
                <select value={sortBy} onChange={e => setSortBy(e.target.value as 'title' | 'price')} style={{ padding: '10px', borderRadius: '5px' }}>
                    <option value="title">Сортировка: По алфавиту</option>
                    <option value="price">Сортировка: По цене</option>
                </select>
            </div>

            {/* Состояния загрузки и отсутствия данных */}
            {loading ? (
                <p>Загрузка данных...</p>
            ) : filteredProducts.length === 0 ? (
                <p style={{ fontWeight: 'bold', color: 'red' }}>Ничего не найдено</p>
            ) : (
                <div className="catalog-grid">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="product-card">
                            <img src={p.img} alt={p.title} className="product-img" />
                            <h3>{p.title}</h3>
                            <p style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{p.price} ₽</p>
                            <p style={{ color: 'gray', fontSize: '0.9em' }}>{p.category}</p>
                            
                            {isAuthenticated && (
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                                    <button onClick={() => handleEditClick(p)} className="btn-secondary-sm">Редактировать</button>
                                    <button onClick={() => handleDelete(p.id)} className="btn-secondary-sm" style={{ color: '#dc3545', borderColor: '#dc3545' }}>Удалить</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}