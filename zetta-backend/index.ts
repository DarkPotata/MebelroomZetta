import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const SECRET: string = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// --- ТИПИЗАЦИЯ ДЛЯ АВТОРИЗАЦИИ ---
export interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

// --- MIDDLEWARE: ПРОВЕРКА ТОКЕНА ---
const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'Нет доступа. Токен не предоставлен.' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET) as any;
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        res.status(403).json({ error: 'Неверный или просроченный токен.' });
    }
};

// ==========================================
// 1. АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ==========================================

app.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email и пароль обязательны' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        res.status(201).json({ message: 'Успешно', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ error: 'Неверный email или пароль' });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==========================================
// 2. ОПЕРАЦИИ ДЛЯ ТОВАРОВ (PRODUCTS)
// ==========================================

app.get('/products', async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            include: { user: { select: { email: true } } }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/products', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, price, category, isAvailable, imageUrl } = req.body;
        const userId = req.user!.id;

        if (!title || price === undefined || !category) {
            res.status(400).json({ error: 'Заполните обязательные поля' });
            return;
        }

        const product = await prisma.product.create({
            data: { title, price: Number(price), category, isAvailable: isAvailable ?? true, imageUrl, userId }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.patch('/products/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const productId = Number(req.params.id);
        const { title, price, category, isAvailable, imageUrl } = req.body;
        
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) { res.status(404).json({ error: 'Товар не найден' }); return; }

        if (product.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
            res.status(403).json({ error: 'Нет прав на редактирование' }); return;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { title, price, category, isAvailable, imageUrl }
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/products/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const productId = Number(req.params.id);
        const product = await prisma.product.findUnique({ where: { id: productId } });
        
        if (!product) { res.status(404).json({ error: 'Товар не найден' }); return; }
        if (product.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
            res.status(403).json({ error: 'Нет прав на удаление' }); return;
        }

        await prisma.product.delete({ where: { id: productId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});