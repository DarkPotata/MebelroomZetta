import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Category, Product } from '../types';

interface CatalogProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export default function Catalog({ categories, setCategories }: CatalogProps) {
    const { categoryId, productId } = useParams();
    const navigate = useNavigate();
    
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [newCatTitle, setNewCatTitle] = useState('');
    const [newProdTitle, setNewProdTitle] = useState('');
    const [newProdPrice, setNewProdPrice] = useState('');

    const category = categories.find(c => c.id === categoryId);

    if (!category) {
        return <main className="catalog-wrapper"><p className="empty-msg">Категория не найдена.</p></main>;
    }

    const editProduct = productId ? category.products.find(p => p.id === Number(productId)) : null;

    // --- Обработчики добавления и удаления ---
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const newCat: Category = { id: `cat-${Date.now()}`, title: newCatTitle, image: '/images/logo.png', products: [] };
        setCategories([...categories, newCat]);
        setNewCatTitle('');
    };

    const handleDeleteCategory = () => {
        if (window.confirm('Удалить категорию?')) {
            setCategories(categories.filter(c => c.id !== categoryId));
            navigate('/');
        }
    };

    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const newProd: Product = { id: Date.now(), title: newProdTitle, price: Number(newProdPrice), img: '/images/hero.avif' };
        setCategories(categories.map(c => c.id === categoryId ? { ...c, products: [...c.products, newProd] } : c));
        setNewProdTitle('');
        setNewProdPrice('');
    };

    const handleDeleteProduct = (prodId: number) => {
        if (window.confirm('Удалить товар?')) {
            setCategories(categories.map(c => c.id === categoryId ? { ...c, products: c.products.filter(p => p.id !== prodId) } : c));
        }
    };

    // --- Обработчик модального окна ---
    const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        setCategories(categories.map(c => c.id === categoryId ? {
            ...c,
            products: c.products.map(p => p.id === Number(productId) ? {
                ...p,
                title: formData.get('title') as string,
                price: Number(formData.get('price')),
                img: (formData.get('img') as string) || p.img
            } : p)
        } : c));
        navigate(`/${categoryId}`); // Закрываем окно, сбрасывая URL
    };

    const sortedProducts = [...category.products].sort((a, b) => 
        sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );

    return (
        <main className="catalog-wrapper">
            <h1 className="page-title">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Управление каталогом</Link>
            </h1>
            
            {/* Панель администратора */}
            <div className="admin-panel">
                <button className="btn-secondary" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                    Сортировка по цене ({sortOrder === 'asc' ? '↑' : '↓'})
                </button>
                <form className="inline-form" onSubmit={handleAddCategory}>
                    <input type="text" placeholder="Новая категория" value={newCatTitle} onChange={e => setNewCatTitle(e.target.value)} required />
                    <button type="submit" className="btn-primary">+ Категория</button>
                </form>
            </div>
            <hr />

            {/* Блок товаров */}
            <section className="category-block">
                <div className="category-header">
                    <h2><Link to={`/${category.id}`}>{category.title}</Link></h2>
                    <button className="btn-danger" onClick={handleDeleteCategory}>Удалить категорию</button>
                </div>

                <div className="products-grid">
                    {sortedProducts.length > 0 ? sortedProducts.map(p => (
                        <div key={p.id} className="product-card">
                            {productId === String(p.id) ? (
                                <div className="product-placeholder">{p.title}</div>
                            ) : (
                                <img src={p.img} alt={p.title} />
                            )}
                            <h3>{p.title}</h3>
                            <p className="price">{p.price.toLocaleString()} ₽</p>
                            <div className="product-card-actions">
                                <button className="btn-secondary-sm" onClick={() => navigate(`/${categoryId}/edit/${p.id}`)}>✏️ Изменить</button>
                                <button className="btn-danger-sm" onClick={() => handleDeleteProduct(p.id)}>🗑 Удалить</button>
                            </div>
                        </div>
                    )) : <p className="empty-msg">В этой категории пока нет товаров.</p>}
                </div>

                <form className="inline-form addProductForm" style={{ marginTop: '20px' }} onSubmit={handleAddProduct}>
                    <input type="text" placeholder="Название товара" value={newProdTitle} onChange={e => setNewProdTitle(e.target.value)} required />
                    <input type="number" placeholder="Цена" value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} required />
                    <button type="submit" className="btn-primary">+ Добавить товар</button>
                </form>
            </section>

            {/* Модальное окно */}
            {editProduct && (
                <div className="modal" onClick={() => navigate(`/${categoryId}`)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Редактировать товар</h3>
                        <form onSubmit={handleSaveEdit}>
                            <label>Название <input type="text" name="title" defaultValue={editProduct.title} required /></label>
                            <label>Цена (₽) <input type="number" name="price" defaultValue={editProduct.price} required /></label>
                            <label>URL картинки <input type="text" name="img" defaultValue={editProduct.img} /></label>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">Сохранить</button>
                                <button type="button" className="btn-secondary" onClick={() => navigate(`/${categoryId}`)}>Отмена</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}