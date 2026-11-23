import request from 'supertest';
import { describe, it, expect, afterAll } from 'vitest';
import { app, prisma } from './index';

describe('Zetta REST API — Автотесты', () => {
    const suffix = Date.now();
    const user1Email = `user1_${suffix}@mail.ru`;
    const user2Email = `user2_${suffix}@mail.ru`;
    const password = 'password123';

    let token1 = '';
    let token2 = '';
    let createdProductId = 0;

    afterAll(async () => {
        if (createdProductId) {
            await prisma.product.deleteMany({ where: { id: createdProductId } });
        }
        await prisma.user.deleteMany({
            where: { email: { in: [user1Email, user2Email] } }
        });
        await prisma.$disconnect();
    });

    it('1. Проверка healthcheck-эндпоинта', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('2. Регистрация двух пользователей', async () => {
        const res1 = await request(app)
            .post('/api/register')
            .send({ email: user1Email, password });
        expect(res1.status).toBe(201);

        const res2 = await request(app)
            .post('/api/register')
            .send({ email: user2Email, password });
        expect(res2.status).toBe(201);
    });

    it('3. Вход пользователей и получение JWT-токенов', async () => {
        const res1 = await request(app)
            .post('/api/login')
            .send({ email: user1Email, password });
        expect(res1.status).toBe(200);
        expect(res1.body.token).toBeDefined();
        token1 = res1.body.token;

        const res2 = await request(app)
            .post('/api/login')
            .send({ email: user2Email, password });
        expect(res2.status).toBe(200);
        expect(res2.body.token).toBeDefined();
        token2 = res2.body.token;
    });

    it('4. Защита от несанкционированного добавления без токена (401)', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({ title: 'Тест', price: 1000, img: '/images/kitchen.avif', category: 'Кухни' });
        expect(res.status).toBe(401);
    });

    it('5. Серверная валидация некорректных данных (400)', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token1}`)
            .send({ title: '', price: -50, img: '', category: 'Кухни' });
        expect(res.status).toBe(400);
    });

    it('6. Добавление нового товара авторизованным пользователем (POST)', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                title: 'Тестовая кухня',
                price: 99000,
                img: '/images/kitchen.avif',
                category: 'Кухни'
            });
        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        createdProductId = res.body.id;
    });

    it('7. Получение списка товаров (GET)', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((p: { id: number }) => p.id === createdProductId)).toBe(true);
    });

    it('8. Запрет редактирования чужого товара другим пользователем (403)', async () => {
        const res = await request(app)
            .put(`/api/products/${createdProductId}`)
            .set('Authorization', `Bearer ${token2}`)
            .send({
                title: 'Взлом',
                price: 1,
                img: '/images/kitchen.avif',
                category: 'Кухни'
            });
        expect(res.status).toBe(403);
    });

    it('9. Редактирование своего товара владельцем (PUT)', async () => {
        const res = await request(app)
            .put(`/api/products/${createdProductId}`)
            .set('Authorization', `Bearer ${token1}`)
            .send({
                title: 'Обновленная кухня',
                price: 105000,
                img: '/images/kitchen.avif',
                category: 'Кухни'
            });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Обновленная кухня');
    });

    it('10. Запрет удаления чужого товара другим пользователем (403)', async () => {
        const res = await request(app)
            .delete(`/api/products/${createdProductId}`)
            .set('Authorization', `Bearer ${token2}`);
        expect(res.status).toBe(403);
    });

    it('11. Удаление товара владельцем (DELETE)', async () => {
        const res = await request(app)
            .delete(`/api/products/${createdProductId}`)
            .set('Authorization', `Bearer ${token1}`);
        expect(res.status).toBe(200);
    });
});