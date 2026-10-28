import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;
const SECRET_KEY = 'zetta_super_secret';

app.use(cors());
app.use(express.json());

// --- АВТОМАТИЧЕСКОЕ ЗАПОЛНЕНИЕ БД (ТЕСТОВЫЕ КАРТОЧКИ) ---
async function seedDatabase() {
    const adminEmail = 'admin@mail.ru';
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        admin = await prisma.user.create({
            data: { email: adminEmail, password: hashedPassword, role: 'ADMIN' }
        });
    }

    const count = await prisma.product.count();
    if (count === 0) {
        await prisma.product.createMany({
            data: [
                // Кухни (3 шт)
                { title: 'Кухня Сканди', price: 120000, img: '/images/kitchen.avif', category: 'Кухни', userId: admin.id },
                { title: 'Кухня Лофт', price: 145000, img: '/images/kitchen.avif', category: 'Кухни', userId: admin.id },
                { title: 'Кухня Модерн', price: 199000, img: '/images/kitchen.avif', category: 'Кухни', userId: admin.id },
                
                // Шкафы (3 шт)
                { title: 'Шкаф-купе Базовый', price: 45000, img: '/images/wardrobe.avif', category: 'Шкафы', userId: admin.id },
                { title: 'Шкаф распашной Классика', price: 55000, img: '/images/wardrobe.avif', category: 'Шкафы', userId: admin.id },
                { title: 'Шкаф угловой Практик', price: 62000, img: '/images/wardrobe.avif', category: 'Шкафы', userId: admin.id },

                // Гардеробные (3 шт)
                { title: 'Гардеробная Альфа', price: 89000, img: '/images/dressing.avif', category: 'Гардеробные', userId: admin.id },
                { title: 'Гардеробная Омега', price: 115000, img: '/images/dressing.avif', category: 'Гардеробные', userId: admin.id },
                { title: 'Гардеробная Премиум', price: 210000, img: '/images/dressing.avif', category: 'Гардеробные', userId: admin.id },
            ]
        });
        console.log('9 тестовых карточек с локальными фото успешно загружены в БД!');
    }
}
seedDatabase();

// --- АВТОРИЗАЦИЯ ---
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Первый пользователь будет админом, остальные USER (для тестов)
        const isFirst = (await prisma.user.count()) === 0;
        await prisma.user.create({
            data: { email, password: hashedPassword, role: isFirst ? 'ADMIN' : 'USER' }
        });
        res.status(201).json({ message: 'Зарегистрирован' });
    } catch (error) {
        res.status(400).json({ error: 'Ошибка регистрации' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Неверные данные' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, role: user.role, userId: user.id });
});

const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Нет токена' });
    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: 'Неверный токен' });
        req.user = user;
        next();
    });
};

// --- CRUD ТОВАРОВ ---
app.get('/api/products', async (req, res) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

app.post('/api/products', authenticateToken, async (req: any, res) => {
    const { title, price, img, category } = req.body;
    if (!title || !price || !img || !category) return res.status(400).json({ error: 'Все поля обязательны' });
    
    const newProduct = await prisma.product.create({
        data: { title, price: Number(price), img, category, userId: req.user.userId }
    });
    res.status(201).json(newProduct);
});

// Редактирование (PUT)
app.put('/api/products/:id', authenticateToken, async (req: any, res) => {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Не найден' });

    // Проверка прав: изменять может создатель ИЛИ администратор
    if (product.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Нет прав на редактирование' });
    }

    const { title, price, img, category } = req.body;
    const updated = await prisma.product.update({
        where: { id: productId },
        data: { title, price: Number(price), img, category }
    });
    res.json(updated);
});

app.delete('/api/products/:id', authenticateToken, async (req: any, res) => {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Не найден' });

    if (product.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Нет прав на удаление' });
    }

    await prisma.product.delete({ where: { id: productId } });
    res.json({ message: 'Удалено' });
});

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));