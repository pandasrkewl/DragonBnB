const { io } = require('../server');
const pool = require('../db');

test('socket.io exposes a deployment-safe CORS configuration', () => {
  expect(io).toBeDefined();
  expect(io.opts.cors).toBeDefined();
  expect(io.opts.cors.credentials).toBe(true);
  expect(typeof io.opts.cors.origin).toBe('function');

  const callback = jest.fn();
  io.opts.cors.origin('https://dragon-1oxnph89i-drexel-bnb.vercel.app', callback);
  expect(callback).toHaveBeenCalledWith(null, true);

  const blockedCallback = jest.fn();
  io.opts.cors.origin('https://evil.example', blockedCallback);
  expect(blockedCallback.mock.calls[0][0]).toBeInstanceOf(Error);
});

afterAll(async () => {
  await pool.end();
});
