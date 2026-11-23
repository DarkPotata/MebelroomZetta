import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const app = express();
export const prisma = new PrismaClient();

const PORT = Number(process.env.PORT) || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'zetta_super_secret';

app.use(cors());
app.use(express.json());

interface AuthRequest extends Request {
    user?: { userId: number; role: string };
}

// --- АВТОМАТИЧЕСКОЕ ЗАПОЛНЕНИЕ БД (ТЕСТОВЫЕ КАРТОЧКИ) ---
export async function seedDatabase() {
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
                { title: 'Кухня Сканди', price: 120000, img: '/images/kitchen.avif', category: 'Кухни', userId: admin.id },
                { title: 'Кухня Лофт', price: 145000, img: '/images/kitchen.avif', category: 'Кухни', userId: admin.id },
                { title: 'Кухня Модерн', price: 199000, img: '/images/kitchen.avif', category: 'Кухни', userId: admin.id },
                { title: 'Шкаф-купе Базовый', price: 45000, img: '/images/wardrobe.avif', category: 'Шкафы', userId: admin.id },
                { title: 'Шкаф распашной Классика', price: 55000, img: '/images/wardrobe.avif', category: 'Шкафы', userId: admin.id },
                { title: 'Шкаф угловой Практик', price: 62000, img: '/images/wardrobe.avif', category: 'Шкафы', userId: admin.id },
                { title: 'Гардеробная Альфа', price: 89000, img: '/images/dressing.avif', category: 'Гардеробные', userId: admin.id },
                { title: 'Гардеробная Омега', price: 115000, img: '/images/dressing.avif', category: 'Гардеробные', userId: admin.id },
                { title: 'Гардеробная Премиум', price: 210000, img: '/images/dressing.avif', category: 'Гардеробные', userId: admin.id },
            ]
        });
        console.log('9 тестовых карточек с локальными фото успешно загружены в БД!');
    }
}

// --- HEALTHCHECK ---
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// --- АВТОРИЗАЦИЯ ---
app.post('/api/register', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password || String(password).length < 4) {
        res.status(400).json({ error: 'Укажите корректный email и пароль (от 4 символов)' });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const isFirst = (await prisma.user.count()) === 0;
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, role: isFirst ? 'ADMIN' : 'USER' }
        });
        res.status(201).json({ message: 'Зарегистрирован', userId: user.id, role: user.role });
    } catch {
        res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
});

app.post('/api/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Введите email и пароль' });
        return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Неверные данные' });
        return;
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, role: user.role, userId: user.id });
});

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Нет токена' });
        return;
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(403).json({ error: 'Неверный токен' });
            return;
        }
        req.user = decoded as { userId: number; role: string };
        next();
    });
};

// --- CRUD ТОВАРОВ ---
app.get('/api/products', async (_req: Request, res: Response) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

app.post('/api/products', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { title, price, img, category } = req.body;
    if (!title || price === undefined || Number(price) <= 0 || !img || !category) {
        res.status(400).json({ error: 'Все поля обязательны, цена должна быть больше 0' });
        return;
    }

    const newProduct = await prisma.product.create({
        data: { title, price: Number(price), img, category, userId: req.user!.userId }
    });
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        res.status(404).json({ error: 'Не найден' });
        return;
    }

    if (product.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Нет прав на редактирование' });
        return;
    }

    const { title, price, img, category } = req.body;
    if (!title || price === undefined || Number(price) <= 0 || !img || !category) {
        res.status(400).json({ error: 'Все поля обязательны, цена должна быть больше 0' });
        return;
    }

    const updated = await prisma.product.update({
        where: { id: productId },
        data: { title, price: Number(price), img, category }
    });
    res.json(updated);
});

app.delete('/api/products/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        res.status(404).json({ error: 'Не найден' });
        return;
    }

    if (product.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Нет прав на удаление' });
        return;
    }

    await prisma.product.delete({ where: { id: productId } });
    res.json({ message: 'Удалено' });
});

if (process.env.NODE_ENV !== 'test') {
    seedDatabase()
        .then(() => {
            app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
        })
        .catch((err) => {
            console.error('Ошибка инициализации БД:', err);
            process.exit(1);
        });
}