const fs = require('fs');
const path = require('path');
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

test('messages pages load the Socket.IO client from a deployment-safe CDN URL and guard against missing client scripts', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '../public/messages.html'),
    'utf8',
  );
  const clientScript = fs.readFileSync(
    path.join(__dirname, '../public/js/pages/messages.js'),
    'utf8',
  );

  expect(html).toContain('https://cdn.socket.io/4.8.3/socket.io.min.js');
  expect(clientScript).toContain('if (!window.io)');
});

afterAll(async () => {
  await pool.end();
});
