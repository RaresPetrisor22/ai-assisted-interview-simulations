import request from 'supertest';
import app from '../app.js';
import { carId, USERS, useTestDatabase } from './helpers/db.js';

useTestDatabase();

describe('Wishlist API', () => {
  test('POST /api/wishlist adds an available car to the wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('x-user-id', USERS.carlos)
      .send({ carId: carId(1), note: 'Check the tyres' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Car added to wishlist');
    expect(res.body.item).toMatchObject({
      carId: carId(1),
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      price: 18500,
      status: 'available',
      note: 'Check the tyres',
    });
    expect(typeof res.body.item.addedAt).toBe('string');

    const list = await request(app).get('/api/wishlist').set('x-user-id', USERS.carlos);

    expect(list.status).toBe(200);
    expect(list.body.count).toBe(1);
    expect(list.body.items.map((item) => item.carId)).toEqual([carId(1)]);
  });

  test('DELETE /api/wishlist/:carId removes the car from the wishlist', async () => {
    const res = await request(app)
      .delete(`/api/wishlist/${carId(5)}`)
      .set('x-user-id', USERS.alice);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Car removed from wishlist', carId: carId(5) });

    const list = await request(app).get('/api/wishlist').set('x-user-id', USERS.alice);

    expect(list.status).toBe(200);
    expect(list.body.count).toBe(2);
    expect(list.body.items.map((item) => item.carId)).not.toContain(carId(5));
  });
});
