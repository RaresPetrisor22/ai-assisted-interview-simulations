
> car-marketplace-backend@1.0.0 reveal
> node scripts/reveal.mjs

# Solution: Car Marketplace(MERN): Wishlist

Six bugs across four files (`controllers/wishlistController.js`, `models/User.js`, `models/Car.js`, `utils/wishlist.js`).
Test cases: 1 = visible add, 2 = visible remove, 3 = hidden duplicate (409), 4 = hidden sort order, 5 = hidden wishlist limit, 6 = hidden availability.

## Bugs

| # | File:line | Bug | Fix | Tests affected |
|---|-----------|-----|-----|----------------|
| 1 | `backend/controllers/wishlistController.js:43` | New wishlist entry is pushed as `{ carId: ... }`, but the wishlist sub-schema in `models/User.js` names the field `car` (required). Mongoose strict mode silently drops `carId`, so `user.save()` throws a `ValidationError` ("Path `car` is required."), which the global error handler turns into a 400. **This is the "users cannot add cars" symptom; you only understand it after reading the schema in `models/User.js`.** | `user.wishlist.push({ car: car._id, note, addedAt: new Date() })` | 1 (also masks 3, 5, 6) |
| 2 | `backend/controllers/wishlistController.js:61` | `User.updateOne(...)` is not awaited. Mongoose queries are lazy thenables: without `await`/`.then()`/`.exec()` the query is **never sent to MongoDB**. The handler still replies 200, so the API "reports success but the car stays". | `await User.updateOne(...)` | 2 |
| 3 | `backend/models/User.js:32` | `hasInWishlist` compares `item.car.toString() === carId`. That works when the caller passes a string (the remove handler passes `req.params.carId`), but the add handler passes `car._id`, an ObjectId, so string `===` ObjectId is always false and duplicates are never detected. Cross-file: the method looks correct until you see how `addToWishlist` calls it. | `item.car.equals(carId)` (accepts strings and ObjectIds), or `String(item.car) === String(carId)` | 3 |
| 4 | `backend/utils/wishlist.js:22` | `formatWishlist` sorts ascending (`a.addedAt - b.addedAt`). README requires most recently added first. | `.sort((a, b) => b.addedAt - a.addedAt)` | 4 |
| 5 | `backend/models/User.js:36` | Off by one: `isWishlistFull` uses `>` so an 11th car is accepted. | `this.wishlist.length >= WISHLIST_LIMIT` | 5 |
| 6 | `backend/models/Car.js:32` | `isAvailable()` returns `status !== 'sold'`, so `pending` cars can be added. README: only `available` cars can be added. | `return this.status === 'available';` | 6 |

### Independence of the two reported symptoms
- Add failure = bug 1 (schema field name). Remove failure = bug 2 (un-awaited query). Fixing one has no effect on the other.
- Bug 3 is deliberately *not* triggered by the remove path (string argument), which is why remove "finds" the car fine.

### Red herrings (correct code)
- `getWishlist` re-fetches the user with `User.findWithWishlist()` even though `req.user` exists: needed for `.populate('wishlist.car')`.
- `$pull: { wishlist: { car: carId } }` with a string id is fine: Mongoose casts update filters through the schema.
- `router.get('/mine', ...)` is declared before `/:id` on purpose.
- `Car.findAll(filters, ...)` receives a pre-parsed filter object; `buildFilter` ignores missing keys.
- `validateObjectId('body', 'carId', ...)` in `wishlistRoutes.js` is a middleware factory (source, field, message).
- The global error handler mapping `ValidationError` to 400 is correct; it is why bug 1 shows as a 400 instead of a 500.

## Code-quality improvements a grader would reward
- Move the `note` validation out of the controller into a small validation middleware (like `validateObjectId`) so the controller only contains business logic.
- Use `user.wishlist.pull({ car: carId })` + `await user.save()` **or** `$pull`, consistently with how add persists (add uses `save()`, remove uses `updateOne`): pick one persistence style for the wishlist.
- Make `hasInWishlist` robust to both strings and ObjectIds (`equals`), rather than changing the caller to `.toString()`: fixes the root cause for every caller.
- Optionally add a unique-car guard at the DB level (e.g. `$addToSet`-style atomic update with a `wishlist.car: { $ne: carId }` filter) to avoid race conditions on concurrent adds.
- Keep error messages and limits in `config/constants.js` (already done for the limit) rather than hard-coding strings.
- Add tests for the remaining README error cases (invalid id 400, unknown car 404, note too long 400, 401s).

## Full diff (buggy -> correct)

