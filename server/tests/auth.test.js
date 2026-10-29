const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authorizeRoles } = require('../middleware/auth');

test('Auth: password hashing and verification with bcrypt', async () => {
  const plainPassword = 'GuestSecurePass123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notStrictEqual(hash, plainPassword);
  assert.strictEqual(await bcrypt.compare(plainPassword, hash), true);
  assert.strictEqual(await bcrypt.compare('WrongPassword', hash), false);
});

test('Auth: JWT signing and verification', () => {
  const secret = 'test_secret_key_123';
  const payload = { id: 'user_123', email: 'guest@staysphere.com', role: 'guest' };

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);

  assert.strictEqual(decoded.id, 'user_123');
  assert.strictEqual(decoded.role, 'guest');
});

test('Auth: authorizeRoles allows permitted role', () => {
  const middleware = authorizeRoles('admin', 'manager');
  const req = { user: { role: 'admin' } };
  let nextCalled = false;
  const res = {
    status: () => res,
    json: () => res
  };

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
});

test('Auth: authorizeRoles blocks unauthorized role with 403', () => {
  const middleware = authorizeRoles('admin');
  const req = { user: { role: 'guest' } };
  let statusCode = 0;
  let responseData = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    }
  };

  middleware(req, res, () => {});

  assert.strictEqual(statusCode, 403);
  assert.strictEqual(responseData.success, false);
  assert.ok(responseData.message.includes('Access denied'));
});
