import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const url = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/register';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Произошла ошибка на сервере');
            }

            if (isLogin) {
                login(data.token); // Сохраняем токен в контекст и localStorage
                navigate('/'); // Перебрасываем на главную страницу
            } else {
                setIsLogin(true);
                alert('Регистрация успешна! Теперь выполните вход.');
                setPassword('');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <main style={{ padding: '50px', textAlign: 'center', minHeight: '60vh' }}>
            <h2 className="section-title">{isLogin ? 'Вход в систему' : 'Регистрация'}</h2>
            
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: 'inline-flex', flexDirection: 'column', gap: '15px', width: '320px', marginTop: '20px' }}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    style={{ padding: '10px' }}
                />
                <input 
                    type="password" 
                    placeholder="Пароль" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    style={{ padding: '10px' }}
                />
                <button type="submit" className="btn-primary">
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                </button>
            </form>
            
            <p style={{ marginTop: '20px', cursor: 'pointer', color: 'gray', textDecoration: 'underline' }} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войти'}
            </p>
        </main>
    );
}