```diff
diff --git a/backend/controllers/wishlistController.js b/backend/controllers/wishlistController.js
index b12141c..6410713 100644
--- a/backend/controllers/wishlistController.js
+++ b/backend/controllers/wishlistController.js	
@@ -40,7 +40,7 @@ export async function addToWishlist(req, res) {
       .json({ message: `Wishlist cannot contain more than ${WISHLIST_LIMIT} cars` });
   }
 
-  user.wishlist.push({ carId: car._id, note, addedAt: new Date() });
+  user.wishlist.push({ car: car._id, note, addedAt: new Date() });
   await user.save();
 
   const entry = user.wishlist[user.wishlist.length - 1];
@@ -58,7 +58,7 @@ export async function removeFromWishlist(req, res) {
     return res.status(404).json({ message: 'Car not found in wishlist' });
   }
 
-  User.updateOne({ _id: req.user._id }, { $pull: { wishlist: { car: carId } } });
+  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: { car: carId } } });
 
   res.status(200).json({ message: 'Car removed from wishlist', carId });
 }
diff --git a/backend/models/User.js b/backend/models/User.js
index 058b5e4..743d60d 100644
--- a/backend/models/User.js
+++ b/backend/models/User.js	
@@ -29,11 +29,11 @@ userSchema.statics.findWithWishlist = function (userId) {
 };
 
 userSchema.methods.hasInWishlist = function (carId) {
-  return this.wishlist.some((item) => item.car.toString() === carId);
+  return this.wishlist.some((item) => item.car.equals(carId));
 };
 
 userSchema.methods.isWishlistFull = function () {
-  return this.wishlist.length > WISHLIST_LIMIT;
+  return this.wishlist.length >= WISHLIST_LIMIT;
 };
 
 const User = mongoose.model('User', userSchema);
diff --git a/backend/models/Car.js b/backend/models/Car.js
index ddad9ad..82d04a0 100644
--- a/backend/models/Car.js
+++ b/backend/models/Car.js	
@@ -29,7 +29,7 @@ carSchema.index({ make: 1, model: 1 });
 carSchema.index({ price: 1 });
 
 carSchema.methods.isAvailable = function () {
-  return this.status !== 'sold';
+  return this.status === 'available';
 };
 
 carSchema.statics.buildFilter = function (filters = {}) {
diff --git a/backend/utils/wishlist.js b/backend/utils/wishlist.js
index 491d6a4..b02efcf 100644
--- a/backend/utils/wishlist.js
+++ b/backend/utils/wishlist.js	
@@ -19,5 +19,5 @@ export function formatWishlist(entries) {
   return entries
     .filter((entry) => entry.car)
     .map((entry) => toWishlistItem(entry.car, entry))
-    .sort((a, b) => a.addedAt - b.addedAt);
+    .sort((a, b) => b.addedAt - a.addedAt);
 }
```

## Hidden tests (plain text)

File is written to `backend/test/graded-<random>.test.js` at runtime and deleted afterwards.

```js
import request from 'supertest';
import app from '../app.js';
import { carId, USERS, useTestDatabase } from './helpers/db.js';

useTestDatabase();

describe('Wishlist API (graded)', () => {
  test('adding a car that is already in the wishlist returns 409', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('x-user-id', USERS.alice)
      .send({ carId: carId(2) });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ message: 'Car is already in your wishlist' });

    const list = await request(app).get('/api/wishlist').set('x-user-id', USERS.alice);
    expect(list.body.count).toBe(3);
  });

  test('GET /api/wishlist returns items sorted by most recently added', async () => {
    const res = await request(app).get('/api/wishlist').set('x-user-id', USERS.alice);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.items.map((item) => item.carId)).toEqual([carId(5), carId(9), carId(2)]);
    expect(res.body.items[2]).toEqual({
      carId: carId(2),
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      price: 17200,
      status: 'available',
      note: 'Low mileage, check service history',
      addedAt: '2026-03-01T10:00:00.000Z',
    });
  });

  test('adding a car to a full wishlist returns 400', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('x-user-id', USERS.dana)
      .send({ carId: carId(11) });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Wishlist cannot contain more than 10 cars' });

    const list = await request(app).get('/api/wishlist').set('x-user-id', USERS.dana);
    expect(list.body.count).toBe(10);
  });

  test('only available cars can be added to the wishlist', async () => {
    for (const id of [carId(12), carId(13)]) {
      const res = await request(app)
        .post('/api/wishlist')
        .set('x-user-id', USERS.bob)
        .send({ carId: id });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Car is no longer available' });
    }

    const list = await request(app).get('/api/wishlist').set('x-user-id', USERS.bob);
    expect(list.body.count).toBe(1);
  });
});
```

