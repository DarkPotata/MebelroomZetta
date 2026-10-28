import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { request } from './api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const data = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (isRegister) {
        setIsRegister(false);
        setMessage({ text: 'Регистрация успешна! Теперь войдите.', type: 'success' });
        setPassword('');
      } else {
        localStorage.setItem('token', data.token);
        navigate('/'); // Перенаправляем на главную страницу после входа
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" align="center" gutterBottom>
        {isRegister ? 'Регистрация' : 'Вход в систему'}
      </Typography>
      
      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
      
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        fullWidth
        type="password"
        label="Пароль"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <Button fullWidth type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
        {isRegister ? 'Зарегистрироваться' : 'Войти'}
      </Button>
      <Button fullWidth onClick={() => { setIsRegister(!isRegister); setMessage(null); }}>
        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Создать'}
      </Button>
    </Box>
  );
}