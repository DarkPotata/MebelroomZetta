import { useState, useEffect } from 'react';
import { request } from './api';

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  isAvailable: boolean;
  user?: { email: string };
  imageUrl?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await request('/products');
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const newProduct = await request('/products', {
        method: 'POST',
        body: JSON.stringify({ title, price: Number(price), category }),
      });
      setProducts([...products, newProduct]);
      setTitle(''); setPrice(''); setCategory('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request(`/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="catalog-wrapper">
      <h1 className="page-title">Каталог товаров</h1>
      
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

      {isLoggedIn && (
        <div className="admin-panel">
          <form className="inline-form" onSubmit={handleAddProduct}>
            <input type="text" placeholder="Название *" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input type="number" placeholder="Цена *" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <input type="text" placeholder="Категория *" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <button type="submit" className="btn-primary">Добавить</button>
          </form>
        </div>
      )}
      
      {products.length === 0 ? (
        <p className="empty-msg">Товаров пока нет.</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              {/* Если нет картинки с сервера, ставим заглушку */}
              <div className="product-placeholder">ZETTA</div>
              <h3>{product.title}</h3>
              <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>Категория: {product.category}</p>
              <p className="price">{product.price} ₽</p>
              <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '10px' }}>
                Добавил: {product.user?.email || 'Вы'}
              </p>
              
              {isLoggedIn && (
                <div className="product-card-actions">
                  <button className="btn-danger-sm" onClick={() => handleDelete(product.id)}>
                    Удалить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}